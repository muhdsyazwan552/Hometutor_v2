<?php

use App\Http\Controllers\Admin\LicenseAdjustmentController as AdminLicenseAdjustmentController;
use App\Http\Controllers\Admin\LicenseManagementController as AdminLicenseManagementController;
use App\Http\Controllers\CodeManager\ActivationCodeController as CodeManagerActivationCodeController;
use App\Http\Controllers\CodeManager\AssistedChildController as CodeManagerAssistedChildController;
use App\Http\Controllers\Parent\ActivationCodeController as ParentActivationCodeController;
use App\Http\Controllers\Parent\CartController as ParentCartController;
use App\Http\Controllers\Parent\ChildController as ParentChildController;
use App\Http\Controllers\Parent\ChildReportCardController as ParentChildReportCardController;
use App\Http\Controllers\Parent\ChildReportController as ParentChildReportController;
use App\Http\Controllers\Parent\DashboardController as ParentDashboardController;
use App\Http\Controllers\Parent\LearningDashboardController as ParentLearningDashboardController;
use App\Http\Controllers\Parent\PackageCheckoutController as ParentPackageCheckoutController;
use App\Http\Controllers\Parent\PaymentCompletionController as ParentPaymentCompletionController;
use App\Http\Controllers\Parent\PaymentLogController as ParentPaymentLogController;
use App\Http\Controllers\Parent\ProfileController as ParentProfileController;
use App\Http\Controllers\Parent\SubscriptionController as ParentSubscriptionController;
use App\Http\Controllers\Web\ChallengeController;
use App\Http\Controllers\Web\ChatController;
use App\Http\Controllers\Web\ChildRenewalController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\FriendController;
use App\Http\Controllers\Web\GamesController;
use App\Http\Controllers\Web\InteractiveController;
use App\Http\Controllers\Web\LanguageController;
<<<<<<< HEAD
use App\Http\Controllers\Api\ChallengeController;
use App\Http\Controllers\Api\SubjectController;
use Illuminate\Foundation\Application;
=======
use App\Http\Controllers\Web\MasteryRankSettingController;
use App\Http\Controllers\Web\MissionController;
use App\Http\Controllers\Web\ObjectiveController;
use App\Http\Controllers\Web\ProfileController;
use App\Http\Controllers\Web\QuestionReportController;
use App\Http\Controllers\Web\ReportController;
use App\Http\Controllers\Web\SubjectContentController;
use App\Http\Controllers\Web\SubjectController;
use App\Http\Controllers\Web\SubjectiveController;
use App\Http\Controllers\Web\ZoomMeetingController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
>>>>>>> 917d4bb (Initial project commit)
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

<<<<<<< HEAD
use App\Http\Controllers\Web\QuizController;
use App\Http\Controllers\Web\ReportController;
use App\Http\Controllers\Web\SubjectiveController;
use App\Http\Controllers\Web\MissionController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\QuestionReportController;
use Illuminate\Support\Facades\Auth;

=======
>>>>>>> 917d4bb (Initial project commit)
Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route(Auth::user()->homeRouteName());
    }
<<<<<<< HEAD
    return Inertia::render('Auth/Login');
});



Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/question-reports', [QuestionReportController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('question-reports.store');


=======

    return Inertia::render('Welcome');
});

Route::get('/demo/literasi-web', function () {
    return Inertia::render('Demos/LiterasiWebGame/Index');
})->name('demo.literasi-web');

Route::get('/demo/literasi-huruf', function () {
    return Inertia::render('Demos/AlphabetTraceGame/Index');
})->name('demo.literasi-huruf');

