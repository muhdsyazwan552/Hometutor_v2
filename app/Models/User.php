<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    public const ROLE_SUPER_ADMIN = 1;

    public const ROLE_ADMIN = 2;

    public const ROLE_CODE_MANAGER = 4;

    public const ROLE_CHILD = 6;

    public const ROLE_PARENT = 7;

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'mobile_number',
        'password',
        'display_name',
        'role_id',
        'is_active',
        'language',
        'company_id',
        'registration_reference_code',
        'registered_at',
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
            'registered_at' => 'datetime',
        ];
    }

    public function student()
    {
        return $this->hasOne(Student::class, 'user_id', 'id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function children()
    {
        return $this->hasMany(Student::class, 'parent_id');
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'parent_id');
    }

    public function activeSubscription(): ?Subscription
    {
        return $this->subscriptions()
            ->with('package')
            ->active()
            ->latest('ends_at')
            ->first();
    }

    public function childSubscriptions()
    {
        return $this->hasMany(ChildSubscription::class, 'child_user_id');
    }

    public function activeChildSubscription(): ?ChildSubscription
    {
        return $this->childSubscriptions()
            ->with('package')
            ->active()
            ->latest('ends_at')
            ->first();
    }

    public function packagePayments()
    {
        return $this->hasMany(PackagePayment::class, 'parent_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'parent_id');
    }

    public function activationCodes()
    {
        return $this->hasMany(ActivationCode::class, 'purchaser_parent_id');
    }

    public function licenseAdjustmentRequests()
    {
        return $this->hasMany(LicenseAdjustmentRequest::class, 'parent_id');
    }

    public function isChild(): bool
    {
        return (int) $this->role_id === self::ROLE_CHILD;
    }

    public function isParent(): bool
    {
        return (int) $this->role_id === self::ROLE_PARENT;
    }

    public function isCodeManager(): bool
    {
        return (int) $this->role_id === self::ROLE_CODE_MANAGER;
    }

    public function hasRole(string $role): bool
    {
        return match ($role) {
            'super-admin' => (int) $this->role_id === self::ROLE_SUPER_ADMIN,
            'admin' => in_array((int) $this->role_id, [self::ROLE_SUPER_ADMIN, self::ROLE_ADMIN], true),
            'code-manager' => $this->isCodeManager(),
            'child' => $this->isChild(),
            'parent' => $this->isParent(),
            default => false,
        };
    }

    public function homeRouteName(): string
    {
        if ($this->isParent()) {
            return 'parent.dashboard';
        }

        if ($this->isCodeManager()) {
            return 'code-manager.index';
        }

        return $this->hasRole('admin') ? 'admin.licenses.index' : 'dashboard';
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
