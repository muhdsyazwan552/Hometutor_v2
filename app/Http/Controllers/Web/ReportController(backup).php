<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

use App\Models\Subject;
use App\Models\Topic;
use App\Models\Level;
use App\Models\Question;
use App\Models\QuizAttempt;
use App\Models\Answer;
use App\Models\PracticeSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;


class ReportController extends Controller
{
    public function index(Request $request, $subject)
    {
        $subjectId = $request->get('subject_id');
        $levelId = $request->get('level_id');
        $form = $request->get('form', 'Form 4');
        $questionType = $request->get('question_type', 'Objective'); // Default to Objective

        Log::info('ReportPage Request:', [
            'subject_param' => $subject,
            'subject_id' => $subjectId,
            'level_id' => $levelId,
            'form' => $form,
            'question_type' => $questionType,
        ]);

        // Get available levels
        $availableLevels = Level::where('is_active', true)
            ->get(['id', 'name', 'abbr'])
            ->mapWithKeys(function ($level) {
                return [$level->name => $level->id];
            })
            ->toArray();

        // Get available subjects
        $availableSubjects = Subject::where('abbr', $subject)
            ->whereIn('level_id', array_values($availableLevels))
            ->where('is_active', true)
            ->get(['id', 'abbr', 'name', 'level_id'])
            ->mapWithKeys(function ($subject) use ($availableLevels) {
                $levelName = array_search($subject->level_id, $availableLevels);
                return [$levelName => $subject->id];
            })
            ->toArray();

        // If form is provided, prioritize it over existing IDs
        if ($form && isset($availableLevels[$form])) {
            $newLevelId = $availableLevels[$form];

            if ($newLevelId != $levelId) {
                $levelId = $newLevelId;

                if (isset($availableSubjects[$form])) {
                    $subjectId = $availableSubjects[$form];
                    Log::info('Auto-updated subject and level based on form:', [
                        'form' => $form,
                        'level_id' => $levelId,
                        'subject_id' => $subjectId
                    ]);
                }
            }
        }

        // Validate required parameters
        if (!$subjectId || !$levelId) {
            Log::error('Missing parameters', [
                'subject_id' => $subjectId,
                'level_id' => $levelId,
                'available_subjects' => $availableSubjects,
                'available_levels' => $availableLevels
            ]);
            abort(400, 'Missing required parameters: subject_id and level_id are required');
        }

        // Get subject details
        $subjectData = Subject::find($subjectId);

        if (!$subjectData) {
            Log::error('Subject not found', ['subject_id' => $subjectId]);
            abort(404, 'Subject not found');
        }

        // Map question type to ID
        $questionTypeId = $this->getQuestionTypeId($questionType);

        // Get topics dengan structure yang benar
        $reportData = $this->getReportData($subjectId, $levelId, $questionTypeId);

        return Inertia::render('courses/SubjectReportPage', [
            'subject' => $subjectData->name,
            'subject_abbr' => $subjectData->abbr,
            'subject_id' => $subjectId,
            'level_id' => $levelId,
            'form' => $form,
            'question_type' => $questionType,
            'topics' => $reportData,
            'selectedStandard' => $form,
            'availableLevels' => $availableLevels,
            'availableSubjects' => $availableSubjects,
        ]);
    }

    /**
     * Map question type name to ID
     */
    private function getQuestionTypeId($questionType)
    {
        $mapping = [
            'Objective' => 1,
            'Subjective' => 2
        ];

        return $mapping[$questionType] ?? 1; // Default to Objective (1)
    }

