<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ComplaintCategory;
use App\Models\Department;
use App\Models\Role;
use App\Models\SlaRule;
use App\Models\Zone;
use Illuminate\Http\JsonResponse;

class PublicMetaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'CivicFix AI public metadata loaded successfully.',
            'data' => [
                'counts' => [
                    'roles' => Role::count(),
                    'departments' => Department::count(),
                    'zones' => Zone::count(),
                    'complaint_categories' => ComplaintCategory::count(),
                    'sla_rules' => SlaRule::count(),
                ],

                'departments' => Department::query()
                    ->where('status', 'active')
                    ->orderBy('name')
                    ->get([
                        'id',
                        'name',
                        'slug',
                        'description',
                        'contact_email',
                        'phone',
                    ]),

                'zones' => Zone::query()
                    ->where('status', 'active')
                    ->orderBy('name')
                    ->get([
                        'id',
                        'name',
                        'ward_number',
                        'city',
                    ]),

                'complaint_categories' => ComplaintCategory::query()
                    ->with('department:id,name,slug')
                    ->where('status', 'active')
                    ->orderBy('name')
                    ->get([
                        'id',
                        'department_id',
                        'name',
                        'slug',
                        'default_priority',
                        'default_sla_hours',
                    ]),
            ],
        ]);
    }
}