<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Citizen',
                'slug' => 'citizen',
                'description' => 'Citizen users can submit and track complaints.',
            ],
            [
                'name' => 'City Officer',
                'slug' => 'officer',
                'description' => 'Officers manage assigned complaints and update progress.',
            ],
            [
                'name' => 'Department Admin',
                'slug' => 'department_admin',
                'description' => 'Department admins assign complaints and monitor SLA.',
            ],
            [
                'name' => 'Super Admin',
                'slug' => 'super_admin',
                'description' => 'Super admins manage the whole CivicFix AI system.',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['slug' => $role['slug']],
                [
                    'name' => $role['name'],
                    'description' => $role['description'],
                    'status' => 'active',
                ]
            );
        }
    }
}