<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('mastery_challenge_sessions') && ! Schema::hasColumn('mastery_challenge_sessions', 'session_type')) {
            Schema::table('mastery_challenge_sessions', function (Blueprint $table) {
                $table->string('session_type', 20)->default('mission')->after('level_id')->index();
            });
        }

        if (Schema::hasTable('practice_session')) {
            Schema::table('practice_session', function (Blueprint $table) {
                if (! Schema::hasColumn('practice_session', 'session_type')) {
                    $table->string('session_type', 20)->default('practice')->after('question_type_id')->index();
                }
                if (! Schema::hasColumn('practice_session', 'total_questions')) {
                    $table->unsignedSmallInteger('total_questions')->nullable()->after('session_type');
                }
                if (! Schema::hasColumn('practice_session', 'mastery_session_id')) {
                    $table->unsignedBigInteger('mastery_session_id')->nullable()->after('id')->index();
                }
            });
        }

        $this->backfillExistingSessions();
    }

    private function backfillExistingSessions(): void
    {
        if (! Schema::hasTable('practice_session')) {
            return;
        }

        $hasMasterySessions = Schema::hasTable('mastery_challenge_sessions');
        $hasQuizAttempts = Schema::hasTable('quiz_attempts');

        if ($hasMasterySessions) {
            DB::table('mastery_challenge_sessions')->update([
                'session_type' => DB::raw("CASE WHEN total_questions <= 5 THEN 'practice' ELSE 'mission' END"),
            ]);
        }

        DB::table('practice_session')->orderBy('id')->get()->each(function ($session) use ($hasMasterySessions, $hasQuizAttempts) {
            $masterySession = null;

            if ($hasMasterySessions && $session->start_at) {
                $masterySession = DB::table('mastery_challenge_sessions')
                    ->where('user_id', $session->user_id)
                    ->where('subject_id', $session->subject_id)
                    ->whereBetween('started_at', [
                        \Carbon\Carbon::parse($session->start_at)->subSeconds(2),
                        \Carbon\Carbon::parse($session->start_at)->addSeconds(2),
                    ])
                    ->orderByDesc('id')
                    ->first();
            }

            $attemptCount = $hasQuizAttempts
                ? DB::table('quiz_attempts')->where('session_id', $session->id)->count()
                : 0;
            $fallbackCount = (int) $session->total_correct + (int) $session->total_skipped;

            DB::table('practice_session')->where('id', $session->id)->update([
                'mastery_session_id' => $masterySession?->id,
                'session_type' => $masterySession?->session_type ?? 'practice',
                'total_questions' => $masterySession?->total_questions
                    ?? ($attemptCount > 0 ? $attemptCount : max($fallbackCount, 5)),
            ]);
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('practice_session')) {
            Schema::table('practice_session', function (Blueprint $table) {
                foreach (['mastery_session_id', 'total_questions', 'session_type'] as $column) {
                    if (Schema::hasColumn('practice_session', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }

        if (Schema::hasTable('mastery_challenge_sessions') && Schema::hasColumn('mastery_challenge_sessions', 'session_type')) {
            Schema::table('mastery_challenge_sessions', function (Blueprint $table) {
                $table->dropColumn('session_type');
            });
        }
    }
};
