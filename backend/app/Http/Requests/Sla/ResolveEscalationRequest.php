<?php

namespace App\Http\Requests\Sla;

use Illuminate\Foundation\Http\FormRequest;

class ResolveEscalationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $role = $this->user()?->role?->slug;

        return in_array($role, ['super_admin', 'department_admin'], true);
    }

    public function rules(): array
    {
        return [
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}