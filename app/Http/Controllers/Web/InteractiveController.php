<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\InteractiveGame;
use App\Models\Level;
use App\Models\Subject;
use App\Traits\InertiaLocaleTrait;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

class InteractiveController extends Controller
{
    use InertiaLocaleTrait;

    private const SUPPORTED_FORMS = ['Standard 1', 'Standard 2', 'Standard 3'];

    public function index(Request $request, string $subject): Response
    {
        $studentLevelId = $this->studentLevelId();
        $levels = Level::query()
            ->where('is_active', true)
            ->whereIn('name', self::SUPPORTED_FORMS)
            ->orderBy('id')
            ->get(['id', 'name', 'abbr']);

        abort_if($levels->isEmpty(), 404, 'Standard 1–3 levels are not configured.');

        $selectedLevel = $this->selectedLevel($request, $levels, $studentLevelId);
        $subjectData = $this->subjectForLevel($subject, (int) $selectedLevel->id, $request->integer('subject_id'));

        abort_unless($subjectData, 404, 'Subject not found for this level.');

        $availableSubjects = [];
        foreach ($levels as $level) {
            $matchingSubject = $this->subjectForLevel($subject, (int) $level->id);
            if ($matchingSubject) {
                $availableSubjects[$level->name] = $matchingSubject->id;
            }
        }

        $games = InteractiveGame::query()
            ->where('level_id', $selectedLevel->id)
            ->where('subject_id', $subjectData->id)
            ->where('is_active', true)
            ->orderBy('sequence')
            ->orderBy('id')
            ->get();

        $interactiveModules = $games
            ->map(fn (InteractiveGame $game) => [
                'id' => $game->id,
                'slug' => $game->slug,
                'title' => $game->title,
                'description' => $game->description,
                'type' => 'unity_webgl',
                'standard' => strtoupper($selectedLevel->name),
                'form' => $selectedLevel->name,
                'status' => 'available',
                'icon' => 'gamepad',
                'order' => $game->sequence,
                'launch_url' => route('interactive-games.play', $game),
                'thumbnail_url' => $game->thumbnail_url,
            ]);

        if ($games->contains('content_group', 'literasi')) {
            $interactiveModules->prepend([
                'id' => "react-literasi-{$selectedLevel->id}-{$subjectData->id}",
                'slug' => 'literasi-react-drag-drop',
                'title' => 'Literasi React Drag & Drop',
                'description' => "Aktiviti Literasi React dengan lima permainan untuk {$selectedLevel->name}.",
                'type' => 'react_literasi',
                'standard' => strtoupper($selectedLevel->name),
                'form' => $selectedLevel->name,
                'status' => 'available',
                'icon' => 'move',
                'order' => 0,
                'launch_url' => route('demo.literasi-web', ['embedded' => 1]),
                'thumbnail_url' => null,
            ]);

            $interactiveModules->prepend([
                'id' => "react-literasi-huruf-{$selectedLevel->id}-{$subjectData->id}",
                'slug' => 'literasi-huruf-react',
                'title' => 'Literasi Huruf A–Z',
                'description' => 'Tekan huruf untuk mendengar sebutan dan melihat cara huruf ditulis.',
                'type' => 'react_literasi',
                'standard' => strtoupper($selectedLevel->name),
                'form' => $selectedLevel->name,
                'status' => 'available',
                'icon' => 'type',
                'order' => -1,
                'launch_url' => route('demo.literasi-huruf', ['embedded' => 1]),
                'thumbnail_url' => null,
            ]);
        }

        $interactiveModules = $interactiveModules->values();

        $locale = Session::get('locale', 'en');
        App::setLocale($locale);

        return Inertia::render('courses/SubjectInteractivePage', [
            'subject' => $subjectData->name,
            'subject_abbr' => $subjectData->abbr,
            'subject_id' => $subjectData->id,
            'level_id' => $selectedLevel->id,
            'form' => $selectedLevel->name,
            'student_level_id' => $studentLevelId,
            'interactiveModules' => $interactiveModules,
            'selectedStandard' => $selectedLevel->name,
            'availableForms' => $levels->pluck('name')->values(),
            'availableLevels' => $levels->pluck('id', 'name'),
            'availableSubjects' => $availableSubjects,
            'locale' => $locale,
            'translations' => $this->loadTranslations($locale),
            'availableLocales' => ['en', 'ms'],
        ]);
    }

    public function play(InteractiveGame $game): View
    {
        abort_unless($game->is_active, 404);

        return view('interactive-games.player', [
            'game' => $game,
        ]);
    }

    private function studentLevelId(): ?int
    {
        if (! Auth::check()) {
            return null;
        }

        $user = Auth::user();
        $user->loadMissing('student');

        return $user->student?->level_id ? (int) $user->student->level_id : null;
    }

    private function selectedLevel(Request $request, $levels, ?int $studentLevelId): Level
    {
        if ($request->filled('form')) {
            $requested = $levels->firstWhere('name', $request->string('form')->toString());
            if ($requested) {
                return $requested;
            }
        }

        if ($request->integer('level_id')) {
            $requested = $levels->firstWhere('id', $request->integer('level_id'));
            if ($requested) {
                return $requested;
            }
        }

        return $levels->firstWhere('id', $studentLevelId) ?? $levels->first();
    }

    private function subjectForLevel(string $subject, int $levelId, ?int $subjectId = null): ?Subject
    {
        return Subject::query()
            ->where('level_id', $levelId)
            ->where('is_active', true)
            ->when($subjectId, fn ($query) => $query->where('id', $subjectId))
            ->where(function ($query) use ($subject) {
                $query->where('abbr', $subject)->orWhere('name', $subject);
            })
            ->first(['id', 'name', 'abbr', 'level_id']);
    }

    private function loadTranslations(string $locale): array
    {
        $translations = trans('common', [], $locale);

        return is_array($translations) ? $translations : [];
    }
}
