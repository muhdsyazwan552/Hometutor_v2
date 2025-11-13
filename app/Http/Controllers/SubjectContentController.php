<?php
// app/Http/Controllers/SubjectContentController.php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\Topic;
use App\Models\Level;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class SubjectContentController extends Controller
{
    public function index(Request $request, $subject)
    {
        $subjectId = $request->get('subject_id');
        $levelId = $request->get('level_id');
        $form = $request->get('form', 'Form 4');
        
        Log::info('SubjectPage Request:', [
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

        // Get available subjects for the current subject name and all levels
        $availableSubjects = Subject::where('abbr', $subject)
            ->whereIn('level_id', array_values($availableLevels))
            ->where('is_active', true)
            ->get(['id', 'abbr', 'name', 'level_id'])
            ->mapWithKeys(function ($subject) use ($availableLevels) {
                $levelName = array_search($subject->level_id, $availableLevels);
                return [$levelName => $subject->id];
            })
            ->toArray();

        Log::info('Available subjects:', $availableSubjects);

        // If form is provided, prioritize it over existing IDs
        if ($form && isset($availableLevels[$form])) {
            $newLevelId = $availableLevels[$form];
            
            // If level is changing, we should also change the subject
            if ($newLevelId != $levelId) {
                $levelId = $newLevelId;
                
                // Find the subject for this level
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

        // Get subject details by ID only
        $subjectData = Subject::find($subjectId);

        if (!$subjectData) {
            Log::error('Subject not found', ['subject_id' => $subjectId]);
            abort(404, 'Subject not found');
        }

        // Verify the subject matches the level
        if ($subjectData->level_id != $levelId) {
            Log::warning('Subject level mismatch, correcting...', [
                'subject_level_id' => $subjectData->level_id,
                'request_level_id' => $levelId,
                'available_subjects' => $availableSubjects
            ]);
            
            // Find the correct subject for this level
            $correctSubject = Subject::where('abbr', $subject)
                ->where('level_id', $levelId)
                ->where('is_active', true)
                ->first();
                
            if ($correctSubject) {
                $subjectId = $correctSubject->id;
                $subjectData = $correctSubject;
                Log::info('Corrected subject ID:', ['new_subject_id' => $subjectId]);
            }
        }

        Log::info('Subject found:', [
            'subject' => $subjectData->name,
            'level_id' => $subjectData->level_id
        ]);

        // Get topics for this subject and level
        $topics = Topic::with(['children' => function($query) {
                $query->where('is_active', true)
                      ->where('is_published', true)
                      ->orderBy('seq');
            }])
            ->where('subject_id', $subjectId)
            ->where('level_id', $levelId)
            ->where(function($query) {
                $query->whereNull('parent_id')
                      ->orWhere('parent_id', 0);
            })
            ->where('is_active', true)
            ->where('is_published', true)
            ->orderBy('seq')
            ->get();

        Log::info('Topics found:', ['count' => $topics->count()]);

        // Transform the data
        $contentData = $this->transformTopicsToContent($topics, $form);

        Log::info('Transformed content:', ['sections_count' => count($contentData['sections'])]);

        // RETURN THE RESPONSE (This was missing)
        return Inertia::render('courses/SubjectPage', [
            'subject' => $subjectData->name,
            'subject_abbr' => $subjectData->abbr,
            'subject_id' => $subjectId,
            'level_id' => $levelId,
            'form' => $form,
            'content' => $contentData,
            'selectedStandard' => $form,
            'availableLevels' => $availableLevels,
            'availableSubjects' => $availableSubjects,
            'debug_info' => [
                'topics_count' => $topics->count(),
                'sections_count' => count($contentData['sections']),
                'subject_name' => $subjectData->name,
                'subject_abbr' => $subjectData->abbr,
                'subject_id' => $subjectId,
                'level_id' => $levelId,
                'available_levels' => $availableLevels,
                'available_subjects' => $availableSubjects
            ]
        ]);
    }

    // Add this method to get subjects by level
    public function getSubjectsByLevel($levelId)
    {
        return Subject::where('level_id', $levelId)
            ->where('is_active', true)
            ->get(['id', 'abbr', 'name', 'level_id']);
    }

    // Rest of your existing methods...
// In your SubjectContentController.php

private function transformTopicsToContent($topics, $standard)
{
    $sections = [];
    
    foreach ($topics as $index => $topic) {
        $section = [
            'id' => $index + 1,
            'title' => $topic->name,
            'subSections' => []
        ];

        foreach ($topic->children as $subTopic) {
            // Get question counts for this subtopic
            $objectiveCount = \App\Models\Question::where('topic_id', $subTopic->id)
                ->where('question_type_id', 1)
                ->where('is_active', true)
                ->count();
                
            $subjectiveCount = \App\Models\Question::where('topic_id', $subTopic->id)
                ->where('question_type_id', 2)
                ->where('is_active', true)
                ->count();

            $subSection = [
                'id' => $subTopic->id,
                'title' => $subTopic->name,
                'practiceTitle' => $subTopic->name,
                'videos' => $this->getVideosForTopic($subTopic->id),
                'questionCounts' => [
                    'objective' => $objectiveCount,
                    'subjective' => $subjectiveCount
                ]
            ];

            $section['subSections'][] = $subSection;
        }

        if (empty($section['subSections'])) {
            // Get question counts for the main topic
            $objectiveCount = \App\Models\Question::where('topic_id', $topic->id)
                ->where('question_type_id', 1)
                ->where('is_active', true)
                ->count();
                
            $subjectiveCount = \App\Models\Question::where('topic_id', $topic->id)
                ->where('question_type_id', 2)
                ->where('is_active', true)
                ->count();

            $section['subSections'][] = [
                'id' => $topic->id,
                'title' => $topic->name,
                'practiceTitle' => $topic->name,
                'videos' => $this->getVideosForTopic($topic->id),
                'questionCounts' => [
                    'objective' => $objectiveCount,
                    'subjective' => $subjectiveCount
                ]
            ];
        }

        $sections[] = $section;
    }

    return [
        'id' => 1,
        'sections' => $sections
    ];
}

    private function getVideosForTopic($topicId)
    {
        return [
            [
                'title' => 'Introduction Video',
                'duration' => '10:30',
                'url' => '#'
            ],
            [
                'title' => 'Advanced Concepts',
                'duration' => '15:45',
                'url' => '#'
            ]
        ];
    }
}