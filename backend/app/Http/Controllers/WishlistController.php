<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use App\Services\PricingService;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    protected $pricingService;

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    /**
     * Get wishlisted products for authenticated user.
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        
        $wishlistItems = Wishlist::where('user_id', $userId)
            ->with(['product.category', 'product.images'])
            ->get();

        $products = $wishlistItems->map(function ($item) {
            $product = $item->product;
            if ($product) {
                $calc = $this->pricingService->calculate($product, 1);
                $product->calculated_price = $calc['unit_price'];
                $product->price_breakdown = $calc;
            }
            return $product;
        })->filter()->values();

        return response()->json([
            'success' => true,
            'products' => $products
        ]);
    }

    /**
     * Toggle wishlist status for a product.
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $userId = $request->user()->id;
        $productId = $request->input('product_id');

        $existing = Wishlist::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'success' => true,
                'status' => 'removed',
                'message' => 'Product removed from wishlist.'
            ]);
        }

        Wishlist::create([
            'user_id' => $userId,
            'product_id' => $productId
        ]);

        return response()->json([
            'success' => true,
            'status' => 'added',
            'message' => 'Product added to wishlist.'
        ]);
    }
}
