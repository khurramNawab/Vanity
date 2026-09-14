<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartSession extends Model
{
    protected $fillable = [
        'user_id',
        'email',
        'shipping_name',
        'shipping_phone',
        'cart_data',
        'last_activity_at',
        'is_recovered',
        'email_sent',
        'email_sent_at',
    ];

    protected $casts = [
        'cart_data' => 'array',
        'is_recovered' => 'boolean',
        'email_sent' => 'boolean',
        'last_activity_at' => 'datetime',
        'email_sent_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
