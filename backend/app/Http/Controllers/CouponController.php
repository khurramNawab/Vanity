<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CouponController extends Controller
{
    /**
     * Apply coupon and check validity.
     */
    public function apply(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $code = strtoupper($request->input('code'));
        $amount = (float) $request->input('amount');
        
        $user = $request->user('sanctum');
        $userId = $user ? $user->id : null;

        $coupon = Coupon::where('code', $code)->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon code does not exist.'
            ], 404);
        }

        if (!$coupon->isValidForAmount($amount, $userId)) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon code is invalid, expired, or usage limit exceeded.'
            ], 400);
        }

        $discount = $coupon->calculateDiscount($amount);

        return response()->json([
            'success' => true,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => $coupon->value,
            'discount' => $discount,
            'final_amount' => $amount - $discount
        ]);
    }

    /**
     * List all coupons (Admin-only).
     */
    public function adminIndex(Request $request)
    {
        $coupons = Coupon::latest()->get();
        return response()->json([
            'success' => true,
            'coupons' => $coupons
        ]);
    }

    /**
     * Create a coupon (Admin-only).
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:coupons,code',
            'type' => 'required|string|in:percent,fixed',
            'value' => 'required|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'expiry_date' => 'nullable|date',
            'usage_limit' => 'nullable|integer|min:1',
            'status' => 'required|string|in:active,inactive',
        ]);

        $coupon = Coupon::create([
            'code' => strtoupper($request->input('code')),
            'type' => $request->input('type'),
            'value' => $request->input('value'),
            'min_order_value' => $request->input('min_order_value') ?: 0.00,
            'max_discount' => $request->input('max_discount'),
            'expiry_date' => $request->input('expiry_date'),
            'usage_limit' => $request->input('usage_limit'),
            'usage_count' => 0,
            'status' => $request->input('status'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Coupon created successfully.',
            'coupon' => $coupon
        ]);
    }

    /**
     * Update a coupon (Admin-only).
     */
    public function update(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);

        $request->validate([
            'code' => 'required|string|unique:coupons,code,' . $coupon->id,
            'type' => 'required|string|in:percent,fixed',
            'value' => 'required|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'expiry_date' => 'nullable|date',
            'usage_limit' => 'nullable|integer|min:1',
            'status' => 'required|string|in:active,inactive',
        ]);

        $coupon->update([
            'code' => strtoupper($request->input('code')),
            'type' => $request->input('type'),
            'value' => $request->input('value'),
            'min_order_value' => $request->input('min_order_value') ?: 0.00,
            'max_discount' => $request->input('max_discount'),
            'expiry_date' => $request->input('expiry_date'),
            'usage_limit' => $request->input('usage_limit'),
            'status' => $request->input('status'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Coupon updated successfully.',
            'coupon' => $coupon
        ]);
    }

    /**
     * Delete a coupon (Admin-only).
     */
    public function destroy($id)
    {
        try {
            $coupon = Coupon::findOrFail($id);
            $coupon->delete();
            return response()->json([
                'success' => true,
                'message' => 'Coupon deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete coupon.'
            ], 400);
        }
    }
}
