<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ObjectiveController extends Controller
{
    /**
     * Display the objective questions page
     */
    public function index(Request $request)
    {
        // Get questions from database based on topic_id
        $questions = [];
        $topicName = 'General';

        // Focus on topic_id only
        $topicId = $request->query('topic_id');

        Log::info('ObjectiveQuestion Request - Topic ID:', ['topic_id' => $topicId]);

        if ($topicId) {
            Log::info('🟢 Using topic_id to fetch questions: ' . $topicId);
            $questions = $this->getQuestionsByTopic($topicId);

            // Get topic name using query builder
            $topic = DB::table('topics')->where('id', $topicId)->first();
            if ($topic) {
                $topicName = $topic->name;
                Log::info("Found topic: {$topic->name} (ID: {$topic->id})");
            }
        } else {
            Log::warning('🔴 No topic_id provided');
        }

        // Simplified logging - just show the essential info
        Log::info("🎯 Sending to frontend:", [
            'topic_id' => $topicId,
            'topic_name' => $topicName,
            'questions_count' => count($questions),
            'questions_sample' => count($questions) > 0 ? [
                'first_question_id' => $questions[0]['id'] ?? null,
                'first_question_text' => substr($questions[0]['question_text'] ?? 'NULL', 0, 100),
                'first_question_options' => count($questions[0]['options'] ?? [])
            ] : 'NO QUESTIONS'
        ]);

        return Inertia::render('courses/training/ObjectiveQuestion', [
            'subject' => $request->query('subject'),
            'standard' => $request->query('standard'),
            'sectionId' => $request->query('sectionId'),
            'sectionTitle' => $request->query('sectionTitle'),
            'contentId' => $request->query('contentId'),
            'topic' => $topicName,
            'topic_id' => $topicId,
            'subject_id' => $request->subject_id,
            'level_id' => $request->level_id,
            'questions' => $questions,
            'question_count' => count($questions),
            'total_available' => $topicId ? $this->getTotalAvailableQuestions($topicId) : 0,
        ]);
    }

    /**
     * Get questions by topic ID
     */
    /**
     * Get questions by topic ID
     */
    private function getQuestionsByTopic($topicId)
    {
        Log::info("🔍 Starting getQuestionsByTopic for topic ID: {$topicId}");

        // DEBUG: Check each filter step by step
        $totalQuestions = DB::table('questions')->where('topic_id', $topicId)->count();
        Log::info("1. Total questions with topic_id {$topicId}: {$totalQuestions}");

        // Since your questions have is_published=0 and approval_status=0,
        // we need to adjust the filters

        // TEMPORARY: For testing, let's see what happens with different filters
        $questions = DB::table('questions')
            ->select('questions.*')
            ->where('questions.topic_id', $topicId)
            ->where('questions.question_type_id', 1) // Objective questions
            ->where('questions.is_active', 1)
            // ->where('questions.is_published', 1) // COMMENT OUT for now
            // ->where('questions.approval_status', 'approved') // COMMENT OUT for now
            ->orderByRaw('RAND()')
            ->limit(5)
            ->get();

        Log::info("🚨 DEBUG - Questions found (with only active filter): " . $questions->count());

        // Log each question's details
        foreach ($questions as $index => $question) {
            Log::info("Question #{$index} details:", [
                'id' => $question->id,
                'question_text' => $question->question_text ? substr($question->question_text, 0, 100) . '...' : 'NULL',
                'question_file' => $question->question_file ?? 'NULL',
                'question_type_id' => $question->question_type_id,
                'topic_id' => $question->topic_id,
                'is_active' => $question->is_active,
                'is_published' => $question->is_published,
                'approval_status' => $question->approval_status
            ]);
        }

        // Get answers for each question
        $questionsWithAnswers = [];
        foreach ($questions as $question) {
            // IMPORTANT: Based on your Answer model, the field is 'isactive' not 'is_active'
            $answers = DB::table('answers')
                ->where('question_id', $question->id)
                // ->where('isactive', 1) // You can comment this out temporarily
                ->orderBy('seq')
                ->get()
                ->toArray();

            Log::info("Question {$question->id} has " . count($answers) . " answers");

            // Log answer details
            foreach ($answers as $answerIndex => $answer) {
                Log::info("  Answer #{$answerIndex}:", [
                    'id' => $answer->id,
                    'answer_text' => $answer->answer_text ? substr($answer->answer_text, 0, 50) . '...' : 'NULL',
                    'iscorrectanswer' => $answer->iscorrectanswer,
                    'isactive' => $answer->isactive ?? 'NOT SET'
                ]);
            }

            $question->answers = $answers;
            $questionsWithAnswers[] = $question;
        }

        return $this->formatQuestions(collect($questionsWithAnswers));
    }

    /**
     * Get questions by topic name and subject
     */
    private function getQuestionsByTopicName($topicName, $subjectName = null, $limit = 5)
    {
        $query = DB::table('topics')
            ->select('topics.*')
            ->where('topics.name', 'like', '%' . $topicName . '%')
            ->where('topics.is_active', 1);

        if ($subjectName) {
            $query->join('subjects', 'topics.subject_id', '=', 'subjects.id')
                ->where('subjects.name', 'like', '%' . $subjectName . '%');
        }

        $topic = $query->orderByRaw('RAND()')->first();

        if (!$topic) {
            Log::warning("No topic found for name: {$topicName}, subject: {$subjectName}");
            return $this->getFallbackQuestions($topicName);
        }

        // Get questions for this topic
        $questions = DB::table('questions')
            ->select('questions.*')
            ->where('questions.topic_id', $topic->id)
            ->where('questions.is_active', 1)
            // ->where('questions.is_published', 1)
            ->where('questions.approval_status', 'approved')
            ->orderByRaw('RAND()')
            ->limit($limit)
            ->get();

        $totalQuestions = DB::table('questions')
            ->where('topic_id', $topic->id)
            ->where('is_active', 1)
            // ->where('is_published', 1)
            ->where('approval_status', 'approved')
            ->count();

        Log::info("Topic '{$topicName}': {$totalQuestions} total questions available, fetching {$limit}");

        if ($questions->isEmpty()) {
            Log::warning("Topic '{$topicName}' found but has no questions");
            return $this->getFallbackQuestions($topicName);
        }

        // Get answers for each question
        $questionsWithAnswers = [];
        foreach ($questions as $question) {
            $answers = DB::table('answers')
                ->where('question_id', $question->id)
                ->where('is_active', 1)
                ->orderBy('seq')
                ->get()
                ->toArray();

            $question->answers = $answers;
            $questionsWithAnswers[] = $question;
        }

        Log::info("Successfully fetched " . count($questionsWithAnswers) . " questions for topic: {$topicName}");

        return $this->formatQuestions(collect($questionsWithAnswers));
    }

    /**
     * Get total available questions for logging
     */
    private function getTotalAvailableQuestions($topicId)
    {
        return DB::table('questions')
            ->where('topic_id', $topicId)
            ->where('is_active', 1)
            // ->where('is_published', 1)
            ->where('approval_status', 'approved')
            ->count();
    }

    /**
     * Format questions for frontend
     */
    private function formatQuestions($questions)
    {
        return $questions->map(function ($question, $index) {
            // Get topic name
            $topicName = 'General';
            if ($question->topic_id) {
                $topic = DB::table('topics')->where('id', $question->topic_id)->first();
                $topicName = $topic ? $topic->name : 'General';
            }

            return [
                'id' => $question->id,
                'question_text' => $question->question_text,
                'question_file' => $question->question_file,
                'question_type' => $this->determineQuestionType($question),
                'options' => $this->formatAnswers($question->answers ?? []),
                'correctAnswer' => $this->getCorrectAnswerIndex($question),
                'explanation' => $this->getExplanation($question),
                'category' => $topicName,
                'difficulty' => $this->getDifficultyLevel($question->difficulty_type_id),
                'difficulty_type_id' => $question->difficulty_type_id,
            ];
        })->toArray();
    }

    /**
     * Determine question display type
     */
    private function determineQuestionType($question)
    {
        // Check if question_text exists and is not empty
        if (!empty($question->question_text)) {
            return 'html';
        }
        // Check if question_file exists and is not empty
        elseif (!empty($question->question_file)) {
            return 'image';
        } else {
            return 'problem';
        }
    }

    /**
     * Format answers with their display types
     */
    private function formatAnswers($answers)
    {
        Log::info("Formatting answers:", [
            'count' => count($answers),
            'sample' => count($answers) > 0 ? [
                'first_answer_id' => $answers[0]->id ?? null,
                'has_text' => !empty($answers[0]->answer_text),
                'has_file' => !empty($answers[0]->answer_option_file),
                'first_is_correct' => $answers[0]->iscorrectanswer ?? false
            ] : 'NO ANSWERS'
        ]);

        return collect($answers)->map(function ($answer) {
            // Determine the display type based on available content
            $hasText = !empty($answer->answer_text);
            $hasFile = !empty($answer->answer_option_file);
            $hasHtmlContent = $hasText && preg_match('/<img|<div|<p>/i', $answer->answer_text);

            $type = 'text'; // Default

            if ($hasHtmlContent) {
                $type = 'html';
            } elseif ($hasFile) {
                $type = 'image';
            } elseif ($hasText) {
                $type = 'text';
            }

            // Handle image URL construction
            $fileUrl = null;
            if ($hasFile) {
                $fileUrl = $this->getAnswerFileUrl($answer->answer_option_file);
                Log::debug("Answer file URL constructed:", [
                    'original' => $answer->answer_option_file,
                    'url' => $fileUrl
                ]);
            }

            return [
                'id' => $answer->id,
                'text' => $answer->answer_text,
                'file' => $fileUrl,
                'type' => $type,
                'has_html' => $hasHtmlContent,
                'has_text' => $hasText,
                'has_file' => $hasFile
            ];
        })->toArray();
    }

    /**
     * Get question file URL
     */
    private function getQuestionFileUrl($filename)
    {
        if (empty($filename)) {
            Log::debug('getQuestionFileUrl: filename is empty');
            return null;
        }

        // If filename is already a full URL, return it as is
        if (filter_var($filename, FILTER_VALIDATE_URL)) {
            Log::debug('getQuestionFileUrl: already a URL', ['url' => $filename]);
            return $filename;
        }

        // If it's a full S3 path stored in database, return it
        if (strpos($filename, 'https://') === 0 || strpos($filename, 'http://') === 0) {
            Log::debug('getQuestionFileUrl: full URL detected', ['url' => $filename]);
            return $filename;
        }

        // Check if it's already a relative path
        if (strpos($filename, 'questions/') === 0 || strpos($filename, 'answers/') === 0) {
            // Already has folder structure
            return 'https://ptrs-elearning.s3.ap-southeast-1.amazonaws.com/' . $filename;
        }

        // Default: assume it's in questions folder
        Log::debug('getQuestionFileUrl: constructing URL for', ['filename' => $filename]);
        return 'https://ptrs-elearning.s3.ap-southeast-1.amazonaws.com/questions/' . $filename;
    }

    /**
     * Get answer file URL
     */
    private function getAnswerFileUrl($filename)
    {
        if (empty($filename)) {
            Log::debug('getAnswerFileUrl: filename is empty');
            return null;
        }

        // If filename is already a full URL, return it as is
        if (filter_var($filename, FILTER_VALIDATE_URL)) {
            Log::debug('getAnswerFileUrl: already a URL', ['url' => $filename]);
            return $filename;
        }

        // If it's a full S3 path stored in database, return it
        if (strpos($filename, 'https://') === 0 || strpos($filename, 'http://') === 0) {
            Log::debug('getAnswerFileUrl: full URL detected', ['url' => $filename]);
            return $filename;
        }

        // Check if it's already a relative path
        if (strpos($filename, 'answers/') === 0 || strpos($filename, 'questions/') === 0) {
            // Already has folder structure
            return 'https://ptrs-elearning.s3.ap-southeast-1.amazonaws.com/' . $filename;
        }

        // Default: assume it's in answers folder
        Log::debug('getAnswerFileUrl: constructing URL for', ['filename' => $filename]);
        return 'https://ptrs-elearning.s3.ap-southeast-1.amazonaws.com/answers/' . $filename;
    }

    /**
     * Get correct answer index
     */
    private function getCorrectAnswerIndex($question)
    {
        if (!isset($question->answers) || empty($question->answers)) {
            return 0;
        }

        // Find correct answer
        $correctAnswer = null;
        foreach ($question->answers as $answer) {
            if ($answer->iscorrectanswer == 1 || $answer->iscorrectanswer === true) {
                $correctAnswer = $answer;
                break;
            }
        }

        if (!$correctAnswer) {
            return 0;
        }

        // Sort answers by seq and find index
        $sortedAnswers = collect($question->answers)->sortBy('seq')->values();
        $index = $sortedAnswers->search(function ($answer) use ($correctAnswer) {
            return $answer->id == $correctAnswer->id;
        });

        return $index !== false ? $index : 0;
    }

    /**
     * Get explanation from question or answers
     */
    private function getExplanation($question)
    {
        // Check if any answer has a reason
        if (isset($question->answers) && !empty($question->answers)) {
            foreach ($question->answers as $answer) {
                if (!empty($answer->reason)) {
                    // Check if reason contains HTML
                    $hasHtml = preg_match('/<p[^>]*>|<br>|<div/i', $answer->reason);

                    if ($hasHtml) {
                        // Process HTML explanation
                        return $this->processExplanationHtml($answer->reason);
                    }

                    return $answer->reason;
                }
            }
        }

        // Fallback: check question explanation field if it exists
        if (!empty($question->explanation)) {
            $hasHtml = preg_match('/<p[^>]*>|<br>|<div/i', $question->explanation);

            if ($hasHtml) {
                return $this->processExplanationHtml($question->explanation);
            }

            return $question->explanation;
        }

        return "Explanation not available.";
    }

    /**
     * Process HTML explanation to add proper styling
     */
    private function processExplanationHtml($html)
    {
        // Add Tailwind classes to paragraphs and clean up HTML
        $processedHtml = preg_replace('/<p([^>]*)>/', '<p$1 class="mb-3 text-gray-700 leading-relaxed">', $html);

        // Remove data attributes for cleaner output if desired
        $processedHtml = preg_replace('/\s+data-[^=]+="[^"]*"/', '', $processedHtml);

        return $processedHtml;
    }

    /**
     * Convert difficulty type ID to string
     */
    private function getDifficultyLevel($difficultyTypeId)
    {
        $difficultyMap = [
            1 => 'easy',
            2 => 'medium',
            3 => 'hard'
        ];

        return $difficultyMap[$difficultyTypeId] ?? 'medium';
    }

    /**
     * Fallback questions if none found in database
     */
    private function getFallbackQuestions($topicName)
    {
        return [
            [
                'id' => 9991,
                'question_text' => "Soalan am tentang {$topicName}",
                'question_file' => null,
                'question_type' => 'text',
                'options' => [
                    ['text' => "Jawapan A", 'file' => null, 'type' => 'text'],
                    ['text' => "Jawapan B", 'file' => null, 'type' => 'text'],
                    ['text' => "Jawapan C", 'file' => null, 'type' => 'text'],
                    ['text' => "Jawapan D", 'file' => null, 'type' => 'text']
                ],
                'correctAnswer' => 0,
                'explanation' => "Ini adalah soalan fallback untuk topik ini.",
                'category' => $topicName,
                'difficulty' => "easy"
            ]
        ];
    }

    /**
     * Restart quiz with new questions
     */
    public function restart(Request $request)
    {
        $request->validate([
            'topic_id' => 'nullable|integer',
            'topic' => 'nullable|string',
            'subject' => 'nullable|string',
        ]);

        $questions = [];

        if ($request->topic_id) {
            $questions = $this->getQuestionsByTopic($request->topic_id);
        } elseif ($request->topic) {
            $questions = $this->getQuestionsByTopicName($request->topic, $request->subject);
        }

        return response()->json([
            'questions' => $questions,
            'success' => true
        ]);
    }

   public function completePractice(Request $request)
{
    // Get the topic to check if it's a subtopic
    $topic = DB::table('topics')->where('id', $request->topic_id)->first();
    
    $isSubtopic = false;
    $mainTopicId = $request->topic_id;
    $subtopicId = null;

    // Check if this is a subtopic (parent_id != 0)
    if ($topic && $topic->parent_id != 0) {
        $isSubtopic = true;
        $mainTopicId = $topic->parent_id;
        $subtopicId = $topic->id;
    }

    // Convert JavaScript ISO datetime to MySQL format
    $startAt = $this->convertToMySQLDateTime($request->start_at);
    
    Log::info('Practice session datetime conversion:', [
        'original_start_at' => $request->start_at,
        'converted_start_at' => $startAt
    ]);

    // Create the practice session using query builder
    $sessionId = DB::table('practice_session')->insertGetId([
        'user_id' => Auth::id(),
        'subject_id' => $request->subject_id,
        'topic_id' => $mainTopicId,
        'subtopic_id' => $subtopicId,
        'question_type_id' => 1, // Objective
        'start_at' => $startAt, // Use converted datetime
        'end_at' => now(),
        'total_correct' => $request->total_correct,
        'total_skipped' => $request->total_skipped,
        'score' => $request->score,
        'total_time_seconds' => $request->total_time_seconds,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // Save quiz attempts if provided
    $questionAttempts = $request->get('question_attempts', []);
    if (!empty($questionAttempts)) {
        $this->saveQuizAttempts($questionAttempts, $sessionId, $mainTopicId, $subtopicId);
    }

    // return response()->json([
    //     'success' => true,
    //     'session_id' => $sessionId,
    //     'topic_info' => [
    //         'is_subtopic' => $isSubtopic,
    //         'main_topic_id' => $mainTopicId,
    //         'subtopic_id' => $subtopicId,
    //     ]
    // ]);
}

    /**
     * Save quiz attempts to quiz_attempts table
     */
    private function saveQuizAttempts($attempts, $sessionId, $mainTopicId, $subtopicId)
    {
        $userId = Auth::id();
        $quizAttempts = [];

        foreach ($attempts as $attempt) {
            // Get the question
            $questionId = $attempt['question_id'] ?? 0;

            // Get parent_id from question if it exists
            $parentId = 0;
            if ($questionId) {
                $question = DB::table('questions')->where('id', $questionId)->first();
                $parentId = $question ? ($question->parent_id ?? 0) : 0;
            }

            // Get chosen answer ID
            $chosenAnswerId = $attempt['choosen_answer_id'] ?? 0;

            // Get answer status (0 = wrong, 1 = correct)
            $answerStatus = $attempt['answer_status'] ?? 0;

            // Convert JavaScript ISO datetime to MySQL datetime format
            $attemptedAt = $attempt['attempted_at'] ?? now();
            $createdAt = $this->convertToMySQLDateTime($attemptedAt);
            $updatedAt = $this->convertToMySQLDateTime($attemptedAt);

            Log::info('Saving FIRST ATTEMPT quiz attempt:', [
                'question_id' => $questionId,
                'chosen_answer_id' => $chosenAnswerId,
                'answer_status' => $answerStatus,
                'original_datetime' => $attemptedAt,
                'converted_datetime' => $createdAt
            ]);

            $quizAttempts[] = [
                'user_id' => $userId,
                'parent_id' => $parentId,
                'question_id' => $questionId,
                'topic_id' => $mainTopicId,
                'subtopic_id' => $subtopicId,
                'choosen_answer_id' => $chosenAnswerId,
                'answer_status' => $answerStatus,
                'subjective_answer' => null,
                'session_id' => $sessionId,
                'time_taken' => $attempt['time_taken'] ?? 0,
                'question_type_id' => 1, // Objective
                'created_at' => $createdAt,
                'updated_at' => $updatedAt,
            ];
        }

        if (!empty($quizAttempts)) {
            try {
                // Insert all attempts (only first attempts)
                DB::table('quiz_attempts')->insert($quizAttempts);

                // Calculate statistics
                $totalAttempts = count($quizAttempts);
                $correctAttempts = 0;
                foreach ($quizAttempts as $attempt) {
                    if ($attempt['answer_status'] == 1) {
                        $correctAttempts++;
                    }
                }
                $wrongAttempts = $totalAttempts - $correctAttempts;

                Log::info('First attempt quiz attempts saved successfully:', [
                    'session_id' => $sessionId,
                    'total_attempts' => $totalAttempts,
                    'correct_attempts' => $correctAttempts,
                    'wrong_attempts' => $wrongAttempts,
                    'accuracy_rate' => $totalAttempts > 0 ? round(($correctAttempts / $totalAttempts) * 100, 2) : 0,
                    'user_id' => $userId
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to save quiz attempts:', [
                    'error' => $e->getMessage(),
                    'session_id' => $sessionId,
                    'attempts_count' => count($quizAttempts)
                ]);
                throw $e;
            }
        }
    }

    /**
     * Convert JavaScript ISO datetime to MySQL datetime format
     * 
     * @param string $jsDateTime JavaScript ISO datetime (e.g., "2025-12-19T08:46:44.976Z")
     * @return string MySQL datetime format (e.g., "2025-12-19 08:46:44")
     */
    /**
 * Convert JavaScript ISO datetime to MySQL datetime format
 */
private function convertToMySQLDateTime($jsDateTime)
{
    try {
        // If already in correct format or empty, return as is
        if (empty($jsDateTime)) {
            return now()->format('Y-m-d H:i:s');
        }
        
        // If it's already a Carbon instance
        if ($jsDateTime instanceof \Carbon\Carbon) {
            return $jsDateTime->format('Y-m-d H:i:s');
        }
        
        // If it's already in MySQL format (Y-m-d H:i:s)
        if (preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $jsDateTime)) {
            return $jsDateTime;
        }
        
        // If it's a JavaScript ISO string with 'Z' (UTC)
        if (is_string($jsDateTime) && strpos($jsDateTime, 'T') !== false) {
            // Remove milliseconds and 'Z' if present
            $jsDateTime = str_replace('Z', '', $jsDateTime);
            
            // Handle milliseconds
            if (strpos($jsDateTime, '.') !== false) {
                $parts = explode('.', $jsDateTime);
                $jsDateTime = $parts[0]; // Keep only seconds part
            }
            
            // Parse and convert to MySQL format
            return \Carbon\Carbon::parse($jsDateTime)->format('Y-m-d H:i:s');
        }
        
        // Default fallback
        return now()->format('Y-m-d H:i:s');
        
    } catch (\Exception $e) {
        Log::warning('Failed to convert datetime, using current time:', [
            'original' => $jsDateTime,
            'error' => $e->getMessage()
        ]);
        return now()->format('Y-m-d H:i:s');
    }
}
}
