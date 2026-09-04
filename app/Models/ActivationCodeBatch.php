<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ActivationCodeBatch extends Model
{
    public const SOURCE_COMPANY = 'company';

    public const SOURCE_EVENT = 'event';

    protected $fillable = ['reference', 'series_prefix', 'source_type', 'company_id', 'event_name', 'package_id', 'package_duration_option_id', 'quantity', 'status', 'expires_at', 'created_by_user_id', 'metadata'];

    protected function casts(): array
    {
        return ['quantity' => 'integer', 'expires_at' => 'datetime', 'metadata' => 'array'];
    }

    protected static function booted(): void
    {
        static::creating(fn (self $batch) => $batch->uuid ??= (string) Str::uuid());
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function durationOption()
    {
        return $this->belongsTo(PackageDurationOption::class, 'package_duration_option_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function activationCodes()
    {
        return $this->hasMany(ActivationCode::class);
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
