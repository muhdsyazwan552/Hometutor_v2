<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MasteryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class ChallengeController extends Controller
{
    protected $masteryService;

    public function __construct(MasteryService $masteryService)
    {
        $this->masteryService = $masteryService;
    }

    /**
     * Start a new mastery challenge session
     * POST /api/challenge/start
     */

    public function startChallenge(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|integer',
            'level_id' => 'required|integer'
        ]);

        $userId = Auth::id();
        
        if (!$userId) {
            Log::error('User not authenticated in startChallenge');
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        $subjectId = $request->subject_id;
        $levelId = $request->level_id;

        Log::info('Starting challenge', [
            'user_id' => $userId,
            'subject_id' => $subjectId,
            'level_id' => $levelId
        ]);

        // Check if there's an active session
        $activeSession = DB::table('mastery_challenge_sessions')
            ->where('user_id', $userId)
            ->where('subject_id', $subjectId)
            ->where('level_id', $levelId)
            ->where('status', 'in_progress')
            ->first();

        if ($activeSession) {
            // Check if questions already exist for this session
            $existingQuestions = DB::table('mastery_challenge_questions')
                ->where('session_id', $activeSession->id)
                ->count();

            if ($existingQuestions > 0) {
                Log::info('Continuing existing challenge session', ['session_id' => $activeSession->id]);
                return response()->json([
                    'session_id' => $activeSession->id,
                    'message' => 'Continuing existing challenge'
                ]);
            }
        }

        // Generate questions for the challenge
        $questionIds = $this->masteryService->generateChallengeQuestions(
            $userId,
            $subjectId,
            $levelId,
            10
        );

        if (empty($questionIds)) {
            return response()->json([
                'error' => 'No questions available',
                'message' => 'All topics are mastered or no questions found'
            ], 400);
        }

        // Create new session if needed
        if (!$activeSession) {
            $sessionId = DB::table('mastery_challenge_sessions')->insertGetId([
                'user_id' => $userId,
                'subject_id' => $subjectId,
                'level_id' => $levelId,
                'total_questions' => count($questionIds),
                'correct_answers' => 0,
                'total_time_seconds' => 0,
                'status' => 'in_progress',
                'started_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } else {
            $sessionId = $activeSession->id;
        }

        // Store the question set for this session
        foreach ($questionIds as $index => $questionId) {
            DB::table('mastery_challenge_questions')->insert([
                'session_id' => $sessionId,
                'question_id' => $questionId,
                'question_order' => $index + 1,
                'created_at' => now()
            ]);
        }

        Log::info('Challenge session created with questions', [
            'session_id' => $sessionId,
            'question_count' => count($questionIds)
        ]);

        return response()->json([
            'session_id' => $sessionId,
            'total_questions' => count($questionIds),
            'message' => 'Challenge started successfully'
        ]);
    }


    /**
     * Get next question for the challenge
     * GET /api/challenge/question?session_id=X
     */
    public function getQuestion(Request $request)
    {
        $sessionId = $request->get('session_id');
        
        if (!$sessionId) {
            return response()->json(['error' => 'Session ID required'], 400);
        }

        $session = DB::table('mastery_challenge_sessions')->find($sessionId);
        
        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        if ($session->status !== 'in_progress') {
            return response()->json(['error' => 'Session is not active'], 400);
        }

        // Get already answered question IDs
        $answeredQuestionIds = DB::table('mastery_challenge_attempts')
            ->where('session_id', $sessionId)
            ->pluck('question_id')
            ->toArray();

        $answeredCount = count($answeredQuestionIds);

        Log::info('Getting next question', [
            'session_id' => $sessionId,
            'answered_count' => $answeredCount,
            'total_questions' => $session->total_questions
        ]);

        // Check if challenge is complete
        if ($answeredCount >= $session->total_questions) {
            return response()->json([
                'completed' => true,
                'message' => 'Challenge completed'
            ]);
        }

        // Get the next unanswered question from the session's question set
        $nextQuestion = DB::table('mastery_challenge_questions as mcq')
            ->join('questions as q', 'mcq.question_id', '=', 'q.id')
            ->where('mcq.session_id', $sessionId)
            ->whereNotIn('mcq.question_id', $answeredQuestionIds)
            ->orderBy('mcq.question_order', 'asc')
            ->select('q.*', 'mcq.question_order')
            ->first();

        if (!$nextQuestion) {
            Log::warning('No next question found', [
                'session_id' => $sessionId,
                'answered_count' => $answeredCount
            ]);
            
            return response()->json([
                'completed' => true,
                'message' => 'No more questions available'
            ]);
        }

        // Get answers for the question
        $answers = DB::table('answers')
            ->where('question_id', $nextQuestion->id)
            ->where('isactive', 1)
            ->select(
                'id', 
                'answer_text', 
                'answer_option_file',
                'iscorrectanswer as is_correct_answer',
                'reason',
                'reason2',
                'reason_file'
            )
            ->inRandomOrder()
            ->get();

        Log::info('Returning question', [
            'question_id' => $nextQuestion->id,
            'question_order' => $nextQuestion->question_order,
            'answers_count' => $answers->count()
        ]);

            // Prepare question object
    $questionData = [
        'id' => $nextQuestion->id,
        'topic_id' => $nextQuestion->topic_id
    ];

    // Add question content (either text or file)
    if (!empty($nextQuestion->question_text)) {
        $questionData['question_text'] = $nextQuestion->question_text;
    }
    
    if (!empty($nextQuestion->question_file)) {
        $questionData['question_file'] = $nextQuestion->question_file;
    }


        return response()->json([
            'completed' => false,
            'current_question' => $answeredCount + 1,
            'total_questions' => $session->total_questions,
            'question' => $questionData,
            'answers' => $answers
        ]);
    }

    /**
     * Submit answer for a challenge question
     * POST /api/challenge/answer
     */
    public function submitAnswer(Request $request)
    {
        $request->validate([
            'session_id' => 'required|integer',
            'question_id' => 'required|integer',
            'answer_id' => 'required|integer',
            'time_taken' => 'required|integer'
        ]);

        $sessionId = $request->session_id;
        $questionId = $request->question_id;
        $answerId = $request->answer_id;
        $timeTaken = $request->time_taken;

        $session = DB::table('mastery_challenge_sessions')->find($sessionId);
        
        if (!$session || $session->status !== 'in_progress') {
            return response()->json(['error' => 'Invalid session'], 400);
        }

        // Check if already answered
        $existingAttempt = DB::table('mastery_challenge_attempts')
            ->where('session_id', $sessionId)
            ->where('question_id', $questionId)
            ->first();

        if ($existingAttempt) {
            return response()->json(['error' => 'Question already answered'], 400);
        }

        // Get question details
        $question = DB::table('questions')->find($questionId);
        
        if (!$question) {
            return response()->json(['error' => 'Question not found'], 404);
        }

        // Check if answer is correct
        $answer = DB::table('answers')->find($answerId);
        $isCorrect = $answer && $answer->iscorrectanswer == 1;

        Log::info('Submitting answer', [
            'session_id' => $sessionId,
            'question_id' => $questionId,
            'answer_id' => $answerId,
            'is_correct' => $isCorrect
        ]);

        // Update user's topic mastery
        $masteryUpdate = $this->masteryService->updateTopicMastery(
            $session->user_id,
            $question->topic_id,
            $session->subject_id,
            $session->level_id,
            $isCorrect,
            $timeTaken
        );

        // Record the attempt
        DB::table('mastery_challenge_attempts')->insert([
            'session_id' => $sessionId,
            'user_id' => $session->user_id,
            'question_id' => $questionId,
            'topic_id' => $question->topic_id,
            'subtopic_id' => $question->subtopic_id ?? null,
            'choosen_answer_id' => $answerId,
            'is_correct' => $isCorrect ? 1 : 0,
            'time_taken_seconds' => $timeTaken,
            'previous_mastery_level_id' => $masteryUpdate['previous_level'],
            'new_mastery_level_id' => $masteryUpdate['new_level'],
            'created_at' => now()
        ]);

        // Update session stats
        if ($isCorrect) {
            DB::table('mastery_challenge_sessions')
                ->where('id', $sessionId)
                ->increment('correct_answers');
        }
        
        DB::table('mastery_challenge_sessions')
            ->where('id', $sessionId)
            ->increment('total_time_seconds', $timeTaken);

        // Check if challenge is complete
        $answeredCount = DB::table('mastery_challenge_attempts')
            ->where('session_id', $sessionId)
            ->count();

        $challengeComplete = $answeredCount >= $session->total_questions;

        if ($challengeComplete) {
            DB::table('mastery_challenge_sessions')
                ->where('id', $sessionId)
                ->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                    'updated_at' => now()
                ]);

            // Update progress cache
            $this->masteryService->updateProgressCache(
                $session->user_id,
                $session->subject_id,
                $session->level_id
            );

            Log::info('Challenge completed', ['session_id' => $sessionId]);
        }

        return response()->json([
            'is_correct' => $isCorrect,
            'mastery_changed' => $masteryUpdate['previous_level'] !== $masteryUpdate['new_level'],
            'previous_mastery' => $masteryUpdate['previous_level'],
            'new_mastery' => $masteryUpdate['new_level'],
            'challenge_complete' => $challengeComplete
        ]);
    }



    /**
     * Get challenge summary/results
     * GET /api/challenge/summary?session_id=X
     */
    public function getSummary(Request $request)
    {
        $sessionId = $request->get('session_id');
        
        if (!$sessionId) {
            return response()->json(['error' => 'Session ID required'], 400);
        }

        $session = DB::table('mastery_challenge_sessions')->find($sessionId);
        
        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        // Get all attempts with topic info and mastery changes
        $attempts = DB::table('mastery_challenge_attempts as mca')
            ->join('questions as q', 'mca.question_id', '=', 'q.id')
            ->join('topics as t', 'q.topic_id', '=', 't.id')
            ->leftJoin('mastery_levels as ml_prev', 'mca.previous_mastery_level_id', '=', 'ml_prev.id')
            ->leftJoin('mastery_levels as ml_new', 'mca.new_mastery_level_id', '=', 'ml_new.id')
            ->where('mca.session_id', $sessionId)
            ->select(
                't.name as topic_name',
                'mca.is_correct',
                'ml_prev.name as previous_mastery',
                'ml_new.name as new_mastery',
                'mca.time_taken_seconds'
            )
            ->get();

        // Group by topics showing mastery progression
        $progressByTopic = [];
        foreach ($attempts as $attempt) {
            $topicName = $attempt->topic_name;
            if (!isset($progressByTopic[$topicName])) {
                $progressByTopic[$topicName] = [
                    'topic' => $topicName,
                    'previous_mastery' => $attempt->previous_mastery,
                    'new_mastery' => $attempt->new_mastery,
                    'mastery_changed' => $attempt->previous_mastery !== $attempt->new_mastery
                ];
            } else {
                // Update to latest mastery for this topic
                $progressByTopic[$topicName]['new_mastery'] = $attempt->new_mastery;
                $progressByTopic[$topicName]['mastery_changed'] = 
                    $progressByTopic[$topicName]['previous_mastery'] !== $attempt->new_mastery;
            }
        }

        return response()->json([
            'session_id' => $session->id,
            'total_questions' => $session->total_questions,
            'correct_answers' => $session->correct_answers,
            'total_time_seconds' => $session->total_time_seconds,
            'score_percentage' => $session->total_questions > 0 
                ? round(($session->correct_answers / $session->total_questions) * 100, 1) 
                : 0,
            'status' => $session->status,
            'progress' => array_values($progressByTopic)
        ]);
    }

    /**
 * Get session progress (for reopening modal)
 * GET /api/challenge/progress?session_id=X
 */
