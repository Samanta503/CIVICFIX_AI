<?php

namespace App\Http\Requests\Citizen;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreComplaintFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role?->slug === 'citizen';
    }

    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'response_quality' => [
                'nullable',
                'string',
                Rule::in(['poor', 'fair', 'good', 'excellent']),
            ],
            'issue_resolved' => ['required', 'boolean'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'rating.required' => 'Please select a rating.',
            'rating.min' => 'Rating must be at least 1.',
            'rating.max' => 'Rating cannot be more than 5.',
            'issue_resolved.required' => 'Please confirm whether the issue was resolved.',
        ];
    }
}