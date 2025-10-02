<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\School;
use App\Models\QuizSession;
use Illuminate\Support\Facades\Log;

class GamesController extends Controller
{
    public function index()
    {
        $schools = School::select('id', 'name')->orderBy('name')->get();
        
        // Get quiz sessions with school relationship and order by performance
        $quizSessions = QuizSession::with('school')
            ->orderBy('total_correct', 'desc')
            ->orderBy('total_time_seconds', 'asc')
            ->get();

        return Inertia::render('games/QuizLeaderboard', [
            'title' => 'Quiz Section',
            'schools' => $schools,
            'quizSessions' => $quizSessions,
        ]);
    }

public function storeQuizResult(Request $request)
{
    $request->validate([
        'display_name' => 'required|string|max:200',
        'ic_number' => 'required|string|max:20',
        'school_id' => 'required|exists:school,id',
        'total_correct' => 'required|integer|min:0|max:5',
        'total_time_seconds' => 'required|integer|min:0',
    ]);

    try {
        // Check if IC number already exists
        $existingSession = QuizSession::where('ic_number', $request->ic_number)->first();
        
        if ($existingSession) {
            return back()->withErrors([
                'ic_number' => 'IC number already exists! You cannot take the quiz again.'
            ]);
        }

        // Verify school exists
        $school = School::find($request->school_id);
        
        if (!$school) {
            return back()->withErrors([
                'school_id' => 'Selected school not found.'
            ]);
        }

        $quizSession = QuizSession::create([
            'display_name' => $request->display_name,
            'ic_number' => $request->ic_number,
            'total_correct' => $request->total_correct,
            'total_time_seconds' => $request->total_time_seconds,
            'school_id' => $request->school_id,
        ]);

        return redirect()->route('quiz-page')->with('success', 'Quiz submitted successfully! Score: ' . $request->total_correct . '/5');

    } catch (\Exception $e) {
        return back()->withErrors([
            'message' => 'Failed to save quiz results: ' . $e->getMessage()
        ]);
    }
}
}