<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintAiPrediction extends Model
{
    protected $fillable = [
        'complaint_id',
        'predicted_category_id',
        'predicted_department_id',
        'created_by',
        'reviewed_by',
        'model_name',
        'input_title',
        'input_description',
        'input_address',
        'predicted_priority',
        'confidence_score',
        'predicted_summary',
        'reasoning',
        'matched_keywords',
        'raw_output',
        'reviewed_at',
    ];

    protected $casts = [
        'confidence_score' => 'float',
        'matched_keywords' => 'array',
        'raw_output' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    public function predictedCategory(): BelongsTo
    {
        return $this->belongsTo(ComplaintCategory::class, 'predicted_category_id');
    }

    public function predictedDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'predicted_department_id');
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