<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LanguageController extends Controller
{
    public function change(Request $request)
    {
        $locale = $request->input('locale');
        
        // Validate locale
        if (!in_array($locale, ['en', 'ms'])) {
            Log::error('Invalid locale requested:', ['locale' => $locale]);
            return back()->withErrors(['locale' => 'Invalid language']);
        }
        
        Log::info('=== LANGUAGE CHANGE START ===');
        Log::info('Requested locale:', ['locale' => $locale]);
        Log::info('User ID:', ['id' => Auth::id()]);
        Log::info('Session ID before:', ['id' => session()->getId()]);
        Log::info('Current session locale before:', ['locale' => session('locale')]);

        // ✅ CRITICAL: Save to session FIRST
        Session::put('locale', $locale);
        
        // ✅ CRITICAL: Force immediate save
        Session::save();
        
        // ✅ Verify it was saved
        $savedLocale = Session::get('locale');
        Log::info('Session locale after save:', ['locale' => $savedLocale]);
        
        if ($savedLocale !== $locale) {
            Log::error('Session save failed!', [
                'expected' => $locale,
                'actual' => $savedLocale
            ]);
        }
        
        // Save to user database if authenticated
        if (Auth::check()) {
            try {
                $updated = DB::table('users')
                    ->where('id', Auth::id())
                    ->update(['language' => $locale]);
                
                Log::info('Database updated:', [
                    'user_id' => Auth::id(),
                    'language' => $locale,
                    'rows_affected' => $updated
                ]);
                
                // Verify database update
                $userLang = DB::table('users')
                    ->where('id', Auth::id())
                    ->value('language');
                    
                Log::info('Database verification:', [
                    'stored_language' => $userLang
                ]);
                
            } catch (\Exception $e) {
                Log::error('Failed to update user language:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }
        
        Log::info('=== LANGUAGE CHANGE END ===');
        Log::info('Final session state:', [
            'session_id' => session()->getId(),
            'locale' => Session::get('locale'),
            'all_session_data' => Session::all()
        ]);
        
        // ✅ Return success with the new locale
        return back()->with('success', 'Language changed successfully');
    }
}