Route::middleware(['auth', 'verified', 'role:parent'])
    ->prefix('parent')
    ->name('parent.')
    ->group(function () {
        Route::get('/', ParentDashboardController::class)->name('dashboard');
        Route::get('/profile', [ParentProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ParentProfileController::class, 'update'])->middleware('throttle:10,1')->name('profile.update');
        Route::get('/subscriptions', [ParentSubscriptionController::class, 'index'])->name('subscriptions.index');
        Route::get('/payment-activation-log', ParentPaymentLogController::class)->name('payment-log.index');
        Route::get('/packages/{package}/checkout', [ParentPackageCheckoutController::class, 'create'])->name('packages.checkout');
        Route::post('/packages/{package}/checkout', [ParentPackageCheckoutController::class, 'store'])->middleware('throttle:5,1')->name('packages.checkout.store');
        Route::post('/packages/{package}/cart', [ParentPackageCheckoutController::class, 'addToCart'])->middleware('throttle:10,1')->name('packages.cart.store');
        Route::get('/cart', [ParentCartController::class, 'index'])->name('cart.index');
        Route::get('/cart/items/{itemUuid}/edit', [ParentCartController::class, 'edit'])->whereUuid('itemUuid')->name('cart.items.edit');
        Route::patch('/cart/items/{itemUuid}', [ParentCartController::class, 'update'])->whereUuid('itemUuid')->middleware('throttle:20,1')->name('cart.items.update');
        Route::delete('/cart/items/{itemUuid}', [ParentCartController::class, 'destroy'])->whereUuid('itemUuid')->name('cart.items.destroy');
        Route::post('/cart/checkout', [ParentCartController::class, 'checkout'])->middleware('throttle:5,1')->name('cart.checkout');
        Route::post('/children/username-availability', [ParentPackageCheckoutController::class, 'usernameAvailability'])->middleware('throttle:20,1')->name('children.username-availability');
        Route::post('/activation-codes/validate', [ParentActivationCodeController::class, 'validateCode'])->middleware('throttle:10,1')->name('activation-codes.validate');
        Route::post('/activation-codes/{codeUuid}/resend', [ParentSubscriptionController::class, 'resend'])->whereUuid('codeUuid')->middleware('throttle:3,1')->name('activation-codes.resend');
        Route::get('/children', [ParentChildController::class, 'index'])->name('children.index');
        Route::get('/children/create', [ParentChildController::class, 'create'])->name('children.create');
        Route::get('/payments/{payment}/create-child', [ParentPaymentCompletionController::class, 'createChild'])->name('payments.create-child');
        Route::post('/children', [ParentChildController::class, 'store'])->name('children.store');
        Route::get('/children/{childUuid}/renew', [ParentChildController::class, 'renew'])->whereUuid('childUuid')->name('children.renew');
        Route::post('/children/{childUuid}/renew', [ParentChildController::class, 'storeRenewal'])->whereUuid('childUuid')->middleware('throttle:10,1')->name('children.renew.store');
        Route::post('/children/{childUuid}/renew/payment/{package}', [ParentPackageCheckoutController::class, 'storeRenewal'])->whereUuid('childUuid')->middleware('throttle:5,1')->name('children.renew.payment.store');
        Route::get('/children/{childUuid}/learning-dashboard', [ParentLearningDashboardController::class, 'show'])
            ->whereUuid('childUuid')
            ->name('children.learning-dashboard');
        Route::get('/children/{childUuid}/reports', ParentChildReportCardController::class)
            ->whereUuid('childUuid')
            ->name('children.reports');
        Route::get('/children/{childUuid}/reports/session-history', [ParentChildReportController::class, 'index'])
            ->whereUuid('childUuid')
            ->name('children.reports.history');
        Route::get('/children/{childUuid}/report-card', ParentChildReportCardController::class)
            ->whereUuid('childUuid')
            ->name('children.report-card');
        Route::get('/children/{childUuid}/reports/sessions/{sessionUuid}', [ParentChildReportController::class, 'review'])
            ->whereUuid(['childUuid', 'sessionUuid'])
            ->name('children.reports.review');
    });

