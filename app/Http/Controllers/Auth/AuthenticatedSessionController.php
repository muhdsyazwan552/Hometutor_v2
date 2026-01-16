<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    // public function store(LoginRequest $request): RedirectResponse
    // {
    //     $request->authenticate();

    //     $request->session()->regenerate();

    //     return redirect()->intended(route('dashboard', absolute: false));
    // }

     /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
{
    // 1. Save current locale to flash data BEFORE authentication
    $previousLocale = Session::get('locale', 'en');
    
    // Store in session flash so it survives redirects
    Session::flash('preserved_locale', $previousLocale);
    
    Log::info('LoginController - Saving locale to flash:', [
        'locale' => $previousLocale,
        'session_id' => Session::getId()
    ]);

    $request->authenticate();

    $request->session()->regenerate();

    // 2. Check for preserved locale in flash data
    $preservedLocale = Session::get('preserved_locale');
    if ($preservedLocale && in_array($preservedLocale, ['en', 'ms'])) {
        Session::put('locale', $preservedLocale);
        
        // Also update user's language preference
        // $user = Auth::user();
        // if ($user && $user->language !== $preservedLocale) {
        //     $user->update(['language' => $preservedLocale]);
        // }
        
        Log::info('LoginController - Restored locale from flash:', [
            'locale' => $preservedLocale,
            'user_id' => Auth::id()
        ]);
    }

    return redirect()->intended(route('dashboard', absolute: false));
}

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
