<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\SilverRate;
use App\Services\PricingService;
use Illuminate\Http\Request;

class PublicProductController extends Controller
{
    protected $pricingService;

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    /**
     * Get active products list with dynamic pricing.
     */
    public function index(Request $request)
    {
        $query = Product::where('status', 'active')->with(['category', 'images']);

        // Search query parameter
        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by tags
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }
        if ($request->boolean('bestseller')) {
            $query->where('is_bestseller', true);
        }
        if ($request->boolean('new_arrival')) {
            $query->where('is_new_arrival', true);
        }

        // Filter by category or material
        if ($request->has('category') && $request->query('category') !== 'All') {
            $catParam = $request->query('category');
            $catSlug = \Illuminate\Support\Str::slug($catParam);
            $query->where(function ($parentQuery) use ($catParam, $catSlug) {
                $parentQuery->whereHas('category', function ($q) use ($catParam, $catSlug) {
                    $q->where('slug', $catSlug)
                      ->orWhere('name', 'like', "%{$catParam}%");
                })
                ->orWhere('name', 'like', "%{$catParam}%")
                ->orWhere('description', 'like', "%{$catParam}%");
            });
        }

        // Filter by silver purity
        if ($request->has('purity')) {
            $purity = $request->query('purity');
            if ($purity === '92.5' || $purity === '925') {
                $query->where('silver_purity', '925');
            } elseif ($purity === '99.9' || $purity === '999') {
                $query->where('silver_purity', '999');
            }
        }

        // Search text
        if ($request->has('q')) {
            $search = $request->query('q');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->has('limit')) {
            $query->limit($request->integer('limit'));
        }

        $products = $query->get();

        // Calculate dynamic pricing details for storefront
        $products->transform(function ($product) {
            $calc = $this->pricingService->calculate($product, 1);
            $product->calculated_price = $calc['unit_price'];
            $product->price_breakdown = $calc;
            return $product;
        });

        return response()->json([
            'success' => true,
            'products' => $products
        ]);
    }

    /**
     * Get single product with itemized price breakdown.
     */
    public function show($id)
    {
        try {
            // Support lookup by ID or slug
            $product = Product::with(['category', 'images'])
                ->where('status', 'active')
                ->where(function ($q) use ($id) {
                    if (is_numeric($id)) {
                        $q->where('id', $id)->orWhere('slug', $id);
                    } else {
                        $q->where('slug', $id);
                    }
                })
                ->firstOrFail();

            $calc = $this->pricingService->calculate($product, 1);
            $product->calculated_price = $calc['unit_price'];
            $product->price_breakdown = $calc;

            // Fetch related products in the same category
            $related = Product::where('status', 'active')
                ->where('category_id', $product->category_id)
                ->where('id', '!=', $product->id)
                ->limit(4)
                ->get()
                ->transform(function ($item) {
                    $itemCalc = $this->pricingService->calculate($item, 1);
                    $item->calculated_price = $itemCalc['unit_price'];
                    return $item;
                });

            return response()->json([
                'success' => true,
                'product' => $product,
                'related' => $related
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.'
            ], 404);
        }
    }

    /**
     * Get categories list.
     */
    public function categories()
    {
        $categories = Category::all();
        return response()->json([
            'success' => true,
            'categories' => $categories
        ]);
    }

    /**
     * Get active silver rate and historical record series.
     */
    public function silverRate()
    {
        $rate = $this->pricingService->getActiveSilverRate();
        $history = SilverRate::latest()->limit(30)->get();

        return response()->json([
            'success' => true,
            'rate' => $rate,
            'history' => $history
        ]);
    }

    /**
     * Subscribe to newsletter and get signup discount coupon.
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $discountPercent = \App\Models\Setting::getValue('signup_discount_percent', '10');
        
        $coupon = \App\Models\Coupon::where('code', 'VANITY10')->first();
        if (!$coupon) {
            $coupon = \App\Models\Coupon::create([
                'code' => 'VANITY10',
                'type' => 'percent',
                'value' => (float) $discountPercent,
                'min_order_value' => 500.00,
                'max_discount' => 2000.00,
                'expiry_date' => now()->addYears(2),
                'usage_limit' => 10000,
                'status' => 'active',
            ]);
        } else {
            $coupon->update([
                'value' => (float) $discountPercent
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Thank you for subscribing!',
            'coupon_code' => $coupon->code,
            'discount_percent' => (int) $discountPercent
        ]);
    }
}
