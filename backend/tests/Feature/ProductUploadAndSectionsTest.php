<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProductUploadAndSectionsTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::firstOrCreate(
            ['email' => 'admin@vanity.com'],
            ['name' => 'Vanity Admin', 'password' => bcrypt('AdminPass123!'), 'role' => 'admin']
        );
    }

    /**
     * Test direct standalone image upload via admin API.
     */
    public function test_admin_direct_image_upload()
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->image('necklace_test.jpg', 600, 600);

        $response = $this->actingAs($this->admin)->postJson('/api/admin/products/upload-image', [
            'image' => $file
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure(['success', 'url', 'source', 'message']);
    }

    /**
     * Test direct product creation with image file upload and auto SEO tags.
     */
    public function test_admin_product_creation_with_direct_image_file()
    {
        Storage::fake('public');
        $cat = Category::firstOrCreate(['slug' => 'necklaces'], ['name' => 'Necklaces']);
        $file = UploadedFile::fake()->image('solitaire_pendant.png', 800, 800);

        $sku = 'VNT-NEC-' . uniqid();
        $response = $this->actingAs($this->admin)->post('/api/admin/products', [
            'sku' => $sku,
            'name' => 'Artisan Solitaire Silver Necklace',
            'category_id' => $cat->id,
            'silver_purity' => '925',
            'silver_weight' => 12.50,
            'making_charge' => 450,
            'making_charge_type' => 'flat',
            'base_price' => 3800,
            'discount_percent' => 10,
            'stock_quantity' => 15,
            'status' => 'active',
            'occasion' => 'festive',
            'images' => [$file],
            'image_alt_text' => 'Artisan Solitaire Silver Necklace - 925 Hallmark'
        ]);

        $response->assertStatus(201)->assertJson(['success' => true]);
        $createdSlug = $response->json('data.slug');

        $this->assertNotEmpty($createdSlug);
        $this->assertDatabaseHas('products', [
            'sku' => $sku,
            'slug' => $createdSlug,
            'occasion' => 'festive'
        ]);

        // Verify product image was saved in database
        $product = Product::where('sku', $sku)->first();
        $this->assertNotNull($product);
        $this->assertGreaterThan(0, $product->images()->count());
    }

    /**
     * Test product creation with image_urls for all storefront sections and categories.
     */
    public function test_products_for_all_sections_and_categories()
    {
        $sections = [
            ['cat' => 'necklaces', 'occ' => 'festive', 'name' => 'Imperial Ruby Royal Necklace'],
            ['cat' => 'earrings', 'occ' => 'wedding', 'name' => 'Floral Bridal CZ Diamond Earrings'],
            ['cat' => 'bracelets', 'occ' => 'everyday', 'name' => 'Eternity Silver Tennis Bracelet'],
            ['cat' => 'bangles', 'occ' => 'gifting', 'name' => 'Classic 925 Silver Kada Bangle'],
            ['cat' => 'pendants', 'occ' => 'party', 'name' => 'Rose Solitaire Statement Pendant'],
            ['cat' => 'tops', 'occ' => 'puja', 'name' => 'Auspicious Lotus Silver Tops'],
            ['cat' => 'mala', 'occ' => 'festive', 'name' => 'Traditional Heritage Silver Mala'],
        ];

        foreach ($sections as $sec) {
            $cat = Category::firstOrCreate(['slug' => $sec['cat']], ['name' => ucfirst($sec['cat'])]);
            $sku = 'SKU-' . strtoupper($sec['cat']) . '-' . rand(100, 999);

            $response = $this->actingAs($this->admin)->postJson('/api/admin/products', [
                'sku' => $sku,
                'name' => $sec['name'],
                'category_id' => $cat->id,
                'silver_purity' => '925',
                'silver_weight' => 8.0,
                'making_charge' => 250,
                'making_charge_type' => 'flat',
                'base_price' => 2999,
                'discount_percent' => 5,
                'stock_quantity' => 10,
                'status' => 'active',
                'occasion' => $sec['occ'],
                'image_urls' => ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80'],
                'image_alt_text' => $sec['name'] . ' 925 Silver'
            ]);

            $response->assertStatus(201)->assertJson(['success' => true]);
            $slug = $response->json('data.slug');

            // Public lookup by Slug
            $publicRes = $this->getJson("/api/products/{$slug}");
            $publicRes->assertStatus(200)->assertJson(['success' => true]);
            $this->assertEquals($sec['name'], $publicRes->json('product.name'));
        }

        // Test public filter by Occasion
        $festiveRes = $this->getJson('/api/products?occasion=festive');
        $festiveRes->assertStatus(200)->assertJson(['success' => true]);
        $this->assertGreaterThanOrEqual(2, count($festiveRes->json('products')));
    }
}
