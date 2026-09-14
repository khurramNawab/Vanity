<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'weight',
        'silver_rate_snapshot',
        'making_charge_snapshot',
        'unit_price',
        'line_total',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'silver_rate_snapshot' => 'decimal:2',
        'making_charge_snapshot' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'line_total' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
