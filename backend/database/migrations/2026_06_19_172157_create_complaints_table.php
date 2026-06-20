<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();

            $table->string('complaint_no', 50)->unique();

            $table->foreignId('citizen_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('category_id')
                ->nullable()
                ->constrained('complaint_categories')
                ->nullOnDelete();

            $table->foreignId('department_id')
                ->nullable()
                ->constrained('departments')
                ->nullOnDelete();

            $table->foreignId('zone_id')
                ->nullable()
                ->constrained('zones')
                ->nullOnDelete();

            $table->string('title', 180);
            $table->text('description');

            $table->string('address', 255);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->enum('priority', ['low', 'medium', 'high', 'critical'])
                ->default('medium');

            $table->enum('status', [
                'submitted',
                'under_review',
                'assigned',
                'in_progress',
                'resolved',
                'rejected',
                'closed',
            ])->default('submitted');

            $table->string('source', 50)->default('web');

            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('sla_due_at')->nullable();
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();

            $table->index(['citizen_id', 'status']);
            $table->index(['department_id', 'status']);
            $table->index(['zone_id', 'status']);
            $table->index(['category_id', 'priority']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};