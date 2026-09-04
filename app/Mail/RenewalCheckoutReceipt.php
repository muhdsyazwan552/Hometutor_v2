<?php

namespace App\Mail;

use App\Models\ActivationCode;
use App\Models\PackageDurationOption;
use App\Models\PackagePayment;
use App\Models\Student;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RenewalCheckoutReceipt extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public PackagePayment $payment,
        public PackageDurationOption $durationOption,
        public Student $student,
        public ActivationCode $activationCode,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'HomeTutor payment receipt and renewal code');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.renewal-checkout-receipt');
    }
}