    /**
     * Get report data dengan structure topic yang benar
     */
    private function getReportData($subjectId, $levelId, $questionTypeId)
    {
        // Get ONLY parent topics (parent_id is NULL or 0)
        $parentTopics = Topic::where('subject_id', $subjectId)
            ->where('level_id', $levelId)
            ->where(function ($query) {
                $query->whereNull('parent_id')
                    ->orWhere('parent_id', 0);
            })
            ->where('is_active', true)
            ->where('is_published', true)
            ->orderBy('seq')
            ->get();

        Log::info('Parent topics found:', [
            'count' => $parentTopics->count(),
            'topics' => $parentTopics->pluck('name', 'id'),
            'question_type_id' => $questionTypeId
        ]);

        $reportData = [];

        foreach ($parentTopics as $parentTopic) {
            // Cek jika parent topic memiliki questions ATAU memiliki sub-topics dengan questions
            $hasQuestions = $this->topicHasQuestions($parentTopic, $questionTypeId);

            if ($hasQuestions) {
                $parentProgress = $this->calculateTopicProgress($parentTopic->id, $questionTypeId);

                $reportTopic = [
                    'id' => $parentTopic->id,
                    'name' => $parentTopic->name,
                    'seq' => $parentTopic->seq,
                    'has_questions' => true,
                    'total_sessions' => $parentProgress['total_sessions'],
                    'average_score' => $parentProgress['average_score'],
                    'last_session' => $parentProgress['last_session'],
                    'score_statistic' => $parentProgress['score_statistic'],
                    'subtopics' => [],
                ];

                // Get sub-topics untuk parent ini (parent_id = parentTopic->id)
                $subTopics = Topic::where('subject_id', $subjectId)
                    ->where('level_id', $levelId)
                    ->where('parent_id', $parentTopic->id) // Parent ID yang spesifik
                    ->where('is_active', true)
                    ->where('is_published', true)
                    ->orderBy('seq')
                    ->get();

                Log::info("Sub-topics for {$parentTopic->name}:", [
                    'parent_id' => $parentTopic->id,
                    'subtopics_count' => $subTopics->count(),
                    'subtopics' => $subTopics->pluck('name', 'id')
                ]);

                // Process sub-topics yang memiliki questions
                foreach ($subTopics as $subTopic) {
                    if ($this->topicHasQuestions($subTopic, $questionTypeId)) {
                        $subTopicProgress = $this->calculateTopicProgress($subTopic->id, $questionTypeId);

                        $reportTopic['subtopics'][] = [
                            'id' => $subTopic->id,
                            'name' => $subTopic->name,
                            'seq' => $subTopic->seq,
                            'has_questions' => true,
                            'progress' => $subTopicProgress,
                        ];
                    }
                }

                $reportTopic['subtopics_count'] = count($reportTopic['subtopics']);
                $reportData[] = $reportTopic;
            }
        }

        Log::info('Final report data:', [
            'topics_count' => count($reportData),
            'topics_with_subtopics' => collect($reportData)->filter(fn($topic) => $topic['subtopics_count'] > 0)->count(),
            'question_type_id' => $questionTypeId
        ]);

        return $reportData;
    }

    /**
     * Check if a topic has questions for specific question type
     */
    private function topicHasQuestions($topic, $questionTypeId)
    {
        // Cek jika topic sendiri memiliki questions dengan question_type_id
        $hasDirectQuestions = Question::where('topic_id', $topic->id)
            ->where('question_type_id', $questionTypeId)
            ->active()
            ->exists();

        if ($hasDirectQuestions) {
            return true;
        }

        // Untuk parent topic, cek jika ada sub-topics yang memiliki questions dengan question_type_id
        $hasSubTopicsWithQuestions = Topic::where('parent_id', $topic->id)
            ->where('is_active', true)
            ->whereExists(function ($query) use ($questionTypeId) {
                $query->select(DB::raw(1))
                    ->from('questions')
                    ->whereColumn('questions.topic_id', 'topics.id')
                    ->where('questions.question_type_id', $questionTypeId)
                    ->where('questions.is_active', true);
            })
            ->exists();

        return $hasSubTopicsWithQuestions;
    }