public function getProgress(Request $request)
{
    $sessionId = $request->get('session_id');
    
    if (!$sessionId) {
        return response()->json(['error' => 'Session ID required'], 400);
    }

    $session = DB::table('mastery_challenge_sessions')->find($sessionId);
    
    if (!$session) {
        return response()->json(['error' => 'Session not found'], 404);
    }

    // Get all answered questions
    $answers = DB::table('mastery_challenge_attempts')
        ->where('session_id', $sessionId)
        ->orderBy('created_at', 'asc')
        ->select('question_id', 'is_correct', 'created_at')
        ->get();

    return response()->json([
        'session_id' => $session->id,
        'total_questions' => $session->total_questions,
        'answered_count' => $answers->count(),
        'answers' => $answers,
        'status' => $session->status
    ]);
}

/**
 * Start a new practice session for a specific topic
 * POST /api/practice/start
 */
public function startPractice(Request $request)
{
    $request->validate([
        'subject_id' => 'required|integer',
        'level_id' => 'required|integer',
        'topic_id' => 'required|integer'
    ]);

    $userId = Auth::id();
    
    if (!$userId) {
        return response()->json(['error' => 'Not authenticated'], 401);
    }

    $subjectId = $request->subject_id;
    $levelId = $request->level_id;
    $topicId = $request->topic_id;

    Log::info('=== STARTING PRACTICE SESSION ===');
    Log::info('User ID:', ['user_id' => $userId]);
    Log::info('Request data:', [
        'subject_id' => $subjectId,
        'level_id' => $levelId,
        'topic_id' => $topicId
    ]);

    // Check if topic exists and get its info
    $topic = DB::table('topics')->find($topicId);
    if (!$topic) {
        Log::error('Topic not found:', ['topic_id' => $topicId]);
        return response()->json([
            'error' => 'Topic not found',
            'message' => 'The specified topic does not exist'
        ], 404);
    }
    
    Log::info('Topic found:', [
        'id' => $topic->id,
        'name' => $topic->name,
        'subject_id' => $topic->subject_id,
        'level_id' => $topic->level_id
    ]);

    // Check if the topic belongs to the specified subject and level
    if ($topic->subject_id != $subjectId || $topic->level_id != $levelId) {
        Log::warning('Topic mismatch:', [
            'expected_subject' => $subjectId,
            'actual_subject' => $topic->subject_id,
            'expected_level' => $levelId,
            'actual_level' => $topic->level_id
        ]);
        
        // Still proceed, but log the mismatch
    }

    // Generate questions for the practice session
    $questionIds = $this->generatePracticeQuestions($topicId, 5);

    if (empty($questionIds)) {
        // Try with less restrictive query
        Log::info('No questions found with strict filters, trying relaxed search...');
        
        // Try without is_published filter
        $questionIds = DB::table('questions')
            ->where('topic_id', $topicId)
            ->where('is_active', 1)
            ->inRandomOrder()
            ->limit(5)
            ->pluck('id')
            ->toArray();
            
        Log::info('Questions without published filter:', ['ids' => $questionIds]);
        
        if (empty($questionIds)) {
            // Try with only is_active filter
            $questionIds = DB::table('questions')
                ->where('topic_id', $topicId)
                ->inRandomOrder()
                ->limit(5)
                ->pluck('id')
                ->toArray();
                
            Log::info('All questions in topic:', ['ids' => $questionIds]);
        }
        
        if (empty($questionIds)) {
            Log::error('No questions found for topic even with relaxed filters:', ['topic_id' => $topicId]);
            return response()->json([
                'error' => 'No questions available',
                'message' => 'No questions found for this topic. Please check if questions exist in the database.',
                'topic_id' => $topicId,
                'topic_name' => $topic->name
            ], 400);
        }
    }

    Log::info('Questions found:', [
        'count' => count($questionIds),
        'question_ids' => $questionIds
    ]);

    // Create new session
    $sessionId = DB::table('mastery_challenge_sessions')->insertGetId([
        'user_id' => $userId,
        'subject_id' => $subjectId,
        'level_id' => $levelId,
        'total_questions' => count($questionIds),
        'correct_answers' => 0,
        'total_time_seconds' => 0,
        'status' => 'in_progress',
        'started_at' => now(),
        'created_at' => now(),
        'updated_at' => now()
    ]);

    Log::info('Session created:', ['session_id' => $sessionId]);

    // Store the question set
    foreach ($questionIds as $index => $questionId) {
        DB::table('mastery_challenge_questions')->insert([
            'session_id' => $sessionId,
            'question_id' => $questionId,
            'question_order' => $index + 1,
            'created_at' => now()
        ]);
    }

    Log::info('=== PRACTICE SESSION STARTED SUCCESSFULLY ===');

    return response()->json([
        'session_id' => $sessionId,
        'total_questions' => count($questionIds),
        'message' => 'Practice session started successfully',
        'topic_name' => $topic->name
    ]);
}

