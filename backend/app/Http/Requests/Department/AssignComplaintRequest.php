<?php

namespace App\Http\Requests\Department;

use Illuminate\Foundation\Http\FormRequest;

class AssignComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        $role = $this->user()?->role?->slug;

        return in_array($role, ['department_admin', 'super_admin'], true);
    }

    public function rules(): array
    {
        return [
            'assigned_officer_id' => ['nullable', 'integer', 'exists:users,id'],
            'officer_id' => ['nullable', 'integer', 'exists:users,id'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (!$this->input('assigned_officer_id') && !$this->input('officer_id')) {
                $validator->errors()->add(
                    'assigned_officer_id',
                    'Please select an officer.'
                );
            }
        });
    }
}