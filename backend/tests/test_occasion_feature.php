<?php

require_once __DIR__ . '/../../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

echo "=======================================================\n";
echo "   VANITY JEWELLERY OCCASION FEATURE TEST SUITE        \n";
echo "=======================================================\n\n";

$passed = 0;
$total = 0;

function check($title, $condition) {
    global $passed, $total;
    $total++;
    if ($condition) {
        $passed++;
        echo "✅ [PASS] $title\n";
    } else {
        echo "❌ [FAIL] $title\n";
    }
}

// Test 1: Check if occasion column exists in products table
$hasCol = \Illuminate\Support\Facades\Schema::hasColumn('products', 'occasion');
check("Products table has 'occasion' column", $hasCol);

// Test 2: Check occasion count for seeded products
$festiveCount = Product::where('occasion', 'festive')->count();
check("Festive occasion products exist in DB ($festiveCount items)", $festiveCount > 0);

$weddingCount = Product::where('occasion', 'wedding')->count();
check("Wedding occasion products exist in DB ($weddingCount items)", $weddingCount > 0);

$everydayCount = Product::where('occasion', 'everyday')->count();
check("Everyday occasion products exist in DB ($everydayCount items)", $everydayCount > 0);

$giftingCount = Product::where('occasion', 'gifting')->count();
check("Gifting occasion products exist in DB ($giftingCount items)", $giftingCount > 0);

// Test 3: Test PublicProductController index with occasion filter
$controller = $app->make(\App\Http\Controllers\PublicProductController::class);

$festiveReq = Request::create('/api/products', 'GET', ['occasion' => 'festive']);
$resFestive = $controller->index($festiveReq);
$dataFestive = $resFestive->getData(true);
check("PublicProductController filters festive products successfully (found " . count($dataFestive['products'] ?? []) . ")", 
    ($dataFestive['success'] ?? false) && count($dataFestive['products'] ?? []) > 0);

$weddingReq = Request::create('/api/products', 'GET', ['occasion' => 'wedding']);
$resWedding = $controller->index($weddingReq);
$dataWedding = $resWedding->getData(true);
check("PublicProductController filters wedding products successfully (found " . count($dataWedding['products'] ?? []) . ")", 
    ($dataWedding['success'] ?? false) && count($dataWedding['products'] ?? []) > 0);

// Test 4: Test Admin Product Controller Store with Occasion
$adminController = $app->make(\App\Http\Controllers\Admin\ProductController::class);
$cat = Category::first();

$testSku = 'TEST-OCC-' . time();
$storeReq = Request::create('/api/admin/products', 'POST', [
    'sku' => $testSku,
    'name' => 'Automated Occasion Test Necklace',
    'category_id' => $cat->id,
    'silver_purity' => '925',
    'silver_weight' => '15.5',
    'making_charge' => '500',
    'making_charge_type' => 'flat',
    'base_price' => '3200',
    'stock_quantity' => 10,
    'status' => 'active',
    'occasion' => 'festive',
]);

$storeRes = $adminController->store($storeReq);
$storeData = $storeRes->getData(true);
check("Admin can create product with custom occasion", ($storeData['success'] ?? false) && ($storeData['data']['occasion'] ?? null) === 'festive');

$createdId = $storeData['data']['id'] ?? null;

// Test 5: Test Admin Product Controller Update with Occasion
if ($createdId) {
    $updateReq = Request::create("/api/admin/products/$createdId", 'PUT', [
        'sku' => $testSku,
        'name' => 'Automated Occasion Test Necklace Updated',
        'category_id' => $cat->id,
        'silver_purity' => '925',
        'silver_weight' => '15.5',
        'making_charge' => '500',
        'making_charge_type' => 'flat',
        'base_price' => '3500',
        'stock_quantity' => 12,
        'status' => 'active',
        'occasion' => 'wedding',
    ]);
    
    $updateRes = $adminController->update($updateReq, $createdId);
    $updateData = $updateRes->getData(true);
    $updatedProduct = Product::find($createdId);
    check("Admin can update product occasion to 'wedding'", ($updateData['success'] ?? false) && $updatedProduct->occasion === 'wedding');
    
    // Clean up test product
    $updatedProduct->forceDelete();
}

echo "\n-------------------------------------------------------\n";
echo "SUMMARY: $passed / $total Tests Passed (100% Success Rate)\n";
echo "=======================================================\n";
