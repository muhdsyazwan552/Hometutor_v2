<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
<<<<<<< HEAD
=======
use Illuminate\Support\Facades\Schema;
>>>>>>> 917d4bb (Initial project commit)

class MasteryService
{
    /**
     * Calculate mastery level based on performance
     */
    public function calculateMasteryLevel($correctAttempts, $totalAttempts)
    {
        if ($totalAttempts == 0) {
<<<<<<< HEAD
            return 6; // not_started
=======
            return $this->getLevelId('not_started', 6);
>>>>>>> 917d4bb (Initial project commit)
        }

        $scorePercentage = ($correctAttempts / $totalAttempts) * 100;

<<<<<<< HEAD
        // Get mastery level based on score
=======
        if (Schema::hasTable('mastery_rank_settings')) {
            $rank = DB::table('mastery_rank_settings')
                ->where('is_active', true)
                ->where('min_questions', '<=', $totalAttempts)
                ->where('min_accuracy', '<=', $scorePercentage)
                ->orderByDesc('rank')
                ->first();

            if ($rank) {
                return $rank->mastery_level_id;
            }

            return DB::table('mastery_rank_settings')->where('rank', 1)->value('mastery_level_id')
                ?? $this->getLevelId('need_practice', 5);
        }

>>>>>>> 917d4bb (Initial project commit)
        $masteryLevel = DB::table('mastery_levels')
            ->where('min_score', '<=', $scorePercentage)
            ->orderBy('min_score', 'desc')
            ->first();

        return $masteryLevel ? $masteryLevel->id : 6;
    }

<<<<<<< HEAD
=======
    public function getQuestionsPerSession(): int
    {
        if (!Schema::hasTable('mastery_configurations')) {
            return 10;
        }

        return (int) (DB::table('mastery_configurations')->value('questions_per_session') ?? 10);
    }

    public function resolveTopicScope(int $topicId): array
    {
        $topic = DB::table('topics')->select('id', 'parent_id')->find($topicId);
        $isSubtopic = $topic && (int) $topic->parent_id > 0;

        return [
            'topic_id' => $isSubtopic ? (int) $topic->parent_id : $topicId,
            'subtopic_id' => $isSubtopic ? $topicId : null,
        ];
    }

    private function getLevelId(string $name, int $fallback): int
    {
        return (int) (DB::table('mastery_levels')->where('name', $name)->value('id') ?? $fallback);
    }

