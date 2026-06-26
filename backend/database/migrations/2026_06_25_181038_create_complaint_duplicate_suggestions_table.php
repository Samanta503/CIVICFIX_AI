<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaint_duplicate_suggestions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('source_complaint_id')
                ->constrained('complaints')
                ->cascadeOnDelete();

            $table->foreignId('matched_complaint_id')
                ->constrained('complaints')
                ->cascadeOnDelete();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('reviewed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('model_name')->default('local-duplicate-detector-v1');

            $table->decimal('similarity_score', 5, 2)->default(0);
            $table->decimal('text_similarity_score', 5, 2)->default(0);
            $table->decimal('location_similarity_score', 5, 2)->default(0);
            $table->decimal('category_similarity_score', 5, 2)->default(0);

            $table->decimal('distance_meters', 10, 2)->nullable();

            $table->json('matched_reasons')->nullable();
            $table->json('raw_output')->nullable();

            $table->enum('status', ['pending', 'confirmed', 'rejected', 'ignored'])
                ->default('pending');

            $table->text('review_note')->nullable();

            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();

            $table->unique(['source_complaint_id', 'matched_complaint_id'], 'duplicate_source_match_unique');

            $table->index('similarity_score');
            $table->index('status');
            $table->index('model_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_duplicate_suggestions');
    }
};