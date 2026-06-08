<?php

namespace Database\Seeders;

use App\Models\ComplaintCategory;
use App\Models\SlaRule;
use Illuminate\Database\Seeder;

class SlaRuleSeeder extends Seeder
{
    public function run(): void
    {
        $priorityRules = [
            'low' => [
                'sla_hours' => 120,
                'escalation_hours' => 96,
            ],
            'medium' => [
                'sla_hours' => 72,
                'escalation_hours' => 48,
            ],
            'high' => [
                'sla_hours' => 48,
                'escalation_hours' => 24,
            ],
            'critical' => [
                'sla_hours' => 12,
                'escalation_hours' => 6,
            ],
        ];

        $categories = ComplaintCategory::all();

        foreach ($categories as $category) {
            foreach ($priorityRules as $priority => $rule) {
                SlaRule::updateOrCreate(
                    [
                        'category_id' => $category->id,
                        'priority' => $priority,
                    ],
                    [
                        'sla_hours' => $rule['sla_hours'],
                        'escalation_hours' => $rule['escalation_hours'],
                        'status' => 'active',
                    ]
                );
            }
        }
    }
}