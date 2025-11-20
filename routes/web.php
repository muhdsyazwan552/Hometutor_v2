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
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SubjectiveController;
use App\Http\Controllers\MissionController;
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
    Route::get('/subject/{subject}/report', [ReportController::class, 'index'])->name('subject-report-page');
    Route::get('/subject/{subject}/mission', [MissionController::class, 'index'])->name('subject-mission-page');

    Route::get('/objective-page', [ObjectiveController::class, 'index'])->name('objective-page');
    Route::get('/subjective-page', [SubjectiveController::class, 'index'])->name('subjective-page');




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
});

require __DIR__ . '/auth.php';
