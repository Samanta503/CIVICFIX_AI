<?php

namespace App\Services;

use App\Models\Complaint;
use Illuminate\Support\Str;

class ComplaintFormatterService
{
    public function relations(): array
    {
        return [
            'citizen:id,name,email,phone',
            'category:id,name,slug,default_priority,default_sla_hours',
            'department:id,name,slug',
            'zone:id,name,city,ward_number',
            'assignedOfficer:id,name,email,phone,department_id,zone_id',
            'assignedOfficer.department:id,name,slug',
            'assignedOfficer.zone:id,name,city,ward_number',
            'assignedBy:id,name,email',
            'media:id,complaint_id,file_url,original_name,media_type,mime_type,size_bytes,created_at',
            'statusHistories:id,complaint_id,changed_by,old_status,new_status,note,created_at',
            'statusHistories.changedBy:id,name,email',
        ];
    }

    public function format(Complaint $complaint): array
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
                'name' => $complaint->citizen->name,
                'email' => $complaint->citizen->email,
                'phone' => $complaint->citizen->phone,
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
                'email' => $complaint->assignedOfficer->email,
                'phone' => $complaint->assignedOfficer->phone,
                'department' => $complaint->assignedOfficer->department ? [
                    'id' => $complaint->assignedOfficer->department->id,
                    'name' => $complaint->assignedOfficer->department->name,
                    'slug' => $complaint->assignedOfficer->department->slug,
                ] : null,
                'zone' => $complaint->assignedOfficer->zone ? [
                    'id' => $complaint->assignedOfficer->zone->id,
                    'name' => $complaint->assignedOfficer->zone->name,
                    'city' => $complaint->assignedOfficer->zone->city,
                    'ward_number' => $complaint->assignedOfficer->zone->ward_number,
                ] : null,
            ] : null,

            'assigned_by' => $complaint->assignedBy ? [
                'id' => $complaint->assignedBy->id,
                'name' => $complaint->assignedBy->name,
                'email' => $complaint->assignedBy->email,
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

            'status_histories' => $complaint->statusHistories?->map(fn ($history) => [
                'id' => $history->id,
                'old_status' => $history->old_status,
                'new_status' => $history->new_status,
                'note' => $history->note,
                'created_at' => $history->created_at?->toISOString(),
                'changed_by' => $history->changedBy ? [
                    'id' => $history->changedBy->id,
                    'name' => $history->changedBy->name,
                    'email' => $history->changedBy->email,
                ] : null,
            ])->values() ?? [],
        ];
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