Route::get('/subscription-required', function () {
    return view('child.subscription-required');
})->middleware(['auth', 'verified', 'role:child'])->name('child.subscription-required');
Route::post('/subscription-required/renew', [ChildRenewalController::class, 'store'])
    ->middleware(['auth', 'verified', 'role:child', 'throttle:10,1'])
    ->name('child.subscription.renew');

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/licenses', [AdminLicenseManagementController::class, 'index'])->name('licenses.index');
    Route::post('/licenses/generate', [AdminLicenseManagementController::class, 'generate'])->name('licenses.generate');
    Route::post('/licenses/test-online-payment', [AdminLicenseManagementController::class, 'testOnlinePayment'])->middleware('throttle:3,1')->name('licenses.test-online-payment');
    Route::post('/licenses/codes/{codeUuid}/revoke', [AdminLicenseManagementController::class, 'revoke'])->whereUuid('codeUuid')->name('licenses.codes.revoke');
    Route::put('/licenses/packages/{package}', [AdminLicenseManagementController::class, 'updatePackage'])->name('licenses.packages.update');
    Route::post('/companies', [AdminLicenseManagementController::class, 'storeCompany'])->name('companies.store');
    Route::put('/companies/{company}/code-series', [AdminLicenseManagementController::class, 'updateCompanySeries'])->name('companies.code-series.update');
    Route::post('/license-requests/{licenseRequest}/approve', [AdminLicenseAdjustmentController::class, 'approve'])->name('license-requests.approve');
    Route::post('/license-requests/{licenseRequest}/reject', [AdminLicenseAdjustmentController::class, 'reject'])->name('license-requests.reject');
    Route::post('/license-requests/{licenseRequest}/complete', [AdminLicenseAdjustmentController::class, 'complete'])->name('license-requests.complete');
});

Route::middleware(['auth', 'verified', 'role:code-manager'])->prefix('code-manager')->name('code-manager.')->group(function () {
    Route::get('/', [CodeManagerActivationCodeController::class, 'index'])->name('index');
    Route::get('/per-person-generate', [CodeManagerActivationCodeController::class, 'individualPage'])->name('individual.index');
    Route::get('/assisted-child', [CodeManagerAssistedChildController::class, 'create'])->name('assisted-child.create');
    Route::get('/assisted-child/parents/search', [CodeManagerAssistedChildController::class, 'searchParent'])->middleware('throttle:30,1')->name('assisted-child.parents.search');
    Route::post('/assisted-child/code/check', [CodeManagerAssistedChildController::class, 'checkCode'])->middleware('throttle:20,1')->name('assisted-child.code.check');
    Route::post('/assisted-child', [CodeManagerAssistedChildController::class, 'store'])->middleware('throttle:10,1')->name('assisted-child.store');
    Route::get('/bulk-generate', [CodeManagerActivationCodeController::class, 'bulkPage'])->name('bulk.index');
    Route::get('/code-register', [CodeManagerActivationCodeController::class, 'registerPage'])->name('register.index');
    Route::post('/codes', [CodeManagerActivationCodeController::class, 'store'])->middleware('throttle:10,1')->name('codes.store');
    Route::post('/code-batches', [CodeManagerActivationCodeController::class, 'storeBulk'])->middleware('throttle:3,1')->name('batches.store');
    Route::get('/code-batches/{batch}/export', [CodeManagerActivationCodeController::class, 'exportBatch'])->name('batches.export');
    Route::post('/codes/{codeUuid}/resend', [CodeManagerActivationCodeController::class, 'resend'])->whereUuid('codeUuid')->middleware('throttle:3,1')->name('codes.resend');
    Route::post('/codes/{codeUuid}/revoke', [CodeManagerActivationCodeController::class, 'revoke'])->whereUuid('codeUuid')->name('codes.revoke');
    Route::post('/codes/{codeUuid}/parent-requests', [CodeManagerActivationCodeController::class, 'recordParentRequest'])->whereUuid('codeUuid')->middleware('throttle:10,1')->name('parent-requests.store');
    Route::put('/password', [CodeManagerActivationCodeController::class, 'updatePassword'])->middleware('throttle:5,1')->name('password.update');
});

