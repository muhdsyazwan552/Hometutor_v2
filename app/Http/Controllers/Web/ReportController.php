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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\App;
use App\Traits\InertiaLocaleTrait;


class ReportController extends Controller
{
    use InertiaLocaleTrait;

    public function index(Request $request, $subject)
    {
        $subjectId = $request->get('subject_id');
        $levelId = $request->get('level_id');
        $form = $request->get('form', 'Form 4');
        $questionType = $request->get('question_type', 'Objective');

        $userId = Auth::id();
        Auth::user()->load('student');

        $locale = Session::get('locale', 'en');
        App::setLocale($locale);

        // Load translations
        $translations = $this->loadPhpTranslations($locale);

        Log::info('ReportPage Request:', [
            'subject_param' => $subject,
            'subject_id' => $subjectId,
            'level_id' => $levelId,
            'form' => $form,
            'question_type' => $questionType,
        ]);

        // Get available levels
        $availableLevels = DB::table('level')
            ->where('is_active', 1)
            ->select('id', 'name', 'abbr')
            ->get()
            ->mapWithKeys(function ($level) {
                return [$level->name => $level->id];
            })
            ->toArray();

        // Get available subjects
        $availableSubjects = DB::table('subject')
            ->where('abbr', $subject)
            ->whereIn('level_id', array_values($availableLevels))
            ->where('is_active', 1)
            ->select('id', 'abbr', 'name', 'level_id')
            ->get()
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
        $subjectData = DB::table('subject')
            ->where('id', $subjectId)
            ->first();

        if (!$subjectData) {
            Log::error('Subject not found', ['subject_id' => $subjectId]);
            abort(404, 'Subject not found');
        }

        // Map question type to ID
        $questionTypeId = $this->getQuestionTypeId($questionType);

        // OPTIMASI PENTING: Hanya load data yang diperlukan
        $shouldPreloadBoth = $request->has('preload_both') && $request->get('preload_both') === 'true';

        if ($shouldPreloadBoth) {
            // Load both types menggunakan CACHE untuk performa
            $cacheKey = "report_data_{$subjectId}_{$levelId}";
            $cacheDuration = 5; // 5 menit

            $allData = Cache::remember($cacheKey, $cacheDuration * 60, function () use ($subjectId, $levelId) {
                return [
                    'objective' => $this->getOptimizedReportData($subjectId, $levelId, 1),
                    'subjective' => $this->getOptimizedReportData($subjectId, $levelId, 2)
                ];
            });

            $objectiveData = $allData['objective'];
            $subjectiveData = $allData['subjective'];
            $currentData = $questionType === 'Objective' ? $objectiveData : $subjectiveData;
        }
         else {
            // Load only current type (default untuk initial load)
            $currentData = $this->getOptimizedReportData($subjectId, $levelId, $questionTypeId);
            $objectiveData = $questionType === 'Objective' ? $currentData : [];
            $subjectiveData = $questionType === 'Subjective' ? $currentData : [];
        }

        return $this->renderWithLocale('courses/SubjectReportPage', [
            'subject' => $subjectData->name,
            'subject_abbr' => $subjectData->abbr,
            'subject_id' => $subjectId,
            'level_id' => $levelId,
            'form' => $form,
            'question_type' => $questionType,
            'objective_topics' => $objectiveData,
            'subjective_topics' => $subjectiveData,
            'topics' => $currentData,
            'selectedStandard' => $form,
            'availableLevels' => $availableLevels,
            'availableSubjects' => $availableSubjects,
            'locale' => $locale,
            'translations' => $translations,

            'availableLocales' => ['en', 'ms'],
        ]);
    }

