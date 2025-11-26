<?php

namespace App\Http\Controllers\Web;
use App\Http\Controllers\Controller;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Question;
use App\Models\Topic;
use App\Models\Answer;
use App\Models\PracticeSession;
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
            $topic = Topic::find($topicId);
            if ($topic) {
                $topicName = $topic->name;
                Log::info("Found topic: {$topic->name} (ID: {$topic->id})");
            }
        } else {
            Log::warning('🔴 No topic_id provided');
        }

        // Simplified logging - just show the essential info
        Log::info("Result: " . count($questions) . " questions for topic ID: " . $topicId);

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
// private function getQuestionsByTopic($topicId, $limit = 5)
private function getQuestionsByTopic($topicId)
{
    Log::info("🚨 TEMPORARY DEBUG MODE - bypassing all filters");
    
    // Using model scopes
    $questions = Question::with('answers')
        ->where('topic_id', $topicId)
        ->where('question_type_id', 1)
        ->active()      // Uses the scopeActive method
        // ->published()   // Uses the scopePublished method
        ->inRandomOrder()
        // ->limit($limit)
        ->get();

    Log::info("🚨 DEBUG - Questions found (using scopes): " . $questions->count());
    
    if ($questions->count() > 0) {
        Log::info("🚨 DEBUG - Question details:");
        foreach ($questions as $q) {
            Log::info("   - ID: {$q->id}, Active: {$q->is_active}, Published: {$q->is_published}, Approved: {$q->approval_status}");
        }
    }

    return $this->formatQuestions($questions);
}

    /**
     * Get questions by topic name and subject
     */
    private function getQuestionsByTopicName($topicName, $subjectName = null, $limit = 5)
    {
        $query = Topic::with(['questions' => function($query) {
            $query->active()->published()->approved()->with(['answers' => function($q) {
                $q->active()->ordered();
            }]);
        }])
        ->where('name', 'like', '%' . $topicName . '%')
        ->active();

        if ($subjectName) {
            $query->whereHas('subject', function($q) use ($subjectName) {
                $q->where('name', 'like', '%' . $subjectName . '%');
            });
        }

        $topic = $query->inRandomOrder()->first();

        if (!$topic) {
            Log::warning("No topic found for name: {$topicName}, subject: {$subjectName}");
            return $this->getFallbackQuestions($topicName);
        }

        $totalQuestions = $topic->questions->count();
        Log::info("Topic '{$topicName}': {$totalQuestions} total questions available, fetching {$limit}");

        if ($topic->questions->isEmpty()) {
            Log::warning("Topic '{$topicName}' found but has no questions");
            return $this->getFallbackQuestions($topicName);
        }

        $questions = $topic->questions->take($limit);
        Log::info("Successfully fetched " . $questions->count() . " questions for topic: {$topicName}");

        return $this->formatQuestions($questions);
    }

    /**
     * Get total available questions for logging
     */
    private function getTotalAvailableQuestions($topicId)
    {
        return Question::active()
            ->published()
            ->approved()
            ->byTopic($topicId)
            ->count();
    }

/**
 * Format questions for frontend
 */
