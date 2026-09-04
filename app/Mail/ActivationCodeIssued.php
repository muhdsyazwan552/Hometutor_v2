<?php

namespace App\Mail;

use App\Models\ActivationCode;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ActivationCodeIssued extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ActivationCode $activationCode) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your HomeTutor child activation code');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.activation-code-issued');
    }
}