    /**
     * Calculate progress statistics for a topic using PracticeSession model
     */
    private function calculateTopicProgress($topicId, $questionTypeId)
    {
        $stats = [
            'total_sessions' => 0,
            'average_score' => 0,
            'last_session' => null,
            'score_statistic' => '—',
            'score_history' => [],
            // Add subjective-specific fields
            'total_answered' => 0,
            'total_questions' => 0,
            'completion_rate' => 0,
        ];

        try {
            // Get basic stats
            $sessionData = PracticeSession::where(function ($query) use ($topicId) {
                $query->where('topic_id', $topicId)
                    ->orWhere('subtopic_id', $topicId);
            })
                ->where('question_type_id', $questionTypeId)
                ->where('user_id', Auth::id())
                ->select(
                    DB::raw('COUNT(DISTINCT id) as total_sessions'),
                    DB::raw('AVG(score) as average_score'),
                    DB::raw('MAX(score) as max_score'),
                    DB::raw('MIN(score) as min_score'),
                    DB::raw('MAX(created_at) as last_session'),
                    // Subjective-specific calculations
                    DB::raw('SUM(total_correct) as total_answered'),
                    DB::raw('SUM(total_correct + total_skipped) as total_questions'),
                    DB::raw('AVG(total_correct) as avg_answered')
                )
                ->first();

            // Get recent scores for sparkline (last 8 sessions)
            $recentScores = PracticeSession::where(function ($query) use ($topicId) {
                $query->where('topic_id', $topicId)
                    ->orWhere('subtopic_id', $topicId);
            })
                ->where('question_type_id', $questionTypeId)
                ->where('user_id', Auth::id())
                ->orderBy('created_at', 'asc')
                ->limit(8)
                ->pluck('score')
                ->map(function ($score) {
                    return (int) round($score);
                })
                ->toArray();

            if ($sessionData && $sessionData->total_sessions > 0) {
                $stats['total_sessions'] = $sessionData->total_sessions;

                // Format last session date - JUST DATE AND TIME (no "Today" or "Yesterday")
                if ($sessionData->last_session) {
                    $lastSession = \Carbon\Carbon::parse($sessionData->last_session);
                    // Format: "15 Dec, 14:30" or "15 Dec 2024, 14:30" if not current year
                    if ($lastSession->year == date('Y')) {
                        $stats['last_session'] = $lastSession->format('d M, H:i A'); // "15 Dec, 14:30"
                    } else {
                        $stats['last_session'] = $lastSession->format('d M Y, H:i A'); // "15 Dec 2023, 14:30"
                    }
                } else {
                    $stats['last_session'] = '-';
                }

                // Different calculations for Objective vs Subjective
                if ($questionTypeId == 1) { // Objective
                    $stats['average_score'] = $sessionData->average_score
                        ? round($sessionData->average_score, 1)
                        : 0;

                    // Calculate score statistic (min - max)
                    if ($sessionData->max_score !== null && $sessionData->min_score !== null) {
                        $stats['score_statistic'] = round($sessionData->min_score, 0) . ' - ' . round($sessionData->max_score, 0);
                    }

                    $stats['score_history'] = $recentScores;
                } else { // Subjective
                    // For subjective, use different metrics
                    $stats['total_answered'] = (int) ($sessionData->total_answered ?? 0);
                    $stats['total_questions'] = (int) ($sessionData->total_questions ?? 0);

                    // Calculate completion rate
                    $stats['completion_rate'] = $stats['total_questions'] > 0
                        ? round(($stats['total_answered'] / $stats['total_questions']) * 100, 1)
                        : 0;

                    // For subjective, we can use avg_answered as a metric
                    $stats['average_score'] = $sessionData->avg_answered
                        ? round($sessionData->avg_answered, 1)
                        : 0;

                    // Subjective doesn't have score_statistic in the same way
                    $stats['score_statistic'] = $stats['total_answered'] . ' answered';
                }
            }
        } catch (\Exception $e) {
            Log::error('Error calculating topic progress:', [
                'topic_id' => $topicId,
                'question_type_id' => $questionTypeId,
                'error' => $e->getMessage()
            ]);
        }

        return $stats;
    }

