<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_value',
        'max_discount',
        'expiry_date',
        'usage_limit',
        'usage_count',
        'status',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_value' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'expiry_date' => 'date',
    ];

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    /**
     * Check if coupon is valid for application.
     */
    public function isValidForAmount(float $amount, ?int $userId = null): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->expiry_date && $this->expiry_date->isPast()) {
            return false;
        }

        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            return false;
        }

        if ($amount < (float) $this->min_order_value) {
            return false;
        }

        if ($userId && $this->usages()->where('user_id', $userId)->count() > 0) {
            // Per user usage limit = 1 (standard)
            return false;
        }

        return true;
    }

    /**
     * Calculate discount amount for a given order total.
     */
    public function calculateDiscount(float $amount): float
    {
        $discount = 0.0;
        if ($this->type === 'percent') {
            $discount = $amount * ((float) $this->value / 100.0);
            if ($this->max_discount) {
                $discount = min($discount, (float) $this->max_discount);
            }
        } else {
            // Fixed discount
            $discount = min((float) $this->value, $amount);
        }

        return round($discount, 2);
    }
}