private function formatQuestions($questions)
{
    return $questions->map(function($question, $index) {
        return [
            'id' => $question->id,
            'question_text' => $question->question_text,
            'question_file' => $question->question_file, // FIXED: Don't set to null, use actual value
            'question_type' => $this->determineQuestionType($question),
            'options' => $this->formatAnswers($question->answers),
            'correctAnswer' => $this->getCorrectAnswerIndex($question),
            'explanation' => $this->getExplanation($question),
            'category' => $question->topic->name ?? 'General',
            'difficulty' => $this->getDifficultyLevel($question->difficulty_type_id),
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
    return $answers->map(function($answer) {
        // Check if answer_text contains HTML with images
        $hasHtmlContent = $answer->answer_text && preg_match('/<img|<div|<p>/i', $answer->answer_text);
        
        return [
            'text' => $answer->answer_text,
            'file' => $answer->answer_option_file ? $this->getAnswerFileUrl($answer->answer_option_file) : null,
            'type' => $hasHtmlContent ? 'html' : (!empty($answer->answer_text) ? 'text' : (!empty($answer->answer_option_file) ? 'image' : 'text')),
            'has_html' => $hasHtmlContent
        ];
    })->toArray();
}

 /**
 * Get question file URL
 */
private function getQuestionFileUrl($filename)
{
    // If filename is already a full URL, return it as is
    if (filter_var($filename, FILTER_VALIDATE_URL)) {
        return $filename;
    }
    
    // If it's a full S3 path stored in database, return it
    if (strpos($filename, 'https://ptrs-elearning.s3.ap-southeast-1.amazonaws.com/') === 0) {
        return $filename;
    }
    
    // For relative paths, construct the S3 URL
    // Assuming your files are stored in S3 with this structure
    return 'https://ptrs-elearning.s3.ap-southeast-1.amazonaws.com/questions/' . $filename;
}

/**
 * Get answer file URL
 */
private function getAnswerFileUrl($filename)
{
    // If filename is already a full URL, return it as is
    if (filter_var($filename, FILTER_VALIDATE_URL)) {
        return $filename;
    }
    
    // If it's a full S3 path stored in database, return it
    if (strpos($filename, 'https://ptrs-elearning.s3.ap-southeast-1.amazonaws.com/') === 0) {
        return $filename;
    }
    
    // For relative paths, construct the S3 URL
    // Adjust the path based on where answer files are stored in S3
    return 'https://ptrs-elearning.s3.ap-southeast-1.amazonaws.com/answers/' . $filename;
}

    /**
     * Get correct answer index
     */
    private function getCorrectAnswerIndex($question)
    {
        $correctAnswer = $question->answers->where('iscorrectanswer', true)->first();
        if (!$correctAnswer) {
            return 0;
        }
        
        return $question->answers->sortBy('seq')->values()->search(function($answer) use ($correctAnswer) {
            return $answer->id === $correctAnswer->id;
        });
    }

    /**
     * Get explanation from question or answers
     */
private function getExplanation($question)
{
    // Check if any answer has a reason
    $answerWithReason = $question->answers->first(function($answer) {
        return !empty($answer->reason);
    });

    if ($answerWithReason) {
        // Check if reason contains HTML
        $hasHtml = preg_match('/<p[^>]*>|<br>|<div/i', $answerWithReason->reason);
        
        if ($hasHtml) {
            // Process HTML explanation
            return $this->processExplanationHtml($answerWithReason->reason);
        }
        
        return $answerWithReason->reason;
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
    $topic = Topic::find($request->topic_id);
    
    $isSubtopic = false;
    $mainTopicId = $request->topic_id;
    $subtopicId = null;

    // Check if this is a subtopic (parent_id != 0)
    if ($topic && $topic->parent_id != 0) {
        $isSubtopic = true;
        $subtopicId = $topic->parent_id; // Current topic is the subtopic
    }

    $session = PracticeSession::create([
        'user_id' => Auth::id(),
        'subject_id' => $request->subject_id,
        'topic_id' => $mainTopicId, // Always the main topic ID
        'subtopic_id' => $subtopicId, // Only set if it's a subtopic
        'question_type_id' => 1, // Objective
        'start_at' => $request->start_at,
        'end_at' => now(),
        'total_correct' => $request->total_correct,
        'total_skipped' => $request->total_skipped,
        'score' => $request->score,
        'total_time_seconds' => $request->total_time_seconds,
    ]);

    return response()->json([
        'success' => true,
        'session_id' => $session->id,
        'topic_info' => [
            'is_subtopic' => $isSubtopic,
            'main_topic_id' => $mainTopicId,
            'subtopic_id' => $subtopicId,
        ]
    ]);
}
}