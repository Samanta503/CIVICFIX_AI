<?php

namespace Database\Seeders;

use App\Models\Zone;
use Illuminate\Database\Seeder;

class ZoneSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            ['name' => 'Mirpur Zone', 'ward_number' => '01'],
            ['name' => 'Kafrul Zone', 'ward_number' => '02'],
            ['name' => 'Banani Zone', 'ward_number' => '03'],
            ['name' => 'Uttara Zone', 'ward_number' => '04'],
            ['name' => 'Dhanmondi Zone', 'ward_number' => '05'],
            ['name' => 'Mohammadpur Zone', 'ward_number' => '06'],
            ['name' => 'Gulshan Zone', 'ward_number' => '07'],
            ['name' => 'Motijheel Zone', 'ward_number' => '08'],
        ];

        foreach ($zones as $zone) {
            Zone::updateOrCreate(
                [
                    'name' => $zone['name'],
                    'city' => 'Dhaka',
                ],
                [
                    'ward_number' => $zone['ward_number'],
                    'boundary_geojson' => null,
                    'status' => 'active',
                ]
            );
        }
    }
}