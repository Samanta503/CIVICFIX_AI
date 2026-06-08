<?php

namespace Database\Seeders;

use App\Models\ComplaintCategory;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ComplaintCategorySeeder extends Seeder
{
    public function run(): void
    {
        $departmentMap = Department::pluck('id', 'name');

        $categories = [
            [
                'name' => 'Pothole',
                'department' => 'Road Maintenance',
                'priority' => 'high',
                'sla_hours' => 48,
            ],
            [
                'name' => 'Road Damage',
                'department' => 'Road Maintenance',
                'priority' => 'high',
                'sla_hours' => 48,
            ],
            [
                'name' => 'Garbage',
                'department' => 'Waste Management',
                'priority' => 'medium',
                'sla_hours' => 72,
            ],
            [
                'name' => 'Water Leakage',
                'department' => 'Water Supply',
                'priority' => 'high',
                'sla_hours' => 24,
            ],
            [
                'name' => 'Broken Streetlight',
                'department' => 'Electricity Department',
                'priority' => 'medium',
                'sla_hours' => 72,
            ],
            [
                'name' => 'Drain Blockage',
                'department' => 'Drainage Department',
                'priority' => 'high',
                'sla_hours' => 36,
            ],
            [
                'name' => 'Traffic Signal Issue',
                'department' => 'Traffic Department',
                'priority' => 'critical',
                'sla_hours' => 12,
            ],
            [
                'name' => 'Illegal Dumping',
                'department' => 'Waste Management',
                'priority' => 'medium',
                'sla_hours' => 72,
            ],
            [
                'name' => 'Fallen Tree',
                'department' => 'Parks and Trees Department',
                'priority' => 'high',
                'sla_hours' => 24,
            ],
            [
                'name' => 'Public Safety Issue',
                'department' => 'Public Safety Department',
                'priority' => 'critical',
                'sla_hours' => 12,
            ],
            [
                'name' => 'Noise Complaint',
                'department' => 'Public Safety Department',
                'priority' => 'low',
                'sla_hours' => 120,
            ],
            [
                'name' => 'Other',
                'department' => 'Public Safety Department',
                'priority' => 'medium',
                'sla_hours' => 72,
            ],
        ];

        foreach ($categories as $category) {
            ComplaintCategory::updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'department_id' => $departmentMap[$category['department']] ?? null,
                    'name' => $category['name'],
                    'default_priority' => $category['priority'],
                    'default_sla_hours' => $category['sla_hours'],
                    'status' => 'active',
                ]
            );
        }
    }
}