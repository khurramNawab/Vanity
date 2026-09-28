<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

class AdminSectionsTest extends TestCase
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

    public function test_admin_dashboard_kpis()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/admin/dashboard');
        $response->assertStatus(200)->assertJson(['success' => true]);
    }

    public function test_admin_products_crud()
    {
        $cat = Category::firstOrCreate(['slug' => 'test-cat'], ['name' => 'Test Category']);
        
        $sku = 'TEST-' . uniqid();
        $createRes = $this->actingAs($this->admin)->postJson('/api/admin/products', [
            'sku' => $sku,
            'name' => 'Feature Test Product',
            'category_id' => $cat->id,
            'silver_purity' => '925',
            'silver_weight' => 10.5,
            'making_charge' => 300,
            'making_charge_type' => 'flat',
            'base_price' => 2500,
            'discount_percent' => 5,
            'stock_quantity' => 20,
            'status' => 'active'
        ]);

        $createRes->assertStatus(201)->assertJson(['success' => true]);
        $id = $createRes->json('data.id');

        $this->actingAs($this->admin)->getJson('/api/admin/products/' . $id)
            ->assertStatus(200)->assertJson(['success' => true]);

        $this->actingAs($this->admin)->deleteJson('/api/admin/products/' . $id)
            ->assertStatus(200)->assertJson(['success' => true]);
    }

    public function test_admin_settings_pinterest()
    {
        $response = $this->actingAs($this->admin)->postJson('/api/admin/settings', [
            'settings' => [
                'social_pinterest' => 'https://pin.it/Cnrv2arp6'
            ]
        ]);
        $response->assertStatus(200)->assertJson(['success' => true]);

        $publicRes = $this->getJson('/api/settings/public');
        $publicRes->assertStatus(200)->assertJsonPath('settings.social_pinterest', 'https://pin.it/Cnrv2arp6');
    }
}
