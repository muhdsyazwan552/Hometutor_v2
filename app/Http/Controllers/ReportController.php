<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\Topic;
use App\Models\Level;
use App\Models\Question;
use App\Models\Answer;
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
        
        Log::info('ReportPage Request:', [
            'subject_param' => $subject,
            'subject_id' => $subjectId,
            'level_id' => $levelId,
            'form' => $form,
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

        // Get topics dengan structure yang benar
        $reportData = $this->getReportData($subjectId, $levelId);

        return Inertia::render('courses/SubjectReportPage', [
            'subject' => $subjectData->name,
            'subject_abbr' => $subjectData->abbr,
            'subject_id' => $subjectId,
            'level_id' => $levelId,
            'form' => $form,
            'topics' => $reportData,
            'selectedStandard' => $form,
            'availableLevels' => $availableLevels,
            'availableSubjects' => $availableSubjects,
        ]);
    }

    /**
     * Get report data dengan structure topic yang benar
     */
    private function getReportData($subjectId, $levelId)
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
            'topics' => $parentTopics->pluck('name', 'id')
        ]);

        $reportData = [];

        foreach ($parentTopics as $parentTopic) {
            // Cek jika parent topic memiliki questions ATAU memiliki sub-topics dengan questions
            $hasQuestions = $this->topicHasQuestions($parentTopic);
            
            if ($hasQuestions) {
                $parentProgress = $this->calculateTopicProgress($parentTopic->id);
                
                $reportTopic = [
                    'id' => $parentTopic->id,
                    'name' => $parentTopic->name,
                    'seq' => $parentTopic->seq,
                    'has_questions' => true,
                    'total_sessions' => $parentProgress['total_sessions'],
                    'average_score' => $parentProgress['average_score'],
                    'last_session' => $parentProgress['last_session'],
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
                    if ($this->topicHasQuestions($subTopic)) {
                        $subTopicProgress = $this->calculateTopicProgress($subTopic->id);
                        
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
            'topics_with_subtopics' => collect($reportData)->filter(fn($topic) => $topic['subtopics_count'] > 0)->count()
        ]);

        return $reportData;
    }

    /**
     * Check if a topic has questions
     */
    private function topicHasQuestions($topic)
    {
        // Cek jika topic sendiri memiliki questions
        $hasDirectQuestions = Question::where('topic_id', $topic->id)
            ->active()
            ->exists();

        if ($hasDirectQuestions) {
            return true;
        }

        // Untuk parent topic, cek jika ada sub-topics yang memiliki questions
        $hasSubTopicsWithQuestions = Topic::where('parent_id', $topic->id)
            ->where('is_active', true)
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                      ->from('questions')
                      ->whereColumn('questions.topic_id', 'topics.id')
                      ->where('questions.is_active', true);
            })
            ->exists();

        return $hasSubTopicsWithQuestions;
    }

    /**
     * Calculate progress statistics for a topic
     */
  // Di ReportController.php - tambahkan method untuk score statistic
private function calculateTopicProgress($topicId)
{
    $stats = [
        'total_sessions' => 0,
        'average_score' => 0,
        'last_session' => null,
        'score_statistic' => '—', // Default value
    ];

    try {
        $sessionData = Answer::whereHas('question', function ($query) use ($topicId) {
                $query->where('topic_id', $topicId)
                      ->active();
            })
            ->select(
                DB::raw('COUNT(DISTINCT session_id) as total_sessions'),
                DB::raw('AVG(score) as average_score'),
                DB::raw('MAX(score) as max_score'),
                DB::raw('MIN(score) as min_score'),
                DB::raw('MAX(created_at) as last_session')
            )
            ->first();

        if ($sessionData) {
            $stats['total_sessions'] = $sessionData->total_sessions ?? 0;
            $stats['average_score'] = $sessionData->average_score 
                ? round($sessionData->average_score, 1)
                : 0;
            
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
            'error' => $e->getMessage()
        ]);
    }

    return $stats;
}
}