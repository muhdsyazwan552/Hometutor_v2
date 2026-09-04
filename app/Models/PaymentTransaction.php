<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PaymentTransaction extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_PAID = 'paid';

    public const STATUS_FAILED = 'failed';

    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = ['order_id', 'provider', 'provider_order_reference', 'provider_transaction_reference', 'status', 'amount', 'currency', 'payment_channel', 'message', 'paid_at', 'metadata'];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'paid_at' => 'datetime', 'metadata' => 'array'];
    }

    protected static function booted(): void
    {
        static::creating(fn (PaymentTransaction $transaction) => $transaction->uuid ??= (string) Str::uuid());
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function callbackEvents()
    {
        return $this->hasMany(PaymentCallbackEvent::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(ChildSubscription::class);
    }
}