/**
 * Generate practice questions for a specific topic
 */
private function generatePracticeQuestions($topicId, $questionCount = 5)
{
    Log::info('Looking for questions for topic:', ['topic_id' => $topicId]);
    
    // First, check if the topic exists
    $topic = DB::table('topics')->find($topicId);
    Log::info('Topic found:', ['topic' => $topic]);
    
    // Check total questions in this topic
    $totalQuestions = DB::table('questions')
        ->where('topic_id', $topicId)
        ->count();
    
    Log::info('Total questions in topic:', ['count' => $totalQuestions]);
    
    // Check active questions
    $activeQuestions = DB::table('questions')
        ->where('topic_id', $topicId)
        ->where('is_active', 1)
        ->count();
    
    Log::info('Active questions:', ['count' => $activeQuestions]);
    
    // Check published questions
    $publishedQuestions = DB::table('questions')
        ->where('topic_id', $topicId)
        ->where('is_published', 1)
        ->count();
    
    Log::info('Published questions:', ['count' => $publishedQuestions]);
    
    // Get questions from the specific topic
    $questionIds = DB::table('questions')
        ->where('topic_id', $topicId)
        ->where('is_active', 1)
        ->where('is_published', 1)
        ->inRandomOrder()
        ->limit($questionCount)
        ->pluck('id')
        ->toArray();

    Log::info('Found question IDs:', ['ids' => $questionIds, 'count' => count($questionIds)]);
    
    return $questionIds;
}

