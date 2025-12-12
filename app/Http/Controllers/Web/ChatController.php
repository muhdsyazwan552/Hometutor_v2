<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\Friend;
use App\Models\User;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function lobby()
    {
        $user = Auth::user();
        
        // Get user's conversations
        $participantConversationIds = ConversationParticipant::where('user_id', $user->id)
            ->pluck('conversation_id');
            
        $conversations = Conversation::whereIn('id', $participantConversationIds)
            ->with(['participants.user', 'latestMessage']) // Added eager loading
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($conversation) use ($user) {
                return $this->formatConversation($conversation, $user);
            });

        // Get user's friends for starting new chats
        $friends = Friend::where('user_id', $user->id)
            ->orWhere('friend_id', $user->id)
            ->get()
            ->map(function ($friend) use ($user) {
                $friendUser = $friend->user_id == $user->id ? User::find($friend->friend_id) : User::find($friend->user_id);
                
                return [
                    'id' => $friendUser->id,
                    'name' => $friendUser->display_name ?? $friendUser->name,
                    'avatar' => $this->getAvatarInitials($friendUser->display_name ?? $friendUser->name),
                    'avatarColor' => $this->getAvatarColor($friendUser->id),
                    'status' => 'online', // You can implement real status
                    'school' => $friendUser->student->school->name ?? 'Unknown School',
                ];
            });

        return Inertia::render('Chat/Lobby', [
            'conversations' => $conversations,
            'friends' => $friends,
            'user' => $user
        ]);
    }

    public function getConversations()
    {
        $user = Auth::user();

        $conversations = Conversation::whereHas('participants', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->with(['participants.user.student.school', 'latestMessage'])
        ->get()
        ->map(function ($conversation) use ($user) {
            $otherParticipant = $conversation->participants
                ->where('user_id', '!=', $user->id)
                ->first();

            $latestMessage = $conversation->latestMessage;

            return [
                'id' => $conversation->id,
                'name' => $otherParticipant->user->display_name ?? $otherParticipant->user->name,
                'avatar' => $this->getAvatarInitials($otherParticipant->user->display_name ?? $otherParticipant->user->name),
                'avatarColor' => $this->getAvatarColor($otherParticipant->user->id),
                'lastMessage' => $latestMessage ? $latestMessage->message : 'No messages yet',
                'lastMessageTime' => $latestMessage ? $latestMessage->created_at->diffForHumans() : null,
                'unreadCount' => $conversation->messages()
                    ->where('receiver_id', $user->id)
                    ->where('is_read', false)
                    ->count(),
            ];
        });

        return response()->json($conversations);
    }

    public function getMessages($conversationId)
    {
        $user = Auth::user();

        // Verify user is part of conversation
        $conversation = Conversation::whereHas('participants', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->findOrFail($conversationId);

        $messages = Message::where('conversation_id', $conversationId)
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) use ($user) {
                return $this->formatMessage($message, $user);
            });

        // Mark messages as read
        Message::where('conversation_id', $conversationId)
            ->where('receiver_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json($messages);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'message' => 'required|string|max:1000',
        ]);

        $user = Auth::user();

        // Verify user is participant and get conversation
        $conversation = Conversation::whereHas('participants', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->with('participants')->findOrFail($request->conversation_id);

        // Find receiver for private conversations
        $receiverId = null;
        if (!$conversation->is_group) {
            $otherParticipant = $conversation->participants
                ->where('user_id', '!=', $user->id)
                ->first();
            $receiverId = $otherParticipant ? $otherParticipant->user_id : null;
        }

        // Create message
        $messageData = [
            'conversation_id' => $request->conversation_id,
            'sender_id' => $user->id,
            'message' => $request->message,
        ];

        // Add receiver_id for private messages
        if ($receiverId) {
            $messageData['receiver_id'] = $receiverId;
        }

        $message = Message::create($messageData);

        // Load sender relationship for broadcasting
        $message->load('sender');

        // Update conversation timestamp
        $conversation->touch();

        // Broadcast the message to other participants
        try {
            broadcast(new MessageSent($message))->toOthers();
        } catch (\Exception $e) {
            // Log broadcast error but don't fail the request
            // \Log::error('Broadcast error: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => $this->formatMessage($message, $user)
        ]);
    }

    public function startConversation(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id',
        ]);

        $user = Auth::user();
        $friendId = $request->friend_id;

        // Check if they are friends
        $isFriend = \App\Models\Friend::where(function ($query) use ($user, $friendId) {
            $query->where('user_id', $user->id)
                  ->where('friend_id', $friendId);
        })->orWhere(function ($query) use ($user, $friendId) {
            $query->where('user_id', $friendId)
                  ->where('friend_id', $user->id);
        })->exists();

        if (!$isFriend) {
            return response()->json(['error' => 'You can only chat with friends'], 403);
        }

        $conversation = Conversation::getPrivateConversation($user->id, $friendId);

        return response()->json([
            'conversation_id' => $conversation->id,
            'success' => true
        ]);
    }

    /**
     * Create group conversation
     */
    public function createGroup(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'participants' => 'required|array|min:1',
            'participants.*' => 'exists:users,id',
            'description' => 'sometimes|string|max:500'
        ]);

        $user = Auth::user();

        $conversation = Conversation::createGroup(
            $request->name,
            $user->id,
            $request->participants,
            $request->description
        );

        // Add system message
        Message::createSystemMessage($conversation->id, "Group '{$request->name}' was created");

        return response()->json([
            'success' => true,
            'conversation' => $this->formatConversation($conversation, $user)
        ]);
    }

    // Helper methods
    private function getAvatarInitials($name)
    {
        return collect(explode(' ', $name))
            ->map(fn($word) => strtoupper(substr($word, 0, 1)))
            ->take(2)
            ->join('');
    }

    private function getAvatarColor($userId)
    {
        $colors = [
            'bg-gradient-to-r from-blue-400 to-purple-500',
            'bg-gradient-to-r from-green-400 to-teal-500',
            'bg-gradient-to-r from-pink-400 to-red-500',
            'bg-gradient-to-r from-yellow-400 to-orange-500',
            'bg-gradient-to-r from-indigo-400 to-blue-500',
        ];
        return $colors[$userId % count($colors)];
    }

    private function formatConversation($conversation, $user)
    {
        $otherParticipant = $conversation->participants
            ->where('user_id', '!=', $user->id)
            ->first();

        $latestMessage = $conversation->latestMessage;

        return [
            'id' => $conversation->id,
            'name' => $otherParticipant ? ($otherParticipant->user->display_name ?? $otherParticipant->user->name) : $conversation->name,
            'avatar' => $otherParticipant ? $this->getAvatarInitials($otherParticipant->user->display_name ?? $otherParticipant->user->name) : $this->getAvatarInitials($conversation->name),
            'avatarColor' => $otherParticipant ? $this->getAvatarColor($otherParticipant->user->id) : $this->getAvatarColor($conversation->id),
            'lastMessage' => $latestMessage ? $latestMessage->message : 'No messages yet',
            'lastMessageTime' => $latestMessage ? $latestMessage->created_at->diffForHumans() : null,
            'unreadCount' => $conversation->messages()
                ->where('receiver_id', $user->id)
                ->where('is_read', false)
                ->count(),
            'is_group' => $conversation->is_group ?? false,
        ];
    }

    private function formatMessage($message, $user = null)
    {
        if (!$user) {
            $user = Auth::user();
        }

        // Check if sender relationship is loaded
        $senderName = $message->sender ? $message->sender->name : 'Unknown User';
        $senderAvatar = $message->sender ? $this->getAvatarInitials($message->sender->name) : '??';

        return [
            'id' => $message->id,
            'sender_id' => $message->sender_id,
            'sender_name' => $senderName,
            'sender_avatar' => $senderAvatar,
            'message' => $message->message,
            'is_read' => $message->is_read ?? false,
            'created_at' => $message->created_at->toDateTimeString(),
            'time_ago' => $message->created_at->diffForHumans(),
            'is_own' => $message->sender_id === $user->id,
        ];
    }
}