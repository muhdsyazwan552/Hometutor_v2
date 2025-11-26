<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Friend;
use App\Models\FriendRequest;
use Illuminate\Support\Facades\Auth;

class FriendController extends Controller
{
    /**
     * Show friend list and pending requests
     */
    public function index()
    {
        $user = Auth::user();
        
        $friends = $this->getFriendsData($user);
        $pendingRequests = $this->getPendingRequests($user);

        return Inertia::render('Friends/Index', [
            'friends' => $friends,
            'pendingRequests' => $pendingRequests,
        ]);
    }

    /**
     * Send friend request
     */
    public function sendRequest(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
        ]);

        $user = Auth::user();

        // Check if request already exists
        $existingRequest = FriendRequest::where(function ($query) use ($user, $request) {
            $query->where('requester_id', $user->id)
                  ->where('receiver_id', $request->receiver_id);
        })->orWhere(function ($query) use ($user, $request) {
            $query->where('requester_id', $request->receiver_id)
                  ->where('receiver_id', $user->id);
        })->first();

        if ($existingRequest) {
            return response()->json([
                'message' => 'Friend request already exists or you are already friends'
            ], 400);
        }

        // Check if already friends
        $existingFriend = Friend::where(function ($query) use ($user, $request) {
            $query->where('user_id', $user->id)
                  ->where('friend_id', $request->receiver_id);
        })->orWhere(function ($query) use ($user, $request) {
            $query->where('user_id', $request->receiver_id)
                  ->where('friend_id', $user->id);
        })->first();

        if ($existingFriend) {
            return response()->json([
                'message' => 'You are already friends with this user'
            ], 400);
        }

        // Create friend request
        FriendRequest::create([
            'requester_id' => $user->id,
            'receiver_id' => $request->receiver_id,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Friend request sent successfully'
        ]);
    }

/**
 * Accept friend request with duplicate check
 */
public function acceptRequest(Request $request, $requestId)
{
    $user = Auth::user();

    $friendRequest = FriendRequest::where('id', $requestId)
        ->where('receiver_id', $user->id)
        ->where('status', 'pending')
        ->first();

    if (!$friendRequest) {
        return response()->json([
            'message' => 'Friend request not found'
        ], 404);
    }

    $requesterId = $friendRequest->requester_id;
    $receiverId = $friendRequest->receiver_id;

    // Check if friendship already exists in either direction
    $existingFriendship = Friend::where(function ($query) use ($requesterId, $receiverId) {
        $query->where('user_id', $requesterId)
              ->where('friend_id', $receiverId);
    })->orWhere(function ($query) use ($requesterId, $receiverId) {
        $query->where('user_id', $receiverId)
              ->where('friend_id', $requesterId);
    })->first();

    if ($existingFriendship) {
        // Friendship already exists, just update the request status
        $friendRequest->update(['status' => 'accepted']);
        return response()->json([
            'message' => 'Friend request accepted successfully'
        ]);
    }

    // Create only ONE friendship record
    $user1 = min($requesterId, $receiverId);
    $user2 = max($requesterId, $receiverId);

    Friend::create([
        'user_id' => $user1,
        'friend_id' => $user2,
    ]);

    // Update friend request status
    $friendRequest->update(['status' => 'accepted']);

    return response()->json([
        'message' => 'Friend request accepted successfully'
    ]);
}

    /**
     * Reject friend request
     */
    public function rejectRequest(Request $request, $requestId)
    {
        $user = Auth::user();

        $friendRequest = FriendRequest::where('id', $requestId)
            ->where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$friendRequest) {
            return response()->json([
                'message' => 'Friend request not found'
            ], 404);
        }

        // Update friend request status to rejected
        $friendRequest->update(['status' => 'rejected']);

        return response()->json([
            'message' => 'Friend request rejected successfully'
        ]);
    }

    /**
     * Remove friend
     */
    public function removeFriend(Request $request, $friendId)
    {
        $user = Auth::user();

        // Delete both directions of friendship
        Friend::where(function ($query) use ($user, $friendId) {
            $query->where('user_id', $user->id)
                  ->where('friend_id', $friendId);
        })->orWhere(function ($query) use ($user, $friendId) {
            $query->where('user_id', $friendId)
                  ->where('friend_id', $user->id);
        })->delete();

        return response()->json([
            'message' => 'Friend removed successfully'
        ]);
    }

    // Helper methods (same as in DashboardController)
    private function getFriendsData($user) { /* ... */ }
    private function getPendingRequests($user) { /* ... */ }
    private function getMutualFriendsCount($userId1, $userId2) { /* ... */ }
    private function getAvatarInitials($name) { /* ... */ }
    private function getAvatarColor($userId) { /* ... */ }
}