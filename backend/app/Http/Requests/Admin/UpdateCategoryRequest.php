<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role?->slug === 'super_admin';
    }

    public function rules(): array
    {
        $categoryId = $this->route('category')?->id ?? $this->route('category');

        return [
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'name' => [
                'required',
                'string',
                'max:150',
                Rule::unique('complaint_categories', 'name')->ignore($categoryId),
            ],
            'slug' => [
                'nullable',
                'string',
                'max:180',
                Rule::unique('complaint_categories', 'slug')->ignore($categoryId),
            ],
            'default_priority' => [
                'required',
                'string',
                Rule::in(['low', 'medium', 'high', 'critical']),
            ],
            'default_sla_hours' => ['required', 'integer', 'min:1', 'max:720'],
        ];
    }
}