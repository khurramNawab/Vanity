<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\SilverRate;
use App\Models\Setting;
use App\Models\HeroSlide;
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
        User::create([
            'name' => 'Vanity Admin',
            'email' => 'admin@vanity.com',
            'password' => Hash::make('AdminPass123!'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Demo Customer',
            'email' => 'customer@vanity.com',
            'password' => Hash::make('Password123'),
            'role' => 'customer',
        ]);

        // 2. Seed Categories
        $categories = [
            [
                'name' => 'Silver',
                'slug' => 'silver',
                'description' => 'Pure 925 sterling silver and fine silver jewellery.'
            ],
            [
                'name' => 'Brass',
                'slug' => 'brass',
                'description' => 'Handcrafted brass and oxidised designer ornaments.'
            ],
            [
                'name' => 'Stones',
                'slug' => 'stones',
                'description' => 'Precious & semi-precious stone embedded jewellery.'
            ],
            [
                'name' => 'CZ Diamonds',
                'slug' => 'cz-diamonds',
                'description' => 'Brilliant cubic zirconia diamond embellished ornaments.'
            ],
            [
                'name' => 'Rings',
                'slug' => 'rings',
                'description' => 'Sophisticated and premium silver rings crafted to perfection.'
            ],
            [
                'name' => 'Necklaces',
                'slug' => 'necklaces',
                'description' => 'Exquisite silver neckpieces and chains for all occasions.'
            ],
            [
                'name' => 'Bracelets',
                'slug' => 'bracelets',
                'description' => 'Elegantly structured bracelets and cuffs.'
            ],
            [
                'name' => 'Earrings',
                'slug' => 'earrings',
                'description' => 'Beautiful drop, stud, and hoop earrings in 925 sterling silver.'
            ],
        ];

        $categoryModels = [];
        foreach ($categories as $cat) {
            $categoryModels[$cat['slug']] = Category::create($cat);
        }

        // 3. Seed Products
        $products = [
            [
                'sku' => 'VNT-RNG-001',
                'name' => 'Classic Solitaire Ring',
                'slug' => 'classic-solitaire-ring',
                'description' => 'A timeless 925 sterling silver solitaire ring featuring a brilliant CZ diamond center stone. Perfectly crafted for everyday elegance or special statements.',
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
                'images' => [
                    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
                ],
            ],
            [
                'sku' => 'VNT-NEC-002',
                'name' => 'Royal Heritage Necklace',
                'slug' => 'royal-heritage-necklace',
                'description' => 'An editorial royal heritage necklace featuring intricate traditional carvings and vintage polish. The ultimate modern heirloom.',
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
                'images' => [
                    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
                ],
            ],
            [
                'sku' => 'VNT-BRC-003',
                'name' => 'Infinity Silver Bracelet',
                'slug' => 'infinity-silver-bracelet',
                'description' => 'A clean and sleek infinity-themed silver cuff bracelet with high catalog density styling. Features a secure buckle.',
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
                'images' => [
                    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80',
                ],
            ],
            [
                'sku' => 'VNT-EAR-004',
                'name' => 'Elegant Pearl Drop Earrings',
                'slug' => 'elegant-pearl-drop-earrings',
                'description' => 'Graceful drop earrings utilizing AAA grade fresh water pearls suspended from a polished 925 silver setting.',
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
                'images' => [
                    'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
                ],
            ],
            [
                'sku' => 'VNT-NEC-005',
                'name' => 'Vintage Filigree Choker',
                'slug' => 'vintage-filigree-choker',
                'description' => 'An exquisite filigree choker in antiqued sterling silver, meticulously hand-crafted in Kolkata.',
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
                'images' => [
                    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
                ],
            ],
            [
                'sku' => 'VNT-EAR-006',
                'name' => 'CZ Diamond Studs',
                'slug' => 'cz-diamond-studs',
                'description' => 'Brilliant CZ diamond studs set in polished sterling silver settings for daily sophistication.',
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
                'images' => [
                    'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=600&q=80',
                ],
            ],
            [
                'sku' => 'VNT-BRC-007',
                'name' => 'Silver Kada/Cuff',
                'slug' => 'silver-kada-cuff',
                'description' => 'A traditional silver Kada/Cuff bracelet featuring detailed engravings. Perfectly pairs with ethnics.',
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
                'images' => [
                    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80',
                ],
            ],
            [
                'sku' => 'VNT-RNG-008',
                'name' => 'Emerald Blossom Ring',
                'slug' => 'emerald-blossom-ring',
                'description' => 'An eye-catching ring featuring a green emerald stimulant stone surrounded by CZ crystals.',
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
                'images' => [
                    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80',
                ],
            ],
            [
                'sku' => 'VNT-NEC-009',
                'name' => 'Sapphire Drop Pendant',
                'slug' => 'sapphire-drop-pendant',
                'description' => 'A royal sapphire blue pendant suspended on a fine sterling silver chain.',
                'category_id' => $categoryModels['necklaces']->id,
                'silver_purity' => '925',
                'silver_weight' => 9.50,
                'making_charge' => 550.00,
                'making_charge_type' => 'flat',
                'base_price' => 2800.00,
                'discount_percent' => 10.00,
                'stock_quantity' => 18,
                'is_featured' => false,
                'is_bestseller' => true,
                'is_new_arrival' => false,
                'status' => 'active',
                'images' => [
                    'https://images.unsplash.com/photo-1602752275313-477eaabc497c?auto=format&fit=crop&w=600&q=80',
                ],
            ],
            [
                'sku' => 'VNT-EAR-010',
                'name' => 'Aura Hoops',
                'slug' => 'aura-hoops',
                'description' => 'Classic huggie hoops in sterling silver with an outer layer of sparkling pavé crystals.',
                'category_id' => $categoryModels['earrings']->id,
                'silver_purity' => '925',
                'silver_weight' => 4.20,
                'making_charge' => 250.00,
                'making_charge_type' => 'flat',
                'base_price' => 1350.00,
                'discount_percent' => 0.00,
                'stock_quantity' => 25,
                'is_featured' => false,
                'is_bestseller' => false,
                'is_new_arrival' => true,
                'status' => 'active',
                'images' => [
                    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
                ],
            ],
            [
                'sku' => 'VNT-BRC-011',
                'name' => 'Linked Silver Bracelet',
                'slug' => 'linked-silver-bracelet',
                'description' => 'A classic linked silver chain bracelet suitable for everyday styling or stacking.',
                'category_id' => $categoryModels['bracelets']->id,
                'silver_purity' => '925',
                'silver_weight' => 11.20,
                'making_charge' => 500.00,
                'making_charge_type' => 'flat',
                'base_price' => 3100.00,
                'discount_percent' => 5.00,
                'stock_quantity' => 15,
                'is_featured' => false,
                'is_bestseller' => true,
                'is_new_arrival' => false,
                'status' => 'active',
                'images' => [
                    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=600&q=80',
                ],
            ],
            [
                'sku' => 'VNT-RNG-012',
                'name' => 'Minimalist Band Ring',
                'slug' => 'minimalist-band-ring',
                'description' => 'A sleek, high-polished simple silver band perfect for minimalist daily wear.',
                'category_id' => $categoryModels['rings']->id,
                'silver_purity' => '925',
                'silver_weight' => 3.20,
                'making_charge' => 150.00,
                'making_charge_type' => 'flat',
                'base_price' => 950.00,
                'discount_percent' => 0.00,
                'stock_quantity' => 30,
                'is_featured' => false,
                'is_bestseller' => false,
                'is_new_arrival' => false,
                'status' => 'active',
                'images' => [
                    'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=600&q=80',
                ],
            ],
        ];

        foreach ($products as $prod) {
            $images = $prod['images'];
            unset($prod['images']);
            $productModel = Product::create($prod);

            foreach ($images as $index => $img) {
                ProductImage::create([
                    'product_id' => $productModel->id,
                    'image_path' => $img,
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }

        // 4. Seed Silver Rate (₹120/gram as initial)
        SilverRate::create([
            'rate_per_gram' => 120.00,
            'source' => 'api',
            'source_detail' => 'MCX Live Silver Rate',
            'status' => 'open',
        ]);

        // 5. Seed Core Settings
        $settings = [
            'brand_name' => 'Vanity',
            'tax_gst_percent' => '3', // 3% GST standard on silver jewellery in India
            'shipping_fee' => '150',
            'free_shipping_threshold' => '2999',
            'signup_discount_percent' => '10',
            'silver_rate_api_provider' => 'dummy',
            'silver_rate_refresh_minutes' => '60',
            'silver_rate_manual_override' => '0',
            'silver_rate_manual_value' => '120.00',
        ];

        foreach ($settings as $key => $val) {
            Setting::setValue($key, $val);
        }

        // Social link settings
        Setting::setValue('social_instagram', 'https://www.instagram.com/thevanityjewelskol/');
        Setting::setValue('social_facebook', 'https://www.facebook.com/profile.php?id=6159373665164');
        Setting::setValue('social_linkedin', 'https://www.linkedin.com/company/the-vanity-jewels');
        Setting::setValue('social_email', 'mailto:thevanityjewels@gmail.com');
        Setting::setValue('whatsapp_number', '919876543210');

        // 6b. Seed Default Hero Slides
        HeroSlide::create([
            'image_path' => 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1920&q=85',
            'headline' => 'Online jewellery shopping in Kolkata',
            'subtext' => 'Silver, brass, precious & semi-precious stone jewellery with CZ diamonds — delivered across Kolkata and West Bengal.',
            'cta_text' => 'Shop now',
            'cta_link' => '/shop',
            'sort_order' => 0,
            'is_active' => true,
        ]);
        HeroSlide::create([
            'image_path' => 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1920&q=85',
            'headline' => 'The Festive Edit — Now Live',
            'subtext' => 'Discover handcrafted silver ornaments for every occasion. BIS Hallmarked 925 Sterling Silver.',
            'cta_text' => 'Explore Collection',
            'cta_link' => '/collections',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // 6. Seed Default Coupons
        \App\Models\Coupon::create([
            'code' => 'VANITY10',
            'type' => 'percent',
            'value' => 10.00,
            'min_order_value' => 500.00,
            'max_discount' => 2000.00,
            'expiry_date' => now()->addYears(2),
            'usage_limit' => 10000,
            'usage_count' => 0,
            'status' => 'active',
        ]);
    }
}
