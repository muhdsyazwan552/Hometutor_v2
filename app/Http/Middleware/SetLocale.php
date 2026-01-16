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
    // Skip for logout request - handled in controller
    if ($request->routeIs('logout') || $request->is('logout')) {
        return $next($request);
    }
    
    Log::info('=== SetLocale Middleware ===', [
        'path' => $request->path(),
        'method' => $request->method(),
        'auth' => Auth::check() ? 'yes' : 'no',
        'user_id' => Auth::id(),
        'current_session_locale' => Session::get('locale')
    ]);
    
    // Determine locale based on authentication status
    if (Auth::check()) {
        // Authenticated user
        $user = Auth::user();
        
        // ✅ FIX: Always prioritize user DB preference for authenticated users
        $userLocale = $user->language ?? 'en';
        $sessionLocale = Session::get('locale');
        
        // Use user DB preference, overriding any existing session locale
        $locale = $userLocale;
        
        // Update session to match user preference
        if ($sessionLocale !== $userLocale) {
            Session::put('locale', $userLocale);
            Log::info('Setting locale from user DB (overriding session):', [
                'session_was' => $sessionLocale,
                'user_db' => $userLocale,
                'final' => $locale
            ]);
        }
    } else {
        // Guest user
        $locale = Session::get('locale', 'en');
        
        // Ensure guest always has valid locale
        if (!$locale || !in_array($locale, ['en', 'ms'])) {
            $locale = 'en';
            Session::put('locale', $locale);
        }
    }
    
    // Validate locale
    $availableLocales = ['en', 'ms'];
    if (!in_array($locale, $availableLocales)) {
        $locale = 'en';
        Session::put('locale', $locale);
    }
    
    // Set application locale
    App::setLocale($locale);
    
    Log::info('Final locale:', [
        'app_locale' => $locale,
        'session_locale' => Session::get('locale'),
        'user_language' => Auth::check() ? Auth::user()->language : 'N/A'
    ]);

    return $next($request);
}
}