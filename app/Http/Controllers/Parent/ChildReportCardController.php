<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class ChildReportCardController extends Controller
{
    public function __invoke(Request $request, string $childUuid): Response
    {
        $student = $request->user()->children()
            ->with(['user', 'school', 'level'])
            ->where('uuid', $childUuid)
            ->firstOrFail();

        $period = (int) $request->integer('period', 30);
        $period = in_array($period, [7, 30, 90], true) ? $period : 30;
        $sessions = $this->sessions($student, $period);

        return Inertia::render('Parent/ChildReportCard', [
            'viewerMode' => 'parent',
            'viewedChild' => [
                'uuid' => $student->uuid,
                'name' => $student->full_name ?: $student->user->display_name ?: $student->user->name,
                'username' => $student->user->username,
            ],
            'student' => $student,
            'returnToParentUrl' => route('parent.dashboard'),
            'parentDashboardUrl' => route('parent.children.learning-dashboard', $student->uuid),
            'parentReportUrl' => route('parent.children.reports', $student->uuid),
            'sessionHistoryUrl' => route('parent.children.reports.history', $student->uuid),
            'reportChildren' => $this->reportChildren($request, $student),
            'period' => $period,
            'summary' => $this->summary($sessions),
            'subjects' => $this->subjectProgress($sessions),
            'topics' => $this->topicProgress($sessions),
            'consistency' => $this->consistency($sessions),
            'insights' => $this->insights($sessions),
            'recentSessions' => $sessions->take(5)->values(),
        ]);
    }

    private function sessions(Student $student, int $period): Collection
    {
        if (! Schema::hasTable('practice_session')) {
            return collect();
        }

        return DB::table('practice_session as ps')
            ->leftJoin('subject as s', 's.id', '=', 'ps.subject_id')
            ->leftJoin('topics as topic', 'topic.id', '=', 'ps.topic_id')
            ->leftJoin('topics as subtopic', 'subtopic.id', '=', 'ps.subtopic_id')
            ->where('ps.user_id', $student->user_id)
            ->where('ps.created_at', '>=', now()->subDays($period)->startOfDay())
            ->orderByDesc('ps.created_at')
            ->orderByDesc('ps.id')
            ->get([
                'ps.uuid', 'ps.created_at', 'ps.score', 'ps.total_correct', 'ps.total_questions', 'ps.total_time_seconds',
                's.name as subject_name',
                DB::raw("COALESCE(subtopic.name, topic.name, 'Unknown topic') as topic_name"),
            ])
            ->map(fn (object $session) => [
                'uuid' => $session->uuid,
                'date' => Carbon::parse($session->created_at)->format('d M'),
                'date_iso' => Carbon::parse($session->created_at)->toDateString(),
                'subject' => $session->subject_name ?? 'Other',
                'topic' => $session->topic_name ?? 'Unknown topic',
                'score' => round((float) ($session->score ?? 0), 1),
                'correct' => (int) ($session->total_correct ?? 0),
                'total_questions' => (int) ($session->total_questions ?? 0),
                'time_seconds' => (int) ($session->total_time_seconds ?? 0),
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
            ])->values()->all();
    }

    private function summary(Collection $sessions): array
    {
        $average = $sessions->isEmpty() ? 0 : round($sessions->avg('score'), 1);
        $previous = $sessions->filter(fn (array $session) => Carbon::parse($session['date_iso'])->lt(now()->subDays(15)));
        $previousAverage = $previous->isEmpty() ? null : round($previous->avg('score'), 1);

        return [
            'average_score' => $average,
            'score_change' => $previousAverage === null ? null : round($average - $previousAverage, 1),
            'total_sessions' => $sessions->count(),
            'total_questions' => $sessions->sum('total_questions'),
        ];
    }

    private function subjectProgress(Collection $sessions): array
    {
        return $sessions->groupBy('subject')->map(function (Collection $items, string $subject) {
            return [
                'name' => $subject,
                'score' => round($items->avg('score'), 1),
                'sessions' => $items->count(),
            ];
        })->sortByDesc('score')->values()->all();
    }

    private function topicProgress(Collection $sessions): array
    {
        return $sessions->groupBy(fn (array $session) => $session['subject'].'|'.$session['topic'])
            ->map(function (Collection $items, string $key) {
                [$subject, $topic] = explode('|', $key, 2);

                return [
                    'subject' => $subject,
                    'name' => $topic,
                    'score' => round($items->avg('score'), 1),
                    'sessions' => $items->count(),
                ];
            })->sortBy('score')->values()->take(6)->all();
    }

    private function consistency(Collection $sessions): array
    {
        $activeDays = $sessions->pluck('date_iso')->unique()->count();
        $latest = $sessions->first();

        return [
            'active_days' => $activeDays,
            'study_minutes' => (int) ceil($sessions->sum('time_seconds') / 60),
            'last_session' => $latest['date'] ?? null,
            'needs_check_in' => $latest && Carbon::parse($latest['date_iso'])->lt(now()->subDays(5)->startOfDay()),
        ];
    }

    private function insights(Collection $sessions): array
    {
        $topics = $this->topicProgress($sessions);
        $strongest = collect($topics)->sortByDesc('score')->first();
        $focus = collect($topics)->first();

        return [
            'strength' => $strongest ? $strongest['name'].' is a current strength at '.$strongest['score'].'%.' : null,
            'focus' => $focus && $focus['score'] < 80
                ? 'Practise '.$focus['name'].' next; the current average is '.$focus['score'].'%.'
                : null,
        ];
    }
}
