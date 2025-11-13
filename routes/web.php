<?php

use App\Http\Controllers\MenuController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\GamesController;
use App\Http\Controllers\SubjectContentController;
use App\Http\Controllers\ObjectiveController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\QuizController;
use App\Http\Controllers\SubjectiveController;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('Auth/Login');
});

Route::get('/dashboard', function () {
    $menuController = new MenuController();
    $schoolSubjects = $menuController->getSchoolSubjects();

    return Inertia::render('Dashboard', [
        'schoolSubjects' => $schoolSubjects
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


    Route::get('/subject/{subject}', [SubjectContentController::class, 'index'])->name('subject-page');

    Route::get('/objective-page', [ObjectiveController::class, 'index'])->name('objective-page');

    Route::get('/subjective-page', [SubjectiveController::class, 'index'])->name('subjective-page');


    // Route::get('/subjective-page', function () {
    //     return Inertia::render('courses/training/SubjectiveQuestion', [
    //         'subject' => request('subject'),
    //         'standard' => request('standard'),
    //         'sectionId' => request('sectionId'),
    //         'contentId' => request('contentId'),
    //         'topic' => request('topic'),
    //         'topic_id' => request('topic_id'), // Add this
    //     ]);
    // })->name('subjective-page');


    Route::get('/subject/{subject}/report', function ($subject) {
        $allowed = [
            'bahasa-melayu' => 'Bahasa Melayu',
            'bahasa-inggeris' => 'Bahasa Inggeris',
            'matematik' => 'Matematik',
            'sains' => 'Sains',
        ];

        abort_unless(array_key_exists($subject, $allowed), 404);

        return Inertia::render('courses/SubjectReportPage', [
            'subject' => $subject,
            'subjectTitle' => '' . $allowed[$subject],
        ]);
    });


    Route::post('/objective-page/restart', [ObjectiveController::class, 'restart'])->name('objective-page.restart');



    Route::get('/tekakata-page', function () {
        return Inertia::render('games/TekaKataPage');
    })->name('tekakata-page');

    Route::get('/quiz-page', [GamesController::class, 'index'])->name('quiz-page');
    Route::post('/quiz/submit', [GamesController::class, 'storeQuizResult'])->name('quiz.submit');

    Route::get('/question-section', function () {
        return Inertia::render('games/QuizInterface');
    })->name('question-section');
});

require __DIR__ . '/auth.php';
