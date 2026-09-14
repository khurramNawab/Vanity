<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Setting;
use App\Models\SilverRate;

class PricingService
{
    private $cachedSilverRate = null;
    private $cachedGstPercent = null;

    /**
     * Get the currently active silver rate per gram.
     */
    public function getActiveSilverRate(): float
    {
        if ($this->cachedSilverRate !== null) {
            return $this->cachedSilverRate;
        }

        $override = Setting::getValue('silver_rate_manual_override');
        if ($override === '1') {
            $this->cachedSilverRate = (float) Setting::getValue('silver_rate_manual_value', 120.00);
        } else {
            $latestRate = SilverRate::whereIn('status', ['open', 'active'])->latest()->first() ?: SilverRate::latest()->first();
            $this->cachedSilverRate = $latestRate ? (float) $latestRate->rate_per_gram : (float) Setting::getValue('silver_rate_manual_value', 120.00);
        }

        return $this->cachedSilverRate;
    }

    /**
     * Calculate details for a product given a quantity and silver rate.
     */
    public function calculate(Product $product, int $quantity): array
    {
        $ratePerGram = $this->getActiveSilverRate();

        // 1. Calculate silver value: weight * rate per gram
        $weight = (float) $product->silver_weight;
        $silverValue = $weight * $ratePerGram;

        // 2. Calculate making charge
        $makingCharge = 0.0;
        if ($product->making_charge_type === 'percent') {
            $makingCharge = $silverValue * ((float) $product->making_charge / 100.0);
        } else {
            // flat charge
            $makingCharge = (float) $product->making_charge;
        }

        // 3. Unit price before discount
        $unitPrice = $silverValue + $makingCharge;

        // 4. Calculate discount
        $discount = $unitPrice * ((float) $product->discount_percent / 100.0);

        // 5. Final unit price
        $finalUnitPrice = $unitPrice - $discount;

        // 6. Subtotal
        $subtotal = $finalUnitPrice * $quantity;

        // 7. GST (3% standard on silver jewellery in India)
        if ($this->cachedGstPercent === null) {
            $this->cachedGstPercent = (float) Setting::getValue('tax_gst_percent', 3.0);
        }
        $gstPercent = $this->cachedGstPercent;
        $gstAmount = $subtotal * ($gstPercent / 100.0);

        return [
            'product_id' => $product->id,
            'sku' => $product->sku,
            'name' => $product->name,
            'quantity' => $quantity,
            'weight' => $weight,
            'silver_rate_used' => $ratePerGram,
            'silver_value' => $silverValue,
            'making_charge_snapshot' => $makingCharge,
            'unit_price_before_discount' => $unitPrice,
            'discount_amount' => $discount,
            'unit_price' => $finalUnitPrice,
            'subtotal' => $subtotal,
            'gst_amount' => $gstAmount,
            'total' => $subtotal + $gstAmount
        ];
    }
}
