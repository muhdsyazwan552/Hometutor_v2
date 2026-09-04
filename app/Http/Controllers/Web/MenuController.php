<?php
namespace App\Http\Controllers\Web;
use App\Http\Controllers\Controller;

use App\Models\Subject;
use App\Models\Student;
use App\Helpers\LevelHelper;
use Illuminate\Support\Facades\Auth;

class MenuController extends Controller
{
    public function getSchoolSubjects()
    {
<<<<<<< HEAD
        // Make sure to select level_id
        $schoolSubjects = Subject::where('is_active', true)
            ->where('level_id', 10)
            ->where('is_active', 1)
=======
        // Get the authenticated user
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        // Get the student record for the user
        $student = Student::where('user_id', $user->id)->first();
        
        if (!$student) {
            return []; // Return empty array if no student found
        }
        
        $levelId = $student->level_id;
        
        // Use the helper to get the standard level_id
        $standardLevelId = LevelHelper::getStandardLevelId($levelId);
        
        // Return ONLY the array of subjects
        return Subject::where('is_active', true)
            ->where('level_id', $standardLevelId)
>>>>>>> 917d4bb (Initial project commit)
            ->select('id', 'name', 'level_id', 'abbr', 'seq')
            ->orderBy('seq')
            ->get()
            ->toArray();
    }
}