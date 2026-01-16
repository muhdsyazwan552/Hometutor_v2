<?php
// app/Http/Controllers/MenuController.php

namespace App\Http\Controllers\Web;
use App\Http\Controllers\Controller;

use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function getSchoolSubjects()
    {
        // Make sure to select level_id
        $schoolSubjects = Subject::where('is_active', true)
            ->where('level_id', 10)
            ->where('is_active', 1)
            ->select('id', 'name', 'level_id', 'abbr', 'seq')
            ->orderBy('seq')
            ->get()
            ->toArray();

        return $schoolSubjects;
    }

    // public function showSubject($subject, Request $request)
    // {
    //     $selectedForm = $request->query('form', 'Form 4');
    //     $formLevels = ['Form 4' => 10, 'Form 5' => 11];
    //     $levelId = $formLevels[$selectedForm] ?? 10;

    //     // Get subject record
    //     $subjectRecord = Subject::where('name', 'like', '%' . str_replace('-', ' ', $subject) . '%')
    //         ->orWhere('abbr', 'like', '%' . $subject . '%')
    //         ->where('level_id', $levelId)
    //         ->where('is_active', 1)
    //         ->first();

    //     // If not found, check both levels
    //     if (!$subjectRecord) {
    //         $subjectRecord = Subject::where('name', 'like', '%' . str_replace('-', ' ', $subject) . '%')
    //             ->orWhere('abbr', 'like', '%' . $subject . '%')
    //             ->whereIn('level_id', [10, 11])
    //             ->where('is_active', 1)
    //             ->first();
    //     }

    //     // Get topics for this subject and level
    //     $topics = Topic::where('subject_id', $subjectRecord->id)
    //         ->where('level_id', $levelId)
    //         ->where('is_active', 1)
    //         ->where('parent_id', null) // Main topics only
    //         ->with(['children' => function($query) use ($levelId) {
    //             $query->where('is_active', 1)
    //                   ->where('level_id', $levelId)
    //                   ->orderBy('seq');
    //         }])
    //         ->orderBy('seq')
    //         ->get();

    //     // Transform data for frontend
    //     $sections = $topics->map(function($topic, $index) {
    //         return [
    //             'id' => (string)($index + 1),
    //             'title' => $topic->name,
    //             'practiceType' => 'Objective',
    //             'topic_id' => $topic->id, // Include topic ID
    //             'videos' => [
    //                 ['title' => "Pengenalan " . $topic->name, 'duration' => "18:30"],
    //                 ['title' => "Teknik " . $topic->name, 'duration' => "22:15"]
    //             ],
    //             'subSections' => $topic->children->map(function($child, $childIndex) {
    //                 return [
    //                     'id' => (string)($childIndex + 1) . '.' . ($childIndex + 1),
    //                     'title' => $child->name,
    //                     'practiceType' => $childIndex % 2 === 0 ? 'Objective' : 'Subjective',
    //                     'topic_id' => $child->id, // Include subtopic ID
    //                     'videos' => [
    //                         ['title' => "Definisi dan Ciri-ciri " . $child->name, 'duration' => "15:20"],
    //                         ['title' => "Jenis-jenis " . $child->name, 'duration' => "19:45"]
    //                     ]
    //                 ];
    //             })->toArray()
    //         ];
    //     });

    //     $availableForms = $this->getAvailableFormsForSubject($subject);

    //     return Inertia::render('courses/SubjectPage', [
    //         'subject' => $subject,
    //         'subjectTitle' => $subjectRecord->name ?? str_replace('-', ' ', $subject),
    //         'subjectId' => $subjectRecord->id ?? null,
    //         'subjectData' => $subjectRecord,
    //         'selectedStandard' => $selectedForm,
    //         'availableForms' => $availableForms,
    //         'subjectLevel' => $subjectRecord->level_id ?? $levelId,
    //         'content' => [
    //             'id' => $subjectRecord->id,
    //             'level_id' => $levelId,
    //             'subject_id' => $subjectRecord->id,
    //             'sections' => $sections
    //         ],
    //         'debug_info' => [ // For debugging
    //             'subject_id' => $subjectRecord->id,
    //             'level_id' => $levelId,
    //             'subject_name' => $subjectRecord->name,
    //             'form' => $selectedForm
    //         ]
    //     ]);
    // }

    // /**
    //  * Get available forms for a subject based on database records
    //  */
    // private function getAvailableFormsForSubject($subjectSlug)
    // {
    //     $subjectName = str_replace('-', ' ', $subjectSlug);
        
    //     // Check which forms actually exist in database for this subject
    //     $forms = [];
        
    //     // Check Form 4
    //     $form4Subject = Subject::where('name', 'like', '%' . $subjectName . '%')
    //         ->orWhere('abbr', 'like', '%' . $subjectSlug . '%')
    //         ->where('level_id', 10)
    //         ->where('is_active', 1)
    //         ->first();
            
    //     if ($form4Subject) {
    //         $forms[] = 'Form 4';
    //     }
        
    //     // Check Form 5
    //     $form5Subject = Subject::where('name', 'like', '%' . $subjectName . '%')
    //         ->orWhere('abbr', 'like', '%' . $subjectSlug . '%')
    //         ->where('level_id', 11)
    //         ->where('is_active', 1)
    //         ->first();
            
    //     if ($form5Subject) {
    //         $forms[] = 'Form 5';
    //     }
        
    //     return !empty($forms) ? $forms : ['Form 4', 'Form 5'];
    // }

    // /**
    //  * Generate subject URL with proper parameters
    //  */
    // public function getSubjectUrl($subject)
    // {
    //     $subjectSlug = strtolower(str_replace(' ', '-', $subject->name));
    //     $levelId = $subject->level_id;
    //     $form = $levelId == 10 ? 'Form 4' : 'Form 5';
        
    //     return "/subject/{$subjectSlug}?subject_id={$subject->id}&level_id={$levelId}&form={$form}";
    // }
}