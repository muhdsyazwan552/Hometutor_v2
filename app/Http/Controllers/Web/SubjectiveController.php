<?php

namespace App\Http\Controllers\Web;
use App\Http\Controllers\Controller;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Question;
use App\Models\Topic;
use App\Models\Answer;
use Illuminate\Support\Facades\Log;

class SubjectiveController extends Controller
{
    /**
     * Display the subjective questions page
     */
    public function index(Request $request)
    {
        // Get questions from database based on topic_id
        $questions = [];
        $topicName = 'General';

        // Focus on topic_id only
        $topicId = $request->query('topic_id');

        Log::info('SubjectiveQuestion Request - Topic ID:', ['topic_id' => $topicId]);

        if ($topicId) {
            Log::info('🟢 Using topic_id to fetch subjective questions: ' . $topicId);
            $questions = $this->getQuestionsByTopic($topicId);
            $topic = Topic::find($topicId);
            if ($topic) {
                $topicName = $topic->name;
                Log::info("Found topic: {$topic->name} (ID: {$topic->id})");
            }
        } else {
            Log::warning('🔴 No topic_id provided for subjective questions');
        }

        // Simplified logging - just show the essential info
        Log::info("Result: " . count($questions) . " subjective questions for topic ID: " . $topicId);

        return Inertia::render('courses/training/SubjectiveQuestion', [
            'subject' => $request->query('subject'),
            'standard' => $request->query('standard'),
            'sectionId' => $request->query('sectionId'),
            'sectionTitle' => $request->query('sectionTitle'),
            'contentId' => $request->query('contentId'),
            'topic' => $topicName,
            'topic_id' => $topicId,
            'questions' => $questions,
            'subject_id' => $request->subject_id,
            'level_id' => $request->level_id,
            'question_count' => count($questions),
            'total_available' => $topicId ? $this->getTotalAvailableQuestions($topicId) : 0,
        ]);
    }

    /**
     * Get subjective questions by topic ID
     */
    private function getQuestionsByTopic($topicId)
    {
        Log::info("🚨 TEMPORARY DEBUG MODE - bypassing all filters for subjective questions");

        // Temporary: bypass all filters to test
        $questions = Question::with('answers')
            ->where('topic_id', $topicId)
            ->where('question_type_id', 2) // 2 for subjective questions
            ->active()      // Uses the scopeActive method
            // ->published()   // Uses the scopePublished method
            ->inRandomOrder()
            ->get();

        Log::info("🚨 DEBUG - Subjective questions found (no filters): " . $questions->count());

        if ($questions->count() > 0) {
            Log::info("🚨 DEBUG - Subjective question details:");
            foreach ($questions as $q) {
                Log::info("   - ID: {$q->id}, Status: {$q->is_active}, Published: {$q->is_published}, Approved: {$q->approval_status}");
            }
        }

        return $this->formatQuestions($questions);
    }

    /**
     * Get questions by topic name and subject
     */
    private function getQuestionsByTopicName($topicName, $subjectName = null, $limit = 5)
    {
        $query = Topic::with(['questions' => function ($query) {
            $query->where('question_type_id', 2) // Subjective questions
                ->active()->published()->approved()
                ->with(['answers' => function ($q) {
                    $q->active()->ordered();
                }]);
        }])
            ->where('name', 'like', '%' . $topicName . '%')
            ->active();

        if ($subjectName) {
            $query->whereHas('subject', function ($q) use ($subjectName) {
                $q->where('name', 'like', '%' . $subjectName . '%');
            });
        }

        $topic = $query->inRandomOrder()->first();

        if (!$topic) {
            Log::warning("No topic found for name: {$topicName}, subject: {$subjectName}");
            return $this->getFallbackQuestions($topicName);
        }

        $totalQuestions = $topic->questions->count();
        Log::info("Topic '{$topicName}': {$totalQuestions} total subjective questions available, fetching {$limit}");

        if ($topic->questions->isEmpty()) {
            Log::warning("Topic '{$topicName}' found but has no subjective questions");
            return $this->getFallbackQuestions($topicName);
        }

        $questions = $topic->questions->take($limit);
        Log::info("Successfully fetched " . $questions->count() . " subjective questions for topic: {$topicName}");

        return $this->formatQuestions($questions);
    }

