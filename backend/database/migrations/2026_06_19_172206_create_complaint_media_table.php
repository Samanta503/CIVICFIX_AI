<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaint_media', function (Blueprint $table) {
            $table->id();

            $table->foreignId('complaint_id')
                ->constrained('complaints')
                ->cascadeOnDelete();

            $table->foreignId('uploaded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->enum('media_type', ['image', 'video', 'document'])
                ->default('image');

            $table->string('file_disk', 50)->default('public');
            $table->string('file_path', 500);
            $table->string('file_url', 500)->nullable();

            $table->string('original_name', 255)->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();

            $table->timestamps();

            $table->index(['complaint_id', 'media_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_media');
    }
};