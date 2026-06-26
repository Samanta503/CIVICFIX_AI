<?php

namespace App\Services;

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class DeploymentReadinessService
{
    public function buildReport(): array
    {
        $checks = [];

        $checks[] = $this->checkAppKey();
        $checks[] = $this->checkAppDebug();
        $checks[] = $this->checkAppUrl();
        $checks[] = $this->checkDatabaseConnection();
        $checks[] = $this->checkCoreTables();
        $checks[] = $this->checkAiTables();
        $checks[] = $this->checkStorage();
        $checks[] = $this->checkCache();
        $checks[] = $this->checkQueueConfig();
        $checks[] = $this->checkMailConfig();

        $summary = $this->makeSummary($checks);

        return [
            'generated_at' => now()->toISOString(),
            'environment' => [
                'app_name' => Config::get('app.name'),
                'app_env' => Config::get('app.env'),
                'app_debug' => (bool) Config::get('app.debug'),
                'app_url' => Config::get('app.url'),
                'frontend_url' => env('FRONTEND_URL', null),
                'php_version' => PHP_VERSION,
                'laravel_version' => App::version(),
                'timezone' => Config::get('app.timezone'),
            ],
            'summary' => $summary,
            'checks' => $checks,
            'deployment_commands' => $this->deploymentCommands(),
            'recommended_next_steps' => $this->recommendedNextSteps($summary),
        ];
    }

    private function checkAppKey(): array
    {
        $appKey = Config::get('app.key');

        return $this->makeCheck(
            key: 'app_key',
            title: 'Application key',
            status: $appKey ? 'pass' : 'fail',
            message: $appKey
                ? 'APP_KEY is configured.'
                : 'APP_KEY is missing. Run php artisan key:generate.',
            severity: $appKey ? 'low' : 'critical'
        );
    }

    private function checkAppDebug(): array
    {
        $env = Config::get('app.env');
        $debug = (bool) Config::get('app.debug');

        if ($env === 'production' && $debug) {
            return $this->makeCheck(
                key: 'app_debug',
                title: 'Debug mode',
                status: 'fail',
                message: 'APP_DEBUG is true in production. Set APP_DEBUG=false before deployment.',
                severity: 'critical'
            );
        }

        if ($debug) {
            return $this->makeCheck(
                key: 'app_debug',
                title: 'Debug mode',
                status: 'warning',
                message: 'APP_DEBUG is currently true. This is okay locally, but must be false in production.',
                severity: 'medium'
            );
        }

        return $this->makeCheck(
            key: 'app_debug',
            title: 'Debug mode',
            status: 'pass',
            message: 'APP_DEBUG is false.',
            severity: 'low'
        );
    }

    private function checkAppUrl(): array
    {
        $appUrl = Config::get('app.url');

        return $this->makeCheck(
            key: 'app_url',
            title: 'Application URL',
            status: $appUrl ? 'pass' : 'warning',
            message: $appUrl
                ? "APP_URL is configured as {$appUrl}."
                : 'APP_URL is missing. Set it before deployment.',
            severity: $appUrl ? 'low' : 'medium'
        );
    }

    private function checkDatabaseConnection(): array
    {
        try {
            DB::connection()->getPdo();

            return $this->makeCheck(
                key: 'database_connection',
                title: 'Database connection',
                status: 'pass',
                message: 'Database connection is working.',
                severity: 'low'
            );
        } catch (\Throwable $e) {
            return $this->makeCheck(
                key: 'database_connection',
                title: 'Database connection',
                status: 'fail',
                message: 'Database connection failed: ' . $e->getMessage(),
                severity: 'critical'
            );
        }
    }

    private function checkCoreTables(): array
    {
        $tables = [
            'users',
            'roles',
            'departments',
            'zones',
            'complaint_categories',
            'complaints',
            'complaint_media',
            'complaint_status_histories',
            'notification_logs',
            'sla_rules',
            'sla_escalations',
            'complaint_feedback',
        ];

        return $this->checkTables(
            key: 'core_tables',
            title: 'Core database tables',
            tables: $tables
        );
    }

    private function checkAiTables(): array
    {
        $tables = [
            'complaint_ai_predictions',
            'complaint_duplicate_suggestions',
            'complaint_media_ai_analyses',
        ];

        return $this->checkTables(
            key: 'ai_tables',
            title: 'AI database tables',
            tables: $tables
        );
    }

    private function checkTables(string $key, string $title, array $tables): array
    {
        try {
            $missing = [];
            $available = [];

            foreach ($tables as $table) {
                if (Schema::hasTable($table)) {
                    $available[] = [
                        'table' => $table,
                        'rows' => DB::table($table)->count(),
                    ];
                } else {
                    $missing[] = $table;
                }
            }

            if (count($missing) > 0) {
                return $this->makeCheck(
                    key: $key,
                    title: $title,
                    status: 'fail',
                    message: 'Missing table(s): ' . implode(', ', $missing),
                    severity: 'critical',
                    meta: [
                        'available' => $available,
                        'missing' => $missing,
                    ]
                );
            }

            return $this->makeCheck(
                key: $key,
                title: $title,
                status: 'pass',
                message: 'All required tables are available.',
                severity: 'low',
                meta: [
                    'available' => $available,
                    'missing' => [],
                ]
            );
        } catch (\Throwable $e) {
            return $this->makeCheck(
                key: $key,
                title: $title,
                status: 'fail',
                message: 'Could not check tables: ' . $e->getMessage(),
                severity: 'critical'
            );
        }
    }

    private function checkStorage(): array
    {
        try {
            $testFile = 'deployment-readiness-test.txt';

            Storage::disk('public')->put($testFile, 'CivicFix AI deployment readiness test.');
            $exists = Storage::disk('public')->exists($testFile);
            Storage::disk('public')->delete($testFile);

            $publicStoragePath = public_path('storage');
            $publicStorageExists = is_link($publicStoragePath) || is_dir($publicStoragePath);

            if (!$exists) {
                return $this->makeCheck(
                    key: 'storage',
                    title: 'Storage write access',
                    status: 'fail',
                    message: 'Storage public disk is not writable.',
                    severity: 'critical'
                );
            }

            if (!$publicStorageExists) {
                return $this->makeCheck(
                    key: 'storage',
                    title: 'Storage write access',
                    status: 'warning',
                    message: 'Storage is writable, but public storage link may be missing. Run php artisan storage:link.',
                    severity: 'medium'
                );
            }

            return $this->makeCheck(
                key: 'storage',
                title: 'Storage write access',
                status: 'pass',
                message: 'Storage is writable and public storage path exists.',
                severity: 'low'
            );
        } catch (\Throwable $e) {
            return $this->makeCheck(
                key: 'storage',
                title: 'Storage write access',
                status: 'fail',
                message: 'Storage check failed: ' . $e->getMessage(),
                severity: 'critical'
            );
        }
    }

    private function checkCache(): array
    {
        try {
            Cache::put('deployment_readiness_test', 'ok', 60);
            $value = Cache::get('deployment_readiness_test');
            Cache::forget('deployment_readiness_test');

            return $this->makeCheck(
                key: 'cache',
                title: 'Cache system',
                status: $value === 'ok' ? 'pass' : 'warning',
                message: $value === 'ok'
                    ? 'Cache system is working.'
                    : 'Cache system did not return expected value.',
                severity: $value === 'ok' ? 'low' : 'medium'
            );
        } catch (\Throwable $e) {
            return $this->makeCheck(
                key: 'cache',
                title: 'Cache system',
                status: 'warning',
                message: 'Cache check failed: ' . $e->getMessage(),
                severity: 'medium'
            );
        }
    }

    private function checkQueueConfig(): array
    {
        $queueConnection = Config::get('queue.default');

        return $this->makeCheck(
            key: 'queue',
            title: 'Queue configuration',
            status: $queueConnection ? 'pass' : 'warning',
            message: $queueConnection
                ? "Queue connection is set to {$queueConnection}."
                : 'Queue connection is not configured.',
            severity: $queueConnection ? 'low' : 'medium',
            meta: [
                'queue_connection' => $queueConnection,
            ]
        );
    }

    private function checkMailConfig(): array
    {
        $mailer = Config::get('mail.default');
        $from = Config::get('mail.from.address');

        $status = $mailer && $from ? 'pass' : 'warning';

        return $this->makeCheck(
            key: 'mail',
            title: 'Mail configuration',
            status: $status,
            message: $status === 'pass'
                ? "Mail is configured using {$mailer}."
                : 'Mail configuration is incomplete. Set MAIL_MAILER and MAIL_FROM_ADDRESS before production email.',
            severity: $status === 'pass' ? 'low' : 'medium',
            meta: [
                'mailer' => $mailer,
                'from_address' => $from,
            ]
        );
    }

    private function makeSummary(array $checks): array
    {
        $total = count($checks);
        $passed = collect($checks)->where('status', 'pass')->count();
        $warnings = collect($checks)->where('status', 'warning')->count();
        $failed = collect($checks)->where('status', 'fail')->count();

        $score = $total > 0
            ? round(($passed / $total) * 100, 2)
            : 0;

        $readinessLevel = 'ready';

        if ($failed > 0) {
            $readinessLevel = 'not_ready';
        } elseif ($warnings > 0) {
            $readinessLevel = 'needs_review';
        }

        return [
            'total_checks' => $total,
            'passed' => $passed,
            'warnings' => $warnings,
            'failed' => $failed,
            'score' => $score,
            'readiness_level' => $readinessLevel,
        ];
    }

    private function deploymentCommands(): array
    {
        return [
            'composer install --no-dev --optimize-autoloader',
            'php artisan optimize:clear',
            'php artisan migrate --force',
            'php artisan storage:link',
            'php artisan config:cache',
            'php artisan route:cache',
            'php artisan view:cache',
            'php artisan queue:restart',
        ];
    }

    private function recommendedNextSteps(array $summary): array
    {
        if (($summary['failed'] ?? 0) > 0) {
            return [
                'Fix all failed checks before deployment.',
                'Run migrations and confirm database tables.',
                'Check .env database, APP_KEY, and storage settings.',
                'Run the readiness check again after fixing issues.',
            ];
        }

        if (($summary['warnings'] ?? 0) > 0) {
            return [
                'Review warning checks before production deployment.',
                'Set APP_DEBUG=false in production.',
                'Confirm APP_URL, FRONTEND_URL, mail, queue, and storage settings.',
                'Run production build for frontend.',
            ];
        }

        return [
            'Backend looks ready for deployment.',
            'Run frontend production build.',
            'Deploy backend and frontend.',
            'Run smoke tests after deployment.',
        ];
    }

    private function makeCheck(
        string $key,
        string $title,
        string $status,
        string $message,
        string $severity,
        array $meta = []
    ): array {
        return [
            'key' => $key,
            'title' => $title,
            'status' => $status,
            'message' => $message,
            'severity' => $severity,
            'meta' => $meta,
        ];
    }
}