<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Road Maintenance',
                'description' => 'Handles potholes, road damage, cracks, and manhole issues.',
            ],
            [
                'name' => 'Waste Management',
                'description' => 'Handles garbage, illegal dumping, and waste-related complaints.',
            ],
            [
                'name' => 'Water Supply',
                'description' => 'Handles water leakage and water supply issues.',
            ],
            [
                'name' => 'Electricity Department',
                'description' => 'Handles broken streetlights and electricity-related issues.',
            ],
            [
                'name' => 'Traffic Department',
                'description' => 'Handles traffic signal and road traffic complaints.',
            ],
            [
                'name' => 'Drainage Department',
                'description' => 'Handles drain blockage and drainage problems.',
            ],
            [
                'name' => 'Public Safety Department',
                'description' => 'Handles public safety and noise complaints.',
            ],
            [
                'name' => 'Parks and Trees Department',
                'description' => 'Handles fallen trees and public green-space issues.',
            ],
        ];

        foreach ($departments as $department) {
            $slug = Str::slug($department['name']);

            Department::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $department['name'],
                    'description' => $department['description'],
                    'contact_email' => $slug . '@civicfix-ai.local',
                    'phone' => '+8801000000000',
                    'status' => 'active',
                ]
            );
        }
    }
}