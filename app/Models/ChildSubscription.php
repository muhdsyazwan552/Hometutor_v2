<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ChildSubscription extends Model
{
    public const STATUS_ACTIVE = 'active';

    public const STATUS_SCHEDULED = 'scheduled';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_CANCELLED = 'cancelled';

    public const TYPE_NEW = 'new';

    public const TYPE_RENEWAL = 'renewal';

    public const SOURCE_ACTIVATION_CODE = 'activation_code';

    public const SOURCE_ONLINE_PAYMENT = 'online_payment';

    public const SOURCE_ADMIN_MANUAL = 'admin_manual';

    protected $fillable = ['child_user_id', 'package_id', 'activation_code_id', 'order_item_id', 'payment_transaction_id', 'previous_subscription_id', 'status', 'source', 'subscription_type', 'starts_at', 'ends_at', 'cancelled_at', 'cancellation_reason'];

    protected function casts(): array
    {
        return ['starts_at' => 'datetime', 'ends_at' => 'datetime', 'cancelled_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::creating(fn (ChildSubscription $subscription) => $subscription->uuid ??= (string) Str::uuid());
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACTIVE)->where('starts_at', '<=', now())->where('ends_at', '>', now());
    }

    public function child()
    {
        return $this->belongsTo(User::class, 'child_user_id');
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function activationCode()
    {
        return $this->belongsTo(ActivationCode::class);
    }

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function paymentTransaction()
    {
        return $this->belongsTo(PaymentTransaction::class);
    }

    public function previousSubscription()
    {
        return $this->belongsTo(self::class, 'previous_subscription_id');
    }

    public function licenseAdjustmentRequests()
    {
        return $this->hasMany(LicenseAdjustmentRequest::class);
    }
}
