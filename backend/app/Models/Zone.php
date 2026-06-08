<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Zone extends Model
{
    protected $fillable = [
        'name',
        'ward_number',
        'city',
        'boundary_geojson',
        'status',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}