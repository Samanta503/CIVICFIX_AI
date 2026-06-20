<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->foreignId('assigned_officer_id')
                ->nullable()
                ->after('zone_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('assigned_by')
                ->nullable()
                ->after('assigned_officer_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('assigned_at')
                ->nullable()
                ->after('assigned_by');

            $table->index(['assigned_officer_id', 'status']);
            $table->index(['assigned_by', 'assigned_at']);
        });
    }

    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropForeign(['assigned_officer_id']);
            $table->dropForeign(['assigned_by']);

            $table->dropIndex(['assigned_officer_id', 'status']);
            $table->dropIndex(['assigned_by', 'assigned_at']);

            $table->dropColumn([
                'assigned_officer_id',
                'assigned_by',
                'assigned_at',
            ]);
        });
    }
};