<?php

namespace App\Http\Requests\Sla;

use Illuminate\Foundation\Http\FormRequest;

class ManualEscalateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $role = $this->user()?->role?->slug;

        return in_array($role, ['super_admin', 'department_admin'], true);
    }

    public function rules(): array
    {
        return [
            'reason' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}