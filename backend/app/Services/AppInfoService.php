<?php

namespace App\Services;

class AppInfoService
{
    public function getInfo(): array
    {
        return [
            'name' => config('civicfix.name'),
            'version' => config('civicfix.version'),
            'environment' => config('civicfix.environment'),
            'frontend_url' => config('civicfix.frontend_url'),
            'api_url' => config('civicfix.api_url'),
            'default_city' => config('civicfix.default_city'),
            'default_country' => config('civicfix.default_country'),
            'support_email' => config('civicfix.support_email'),
            'features' => config('civicfix.features'),
        ];
    }
}
