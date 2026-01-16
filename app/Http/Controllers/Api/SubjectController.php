<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MasteryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SubjectController extends Controller
{
    protected $masteryService;

    public function __construct(MasteryService $masteryService)
    {
        $this->masteryService = $masteryService;
    }

    /**
     * Get user's mastery progress for a subject
     * GET /api/progress/{subject}?subject_id=X&level_id=Y
     */
    public function progress(Request $request, $subject)
    {
        $userId = Auth::id();
        $subjectId = $request->get('subject_id');
        $levelId = $request->get('level_id');

        if (!$userId || !$subjectId || !$levelId) {
            return response()->json(['error' => 'Missing required parameters'], 400);
        }

        // Get overall progress
        $progress = $this->masteryService->getUserProgress($userId, $subjectId, $levelId);

        // Get topics with mastery status for the sidebar
        $topics = $this->masteryService->getTopicsWithMastery($userId, $subjectId, $levelId);

        $topicsFormatted = $topics->map(function ($topic) {
            return [
                'title' => $topic->name,
                'color' => $topic->mastery_color ?? '#f3f4f6',
                'mastery_level' => $topic->mastery_level ?? 'not_started',
                'current_score' => $topic->current_score ?? 0,
                'total_attempts' => $topic->total_attempts ?? 0
            ];
        });

        return response()->json([
            'percentage' => $progress ? round($progress->overall_percentage) : 0,
            'skills' => [
                'mastered' => $progress->mastered_count ?? 0,
                'proficient' => $progress->proficient_count ?? 0,
                'familiar' => $progress->familiar_count ?? 0,
                'practiced' => $progress->practiced_count ?? 0,
                'needPractice' => $progress->need_practice_count ?? 0,
            ],
            'topics' => $topicsFormatted
        ]);
    }

    /**
     * Get skills/topics that need practice
     * GET /api/skills/{subject}?subject_id=X&level_id=Y
     */
    public function skills(Request $request, $subject)
    {
        $userId = Auth::id();
        $subjectId = $request->get('subject_id');
        $levelId = $request->get('level_id');

        if (!$userId || !$subjectId || !$levelId) {
            return response()->json(['error' => 'Missing required parameters'], 400);
        }

        $topics = $this->masteryService->getTopicsNeedingPractice($userId, $subjectId, $levelId);

        $formatted = $topics->map(function ($topic) {
            return [
                'id' => $topic->id,
                'name' => $topic->name,
                'mastery_level' => $topic->mastery_level ?? 'not_started',
                'mastery_color' => $topic->mastery_color ?? '#f3f4f6'
            ];
        });

        return response()->json($formatted);
    }

    /**
     * Get challenge info
     * GET /api/challenge/{subject}
     */
    public function challenge(Request $request, $subject)
    {
        return response()->json([
            'title' => 'Mastery Challenge',
            'description' => "Strengthen skills you've already practiced",
            'question_count' => 10
        ]);
    }

    /**
     * Get challenge questions for a subject
     * GET /api/subject/{subject}/challenge-questions
     */
    public function challengeQuestions(Request $request, $subject)
    {
        $userId = Auth::id();
        $subjectId = $request->get('subject_id');
        $levelId = $request->get('level_id');

        if (!$userId || !$subjectId || !$levelId) {
            return response()->json(['error' => 'Missing required parameters'], 400);
        }

        // Get questions using your MasteryService
        $questions = $this->masteryService->generateChallengeQuestions(
            $userId,
            $subjectId,
            $levelId,
            10
        );

        if (empty($questions)) {
            return response()->json([
                'error' => 'No questions available',
                'message' => 'All topics are mastered or no questions found'
            ], 400);
        }

        // Get question details
        $questionDetails = DB::table('questions as q')
            ->whereIn('q.id', $questions)
            ->select('q.*')
            ->get()
            ->map(function ($question) {
                return [
                    'id' => $question->id,
                    'topic_id' => $question->topic_id,
                    'question_text' => $question->question_text,
                    'question_file' => $question->question_file
                ];
            });

        return response()->json([
            'questions' => $questionDetails,
            'count' => count($questions)
        ]);
    }
}
