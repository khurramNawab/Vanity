<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('order_number')->unique();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('making_charge_total', 10, 2);
            $table->decimal('discount_total', 10, 2);
            $table->string('coupon_code')->nullable();
            $table->decimal('gst_amount', 10, 2);
            $table->decimal('shipping_amount', 10, 2);
            $table->decimal('total_amount', 10, 2);
            $table->decimal('silver_rate_used', 8, 2);
            $table->string('payment_status')->default('pending');
            $table->string('order_status')->default('pending');
            $table->string('razorpay_order_id')->nullable()->unique();
            $table->string('razorpay_payment_id')->nullable()->unique();
            
            // Shipping details
            $table->string('shipping_name');
            $table->string('shipping_address');
            $table->string('shipping_apartment')->nullable();
            $table->string('shipping_city');
            $table->string('shipping_state');
            $table->string('shipping_zip');
            $table->string('shipping_phone');
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
