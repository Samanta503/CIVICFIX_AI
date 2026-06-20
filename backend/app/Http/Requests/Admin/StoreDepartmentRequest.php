<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role?->slug === 'super_admin';
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150', 'unique:departments,name'],
            'slug' => ['nullable', 'string', 'max:180', 'unique:departments,slug'],
        ];
    }
}