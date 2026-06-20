<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PublicComplaintController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $complaints = Complaint::query()
            ->with($this->relations())
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');

                $query->where(function ($subQuery) use ($search) {
                    $subQuery
                        ->where('complaint_no', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->string('status'));
            })
            ->when($request->filled('priority'), function ($query) use ($request) {
                $query->where('priority', $request->string('priority'));
            })
            ->when($request->filled('category_id'), function ($query) use ($request) {
                $query->where('category_id', $request->integer('category_id'));
            })
            ->when($request->filled('department_id'), function ($query) use ($request) {
                $query->where('department_id', $request->integer('department_id'));
            })
            ->when($request->filled('zone_id'), function ($query) use ($request) {
                $query->where('zone_id', $request->integer('zone_id'));
            })
            ->latest()
            ->get()
            ->map(fn (Complaint $complaint) => $this->formatPublicComplaint($complaint));

        return response()->json([
            'success' => true,
            'message' => 'Public complaints loaded successfully.',
            'data' => [
                'complaints' => $complaints,
            ],
        ]);
    }

    public function show(string $complaintNo): JsonResponse
    {
        $complaint = Complaint::query()
            ->where('complaint_no', $complaintNo)
            ->with($this->relations())
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'Public complaint details loaded successfully.',
            'data' => [
                'complaint' => $this->formatPublicComplaint($complaint, true),
            ],
        ]);
    }

    public function map(Request $request): JsonResponse
    {
        $complaints = Complaint::query()
            ->with([
                'category:id,name,slug',
                'department:id,name,slug',
                'zone:id,name,city,ward_number',
            ])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->string('status'));
            })
            ->latest()
            ->get()
            ->map(fn (Complaint $complaint) => [
                'id' => $complaint->id,
                'complaint_no' => $complaint->complaint_no,
                'title' => $complaint->title,
                'status' => $complaint->status,
                'priority' => $complaint->priority,
                'latitude' => $complaint->latitude,
                'longitude' => $complaint->longitude,
                'address' => $complaint->address,
                'category' => $complaint->category ? [
                    'id' => $complaint->category->id,
                    'name' => $complaint->category->name,
                    'slug' => $complaint->category->slug,
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
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Public complaint map data loaded successfully.',
            'data' => [
                'complaints' => $complaints,
            ],
        ]);
    }

    public function stats(): JsonResponse
    {
        $total = Complaint::count();
        $submitted = Complaint::where('status', 'submitted')->count();
        $assigned = Complaint::where('status', 'assigned')->count();
        $inProgress = Complaint::where('status', 'in_progress')->count();
        $resolved = Complaint::where('status', 'resolved')->count();

        $byDepartment = Complaint::query()
            ->selectRaw('department_id, COUNT(*) as total')
            ->with('department:id,name,slug')
            ->groupBy('department_id')
            ->get()
            ->map(fn (Complaint $complaint) => [
                'department_id' => $complaint->department_id,
                'department_name' => $complaint->department?->name ?? 'Unknown',
                'total' => (int) $complaint->total,
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Public complaint statistics loaded successfully.',
            'data' => [
                'total' => $total,
                'submitted' => $submitted,
                'assigned' => $assigned,
                'in_progress' => $inProgress,
                'resolved' => $resolved,
                'by_department' => $byDepartment,
            ],
        ]);
    }

    private function relations(): array
    {
        return [
            'citizen:id,name',
            'category:id,name,slug,default_priority,default_sla_hours',
            'department:id,name,slug',
            'zone:id,name,city,ward_number',
            'assignedOfficer:id,name',
            'media:id,complaint_id,file_url,original_name,media_type,mime_type,size_bytes,created_at',
            'statusHistories:id,complaint_id,old_status,new_status,note,created_at',
        ];
    }

    private function formatPublicComplaint(Complaint $complaint, bool $includeTimeline = false): array
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
            'assigned_at' => $complaint->assigned_at?->toISOString(),

            'citizen' => $complaint->citizen ? [
                'id' => $complaint->citizen->id,
                'name' => $this->maskCitizenName($complaint->citizen->name),
            ] : null,

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

            'assigned_officer' => $complaint->assignedOfficer ? [
                'id' => $complaint->assignedOfficer->id,
                'name' => $complaint->assignedOfficer->name,
            ] : null,

            'media' => $complaint->media?->map(fn ($media) => [
                'id' => $media->id,
                'media_type' => $media->media_type,
                'file_url' => $this->fullMediaUrl($media->file_url),
                'original_name' => $media->original_name,
                'mime_type' => $media->mime_type,
                'size_bytes' => $media->size_bytes,
                'created_at' => $media->created_at?->toISOString(),
            ])->values() ?? [],

            'status_histories' => $includeTimeline
                ? ($complaint->statusHistories?->map(fn ($history) => [
                    'id' => $history->id,
                    'old_status' => $history->old_status,
                    'new_status' => $history->new_status,
                    'note' => $history->note,
                    'created_at' => $history->created_at?->toISOString(),
                ])->values() ?? [])
                : [],
        ];
    }

    private function maskCitizenName(?string $name): string
    {
        if (!$name) {
            return 'Anonymous Citizen';
        }

        $parts = explode(' ', trim($name));

        if (count($parts) === 1) {
            return Str::substr($name, 0, 1) . '***';
        }

        return $parts[0] . ' ' . Str::substr(end($parts), 0, 1) . '.';
    }

    private function fullMediaUrl(?string $fileUrl): ?string
    {
        if (!$fileUrl) {
            return null;
        }

        if (Str::startsWith($fileUrl, ['http://', 'https://'])) {
            return $fileUrl;
        }

        return url($fileUrl);
    }
}