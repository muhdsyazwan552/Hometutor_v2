<?php

namespace App\Mail;

use App\Models\ActivationCode;
use App\Models\ChildSubscription;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AssistedChildAccountCreated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $parent,
        public User $child,
        public string $childPassword,
        public ActivationCode $activationCode,
        public ChildSubscription $subscription,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'HomeTutor child account details');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.assisted-child-account-created');
    }
}
