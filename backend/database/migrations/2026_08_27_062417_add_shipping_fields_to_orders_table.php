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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_email')->nullable()->after('shipping_phone');
            $table->string('fulfillment_method')->default('delivery')->after('shipping_email');
            $table->string('invoice_path')->nullable()->after('fulfillment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_email', 'fulfillment_method', 'invoice_path']);
        });
    }
};
