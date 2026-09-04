<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\Level;
use App\Helpers\LevelHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SubjectContentController extends Controller
{
    /**
     * Return the next visible topic/subtopic that has questions for the
     * requested practice type. Parent topics with child topics are skipped,
     * matching the structure displayed on the subject page.
     */
    public function nextPracticeTopic(Request $request)
    {
        $data = $request->validate([
            'subject_id' => ['required', 'integer'],
            'level_id' => ['required', 'integer'],
            'topic_id' => ['required', 'integer'],
            'question_type_id' => ['required', 'integer', 'in:1,2'],
        ]);

        $units = DB::table('topics as topic')
            ->leftJoin('topics as parent', 'topic.parent_id', '=', 'parent.id')
            ->where('topic.subject_id', $data['subject_id'])
            ->where('topic.level_id', $data['level_id'])
            ->where('topic.is_active', 1)
            ->where('topic.is_published', 1)
            ->where(function ($query) {
                $query->where(function ($childTopic) {
                    $childTopic->whereNotNull('topic.parent_id')
                        ->where('topic.parent_id', '<>', 0);
                })->orWhere(function ($parentTopic) {
                    $parentTopic->where(function ($parentId) {
                        $parentId->whereNull('topic.parent_id')
                            ->orWhere('topic.parent_id', 0);
                    })->whereNotExists(function ($children) {
                        $children->selectRaw('1')
                            ->from('topics as child')
                            ->whereColumn('child.parent_id', 'topic.id')
                            ->where('child.is_active', 1)
                            ->where('child.is_published', 1);
                    });
                });
            })
            ->whereExists(function ($questions) use ($data) {
                $questions->selectRaw('1')
                    ->from('questions as question')
                    ->whereColumn('question.topic_id', 'topic.id')
                    ->where('question.question_type_id', $data['question_type_id'])
                    ->where('question.is_active', 1)
                    ->where('question.is_published', 1);
            })
            ->select([
                'topic.id',
                'topic.name',
                'topic.parent_id',
                'topic.seq',
                DB::raw('COALESCE(parent.seq, topic.seq) as parent_seq'),
            ])
            ->orderBy('parent_seq')
            ->orderByRaw('CASE WHEN topic.parent_id IS NULL OR topic.parent_id = 0 THEN 0 ELSE 1 END')
            ->orderBy('topic.seq')
            ->get();

        $currentTopic = $units->first(fn ($unit) => (int) $unit->id === (int) $data['topic_id']);
        $currentIndex = $units->search(fn ($unit) => (int) $unit->id === (int) $data['topic_id']);
        $nextTopic = $currentIndex === false ? null : $units->get($currentIndex + 1);

        return response()->json([
            'current_topic' => $currentTopic ? [
                'id' => $currentTopic->id,
                'name' => $currentTopic->name,
                'is_subtopic' => !empty($currentTopic->parent_id),
            ] : null,
            'next_topic' => $nextTopic ? [
                'id' => $nextTopic->id,
                'name' => $nextTopic->name,
                'is_subtopic' => !empty($nextTopic->parent_id),
            ] : null,
        ]);
    }

     public function index(Request $request, $subject)
    {
        $subjectId = $request->get('subject_id');
        $levelId = $request->get('level_id');
        $form = $request->get('form');

        $userId = Auth::id();
<<<<<<< HEAD
        
        // ✅ OPTIMIZATION 1: Load user data only if needed
        if (!Auth::user()->relationLoaded('student')) {
            Auth::user()->load('student');
        }

        $locale = Session::get('locale', 'en');
        App::setLocale($locale);
        
        // ✅ OPTIMIZATION 2: Cache translations globally (1 hour)
        $translations = Cache::remember("translations_{$locale}", 3600, function () use ($locale) {
            return $this->loadPhpTranslations($locale);
        });

        // ✅ OPTIMIZATION 3: Cache levels & subjects (30 minutes)
        $availableLevels = Cache::remember('available_levels', 1800, function () {
            return DB::table('level')
                ->where('is_active', 1)
                ->select('id', 'name', 'abbr')
                ->get()
                ->mapWithKeys(fn($level) => [$level->name => $level->id])
                ->toArray();
        });

        $availableSubjects = Cache::remember("available_subjects_{$subject}", 1800, function () use ($subject, $availableLevels) {
            return DB::table('subject')
                ->where('abbr', $subject)
                ->whereIn('level_id', array_values($availableLevels))
                ->where('is_active', 1)
                ->select('id', 'abbr', 'name', 'level_id')
                ->get()
                ->mapWithKeys(function ($subj) use ($availableLevels) {
                    $levelName = array_search($subj->level_id, $availableLevels);
                    return [$levelName => $subj->id];
                })
                ->toArray();
        });

        // Handle form-based level/subject selection
        if ($form && isset($availableLevels[$form])) {
            $newLevelId = $availableLevels[$form];
            if ($newLevelId != $levelId) {
                $levelId = $newLevelId;
                if (isset($availableSubjects[$form])) {
                    $subjectId = $availableSubjects[$form];
=======
        
        // ✅ Get student data
        $student = null;
        $studentLevelId = null;
        if (Auth::check()) {
            if (!Auth::user()->relationLoaded('student')) {
                Auth::user()->load('student');
            }
            $student = Auth::user()->student;
            
            if ($student && $student->level_id) {
                $studentLevelId = $student->level_id;
                
                // ✅ Determine available forms for this student
                $availableForms = LevelHelper::getAvailableForms($studentLevelId);
                
                // ✅ Set default form if not provided or invalid
                if (!$form || !in_array($form, $availableForms)) {
                    $form = $availableForms[0]; // Default to first available form
                }
                
                // ✅ Convert form to level_id
                $formLevelId = LevelHelper::formToLevelId($form);
                if ($formLevelId) {
                    $levelId = $formLevelId;
                    
                    // ✅ Find subject for this form/level
                    $matchingSubject = DB::table('subject')
                        ->where('abbr', $subject)
                        ->where('level_id', $formLevelId)
                        ->where('is_active', 1)
                        ->first(['id', 'name', 'abbr', 'level_id']);
                        
                    if ($matchingSubject) {
                        $subjectId = $matchingSubject->id;
                    }
>>>>>>> 917d4bb (Initial project commit)
                }
            }
        }

<<<<<<< HEAD
        // Validate required parameters
        if (!$subjectId || !$levelId) {
            abort(400, 'Missing required parameters: subject_id and level_id are required');
        }

        // ✅ OPTIMIZATION 4: Get subject with DB query (faster than Eloquent for single record)
        $subjectData = DB::table('subject')
            ->where('id', $subjectId)
            ->where('is_active', 1)
            ->first(['id', 'name', 'abbr', 'level_id']);
=======
        // ✅ If no student or no level_id yet, use defaults
        if (!$levelId) {
            $levelId = 7; // Default to Form 1
            $form = 'Form 1';
        }

        $locale = Session::get('locale', 'en');
        App::setLocale($locale);
        
        // ✅ Cache translations
        $translations = Cache::remember("translations_{$locale}", 3600, function () use ($locale) {
            return $this->loadPhpTranslations($locale);
        });

        // ✅ Cache levels
        $availableLevels = Cache::remember('available_levels', 1800, function () {
            return DB::table('level')
                ->where('is_active', 1)
                ->select('id', 'name', 'abbr')
                ->get()
                ->mapWithKeys(fn($level) => [$level->name => $level->id])
                ->toArray();
        });

        // ✅ Get available forms for the student
        $availableForms = $studentLevelId 
            ? LevelHelper::getAvailableForms($studentLevelId)
            : ['Form 1', 'Form 2', 'Form 3']; // Default for non-logged in users

        // ✅ Get subjects for available forms
        $availableSubjects = [];
        foreach ($availableForms as $availableForm) {
            $formLevelId = LevelHelper::formToLevelId($availableForm);
            if ($formLevelId) {
                $subjectData = DB::table('subject')
                    ->where('abbr', $subject)
                    ->where('level_id', $formLevelId)
                    ->where('is_active', 1)
                    ->first(['id', 'name', 'abbr', 'level_id']);
                    
                if ($subjectData) {
                    $availableSubjects[$availableForm] = $subjectData->id;
                }
            }
        }

        // ✅ Validate parameters
        if (!$subjectId || !$levelId) {
            // Try to get default subject
            $defaultSubject = DB::table('subject')
                ->where('abbr', $subject)
                ->where('level_id', $levelId)
                ->where('is_active', 1)
                ->first(['id', 'name', 'abbr', 'level_id']);
                
            if ($defaultSubject) {
                $subjectId = $defaultSubject->id;
                $subjectData = $defaultSubject;
            } else {
                abort(404, 'Subject not found for this level');
            }
        } else {
            // Get subject data
            $subjectData = DB::table('subject')
                ->where('id', $subjectId)
                ->where('is_active', 1)
                ->first(['id', 'name', 'abbr', 'level_id']);
        }
>>>>>>> 917d4bb (Initial project commit)

        if (!$subjectData) {
            abort(404, 'Subject not found');
        }

        // Verify level match
        if ($subjectData->level_id != $levelId) {
            $correctSubject = DB::table('subject')
                ->where('abbr', $subject)
                ->where('level_id', $levelId)
                ->where('is_active', 1)
                ->first(['id', 'name', 'abbr', 'level_id']);
                
            if ($correctSubject) {
                $subjectId = $correctSubject->id;
                $subjectData = $correctSubject;
            }
        }

<<<<<<< HEAD
        // ✅ OPTIMIZATION 5: Get content data with aggressive optimization
=======
        // ✅ Get content data
>>>>>>> 917d4bb (Initial project commit)
        $contentData = $this->getOptimizedContent($subjectId, $levelId, $userId);

        return Inertia::render('courses/SubjectPage', [
            'subject' => $subjectData->name,
            'subject_abbr' => $subjectData->abbr,
            'subject_id' => $subjectId,
            'level_id' => $levelId,
            'form' => $form,
            'student_level_id' => $studentLevelId,
            'content' => $contentData,
            'selectedStandard' => $form,
            'availableForms' => $availableForms, // Pass available forms to frontend
            'availableLevels' => $availableLevels,
            'availableSubjects' => $availableSubjects,
            'locale' => $locale,
            'translations' => $translations,
            'availableLocales' => ['en', 'ms'],
        ]);
    }

    /**
<<<<<<< HEAD
 * ✅ SUPER OPTIMIZED: Get all content data in minimal queries
 */
private function getOptimizedContent($subjectId, $levelId, $userId = null)
{
    // Cache key for structure (shared across users)
    $structureCacheKey = "content_structure_{$subjectId}_{$levelId}";
    
    // ✅ STEP 1: Get cached structure (topics + subtopics) - 15 min cache
    $structure = Cache::remember($structureCacheKey, 900, function () use ($subjectId, $levelId) {
        // Single query with LEFT JOIN to get ALL topics and subtopics
        return DB::table('topics as parent')
            ->leftJoin('topics as child', function ($join) {
                $join->on('child.parent_id', '=', 'parent.id')
                    ->where('child.is_active', 1)
                    ->where('child.is_published', 1);
            })
            ->where('parent.subject_id', $subjectId)
            ->where('parent.level_id', $levelId)
            ->where(function ($query) {
                $query->whereNull('parent.parent_id')
                    ->orWhere('parent.parent_id', 0);
            })
            ->where('parent.is_active', 1)
            ->where('parent.is_published', 1)
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
    });

    if ($structure->isEmpty()) {
        return ['id' => 1, 'sections' => []];
    }

    // ✅ STEP 2: Group structure by parent
    $groupedTopics = [];
    $allTopicIds = [];
    
    foreach ($structure as $row) {
        $parentId = $row->parent_id;
        
        if (!isset($groupedTopics[$parentId])) {
            $groupedTopics[$parentId] = [
                'id' => $parentId,
                'name' => $row->parent_name,
                'seq' => $row->parent_seq,
                'subtopics' => []
            ];
            $allTopicIds[] = $parentId;
        }
        
        if ($row->child_id) {
            $groupedTopics[$parentId]['subtopics'][] = [
                'id' => $row->child_id,
                'name' => $row->child_name,
                'seq' => $row->child_seq
            ];
            $allTopicIds[] = $row->child_id;
        }
    }

    // ✅ NEW STEP: Batch get videos for all topics (1 query for all videos)
    $videos = DB::table('video_learning')
        ->whereIn('topic_id', $allTopicIds)
        ->select('id', 'topic_id', 'title', 'url', 'created_at')
        ->orderBy('created_at', 'desc')
        ->get()
        ->groupBy('topic_id');

    // ✅ STEP 3: Batch get question counts (1 query for all topics)
    $questionCounts = DB::table('questions')
        ->whereIn('topic_id', $allTopicIds)
        ->where('is_active', 1)
        ->selectRaw('topic_id, question_type_id, COUNT(*) as count')
        ->groupBy('topic_id', 'question_type_id')
        ->get()
        ->groupBy('topic_id');

    // ✅ STEP 4: Batch get practice data (1 query for all topics, only if logged in)
    $practiceData = [];
    if ($userId) {
        $practiceData = DB::table('practice_session')
            ->whereIn(DB::raw('COALESCE(subtopic_id, topic_id)'), $allTopicIds)
            ->where('user_id', $userId)
            ->selectRaw('
                COALESCE(subtopic_id, topic_id) as topic_id,
                question_type_id,
                score,
                total_correct,
                total_skipped,
                total_time_seconds,
                created_at
            ')
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(['topic_id', 'question_type_id']);
    }

    // ✅ STEP 5: Build final structure (all in memory, no more DB queries)
    $sections = [];
    foreach ($groupedTopics as $parent) {
        $section = [
            'id' => count($sections) + 1,
            'title' => $parent['name'],
            'subSections' => []
        ];
        
        // If no subtopics, treat parent as subtopic
        $subtopics = !empty($parent['subtopics']) 
            ? $parent['subtopics'] 
            : [['id' => $parent['id'], 'name' => $parent['name']]];
        
        foreach ($subtopics as $subtopic) {
            $topicId = $subtopic['id'];
            
            // Get videos for this topic
            $topicVideos = $videos[$topicId] ?? collect();
            $formattedVideos = $topicVideos->map(function ($video) {
                return [
                    'id' => $video->id,
                    'title' => $video->title,
                    'url' => $video->url,
                    
                    'created_at' => $video->created_at
                ];
            })->toArray();
            
            // Get counts (from cache)
            $counts = $questionCounts[$topicId] ?? collect();
            $objectiveCount = $counts->where('question_type_id', 1)->sum('count');
            $subjectiveCount = $counts->where('question_type_id', 2)->sum('count');
            
            // Get practice data (from cache)
            $objectivePractice = $practiceData[$topicId][1][0] ?? null;
            $subjectivePractice = $practiceData[$topicId][2][0] ?? null;
            
            $section['subSections'][] = [
                'id' => $topicId,
                'title' => $subtopic['name'],
                'practiceTitle' => $subtopic['name'],
                'videos' => $formattedVideos, // Add videos to the response
                'questionCounts' => [
                    'objective' => (int)$objectiveCount,
                    'subjective' => (int)$subjectiveCount
                ],
                'lastPractice' => [
                    'objective' => $objectivePractice ? $this->formatPracticeData($objectivePractice) : null,
                    'subjective' => $subjectivePractice ? $this->formatPracticeData($subjectivePractice) : null
                ]
            ];
        }
        
        $sections[] = $section;
    }

    return ['id' => 1, 'sections' => $sections];
}
=======
     * ✅ SUPER OPTIMIZED: Get all content data in minimal queries
     */
    private function getOptimizedContent($subjectId, $levelId, $userId = null)
    {
        // Cache key for structure (shared across users)
        // Version the key whenever visibility rules change so stale topic trees are not reused.
        $structureCacheKey = "content_structure_v2_{$subjectId}_{$levelId}";
        
        // ✅ STEP 1: Get cached structure (topics + subtopics) - 15 min cache
        $structure = Cache::remember($structureCacheKey, 900, function () use ($subjectId, $levelId) {
            // Single query with LEFT JOIN to get ALL topics and subtopics
            return DB::table('topics as parent')
                ->leftJoin('topics as child', function ($join) {
                    $join->on('child.parent_id', '=', 'parent.id')
                        ->where('child.is_active', 1)
                        ->where('child.is_published', 1);
                })
                ->where('parent.subject_id', $subjectId)
                ->where('parent.level_id', $levelId)
                ->where(function ($query) {
                    $query->whereNull('parent.parent_id')
                        ->orWhere('parent.parent_id', 0);
                })
                ->where('parent.is_active', 1)
                ->where('parent.is_published', 1)
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
        });

        if ($structure->isEmpty()) {
            return ['id' => 1, 'sections' => []];
        }

        // ✅ STEP 2: Group structure by parent
        $groupedTopics = [];
        $allTopicIds = [];
        
        foreach ($structure as $row) {
            $parentId = $row->parent_id;
            
            if (!isset($groupedTopics[$parentId])) {
                $groupedTopics[$parentId] = [
                    'id' => $parentId,
                    'name' => $row->parent_name,
                    'seq' => $row->parent_seq,
                    'subtopics' => []
                ];
                $allTopicIds[] = $parentId;
            }
            
            if ($row->child_id) {
                $groupedTopics[$parentId]['subtopics'][] = [
                    'id' => $row->child_id,
                    'name' => $row->child_name,
                    'seq' => $row->child_seq
                ];
                $allTopicIds[] = $row->child_id;
            }
        }

        // ✅ STEP 3: Batch get question counts (1 query for all topics)
        $questionCounts = DB::table('questions')
            ->whereIn('topic_id', $allTopicIds)
            ->where('is_active', 1)
            ->where('is_published', 1)
            ->selectRaw('topic_id, question_type_id, COUNT(*) as count')
            ->groupBy('topic_id', 'question_type_id')
            ->get()
            ->groupBy('topic_id');

        // ✅ STEP 4: Batch get practice data (1 query for all topics, only if logged in)
        $practiceData = [];
        if ($userId) {
            $practiceData = DB::table('practice_session')
                ->whereIn(DB::raw('COALESCE(subtopic_id, topic_id)'), $allTopicIds)
                ->where('user_id', $userId)
                ->selectRaw('
                    COALESCE(subtopic_id, topic_id) as topic_id,
                    question_type_id,
                    score,
                    total_correct,
                    total_skipped,
                    total_time_seconds,
                    created_at
                ')
                ->orderBy('created_at', 'desc')
                ->get()
                ->groupBy(['topic_id', 'question_type_id']);
        }

        // ✅ STEP 5: Build final structure (all in memory, no more DB queries)
        $sections = [];
        foreach ($groupedTopics as $parent) {
            $section = [
                'id' => count($sections) + 1,
                'title' => $parent['name'],
                'subSections' => []
            ];
            
            // If no subtopics, treat parent as subtopic
            $subtopics = !empty($parent['subtopics']) 
                ? $parent['subtopics'] 
                : [['id' => $parent['id'], 'name' => $parent['name']]];
            
            foreach ($subtopics as $subtopic) {
                $topicId = $subtopic['id'];
                
                // Get counts (from cache)
                $counts = $questionCounts[$topicId] ?? collect();
                $objectiveCount = $counts->where('question_type_id', 1)->sum('count');
                $subjectiveCount = $counts->where('question_type_id', 2)->sum('count');
                
                // Get practice data (from cache)
                $objectivePractice = $practiceData[$topicId][1][0] ?? null;
                $subjectivePractice = $practiceData[$topicId][2][0] ?? null;
                
                $section['subSections'][] = [
                    'id' => $topicId,
                    'title' => $subtopic['name'],
                    'practiceTitle' => $subtopic['name'],
                    'videos' => [],
                    'questionCounts' => [
                        'objective' => (int)$objectiveCount,
                        'subjective' => (int)$subjectiveCount
                    ],
                    'lastPractice' => [
                        'objective' => $objectivePractice ? $this->formatPracticeData($objectivePractice) : null,
                        'subjective' => $subjectivePractice ? $this->formatPracticeData($subjectivePractice) : null
                    ]
                ];
            }
            
            $sections[] = $section;
        }

        return ['id' => 1, 'sections' => $sections];
    }
>>>>>>> 917d4bb (Initial project commit)

    /**
     * Format practice session data
     */
    private function formatPracticeData($session)
    {
        $totalQuestions = $session->total_correct + $session->total_skipped;
        $averageTime = $totalQuestions > 0 ? $session->total_time_seconds / $totalQuestions : 0;
        
        return [
            'score' => (float)$session->score,
            'total_correct' => (int)$session->total_correct,
            'total_questions' => $totalQuestions,
            'last_practice_at' => date('d/m/Y, g:i A', strtotime($session->created_at)),
            'average_time_per_question' => round($averageTime, 1)
        ];
    }

    /**
     * Load PHP translations with caching
     */
    private function loadPhpTranslations($locale)
    {
        try {
            $translations = trans('common', [], $locale);
            
            if (is_array($translations) && !empty($translations)) {
                return $translations;
            }
            
            return trans('common', [], 'en');
        } catch (\Exception $e) {
            Log::error('Failed to load translations: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get subjects by level (if needed)
     */
    public function getSubjectsByLevel($levelId)
    {
        return Cache::remember("subjects_by_level_{$levelId}", 1800, function () use ($levelId) {
            return DB::table('subject')
                ->where('level_id', $levelId)
                ->where('is_active', 1)
                ->select('id', 'abbr', 'name', 'level_id')
                ->get();
        });
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> 917d4bb (Initial project commit)