    // Update the getSubtopicDetails method in ReportController.php
    public function getSubtopicDetails($subtopicId, Request $request)
    {
        try {
            $questionType = $request->get('questionType', 'Objective');
            $questionTypeId = $this->getQuestionTypeId($questionType);

            Log::info('Fetching subtopic details:', [
                'subtopic_id' => $subtopicId,
                'question_type' => $questionType,
                'question_type_id' => $questionTypeId
            ]);

            $subtopic = Topic::findOrFail($subtopicId);

            // Get detailed session data with all sessions
            $sessions = PracticeSession::where(function ($query) use ($subtopicId) {
                $query->where('topic_id', $subtopicId)
                    ->orWhere('subtopic_id', $subtopicId);
            })
                ->where('question_type_id', $questionTypeId)
                ->where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get();

            $sessionData = [];

            foreach ($sessions as $index => $session) {
                if ($questionTypeId == 1) { // Objective
                    // Objective calculations (existing logic)
                    $totalQuestions = $session->total_correct + $session->total_skipped;

                    // For objective, calculate wrong answers
                    $totalWrong = 5 - $session->total_correct - $session->total_skipped;
                    $totalWrong = max($totalWrong, 0);
                    $totalQuestions = $session->total_correct + $totalWrong + $session->total_skipped;

                    // Calculate score percentage
                    $scorePercentage = $totalQuestions > 0 ? ($session->total_correct / $totalQuestions) * 100 : 0;
                } else { // Subjective (questionTypeId == 2)
                    // Subjective calculations
                    // total_correct = questions answered (any attempt)
                    // total_skipped = questions not attempted

                    $totalAnswered = $session->total_correct ?? 0;
                    $totalSkipped = $session->total_skipped ?? 0;

                    // For subjective, total questions = 5 (as per your requirement)
                    $totalQuestions = 5;

                    // Recalculate skipped to ensure consistency
                    $totalSkipped = $totalQuestions - $totalAnswered;
                    $totalSkipped = max($totalSkipped, 0);

                    // For subjective, there's no "wrong" - just answered or skipped
                    $totalWrong = 0;

                    // Calculate completion rate (not score)
                    $completionRate = $totalQuestions > 0 ? ($totalAnswered / $totalQuestions) * 100 : 0;
                }

                // Format time (same for both)
                $totalTime = $this->formatTime($session->total_time_seconds ?? 0);

                // Calculate average time per question
                $averageTime = $totalQuestions > 0
                    ? $this->formatTime(($session->total_time_seconds ?? 0) / $totalQuestions)
                    : '0 min 0 secs';

                // Format session date
                $sessionDate = $session->created_at->format('d M Y, H:i');

                // Prepare session data
                $sessionData[] = [
                    'id' => $session->id,
                    'session_no' => $index + 1,
                    'session_date' => $sessionDate,
                    'total_questions' => $totalQuestions,
                    'total_correct' => $questionTypeId == 1 ? ($session->total_correct ?? 0) : $totalAnswered,
                    'total_wrong' => $totalWrong,
                    'total_skipped' => $questionTypeId == 1 ? ($session->total_skipped ?? 0) : $totalSkipped,
                    // Different display for Objective vs Subjective
                    'score' => $questionTypeId == 1
                        ? round($scorePercentage, 1) . '%'
                        : round($completionRate, 1) . '%',
                    'score_percentage' => $questionTypeId == 1 ? $scorePercentage : $completionRate,
                    'total_time' => $totalTime,
                    'total_time_seconds' => $session->total_time_seconds ?? 0,
                    'average_time' => $averageTime,
                    'question_type' => $questionTypeId,
                ];
            }

            return response()->json([
                'sessions' => $sessionData,
                'subtopic_name' => $subtopic->name,
                'total_sessions' => count($sessionData),
                'question_type' => $questionType,
                'question_type_label' => $questionTypeId == 1 ? 'Objective' : 'Subjective',
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting subtopic details:', [
                'subtopic_id' => $subtopicId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to load subtopic details: ' . $e->getMessage(),
                'sessions' => []
            ], 500);
        }
    }

    // Helper method to format time
    private function formatTime($seconds)
    {
        if (!$seconds) return "0 min 0 secs";

        $minutes = floor($seconds / 60);
        $remainingSeconds = $seconds % 60;

        return "{$minutes} min {$remainingSeconds} secs";
    }


    // public function getQuestionAttempts($sessionId)
    // {
    //     try {
    //         Log::info('Fetching question attempts for session:', ['session_id' => $sessionId]);

    //         // Get the session with topic
    //         $session = PracticeSession::with('topic')->findOrFail($sessionId);

    //         // Get all quiz attempts for this session
    //         $attempts = QuizAttempt::with([
    //             'question' => function($query) {
    //                 $query->with(['answers' => function($q) {
    //                     $q->orderBy('seq', 'asc');
    //                 }]);
    //             },
    //             'chosenAnswer'
    //         ])
    //         ->where('session_id', $sessionId)
    //         ->orderBy('created_at', 'asc')
    //         ->get();

    //         // Format the data for frontend
    //         $formattedAttempts = [];

    //         foreach ($attempts as $attempt) {
    //             $question = $attempt->question;

    //             if (!$question) {
    //                 Log::warning('Question not found for attempt:', ['attempt_id' => $attempt->id]);
    //                 continue;
    //             }

    //             // Get answers for this question
    //             $answers = $question->answers ?? collect();

    //             // Get correct answer
    //             $correctAnswer = $answers->where('iscorrectanswer', true)->first();

    //             // Format answers with selection status
    //             $formattedAnswers = $answers->map(function($answer) use ($attempt, $correctAnswer) {
    //                 $isChosen = $attempt->chosenAnswer && $attempt->chosenAnswer->id === $answer->id;
    //                 $isCorrect = $answer->iscorrectanswer;

