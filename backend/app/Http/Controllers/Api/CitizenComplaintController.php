<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Citizen\StoreComplaintRequest;
use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Services\ComplaintFormatterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CitizenComplaintController extends Controller
{
    public function __construct(
        private ComplaintFormatterService $formatter
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $complaints = Complaint::query()
            ->where('citizen_id', $request->user()->id)
            ->with($this->formatter->relations())
            ->latest()
            ->get()
            ->map(fn (Complaint $complaint) => $this->formatter->format($complaint));

        return response()->json([
            'success' => true,
            'message' => 'Citizen complaints loaded successfully.',
            'data' => [
                'complaints' => $complaints,
            ],
        ]);
    }

    public function store(StoreComplaintRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $category = ComplaintCategory::query()
            ->with('department:id,name,slug')
            ->findOrFail($validated['category_id']);

        $complaint = DB::transaction(function () use ($request, $validated, $category) {
            $complaint = Complaint::create([
                'complaint_no' => $this->generateComplaintNo(),
                'citizen_id' => $request->user()->id,
                'category_id' => $category->id,
                'department_id' => $category->department_id,
                'zone_id' => $validated['zone_id'] ?? $request->user()->zone_id,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'address' => $validated['address'],
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'priority' => $category->default_priority,
                'status' => 'submitted',
                'source' => 'web',
                'submitted_at' => now(),
                'sla_due_at' => now()->addHours((int) $category->default_sla_hours),
            ]);

            $complaint->statusHistories()->create([
                'changed_by' => $request->user()->id,
                'old_status' => null,
                'new_status' => 'submitted',
                'note' => 'Complaint submitted by citizen.',
            ]);

            foreach ($request->file('media', []) as $file) {
                $path = $file->store("complaints/{$complaint->id}", 'public');
                $url = Storage::disk('public')->url($path);

                $complaint->media()->create([
                    'uploaded_by' => $request->user()->id,
                    'media_type' => 'image',
                    'file_disk' => 'public',
                    'file_path' => $path,
                    'file_url' => $url,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType(),
                    'size_bytes' => $file->getSize(),
                ]);
            }

            return $complaint;
        });

        $complaint->load($this->formatter->relations());

        return response()->json([
            'success' => true,
            'message' => 'Complaint submitted successfully.',
            'data' => [
                'complaint' => $this->formatter->format($complaint),
            ],
        ], 201);
    }

    public function show(Request $request, string $complaintNo): JsonResponse
    {
        $complaint = Complaint::query()
            ->where('citizen_id', $request->user()->id)
            ->where('complaint_no', $complaintNo)
            ->with($this->formatter->relations())
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'Complaint details loaded successfully.',
            'data' => [
                'complaint' => $this->formatter->format($complaint),
            ],
        ]);
    }

    private function generateComplaintNo(): string
    {
        do {
            $complaintNo = 'CFX-' . now()->format('Ymd') . '-' . Str::upper(Str::random(6));
        } while (Complaint::where('complaint_no', $complaintNo)->exists());

        return $complaintNo;
    }
}