Route::middleware(['auth', 'verified', 'role:child,admin', 'child.subscribed'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/zoom/meetings/{zoomMeeting}/join', [ZoomMeetingController::class, 'show'])
        ->name('zoom.meetings.join');
    Route::post('/zoom/meetings/{zoomMeeting}/signature', [ZoomMeetingController::class, 'signature'])
        ->middleware('throttle:10,1')
        ->name('zoom.meetings.signature');

>>>>>>> 917d4bb (Initial project commit)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/picture', [ProfileController::class, 'updateProfilePicture'])->name('profile.picture.update');

    Route::post('/question-reports', [QuestionReportController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('question-reports.store');

    Route::get('/subject/{subject}', [SubjectContentController::class, 'index'])->name('subject-page');
<<<<<<< HEAD
=======
    Route::get('/practice/next-topic', [SubjectContentController::class, 'nextPracticeTopic'])->name('practice.next-topic');
>>>>>>> 917d4bb (Initial project commit)

    Route::get('/subject/{subject}/mission', [MissionController::class, 'index'])->name('subject-mission-page');

    Route::get('/settings/mastery-ranks', [MasteryRankSettingController::class, 'edit'])->name('mastery-ranks.edit');
    Route::put('/settings/mastery-ranks', [MasteryRankSettingController::class, 'update'])->name('mastery-ranks.update');

    Route::get('/objective-page', [ObjectiveController::class, 'index'])->name('objective-page');
    Route::post('/practice-session/objective', [ObjectiveController::class, 'completePractice']);
    Route::post('/objective-page/restart', [ObjectiveController::class, 'restart'])->name('objective-page.restart');
<<<<<<< HEAD


    Route::get('/subjective-page', [SubjectiveController::class, 'index'])->name('subjective-page');
    Route::post('/practice-session/subjective', [SubjectiveController::class, 'completePractice']);


    Route::get('/subtopic/{subtopicId}/details', [ReportController::class, 'getSubtopicDetails'])->name('subtopic-details');
    Route::get('/session/{sessionId}/review', [ReportController::class, 'getQuestionAttempts'])->name('session.review');
    Route::get('/review/session/{sessionId}', [ReportController::class, 'reviewPage'])->name('review.page');
    Route::get('/subject/{subject}/report', [ReportController::class, 'index'])->name('subject-report-page');


    Route::get('/friends', [FriendController::class, 'index'])->name('friends.index');
    Route::post('/friends/send-request', [FriendController::class, 'sendRequest'])->name('friends.send-request');
    Route::post('/friends/accept-request/{requestId}', [FriendController::class, 'acceptRequest'])->name('friends.accept-request');
    Route::post('/friends/reject-request/{requestId}', [FriendController::class, 'rejectRequest'])->name('friends.reject-request');
    Route::delete('/friends/remove/{friendId}', [FriendController::class, 'removeFriend'])->name('friends.remove');
=======
>>>>>>> 917d4bb (Initial project commit)

    Route::get('/subjective-page', [SubjectiveController::class, 'index'])->name('subjective-page');
    Route::post('/practice-session/subjective', [SubjectiveController::class, 'completePractice']);

    Route::get('/subtopic/{subtopicId}/details', [ReportController::class, 'getSubtopicDetails'])->name('subtopic-details');
    Route::get('/session/{sessionId}/review', [ReportController::class, 'getQuestionAttempts'])->name('session.review');
    Route::get('/review/session/{sessionId}', [ReportController::class, 'reviewPage'])->name('review.page');
    Route::get('/subject/{subject}/report', [ReportController::class, 'index'])->name('subject-report-page');

    Route::get('/subject/{subject}/interact', [InteractiveController::class, 'index'])->name('subject-interactive-page');
    Route::get('/interactive-games/{game}/play', [InteractiveController::class, 'play'])->name('interactive-games.play');

    Route::get('/friends', [FriendController::class, 'index'])->name('friends.index');
    Route::post('/friends/send-request', [FriendController::class, 'sendRequest'])->name('friends.send-request');
    Route::post('/friends/accept-request/{requestId}', [FriendController::class, 'acceptRequest'])->name('friends.accept-request');
    Route::post('/friends/reject-request/{requestId}', [FriendController::class, 'rejectRequest'])->name('friends.reject-request');
    Route::delete('/friends/remove/{friendId}', [FriendController::class, 'removeFriend'])->name('friends.remove');

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

<<<<<<< HEAD
    Route::post('/api/challenge/start', [ChallengeController::class, 'startChallenge'])->name('api.challenge.start');
    Route::get('/api/challenge/question', [ChallengeController::class, 'getQuestion'])->name('api.challenge.question');
    Route::post('/api/challenge/answer', [ChallengeController::class, 'submitAnswer'])->name('api.challenge.answer');
    Route::get('/api/challenge/summary', [ChallengeController::class, 'getSummary'])->name('api.challenge.summary');
    Route::get('/api/challenge/progress', [ChallengeController::class, 'getProgress'])->name('api.challenge.progress');
    Route::get('/api/progress/{subject}', [SubjectController::class, 'progress'])->name('api.progress');
    Route::get('/api/skills/{subject}', [SubjectController::class, 'skills'])->name('api.skills');
    Route::get('/api/subject/{subject}/challenge', [SubjectController::class, 'challenge'])->name('api.challenge');

    Route::post('/api/practice/start', [ChallengeController::class, 'startPractice'])->name('api.practice.start');
    Route::get('/api/practice/question', [ChallengeController::class, 'getPracticeQuestion'])->name('api.practice.question');
    Route::post('/api/practice/answer', [ChallengeController::class, 'submitPracticeAnswer'])->name('api.practice.answer');
    Route::get('/api/practice/summary', [ChallengeController::class, 'getPracticeSummary'])->name('api.practice.summary');




=======
    Route::prefix('mission')->name('mission.')->group(function () {
        Route::get('/{subject}/progress', [SubjectController::class, 'progress'])->name('progress');
        Route::get('/{subject}/skills', [SubjectController::class, 'skills'])->name('skills');
        Route::get('/{subject}/challenge', [SubjectController::class, 'challenge'])->name('challenge.info');

        Route::prefix('challenge')->name('challenge.')->group(function () {
            Route::post('/start', [ChallengeController::class, 'startChallenge'])->name('start');
            Route::get('/question', [ChallengeController::class, 'getQuestion'])->name('question');
            Route::post('/answer', [ChallengeController::class, 'submitAnswer'])->name('answer');
            Route::get('/summary', [ChallengeController::class, 'getSummary'])->name('summary');
            Route::get('/progress', [ChallengeController::class, 'getProgress'])->name('progress');
        });

        Route::prefix('practice')->name('practice.')->group(function () {
            Route::post('/start', [ChallengeController::class, 'startPractice'])->name('start');
            Route::get('/question', [ChallengeController::class, 'getPracticeQuestion'])->name('question');
            Route::post('/answer', [ChallengeController::class, 'submitPracticeAnswer'])->name('answer');
            Route::get('/summary', [ChallengeController::class, 'getPracticeSummary'])->name('summary');
        });
    });
>>>>>>> 917d4bb (Initial project commit)

    Route::get('/test-questions/{topicId}', function ($topicId) {
        $questions = DB::table('questions')
            ->where('topic_id', $topicId)
            ->get();

        $questionsWithFilters = DB::table('questions')
            ->where('topic_id', $topicId)
            ->where('question_type_id', 1)
            ->where('is_active', 1)
            // ->where('is_published', 1)
            // ->where('approval_status', 'approved')
            ->get();

        return response()->json([
            'topic_id' => $topicId,
            'all_questions_count' => $questions->count(),
            'filtered_questions_count' => $questionsWithFilters->count(),
            'all_questions' => $questions,
<<<<<<< HEAD
            'filtered_questions' => $questionsWithFilters
=======
            'filtered_questions' => $questionsWithFilters,
>>>>>>> 917d4bb (Initial project commit)
        ]);
    });
});

Route::post('/change-language', [LanguageController::class, 'change'])->middleware(['web', 'auth'])->name('language.change');

require __DIR__.'/auth.php';