    //                 // Check if answer contains HTML
    //                 $hasHtmlContent = $answer->answer_text && preg_match('/<[^>]+>/', $answer->answer_text);

    //                 return [
    //                     'id' => $answer->id,
    //                     'text' => $answer->answer_text,
    //                     'file' => $answer->answer_option_file,
    //                     'is_correct' => (bool)$isCorrect,
    //                     'is_chosen' => $isChosen,
    //                     'was_correct' => $isChosen && $isCorrect,
    //                     'was_wrong' => $isChosen && !$isCorrect,
    //                     // Add HTML detection fields
    //                     'has_html' => $hasHtmlContent,
    //                     'type' => $hasHtmlContent ? 'html' : (!empty($answer->answer_text) ? 'text' : 'image'),
    //                 ];
    //             });

    //             // Get explanation from any answer
    //             $explanation = null;
    //             $answerWithReason = $answers->first(function($answer) {
    //                 return !empty($answer->reason);
    //             });

    //             if ($answerWithReason) {
    //                 $explanation = $answerWithReason->reason;
    //             } else {
    //                 $explanation = "Explanation not available.";
    //             }

    //             $formattedAttempts[] = [
    //                 'id' => $attempt->id,
    //                 'question_id' => $question->id,
    //                 'question_text' => $question->question_text,
    //                 'question_file' => $question->question_file,
    //                 'question_type' => $question->question_type_id == 1 ? 'objective' : 'subjective',
    //                 'answers' => $formattedAnswers,
    //                 'chosen_answer_id' => $attempt->choosen_answer_id,
    //                 'answer_status' => $attempt->answer_status,
    //                 'is_correct' => $attempt->answer_status == 1,
    //                 'time_taken' => $attempt->time_taken,
    //                 'topic_name' => $question->topic ? $question->topic->name : 'Unknown',
    //                 'explanation' => $explanation,
    //                 'created_at' => $attempt->created_at->format('Y-m-d H:i:s'),
    //             ];
    //         }

    //         return response()->json([
    //             'session' => [
    //                 'id' => $session->id,
    //                 'total_correct' => $session->total_correct,
    //                 'total_skipped' => $session->total_skipped,
    //                 'score' => $session->score,
    //                 'total_time_seconds' => $session->total_time_seconds,
    //                 'created_at' => $session->created_at->format('d M Y, H:i'),
    //                 'topic_name' => $session->topic ? $session->topic->name : 'Unknown',
    //             ],
    //             'attempts' => $formattedAttempts,
    //             'total_questions' => count($formattedAttempts),
    //             'success' => true
    //         ]);

    //     } catch (\Exception $e) {
    //         Log::error('Error fetching question attempts:', [
    //             'session_id' => $sessionId,
    //             'error' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ]);

    //         return response()->json([
    //             'error' => 'Failed to load question attempts: ' . $e->getMessage(),
    //             'success' => false
    //         ], 500);
    //     }
    // }

    // Helper method to get explanation from question
    private function getExplanationFromQuestion($question)
    {
        // Check if any answer has a reason
        $answerWithReason = $question->answers->first(function ($answer) {
            return !empty($answer->reason);
        });

        if ($answerWithReason) {
            return $answerWithReason->reason;
        }

        return "Explanation not available.";
    }

    public function reviewPage($sessionId, Request $request)
    {
        return Inertia::render('courses/review/QuestionReviewPage', [
            'sessionId' => $sessionId,
            'backUrl' => url()->previous(),
        ]);
    }

