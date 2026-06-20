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
            'officer_id' => ['required', 'integer', 'exists:users,id'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'officer_id.required' => 'Please select an officer.',
            'officer_id.exists' => 'Selected officer was not found.',
        ];
    }
}