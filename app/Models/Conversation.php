<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $table = 'conversations';

    protected $fillable = [
        'name', 
        'description', 
        'is_group', 
        'created_by',
        'last_message_at'
    ];

    protected $casts = [
        'is_group' => 'boolean',
        'last_message_at' => 'datetime',
    ];

    public function participants()
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
                    ->withTimestamps();
                    
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Helper method to get or create 1-on-1 conversation
    public static function getPrivateConversation($user1, $user2)
    {
        $conversation = self::whereHas('participants', function ($query) use ($user1) {
            $query->where('user_id', $user1);
        })->whereHas('participants', function ($query) use ($user2) {
            $query->where('user_id', $user2);
        })->where('is_group', false)->first();

        if (!$conversation) {
            $conversation = self::create(['is_group' => false]);
            
            // Add participants
            ConversationParticipant::create([
                'conversation_id' => $conversation->id,
                'user_id' => $user1,
            ]);
            
            ConversationParticipant::create([
                'conversation_id' => $conversation->id,
                'user_id' => $user2,
            ]);
        }

        return $conversation;
    }

    // Create a group conversation
    public static function createGroup($name, $creatorId, $participants, $description = null)
    {
        $conversation = self::create([
            'name' => $name,
            'description' => $description,
            'is_group' => true,
            'created_by' => $creatorId,
        ]);

        // Add all participants including creator
        $allParticipants = array_unique(array_merge([$creatorId], $participants));
        
        foreach ($allParticipants as $participantId) {
            ConversationParticipant::create([
                'conversation_id' => $conversation->id,
                'user_id' => $participantId,
            ]);
        }

        return $conversation->load('participants');
    }

    // Check if user is participant in conversation
    public function isParticipant($userId)
    {
        return $this->participants()->where('user_id', $userId)->exists();
    }

    // Get other participants (for private chats)
    public function getOtherParticipant($currentUserId)
    {
        return $this->participants()
            ->with('user')
            ->where('user_id', '!=', $currentUserId)
            ->first();
    }

    // Get all participants except current user
    public function getOtherParticipants($currentUserId)
    {
        return $this->participants()
            ->with('user')
            ->where('user_id', '!=', $currentUserId)
            ->get();
    }

    // Update last message timestamp
    public function updateLastMessageTime()
    {
        $this->update([
            'last_message_at' => now(),
            'updated_at' => now()
        ]);
    }

    // Scope for private conversations
    public function scopePrivate($query)
    {
        return $query->where('is_group', false);
    }

    // Scope for group conversations
    public function scopeGroup($query)
    {
        return $query->where('is_group', true);
    }

    // Get unread messages count for a user
    public function getUnreadCountForUser($userId)
    {
        return $this->messages()
            ->where('receiver_id', $userId)
            ->where('is_read', false)
            ->count();
    }

    // Get conversation name (for display)
    public function getDisplayNameAttribute()
    {
        if ($this->is_group) {
            return $this->name;
        }

        // For private conversations, you might want to get the other participant's name
        // This would need to be handled in the controller with relationships loaded
        return $this->name ?? 'Private Conversation';
    }
}