    public function getQuestionAttempts($sessionId)
    {
        try {
            Log::info('Fetching question attempts for session:', ['session_id' => $sessionId]);

            $session = PracticeSession::with('topic')->findOrFail($sessionId);

            $attempts = QuizAttempt::with([
                'question' => function ($query) {
                    $query->with(['answers' => function ($q) {
                        $q->orderBy('seq', 'asc');
                    }]);
                },
                'chosenAnswer'
            ])
                ->where('session_id', $sessionId)
                ->orderBy('created_at', 'asc')
                ->get();

            $formattedAttempts = [];

            foreach ($attempts as $attempt) {
                $question = $attempt->question;

                if (!$question) {
                    Log::warning('Question not found for attempt:', ['attempt_id' => $attempt->id]);
                    continue;
                }

                $answers = $question->answers ?? collect();

                // Get correct answer (for objective)
                $correctAnswer = $answers->where('iscorrectanswer', true)->first();

                // Format answers with selection status (for objective)
                $formattedAnswers = [];
                if ($question->question_type_id == 1) { // Objective
                    // In getQuestionAttempts method, update the answer formatting section:
                    $formattedAnswers = $answers->map(function ($answer) use ($attempt, $correctAnswer) {
                        $isChosen = $attempt->chosenAnswer && $attempt->chosenAnswer->id === $answer->id;
                        $isCorrect = $answer->iscorrectanswer;

                        // Check if answer contains HTML
                        $hasHtmlContent = $answer->answer_text && preg_match('/<[^>]+>/', $answer->answer_text);

                        // Check if answer has image
                        $hasImage = !empty($answer->answer_option_file);

                        // Determine type
                        $type = 'text';
                        if ($hasHtmlContent) {
                            $type = 'html';
                        } elseif ($hasImage) {
                            $type = 'image';
                        } elseif (!empty($answer->answer_text)) {
                            $type = 'text';
                        }

                        // Construct proper file URL if image exists
                        $fileUrl = null;
                        if ($hasImage) {
                            $fileUrl = $this->getAnswerFileUrl($answer->answer_option_file);
                        }

                        return [
                            'id' => $answer->id,
                            'text' => $answer->answer_text,
                            'file' => $fileUrl, // Use constructed URL
                            'is_correct' => (bool)$isCorrect,
                            'is_chosen' => $isChosen,
                            'was_correct' => $isChosen && $isCorrect,
                            'was_wrong' => $isChosen && !$isCorrect,
                            'has_html' => $hasHtmlContent,
                            'has_image' => $hasImage,
                            'type' => $type,
                        ];
                    });
                }

                // Get explanation from any answer
                $explanation = null;
                $answerWithReason = $answers->first(function ($answer) {
                    return !empty($answer->reason);
                });

                if ($answerWithReason) {
                    $explanation = $answerWithReason->reason;
                } else {
                    $explanation = "Explanation not available.";
                }

                // Get schema answer for subjective questions
                $schemaAnswer = null;
                if ($question->question_type_id == 2) { // Subjective
                    // Get sample answer from answers
                    $sampleAnswer = $answers->first(function ($answer) {
                        return !empty($answer->sample_answer);
                    });

                    if ($sampleAnswer) {
                        $schemaAnswer = $sampleAnswer->sample_answer;
                    } else {
                        // Fallback to reason or any answer text
                        $reasonAnswer = $answers->first(function ($answer) {
                            return !empty($answer->reason);
                        });

                        $schemaAnswer = $reasonAnswer ? $reasonAnswer->reason : "Schema answer not available.";
                    }
                }

                $formattedAttempts[] = [
                    'id' => $attempt->id,
                    'question_id' => $question->id,
                    'question_text' => $question->question_text,
                    'question_file' => $question->question_file,
                    'question_type' => $question->question_type_id == 1 ? 'objective' : 'subjective',
                    'question_type_id' => $question->question_type_id, // Keep ID for easy checking
                    'answers' => $formattedAnswers,
                    'chosen_answer_id' => $attempt->choosen_answer_id,
                    'answer_status' => $attempt->answer_status,
                    'is_correct' => $attempt->answer_status == 1,
                    'time_taken' => $attempt->time_taken,
                    'topic_name' => $question->topic ? $question->topic->name : 'Unknown',
                    'explanation' => $explanation,
                    // Add subjective-specific fields
                    'subjective_answer' => $attempt->subjective_answer,
                    'schema_answer' => $schemaAnswer,
                    'created_at' => $attempt->created_at->format('Y-m-d H:i:s'),
                ];
            }

            return response()->json([
                'session' => [
                    'id' => $session->id,
                    'total_correct' => $session->total_correct,
                    'total_skipped' => $session->total_skipped,
                    'score' => $session->score,
                    'total_time_seconds' => $session->total_time_seconds,
                    'created_at' => $session->created_at->format('d M Y, H:i'),
                    'topic_name' => $session->topic ? $session->topic->name : 'Unknown',
                    'question_type_id' => $session->question_type_id,
                ],
                'attempts' => $formattedAttempts,
                'total_questions' => count($formattedAttempts),
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching question attempts:', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to load question attempts: ' . $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Get answer file URL
     */
    private function getAnswerFileUrl($filename)
    {
        if (empty($filename)) {
            return null;
        }

        // If already a full URL
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
}
