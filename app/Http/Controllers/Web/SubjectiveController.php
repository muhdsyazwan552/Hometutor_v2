<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;


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

            // Get topic name using query builder
            $topic = DB::table('topics')->where('id', $topicId)->first();
            if ($topic) {
                $topicName = $topic->name;
                Log::info("Found topic: {$topic->name} (ID: {$topicId})");
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
        Log::info("🚨 DEBUG MODE - Fetching subjective questions for topic: {$topicId}");

        // Get questions using query builder
        $questions = DB::table('questions')
            ->select('questions.*')
            ->where('questions.topic_id', $topicId)
            ->where('questions.question_type_id', 2) // Subjective questions
            ->where('questions.is_active', 1)
            // ->where('questions.is_published', 1)
            // ->where('questions.approval_status', 'approved')
            ->orderByRaw('RAND()')
            ->limit(5)
            ->get();

        Log::info("🚨 Found " . $questions->count() . " questions");

        // Get answers for each question
        $questionIds = $questions->pluck('id')->toArray();
        $answers = [];

        if (!empty($questionIds)) {
            $answers = DB::table('answers')
                ->whereIn('question_id', $questionIds)
                ->where('isactive', 1) // FIXED: Changed from is_active to isactive
                ->orderBy('seq', 'asc') // FIXED: Changed from order_number to seq
                ->get()
                ->groupBy('question_id');

            Log::info("🚨 Found answers for " . count($answers) . " questions");
        }

        // Attach answers to questions
        $questionsWithAnswers = [];
        foreach ($questions as $question) {
            $question->answers = $answers[$question->id] ?? collect([]);
            $questionsWithAnswers[] = $question;

            Log::info("Question ID: {$question->id} has " . ($question->answers->count()) . " answers");
        }

        if (count($questionsWithAnswers) > 0) {
            Log::info("🚨 DEBUG - Subjective question details:");
            foreach ($questionsWithAnswers as $q) {
                Log::info("   - ID: {$q->id}, Status: {$q->is_active}, Published: {$q->is_published}, Approved: {$q->approval_status}");

                // Debug each answer
                foreach ($q->answers as $index => $answer) {
                    Log::info("     Answer {$index}:", [
                        'id' => $answer->id,
                        'iscorrectanswer' => $answer->iscorrectanswer,
                        'sample_answer' => !empty($answer->sample_answer) ? 'YES' : 'NO',
                        'sample_answer_file' => !empty($answer->sample_answer_file) ? 'YES' : 'NO',
                        'reason' => !empty($answer->reason) ? 'YES' : 'NO',
                        'answer_text' => !empty($answer->answer_text) ? 'YES' : 'NO',
                        'isactive' => $answer->isactive,
                    ]);
                }
            }
        }

        return $this->formatQuestions($questionsWithAnswers);
    }

    /**
     * Get questions by topic name and subject
     */
    private function getQuestionsByTopicName($topicName, $subjectName = null, $limit = 5)
    {
        $topicQuery = DB::table('topics')
            ->where('name', 'like', '%' . $topicName . '%')
            ->where('is_active', 1);

        if ($subjectName) {
            $topicQuery->whereExists(function ($query) use ($subjectName) {
                $query->select(DB::raw(1))
                    ->from('subjects')
                    ->whereColumn('subjects.id', 'topics.subject_id')
                    ->where('subjects.name', 'like', '%' . $subjectName . '%');
            });
        }

        $topic = $topicQuery->inRandomOrder()->first();

        if (!$topic) {
            Log::warning("No topic found for name: {$topicName}, subject: {$subjectName}");
            return $this->getFallbackQuestions($topicName);
        }

        // Get questions for this topic
        $questions = DB::table('questions')
            ->select('questions.*')
            ->where('questions.topic_id', $topic->id)
            ->where('questions.question_type_id', 2)
            ->where('questions.is_active', 1)
            // ->where('questions.is_published', 1)
            // ->where('questions.approval_status', 'approved')
            ->orderByRaw('RAND()')
            ->limit($limit)
            ->get();

        if ($questions->isEmpty()) {
            Log::warning("Topic '{$topicName}' found but has no subjective questions");
            return $this->getFallbackQuestions($topicName);
        }

        // Get answers for each question
        $questionIds = $questions->pluck('id')->toArray();
        $answers = [];

        if (!empty($questionIds)) {
            $answers = DB::table('answers')
                ->whereIn('question_id', $questionIds)
                ->where('isactive', 1)
                ->orderBy('seq', 'asc')
                ->get()
                ->groupBy('question_id');
        }

        // Attach answers to questions
        $questionsWithAnswers = [];
        foreach ($questions as $question) {
            $question->answers = $answers[$question->id] ?? collect([]);
            $questionsWithAnswers[] = $question;
        }

        $totalQuestions = DB::table('questions')
            ->where('topic_id', $topic->id)
            ->where('question_type_id', 2)
            ->where('is_active', 1)
            ->where('is_published', 1)
            ->where('approval_status', 'approved')
            ->count();

        Log::info("Topic '{$topicName}': {$totalQuestions} total subjective questions available, fetching {$limit}");
        Log::info("Successfully fetched " . count($questionsWithAnswers) . " subjective questions for topic: {$topicName}");

        return $this->formatQuestions($questionsWithAnswers);
    }

    /**
     * Get total available subjective questions for logging
     */
    private function getTotalAvailableQuestions($topicId)
    {
        return DB::table('questions')
            ->where('topic_id', $topicId)
            ->where('question_type_id', 2)
            ->where('is_active', 1)
            ->where('is_published', 1)
            ->where('approval_status', 'approved')
            ->count();
    }

    /**
     * Format subjective questions for frontend
     */
    private function formatQuestions($questions)
    {
        $formattedQuestions = [];

        foreach ($questions as $index => $question) {
            // Get topic name
            $topic = DB::table('topics')->where('id', $question->topic_id)->first();

            $schema = $this->getSubjectiveSchema($question);

            Log::info("📦 Formatting question {$question->id}:", [
                'question_text' => substr($question->question_text ?? '', 0, 100),
                'schema_length' => strlen($schema),
                'schema_preview' => substr($schema, 0, 100),
                'category' => $topic ? $topic->name : 'General',
            ]);

            $formattedQuestions[] = [
                'id' => $question->id,
                'question_text' => $question->question_text,
                'question_file' => $question->question_file ? $this->getQuestionFileUrl($question->question_file) : null,
                'question_type' => $this->determineQuestionType($question),
                'schema' => $schema,
                'explanation' => $this->getExplanation($question),
                'category' => $topic ? $topic->name : 'General',
                'difficulty' => $this->getDifficultyLevel($question->difficulty_type_id),
                'has_sample_answer' => $question->has_sample_answer ?? false,
                'has_reason' => $question->has_reason ?? false,
            ];
        }

        return $formattedQuestions;
    }

    /**
     * Get schema answer for subjective questions with priority:
     * 1. sample_answer (first priority)
     * 2. sample_answer_file (second priority)
     * 3. reason (third priority)
     * 4. reason2 (fourth priority)
     * 5. reason_file (fifth priority)
     * 6. correct answer text (fallback)
     * 7. any answer text (last resort)
     */
    private function getSubjectiveSchema($question)
    {
        Log::info("🔍 DEBUG getSubjectiveSchema for question ID: {$question->id}");

        // Check if answers exist
        if ($question->answers && !$question->answers->isEmpty()) {
            Log::info("📋 Question has " . $question->answers->count() . " answers");

            // Debug all answers
            foreach ($question->answers as $index => $answer) {
                Log::info("   Answer {$index} (ID: {$answer->id}):", [
                    'has_sample_answer' => !empty($answer->sample_answer) ? 'YES' : 'NO',
                    'sample_answer_preview' => !empty($answer->sample_answer) ? substr($answer->sample_answer, 0, 100) . '...' : 'EMPTY',
                    'has_sample_answer_file' => !empty($answer->sample_answer_file) ? 'YES' : 'NO',
                    'sample_answer_file' => $answer->sample_answer_file,
                    'has_reason' => !empty($answer->reason) ? 'YES' : 'NO',
                    'reason_preview' => !empty($answer->reason) ? substr($answer->reason, 0, 100) . '...' : 'EMPTY',
                    'has_reason2' => !empty($answer->reason2) ? 'YES' : 'NO',
                    'reason2_preview' => !empty($answer->reason2) ? substr($answer->reason2, 0, 100) . '...' : 'EMPTY',
                    'has_reason_file' => !empty($answer->reason_file) ? 'YES' : 'NO',
                    'reason_file' => $answer->reason_file,
                    'iscorrectanswer' => $answer->iscorrectanswer ? 'YES' : 'NO',
                    'has_answer_text' => !empty($answer->answer_text) ? 'YES' : 'NO',
                    'answer_text_preview' => !empty($answer->answer_text) ? substr($answer->answer_text, 0, 100) . '...' : 'EMPTY',
                ]);
            }

            // ==================== PRIORITY 1: sample_answer ====================
            foreach ($question->answers as $answer) {
                if (!empty($answer->sample_answer)) {
                    Log::info("✅ PRIORITY 1: Found sample_answer for question {$question->id}");
                    return $answer->sample_answer;
                }
            }

            Log::info("❌ No sample_answer found, checking priority 2...");

            // ==================== PRIORITY 2: sample_answer_file ====================
            foreach ($question->answers as $answer) {
                if (!empty($answer->sample_answer_file)) {
                    $fileContent = $answer->sample_answer_file;
                    Log::info("✅ PRIORITY 2: Found sample_answer_file for question {$question->id}: " . substr($fileContent, 0, 200));

                    // First check if it contains HTML tags (might be HTML content with images)
                    if (is_string($fileContent) && preg_match('/<[^>]+>/', $fileContent)) {
                        Log::info("📝 sample_answer_file contains HTML tags");

                        // Check what type of HTML it is
                        $hasImages = preg_match('/<img[^>]*>/i', $fileContent);
                        $hasParagraphs = preg_match('/<p[^>]*>/i', $fileContent);
                        $hasDivs = preg_match('/<div[^>]*>/i', $fileContent);

                        Log::info("HTML analysis:", [
                            'hasImages' => $hasImages,
                            'hasParagraphs' => $hasParagraphs,
                            'hasDivs' => $hasDivs,
                            'contentLength' => strlen($fileContent)
                        ]);

                        return $fileContent; // Return the HTML as-is
                    }

                    // Check if it contains "Schema Answer:" text (might be HTML with text)
                    if (is_string($fileContent) && strpos($fileContent, 'Schema Answer:') !== false) {
                        Log::info("📝 sample_answer_file contains text with 'Schema Answer:'");
                        return $fileContent;
                    }

                    // Check if it's plain text (not a URL)
                    if (is_string($fileContent) && !$this->isUrl($fileContent)) {
                        Log::info("📝 sample_answer_file is plain text");
                        return $fileContent;
                    }

                    // If it's a URL, check the file extension to determine if it's an image
                    if ($this->isUrl($fileContent)) {
                        $url = $this->getSampleAnswerFileUrl($fileContent);

                        // Check file extension to determine if it's an image
                        $extension = strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));
                        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];

                        if (in_array($extension, $imageExtensions)) {
                            Log::info("🌐 sample_answer_file is an image URL with extension: .{$extension}");
                            return $url; // Return URL for image display
                        } else {
                            // It's a URL but not an image - might be text file or other
                            Log::info("🌐 sample_answer_file is a non-image URL with extension: .{$extension}");
                            return $url;
                        }
                    }

                    Log::info("📝 Returning raw sample_answer_file content");
                    return $fileContent;
                }
            }

            // ... rest of the priorities remain the same ...
            // ==================== PRIORITY 3: reason ====================
            foreach ($question->answers as $answer) {
                if (!empty($answer->reason)) {
                    Log::info("✅ PRIORITY 3: Found reason for question {$question->id}");
                    return $answer->reason;
                }
            }

            Log::info("❌ No reason found, checking priority 4...");

            // ==================== PRIORITY 4: reason2 ====================
            foreach ($question->answers as $answer) {
                if (!empty($answer->reason2)) {
                    Log::info("✅ PRIORITY 4: Found reason2 for question {$question->id}");
                    return $answer->reason2;
                }
            }

            Log::info("❌ No reason2 found, checking priority 5...");

            // ==================== PRIORITY 5: reason_file ====================
            foreach ($question->answers as $answer) {
                if (!empty($answer->reason_file)) {
                    $reasonFileContent = $answer->reason_file;
                    Log::info("✅ PRIORITY 5: Found reason_file for question {$question->id}: " . $reasonFileContent);

                    // Check if this is text content
                    if (is_string($reasonFileContent) && !$this->isUrl($reasonFileContent)) {
                        Log::info("📝 reason_file contains text");
                        return $reasonFileContent;
                    }

                    // If it's a URL
                    if ($this->isUrl($reasonFileContent)) {
                        Log::info("🌐 reason_file is a URL");
                        $url = $this->getAnswerFileUrl($reasonFileContent);

                        // Check if it's an image
                        $extension = strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));
                        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];

                        if (in_array($extension, $imageExtensions)) {
                            Log::info("🖼️ reason_file is an image");
                            return $url;
                        } else {
                            Log::info("📄 reason_file is not an image");
                            return $url;
                        }
                    }

                    return $reasonFileContent;
                }
            }

            Log::info("❌ No reason_file found, checking fallbacks...");

            // ==================== FALLBACK 1: Correct answer text ====================
            foreach ($question->answers as $answer) {
                if ($answer->iscorrectanswer && !empty($answer->answer_text)) {
                    Log::info("✅ FALLBACK 1: Found correct answer text for question {$question->id}");
                    return $answer->answer_text;
                }
            }

            Log::info("❌ No correct answer text found, checking last resort...");

            // ==================== FALLBACK 2: Any answer text ====================
            foreach ($question->answers as $answer) {
                if (!empty($answer->answer_text)) {
                    Log::info("✅ FALLBACK 2: Found any answer text for question {$question->id}");
                    return $answer->answer_text;
                }
            }

            Log::warning("⚠️ Question {$question->id} has answers but NO usable content in any field");
        } else {
            Log::warning("⚠️ Question {$question->id} has NO answers at all");
        }

        Log::error("❌ No schema answer found for question {$question->id}");
        return "Schema answer not available for this question.";
    }

    /**
     * Helper method to check if a string is a URL
     */
    private function isUrl($string)
    {
        if (empty($string)) {
            return false;
        }

        // Check for common URL patterns
        if (filter_var($string, FILTER_VALIDATE_URL)) {
            return true;
        }

        if (strpos($string, 'http://') === 0 || strpos($string, 'https://') === 0) {
            return true;
        }

        if (strpos($string, 'www.') === 0) {
            return true;
        }

        // Check for S3 URLs
        if (strpos($string, 's3.amazonaws.com') !== false) {
            return true;
        }

        if (strpos($string, 'ptrs-elearning.s3.ap-southeast-1.amazonaws.com') !== false) {
            return true;
        }

        return false;
    }

    /**
     * Get sample answer file URL (improved version)
     */
    private function getSampleAnswerFileUrl($filename)
    {
        if (empty($filename)) {
            Log::debug('getSampleAnswerFileUrl: filename is empty');
            return null;
        }

        // If filename is already a full URL, return it as is
        if (filter_var($filename, FILTER_VALIDATE_URL)) {
            Log::debug('getSampleAnswerFileUrl: already a URL', ['url' => $filename]);
            return $filename;
        }

        // If it's a full S3 path stored in database, return it
        if (strpos($filename, 'https://') === 0 || strpos($filename, 'http://') === 0) {
            Log::debug('getSampleAnswerFileUrl: full URL detected', ['url' => $filename]);
            return $filename;
        }

        // Check if it's already a relative path
        if (
            strpos($filename, 'sample-answers/') === 0 ||
            strpos($filename, 'answers/') === 0 ||
            strpos($filename, 'questions/') === 0
        ) {
            // Already has folder structure
            return 'https://ptrs-elearning.s3.ap-southeast-1.amazonaws.com/' . $filename;
        }

        // Default: assume it's in sample-answers folder
        Log::debug('getSampleAnswerFileUrl: constructing URL for', ['filename' => $filename]);
        return 'https://ptrs-elearning.s3.ap-southeast-1.amazonaws.com/sample-answers/' . $filename;
    }

    /**
     * Determine question display type
     */
    private function determineQuestionType($question)
    {
        // For subjective questions with question_text, it's always HTML
        if (!empty($question->question_text)) {
            return 'html';
        }

        // Only use 'image' if there's NO question_text but there IS a question_file
        if (empty($question->question_text) && !empty($question->question_file)) {
            return 'image';
        }

        return 'problem';
    }

    /**
     * Get explanation from question or answers with priority:
     * 1. reason (first priority)
     * 2. reason2 (second priority)
     * 3. reason_file (third priority)
     * 4. question explanation field (fallback)
     */
    private function getExplanation($question)
    {
        Log::info("🔍 DEBUG getExplanation for question ID: {$question->id}");

        // Check if answers exist
        if ($question->answers && !$question->answers->isEmpty()) {
            // Priority 1: Check for reason
            foreach ($question->answers as $answer) {
                if (!empty($answer->reason)) {
                    Log::info("✅ Found reason for explanation");
                    $hasHtml = preg_match('/<p[^>]*>|<br>|<div/i', $answer->reason);
                    if ($hasHtml) {
                        return $this->processExplanationHtml($answer->reason);
                    }
                    return $answer->reason;
                }
            }

            // Priority 2: Check for reason2
            foreach ($question->answers as $answer) {
                if (!empty($answer->reason2)) {
                    Log::info("✅ Found reason2 for explanation");
                    $hasHtml = preg_match('/<p[^>]*>|<br>|<div/i', $answer->reason2);
                    if ($hasHtml) {
                        return $this->processExplanationHtml($answer->reason2);
                    }
                    return $answer->reason2;
                }
            }

            // Priority 3: Check for reason_file
            foreach ($question->answers as $answer) {
                if (!empty($answer->reason_file)) {
                    Log::info("✅ Found reason_file for explanation");
                    $reasonFile = $answer->reason_file;

                    // Check if it's text content (not a URL)
                    if (is_string($reasonFile) && !filter_var($reasonFile, FILTER_VALIDATE_URL)) {
                        $hasHtml = preg_match('/<p[^>]*>|<br>|<div/i', $reasonFile);
                        if ($hasHtml) {
                            return $this->processExplanationHtml($reasonFile);
                        }
                        return $reasonFile;
                    }

                    // If it's a URL, return a message
                    return "Explanation is available as a file.";
                }
            }

            Log::warning("⚠️ No explanation found in answers");
        }

        // Fallback: check question explanation field if it exists
        if (!empty($question->explanation)) {
            Log::info("✅ Found explanation in question field");
            $hasHtml = preg_match('/<p[^>]*>|<br>|<div/i', $question->explanation);
            if ($hasHtml) {
                return $this->processExplanationHtml($question->explanation);
            }
            return $question->explanation;
        }

        Log::info("❌ No explanation available");
        return "Explanation not available.";
    }

    /**
     * Process HTML explanation to add proper styling
     */
    private function processExplanationHtml($html)
    {
        $processedHtml = preg_replace('/<p([^>]*)>/', '<p$1 class="mb-3 text-gray-700 leading-relaxed">', $html);
        $processedHtml = preg_replace('/\s+data-[^=]+="[^"]*"/', '', $processedHtml);
        return $processedHtml;
    }

    /**
     * Get question file URL
     */
    private function getQuestionFileUrl($filename)
    {
        if (filter_var($filename, FILTER_VALIDATE_URL)) {
            return $filename;
        }

        if (strpos($filename, 'https://ptrs-elearning.s3.ap-southeast-1.amazonaws.com/') === 0) {
            return $filename;
        }

        return 'https://ptrs-elearning.s3.ap-southeast-1.amazonaws.com/questions/' . $filename;
    }

    /**
     * Get answer file URL (improved version)
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

    public function completePractice(Request $request)
{
    $topic = DB::table('topics')->where('id', $request->topic_id)->first();

    $isSubtopic = false;
    $mainTopicId = $request->topic_id;
    $subtopicId = null;

    if ($topic && $topic->parent_id != 0) {
        $isSubtopic = true;
        $mainTopicId = $topic->parent_id;
        $subtopicId = $topic->id;
    }

    // Convert ISO 8601 datetime to MySQL datetime format
    $startAt = null;
    if ($request->start_at) {
        try {
            // Parse the ISO 8601 datetime and convert to MySQL format
            $startAt = Carbon::parse($request->start_at)->format('Y-m-d H:i:s');
        } catch (\Exception $e) {
            Log::error('Failed to parse start_at datetime:', [
                'start_at' => $request->start_at,
                'error' => $e->getMessage()
            ]);
            // Fallback to current time if parsing fails
            $startAt = now()->format('Y-m-d H:i:s');
        }
    } else {
        $startAt = now()->format('Y-m-d H:i:s');
    }

    $sessionId = DB::table('practice_session')->insertGetId([
        'user_id' => Auth::id(),
        'subject_id' => $request->subject_id,
        'topic_id' => $mainTopicId,
        'subtopic_id' => $subtopicId,
        'question_type_id' => 2,
        'start_at' => $startAt, // Use the converted datetime
        'end_at' => now(),
        'total_time_seconds' => $request->total_time_seconds,
        'total_correct' => $request->total_correct,
        'total_skipped' => $request->total_skipped,
        'score' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // Save quiz attempts if provided
    $questionAttempts = $request->get('question_attempts', []);
    if (!empty($questionAttempts)) {
        $this->saveSubjectiveQuizAttempts($questionAttempts, $sessionId, $mainTopicId, $subtopicId);
    }

    return response()->json([
        'success' => true,
        'session_id' => $sessionId,
        'message' => 'Subjective practice session saved'
    ]);
}

    private function saveSubjectiveQuizAttempts($attempts, $sessionId, $mainTopicId, $subtopicId)
    {
        $userId = Auth::id();
        $quizAttempts = [];

        foreach ($attempts as $attempt) {
            $questionId = $attempt['question_id'] ?? 0;
            $parentId = 0;

            if ($questionId) {
                $question = DB::table('questions')->where('id', $questionId)->first();
                $parentId = $question ? $question->parent_id : 0;
            }

            $quizAttempts[] = [
                'user_id' => $userId,
                'parent_id' => $parentId,
                'question_id' => $questionId,
                'topic_id' => $mainTopicId,
                'subtopic_id' => $subtopicId,
                'choosen_answer_id' => 0,
                'answer_status' => 1,
                'subjective_answer' => $attempt['subjective_answer'] ?? null,
                'session_id' => $sessionId,
                'time_taken' => $attempt['time_taken'] ?? 0,
                'question_type_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (!empty($quizAttempts)) {
            DB::table('quiz_attempts')->insert($quizAttempts);

            Log::info('Subjective quiz attempts saved:', [
                'session_id' => $sessionId,
                'attempts_count' => count($quizAttempts),
                'user_id' => $userId,
                'question_type' => 'subjective'
            ]);
        }
    }
}
