<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaint_feedback', function (Blueprint $table) {
            $table->id();

            $table->foreignId('complaint_id')
                ->constrained('complaints')
                ->cascadeOnDelete();

            $table->foreignId('citizen_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('rating');

            $table->string('response_quality')->nullable();

            $table->boolean('issue_resolved')->default(true);

            $table->text('comment')->nullable();

            $table->timestamp('submitted_at')->nullable();

            $table->timestamps();

            $table->unique(['complaint_id', 'citizen_id']);
            $table->index(['rating']);
            $table->index(['response_quality']);
            $table->index(['issue_resolved']);
            $table->index(['submitted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_feedback');
    }
};