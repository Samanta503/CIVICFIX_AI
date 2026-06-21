<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class CivicFixNotificationMail extends Mailable
{
    public function __construct(
        public string $title,
        public string $bodyMessage,
        public ?string $actionUrl = null,
        public ?string $actionText = 'Open CivicFix AI'
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.civicfix-notification',
        );
    }
}