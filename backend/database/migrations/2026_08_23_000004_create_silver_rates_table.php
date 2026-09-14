<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('silver_rates', function (Blueprint $table) {
            $table->id();
            $table->decimal('rate_per_gram', 8, 2);
            $table->enum('source', ['api', 'manual'])->default('api');
            $table->string('source_detail')->nullable();
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('silver_rates');
    }
};
