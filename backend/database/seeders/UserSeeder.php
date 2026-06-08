<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $citizenRole = Role::where('slug', 'citizen')->first();
        $officerRole = Role::where('slug', 'officer')->first();
        $departmentAdminRole = Role::where('slug', 'department_admin')->first();
        $superAdminRole = Role::where('slug', 'super_admin')->first();

        $roadDepartment = Department::where('slug', 'road-maintenance')->first();
        $wasteDepartment = Department::where('slug', 'waste-management')->first();

        $defaultZone = Zone::first();

        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@civicfix.local',
                'phone' => '+8801711111111',
                'role_id' => $superAdminRole?->id,
                'department_id' => null,
                'zone_id' => null,
                'status' => 'active',
            ],
            [
                'name' => 'Road Department Admin',
                'email' => 'department.admin@civicfix.local',
                'phone' => '+8801722222222',
                'role_id' => $departmentAdminRole?->id,
                'department_id' => $roadDepartment?->id,
                'zone_id' => $defaultZone?->id,
                'status' => 'active',
            ],
            [
                'name' => 'Road Officer',
                'email' => 'officer@civicfix.local',
                'phone' => '+8801733333333',
                'role_id' => $officerRole?->id,
                'department_id' => $roadDepartment?->id,
                'zone_id' => $defaultZone?->id,
                'status' => 'active',
            ],
            [
                'name' => 'Waste Officer',
                'email' => 'waste.officer@civicfix.local',
                'phone' => '+8801744444444',
                'role_id' => $officerRole?->id,
                'department_id' => $wasteDepartment?->id,
                'zone_id' => $defaultZone?->id,
                'status' => 'active',
            ],
            [
                'name' => 'Demo Citizen',
                'email' => 'citizen@civicfix.local',
                'phone' => '+8801755555555',
                'role_id' => $citizenRole?->id,
                'department_id' => null,
                'zone_id' => $defaultZone?->id,
                'status' => 'active',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'phone' => $user['phone'],
                    'password' => Hash::make('password'),
                    'role_id' => $user['role_id'],
                    'department_id' => $user['department_id'],
                    'zone_id' => $user['zone_id'],
                    'status' => $user['status'],
                ]
            );
        }
    }
}