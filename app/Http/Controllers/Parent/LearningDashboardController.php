<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Subject;
use App\Services\StreakService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

class LearningDashboardController extends Controller
{
    public function show(Request $request, string $childUuid): Response
    {
        // Scope the lookup to this parent. A valid UUID owned by another parent
        // deliberately produces the same 404 response as an unknown UUID.
        $student = $request->user()
            ->children()
            ->with(['user', 'school', 'level'])
            ->where('uuid', $childUuid)
            ->firstOrFail();

        $child = $student->user;
        abort_unless($child && $child->isChild() && $child->is_active, 404);

        $locale = Session::get('locale', $request->user()->language ?: 'en');
        App::setLocale($locale);

        $courses = Schema::hasTable('subject')
            ? Subject::query()
                ->where('level_id', $student->level_id ?? 7)
                ->where('is_active', true)
                ->orderBy('seq')
                ->limit(4)
                ->get(['id', 'name', 'abbr'])
                ->map(fn (Subject $subject) => [
                    'id' => $subject->id,
                    'title' => $subject->name,
                    'abbr' => $subject->abbr,
                    'topic' => 'Available in the child account',
                ])
                ->values()
            : collect();

        $teachers = [[
            'name' => 'Cikgu Aina',
            'image' => '/images/cikgu-aina.png',
            'subjects' => $courses->pluck('title')->take(2)->values()->all() ?: ['Mathematics', 'Science'],
            'message' => 'Let’s learn one small step at a time!',
            'available' => 'Ready to guide your child',
        ]];

        return Inertia::render('Parent/Dashboard', [
            'title' => $child->display_name ?: $child->name,
            'viewerMode' => 'parent',
            'viewedChild' => [
                'uuid' => $student->uuid,
                'name' => $student->full_name ?: $child->display_name ?: $child->name,
                'username' => $child->username,
            ],
            'reportChildren' => $this->reportChildren($request, $student),
            'returnToParentUrl' => route('parent.dashboard'),
            'parentDashboardUrl' => route('parent.children.learning-dashboard', $student->uuid),
            'parentReportUrl' => route('parent.children.reports', $student->uuid),
            'sessionHistoryUrl' => route('parent.children.reports.history', $student->uuid),
            'profileData' => [
                'name' => $student->full_name ?: $child->name,
                'email' => $child->email,
                'school' => $student->school?->name ?? 'School not specified',
                'grade' => $student->class_name ?? $student->level?->name ?? 'Level not specified',
                'display_name' => $child->display_name ?: $child->name,
                'profile_picture' => $child->profile_picture ?? null,
            ],
            'student' => $student,
            'courses' => $courses,
            'assignments' => [],
            'zoomMeetings' => [],
            'streaks' => app(StreakService::class)->summary($child->id),
            'teachers' => $teachers,
            'locale' => $locale,
            'translations' => trans('common', [], $locale),
            'availableLocales' => ['en', 'ms'],
        ]);
    }

    private function reportChildren(Request $request, Student $selectedStudent): array
    {
        return $request->user()->children()->with('user')->orderBy('full_name')->get()
            ->map(fn (Student $child) => [
                'uuid' => $child->uuid,
                'name' => $child->full_name ?: $child->user->display_name ?: $child->user->name,
                'selected' => $child->id === $selectedStudent->id,
                'report_url' => route('parent.children.reports', $child->uuid),
                'history_url' => route('parent.children.reports.history', $child->uuid),
                'dashboard_url' => route('parent.children.learning-dashboard', $child->uuid),
            ])->values()->all();
    }
}