<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Throwable;

class HealthService
{
    public function getStatus(): array
    {
        return [
            'application' => $this->getApplicationStatus(),
            'database' => $this->getDatabaseStatus(),
            'timestamp' => now()->toDateTimeString(),
        ];
    }

    private function getApplicationStatus(): array
    {
        return [
            'status' => 'ok',
            'name' => config('civicfix.name'),
            'version' => config('civicfix.version'),
            'environment' => app()->environment(),
            'timezone' => config('app.timezone'),
        ];
    }

    private function getDatabaseStatus(): array
    {
        try {
            DB::connection()->getPdo();

            return [
                'status' => 'connected',
                'connection' => config('database.default'),
            ];
        } catch (Throwable $exception) {
            return [
                'status' => 'not_connected',
                'connection' => config('database.default'),
                'message' => app()->environment('local')
                    ? $exception->getMessage()
                    : 'Database connection failed.',
            ];
        }
    }
}
