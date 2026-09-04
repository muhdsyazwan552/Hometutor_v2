<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PackagePayment extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_PAID = 'paid';

    public const STATUS_REFUNDED = 'refunded';

    protected $fillable = ['parent_id', 'package_id', 'package_duration_option_id', 'method', 'provider', 'provider_reference', 'status', 'amount', 'currency', 'manual_reference', 'parent_notes', 'admin_notes', 'approved_by', 'approved_at', 'rejected_by', 'rejected_at', 'paid_at', 'metadata'];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'approved_at' => 'datetime', 'rejected_at' => 'datetime', 'paid_at' => 'datetime', 'metadata' => 'array'];
    }

    protected static function booted(): void
    {
        static::creating(fn (PackagePayment $payment) => $payment->uuid ??= (string) Str::uuid());
    }

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function durationOption()
    {
        return $this->belongsTo(PackageDurationOption::class, 'package_duration_option_id');
    }

    public function activationCode()
    {
        return $this->hasOne(ActivationCode::class);
    }

    public function licenseAdjustmentRequests()
    {
        return $this->hasMany(LicenseAdjustmentRequest::class);
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
