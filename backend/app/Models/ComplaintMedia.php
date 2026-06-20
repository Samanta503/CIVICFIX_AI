<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintMedia extends Model
{
    protected $table = 'complaint_media';

    protected $fillable = [
        'complaint_id',
        'uploaded_by',
        'media_type',
        'file_disk',
        'file_path',
        'file_url',
        'original_name',
        'mime_type',
        'size_bytes',
    ];

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}