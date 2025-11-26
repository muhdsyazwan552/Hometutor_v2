<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FriendRequest extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'friend_requests';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'requester_id',
        'receiver_id',
        'status',
    ];

    /**
     * Get the user who sent the request
     */
    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id', 'id');
    }

    /**
     * Get the user who received the request
     */
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id', 'id');
    }

    /**
     * Alias for requester (for backward compatibility)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'requester_id', 'id');
    }
}