    private function loadPhpTranslations($locale)
    {
        $fallbackLocale = 'en';

        try {
            // Load the common.php file for the requested locale
            $translations = trans('common', [], $locale);

            // If no translations found, try fallback
            if (is_array($translations) && !empty($translations)) {
                return $translations;
            }

            // Fallback to English
            return trans('common', [], $fallbackLocale);
        } catch (\Exception $e) {
            // If translation file doesn't exist, return empty
            Log::error('Failed to load translations: ' . $e->getMessage());
            return [];
        }
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

        return $mapping[$questionType] ?? 1;
    }

    /**
     * Get report data dengan structure topic yang benar
     */
    private function getReportData($subjectId, $levelId, $questionTypeId)
    {
        // Get parent topics with optimized query
        $parentTopics = DB::table('topics')
            ->where('subject_id', $subjectId)
            ->where('level_id', $levelId)
            ->where(function ($query) {
                $query->whereNull('parent_id')
                    ->orWhere('parent_id', 0);
            })
            ->where('is_active', 1)
            ->orderBy('seq')
            ->get(['id', 'name', 'seq']);

        Log::info('Parent topics found:', [
            'count' => $parentTopics->count(),
            'question_type_id' => $questionTypeId
        ]);

        $reportData = [];
        $topicIds = $parentTopics->pluck('id')->toArray();

        // Batch check which topics have questions
        $topicsWithQuestions = $this->batchCheckTopicsWithQuestions($topicIds, $questionTypeId);

        foreach ($parentTopics as $parentTopic) {
            if (!in_array($parentTopic->id, $topicsWithQuestions)) {
                continue; // Skip topics without questions
            }

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

            // Get sub-topics with optimized query
            $subTopics = DB::table('topics')
                ->where('subject_id', $subjectId)
                ->where('level_id', $levelId)
                ->where('parent_id', $parentTopic->id)
                ->where('is_active', 1)
                ->orderBy('seq')
                ->get(['id', 'name', 'seq']);

            $subTopicIds = $subTopics->pluck('id')->toArray();
            $subTopicsWithQuestions = $this->batchCheckTopicsWithQuestions($subTopicIds, $questionTypeId);

            // Process sub-topics yang memiliki questions
            foreach ($subTopics as $subTopic) {
                if (in_array($subTopic->id, $subTopicsWithQuestions)) {
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

        Log::info('Final report data:', [
            'topics_count' => count($reportData),
            'question_type_id' => $questionTypeId
        ]);

        return $reportData;
    }

    /**
     * Batch check which topics have questions (reduces N+1 queries)
     */
    private function batchCheckTopicsWithQuestions(array $topicIds, $questionTypeId)
    {
        if (empty($topicIds)) {
            return [];
        }

        // Check direct questions
        $topicsWithDirectQuestions = DB::table('questions')
            ->whereIn('topic_id', $topicIds)
            ->where('question_type_id', $questionTypeId)
            ->distinct()
            ->pluck('topic_id')
            ->toArray();

        // Check if parent topics have sub-topics with questions
        $topicsWithSubtopics = DB::table('topics as t')
            ->join('questions as q', function ($join) use ($questionTypeId) {
                $join->on('q.topic_id', '=', 't.id')
                    ->where('q.question_type_id', $questionTypeId);
            })
            ->whereIn('t.parent_id', $topicIds)
            ->where('t.is_active', 1)
            ->distinct()
            ->pluck('t.parent_id')
            ->toArray();

        // Merge results
        return array_unique(array_merge($topicsWithDirectQuestions, $topicsWithSubtopics));
    }

    /**
     * Batch calculate progress for multiple topics
     */
    private function batchCalculateTopicProgress(array $topicIds, $questionTypeId)
    {
        if (empty($topicIds)) {
            return [];
        }

        $userId = Auth::id();

        // Get all session data for these topics in one query
        $progressData = DB::table('practice_session')
            ->select(
                DB::raw('CASE WHEN topic_id IN (' . implode(',', $topicIds) . ') THEN topic_id ELSE subtopic_id END as topic_id'),
                DB::raw('COUNT(DISTINCT id) as total_sessions'),
                DB::raw('AVG(score) as average_score'),
                DB::raw('MAX(score) as max_score'),
                DB::raw('MIN(score) as min_score'),
                DB::raw('MAX(created_at) as last_session'),
                DB::raw('SUM(total_correct) as total_answered'),
                DB::raw('SUM(total_correct + total_skipped) as total_questions'),
                DB::raw('AVG(total_correct) as avg_answered')
            )
            ->where(function ($query) use ($topicIds) {
                $query->whereIn('topic_id', $topicIds)
                    ->orWhereIn('subtopic_id', $topicIds);
            })
            ->where('question_type_id', $questionTypeId)
            ->where('user_id', $userId)
            ->groupBy(DB::raw('CASE WHEN topic_id IN (' . implode(',', $topicIds) . ') THEN topic_id ELSE subtopic_id END'))
            ->get()
            ->keyBy('topic_id');

        $result = [];
        foreach ($topicIds as $topicId) {
            $data = $progressData[$topicId] ?? null;

            $stats = [
                'total_sessions' => 0,
                'average_score' => 0,
                'last_session' => null,
                'score_statistic' => '—',
                'total_answered' => 0,
                'total_questions' => 0,
                'completion_rate' => 0,
            ];

            if ($data && $data->total_sessions > 0) {
                $stats['total_sessions'] = $data->total_sessions;

                if ($data->last_session) {
                    $lastSession = \Carbon\Carbon::parse($data->last_session);
                    $stats['last_session'] = $lastSession->year == date('Y')
                        ? $lastSession->format('d M, H:i A')
                        : $lastSession->format('d M Y, H:i A');
                }

                if ($questionTypeId == 1) { // Objective
                    $stats['average_score'] = $data->average_score
                        ? round($data->average_score, 1)
                        : 0;

                    if ($data->max_score !== null && $data->min_score !== null) {
                        $stats['score_statistic'] = round($data->min_score, 0) . ' - ' . round($data->max_score, 0);
                    }
                } else { // Subjective
                    $stats['total_answered'] = (int) ($data->total_answered ?? 0);
                    $stats['total_questions'] = (int) ($data->total_questions ?? 0);
                    $stats['completion_rate'] = $stats['total_questions'] > 0
                        ? round(($stats['total_answered'] / $stats['total_questions']) * 100, 1)
                        : 0;
                    $stats['average_score'] = $data->avg_answered
                        ? round($data->avg_answered, 1)
                        : 0;
                    $stats['score_statistic'] = $stats['total_answered'] . ' answered';
                }
            }

            $result[$topicId] = $stats;
        }

        return $result;
    }

    /**
     * Check if a topic has questions for specific question type
     */
    private function topicHasQuestions($topic, $questionTypeId)
    {
        // Cek jika topic sendiri memiliki questions dengan question_type_id
        $hasDirectQuestions = DB::table('questions')
            ->where('topic_id', $topic->id)
            ->where('question_type_id', $questionTypeId)
            // ->where('is_active', 1)
            ->exists();

        if ($hasDirectQuestions) {
            return true;
        }

        // Untuk parent topic, cek jika ada sub-topics yang memiliki questions dengan question_type_id
        $hasSubTopicsWithQuestions = DB::table('topics')
            ->where('parent_id', $topic->id)
            // ->where('is_active', 1)
            ->whereExists(function ($query) use ($questionTypeId) {
                $query->select(DB::raw(1))
                    ->from('questions')
                    ->whereColumn('questions.topic_id', 'topics.id')
                    ->where('questions.question_type_id', $questionTypeId);
                // ->where('questions.is_active', 1);
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
            'total_answered' => 0,
            'total_questions' => 0,
            'completion_rate' => 0,
        ];

        try {
            // Get basic stats
            $sessionData = DB::table('practice_session')
                ->where(function ($query) use ($topicId) {
                    $query->where('topic_id', $topicId)
                        ->orWhere('subtopic_id', $topicId);
                })
                ->where('question_type_id', $questionTypeId)
                ->where('user_id', Auth::id())
                ->selectRaw('COUNT(DISTINCT id) as total_sessions')
                ->selectRaw('AVG(score) as average_score')
                ->selectRaw('MAX(score) as max_score')
                ->selectRaw('MIN(score) as min_score')
                ->selectRaw('MAX(created_at) as last_session')
                ->selectRaw('SUM(total_correct) as total_answered')
                ->selectRaw('SUM(total_correct + total_skipped) as total_questions')
                ->selectRaw('AVG(total_correct) as avg_answered')
                ->first();

            // Get recent scores for sparkline (last 8 sessions)
            // Get recent scores for sparkline (last 8 sessions)
            $recentScores = DB::table('practice_session')
                ->where(function ($query) use ($topicId) {
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

    /**
     * Get report data yang OPTIMIZED
     */
    private function getOptimizedReportData($subjectId, $levelId, $questionTypeId)
    {
        // Cache key untuk data report
        // $cacheKey = "optimized_report_{$subjectId}_{$levelId}_{$questionTypeId}_" . Auth::id();

        // Cache shared data (tanpa user_id)
        $cacheKey = "report_structure_{$subjectId}_{$levelId}_{$questionTypeId}";

        $cacheDuration = 5; // 

        return Cache::remember($cacheKey, $cacheDuration * 60, function () use ($subjectId, $levelId, $questionTypeId) {
            // 1. Get parent topics sekaligus dengan sub-topics menggunakan JOIN
            $topics = DB::table('topics as parent')
                ->leftJoin('topics as child', function ($join) {
                    $join->on('child.parent_id', '=', 'parent.id')
                        ->where('child.is_active', 1);
                })
                ->where('parent.subject_id', $subjectId)
                ->where('parent.level_id', $levelId)
                ->where(function ($query) {
                    $query->whereNull('parent.parent_id')
                        ->orWhere('parent.parent_id', 0);
                })
                ->where('parent.is_active', 1)
                ->orderBy('parent.seq')
                ->orderBy('child.seq')
                ->select([
                    'parent.id as parent_id',
                    'parent.name as parent_name',
                    'parent.seq as parent_seq',
                    'child.id as child_id',
                    'child.name as child_name',
                    'child.seq as child_seq'
                ])
                ->get();

            if ($topics->isEmpty()) {
                return [];
            }

            // 2. Group by parent
            $groupedTopics = [];
            foreach ($topics as $topic) {
                $parentId = $topic->parent_id;

                if (!isset($groupedTopics[$parentId])) {
                    $groupedTopics[$parentId] = [
                        'id' => $parentId,
                        'name' => $topic->parent_name,
                        'seq' => $topic->parent_seq,
                        'subtopics' => []
                    ];
                }

                if ($topic->child_id) {
                    $groupedTopics[$parentId]['subtopics'][] = [
                        'id' => $topic->child_id,
                        'name' => $topic->child_name,
                        'seq' => $topic->child_seq
                    ];
                }
            }

            // 3. Collect all topic IDs (parent + child)
            $allTopicIds = [];
            foreach ($groupedTopics as $parentId => $parentData) {
                $allTopicIds[] = $parentId;
                foreach ($parentData['subtopics'] as $subtopic) {
                    $allTopicIds[] = $subtopic['id'];
                }
            }

            // 4. Batch check which topics have questions
            $topicsWithQuestions = $this->optimizedBatchCheckTopicsWithQuestions($allTopicIds, $questionTypeId);

            // 5. Batch calculate progress untuk semua topics
            $progressData = $this->batchCalculateTopicProgress($allTopicIds, $questionTypeId);

            // 6. Filter dan build final data
            $reportData = [];
            foreach ($groupedTopics as $parentId => $parentData) {
                // Skip parent jika tidak ada questions di parent ATAU di children
                $parentHasQuestions = in_array($parentId, $topicsWithQuestions);
                $childrenWithQuestions = array_filter($parentData['subtopics'], function ($child) use ($topicsWithQuestions) {
                    return in_array($child['id'], $topicsWithQuestions);
                });

                if (!$parentHasQuestions && empty($childrenWithQuestions)) {
                    continue;
                }

                $parentProgress = $progressData[$parentId] ?? $this->getEmptyProgress();

                $reportTopic = [
                    'id' => $parentId,
                    'name' => $parentData['name'],
                    'seq' => $parentData['seq'],
                    'has_questions' => true,
                    'total_sessions' => $parentProgress['total_sessions'],
                    'average_score' => $parentProgress['average_score'],
                    'last_session' => $parentProgress['last_session'],
                    'score_statistic' => $parentProgress['score_statistic'],
                    'subtopics' => [],
                ];

                // Process sub-topics yang memiliki questions
                foreach ($parentData['subtopics'] as $subtopic) {
                    if (in_array($subtopic['id'], $topicsWithQuestions)) {
                        $subTopicProgress = $progressData[$subtopic['id']] ?? $this->getEmptyProgress();

                        $reportTopic['subtopics'][] = [
                            'id' => $subtopic['id'],
                            'name' => $subtopic['name'],
                            'seq' => $subtopic['seq'],
                            'has_questions' => true,
                            'progress' => $subTopicProgress,
                        ];
                    }
                }

                $reportTopic['subtopics_count'] = count($reportTopic['subtopics']);
                $reportData[] = $reportTopic;
            }

            // Sort by sequence
            usort($reportData, function ($a, $b) {
                return $a['seq'] <=> $b['seq'];
            });

            Log::info('Optimized report data generated:', [
                'topics_count' => count($reportData),
                'question_type_id' => $questionTypeId
            ]);

            return $reportData;
        });
    }

    /**
     * Optimized batch check untuk topics with questions
     */
    private function optimizedBatchCheckTopicsWithQuestions(array $topicIds, $questionTypeId)
    {
        if (empty($topicIds)) {
            return [];
        }

        // Gunakan single query dengan UNION untuk efisiensi
        $placeholders = implode(',', array_fill(0, count($topicIds), '?'));

        $query = "
            SELECT DISTINCT topic_id FROM (
                -- Direct questions
                SELECT topic_id FROM questions 
                WHERE topic_id IN ({$placeholders}) 
                AND question_type_id = ?
                
                UNION
                
                -- Questions in subtopics (untuk parent topics)
                SELECT t.parent_id as topic_id FROM topics t
                INNER JOIN questions q ON q.topic_id = t.id
                WHERE t.parent_id IN ({$placeholders})
                AND t.is_active = 1
                AND q.question_type_id = ?
            ) as combined
        ";

        // Prepare parameters: topicIds + questionTypeId + topicIds + questionTypeId
        $params = array_merge($topicIds, [$questionTypeId], $topicIds, [$questionTypeId]);

        $results = DB::select($query, $params);

        return array_column($results, 'topic_id');
    }

    /**
     * Get empty progress data
     */
    private function getEmptyProgress()
    {
        return [
            'total_sessions' => 0,
            'average_score' => 0,
            'last_session' => null,
            'score_statistic' => '—',
            'total_answered' => 0,
            'total_questions' => 0,
            'completion_rate' => 0,
        ];
    }

    /**
     * Batch calculate progress for multiple topics
     */
    // private function batchCalculateTopicProgress(array $topicIds, $questionTypeId)
    // {
    //     if (empty($topicIds)) {
    //         return [];
    //     }

    //     $userId = Auth::id();

    //     // Gunakan prepared statement untuk keamanan
    //     $placeholders = implode(',', array_fill(0, count($topicIds), '?'));

    //     $query = "
    //         SELECT 
    //             CASE 
    //                 WHEN topic_id IN ({$placeholders}) THEN topic_id 
    //                 ELSE subtopic_id 
    //             END as topic_id,
    //             COUNT(DISTINCT id) as total_sessions,
    //             AVG(score) as average_score,
    //             MAX(score) as max_score,
    //             MIN(score) as min_score,
    //             MAX(created_at) as last_session,
    //             COALESCE(SUM(total_correct), 0) as total_answered,
    //             COALESCE(SUM(total_correct + total_skipped), 0) as total_questions,
    //             AVG(total_correct) as avg_answered
    //         FROM practice_session
    //         WHERE (topic_id IN ({$placeholders}) OR subtopic_id IN ({$placeholders}))
    //             AND question_type_id = ?
    //             AND user_id = ?
    //         GROUP BY CASE 
    //             WHEN topic_id IN ({$placeholders}) THEN topic_id 
    //             ELSE subtopic_id 
    //         END
    //     ";

    //     // Parameters: topicIds (untuk CASE) + topicIds (untuk WHERE) + topicIds (untuk WHERE) + questionTypeId + userId + topicIds (untuk GROUP BY)
    //     $params = array_merge(
    //         $topicIds,                    // Untuk CASE pertama
    //         $topicIds,                    // Untuk WHERE pertama
    //         $topicIds,                    // Untuk WHERE kedua  
    //         [$questionTypeId, $userId],  // question_type_id dan user_id
    //         $topicIds                     // Untuk GROUP BY
    //     );

    //     $progressData = DB::select($query, $params);

    //     $result = [];
    //     foreach ($progressData as $data) {
    //         $topicId = $data->topic_id;

    //         $stats = [
    //             'total_sessions' => (int)$data->total_sessions,
    //             'average_score' => 0,
    //             'last_session' => null,
    //             'score_statistic' => '—',
    //             'total_answered' => (int)$data->total_answered,
    //             'total_questions' => (int)$data->total_questions,
    //             'completion_rate' => 0,
    //         ];

    //         if ($data->total_sessions > 0) {
    //             // Format last session
    //             if ($data->last_session) {
    //                 $lastSession = \Carbon\Carbon::parse($data->last_session);
    //                 $stats['last_session'] = $lastSession->year == date('Y')
    //                     ? $lastSession->format('d M, H:i A')
    //                     : $lastSession->format('d M Y, H:i A');
    //             }

    //             if ($questionTypeId == 1) { // Objective
    //                 $stats['average_score'] = $data->average_score
    //                     ? round($data->average_score, 1)
    //                     : 0;

    //                 if ($data->max_score !== null && $data->min_score !== null) {
    //                     $stats['score_statistic'] = round($data->min_score, 0) . ' - ' . round($data->max_score, 0);
    //                 }
    //             } else { // Subjective
    //                 $stats['completion_rate'] = $data->total_questions > 0
    //                     ? round(($data->total_answered / $data->total_questions) * 100, 1)
    //                     : 0;
    //                 $stats['average_score'] = $data->avg_answered
    //                     ? round($data->avg_answered, 1)
    //                     : 0;
    //                 $stats['score_statistic'] = $data->total_answered . ' answered';
    //             }
    //         }

    //         $result[$topicId] = $stats;
    //     }

    //     // Ensure all topic IDs have progress data
    //     foreach ($topicIds as $topicId) {
    //         if (!isset($result[$topicId])) {
    //             $result[$topicId] = $this->getEmptyProgress();
    //         }
    //     }

    //     return $result;
    // }

    /**
     * Calculate progress statistics for a topic (single, for backward compatibility)
     */
    // private function calculateTopicProgress($topicId, $questionTypeId)
    // {
    //     $batchResult = $this->batchCalculateTopicProgress([$topicId], $questionTypeId);
    //     return $batchResult[$topicId] ?? $this->getEmptyProgress();
    // }

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

            $subtopic = DB::table('topics')->where('id', $subtopicId)->first();

            if (!$subtopic) {
                abort(404, 'Subtopic not found');
            }

            // Get detailed session data with all sessions
            $sessions = DB::table('practice_session')
                ->where(function ($query) use ($subtopicId) {
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
                    // Objective calculations
                    $totalQuestions = ($session->total_correct ?? 0) + ($session->total_skipped ?? 0);

                    // For objective, calculate wrong answers
                    $totalWrong = 5 - ($session->total_correct ?? 0) - ($session->total_skipped ?? 0);
                    $totalWrong = max($totalWrong, 0);
                    $totalQuestions = ($session->total_correct ?? 0) + $totalWrong + ($session->total_skipped ?? 0);

                    // Calculate score percentage
                    $scorePercentage = $totalQuestions > 0 ? (($session->total_correct ?? 0) / $totalQuestions) * 100 : 0;

                    // For DonutChart, use score_percentage
                    $scoreForChart = $scorePercentage;
                } else { // Subjective (questionTypeId == 2)
                    // Subjective calculations
                    $totalAnswered = $session->total_correct ?? 0;
                    $totalSkipped = $session->total_skipped ?? 0;

                    // For subjective, total questions = 5 (as per your requirement)
                    $totalQuestions = 5;

                    // Recalculate skipped
                    $totalSkipped = $totalQuestions - $totalAnswered;
                    $totalSkipped = max($totalSkipped, 0);

                    $totalWrong = 0;

                    // Calculate completion rate
                    $completionRate = $totalQuestions > 0 ? ($totalAnswered / $totalQuestions) * 100 : 0;

                    // For DonutChart, use completion rate
                    $scoreForChart = $completionRate;
                }

                // Format time
                $totalTime = $this->formatTime($session->total_time_seconds ?? 0);

                // Calculate average time per question
                $averageTime = $totalQuestions > 0
                    ? $this->formatTime(($session->total_time_seconds ?? 0) / $totalQuestions)
                    : '0 min 0 secs';

                // Format session date - IMPORTANT FIX
                $sessionDate = $session->created_at
                    ? \Carbon\Carbon::parse($session->created_at)->format('d M Y, H:i')
                    : '-';

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
                    'score_for_chart' => $scoreForChart, // Add this for DonutChart
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

            // 1. Get session with topic in single query
            $session = DB::table('practice_session')
                ->leftJoin('topics', 'practice_session.topic_id', '=', 'topics.id')
                ->select('practice_session.*', 'topics.name as topic_name')
                ->where('practice_session.id', $sessionId)
                ->first();

            if (!$session) {
                abort(404, 'Session not found');
            }

            // 2. Get ALL attempts for this session with questions in ONE query
            $attempts = DB::table('quiz_attempts as qa')
                ->join('questions as q', 'qa.question_id', '=', 'q.id')
                ->leftJoin('topics as t', 'q.topic_id', '=', 't.id')
                ->select(
                    'qa.*',
                    'q.question_text',
                    'q.question_file',
                    'q.question_type_id',
                    't.name as topic_name'
                )
                ->where('qa.session_id', $sessionId)
                ->orderBy('qa.created_at', 'asc')
                ->get();

            if ($attempts->isEmpty()) {
                return response()->json([
                    'session' => $this->formatSession($session),
                    'attempts' => [],
                    'total_questions' => 0,
                    'success' => true
                ]);
            }

            // 3. Get ALL question IDs for this session
            $questionIds = $attempts->pluck('question_id')->unique()->toArray();

            // 4. Get ALL answers for ALL questions in ONE query (not N queries)
            $allAnswers = DB::table('answers')
                ->whereIn('question_id', $questionIds)
                ->orderBy('question_id')
                ->orderBy('seq', 'asc')
                ->get()
                ->groupBy('question_id'); // Group by question_id for easy access

            $formattedAttempts = [];

            // 5. Process all attempts in memory (no more DB queries in loop)
            foreach ($attempts as $attempt) {
                $questionId = $attempt->question_id;
                $answers = $allAnswers[$questionId] ?? collect();

                // Get correct answer
                $correctAnswer = $answers->firstWhere('iscorrectanswer', 1);

                // Get explanation from any answer
                $explanationAnswer = $answers->first(function ($answer) {
                    return !empty($answer->reason);
                });
                $explanation = $explanationAnswer ? $explanationAnswer->reason : "Explanation not available.";

                // Get chosen answer details (from answers collection, not DB)
                $chosenAnswer = null;
                if ($attempt->choosen_answer_id) {
                    $chosenAnswer = $answers->firstWhere('id', $attempt->choosen_answer_id);
                }

                // Format answers for objective questions
                $formattedAnswers = [];
                if ($attempt->question_type_id == 1) { // Objective
                    $formattedAnswers = $answers->map(function ($answer) use ($attempt, $chosenAnswer) {
                        return $this->formatAnswer($answer, $attempt, $chosenAnswer);
                    })->toArray();
                }

                // Get schema answer for subjective questions
                $schemaAnswer = null;
                if ($attempt->question_type_id == 2) { // Subjective
                    $sampleAnswer = $answers->first(function ($answer) {
                        return !empty($answer->sample_answer);
                    });
                    $schemaAnswer = $sampleAnswer ? $sampleAnswer->sample_answer : $explanation;
                }

                $formattedAttempts[] = [
                    'id' => $attempt->id,
                    'question_id' => $questionId,
                    'question_text' => $attempt->question_text,
                    'question_file' => $attempt->question_file,
                    'question_type' => $attempt->question_type_id == 1 ? 'objective' : 'subjective',
                    'question_type_id' => $attempt->question_type_id,
                    'answers' => $formattedAnswers,
                    'chosen_answer_id' => $attempt->choosen_answer_id,
                    'answer_status' => $attempt->answer_status,
                    'is_correct' => $attempt->answer_status == 1,
                    'time_taken' => $attempt->time_taken,
                    'topic_name' => $attempt->topic_name ?: 'Unknown',
                    'explanation' => $explanation,
                    'subjective_answer' => $attempt->subjective_answer,
                    'schema_answer' => $schemaAnswer,
                    'created_at' => $attempt->created_at ? date('Y-m-d H:i:s', strtotime($attempt->created_at)) : null,
                ];
            }

            return response()->json([
                'session' => $this->formatSession($session),
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
     * Format answer data
     */
    private function formatAnswer($answer, $attempt, $chosenAnswer)
    {
        $isChosen = $chosenAnswer && $chosenAnswer->id == $answer->id;
        $isCorrect = $answer->iscorrectanswer == 1;

        // Check if we should show correct answer
        $shouldShowCorrect = !($attempt->choosen_answer_id == 0 && $attempt->answer_status == 0);

        // Only mark as correct/wrong if answer was actually chosen
        $wasCorrect = $isChosen && $isCorrect;
        $wasWrong = $isChosen && !$isCorrect;

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
            'file' => $fileUrl,
            'is_correct' => $shouldShowCorrect ? $isCorrect : false,
            'is_chosen' => $isChosen,
            'was_correct' => $wasCorrect,
            'was_wrong' => $wasWrong,
            'has_html' => $hasHtmlContent,
            'has_image' => $hasImage,
            'type' => $type,
            'show_correct' => $shouldShowCorrect,
        ];
    }

    /**
     * Format session data
     */
    private function formatSession($session)
    {
        return [
            'id' => $session->id,
            'total_correct' => $session->total_correct,
            'total_skipped' => $session->total_skipped,
            'score' => $session->score,
            'total_time_seconds' => $session->total_time_seconds,
            'created_at' => $session->created_at ? date('d M Y, H:i', strtotime($session->created_at)) : null,
            'topic_name' => $session->topic_name ?: 'Unknown',
            'question_type_id' => $session->question_type_id,
        ];
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