/**
 * Get next question for practice - reuse the same logic as challenge
 * GET /api/practice/question?session_id=X
 */
public function getPracticeQuestion(Request $request)
{
    // Reuse the same getQuestion method since tables are the same
    return $this->getQuestion($request);
}

/**
 * Submit answer for practice
 * POST /api/practice/answer
 */
public function submitPracticeAnswer(Request $request)
    {
        $request->validate([
            'session_id' => 'required|integer',
            'question_id' => 'required|integer',
            'answer_id' => 'required|integer',
            'time_taken' => 'required|integer'
        ]);

        $sessionId = $request->session_id;
        $questionId = $request->question_id;
        $answerId = $request->answer_id;
        $timeTaken = $request->time_taken;

        $session = DB::table('mastery_challenge_sessions')->find($sessionId);
        
        if (!$session || $session->status !== 'in_progress') {
            return response()->json(['error' => 'Invalid session'], 400);
        }

        // Check if already answered
        $existingAttempt = DB::table('mastery_challenge_attempts')
            ->where('session_id', $sessionId)
            ->where('question_id', $questionId)
            ->first();

        if ($existingAttempt) {
            return response()->json(['error' => 'Question already answered'], 400);
        }

        // Get question details
        $question = DB::table('questions')->find($questionId);
        
        if (!$question) {
            return response()->json(['error' => 'Question not found'], 404);
        }

        // Check if answer is correct
        $answer = DB::table('answers')->find($answerId);
        $isCorrect = $answer && $answer->iscorrectanswer == 1;

        Log::info('Submitting practice answer', [
            'session_id' => $sessionId,
            'question_id' => $questionId,
            'answer_id' => $answerId,
            'is_correct' => $isCorrect
        ]);

        // Update user's topic mastery
        $masteryUpdate = $this->masteryService->updateTopicMastery(
            $session->user_id,
            $question->topic_id,
            $session->subject_id,
            $session->level_id,
            $isCorrect,
            $timeTaken
        );

        // Record the attempt in existing mastery_challenge_attempts table
        DB::table('mastery_challenge_attempts')->insert([
            'session_id' => $sessionId,
            'user_id' => $session->user_id,
            'question_id' => $questionId,
            'topic_id' => $question->topic_id,
            'subtopic_id' => $question->subtopic_id ?? null,
            'choosen_answer_id' => $answerId,
            'is_correct' => $isCorrect ? 1 : 0,
            'time_taken_seconds' => $timeTaken,
            'previous_mastery_level_id' => $masteryUpdate['previous_level'],
            'new_mastery_level_id' => $masteryUpdate['new_level'],
            'created_at' => now()
        ]);

        // Update session stats
        if ($isCorrect) {
            DB::table('mastery_challenge_sessions')
                ->where('id', $sessionId)
                ->increment('correct_answers');
        }
        
        DB::table('mastery_challenge_sessions')
            ->where('id', $sessionId)
            ->increment('total_time_seconds', $timeTaken);

        // Check if practice is complete
        $answeredCount = DB::table('mastery_challenge_attempts')
            ->where('session_id', $sessionId)
            ->count();

        $practiceComplete = $answeredCount >= $session->total_questions;

        if ($practiceComplete) {
            DB::table('mastery_challenge_sessions')
                ->where('id', $sessionId)
                ->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                    'updated_at' => now()
                ]);

            // Update progress cache
            $this->masteryService->updateProgressCache(
                $session->user_id,
                $session->subject_id,
                $session->level_id
            );

            // NEW: Save to practice_session and quiz_attempts tables
            $this->savePracticeSessionData($sessionId, $session);

            Log::info('Practice completed', ['session_id' => $sessionId]);
        }

        return response()->json([
            'is_correct' => $isCorrect,
            'mastery_changed' => $masteryUpdate['previous_level'] !== $masteryUpdate['new_level'],
            'previous_mastery' => $masteryUpdate['previous_level'],
            'new_mastery' => $masteryUpdate['new_level'],
            'practice_complete' => $practiceComplete
        ]);
    }

