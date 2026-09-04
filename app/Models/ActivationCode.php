<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ActivationCode extends Model
{
    public const STATUS_UNUSED = 'unused';

    public const STATUS_REDEEMED = 'redeemed';

    public const STATUS_REVOKED = 'revoked';

    public const STATUS_EXPIRED = 'expired';

    protected $fillable = ['code_hash', 'code_value', 'series_prefix', 'code_last_four', 'package_id', 'duration_days', 'purchase_amount', 'purchaser_parent_id', 'renewal_child_id', 'package_payment_id', 'activation_code_batch_id', 'source', 'intended_use', 'status', 'sent_to_email', 'emailed_at', 'expires_at', 'redeemed_at', 'redeemed_by_child_id', 'revoked_at', 'invalid_reason', 'generated_by_user_id', 'generation_reason', 'metadata'];

    protected $hidden = ['code_hash', 'code_value'];

    protected function casts(): array
    {
        return ['code_value' => 'encrypted', 'duration_days' => 'integer', 'purchase_amount' => 'decimal:2', 'emailed_at' => 'datetime', 'expires_at' => 'datetime', 'redeemed_at' => 'datetime', 'revoked_at' => 'datetime', 'metadata' => 'array'];
    }

    protected static function booted(): void
    {
        static::creating(fn (ActivationCode $code) => $code->uuid ??= (string) Str::uuid());
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function purchaser()
    {
        return $this->belongsTo(User::class, 'purchaser_parent_id');
    }

    public function payment()
    {
        return $this->belongsTo(PackagePayment::class, 'package_payment_id');
    }

    public function batch()
    {
        return $this->belongsTo(ActivationCodeBatch::class, 'activation_code_batch_id');
    }

    public function redeemedByChild()
    {
        return $this->belongsTo(User::class, 'redeemed_by_child_id');
    }

    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by_user_id');
    }

    public function renewalChild()
    {
        return $this->belongsTo(User::class, 'renewal_child_id');
    }

    public function subscription()
    {
        return $this->hasOne(ChildSubscription::class, 'activation_code_id');
    }

    public function licenseAdjustmentRequests()
    {
        return $this->hasMany(LicenseAdjustmentRequest::class);
    }
}
