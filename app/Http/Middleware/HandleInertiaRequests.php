<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Student;
use App\Http\Controllers\Web\MenuController;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
                'student' => function () use ($request) {
                    if (!$request->user()) {
                        return null;
                    }
                    
                    // Eager load student with school and level relationships
                    return Student::with(['school', 'level'])
                        ->where('user_id', $request->user()->id)
                        ->first();
                },
            ],
            'schoolSubjects' => fn () => (new MenuController())->getSchoolSubjects(),
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}