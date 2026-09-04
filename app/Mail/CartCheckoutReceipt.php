<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\PaymentTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CartCheckoutReceipt extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order, public PaymentTransaction $transaction) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'HomeTutor combined payment receipt');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.cart-checkout-receipt');
    }
}
