<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        // Get locale with priority:
        // 1. From session (if user just changed language)
        // 2. From user database (if user logged in)
        // 3. Default 'en'

        Log::info('=== SetLocale Middleware START ===');
    Log::info('URL:', ['url' => $request->fullUrl()]);
    Log::info('Session ID:', ['id' => session()->getId()]);
    Log::info('Session locale:', ['locale' => session('locale')]);
    Log::info('User language:', ['language' => Auth::check() ? Auth::user()->language : null]);
        
        $locale = Session::get('locale');
        
        if (!$locale && Auth::check() && Auth::user()->language) {
            // ✅ No conversion needed now - just use directly
            $locale = Auth::user()->language;
            Session::put('locale', $locale);
        }
        
        if (!$locale) {
            $locale = 'en';
            Session::put('locale', $locale);
        }
        
        Log::info('SetLocale middleware:', [
            'final_locale' => $locale,
            'session_locale' => Session::get('locale'),
            'user_language' => Auth::check() ? Auth::user()->language : null
        ]);
        
        // Set application locale
        App::setLocale($locale);
        
        return $next($request);
    }
}