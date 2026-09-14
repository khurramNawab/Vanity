<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'order_number',
        'subtotal',
        'making_charge_total',
        'discount_total',
        'coupon_code',
        'gst_amount',
        'shipping_amount',
        'total_amount',
        'silver_rate_used',
        'payment_status',
        'order_status',
        'razorpay_order_id',
        'razorpay_payment_id',
        'shipping_name',
        'shipping_address',
        'shipping_apartment',
        'shipping_city',
        'shipping_state',
        'shipping_zip',
        'shipping_phone',
        'shipping_email',
        'fulfillment_method',
        'invoice_path',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'making_charge_total' => 'decimal:2',
        'discount_total' => 'decimal:2',
        'gst_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'silver_rate_used' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
