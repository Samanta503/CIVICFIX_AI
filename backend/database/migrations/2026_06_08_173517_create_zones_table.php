<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zones', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('ward_number', 50)->nullable()->index();
            $table->string('city', 100)->default('Dhaka');
            $table->longText('boundary_geojson')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            $table->unique(['name', 'city']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('zones');
    }
};