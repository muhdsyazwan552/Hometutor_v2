<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ParentChildOverviewService
{
    public function enrich(Collection $children): Collection
    {
        $userIds = $children->pluck('user_id')->filter()->map(fn ($id) => (int) $id)->values();
        $sessionSummaries = collect();
        $weakestSubjects = collect();
        $streaks = collect();

        if ($userIds->isNotEmpty() && Schema::hasTable('practice_session')) {
            $sessionSummaries = DB::table('practice_session')
                ->whereIn('user_id', $userIds)
                ->select('user_id')
                ->selectRaw('MAX(created_at) as last_active_at')
                ->selectRaw('SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as sessions_this_week', [now()->startOfWeek()])
                ->selectRaw('AVG(CASE WHEN created_at >= ? AND score IS NOT NULL THEN score END) as average_score', [now()->subDays(30)->startOfDay()])
                ->groupBy('user_id')
                ->get()
                ->keyBy('user_id');

            if (Schema::hasTable('subject')) {
                $weakestSubjects = DB::table('practice_session as ps')
                    ->join('subject as s', 's.id', '=', 'ps.subject_id')
                    ->whereIn('ps.user_id', $userIds)
                    ->where('ps.created_at', '>=', now()->subDays(30)->startOfDay())
                    ->whereNotNull('ps.score')
                    ->groupBy('ps.user_id', 'ps.subject_id', 's.name')
                    ->select('ps.user_id', 's.name')
                    ->selectRaw('AVG(ps.score) as average_score')
                    ->get()
                    ->groupBy('user_id')
                    ->map(fn (Collection $subjects) => $subjects->sortBy('average_score')->first());
            }
        }

        if ($userIds->isNotEmpty() && Schema::hasTable('user_streaks')) {
            $streaks = DB::table('user_streaks')->whereIn('user_id', $userIds)->get()->keyBy('user_id');
        }

        return $children->each(function ($child) use ($sessionSummaries, $weakestSubjects, $streaks): void {
            $summary = $sessionSummaries->get($child->user_id);
            $streak = $streaks->get($child->user_id);
            $lastActiveAt = $summary?->last_active_at
                ? Carbon::parse($summary->last_active_at)
                : $this->lastStreakActivity($streak);
            $name = $child->full_name ?: $child->user?->display_name ?: $child->user?->name ?: 'Child';

            $child->setAttribute('card_metrics', [
                'initials' => $this->initials($name),
                'last_active_at' => $lastActiveAt,
                'last_active_label' => $this->lastActiveLabel($lastActiveAt),
                'sessions_this_week' => (int) ($summary?->sessions_this_week ?? 0),
                'average_score' => $summary?->average_score !== null ? (int) round((float) $summary->average_score) : null,
                'weakest_subject' => $weakestSubjects->get($child->user_id)?->name,
                'streak_days' => max((int) ($streak?->question_streak ?? 0), (int) ($streak?->login_streak ?? 0)),
            ]);
        });
    }

    private function lastStreakActivity(?object $streak): ?Carbon
    {
        $dates = collect([$streak?->last_answer_date, $streak?->last_login_date])->filter();

        return $dates->isEmpty() ? null : Carbon::parse($dates->sortDesc()->first());
    }

    private function lastActiveLabel(?Carbon $date): string
    {
        if (! $date) {
            return 'No activity yet';
        }
        if ($date->isToday()) {
            return 'Today';
        }
        if ($date->isYesterday()) {
            return 'Yesterday';
        }

        return $date->diffForHumans();
    }

    private function initials(string $name): string
    {
        return collect(preg_split('/\s+/', trim($name)))
            ->filter()
            ->take(2)
            ->map(fn (string $part) => mb_strtoupper(mb_substr($part, 0, 1)))
            ->implode('') ?: 'HT';
    }
}