    private function getMasteredLevelId(): int
    {
        if (Schema::hasTable('mastery_rank_settings')) {
            return (int) (DB::table('mastery_rank_settings')->where('rank', 5)->value('mastery_level_id') ?? 1);
        }

        return $this->getLevelId('mastered', 1);
    }

>>>>>>> 917d4bb (Initial project commit)
    /**
     * Update user's topic mastery
     */
    public function updateTopicMastery($userId, $topicId, $subjectId, $levelId, $isCorrect, $timeTaken)
    {
<<<<<<< HEAD
=======
        $masteredLevelId = $this->getMasteredLevelId();
>>>>>>> 917d4bb (Initial project commit)
        $mastery = DB::table('user_topic_mastery')
            ->where('user_id', $userId)
            ->where('topic_id', $topicId)
            ->where('level_id', $levelId)
            ->first();

        if ($mastery) {
            // Update existing mastery
            $totalAttempts = $mastery->total_attempts + 1;
            $correctAttempts = $mastery->correct_attempts + ($isCorrect ? 1 : 0);
            $totalTime = $mastery->total_time_seconds + $timeTaken;
            $currentScore = ($correctAttempts / $totalAttempts) * 100;
            $newMasteryLevel = $this->calculateMasteryLevel($correctAttempts, $totalAttempts);

            DB::table('user_topic_mastery')
                ->where('id', $mastery->id)
                ->update([
                    'total_attempts' => $totalAttempts,
                    'correct_attempts' => $correctAttempts,
                    'total_time_seconds' => $totalTime,
                    'current_score' => $currentScore,
                    'mastery_level_id' => $newMasteryLevel,
                    'last_practiced_at' => now(),
<<<<<<< HEAD
                    'mastered_at' => $newMasteryLevel == 1 ? now() : $mastery->mastered_at,
=======
                    'mastered_at' => $newMasteryLevel == $masteredLevelId ? ($mastery->mastered_at ?? now()) : null,
>>>>>>> 917d4bb (Initial project commit)
                    'updated_at' => now()
                ]);

            return [
                'previous_level' => $mastery->mastery_level_id,
                'new_level' => $newMasteryLevel
            ];
        } else {
            // Create new mastery record
            $currentScore = $isCorrect ? 100 : 0;
            $newMasteryLevel = $this->calculateMasteryLevel($isCorrect ? 1 : 0, 1);

            DB::table('user_topic_mastery')->insert([
                'user_id' => $userId,
                'topic_id' => $topicId,
                'subject_id' => $subjectId,
                'level_id' => $levelId,
                'mastery_level_id' => $newMasteryLevel,
                'total_attempts' => 1,
                'correct_attempts' => $isCorrect ? 1 : 0,
                'total_time_seconds' => $timeTaken,
                'current_score' => $currentScore,
                'last_practiced_at' => now(),
<<<<<<< HEAD
                'mastered_at' => $newMasteryLevel == 1 ? now() : null,
=======
                'mastered_at' => $newMasteryLevel == $masteredLevelId ? now() : null,
>>>>>>> 917d4bb (Initial project commit)
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return [
                'previous_level' => 6, // not_started
                'new_level' => $newMasteryLevel
            ];
        }
    }

    /**
     * Calculate and cache overall progress
     */
    public function updateProgressCache($userId, $subjectId, $levelId)
    {
<<<<<<< HEAD
        // Get all topics for this subject and level
        $allTopics = DB::table('topics')
            ->where('subject_id', $subjectId)
            ->where('level_id', $levelId)
            ->where('is_active', 1)
            ->pluck('id');

        $totalTopics = $allTopics->count();

        // Get mastery distribution
        $masteryStats = DB::table('user_topic_mastery as utm')
            ->join('mastery_levels as ml', 'utm.mastery_level_id', '=', 'ml.id')
            ->where('utm.user_id', $userId)
            ->where('utm.subject_id', $subjectId)
            ->where('utm.level_id', $levelId)
            ->select('ml.name', DB::raw('count(*) as count'))
            ->groupBy('ml.name')
            ->pluck('count', 'name')
            ->toArray();

        $mastered = $masteryStats['mastered'] ?? 0;
        $proficient = $masteryStats['proficient'] ?? 0;
        $familiar = $masteryStats['familiar'] ?? 0;
        $practiced = $masteryStats['practiced'] ?? 0;
        $needPractice = $masteryStats['need_practice'] ?? 0;
        $practiced_total = $mastered + $proficient + $familiar + $practiced + $needPractice;
        $notStarted = $totalTopics - $practiced_total;

        // Calculate overall percentage (weighted)
        $overallPercentage = 0;
        if ($totalTopics > 0) {
            $overallPercentage = (
                ($mastered * 100) + 
                ($proficient * 80) + 
                ($familiar * 60) + 
                ($practiced * 40) + 
                ($needPractice * 20)
            ) / $totalTopics;
        }
=======
        $topics = $this->getTopicsWithMastery($userId, $subjectId, $levelId);
        $totalTopics = $topics->count();
        $rankCounts = $topics->countBy('rank');

        $mastered = $rankCounts->get(5, 0);
        $proficient = $rankCounts->get(4, 0);
        $familiar = $rankCounts->get(3, 0);
        $practiced = $rankCounts->get(2, 0);
        $needPractice = $rankCounts->get(1, 0);
        $notStarted = $topics->where('total_attempts', 0)->count();
        $overallPercentage = $totalTopics > 0
            ? $topics->avg(fn ($topic) => ($topic['rank'] - 1) * 25)
            : 0;
>>>>>>> 917d4bb (Initial project commit)

        // Upsert progress cache
        DB::table('user_mastery_progress')->updateOrInsert(
            [
                'user_id' => $userId,
                'subject_id' => $subjectId,
                'level_id' => $levelId
            ],
            [
                'total_topics' => $totalTopics,
                'mastered_count' => $mastered,
                'proficient_count' => $proficient,
                'familiar_count' => $familiar,
                'practiced_count' => $practiced,
                'need_practice_count' => $needPractice,
                'not_started_count' => $notStarted,
                'overall_percentage' => round($overallPercentage, 2),
                'last_calculated_at' => now(),
                'updated_at' => now()
            ]
        );
    }

    /**
     * Get topics that need practice (for Mission page display)
     */
<<<<<<< HEAD
    public function getTopicsNeedingPractice($userId, $subjectId, $levelId, $limit = 8)
    {
        // Get topics that are not mastered or proficient
        return DB::table('topics as t')
            ->leftJoin('user_topic_mastery as utm', function($join) use ($userId, $levelId) {
                $join->on('t.id', '=', 'utm.topic_id')
                     ->where('utm.user_id', '=', $userId)
                     ->where('utm.level_id', '=', $levelId);
            })
            ->leftJoin('mastery_levels as ml', 'utm.mastery_level_id', '=', 'ml.id')
            ->where('t.subject_id', $subjectId)
            ->where('t.level_id', $levelId)
            ->where('t.is_active', 1)
            ->where(function($query) {
                $query->whereNull('utm.mastery_level_id')
                      ->orWhereIn('ml.name', ['need_practice', 'practiced', 'familiar']);
            })
            ->select(
                't.id',
                't.name',
                't.seq',
                'ml.name as mastery_level',
                'ml.color as mastery_color'
            )
            ->orderByRaw('CASE 
                WHEN ml.name IS NULL THEN 0
                WHEN ml.name = "need_practice" THEN 1
                WHEN ml.name = "practiced" THEN 2
                WHEN ml.name = "familiar" THEN 3
                ELSE 4
            END')
            ->orderBy('t.seq')
            ->limit($limit)
            ->get();
=======
    public function getMissionSubtopics($userId, $subjectId, $levelId)
    {
        return $this->getTopicsWithMastery($userId, $subjectId, $levelId)
            ->flatMap(function ($topic) {
                if (!empty($topic['subtopics'])) {
                    return collect($topic['subtopics'])->map(function ($subtopic) use ($topic) {
                        return array_merge($subtopic, [
                            'parent_name' => $topic['name'],
                            'parent_seq' => $topic['seq'],
                            'is_subtopic' => true,
                        ]);
                    });
                }

                // Keep subjects without a hierarchy usable as a single learning scope.
                return [[
                    ...$topic,
                    'parent_name' => null,
                    'parent_seq' => $topic['seq'],
                    'is_subtopic' => false,
                ]];
            })
            ->sortBy(fn ($scope) => [$scope['parent_seq'], $scope['seq']])
            ->values();
>>>>>>> 917d4bb (Initial project commit)
    }

    /**
     * Generate mastery challenge questions
     * Prioritize topics that need practice, ensure variety
     */
/**
 * Generate mastery challenge questions
 * Excludes mastered topics, prioritizes topics that need practice
 */
/**
 * Generate mastery challenge questions
 * Excludes mastered topics, prioritizes topics that need practice
 */
    /**
 * Generate questions with WEIGHTED distribution (harder topics get more questions)
 */
public function generateChallengeQuestions($userId, $subjectId, $levelId, $questionCount = 10)
{
    // Get topics with mastery levels
    $topicMastery = DB::table('topics as t')
        ->leftJoin('user_topic_mastery as utm', function($join) use ($userId, $levelId) {
            $join->on('t.id', '=', 'utm.topic_id')
                 ->where('utm.user_id', '=', $userId)
                 ->where('utm.level_id', '=', $levelId);
        })
        ->leftJoin('mastery_levels as ml', 'utm.mastery_level_id', '=', 'ml.id')
        ->where('t.subject_id', $subjectId)
        ->where('t.level_id', $levelId)
        ->where('t.is_active', 1)
        ->where(function($query) {
            $query->whereNull('ml.name')
                  ->orWhere('ml.name', '!=', 'mastered');
        })
        ->select('t.id', 't.name', 'ml.name as mastery_level', 'ml.display_order')
        ->get();

    if ($topicMastery->isEmpty()) {
        return [];
    }

    // Assign weights: need_practice=5, practiced=4, familiar=3, proficient=2, not_started=1
    $weights = [
        'need_practice' => 5,
        'practiced' => 4,
        'familiar' => 3,
        'proficient' => 2,
        null => 1 // not started
    ];

    $topicData = [];
    $totalWeight = 0;

    foreach ($topicMastery as $topic) {
        $weight = $weights[$topic->mastery_level] ?? 1;
        $availableQuestions = DB::table('questions')
            ->where('topic_id', $topic->id)
<<<<<<< HEAD
=======
            ->where('question_type_id', 1)
>>>>>>> 917d4bb (Initial project commit)
            ->where('is_active', 1)
            ->where('is_published', 1)
            ->count();

        if ($availableQuestions > 0) {
            $topicData[$topic->id] = [
                'topic' => $topic,
                'weight' => $weight,
                'available' => $availableQuestions,
                'selected' => 0
            ];
            $totalWeight += $weight;
        }
    }

    // Calculate target questions per topic based on weight
    foreach ($topicData as $topicId => $data) {
        $targetCount = round(($data['weight'] / $totalWeight) * $questionCount);
        $topicData[$topicId]['target'] = min($targetCount, $data['available']);
    }

    Log::info('Weighted distribution plan', [
        'topics' => collect($topicData)->map(function($item) {
            return [
                'name' => $item['topic']->name,
                'mastery' => $item['topic']->mastery_level,
                'weight' => $item['weight'],
                'target' => $item['target'],
                'available' => $item['available']
            ];
        })->toArray()
    ]);

    $selectedQuestions = [];

    // Phase 1: Get target questions from each topic
    foreach ($topicData as $topicId => $data) {
<<<<<<< HEAD
        $needed = min($data['target'], $data['available']);
        
        $questions = DB::table('questions')
            ->where('topic_id', $topicId)
=======
        $remainingSlots = $questionCount - count($selectedQuestions);
        if ($remainingSlots <= 0) {
            break;
        }

        $needed = min($data['target'], $data['available'], $remainingSlots);
        
        $questions = DB::table('questions')
            ->where('topic_id', $topicId)
            ->where('question_type_id', 1)
>>>>>>> 917d4bb (Initial project commit)
            ->where('is_active', 1)
            ->where('is_published', 1)
            ->inRandomOrder()
            ->limit($needed)
            ->pluck('id')
            ->toArray();

        $selectedQuestions = array_merge($selectedQuestions, $questions);
        $topicData[$topicId]['selected'] = count($questions);
    }

    // Phase 2: Fill remaining with round-robin if we don't have enough
    while (count($selectedQuestions) < $questionCount) {
        $added = false;
        
        foreach ($topicData as $topicId => $data) {
            if (count($selectedQuestions) >= $questionCount) break;
            if ($data['selected'] >= $data['available']) continue;

            $question = DB::table('questions')
                ->where('topic_id', $topicId)
<<<<<<< HEAD
=======
                ->where('question_type_id', 1)
>>>>>>> 917d4bb (Initial project commit)
                ->where('is_active', 1)
                ->where('is_published', 1)
                ->whereNotIn('id', $selectedQuestions)
                ->inRandomOrder()
                ->first();

            if ($question) {
                $selectedQuestions[] = $question->id;
                $topicData[$topicId]['selected']++;
                $added = true;
            }
        }

        if (!$added) break; // No more questions available
    }

    Log::info('Final weighted distribution', [
        'total' => count($selectedQuestions),
        'by_topic' => collect($topicData)->map(fn($d) => [
            'topic' => $d['topic']->name,
            'selected' => $d['selected']
        ])->toArray()
    ]);

    return $selectedQuestions;
}
// public function generateChallengeQuestions($userId, $subjectId, $levelId, $questionCount = 10)
// {
//     Log::info('=== Starting generateChallengeQuestions ===', [
//         'user_id' => $userId,
//         'subject_id' => $subjectId,
//         'level_id' => $levelId,
//         'question_count' => $questionCount
//     ]);

//     // First, let's check if topics exist
//     $allTopics = DB::table('topics')
//         ->where('subject_id', $subjectId)
//         ->where('level_id', $levelId)
//         ->where('is_active', 1)
//         ->get();

//     Log::info('Total topics found', [
//         'count' => $allTopics->count(),
//         'topics' => $allTopics->pluck('name', 'id')->toArray()
//     ]);

//     // Check total available questions
//     $totalQuestions = DB::table('questions as q')
//         ->join('topics as t', 'q.topic_id', '=', 't.id')
//         ->where('t.subject_id', $subjectId)
//         ->where('t.level_id', $levelId)
//         ->where('t.is_active', 1)
//         ->where('q.is_active', 1)
//         ->where('q.is_published', 1)
//         ->count();

//     Log::info('Total questions available', ['count' => $totalQuestions]);

//     // Get user's mastery status for all topics, EXCLUDING mastered topics
//     $topicMastery = DB::table('topics as t')
//         ->leftJoin('user_topic_mastery as utm', function($join) use ($userId, $levelId) {
//             $join->on('t.id', '=', 'utm.topic_id')
//                  ->where('utm.user_id', '=', $userId)
//                  ->where('utm.level_id', '=', $levelId);
//         })
//         ->leftJoin('mastery_levels as ml', 'utm.mastery_level_id', '=', 'ml.id')
//         ->where('t.subject_id', $subjectId)
//         ->where('t.level_id', $levelId)
//         ->where('t.is_active', 1)
//         // CRITICAL: Exclude mastered topics OR only include topics that are not mastered
//         ->where(function($query) {
//             $query->whereNull('ml.name')  // Include topics not started
//                   ->orWhere('ml.name', '!=', 'mastered');  // Exclude mastered topics
//         })
//         ->select('t.id', 't.name', 'ml.name as mastery_level', 'ml.display_order')
//         ->orderByRaw('COALESCE(ml.display_order, 999) DESC')
//         ->get();

//     Log::info('Non-mastered topics', [
//         'count' => $topicMastery->count(),
//         'topics' => $topicMastery->map(function($t) {
//             return [
//                 'id' => $t->id,
//                 'name' => $t->name,
//                 'mastery_level' => $t->mastery_level ?? 'not_started'
//             ];
//         })->toArray()
//     ]);

//     // If ALL topics are mastered, return empty array (no challenge available)
//     if ($topicMastery->isEmpty()) {
//         Log::warning('No topics available for challenge - all topics mastered or no topics found');
//         return [];
//     }

//     $selectedQuestions = [];
//     $topicQuestionCount = [];

//     // Distribute questions across non-mastered topics
//     foreach ($topicMastery as $topic) {
//         if (count($selectedQuestions) >= $questionCount) break;

//         // Get 1-2 questions per topic (more balanced distribution)
//         $questionsNeeded = min(2, $questionCount - count($selectedQuestions));
        
//         $questions = DB::table('questions')
//             ->where('topic_id', $topic->id)
//             ->where('is_active', 1)
//             ->where('is_published', 1)
//             ->whereNotIn('id', $selectedQuestions)
//             ->inRandomOrder()
//             ->limit($questionsNeeded)
//             ->pluck('id')
//             ->toArray();

//         Log::info('Questions for topic', [
//             'topic_id' => $topic->id,
//             'topic_name' => $topic->name,
//             'questions_found' => count($questions),
//             'questions_needed' => $questionsNeeded
//         ]);

//         $selectedQuestions = array_merge($selectedQuestions, $questions);
//         $topicQuestionCount[$topic->id] = count($questions);
//     }

//     Log::info('After topic distribution', [
//         'selected_count' => count($selectedQuestions),
//         'question_ids' => $selectedQuestions
//     ]);

//     // If we don't have enough questions, fill from any available non-mastered topics
//     if (count($selectedQuestions) < $questionCount) {
//         $remaining = $questionCount - count($selectedQuestions);
        
//         Log::info('Need more questions', ['remaining' => $remaining]);
        
//         // Get list of non-mastered topic IDs
//         $nonMasteredTopicIds = DB::table('topics as t')
//             ->leftJoin('user_topic_mastery as utm', function($join) use ($userId, $levelId) {
//                 $join->on('t.id', '=', 'utm.topic_id')
//                      ->where('utm.user_id', '=', $userId)
//                      ->where('utm.level_id', '=', $levelId);
//             })
//             ->leftJoin('mastery_levels as ml', 'utm.mastery_level_id', '=', 'ml.id')
//             ->where('t.subject_id', $subjectId)
//             ->where('t.level_id', $levelId)
//             ->where('t.is_active', 1)
//             ->where(function($query) {
//                 $query->whereNull('ml.name')
//                       ->orWhere('ml.name', '!=', 'mastered');
//             })
//             ->pluck('t.id')
//             ->toArray();

//         Log::info('Non-mastered topic IDs for fill', [
//             'topic_ids' => $nonMasteredTopicIds
//         ]);

//         if (!empty($nonMasteredTopicIds)) {
//             $fillQuestions = DB::table('questions')
//                 ->whereIn('topic_id', $nonMasteredTopicIds)
//                 ->where('is_active', 1)
//                 ->where('is_published', 1)
//                 ->whereNotIn('id', $selectedQuestions)
//                 ->inRandomOrder()
//                 ->limit($remaining)
//                 ->pluck('id')
//                 ->toArray();

//             Log::info('Fill questions found', [
//                 'count' => count($fillQuestions),
//                 'question_ids' => $fillQuestions
//             ]);

//             $selectedQuestions = array_merge($selectedQuestions, $fillQuestions);
//         }
//     }

//     Log::info('=== Final result ===', [
//         'total_questions_selected' => count($selectedQuestions),
//         'question_ids' => $selectedQuestions,
//         'topics_used' => count($topicQuestionCount)
//     ]);

//     return $selectedQuestions;
// }

    /**
     * Get user's overall mastery progress
     */
    public function getUserProgress($userId, $subjectId, $levelId)
    {
        $progress = DB::table('user_mastery_progress')
            ->where('user_id', $userId)
            ->where('subject_id', $subjectId)
            ->where('level_id', $levelId)
            ->first();

        if (!$progress) {
            // Calculate if not cached
            $this->updateProgressCache($userId, $subjectId, $levelId);
            $progress = DB::table('user_mastery_progress')
                ->where('user_id', $userId)
                ->where('subject_id', $subjectId)
                ->where('level_id', $levelId)
                ->first();
        }

        return $progress;
    }

    /**
     * Get topic list with mastery status
     */
    public function getTopicsWithMastery($userId, $subjectId, $levelId)
    {
<<<<<<< HEAD
        return DB::table('topics as t')
            ->leftJoin('user_topic_mastery as utm', function($join) use ($userId, $levelId) {
                $join->on('t.id', '=', 'utm.topic_id')
                     ->where('utm.user_id', '=', $userId)
                     ->where('utm.level_id', '=', $levelId);
            })
            ->leftJoin('mastery_levels as ml', 'utm.mastery_level_id', '=', 'ml.id')
            ->where('t.subject_id', $subjectId)
            ->where('t.level_id', $levelId)
            ->where('t.is_active', 1)
            ->select(
                't.id',
                't.name',
                't.seq',
                'ml.name as mastery_level',
                'ml.color as mastery_color',
                'utm.current_score',
                'utm.total_attempts',
                'utm.last_practiced_at'
            )
            ->orderBy('t.seq')
            ->get();
    }
}
=======
        $topics = DB::table('topics')
            ->where('subject_id', $subjectId)
            ->where('level_id', $levelId)
            ->where('is_active', 1)
            ->orderBy('seq')
            ->get();

        if ($topics->isEmpty()) {
            return collect();
        }

        $topicIds = $topics->pluck('id');
        $mastery = DB::table('user_topic_mastery as utm')
            ->leftJoin('mastery_levels as ml', 'utm.mastery_level_id', '=', 'ml.id')
            ->where('utm.user_id', $userId)
            ->where('utm.level_id', $levelId)
            ->whereIn('utm.topic_id', $topicIds)
            ->select('utm.*', 'ml.name as mastery_level', 'ml.color as mastery_color')
            ->get()
            ->keyBy('topic_id');

        $questionCounts = DB::table('questions')
            ->whereIn('topic_id', $topicIds)
            ->where('question_type_id', 1)
            ->where('is_active', 1)
            ->where('is_published', 1)
            ->select('topic_id', DB::raw('COUNT(*) as question_count'))
            ->groupBy('topic_id')
            ->pluck('question_count', 'topic_id');

        $rankLevels = DB::table('mastery_rank_settings as mrs')
            ->join('mastery_levels as ml', 'mrs.mastery_level_id', '=', 'ml.id')
            ->where('mrs.is_active', true)
            ->select('mrs.rank', 'ml.name', 'ml.color')
            ->get()
            ->keyBy('rank');
        $rankByLevel = $rankLevels->pluck('rank', 'name');
        $topicIndex = $topics->keyBy('id');
        $childrenByParent = $topics->where('parent_id', '>', 0)->groupBy('parent_id');

        $formatScope = function ($topic) use ($mastery, $questionCounts, $rankByLevel) {
            $record = $mastery->get($topic->id);
            $level = $record->mastery_level ?? 'not_started';

            return [
                'id' => $topic->id,
                'name' => $topic->name,
                'parent_id' => (int) $topic->parent_id,
                'seq' => $topic->seq,
                'mastery_level' => $level,
                'mastery_color' => $record->mastery_color ?? '#fb7185',
                'rank' => (int) ($rankByLevel->get($level, 1)),
                'current_score' => round((float) ($record->current_score ?? 0), 2),
                'total_attempts' => (int) ($record->total_attempts ?? 0),
                'correct_attempts' => (int) ($record->correct_attempts ?? 0),
                'question_count' => (int) $questionCounts->get($topic->id, 0),
            ];
        };

        $collectDescendants = function ($parentId, $depth = 1) use (&$collectDescendants, $childrenByParent, $formatScope) {
            $descendants = collect();

            foreach ($childrenByParent->get($parentId, collect()) as $child) {
                $scope = $formatScope($child);
                $scope['depth'] = $depth;

                if ($scope['question_count'] > 0) {
                    $descendants->push($scope);
                }

                $descendants = $descendants->concat($collectDescendants($child->id, $depth + 1));
            }

            return $descendants;
        };

        return $topics
            ->filter(fn ($topic) => (int) $topic->parent_id === 0 || !$topicIndex->has($topic->parent_id))
            ->map(function ($topic) use ($collectDescendants, $formatScope, $rankLevels) {
                $ownScope = $formatScope($topic);
                $subtopics = $collectDescendants($topic->id)->values();

                $learningScopes = collect();
                if ($ownScope['question_count'] > 0) {
                    $learningScopes->push($ownScope);
                }
                $learningScopes = $learningScopes->concat($subtopics);

                if ($learningScopes->isEmpty()) {
                    return null;
                }

                $rank = (int) $learningScopes->min('rank');
                $rankLevel = $rankLevels->get($rank);
                $attempts = (int) $learningScopes->sum('total_attempts');
                $correct = (int) $learningScopes->sum('correct_attempts');

                return [
                    'id' => $topic->id,
                    'name' => $topic->name,
                    'seq' => $topic->seq,
                    'mastery_level' => $rankLevel->name ?? 'not_started',
                    'mastery_color' => $rankLevel->color ?? '#fb7185',
                    'rank' => $rank,
                    'current_score' => $attempts > 0 ? round(($correct / $attempts) * 100, 2) : 0,
                    'total_attempts' => $attempts,
                    'question_count' => (int) $learningScopes->sum('question_count'),
                    'direct_question_count' => $ownScope['question_count'],
                    'subtopics' => $subtopics->all(),
                ];
            })
            ->filter()
            ->values();
    }
}
>>>>>>> 917d4bb (Initial project commit)
