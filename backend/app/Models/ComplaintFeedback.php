<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintFeedback extends Model
{
    protected $table = 'complaint_feedback';

    protected $fillable = [
        'complaint_id',
        'citizen_id',
        'rating',
        'response_quality',
        'issue_resolved',
        'comment',
        'submitted_at',
    ];

    protected $casts = [
        'rating' => 'integer',
        'issue_resolved' => 'boolean',
        'submitted_at' => 'datetime',
    ];

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(User::class, 'citizen_id');
    }
}