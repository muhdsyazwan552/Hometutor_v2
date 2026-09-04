<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackageDurationOption extends Model
{
    protected $fillable = ['package_id', 'months', 'duration_days', 'price', 'currency', 'is_active'];

    protected function casts(): array
    {
        return ['months' => 'integer', 'duration_days' => 'integer', 'price' => 'decimal:2', 'is_active' => 'boolean'];
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function payments()
    {
        return $this->hasMany(PackagePayment::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
