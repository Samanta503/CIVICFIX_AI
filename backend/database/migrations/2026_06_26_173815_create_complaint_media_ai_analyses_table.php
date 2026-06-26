<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaint_media_ai_analyses', function (Blueprint $table) {
            $table->id();

            $table->foreignId('complaint_id')
                ->constrained('complaints')
                ->cascadeOnDelete();

            $table->foreignId('complaint_media_id')
                ->constrained('complaint_media')
                ->cascadeOnDelete();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('reviewed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('model_name')->default('local-image-analyzer-v1');

            $table->string('detected_issue_type')->nullable();
            $table->enum('visual_severity', ['low', 'medium', 'high', 'critical'])
                ->default('medium');

            $table->decimal('confidence_score', 5, 2)->default(0);
            $table->decimal('quality_score', 5, 2)->default(0);

            $table->unsignedInteger('image_width')->nullable();
            $table->unsignedInteger('image_height')->nullable();
            $table->unsignedBigInteger('file_size_bytes')->nullable();
            $table->string('mime_type')->nullable();

            $table->text('analysis_summary')->nullable();
            $table->text('safety_observations')->nullable();

            $table->json('matched_visual_clues')->nullable();
            $table->json('recommendations')->nullable();
            $table->json('raw_output')->nullable();

            $table->enum('status', ['pending', 'reviewed', 'ignored'])
                ->default('pending');

            $table->text('review_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();

            $table->unique('complaint_media_id', 'media_ai_analysis_unique');
            $table->index('complaint_id');
            $table->index('detected_issue_type');
            $table->index('visual_severity');
            $table->index('confidence_score');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_media_ai_analyses');
    }
};