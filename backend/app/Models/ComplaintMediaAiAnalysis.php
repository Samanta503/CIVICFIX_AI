<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintMediaAiAnalysis extends Model
{
    protected $fillable = [
        'complaint_id',
        'complaint_media_id',
        'created_by',
        'reviewed_by',
        'model_name',
        'detected_issue_type',
        'visual_severity',
        'confidence_score',
        'quality_score',
        'image_width',
        'image_height',
        'file_size_bytes',
        'mime_type',
        'analysis_summary',
        'safety_observations',
        'matched_visual_clues',
        'recommendations',
        'raw_output',
        'status',
        'review_note',
        'reviewed_at',
    ];

    protected $casts = [
        'confidence_score' => 'float',
        'quality_score' => 'float',
        'image_width' => 'integer',
        'image_height' => 'integer',
        'file_size_bytes' => 'integer',
        'matched_visual_clues' => 'array',
        'recommendations' => 'array',
        'raw_output' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    public function complaintMedia(): BelongsTo
    {
        return $this->belongsTo(ComplaintMedia::class, 'complaint_media_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}