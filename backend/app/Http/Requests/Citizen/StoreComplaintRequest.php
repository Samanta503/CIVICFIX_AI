<?php

namespace App\Http\Requests\Citizen;

use Illuminate\Foundation\Http\FormRequest;

class StoreComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role?->slug === 'citizen';
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:180'],
            'description' => ['required', 'string', 'min:10'],
            'category_id' => ['required', 'integer', 'exists:complaint_categories,id'],
            'zone_id' => ['nullable', 'integer', 'exists:zones,id'],
            'address' => ['required', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],

            'media' => ['nullable', 'array', 'max:3'],
            'media.*' => [
                'nullable',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Complaint title is required.',
            'description.required' => 'Complaint description is required.',
            'description.min' => 'Complaint description must be at least 10 characters.',
            'category_id.required' => 'Please select a complaint category.',
            'category_id.exists' => 'Selected complaint category is invalid.',
            'zone_id.exists' => 'Selected zone is invalid.',
            'address.required' => 'Complaint address is required.',
            'media.max' => 'You can upload maximum 3 images.',
            'media.*.image' => 'Only image files are allowed.',
            'media.*.mimes' => 'Allowed image types are jpg, jpeg, png, and webp.',
            'media.*.max' => 'Each image must be less than 5MB.',
        ];
    }
}