<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role?->slug === 'super_admin';
    }

    public function rules(): array
    {
        $departmentId = $this->route('department')?->id ?? $this->route('department');

        return [
            'name' => [
                'required',
                'string',
                'max:150',
                Rule::unique('departments', 'name')->ignore($departmentId),
            ],
            'slug' => [
                'nullable',
                'string',
                'max:180',
                Rule::unique('departments', 'slug')->ignore($departmentId),
            ],
        ];
    }
}