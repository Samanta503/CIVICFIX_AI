<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 30)->nullable()->after('email');

            $table->foreignId('role_id')
                ->nullable()
                ->after('password')
                ->constrained('roles')
                ->nullOnDelete();

            $table->foreignId('department_id')
                ->nullable()
                ->after('role_id')
                ->constrained('departments')
                ->nullOnDelete();

            $table->foreignId('zone_id')
                ->nullable()
                ->after('department_id')
                ->constrained('zones')
                ->nullOnDelete();

            $table->enum('status', ['active', 'inactive', 'suspended', 'pending'])
                ->default('active')
                ->after('zone_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropForeign(['department_id']);
            $table->dropForeign(['zone_id']);

            $table->dropColumn([
                'phone',
                'role_id',
                'department_id',
                'zone_id',
                'status',
            ]);
        });
    }
};