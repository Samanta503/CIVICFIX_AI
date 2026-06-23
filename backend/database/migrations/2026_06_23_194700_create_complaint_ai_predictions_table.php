<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaint_ai_predictions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('complaint_id')
                ->nullable()
                ->constrained('complaints')
                ->cascadeOnDelete();

            $table->foreignId('predicted_category_id')
                ->nullable()
                ->constrained('complaint_categories')
                ->nullOnDelete();

            $table->foreignId('predicted_department_id')
                ->nullable()
                ->constrained('departments')
                ->nullOnDelete();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('reviewed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('model_name')->default('local-ai-classifier-v1');

            $table->string('input_title')->nullable();
            $table->text('input_description')->nullable();
            $table->text('input_address')->nullable();

            $table->string('predicted_priority')->nullable();
            $table->decimal('confidence_score', 5, 2)->default(0);

            $table->text('predicted_summary')->nullable();
            $table->text('reasoning')->nullable();

            $table->json('matched_keywords')->nullable();
            $table->json('raw_output')->nullable();

            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();

            $table->unique('complaint_id');
            $table->index('predicted_priority');
            $table->index('confidence_score');
            $table->index('model_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_ai_predictions');
    }
};