    /**
     * Get total available subjective questions for logging
     */
    private function getTotalAvailableQuestions($topicId)
    {
        return Question::active()
            ->published()
            ->approved()
            ->byTopic($topicId)
            ->where('question_type_id', 2) // Subjective questions
            ->count();
    }

    /**
     * Format subjective questions for frontend
     */
    private function formatQuestions($questions)
    {
        return $questions->map(function ($question, $index) {
            return [
                'id' => $question->id,
                'question_text' => $question->question_text,
                'question_file' => $question->question_file ? $this->getQuestionFileUrl($question->question_file) : null,
                'question_type' => $this->determineQuestionType($question),
                'schema' => $this->getSubjectiveSchema($question), // Specific for subjective
                'explanation' => $this->getExplanation($question),
                'category' => $question->topic->name ?? 'General',
                'difficulty' => $this->getDifficultyLevel($question->difficulty_type_id),
                'has_sample_answer' => $question->has_sample_answer ?? false,
                'has_reason' => $question->has_reason ?? false,
            ];
        })->toArray();
    }

    /**
     * Get schema answer for subjective questions
     */
    private function getSubjectiveSchema($question)
    {
        // First, check if any answer has sample_answer (specific for subjective)
        $sampleAnswer = $question->answers->first(function ($answer) {
            return !empty($answer->sample_answer);
        });

        if ($sampleAnswer) {
            return $sampleAnswer->sample_answer;
        }

        // If sample_answer is null, check for sample_answer_file
        $sampleAnswerFile = $question->answers->first(function ($answer) {
            return !empty($answer->sample_answer_file);
        });

        if ($sampleAnswerFile) {
            return $this->getSampleAnswerFileUrl($sampleAnswerFile->sample_answer_file);
        }

        // Then check for answers with reason
        $reasonAnswer = $question->answers->first(function ($answer) {
            return !empty($answer->reason);
        });

        if ($reasonAnswer) {
            return $reasonAnswer->reason;
        }

        // Finally, check correct answer text
        $correctAnswer = $question->answers->first(function ($answer) {
            return $answer->iscorrectanswer;
        });

        if ($correctAnswer && !empty($correctAnswer->answer_text)) {
            return $correctAnswer->answer_text;
        }

        // Fallback to any answer text
        $anyAnswer = $question->answers->first();
        if ($anyAnswer && !empty($anyAnswer->answer_text)) {
            return $anyAnswer->answer_text;
        }

        return "Schema answer not available for this question.";
    }

    /**
     * Get sample answer file URL
     */
    private function getSampleAnswerFileUrl($filename)
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
        // Adjust the path based on where sample answer files are stored in S3
        return 'https://ptrs-elearning.s3.ap-southeast-1.amazonaws.com/sample-answers/' . $filename;
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
     * Get explanation from question or answers
     */
    private function getExplanation($question)
    {
        // Check if any answer has a reason
        $answerWithReason = $question->answers->first(function ($answer) {
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
     * Fallback subjective questions if none found in database
     */
    private function getFallbackQuestions($topicName)
    {
        return [
            [
                'id' => 9991,
                'question_text' => "Jelaskan konsep asas tentang {$topicName} dan berikan contoh yang sesuai.",
                'question_file' => null,
                'question_type' => 'html',
                'schema' => "Ini adalah contoh jawapan skema untuk soalan subjektif. Pelajar perlu memberikan penjelasan terperinci dengan contoh yang sesuai untuk topik {$topicName}.",
                'explanation' => "Soalan subjektif ini menguji kefahaman asas tentang topik. Jawapan yang baik harus mengandungi definisi, ciri-ciri, dan contoh yang relevan.",
                'category' => $topicName,
                'difficulty' => "medium",
                'has_sample_answer' => true,
                'has_reason' => true,
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
}
