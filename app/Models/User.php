<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'display_name',
        'role',
        'is_active',
        'language'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function student()
    {
        return $this->hasOne(Student::class, 'user_id', 'id');
    }

    /**
     * Get all friends where this user is the initiator
     */
    public function friends()
    {
        return $this->hasMany(Friend::class, 'user_id', 'id');
    }

    /**
     * Get all friends where this user is the friend
     */
    public function friendOf()
    {
        return $this->hasMany(Friend::class, 'friend_id', 'id');
    }

    /**
     * Get all friend requests sent by this user
     */
    public function sentFriendRequests()
    {
        return $this->hasMany(FriendRequest::class, 'requester_id', 'id');
    }

    /**
     * Get all friend requests received by this user
     */
    public function receivedFriendRequests()
    {
        return $this->hasMany(FriendRequest::class, 'receiver_id', 'id');
    }
}