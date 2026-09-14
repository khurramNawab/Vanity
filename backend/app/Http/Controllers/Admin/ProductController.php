<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of products with filtering and sorting.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'images']);

        // Search by name or SKU
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter by Category
        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by Status
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Sorting
        $sortField = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedFields = ['name', 'sku', 'silver_weight', 'stock_quantity', 'created_at', 'base_price'];

        if (in_array($sortField, $allowedFields)) {
            $query->orderBy($sortField, $sortOrder);
        }

        $products = $query->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sku' => 'required|string|max:255|unique:products,sku',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'silver_purity' => 'required|string|max:50',
            'silver_weight' => 'required|numeric|min:0.01',
            'making_charge' => 'required|numeric|min:0',
            'making_charge_type' => 'required|in:flat,percent',
            'base_price' => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'stock_quantity' => 'required|integer|min:0',
            'is_featured' => 'boolean',
            'is_bestseller' => 'boolean',
            'is_new_arrival' => 'boolean',
            'status' => 'required|in:active,inactive',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'image_urls.*' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $slug = Str::slug($request->name);
        $originalSlug = $slug;
        $count = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }

        $product = Product::create([
            'sku' => $request->sku,
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'category_id' => $request->category_id,
            'silver_purity' => $request->silver_purity,
            'silver_weight' => $request->silver_weight,
            'making_charge' => $request->making_charge,
            'making_charge_type' => $request->making_charge_type,
            'base_price' => $request->base_price,
            'discount_percent' => $request->discount_percent ?? 0.00,
            'stock_quantity' => $request->stock_quantity,
            'is_featured' => $request->boolean('is_featured', false),
            'is_bestseller' => $request->boolean('is_bestseller', false),
            'is_new_arrival' => $request->boolean('is_new_arrival', false),
            'status' => $request->status,
        ]);

        // Process Uploaded Files
        $sortOrder = 0;
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('products', 'public');
                $url = Storage::url($path);

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => asset($url),
                    'is_primary' => $sortOrder === 0,
                    'sort_order' => $sortOrder++,
                ]);
            }
        }

        // Process Image URLs (helpful for seeds or linking external assets)
        if ($request->has('image_urls')) {
            foreach ($request->image_urls as $url) {
                if (!empty($url)) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $url,
                        'is_primary' => $sortOrder === 0,
                        'sort_order' => $sortOrder++,
                    ]);
                }
            }
        }

        // Fallback placeholder image if none provided
        if ($sortOrder === 0) {
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => 'https://placehold.co/600x600/FAF9F6/1A1A1A?text=No+Image',
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product->load('images')
        ], 201);
    }

    /**
     * Display the specified product.
     */
    public function show($id)
    {
        $product = Product::with(['category', 'images'])->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'sku' => 'required|string|max:255|unique:products,sku,' . $id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'silver_purity' => 'required|string|max:50',
            'silver_weight' => 'required|numeric|min:0.01',
            'making_charge' => 'required|numeric|min:0',
            'making_charge_type' => 'required|in:flat,percent',
            'base_price' => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'stock_quantity' => 'required|integer|min:0',
            'is_featured' => 'boolean',
            'is_bestseller' => 'boolean',
            'is_new_arrival' => 'boolean',
            'status' => 'required|in:active,inactive',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'image_urls.*' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($product->name !== $request->name) {
            $slug = Str::slug($request->name);
            $originalSlug = $slug;
            $count = 1;
            while (Product::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug . '-' . $count++;
            }
            $product->slug = $slug;
        }

        $product->update([
            'sku' => $request->sku,
            'name' => $request->name,
            'description' => $request->description,
            'category_id' => $request->category_id,
            'silver_purity' => $request->silver_purity,
            'silver_weight' => $request->silver_weight,
            'making_charge' => $request->making_charge,
            'making_charge_type' => $request->making_charge_type,
            'base_price' => $request->base_price,
            'discount_percent' => $request->discount_percent ?? 0.00,
            'stock_quantity' => $request->stock_quantity,
            'is_featured' => $request->boolean('is_featured', false),
            'is_bestseller' => $request->boolean('is_bestseller', false),
            'is_new_arrival' => $request->boolean('is_new_arrival', false),
            'status' => $request->status,
        ]);

        // If new images uploaded, handle them
        $sortOrder = ProductImage::where('product_id', $product->id)->max('sort_order') + 1;

        if ($request->hasFile('images')) {
            // Remove fallback placeholder if it exists and we're adding actual images
            ProductImage::where('product_id', $product->id)
                ->where('image_path', 'like', '%placehold.co%')
                ->delete();

            foreach ($request->file('images') as $file) {
                $path = $file->store('products', 'public');
                $url = Storage::url($path);

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => asset($url),
                    'is_primary' => false, // Keep existing primary
                    'sort_order' => $sortOrder++,
                ]);
            }
        }

        if ($request->has('image_urls')) {
            ProductImage::where('product_id', $product->id)
                ->where('image_path', 'like', '%placehold.co%')
                ->delete();

            foreach ($request->image_urls as $url) {
                if (!empty($url)) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $url,
                        'is_primary' => false,
                        'sort_order' => $sortOrder++,
                    ]);
                }
            }
        }

        // Re-ensure at least one primary image exists
        if (ProductImage::where('product_id', $product->id)->count() > 0) {
            if (!ProductImage::where('product_id', $product->id)->where('is_primary', true)->exists()) {
                ProductImage::where('product_id', $product->id)->first()->update(['is_primary' => true]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product->load('images')
        ]);
    }

    /**
     * Remove the specified product (Soft Delete).
     */
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Download a sample CSV file for bulk product imports.
     */
    public function downloadSampleCsv()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="vanity_products_import_sample.csv"',
        ];

        $columns = [
            'sku',
            'name',
            'category_name',
            'silver_purity',
            'silver_weight',
            'making_charge',
            'making_charge_type',
            'base_price',
            'discount_percent',
            'stock_quantity',
            'image_url',
            'description'
        ];

        $sampleRows = [
            [
                'VNT-RNG-101',
                'Emerald Cut Solitaire Ring',
                'Rings',
                '925',
                '6.50',
                '450.00',
                'flat',
                '2500.00',
                '10.00',
                '15',
                'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
                'Handcrafted sterling silver ring with emerald cut center CZ stone.'
            ],
            [
                'VNT-NEC-202',
                'Chandi Haar Statement Necklace',
                'Necklaces',
                '925',
                '28.00',
                '1200.00',
                'flat',
                '8500.00',
                '5.00',
                '8',
                'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
                'Traditional royal Kolkata oxidised silver statement necklace.'
            ]
        ];

        $callback = function () use ($columns, $sampleRows) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($sampleRows as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Parse XLSX file into array of rows using PHP ZipArchive & SimpleXML.
     */
    private function parseXlsxRows($filePath)
    {
        $rows = [];
        $zip = new \ZipArchive();

        if ($zip->open($filePath) === true) {
            $sharedStrings = [];
            if (($index = $zip->locateName('xl/sharedStrings.xml')) !== false) {
                $xml = simplexml_load_string($zip->getFromIndex($index));
                foreach ($xml->si as $val) {
                    if (isset($val->t)) {
                        $sharedStrings[] = (string) $val->t;
                    } elseif (isset($val->r)) {
                        $text = '';
                        foreach ($val->r as $r) {
                            $text .= (string) $r->t;
                        }
                        $sharedStrings[] = $text;
                    } else {
                        $sharedStrings[] = '';
                    }
                }
            }

            if (($sheetIndex = $zip->locateName('xl/worksheets/sheet1.xml')) !== false) {
                $sheetXml = simplexml_load_string($zip->getFromIndex($sheetIndex));
                foreach ($sheetXml->sheetData->row as $r) {
                    $row = [];
                    foreach ($r->c as $c) {
                        $val = (string) $c->v;
                        $type = (string) $c['t'];
                        if ($type === 's' && isset($sharedStrings[(int) $val])) {
                            $val = $sharedStrings[(int) $val];
                        }
                        $row[] = $val;
                    }
                    $rows[] = $row;
                }
            }
            $zip->close();
        }

        return $rows;
    }

    /**
     * Import multiple products via uploaded CSV / XLSX file.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension());
        $filePath = $file->getRealPath();

        $rows = [];
        if ($ext === 'xlsx') {
            $rows = $this->parseXlsxRows($filePath);
        } else {
            $handle = fopen($filePath, 'r');
            if ($handle) {
                while (($r = fgetcsv($handle)) !== false) {
                    $rows[] = $r;
                }
                fclose($handle);
            }
        }

        if (empty($rows)) {
            return response()->json([
                'success' => false,
                'message' => 'The uploaded file is empty or unreadable.'
            ], 422);
        }

        // Header row
        $header = array_shift($rows);
        $cleanHeaders = array_map(function ($col) {
            return strtolower(trim(preg_replace('/[\x00-\x1F\x7F-\xFF]/', '', $col)));
        }, $header);

        $requiredCols = ['sku', 'name', 'category_name', 'silver_purity', 'silver_weight', 'making_charge', 'stock_quantity'];
        $missingCols = array_diff($requiredCols, $cleanHeaders);

        if (!empty($missingCols)) {
            return response()->json([
                'success' => false,
                'message' => 'Missing required column headers: ' . implode(', ', $missingCols)
            ], 422);
        }

        $headerMap = array_flip($cleanHeaders);

        $createdCount = 0;
        $updatedCount = 0;
        $failedCount = 0;
        $errors = [];
        $lineNum = 1;

        foreach ($rows as $row) {
            $lineNum++;
            if (empty(array_filter($row))) continue;

            $rowSku = isset($headerMap['sku']) && isset($row[$headerMap['sku']]) ? trim($row[$headerMap['sku']]) : '';
            $rowName = isset($headerMap['name']) && isset($row[$headerMap['name']]) ? trim($row[$headerMap['name']]) : '';
            $rowCategory = isset($headerMap['category_name']) && isset($row[$headerMap['category_name']]) ? trim($row[$headerMap['category_name']]) : 'Uncategorized';
            $rowPurity = isset($headerMap['silver_purity']) && isset($row[$headerMap['silver_purity']]) ? trim($row[$headerMap['silver_purity']]) : '925';
            $rowWeight = isset($headerMap['silver_weight']) && isset($row[$headerMap['silver_weight']]) ? floatval($row[$headerMap['silver_weight']]) : 0;
            $rowCharge = isset($headerMap['making_charge']) && isset($row[$headerMap['making_charge']]) ? floatval($row[$headerMap['making_charge']]) : 0;
            $rowChargeType = isset($headerMap['making_charge_type']) && isset($row[$headerMap['making_charge_type']]) && in_array(strtolower(trim($row[$headerMap['making_charge_type']])), ['flat', 'percent']) ? strtolower(trim($row[$headerMap['making_charge_type']])) : 'flat';
            $rowBasePrice = isset($headerMap['base_price']) && isset($row[$headerMap['base_price']]) && $row[$headerMap['base_price']] !== '' ? floatval($row[$headerMap['base_price']]) : null;
            $rowDiscount = isset($headerMap['discount_percent']) && isset($row[$headerMap['discount_percent']]) ? floatval($row[$headerMap['discount_percent']]) : 0;
            $rowStock = isset($headerMap['stock_quantity']) && isset($row[$headerMap['stock_quantity']]) ? intval($row[$headerMap['stock_quantity']]) : 0;
            $rowImageUrl = isset($headerMap['image_url']) && isset($row[$headerMap['image_url']]) ? trim($row[$headerMap['image_url']]) : null;
            $rowDesc = isset($headerMap['description']) && isset($row[$headerMap['description']]) ? trim($row[$headerMap['description']]) : null;

            if (empty($rowSku) || empty($rowName)) {
                $failedCount++;
                $errors[] = "Row {$lineNum}: SKU or Name is missing.";
                continue;
            }

            try {
                $catSlug = Str::slug($rowCategory);
                $category = \App\Models\Category::firstOrCreate(
                    ['slug' => $catSlug],
                    ['name' => ucfirst($rowCategory), 'description' => 'Collection of ' . $rowCategory]
                );

                $productSlug = Str::slug($rowName);
                $existingBySlug = Product::where('slug', $productSlug)->where('sku', '!=', $rowSku)->first();
                if ($existingBySlug) {
                    $productSlug = $productSlug . '-' . Str::random(4);
                }

                $productData = [
                    'name' => $rowName,
                    'slug' => $productSlug,
                    'description' => $rowDesc,
                    'category_id' => $category->id,
                    'silver_purity' => $rowPurity,
                    'silver_weight' => $rowWeight,
                    'making_charge' => $rowCharge,
                    'making_charge_type' => $rowChargeType,
                    'base_price' => $rowBasePrice,
                    'discount_percent' => $rowDiscount,
                    'stock_quantity' => $rowStock,
                    'status' => 'active',
                ];

                $existingProduct = Product::where('sku', $rowSku)->first();

                if ($existingProduct) {
                    $existingProduct->update($productData);
                    $product = $existingProduct;
                    $updatedCount++;
                } else {
                    $productData['sku'] = $rowSku;
                    $product = Product::create($productData);
                    $createdCount++;
                }

                if ($rowImageUrl) {
                    ProductImage::updateOrCreate(
                        ['product_id' => $product->id, 'is_primary' => true],
                        ['image_path' => $rowImageUrl]
                    );
                }
            } catch (\Exception $e) {
                $failedCount++;
                $errors[] = "Row {$lineNum} ({$rowSku}): " . $e->getMessage();
            }
        }

        fclose($handle);

        return response()->json([
            'success' => true,
            'message' => "Import complete. Created: {$createdCount}, Updated: {$updatedCount}, Failed: {$failedCount}",
            'summary' => [
                'created' => $createdCount,
                'updated' => $updatedCount,
                'failed' => $failedCount,
                'errors' => $errors
            ]
        ]);
    }

    /**
     * Upload product image to Cloudinary / storage and return Cloudinary CDN URL.
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:10240', // max 10MB
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');

            // Check if Cloudinary credentials are configured in Settings or ENV
            $cloudName = \App\Models\Setting::getValue('cloudinary_cloud_name', env('CLOUDINARY_CLOUD_NAME', ''));
            $apiSecret = \App\Models\Setting::getValue('cloudinary_api_secret', env('CLOUDINARY_API_SECRET', ''));
            $apiKey = \App\Models\Setting::getValue('cloudinary_api_key', env('CLOUDINARY_API_KEY', ''));
            $uploadPreset = \App\Models\Setting::getValue('cloudinary_upload_preset', env('CLOUDINARY_UPLOAD_PRESET', ''));

            if (!empty($cloudName)) {
                try {
                    $timestamp = time();
                    $postData = [
                        'folder' => 'vanity_products',
                    ];

                    if (!empty($apiSecret)) {
                        // Signed Cloudinary upload
                        $signature = sha1("folder=vanity_products&timestamp={$timestamp}" . $apiSecret);
                        $postData['timestamp'] = $timestamp;
                        $postData['signature'] = $signature;
                        if (!empty($apiKey)) {
                            $postData['api_key'] = $apiKey;
                        }
                    } elseif (!empty($uploadPreset)) {
                        // Unsigned upload preset
                        $postData['upload_preset'] = $uploadPreset;
                    }

                    $response = \Illuminate\Support\Facades\Http::attach(
                        'file',
                        file_get_contents($file->getRealPath()),
                        $file->getClientOriginalName()
                    )->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/upload", $postData);

                    if ($response->successful()) {
                        $data = $response->json();
                        return response()->json([
                            'success' => true,
                            'url' => $data['secure_url'],
                            'public_id' => $data['public_id'] ?? null,
                            'source' => 'cloudinary',
                            'message' => 'Image uploaded to Cloudinary CDN successfully.'
                        ]);
                    } else {
                        \Illuminate\Support\Facades\Log::warning('Cloudinary upload responded with error', [
                            'status' => $response->status(),
                            'body' => $response->body()
                        ]);
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Cloudinary upload exception', [
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Fallback: Save to local public storage
            $path = $file->store('products', 'public');
            $url = asset('storage/' . $path);

            return response()->json([
                'success' => true,
                'url' => $url,
                'source' => 'local',
                'message' => 'Image stored locally.'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No image file uploaded.'
        ], 400);
    }
}
