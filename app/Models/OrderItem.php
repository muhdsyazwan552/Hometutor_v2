<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class OrderItem extends Model
{
    public const TYPE_NEW = 'new';

    public const TYPE_RENEWAL = 'renewal';

    public const FULFILLMENT_PENDING = 'pending';

    public const FULFILLMENT_FULFILLED = 'fulfilled';

    public const FULFILLMENT_FAILED = 'failed';

    protected $fillable = ['order_id', 'item_type', 'fulfillment_status', 'child_user_id', 'package_id', 'package_duration_option_id', 'package_name_snapshot', 'duration_days', 'unit_price', 'discount_total', 'tax_total', 'total', 'currency', 'new_child_name', 'new_child_username', 'new_child_password_hash', 'new_child_level_id', 'new_child_class_name', 'fulfilled_child_user_id', 'fulfilled_at', 'failure_reason', 'metadata'];

    protected $hidden = ['new_child_password_hash'];

    protected function casts(): array
    {
        return ['duration_days' => 'integer', 'unit_price' => 'decimal:2', 'discount_total' => 'decimal:2', 'tax_total' => 'decimal:2', 'total' => 'decimal:2', 'fulfilled_at' => 'datetime', 'metadata' => 'array'];
    }

    protected static function booted(): void
    {
        static::creating(fn (OrderItem $item) => $item->uuid ??= (string) Str::uuid());
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function child()
    {
        return $this->belongsTo(User::class, 'child_user_id');
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function durationOption()
    {
        return $this->belongsTo(PackageDurationOption::class, 'package_duration_option_id');
    }

    public function fulfilledChild()
    {
        return $this->belongsTo(User::class, 'fulfilled_child_user_id');
    }

    public function level()
    {
        return $this->belongsTo(Level::class, 'new_child_level_id');
    }

    public function subscription()
    {
        return $this->hasOne(ChildSubscription::class);
    }

    public function usernameReservation()
    {
        return $this->hasOne(UsernameReservation::class);
    }
}
