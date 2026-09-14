<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sku',
        'name',
        'slug',
        'description',
        'category_id',
        'silver_purity',
        'silver_weight',
        'making_charge',
        'making_charge_type',
        'base_price',
        'discount_percent',
        'stock_quantity',
        'is_featured',
        'is_bestseller',
        'is_new_arrival',
        'status',
    ];

    protected $casts = [
        'silver_weight' => 'decimal:2',
        'making_charge' => 'decimal:2',
        'base_price' => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_bestseller' => 'boolean',
        'is_new_arrival' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true)->withDefault([
            'image_path' => 'https://placehold.co/600x600/FAF9F6/1A1A1A?text=No+Image',
        ]);
    }

    public function primary_image()
    {
        return $this->primaryImage();
    }
}
