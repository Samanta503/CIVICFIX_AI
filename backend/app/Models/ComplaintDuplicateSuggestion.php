<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintDuplicateSuggestion extends Model
{
    protected $fillable = [
        'source_complaint_id',
        'matched_complaint_id',
        'created_by',
        'reviewed_by',
        'model_name',
        'similarity_score',
        'text_similarity_score',
        'location_similarity_score',
        'category_similarity_score',
        'distance_meters',
        'matched_reasons',
        'raw_output',
        'status',
        'review_note',
        'reviewed_at',
    ];

    protected $casts = [
        'similarity_score' => 'float',
        'text_similarity_score' => 'float',
        'location_similarity_score' => 'float',
        'category_similarity_score' => 'float',
        'distance_meters' => 'float',
        'matched_reasons' => 'array',
        'raw_output' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function sourceComplaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class, 'source_complaint_id');
    }

    public function matchedComplaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class, 'matched_complaint_id');
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