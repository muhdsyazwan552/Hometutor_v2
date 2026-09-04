<?php

namespace App\Http\Controllers\CodeManager;

use App\Http\Controllers\Controller;
use App\Mail\AssistedChildAccountCreated;
use App\Models\Level;
use App\Models\Package;
use App\Models\PackageDurationOption;
use App\Models\Student;
use App\Models\User;
use App\Services\ActivationCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;
use Throwable;

class AssistedChildController extends Controller
{
    public function create(): View
    {
        return view('code-manager.assisted-child', [
            'packages' => Package::query()
                ->with(['levels', 'durationOptions' => fn ($query) => $query->where('is_active', true)->orderBy('months')])
                ->where('is_active', true)
                ->whereNotNull('curriculum_group')
                ->orderBy('name')
                ->get(),
            'levels' => Level::query()->where('is_active', true)->orderBy('id')->get(['id', 'name']),
        ]);
    }

    public function searchParent(Request $request): JsonResponse
    {
        $validated = $request->validate(['q' => ['required', 'string', 'min:2', 'max:255']]);
        $term = '%'.trim($validated['q']).'%';
        $parents = User::query()
            ->with('company:id,name')
            ->where('role_id', User::ROLE_PARENT)
            ->where(fn ($query) => $query->where('username', 'like', $term)->orWhere('email', 'like', $term))
            ->orderBy('name')
            ->limit(10)
            ->get()
            ->map(fn (User $parent) => [
                'id' => $parent->id,
                'name' => $parent->name,
                'username' => $parent->username,
                'email' => $parent->email,
                'company' => $parent->company?->name,
            ]);

        return response()->json(['parents' => $parents]);
    }

    public function checkCode(Request $request, ActivationCodeService $service): JsonResponse
    {
        $validated = $request->validate([
            'parent_id' => ['required', 'integer'],
            'activation_code' => ['required', 'string', 'max:60'],
        ]);
        $parent = User::query()->where('role_id', User::ROLE_PARENT)->findOrFail($validated['parent_id']);
        $code = $service->validateForParent($validated['activation_code'], $parent, request: $request, action: 'assisted_child_validate');

        return response()->json([
            'valid' => true,
            'package' => ['id' => $code->package->id, 'name' => $code->package->name],
            'duration_days' => $code->duration_days,
            'duration_months' => data_get($code->metadata, 'duration_months') ?: (int) round($code->duration_days / (365 / 12)),
            'levels' => $code->package->levels->map(fn ($level) => ['id' => $level->id, 'name' => $level->name])->values(),
        ]);
    }

    public function store(Request $request, ActivationCodeService $service): RedirectResponse
    {
        $validated = $request->validate([
            'parent_id' => ['required', 'integer'],
            'has_code' => ['required', Rule::in(['yes', 'no'])],
            'activation_code' => ['nullable', 'required_if:has_code,yes', 'string', 'max:60'],
            'package_id' => ['nullable', 'required_if:has_code,no', 'integer', 'exists:packages,id'],
            'duration_option_id' => ['nullable', 'required_if:has_code,no', 'integer'],
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'alpha_dash', 'min:4', 'max:40', 'unique:users,username'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'level_id' => ['required', 'integer', 'exists:level,id'],
        ]);

        $parent = User::query()->where('role_id', User::ROLE_PARENT)->findOrFail($validated['parent_id']);
        $manager = $request->user();

        $result = DB::transaction(function () use ($request, $validated, $parent, $manager, $service): array {
            if ($validated['has_code'] === 'yes') {
                $code = $service->validateForParent(
                    $validated['activation_code'],
                    $parent,
                    (int) $validated['level_id'],
                    $request,
                    'assisted_child_validate'
                );
            } else {
                $package = Package::query()->with('levels')->where('is_active', true)->findOrFail($validated['package_id']);
                $option = PackageDurationOption::query()
                    ->where('package_id', $package->id)
                    ->where('is_active', true)
                    ->find($validated['duration_option_id']);
                if (! $option) {
                    throw ValidationException::withMessages(['duration_option_id' => 'Select a valid duration for the selected package.']);
                }
                if (! $package->levels->contains('id', (int) $validated['level_id'])) {
                    throw ValidationException::withMessages(['level_id' => 'The selected package does not support this child level.']);
                }

                $code = $service->issue(
                    package: $package,
                    parent: $parent,
                    source: 'code_manager_assisted_child',
                    generatedBy: $manager,
                    reason: 'Automatically generated while Code Manager created a child account.',
                    intendedUse: 'new',
                    durationDays: $option->duration_days,
                    purchaseAmount: $option->price,
                    sendEmail: false,
                );
                $code->update(['metadata' => ['duration_months' => $option->months, 'assisted_child_creation' => true]]);
            }

            $child = User::create([
                'name' => $validated['name'],
                'display_name' => $validated['name'],
                'username' => Str::lower($validated['username']),
                'email' => Str::lower($validated['username']).'@children.hometutor.local',
                'password' => Hash::make($validated['password']),
                'role_id' => User::ROLE_CHILD,
                'is_active' => true,
            ]);

            Student::create([
                'user_id' => $child->id,
                'parent_id' => $parent->id,
                'code' => 'HT-'.Str::upper(Str::random(10)),
                'full_name' => $validated['name'],
                'level_id' => $validated['level_id'],
                'class_name' => collect(['Aurora', 'Cedar', 'Comet', 'Falcon', 'Maple', 'Nova', 'Orchid', 'Ruby'])->random(),
            ]);

            $subscription = $service->redeem(
                $code->code_value,
                $parent,
                $child,
                (int) $validated['level_id'],
                $request,
                'new',
            );

            return compact('child', 'code', 'subscription');
        });

        $emailSent = true;
        try {
            Mail::to($parent->email)->send(new AssistedChildAccountCreated(
                $parent,
                $result['child']->load('student.level'),
                $validated['password'],
                $result['code']->load('package'),
                $result['subscription'],
            ));
        } catch (Throwable $exception) {
            report($exception);
            $emailSent = false;
        }

        return redirect()->route('code-manager.assisted-child.create')->with(
            $emailSent ? 'success' : 'error',
            $emailSent
                ? 'Child account created, licence activated, and complete login details emailed to the parent.'
                : 'Child account and licence were created, but the email could not be delivered. Contact the parent securely.',
        );
    }
}
