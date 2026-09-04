<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Web\ReportController;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class ChildReportController extends Controller
{
    private const SESSIONS_PER_PAGE = 20;

    public function index(Request $request, string $childUuid): Response
    {
        $student = $this->ownedChild($request, $childUuid);
        $filters = $this->filters($request);

        $forms = $this->formsFor($student);

        if ($filters['form'] === 'all') {
            $selectedForm = 'all';
            $subjectLevelIds = $forms->pluck('id')->all();
        } else {
            $selectedForm = $forms->contains('id', $filters['form'])
                ? $filters['form']
                : ($forms->contains('id', $student->level_id) ? (int) $student->level_id : $forms->first()['id'] ?? null);
            $subjectLevelIds = $selectedForm ? [$selectedForm] : [];
        }

        $subjects = $this->subjectsFor($subjectLevelIds);
        $selectedSubject = $subjects->contains('id', $filters['subject']) ? $filters['subject'] : null;
        $topics = $this->topicsFor($selectedSubject);
        $selectedTopic = $topics->contains('id', $filters['topic']) ? $filters['topic'] : null;

        $filters['form'] = $selectedForm;
        $filters['subject'] = $selectedSubject;
        $filters['topic'] = $selectedTopic;

        $sessions = $this->sessionsFor($student, $filters);
        $formattedSessions = $sessions->map(fn (object $session) => $this->formatSession($session, $student));

        return Inertia::render('Parent/ChildReport', [
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
            'filters' => $filters,
            'forms' => $forms->values(),
            'subjects' => $subjects->values(),
            'topics' => $topics->values(),
            'summary' => $this->summary($formattedSessions),
            'sessions' => $this->paginateSessions($formattedSessions, $request),
        ]);
    }

    public function review(Request $request, string $childUuid, string $sessionUuid): JsonResponse
    {
        $student = $this->ownedChild($request, $childUuid);

        return app(ReportController::class)
            ->getQuestionAttemptsForUser($sessionUuid, (int) $student->user_id, true);
    }

    private function ownedChild(Request $request, string $childUuid): Student
    {
        return $request->user()
            ->children()
            ->with(['user', 'school', 'level'])
            ->where('uuid', $childUuid)
            ->firstOrFail();
    }

    private function reportChildren(Request $request, Student $selectedStudent): Collection
    {
        return $request->user()->children()->with('user')->orderBy('full_name')->get()
            ->map(fn (Student $child) => [
                'uuid' => $child->uuid,
                'name' => $child->full_name ?: $child->user->display_name ?: $child->user->name,
                'selected' => $child->id === $selectedStudent->id,
                'report_url' => route('parent.children.reports', $child->uuid),
                'history_url' => route('parent.children.reports.history', $child->uuid),
            ])->values();
    }

    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'form' => ['nullable', function ($attribute, $value, $fail) {
                if ($value !== null && $value !== 'all' && ! ctype_digit((string) $value)) {
                    $fail('The selected form is invalid.');
                }
            }],
            'subject' => ['nullable', 'integer'],
            'topic' => ['nullable', 'integer'],
            'type' => ['nullable', 'in:all,practice,mission'],
            'period' => ['nullable', 'in:7,30,90,all'],
            'result' => ['nullable', 'in:all,passed,needs_improvement'],
        ]);

        return [
            'form' => ($validated['form'] ?? null) === 'all' ? 'all' : (isset($validated['form']) ? (int) $validated['form'] : null),
            'subject' => isset($validated['subject']) ? (int) $validated['subject'] : null,
            'topic' => isset($validated['topic']) ? (int) $validated['topic'] : null,
            'type' => $validated['type'] ?? 'all',
            'period' => $validated['period'] ?? '30',
            'result' => $validated['result'] ?? 'all',
        ];
    }

    private function formsFor(Student $student): Collection
    {
        if (! Schema::hasTable('level')) {
            return collect();
        }

        $levelIds = collect([$student->level_id])->filter()->map(fn ($id) => (int) $id);

        if (Schema::hasTable('practice_session') && Schema::hasTable('subject')) {
            $historical = DB::table('practice_session as ps')
                ->join('subject as s', 's.id', '=', 'ps.subject_id')
                ->where('ps.user_id', $student->user_id)
                ->whereNotNull('s.level_id')
                ->distinct()
                ->pluck('s.level_id')
                ->map(fn ($id) => (int) $id);
            $levelIds = $levelIds->merge($historical)->unique();
        }

        return DB::table('level')
            ->whereIn('id', $levelIds)
            ->orderBy('id')
            ->get(['id', 'name', 'abbr'])
            ->map(fn (object $level) => ['id' => (int) $level->id, 'name' => $level->name, 'abbr' => $level->abbr]);
    }

    private function subjectsFor(array $levelIds): Collection
    {
        if (empty($levelIds) || ! Schema::hasTable('subject')) {
            return collect();
        }

        return DB::table('subject')
            ->whereIn('level_id', $levelIds)
            ->where('is_active', 1)
            ->orderBy('seq')
            ->get(['id', 'name', 'abbr'])
            ->map(fn (object $subject) => ['id' => (int) $subject->id, 'name' => $subject->name, 'abbr' => $subject->abbr]);
    }

    private function topicsFor(?int $subjectId): Collection
    {
        if (! $subjectId || ! Schema::hasTable('topics')) {
            return collect();
        }

        return DB::table('topics as t')
            ->leftJoin('topics as parent', 'parent.id', '=', 't.parent_id')
            ->where('t.subject_id', $subjectId)
            ->where('t.is_active', 1)
            ->orderByRaw('COALESCE(NULLIF(t.parent_id, 0), t.id)')
            ->orderBy('t.seq')
            ->get(['t.id', 't.name', 't.parent_id', 'parent.name as parent_name'])
            ->map(fn (object $topic) => [
                'id' => (int) $topic->id,
                'name' => $topic->parent_name ? $topic->parent_name.' — '.$topic->name : $topic->name,
            ]);
    }

    private function sessionsFor(Student $student, array $filters): Collection
    {
        if (! Schema::hasTable('practice_session')) {
            return collect();
        }

        $query = DB::table('practice_session as ps')
            ->leftJoin('subject as s', 's.id', '=', 'ps.subject_id')
            ->leftJoin('level as l', 'l.id', '=', 's.level_id')
            ->leftJoin('topics as main_topic', 'main_topic.id', '=', 'ps.topic_id')
            ->leftJoin('topics as subtopic', 'subtopic.id', '=', 'ps.subtopic_id')
            ->where('ps.user_id', $student->user_id)
            ->select([
                'ps.*',
                's.name as subject_name',
                'l.name as form_name',
                DB::raw("COALESCE(subtopic.name, main_topic.name, 'Unknown topic') as topic_name"),
            ]);

        $this->applyFilters($query, $filters);

        return $query->orderByDesc('ps.created_at')->orderByDesc('ps.id')->get();
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if ($filters['form'] && $filters['form'] !== 'all') {
            $query->where('s.level_id', $filters['form']);
        }
        if ($filters['subject']) {
            $query->where('ps.subject_id', $filters['subject']);
        }
        if ($filters['topic']) {
            $query->where(fn (Builder $topicQuery) => $topicQuery
                ->where('ps.topic_id', $filters['topic'])
                ->orWhere('ps.subtopic_id', $filters['topic']));
        }
        if ($filters['type'] !== 'all') {
            $query->where('ps.session_type', $filters['type']);
        }
        if ($filters['period'] !== 'all') {
            $query->where('ps.created_at', '>=', now()->subDays((int) $filters['period'])->startOfDay());
        }
        if ($filters['result'] === 'passed') {
            $query->where('ps.score', '>=', 80);
        } elseif ($filters['result'] === 'needs_improvement') {
            $query->where('ps.score', '<', 80);
        }
    }

    private function formatSession(object $session, Student $student): array
    {
        $type = strtolower($session->session_type ?? 'practice');
        $correct = (int) ($session->total_correct ?? 0);
        $skipped = (int) ($session->total_skipped ?? 0);
        $storedTotal = (int) ($session->total_questions ?? 0);
        $total = $type === 'mission' ? ($storedTotal > 0 ? $storedTotal : max($correct + $skipped, 10)) : 5;
        $score = $session->score !== null ? (float) $session->score : ($total > 0 ? ($correct / $total) * 100 : 0);

        return [
            'uuid' => $session->uuid,
            'date' => Carbon::parse($session->created_at)->format('d M Y, H:i'),
            'date_iso' => Carbon::parse($session->created_at)->toIso8601String(),
            'type' => $type,
            'form' => $session->form_name ?? '—',
            'subject' => $session->subject_name ?? '—',
            'topic' => $session->topic_name ?? 'Unknown topic',
            'question_type' => (int) ($session->question_type_id ?? 1) === 1 ? 'Objective' : 'Subjective',
            'total_questions' => $total,
            'correct' => $correct,
            'wrong' => max($total - $correct - $skipped, 0),
            'skipped' => $skipped,
            'score' => round($score, 1),
            'time_seconds' => (int) ($session->total_time_seconds ?? 0),
            'review_url' => route('parent.children.reports.review', [$student->uuid, $session->uuid]),
        ];
    }

    private function summary(Collection $sessions): array
    {
        return [
            'total_sessions' => $sessions->count(),
            'total_questions' => $sessions->sum('total_questions'),
            'correct' => $sessions->sum('correct'),
            'wrong' => $sessions->sum('wrong'),
            'average_score' => $sessions->isEmpty() ? 0 : round($sessions->avg('score'), 1),
            'last_session' => $sessions->first()['date'] ?? null,
            'practice_sessions' => $sessions->where('type', 'practice')->count(),
            'mission_sessions' => $sessions->where('type', 'mission')->count(),
        ];
    }

    private function paginateSessions(Collection $sessions, Request $request): array
    {
        $total = $sessions->count();
        $lastPage = max(1, (int) ceil($total / self::SESSIONS_PER_PAGE));
        $currentPage = min(max($request->integer('page', 1), 1), $lastPage);
        $from = $total === 0 ? null : (($currentPage - 1) * self::SESSIONS_PER_PAGE) + 1;
        $to = $total === 0 ? null : min($currentPage * self::SESSIONS_PER_PAGE, $total);

        return [
            'data' => $sessions->forPage($currentPage, self::SESSIONS_PER_PAGE)->values(),
            'meta' => [
                'current_page' => $currentPage,
                'last_page' => $lastPage,
                'per_page' => self::SESSIONS_PER_PAGE,
                'total' => $total,
                'from' => $from,
                'to' => $to,
            ],
            'links' => [
                'previous' => $currentPage > 1
                    ? $request->fullUrlWithQuery(['page' => $currentPage - 1])
                    : null,
                'next' => $currentPage < $lastPage
                    ? $request->fullUrlWithQuery(['page' => $currentPage + 1])
                    : null,
            ],
        ];
    }
}
