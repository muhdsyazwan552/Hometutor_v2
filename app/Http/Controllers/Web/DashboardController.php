<?php

namespace App\Http\Controllers\Web;
use App\Http\Controllers\Controller;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\School;
use App\Models\Level;
use App\Models\Student;
use App\Models\QuizSession;
use App\Models\User;
use App\Models\Friend;
use App\Models\FriendRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
public function index()
{
    // DEBUG: Log semua language sources
    Log::info('=== DASHBOARD LANGUAGE DEBUG START ===');
    Log::info('Session locale:', ['value' => Session::get('locale')]);
    Log::info('User language:', ['value' => Auth::check() ? Auth::user()->language : 'guest']);
    Log::info('Current App locale:', ['value' => App::getLocale()]);
    Log::info('Request has locale?', ['value' => request()->has('locale')]);
    
    // ⭐⭐⭐ CRITICAL FIX: ALWAYS get locale from Session first
    $locale = Session::get('locale', 'en');
    
    // ⭐⭐⭐ CRITICAL FIX: ALWAYS set app locale
    App::setLocale($locale);
    
    // ⭐⭐⭐ CRITICAL FIX: ALWAYS load translations
    $translations = $this->loadPhpTranslations($locale);
    
    Log::info('Final language settings:', [
        'selected_locale' => $locale,
        'translations_count' => count($translations),
        'sample_translation' => $translations['dashboard']['school'] ?? 'NOT FOUND'
    ]);
    
    // Check if user is authenticated
    if (Auth::check()) {
        $user = Auth::user();
        
       if ($user->language) {
            $userLang = $user->language;  // ✅ No conversion needed
            
            if ($userLang !== $locale) {
                $user->update(['language' => $locale]);  // ✅ Store 'ms' directly
                
                Log::info('Language synced:', [
                    'user_was' => $userLang,
                    'user_now' => $locale,
                    'session_is' => $locale
                ]);
            }
        }
        
        // Get the student profile data
        $student = Student::with(['school', 'level'])
            ->where('user_id', $user->id)
            ->first();

        // Get friends data
        $friends = $this->getFriendsData($user);
        
        // Get pending friend requests
        $pendingRequests = $this->getPendingRequests($user);

        // Prepare profile data from student information
        $profileData = [
            'name' => $student ? $student->name : $user->name,
            'email' => $student ? $student->email : $user->email,
            'school' => $student && $student->school ? $student->school->name : 'Add your school',
            'grade' => $student && $student->level ? $student->level->name_my : 'Form 5',
            'display_name' => $student ? $student->display_name : $user->display_name
        ];
        
        $authData = ['user' => $user];
        
    } else {
        // For non-authenticated users
        $profileData = [
            'name' => 'Guest User',
            'email' => 'guest@example.com',
            'school' => 'Not specified',
            'grade' => 'Form 5',
            'display_name' => 'Guest'
        ];
        
        $friends = [];
        $pendingRequests = [];
        $student = null;
        $authData = null;
    }

    // Get quiz sessions for leaderboard
    $quizSessions = QuizSession::with('school')
        ->orderBy('total_correct', 'desc')
        ->orderBy('total_time_seconds', 'asc')
        ->limit(5)
        ->get();

    // Courses and assignments data
    $courses = [
        [
            'title' => "Bahasa Melayu",
            'topic' => "Graphic Stimuli",
            'progress' => 0,
            'total' => 4
        ],
        // ... other courses
    ];

    $assignments = [
        [
            'title' => "New Assignment",
            'dueDate' => "Due Jun 26th, 11:59 PM",
            'topic' => "Nombor Dan Operasi",
            'description' => "Objective - Same question set"
        ]
    ];
    
    Log::info('=== DASHBOARD LANGUAGE DEBUG END ===');
    Log::info('Returning to Inertia:', [
        'locale' => $locale,
        'has_translations' => !empty($translations),
        'auth_user_id' => Auth::check() ? Auth::id() : null
    ]);
    
    return Inertia::render('Dashboard', [
        'title' => 'Dashboard',
        'profileData' => $profileData,
        'student' => $student,
        'courses' => $courses,
        'assignments' => $assignments,
        'quizSessions' => $quizSessions,
        'friends' => $friends,
        'pendingRequests' => $pendingRequests,
        'auth' => $authData,
        'locale' => $locale, // ⭐⭐⭐ Always defined now
        'translations' => $translations, // ⭐⭐⭐ Always defined now
        'availableLocales' => ['en', 'ms'],
    ]);
}

