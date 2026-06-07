<?php

return [
    'enabled' => env('AI_SERVICE_ENABLED', false),

    'base_url' => env('AI_SERVICE_URL', 'http://127.0.0.1:8001'),

    'timeout_seconds' => env('AI_SERVICE_TIMEOUT', 15),

    'endpoints' => [
        'health' => '/health',
        'summary' => '/generate/summary',
        'priority' => '/predict/priority',
        'duplicate' => '/detect/duplicate',
        'spam' => '/detect/spam',
        'resolution_time' => '/predict/resolution-time',
    ],

    'openai' => [
        'enabled' => env('OPENAI_ENABLED', false),
        'api_key' => env('OPENAI_API_KEY'),
        'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
    ],
];
