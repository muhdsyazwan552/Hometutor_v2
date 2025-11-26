<?php

namespace App\Http\Controllers\Web;
use App\Http\Controllers\Controller;

use App\Models\Subject;
use App\Models\Topic;
use App\Models\Level;
use App\Models\Question;
use App\Models\Answer;
use App\Models\PracticeSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

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
            ->where(function($query) {
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
    ];

    try {
        // Get basic stats
        $sessionData = PracticeSession::where(function($query) use ($topicId) {
                $query->where('topic_id', $topicId)
                      ->orWhere('subtopic_id', $topicId);
            })
            ->where('question_type_id', $questionTypeId)
            ->select(
                DB::raw('COUNT(DISTINCT id) as total_sessions'),
                DB::raw('AVG(score) as average_score'),
                DB::raw('MAX(score) as max_score'),
                DB::raw('MIN(score) as min_score'),
                DB::raw('MAX(created_at) as last_session')
            )
            ->first();

        // Get recent scores for sparkline (last 8 sessions)
        $recentScores = PracticeSession::where(function($query) use ($topicId) {
                $query->where('topic_id', $topicId)
                      ->orWhere('subtopic_id', $topicId);
            })
            ->where('question_type_id', $questionTypeId)
            ->orderBy('created_at', 'asc') // Chronological order
            ->limit(8)
            ->pluck('score')
            ->map(function($score) {
                return (int) round($score);
            })
            ->toArray();

        if ($sessionData && $sessionData->total_sessions > 0) {
            $stats['total_sessions'] = $sessionData->total_sessions;
            $stats['average_score'] = $sessionData->average_score 
                ? round($sessionData->average_score, 1)
                : 0;
            
            // Add score history for sparkline
            $stats['score_history'] = $recentScores;
            
            // Calculate score statistic (min - max)
            if ($sessionData->max_score !== null && $sessionData->min_score !== null) {
                $stats['score_statistic'] = round($sessionData->min_score, 0) . ' - ' . round($sessionData->max_score, 0);
            }
                
            if ($sessionData->last_session) {
                $lastSession = \Carbon\Carbon::parse($sessionData->last_session);
                $stats['last_session'] = $lastSession->isToday() 
                    ? 'Today, ' . $lastSession->format('g:i A')
                    : ($lastSession->isYesterday() 
                        ? 'Yesterday, ' . $lastSession->format('g:i A')
                        : $lastSession->format('M j, g:i A'));
            } else {
                $stats['last_session'] = '-';
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
        $sessions = PracticeSession::where(function($query) use ($subtopicId) {
                $query->where('topic_id', $subtopicId)
                      ->orWhere('subtopic_id', $subtopicId);
            })
            ->where('question_type_id', $questionTypeId)
            ->orderBy('created_at', 'desc')
            ->get();

        $sessionData = [];
        
        foreach ($sessions as $session) {
            // Calculate total questions for this session
            $totalQuestions = $session->total_correct + $session->total_skipped;
            
            // Calculate wrong answers - assuming 5 questions per session as per your requirement
            // Adjust this logic based on your actual question count per session
            $totalWrong = 5 - $session->total_correct - $session->total_skipped; // Assuming 5 questions per session
            
            // Ensure wrong answers is not negative
            $totalWrong = max($totalWrong, 0);
            $totalQuestions = $session->total_correct + $totalWrong + $session->total_skipped;
            
            // Calculate score percentage
            $scorePercentage = $totalQuestions > 0 ? ($session->total_correct / $totalQuestions) * 100 : 0;
            
            // Format time
            $totalTime = $this->formatTime($session->total_time_seconds ?? 0);
            $averageTime = $totalQuestions > 0 ? $this->formatTime(($session->total_time_seconds ?? 0) / $totalQuestions) : '0 min 0 secs';
            
            $sessionData[] = [
                'id' => $session->id,
                'session_date' => $session->created_at->format('d/m/Y g:i A'),
                'total_questions' => $totalQuestions,
                'total_correct' => $session->total_correct,
                'total_wrong' => $totalWrong,
                'total_skipped' => $session->total_skipped,
                'score' => round($scorePercentage, 1) . '%',
                'total_time' => $totalTime,
                'average_time' => $averageTime,
                'total_time_seconds' => $session->total_time_seconds ?? 0,
            ];
        }

        return response()->json([
            'sessions' => $sessionData,
            'subtopic_name' => $subtopic->name,
            'total_sessions' => count($sessionData)
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
}