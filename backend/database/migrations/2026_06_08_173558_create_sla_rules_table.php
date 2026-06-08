<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sla_rules', function (Blueprint $table) {
            $table->id();

            $table->foreignId('category_id')
                ->constrained('complaint_categories')
                ->cascadeOnDelete();

            $table->enum('priority', ['low', 'medium', 'high', 'critical']);

            $table->unsignedSmallInteger('sla_hours');
            $table->unsignedSmallInteger('escalation_hours');

            $table->enum('status', ['active', 'inactive'])->default('active');

            $table->timestamps();

            $table->unique(['category_id', 'priority']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sla_rules');
    }
};