private function savePracticeSessionData($sessionId, $session)
    {
        try {
            Log::info('Starting to save practice session data to additional tables', [
                'session_id' => $sessionId,
                'user_id' => $session->user_id
            ]);

            // Get all attempts for this session
            $attempts = DB::table('mastery_challenge_attempts')
                ->where('session_id', $sessionId)
                ->get();

            // Get topic info from first question
            $firstAttempt = $attempts->first();
            if (!$firstAttempt) {
                Log::warning('No attempts found for session', ['session_id' => $sessionId]);
                return;
            }

            // Get topic details
            $topic = DB::table('topics')->find($firstAttempt->topic_id);
            if (!$topic) {
                Log::warning('Topic not found', ['topic_id' => $firstAttempt->topic_id]);
                return;
            }

            // Check if this is a subtopic (parent_id != 0)
            $isSubtopic = false;
            $mainTopicId = $firstAttempt->topic_id;
            $subtopicId = null;

            if ($topic && $topic->parent_id != 0) {
                $isSubtopic = true;
                $mainTopicId = $topic->parent_id;
                $subtopicId = $topic->id;
            }

            // Calculate statistics
            $totalCorrect = DB::table('mastery_challenge_attempts')
                ->where('session_id', $sessionId)
                ->where('is_correct', 1)
                ->count();

            $totalQuestions = $session->total_questions;
            $totalSkipped = 0; // No skipping in practice challenge
            $score = $totalQuestions > 0 ? round(($totalCorrect / $totalQuestions) * 100, 2) : 0;
            $totalTimeSeconds = $session->total_time_seconds;

            Log::info('Practice session statistics', [
                'total_questions' => $totalQuestions,
                'total_correct' => $totalCorrect,
                'score' => $score,
                'total_time_seconds' => $totalTimeSeconds,
                'is_subtopic' => $isSubtopic,
                'main_topic_id' => $mainTopicId,
                'subtopic_id' => $subtopicId
            ]);

            // 1. Insert into practice_session table
            $practiceSessionId = DB::table('practice_session')->insertGetId([
                'user_id' => $session->user_id,
                'subject_id' => $session->subject_id,
                'topic_id' => $mainTopicId,
                'subtopic_id' => $subtopicId,
                'question_type_id' => 1, // Objective
                'start_at' => $session->started_at,
                'end_at' => now(),
                'total_correct' => $totalCorrect,
                'total_skipped' => $totalSkipped,
                'score' => $score,
                'total_time_seconds' => $totalTimeSeconds,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::info('Inserted into practice_session table', [
                'practice_session_id' => $practiceSessionId,
                'mastery_session_id' => $sessionId
            ]);

            // 2. Insert into quiz_attempts table
            $quizAttempts = [];
            
            foreach ($attempts as $attempt) {
                // Get question details
                $question = DB::table('questions')->find($attempt->question_id);
                $parentId = $question ? ($question->parent_id ?? 0) : 0;

                $quizAttempts[] = [
                    'user_id' => $session->user_id,
                    'parent_id' => $parentId,
                    'question_id' => $attempt->question_id,
                    'topic_id' => $mainTopicId,
                    'subtopic_id' => $subtopicId,
                    'choosen_answer_id' => $attempt->choosen_answer_id,
                    'answer_status' => $attempt->is_correct, // 0 = wrong, 1 = correct
                    'subjective_answer' => null,
                    'session_id' => $practiceSessionId, // Link to practice_session table
                    'time_taken' => $attempt->time_taken_seconds,
                    'question_type_id' => 1, // Objective
                    'created_at' => $attempt->created_at ?? now(),
                    'updated_at' => $attempt->created_at ?? now(),
                ];
            }

            if (!empty($quizAttempts)) {
                DB::table('quiz_attempts')->insert($quizAttempts);
                
                Log::info('Inserted into quiz_attempts table', [
                    'count' => count($quizAttempts),
                    'practice_session_id' => $practiceSessionId
                ]);
            }

            // 3. Update mastery_challenge_sessions with practice_session_id reference
            DB::table('mastery_challenge_sessions')
                ->where('id', $sessionId)
                ->update([
                    'practice_session_id' => $practiceSessionId,
                    'updated_at' => now()
                ]);

            Log::info('Successfully saved practice session data to all tables', [
                'mastery_session_id' => $sessionId,
                'practice_session_id' => $practiceSessionId,
                'quiz_attempts_count' => count($quizAttempts)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to save practice session data to additional tables', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Don't throw error to avoid breaking the main flow
            // Just log and continue
        }
    }

/**
 * Get practice summary
 * GET /api/practice/summary?session_id=X
 */
public function getPracticeSummary(Request $request)
{
    try {
        $sessionId = $request->get('session_id');
        
        if (!$sessionId) {
            return response()->json(['error' => 'Session ID required'], 400);
        }

        // Get the session with basic info
        $session = DB::table('mastery_challenge_sessions')->find($sessionId);
        
        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        // Get topic name from the first question in the session
        $topicInfo = DB::table('mastery_challenge_questions as mcq')
            ->join('questions as q', 'mcq.question_id', '=', 'q.id')
            ->leftJoin('topics as t', 'q.topic_id', '=', 't.id')
            ->where('mcq.session_id', $sessionId)
            ->orderBy('mcq.question_order', 'asc')
            ->select('t.name as topic_name')
            ->first();

        // Calculate score percentage
        $scorePercentage = $session->total_questions > 0 
            ? round(($session->correct_answers / $session->total_questions) * 100, 1) 
            : 0;

        // Return only session data (no mastery progress)
        return response()->json([
            'session_id' => $session->id,
            'topic_name' => $topicInfo->topic_name ?? 'Practice Topic',
            'total_questions' => $session->total_questions,
            'correct_answers' => $session->correct_answers,
            'incorrect_answers' => $session->total_questions - $session->correct_answers,
            'total_time_seconds' => $session->total_time_seconds,
            'score_percentage' => $scorePercentage,
            'score' => $session->correct_answers, // Raw score
            'status' => $session->status,
            'started_at' => $session->started_at,
            'completed_at' => $session->completed_at ?? now()->format('Y-m-d H:i:s')
        ]);
        
    } catch (\Exception $e) {
        Log::error('Error in getPracticeSummary:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'error' => 'Internal server error',
            'message' => $e->getMessage()
        ], 500);
    }
}

}