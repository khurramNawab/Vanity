<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\SilverRate;
use App\Models\Setting;
use App\Models\HeroSlide;
use App\Models\Coupon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Users
        User::updateOrCreate(
            ['email' => 'admin@vanity.com'],
            [
                'name' => 'Vanity Admin',
                'password' => Hash::make('AdminPass123!'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'customer@vanity.com'],
            [
                'name' => 'Demo Customer',
                'password' => Hash::make('Password123'),
                'role' => 'customer',
            ]
        );

        // 2. Seed Categories
        $categories = [
            ['name' => 'Silver', 'slug' => 'silver', 'description' => 'Pure 925 sterling silver and fine silver jewellery.'],
            ['name' => 'Brass', 'slug' => 'brass', 'description' => 'Handcrafted brass and oxidised designer ornaments.'],
            ['name' => 'Stones', 'slug' => 'stones', 'description' => 'Precious & semi-precious stone embedded jewellery.'],
            ['name' => 'CZ Diamonds', 'slug' => 'cz-diamonds', 'description' => 'Brilliant cubic zirconia diamond embellished ornaments.'],
            ['name' => 'Rings', 'slug' => 'rings', 'description' => 'Sophisticated and premium silver rings crafted to perfection.'],
            ['name' => 'Necklaces', 'slug' => 'necklaces', 'description' => 'Exquisite silver neckpieces and chains for all occasions.'],
            ['name' => 'Bracelets', 'slug' => 'bracelets', 'description' => 'Elegantly structured bracelets and cuffs.'],
            ['name' => 'Earrings', 'slug' => 'earrings', 'description' => 'Beautiful drop, stud, and hoop earrings in 925 sterling silver.'],
        ];

        $categoryModels = [];
        foreach ($categories as $cat) {
            $categoryModels[$cat['slug']] = Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        // 3. Seed Products
        $products = [
            [
                'sku' => 'VNT-RNG-001',
                'name' => 'Classic Solitaire Ring',
                'slug' => 'classic-solitaire-ring',
                'description' => 'A timeless 925 sterling silver solitaire ring featuring a brilliant CZ diamond center stone.',
                'category_id' => $categoryModels['rings']->id,
                'silver_purity' => '925',
                'silver_weight' => 4.50,
                'making_charge' => 300.00,
                'making_charge_type' => 'flat',
                'base_price' => 1500.00,
                'discount_percent' => 10.00,
                'stock_quantity' => 25,
                'is_featured' => true,
                'is_bestseller' => false,
                'is_new_arrival' => true,
                'status' => 'active',
                'images' => ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80'],
            ],
            [
                'sku' => 'VNT-NEC-002',
                'name' => 'Royal Heritage Necklace',
                'slug' => 'royal-heritage-necklace',
                'description' => 'An editorial royal heritage necklace featuring intricate traditional carvings.',
                'category_id' => $categoryModels['necklaces']->id,
                'silver_purity' => '925',
                'silver_weight' => 22.00,
                'making_charge' => 1200.00,
                'making_charge_type' => 'flat',
                'base_price' => 6000.00,
                'discount_percent' => 15.00,
                'stock_quantity' => 10,
                'is_featured' => true,
                'is_bestseller' => true,
                'is_new_arrival' => false,
                'status' => 'active',
                'images' => ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'],
            ],
            [
                'sku' => 'VNT-BRC-003',
                'name' => 'Infinity Silver Bracelet',
                'slug' => 'infinity-silver-bracelet',
                'description' => 'A clean and sleek infinity-themed silver cuff bracelet.',
                'category_id' => $categoryModels['bracelets']->id,
                'silver_purity' => '925',
                'silver_weight' => 12.50,
                'making_charge' => 600.00,
                'making_charge_type' => 'flat',
                'base_price' => 3500.00,
                'discount_percent' => 0.00,
                'stock_quantity' => 15,
                'is_featured' => false,
                'is_bestseller' => true,
                'is_new_arrival' => false,
                'status' => 'active',
                'images' => ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80'],
            ],
            [
                'sku' => 'VNT-EAR-004',
                'name' => 'Elegant Pearl Drop Earrings',
                'slug' => 'elegant-pearl-drop-earrings',
                'description' => 'Graceful drop earrings utilizing AAA grade fresh water pearls in 925 silver.',
                'category_id' => $categoryModels['earrings']->id,
                'silver_purity' => '925',
                'silver_weight' => 8.20,
                'making_charge' => 450.00,
                'making_charge_type' => 'flat',
                'base_price' => 2200.00,
                'discount_percent' => 20.00,
                'stock_quantity' => 30,
                'is_featured' => false,
                'is_bestseller' => false,
                'is_new_arrival' => true,
                'status' => 'active',
                'images' => ['https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80'],
            ],
            [
                'sku' => 'VNT-NEC-005',
                'name' => 'Vintage Filigree Choker',
                'slug' => 'vintage-filigree-choker',
                'description' => 'An exquisite filigree choker in antiqued sterling silver.',
                'category_id' => $categoryModels['necklaces']->id,
                'silver_purity' => '925',
                'silver_weight' => 18.00,
                'making_charge' => 950.00,
                'making_charge_type' => 'flat',
                'base_price' => 4800.00,
                'discount_percent' => 10.00,
                'stock_quantity' => 8,
                'is_featured' => true,
                'is_bestseller' => true,
                'is_new_arrival' => true,
                'status' => 'active',
                'images' => ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'],
            ],
            [
                'sku' => 'VNT-EAR-006',
                'name' => 'CZ Diamond Studs',
                'slug' => 'cz-diamond-studs',
                'description' => 'Brilliant CZ diamond studs set in polished sterling silver settings.',
                'category_id' => $categoryModels['earrings']->id,
                'silver_purity' => '925',
                'silver_weight' => 3.50,
                'making_charge' => 200.00,
                'making_charge_type' => 'flat',
                'base_price' => 1100.00,
                'discount_percent' => 5.00,
                'stock_quantity' => 40,
                'is_featured' => false,
                'is_bestseller' => true,
                'is_new_arrival' => true,
                'status' => 'active',
                'images' => ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=600&q=80'],
            ],
            [
                'sku' => 'VNT-BRC-007',
                'name' => 'Silver Kada/Cuff',
                'slug' => 'silver-kada-cuff',
                'description' => 'A traditional silver Kada/Cuff bracelet featuring detailed engravings.',
                'category_id' => $categoryModels['bracelets']->id,
                'silver_purity' => '999',
                'silver_weight' => 24.50,
                'making_charge' => 1100.00,
                'making_charge_type' => 'flat',
                'base_price' => 5500.00,
                'discount_percent' => 8.00,
                'stock_quantity' => 12,
                'is_featured' => true,
                'is_bestseller' => false,
                'is_new_arrival' => false,
                'status' => 'active',
                'images' => ['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80'],
            ],
            [
                'sku' => 'VNT-RNG-008',
                'name' => 'Emerald Blossom Ring',
                'slug' => 'emerald-blossom-ring',
                'description' => 'An eye-catching ring featuring a green emerald stimulant stone.',
                'category_id' => $categoryModels['rings']->id,
                'silver_purity' => '925',
                'silver_weight' => 5.20,
                'making_charge' => 400.00,
                'making_charge_type' => 'flat',
                'base_price' => 1950.00,
                'discount_percent' => 15.00,
                'stock_quantity' => 20,
                'is_featured' => true,
                'is_bestseller' => true,
                'is_new_arrival' => true,
                'status' => 'active',
                'images' => ['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80'],
            ],
        ];

        foreach ($products as $prod) {
            $images = $prod['images'];
            unset($prod['images']);
            $productModel = Product::firstOrCreate(['sku' => $prod['sku']], $prod);

            foreach ($images as $index => $img) {
                ProductImage::firstOrCreate(
                    ['product_id' => $productModel->id, 'image_path' => $img],
                    ['is_primary' => $index === 0, 'sort_order' => $index]
                );
            }
        }

        // 4. Seed Silver Rate
        SilverRate::firstOrCreate(
            ['status' => 'open'],
            [
                'rate_per_gram' => 120.00,
                'source' => 'api',
                'source_detail' => 'MCX Live Silver Rate',
            ]
        );

        // 5. Seed Core Settings
        $settings = [
            'brand_name' => 'Vanity',
            'tax_gst_percent' => '3',
            'shipping_fee' => '150',
            'free_shipping_threshold' => '2999',
            'signup_discount_percent' => '10',
            'silver_rate_api_provider' => 'dummy',
            'silver_rate_refresh_minutes' => '60',
            'silver_rate_manual_override' => '0',
            'silver_rate_manual_value' => '120.00',
            'social_instagram' => 'https://www.instagram.com/thevanityjewelskol/',
            'social_facebook' => 'https://www.facebook.com/profile.php?id=6159373665164',
            'social_linkedin' => 'https://www.linkedin.com/company/the-vanity-jewels',
            'social_email' => 'mailto:thevanityjewels@gmail.com',
            'whatsapp_number' => '919876543210',
            'store_address' => 'Padmini Apartment 44/19 Durgapur Lane Kala Bagan, Chetla, Kolkata 700027',
            'contact_address' => 'Padmini Apartment 44/19 Durgapur Lane Kala Bagan, Chetla, Kolkata 700027',
            'contact_email' => 'thevanityjewels@gmail.com',
            'contact_phone' => '+91 98765 43210',
        ];

        foreach ($settings as $key => $val) {
            Setting::setValue($key, $val);
        }

        // 6. Seed Default Hero Slides
        HeroSlide::firstOrCreate(
            ['headline' => 'Online jewellery shopping in Kolkata'],
            [
                'image_path' => 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1920&q=85',
                'subtext' => 'Silver, brass, precious & semi-precious stone jewellery with CZ diamonds — delivered across Kolkata and West Bengal.',
                'cta_text' => 'Shop now',
                'cta_link' => '/shop',
                'sort_order' => 0,
                'is_active' => true,
            ]
        );
        HeroSlide::firstOrCreate(
            ['headline' => 'The Festive Edit — Now Live'],
            [
                'image_path' => 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1920&q=85',
                'subtext' => 'Discover handcrafted silver ornaments for every occasion. BIS Hallmarked 925 Sterling Silver.',
                'cta_text' => 'Explore Collection',
                'cta_link' => '/collections',
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        // 7. Seed Default Coupon
        Coupon::firstOrCreate(
            ['code' => 'VANITY10'],
            [
                'type' => 'percent',
                'value' => 10.00,
                'min_order_value' => 500.00,
                'max_discount' => 2000.00,
                'expiry_date' => now()->addYears(2),
                'usage_limit' => 10000,
                'usage_count' => 0,
                'status' => 'active',
            ]
        );
    }
}