private function loadPhpTranslations($locale)
{
    $fallbackLocale = 'en';
    
    try {
        // Load the dashboard.php file for the requested locale
        $translations = trans('common', [], $locale);
        
        // If no translations found, try fallback
        if (is_array($translations) && !empty($translations)) {
            return $translations;
        }
        
        // Fallback to English
        return trans('common', [], $fallbackLocale);
        
    } catch (\Exception $e) {
        // If translation file doesn't exist, return empty
        Log::error('Failed to load translations: ' . $e->getMessage());
        return [];
    }
}
    /**
     * Get friends data for the current user
     */
    private function getFriendsData($user)
    {
        return Friend::where('user_id', $user->id)
            ->orWhere('friend_id', $user->id)
            ->with(['user.student.school', 'friend.student.school'])
            ->get()
            ->map(function ($friend) use ($user) {
                // Determine if the user is the initiator or receiver
                $friendUser = $friend->user_id == $user->id ? $friend->friend : $friend->user;
                
                return [
                    'id' => $friend->id,
                    'friend_id' => $friendUser->id,
                    'name' => $friendUser->display_name ?? $friendUser->name,
                    'avatar' => $this->getAvatarInitials($friendUser->display_name ?? $friendUser->name),
                    'avatarColor' => $this->getAvatarColor($friendUser->id),
                    'status' => 'online', // You can implement actual online status logic
                    'mutualFriends' => $this->getMutualFriendsCount($user->id, $friendUser->id),
                    'school' => $friendUser->student->school->name ?? 'Unknown School',
                ];
            });
    }

    /**
     * Get pending friend requests for the current user
     */
    private function getPendingRequests($user)
    {
        return FriendRequest::where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->with(['user.student.school'])
            ->get()
            ->map(function ($request) use ($user) {
                return [
                    'id' => $request->id,
                    'requester_id' => $request->requester_id,
                    'name' => $request->user->display_name ?? $request->user->name,
                    'avatar' => $this->getAvatarInitials($request->user->display_name ?? $request->user->name),
                    'mutualFriends' => $this->getMutualFriendsCount($user->id, $request->requester_id),
                ];
            });
    }

    /**
     * Get mutual friends count between two users
     */
    private function getMutualFriendsCount($userId1, $userId2)
    {
        $user1Friends = Friend::where('user_id', $userId1)
            ->orWhere('friend_id', $userId1)
            ->get()
            ->map(function ($friend) use ($userId1) {
                return $friend->user_id == $userId1 ? $friend->friend_id : $friend->user_id;
            })
            ->toArray();

        $user2Friends = Friend::where('user_id', $userId2)
            ->orWhere('friend_id', $userId2)
            ->get()
            ->map(function ($friend) use ($userId2) {
                return $friend->user_id == $userId2 ? $friend->friend_id : $friend->user_id;
            })
            ->toArray();

        $mutualFriends = array_intersect($user1Friends, $user2Friends);
        
        return count($mutualFriends);
    }

    /**
     * Generate avatar initials from name
     */
    private function getAvatarInitials($name)
    {
        return collect(explode(' ', $name))
            ->map(fn($word) => strtoupper(substr($word, 0, 1)))
            ->take(2)
            ->join('');
    }

    /**
     * Generate consistent avatar color based on user ID
     */
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
    
    /**
     * Get user statistics for dashboard
     */
    public function getUserStats()
    {
        $user = Auth::user();

        // Get user's quiz performance
        $userQuizSessions = QuizSession::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $totalQuizzes = $userQuizSessions->count();
        $averageScore = $userQuizSessions->avg('total_correct');
        $bestScore = $userQuizSessions->max('total_correct');

        // Get user's rank
        $userRank = $this->calculateUserRank($user->id);

        return [
            'totalQuizzes' => $totalQuizzes,
            'averageScore' => round($averageScore, 1),
            'bestScore' => $bestScore,
            'currentRank' => $userRank,
        ];
    }

    /**
     * Calculate user's rank based on quiz performance
     */
    private function calculateUserRank($userId)
    {
        // Get all users with their best scores and fastest times
        $rankedUsers = QuizSession::select('user_id')
            ->selectRaw('MAX(total_correct) as best_score')
            ->selectRaw('MIN(total_time_seconds) as best_time')
            ->groupBy('user_id')
            ->orderBy('best_score', 'desc')
            ->orderBy('best_time', 'asc')
            ->get();

        $rank = 1;
        foreach ($rankedUsers as $rankedUser) {
            if ($rankedUser->user_id == $userId) {
                return $rank;
            }
            $rank++;
        }

        return null; // User not found in rankings
    }

    /**
     * Get leaderboard data with pagination
     */
    public function getLeaderboard(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        
        $leaderboard = QuizSession::with('school', 'user')
            ->select('user_id')
            ->selectRaw('MAX(total_correct) as best_score')
            ->selectRaw('MIN(total_time_seconds) as best_time')
            ->selectRaw('COUNT(*) as quiz_count')
            ->groupBy('user_id')
            ->orderBy('best_score', 'desc')
            ->orderBy('best_time', 'asc')
            ->paginate($perPage);

        return response()->json($leaderboard);
    }

    /**
     * Get recent activity for dashboard
     */
    public function getRecentActivity()
    {
        $user = Auth::user();

        $recentQuizzes = QuizSession::with('school')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($quiz) {
                return [
                    'type' => 'quiz',
                    'title' => 'Quiz Completed',
                    'description' => "Scored {$quiz->total_correct}/5 in {$quiz->total_time_seconds} seconds",
                    'date' => $quiz->created_at->diffForHumans(),
                    'score' => $quiz->total_correct,
                    'time' => $quiz->total_time_seconds,
                ];
            });

        return $recentQuizzes;
    }
}