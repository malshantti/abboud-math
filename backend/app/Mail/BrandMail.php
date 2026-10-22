<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Headers;

class BrandMail extends Mailable
{
    public function __construct(public array $mail, public string $senderName) {}

    public function envelope(): Envelope
    {
        return new Envelope(from: new Address((string) config('mail.from.address'), $this->senderName), subject: $this->mail['subject']);
    }

    public function headers(): Headers
    {
        return new Headers(text: ['X-Bustan-Mail' => $this->mail['type']]);
    }

    public function content(): Content
    {
        return new Content(view: 'mail.brand', text: 'mail.brand-text', with: ['m' => $this->mail]);
    }
}
