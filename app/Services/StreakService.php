<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StreakService
{
    public function recordLogin(int $userId): array
    {
        return $this->recordDailyStreak($userId, 'login');
    }

    public function recordAnswer(int $userId): array
    {
        return DB::transaction(function () use ($userId) {
            $streak = $this->recordDailyStreak($userId, 'question');
            $today = now()->toDateString();
            $current = DB::table('user_streaks')->where('user_id', $userId)->lockForUpdate()->first();

            DB::table('user_streaks')->where('user_id', $userId)->update([
                'answers_today' => $current->answers_today_date === $today
                    ? $current->answers_today + 1
                    : 1,
                'answers_today_date' => $today,
                'updated_at' => now(),
            ]);

            return $this->summary($userId);
        });
    }

    public function summary(int $userId): array
    {
        $streak = DB::table('user_streaks')->where('user_id', $userId)->first();
        $today = now()->toDateString();

        return [
            'login' => (int) ($streak->login_streak ?? 0),
            'questions' => (int) ($streak->question_streak ?? 0),
            'answersToday' => $streak && $streak->answers_today_date === $today
                ? (int) $streak->answers_today
                : 0,
            'longestLogin' => (int) ($streak->longest_login_streak ?? 0),
            'longestQuestions' => (int) ($streak->longest_question_streak ?? 0),
            'lastLoginDate' => $streak->last_login_date ?? null,
            'lastAnswerDate' => $streak->last_answer_date ?? null,
        ];
    }

    private function recordDailyStreak(int $userId, string $type): array
    {
        return DB::transaction(function () use ($userId, $type) {
            $today = now()->startOfDay();
            $dateColumn = $type === 'login' ? 'last_login_date' : 'last_answer_date';
            $streakColumn = $type === 'login' ? 'login_streak' : 'question_streak';
            $longestColumn = $type === 'login' ? 'longest_login_streak' : 'longest_question_streak';

            $streak = DB::table('user_streaks')->where('user_id', $userId)->lockForUpdate()->first();

            if (! $streak) {
                DB::table('user_streaks')->insert([
                    'user_id' => $userId,
                    $dateColumn => $today->toDateString(),
                    $streakColumn => 1,
                    $longestColumn => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return $this->summary($userId);
            }

            $lastDate = $streak->{$dateColumn} ? Carbon::parse($streak->{$dateColumn})->startOfDay() : null;

            if ($lastDate && $lastDate->isSameDay($today)) {
                return $this->summary($userId);
            }

            $nextStreak = $lastDate && $lastDate->isSameDay($today->copy()->subDay())
                ? $streak->{$streakColumn} + 1
                : 1;

            DB::table('user_streaks')->where('user_id', $userId)->update([
                $dateColumn => $today->toDateString(),
                $streakColumn => $nextStreak,
                $longestColumn => max($nextStreak, $streak->{$longestColumn}),
                'updated_at' => now(),
            ]);

            return $this->summary($userId);
        });
    }
}
