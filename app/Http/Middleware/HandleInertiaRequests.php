<?php
// app/Http/Middleware/HandleInertiaRequests.php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Student;
use App\Http\Controllers\Web\MenuController;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;


class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $locale = App::getLocale();

        // 🔍 DEBUG - Add translation loading debug
        $translations = $this->getTranslations($locale);

        Log::info('HandleInertiaRequests - Translations loaded:', [
            'locale' => $locale,
            'translation_keys' => array_keys($translations),
            'has_common_key' => isset($translations['common']),
            'translations_sample' => array_slice($translations, 0, 3),
        ]);

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
                'student' => function () use ($request) {
                    if (!$request->user()) {
                        return null;
                    }

                    return Student::with(['school', 'level'])
                        ->where('user_id', $request->user()->id)
                        ->first();
                },
            ],

            'schoolSubjects' => fn() => (new MenuController())->getSchoolSubjects(),

            'flash' => [
                'message' => fn() => $request->session()->get('message'),
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],

            // Language data
            'locale' => $locale,
            'translations' => $translations, // Already loaded above
            'availableLocales' => ['en', 'ms'],

            'appName' => config('app.name'),
            'appUrl' => config('app.url'),
        ]);
    }

    // app/Http/Middleware/HandleInertiaRequests.php
    private function getTranslations(string $locale): array
    {
        $translations = [];

        // Load common.php
        $commonPath = lang_path("{$locale}/common.php");
        if (File::exists($commonPath)) {
            // ✅ Nest under 'common' key as expected by frontend
            $translations['common'] = require $commonPath;
        }

        // Load other translation files if needed
        $otherPath = lang_path("{$locale}/other.php");
        if (File::exists($otherPath)) {
            $translations['other'] = require $otherPath;
        }

        return $translations;
    }
}
