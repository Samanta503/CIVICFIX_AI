<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ComplaintCategory extends Model
{
    protected $fillable = [
        'department_id',
        'name',
        'slug',
        'default_priority',
        'default_sla_hours',
        'status',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function slaRules(): HasMany
    {
        return $this->hasMany(SlaRule::class, 'category_id');
    }
}