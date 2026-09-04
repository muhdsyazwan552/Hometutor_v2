<?php

namespace App\Mail;

use App\Models\ActivationCode;
use App\Models\ChildSubscription;
use App\Models\PackageDurationOption;
use App\Models\PackagePayment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PackageCheckoutReceipt extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public PackagePayment $payment,
        public PackageDurationOption $durationOption,
        public User $child,
        public string $childPassword,
        public ChildSubscription $subscription,
        public ActivationCode $activationCode,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'HomeTutor payment receipt and child account');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.package-checkout-receipt');
    }
}
