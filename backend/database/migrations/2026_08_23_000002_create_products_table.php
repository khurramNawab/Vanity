<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('silver_purity')->default('925');
            $table->decimal('silver_weight', 8, 2);
            $table->decimal('making_charge', 8, 2);
            $table->enum('making_charge_type', ['flat', 'percent'])->default('flat');
            $table->decimal('base_price', 10, 2)->nullable();
            $table->decimal('discount_percent', 5, 2)->default(0.00);
            $table->integer('stock_quantity')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_bestseller')->default(false);
            $table->boolean('is_new_arrival')->default(false);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
