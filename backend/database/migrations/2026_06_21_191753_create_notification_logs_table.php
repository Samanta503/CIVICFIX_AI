<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('sender_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('complaint_id')
                ->nullable()
                ->constrained('complaints')
                ->nullOnDelete();

            $table->string('type')->default('system');
            $table->string('channel')->default('database');

            $table->string('title');
            $table->text('message');

            $table->string('action_url')->nullable();

            $table->string('email_to')->nullable();
            $table->string('email_status')->default('pending');
            $table->text('failure_reason')->nullable();

            $table->json('meta')->nullable();

            $table->timestamp('read_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('failed_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'read_at']);
            $table->index(['type']);
            $table->index(['email_status']);
            $table->index(['complaint_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};