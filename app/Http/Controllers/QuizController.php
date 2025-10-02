<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    /**
     * Display the objective quiz page
     */
    public function objectivePage(Request $request)
    {
        return Inertia::render('ObjectiveQuestion', [
            'subject' => $request->query('subject'),
            'standard' => $request->query('standard'),
            'sectionId' => $request->query('sectionId'),
            'contentId' => $request->query('contentId'),
            'topic' => $request->query('topic'),
        ]);
    }

    /**
     * Display the subjective page (if needed)
     */
    public function subjectivePage(Request $request)
    {
        return Inertia::render('SubjectivePage', [
            'subject' => $request->query('subject'),
            'standard' => $request->query('standard'),
            'sectionId' => $request->query('sectionId'),
            'contentId' => $request->query('contentId'),
            'topic' => $request->query('topic'),
        ]);
    }

    /**
     * Display the main subject page
     */
    public function subjectPage(Request $request, $subject)
    {
        return Inertia::render('SubjectPage', [
            'subject' => $subject,
            'standard' => $request->query('standard', 'Form 4'),
        ]);
    }

    /**
     * Display subject report page
     */
    public function subjectReport(Request $request, $subject)
    {
        return Inertia::render('SubjectReport', [
            'subject' => $subject,
            'standard' => $request->query('standard', 'Form 4'),
        ]);
    }
}