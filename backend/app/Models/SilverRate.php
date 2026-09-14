<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SilverRate extends Model
{
    protected $fillable = [
        'rate_per_gram',
        'source',
        'source_detail',
        'status',
    ];

    protected $casts = [
        'rate_per_gram' => 'decimal:2',
    ];
}
