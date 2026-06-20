<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role?->slug === 'super_admin';
    }

    public function rules(): array
    {
        return [
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'name' => ['required', 'string', 'max:150', 'unique:complaint_categories,name'],
            'slug' => ['nullable', 'string', 'max:180', 'unique:complaint_categories,slug'],
            'default_priority' => [
                'required',
                'string',
                Rule::in(['low', 'medium', 'high', 'critical']),
            ],
            'default_sla_hours' => ['required', 'integer', 'min:1', 'max:720'],
        ];
    }
}