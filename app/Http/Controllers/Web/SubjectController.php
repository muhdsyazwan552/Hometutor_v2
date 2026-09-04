<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\MasteryService;
use App\Support\QuestionContentNormalizer;
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
     * GET /mission/{subject}/progress?subject_id=X&level_id=Y
     */
    public function progress(Request $request, $subject)
    {
        $userId = Auth::id();
        $subjectId = $request->get('subject_id');
        $levelId = $request->get('level_id');

        if (!$userId || !$subjectId || !$levelId) {
            return response()->json(['error' => 'Missing required parameters'], 400);
        }

        // Rebuild from the current topic/subtopic tree so old flat caches do not leak into Mission.
        $this->masteryService->updateProgressCache($userId, $subjectId, $levelId);

        // Get overall progress
        $progress = $this->masteryService->getUserProgress($userId, $subjectId, $levelId);

        // Get topics with mastery status for the sidebar
        $topics = $this->masteryService->getTopicsWithMastery($userId, $subjectId, $levelId);

        $topicsFormatted = $topics->map(function ($topic) {
            return [
                'id' => $topic['id'],
                'title' => $topic['name'],
                'color' => $topic['mastery_color'],
                'mastery_level' => $topic['mastery_level'],
                'current_score' => $topic['current_score'],
                'total_attempts' => $topic['total_attempts'],
                'subtopic_count' => count($topic['subtopics']),
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
     * GET /mission/{subject}/skills?subject_id=X&level_id=Y
     */
    public function skills(Request $request, $subject)
    {
        $userId = Auth::id();
        $subjectId = $request->get('subject_id');
        $levelId = $request->get('level_id');

        if (!$userId || !$subjectId || !$levelId) {
            return response()->json(['error' => 'Missing required parameters'], 400);
        }

        $topics = $this->masteryService->getMissionSubtopics($userId, $subjectId, $levelId);

        return response()->json($topics->values());
    }

    /**
     * Get challenge info
     * GET /mission/{subject}/challenge
     */
    public function challenge(Request $request, $subject)
    {
        return response()->json([
            'title' => 'Mastery Challenge',
            'description' => "Strengthen skills you've already practiced",
            'question_count' => $this->masteryService->getQuestionsPerSession()
        ]);
    }

    /**
     * Get challenge questions for a subject
     * GET /mission/{subject}/challenge-questions
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
            $this->masteryService->getQuestionsPerSession()
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
                    'question_text' => QuestionContentNormalizer::questionHtml($question->question_text, $question->question_file),
                    'question_file' => QuestionContentNormalizer::questionFileUrl($question->question_file)
                ];
            });

        return response()->json([
            'questions' => $questionDetails,
            'count' => count($questions)
        ]);
    }
}
