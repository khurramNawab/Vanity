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
        if (!Schema::hasTable('appointments')) {
            Schema::create('appointments', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('phone');
                $table->string('email')->nullable();
                $table->date('preferred_date')->nullable();
                $table->string('time_slot')->nullable();
                $table->string('consultation_type')->default('video_call'); // video_call, in_store, custom_design
                $table->string('jewelry_interest')->nullable(); // personalized silver, bridal, rings, etc.
                $table->text('notes')->nullable();
                $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
