<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('Auth/Login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// web.php
Route::get('/subject/{subject}', function ($subject) {
    $allowed = [
        'bahasa-melayu' => 'Bahasa Melayu',
        'bahasa-inggeris' => 'Bahasa Inggeris',
        'matematik' => 'Matematik',
        'sains' => 'Sains',
    ];

    abort_unless(array_key_exists($subject, $allowed), 404);

    return Inertia::render('courses/SubjectPage', [
        'subject' => $subject,
        'subjectTitle' => 'School Subject - ' . $allowed[$subject],
    ]);
});


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

Route::get('/objective-page', function () {
    return Inertia::render('courses/training/ObjectiveQuizPage');
})->name('objective-page');

Route::get('/subjective-page', function () {
    return Inertia::render('courses/training/SubjectiveQuizPage');
})->name('subjective-page');

Route::get('/tekakata-page', function () {
    return Inertia::render('games/TekaKataPage');
})->name('tekakata-page');

require __DIR__.'/auth.php';
