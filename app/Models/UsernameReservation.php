<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsernameReservation extends Model
{
    protected $fillable = ['username', 'order_item_id', 'expires_at', 'released_at'];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime', 'released_at' => 'datetime'];
    }

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
