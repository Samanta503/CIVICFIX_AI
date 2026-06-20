<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Citizen\StoreComplaintRequest;
use App\Models\Complaint;
use App\Models\ComplaintCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CitizenComplaintController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $complaints = Complaint::query()
            ->where('citizen_id', $request->user()->id)
            ->with([
                'category:id,name,slug,default_priority,default_sla_hours',
                'department:id,name,slug',
                'zone:id,name,city,ward_number',
                'media:id,complaint_id,file_url,original_name,media_type',
            ])
            ->latest()
            ->get()
            ->map(fn (Complaint $complaint) => $this->formatComplaint($complaint));

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

        $complaint->load([
            'category:id,name,slug,default_priority,default_sla_hours',
            'department:id,name,slug',
            'zone:id,name,city,ward_number',
            'media:id,complaint_id,file_url,original_name,media_type',
            'statusHistories:id,complaint_id,old_status,new_status,note,created_at',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Complaint submitted successfully.',
            'data' => [
                'complaint' => $this->formatComplaint($complaint),
            ],
        ], 201);
    }

    public function show(Request $request, string $complaintNo): JsonResponse
    {
        $complaint = Complaint::query()
            ->where('citizen_id', $request->user()->id)
            ->where('complaint_no', $complaintNo)
            ->with([
                'category:id,name,slug,default_priority,default_sla_hours',
                'department:id,name,slug',
                'zone:id,name,city,ward_number',
                'media:id,complaint_id,file_url,original_name,media_type',
                'statusHistories:id,complaint_id,old_status,new_status,note,created_at',
            ])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'Complaint details loaded successfully.',
            'data' => [
                'complaint' => $this->formatComplaint($complaint),
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

    private function formatComplaint(Complaint $complaint): array
    {
        return [
            'id' => $complaint->id,
            'complaint_no' => $complaint->complaint_no,
            'title' => $complaint->title,
            'description' => $complaint->description,
            'address' => $complaint->address,
            'latitude' => $complaint->latitude,
            'longitude' => $complaint->longitude,
            'priority' => $complaint->priority,
            'status' => $complaint->status,
            'source' => $complaint->source,
            'submitted_at' => $complaint->submitted_at?->toISOString(),
            'sla_due_at' => $complaint->sla_due_at?->toISOString(),
            'resolved_at' => $complaint->resolved_at?->toISOString(),

            'category' => $complaint->category ? [
                'id' => $complaint->category->id,
                'name' => $complaint->category->name,
                'slug' => $complaint->category->slug,
                'default_priority' => $complaint->category->default_priority,
                'default_sla_hours' => $complaint->category->default_sla_hours,
            ] : null,

            'department' => $complaint->department ? [
                'id' => $complaint->department->id,
                'name' => $complaint->department->name,
                'slug' => $complaint->department->slug,
            ] : null,

            'zone' => $complaint->zone ? [
                'id' => $complaint->zone->id,
                'name' => $complaint->zone->name,
                'city' => $complaint->zone->city,
                'ward_number' => $complaint->zone->ward_number,
            ] : null,

            'media' => $complaint->media?->map(fn ($media) => [
                'id' => $media->id,
                'media_type' => $media->media_type,
                'file_url' => $media->file_url,
                'original_name' => $media->original_name,
            ])->values() ?? [],

            'status_histories' => $complaint->statusHistories?->map(fn ($history) => [
                'id' => $history->id,
                'old_status' => $history->old_status,
                'new_status' => $history->new_status,
                'note' => $history->note,
                'created_at' => $history->created_at?->toISOString(),
            ])->values() ?? [],
        ];
    }
}