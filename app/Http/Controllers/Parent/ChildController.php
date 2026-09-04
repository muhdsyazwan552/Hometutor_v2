<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\ActivationCode;
use App\Models\Level;
use App\Models\Package;
use App\Models\Student;
use App\Models\User;
use App\Services\ActivationCodeService;
use App\Services\ParentChildOverviewService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\View\View;

class ChildController extends Controller
{
    public function index(Request $request, ParentChildOverviewService $overview): View
    {
        return view('parent.children.index', [
            'children' => $overview->enrich($request->user()->children()->with(['user.childSubscriptions.package', 'level'])->latest()->get()),
        ]);
    }

    public function create(Request $request): View
    {
        $automaticCode = null;
        if ($request->filled('activation')) {
            $automaticCode = $request->user()->activationCodes()
                ->with('package.levels')
                ->where('uuid', $request->string('activation'))
                ->where('status', ActivationCode::STATUS_UNUSED)
                ->whereIn('intended_use', ['new', 'any'])
                ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                ->firstOrFail();
        }

        return view('parent.children.create', [
            'levels' => Schema::hasTable('level')
                ? Level::query()->where('is_active', true)->orderBy('id')->get(['id', 'name'])
                : collect(),
            'automaticCode' => $automaticCode,
        ]);
    }

    public function store(Request $request, ActivationCodeService $codeService): RedirectResponse
    {
        $validated = $request->validate([
            'activation_code' => ['required', 'string', 'max:40'],
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'alpha_dash', 'min:4', 'max:40', 'unique:users,username'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'level_id' => ['required', 'integer', 'exists:level,id'],
            'class_name' => ['nullable', 'string', 'max:50'],
        ]);

        DB::transaction(function () use ($request, $validated, $codeService) {
            $childUser = User::create([
                'name' => $validated['name'],
                'display_name' => $validated['name'],
                'username' => Str::lower($validated['username']),
                'email' => Str::lower($validated['username']).'@children.hometutor.local',
                'password' => Hash::make($validated['password']),
                'role_id' => User::ROLE_CHILD,
                'is_active' => true,
            ]);

            Student::create([
                'user_id' => $childUser->id,
                'parent_id' => $request->user()->id,
                'code' => 'HT-'.Str::upper(Str::random(10)),
                'full_name' => $validated['name'],
                'level_id' => $validated['level_id'] ?? null,
                'class_name' => $validated['class_name'] ?? null,
            ]);

            $codeService->redeem(
                $validated['activation_code'],
                $request->user(),
                $childUser,
                (int) $validated['level_id'],
                $request,
                'new'
            );
        });

        return redirect()
            ->route('parent.children.index')
            ->with('success', 'Child account created and its learning subscription is active.');
    }

    public function renew(Request $request, string $childUuid): View
    {
        $child = $request->user()->children()->with(['user.childSubscriptions.package', 'level'])->where('uuid', $childUuid)->firstOrFail();
        $automaticCode = null;

        if ($request->filled('activation')) {
            $automaticCode = $request->user()->activationCodes()
                ->where('uuid', $request->string('activation'))
                ->where('status', ActivationCode::STATUS_UNUSED)
                ->whereIn('intended_use', ['renewal', 'any'])
                ->where(fn ($query) => $query->whereNull('renewal_child_id')->orWhere('renewal_child_id', $child->user_id))
                ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                ->firstOrFail();
        }

        return view('parent.children.renew', [
            'child' => $child,
            'automaticCode' => $automaticCode,
            'packages' => Package::query()
                ->where('is_active', true)
                ->whereNotNull('curriculum_group')
                ->whereHas('levels', fn ($query) => $query->where('level.id', $child->level_id))
                ->with([
                    'levels' => fn ($query) => $query->where('level.id', $child->level_id),
                    'durationOptions' => fn ($query) => $query->where('is_active', true)->whereIn('months', [6, 12])->orderBy('months'),
                ])
                ->whereHas('durationOptions', fn ($query) => $query->where('is_active', true)->whereIn('months', [6, 12]))
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function storeRenewal(Request $request, string $childUuid, ActivationCodeService $service): RedirectResponse
    {
        $validated = $request->validate(['activation_code' => ['required', 'string', 'max:40']]);
        $student = $request->user()->children()->with('user')->where('uuid', $childUuid)->firstOrFail();
        $service->redeem($validated['activation_code'], $request->user(), $student->user, (int) $student->level_id, $request, 'renewal');

        return redirect()->route('parent.children.index')->with('success', 'The child subscription was renewed successfully.');
    }
}
