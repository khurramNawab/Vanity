<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\PublicProductController;
use App\Http\Controllers\HeroSlideController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Auth routes (Priority 5: Rate limited to 5 attempts per minute per IP)
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

// Public Checkout routes
Route::post('/checkout/initiate', [CheckoutController::class, 'initiate']);
Route::post('/checkout/verify', [CheckoutController::class, 'verify']);
Route::get('/orders/{id}', [CheckoutController::class, 'show']);
Route::get('/orders/{id}/invoice', [CheckoutController::class, 'downloadInvoice']);
Route::post('/checkout/progress', [\App\Http\Controllers\AbandonedCartController::class, 'saveProgress']);
Route::get('/checkout/cart-session', [\App\Http\Controllers\AbandonedCartController::class, 'getCartSession']);

// Public Catalog routes
Route::get('/seed-database', function() {
    \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
    return response()->json([
        'success' => true,
        'message' => 'Database seeded successfully',
        'products_count' => \App\Models\Product::count(),
        'categories_count' => \App\Models\Category::count()
    ]);
});
Route::get('/products', [PublicProductController::class, 'index']);
Route::get('/products/{id}', [PublicProductController::class, 'show']);
Route::get('/categories', [PublicProductController::class, 'categories']);
Route::get('/silver-rate', [PublicProductController::class, 'silverRate']);
Route::post('/coupons/apply', [\App\Http\Controllers\CouponController::class, 'apply'])->middleware('throttle:10,1');
Route::post('/newsletter/subscribe', [PublicProductController::class, 'subscribe']);

// Public Hero Slides
Route::get('/hero-slides', [HeroSlideController::class, 'publicIndex']);

// Public Settings (social links, whatsapp, store address, and active campaigns)
Route::get('/settings/public', function () {
    $keys = [
        'social_instagram', 'social_facebook', 'social_linkedin', 'social_email', 'whatsapp_number',
        'store_address', 'contact_address', 'contact_email', 'contact_phone',
        'campaign_active_festival', 'campaign_active_text', 'campaign_active_code',
        'campaign_active_product_id', 'campaign_active_video_url', 'campaign_active_image_url',
        'campaign_show_video_card'
    ];
    $settings = \App\Models\Setting::whereIn('key', $keys)->pluck('value', 'key');
    
    $productId = $settings->get('campaign_active_product_id');
    $productImage = null;
    $productSlug = null;
    if ($productId) {
        $product = \App\Models\Product::with('primaryImage')->find($productId);
        if ($product) {
            $productImage = $product->primaryImage ? $product->primaryImage->image_path : null;
            $productSlug = $product->slug;
        }
    }
    
    return response()->json([
        'success' => true,
        'settings' => $settings,
        'campaign_product_image' => $productImage,
        'campaign_product_slug' => $productSlug
    ]);
});

Route::post('/support', [\App\Http\Controllers\SupportController::class, 'submit']);

// Protected routes (Logged in users only)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/wishlist', [\App\Http\Controllers\WishlistController::class, 'index']);
    Route::post('/wishlist', [\App\Http\Controllers\WishlistController::class, 'toggle']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::get('/user/orders', [CheckoutController::class, 'userOrders']);
    
    Route::get('/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
                'phone' => $request->user()->phone,
                'address_line1' => $request->user()->address_line1,
                'address_line2' => $request->user()->address_line2,
                'city' => $request->user()->city,
                'state' => $request->user()->state,
                'pincode' => $request->user()->pincode,
            ]
        ]);
    });

    // Admin-only routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::apiResource('categories', CategoryController::class);
        Route::post('/products/import', [ProductController::class, 'import']);
        Route::get('/products/sample-csv', [ProductController::class, 'downloadSampleCsv']);
        Route::post('/products/upload-image', [ProductController::class, 'uploadImage']);
        Route::apiResource('products', ProductController::class);
        Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index']);
        Route::get('/customers', [\App\Http\Controllers\Admin\CustomerController::class, 'index']);
        
        // Orders
        Route::get('/orders', [\App\Http\Controllers\CheckoutController::class, 'adminOrders']);
        Route::post('/orders/{id}/status', [\App\Http\Controllers\CheckoutController::class, 'updateOrderStatus']);
        
        // Abandoned Carts
        Route::get('/abandoned-carts', [\App\Http\Controllers\AbandonedCartController::class, 'index']);
        Route::post('/abandoned-carts/{id}/send-email', [\App\Http\Controllers\AbandonedCartController::class, 'sendFollowup']);
        Route::post('/abandoned-carts/bulk-send-email', [\App\Http\Controllers\AbandonedCartController::class, 'bulkSendFollowup']);
        
        // Settings & Silver Rate
        Route::get('/settings', [\App\Http\Controllers\SettingController::class, 'index']);
        Route::post('/settings', [\App\Http\Controllers\SettingController::class, 'update']);
        Route::post('/settings/upload-video', [\App\Http\Controllers\SettingController::class, 'uploadVideo']);
        Route::post('/silver-rate', [\App\Http\Controllers\SettingController::class, 'updateSilverRate']);

        // Support Tickets
        Route::get('/support', [\App\Http\Controllers\SupportController::class, 'index']);
        Route::post('/support/{id}/resolve', [\App\Http\Controllers\SupportController::class, 'resolve']);

        // Coupons
        Route::get('/coupons', [\App\Http\Controllers\CouponController::class, 'adminIndex']);
        Route::post('/coupons', [\App\Http\Controllers\CouponController::class, 'store']);
        Route::put('/coupons/{id}', [\App\Http\Controllers\CouponController::class, 'update']);
        Route::delete('/coupons/{id}', [\App\Http\Controllers\CouponController::class, 'destroy']);

        // Hero Slides
        Route::get('/hero-slides', [HeroSlideController::class, 'index']);
        Route::post('/hero-slides', [HeroSlideController::class, 'store']);
        Route::put('/hero-slides/{id}', [HeroSlideController::class, 'update']);
        Route::delete('/hero-slides/{id}', [HeroSlideController::class, 'destroy']);
    });
});
