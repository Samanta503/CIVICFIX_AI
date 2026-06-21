@component('mail::message')
# {{ $title }}

{{ $bodyMessage }}

@if($actionUrl)
@component('mail::button', ['url' => $actionUrl])
{{ $actionText ?? 'Open CivicFix AI' }}
@endcomponent
@endif

Thanks,<br>
{{ config('app.name') }}
@endcomponent