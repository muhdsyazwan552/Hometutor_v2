<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'curriculum_group',
        'price',
        'currency',
        'duration_days',
        'max_children',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'duration_days' => 'integer',
            'max_children' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function levels()
    {
        return $this->belongsToMany(Level::class, 'package_level', 'package_id', 'level_id');
    }

    public function childSubscriptions()
    {
        return $this->hasMany(ChildSubscription::class);
    }

    public function durationOptions()
    {
        return $this->hasMany(PackageDurationOption::class)->orderBy('months');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
