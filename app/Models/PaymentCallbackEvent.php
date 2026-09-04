<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PaymentCallbackEvent extends Model
{
    protected $fillable = ['payment_transaction_id', 'provider', 'provider_order_reference', 'provider_transaction_reference', 'payment_status', 'signature_valid', 'payload', 'received_at', 'processed_at', 'processing_result', 'processing_error'];

    protected function casts(): array
    {
        return ['signature_valid' => 'boolean', 'payload' => 'array', 'received_at' => 'datetime', 'processed_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::creating(fn (PaymentCallbackEvent $event) => $event->uuid ??= (string) Str::uuid());
    }

    public function paymentTransaction()
    {
        return $this->belongsTo(PaymentTransaction::class);
    }
}
