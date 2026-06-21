<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdminComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role?->slug === 'super_admin';
    }

    public function rules(): array
    {
        return [
            'status' => [
                'nullable',
                'string',
                Rule::in([
                    'submitted',
                    'under_review',
                    'assigned',
                    'in_progress',
                    'resolved',
                    'rejected',
                    'closed',
                ]),
            ],
            'priority' => [
                'nullable',
                'string',
                Rule::in(['low', 'medium', 'high', 'critical']),
            ],
            'assigned_officer_id' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Selected status is invalid.',
            'priority.in' => 'Selected priority is invalid.',
            'assigned_officer_id.exists' => 'Selected officer was not found.',
        ];
    }
}