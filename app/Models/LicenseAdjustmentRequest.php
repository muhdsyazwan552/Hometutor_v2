<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LicenseAdjustmentRequest extends Model
{
    public const TYPE_REFUND = 'refund';

    public const TYPE_CANCELLATION = 'cancellation';

    public const STATUS_REQUESTED = 'requested';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_REFUND_FAILED = 'refund_failed';

    protected $fillable = [
        'parent_id', 'requested_by_user_id', 'package_payment_id', 'activation_code_id', 'child_subscription_id',
        'type', 'status', 'reason', 'contact_method', 'purchased_at', 'requested_at', 'refund_eligible',
        'refund_amount', 'currency', 'refund_due_at', 'refund_reference', 'admin_notes',
        'reviewed_by', 'reviewed_at', 'completed_by', 'completed_at', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'purchased_at' => 'datetime',
            'requested_at' => 'datetime',
            'refund_eligible' => 'boolean',
            'refund_amount' => 'decimal:2',
            'refund_due_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'completed_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(fn (self $request) => $request->uuid ??= (string) Str::uuid());
    }

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function payment()
    {
        return $this->belongsTo(PackagePayment::class, 'package_payment_id');
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    public function activationCode()
    {
        return $this->belongsTo(ActivationCode::class);
    }

    public function childSubscription()
    {
        return $this->belongsTo(ChildSubscription::class);
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function completedBy()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function isOpen(): bool
    {
        return in_array($this->status, [self::STATUS_REQUESTED, self::STATUS_APPROVED], true);
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
