<?php

return [
    'name' => env('CIVICFIX_APP_NAME', 'CivicFix AI'),

    'version' => env('CIVICFIX_APP_VERSION', '0.1.0'),

    'environment' => env('APP_ENV', 'local'),

    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),

    'api_url' => env('BACKEND_API_URL', 'http://127.0.0.1:8000/api'),

    'default_city' => env('CIVICFIX_DEFAULT_CITY', 'Dhaka'),

    'default_country' => env('CIVICFIX_DEFAULT_COUNTRY', 'Bangladesh'),

    'default_timezone' => env('APP_TIMEZONE', 'Asia/Dhaka'),

    'support_email' => env('CIVICFIX_SUPPORT_EMAIL', 'support@civicfix-ai.local'),

    'features' => [
        'citizen_complaints' => true,
        'public_map' => true,
        'ai_summary' => false,
        'ai_priority' => false,
        'ai_duplicate_detection' => false,
        'notifications' => false,
        'reports' => false,
    ],
];
