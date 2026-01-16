<?php

namespace App\Http\Controllers\Web;
use App\Http\Controllers\Controller;

use App\Models\Subject;
use App\Models\Topic;
use App\Models\Level;
use App\Models\Question;
use App\Models\Answer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use App\Traits\InertiaLocaleTrait;

class MissionController extends Controller
{
    use InertiaLocaleTrait;

    /**
     * Display the mission page for a subject
     */
    public function index(Request $request, $subject)
    {
        $subjectId = $request->get('subject_id');
        $levelId = $request->get('level_id');
        $form = $request->get('form', 'Form 4');

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
       

        return Inertia::render('courses/SubjectMissionPage', [
            'subject' => $subjectData->name,
            'subject_abbr' => $subjectData->name,
            'subject_id' => $subjectId,
            'level_id' => $levelId,
            'form' => $form,
            
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
}