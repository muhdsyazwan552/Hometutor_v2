<?php

use App\Http\Controllers\Web\MenuController;
use App\Http\Controllers\Web\ProfileController;
use App\Http\Controllers\Web\GamesController;
use App\Http\Controllers\Web\SubjectContentController;
use App\Http\Controllers\Web\ObjectiveController;
use App\Http\Controllers\Web\FriendController;
use App\Http\Controllers\Web\ChatController;
use App\Http\Controllers\Web\LanguageController;
use App\Http\Controllers\Web\PageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Web\QuizController;
use App\Http\Controllers\Web\ReportController;
use App\Http\Controllers\Web\SubjectiveController;
use App\Http\Controllers\Web\MissionController;
use App\Http\Controllers\Web\DashboardController;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('Auth/Login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


    Route::get('/subject/{subject}', [SubjectContentController::class, 'index'])->name('subject-page');
    Route::get('/subject/{subject}/report', [ReportController::class, 'index'])->name('subject-report-page');
    Route::get('/subject/{subject}/mission', [MissionController::class, 'index'])->name('subject-mission-page');

    Route::get('/objective-page', [ObjectiveController::class, 'index'])->name('objective-page');
    Route::get('/subjective-page', [SubjectiveController::class, 'index'])->name('subjective-page');

    Route::post('/practice-session/objective', [ObjectiveController::class, 'completePractice']);
    Route::post('/practice-session/subjective', [SubjectiveController::class, 'completePractice']);

    Route::get('/subtopic/{subtopicId}/details', [ReportController::class, 'getSubtopicDetails'])
        ->name('subtopic-details');

    Route::get('/session/{sessionId}/review', [ReportController::class, 'getQuestionAttempts'])
        ->name('session.review');

    Route::get('/review/session/{sessionId}', [ReportController::class, 'reviewPage'])
    ->name('review.page');

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('/friends', [FriendController::class, 'index'])->name('friends.index');
        Route::post('/friends/send-request', [FriendController::class, 'sendRequest'])->name('friends.send-request');
        Route::post('/friends/accept-request/{requestId}', [FriendController::class, 'acceptRequest'])->name('friends.accept-request');
        Route::post('/friends/reject-request/{requestId}', [FriendController::class, 'rejectRequest'])->name('friends.reject-request');
        Route::delete('/friends/remove/{friendId}', [FriendController::class, 'removeFriend'])->name('friends.remove');
    });




    Route::get('/debug/topics/{subject}', [ReportController::class, 'debugTopics']);


    Route::post('/objective-page/restart', [ObjectiveController::class, 'restart'])->name('objective-page.restart');



    Route::get('/tekakata-page', function () {
        return Inertia::render('games/TekaKataPage');
    })->name('tekakata-page');

    Route::get('/quiz-page', [GamesController::class, 'index'])->name('quiz-page');
    Route::post('/quiz/submit', [GamesController::class, 'storeQuizResult'])->name('quiz.submit');

    Route::get('/question-section', function () {
        return Inertia::render('games/QuizInterface');
    })->name('question-section');


    Route::get('/chat', [ChatController::class, 'lobby'])->name('chat.lobby');
    Route::get('/chat/conversations', [ChatController::class, 'getConversations']);
    Route::get('/chat/conversation/{conversation}/messages', [ChatController::class, 'getMessages']);
    Route::post('/chat/send-message', [ChatController::class, 'sendMessage']);
    Route::post('/chat/start-conversation', [ChatController::class, 'startConversation']);
    Route::post('/chat/create-group', [ChatController::class, 'createGroup']);


});

Route::post('/change-language', [LanguageController::class, 'change'])
    ->middleware(['web', 'auth']) // ✅ Only web and auth
    ->name('language.change');



require __DIR__ . '/auth.php';
