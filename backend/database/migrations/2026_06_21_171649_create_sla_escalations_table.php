<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sla_escalations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('complaint_id')
                ->constrained('complaints')
                ->cascadeOnDelete();

            $table->foreignId('escalated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->unsignedInteger('level')->default(1);

            $table->string('reason')->default('sla_overdue');
            $table->text('note')->nullable();

            $table->string('status')->default('open');

            $table->timestamp('escalated_at')->nullable();
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();

            $table->index(['complaint_id', 'status']);
            $table->index(['level', 'status']);
            $table->index(['escalated_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sla_escalations');
    }
};