<?php

namespace App\Http\Controllers\CodeManager;

use App\Http\Controllers\Controller;
use App\Models\ActivationCode;
use App\Models\ActivationCodeBatch;
use App\Models\Company;
use App\Models\Package;
use App\Models\PackageDurationOption;
use App\Models\Student;
use App\Models\User;
use App\Services\ActivationCodeService;
use App\Models\LicenseAdjustmentRequest;
use App\Services\LicenseAdjustmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class ActivationCodeController extends Controller
{
    public function individualPage(): View
    {
        return view('code-manager.individual', [
            'packages' => Package::query()->with(['levels', 'durationOptions' => fn ($query) => $query->where('is_active', true)->orderBy('months')])->where('is_active', true)->whereNotNull('curriculum_group')->orderBy('name')->get(),
        ]);
    }

    public function bulkPage(): View
    {
        return view('code-manager.bulk', [
            'packages' => Package::query()->with(['durationOptions' => fn ($query) => $query->where('is_active', true)])->where('is_active', true)->whereNotNull('curriculum_group')->orderBy('name')->get(),
            'companies' => Company::query()->where('is_active', true)->orderBy('name')->get(),
            'batches' => ActivationCodeBatch::query()
                ->with(['company', 'package', 'durationOption', 'creator'])
                ->withCount([
                    'activationCodes',
                    'activationCodes as unused_codes_count' => fn ($query) => $query->where('status', ActivationCode::STATUS_UNUSED),
                    'activationCodes as redeemed_codes_count' => fn ($query) => $query->where('status', ActivationCode::STATUS_REDEEMED),
                ])
                ->latest()->paginate(20),
        ]);
    }

    public function registerPage(Request $request, ActivationCodeService $service): View
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(['unused', 'redeemed', 'revoked', 'expired'])],
            'intended_use' => ['nullable', Rule::in(['new', 'renewal', 'any'])],
            'package_id' => ['nullable', 'integer', 'exists:packages,id'],
            'series_prefix' => ['nullable', 'string', 'max:20'],
            'source' => ['nullable', 'string', 'max:40'],
            'created_from' => ['nullable', 'date'],
            'created_to' => ['nullable', 'date', 'after_or_equal:created_from'],
            'expires_from' => ['nullable', 'date'],
            'expires_to' => ['nullable', 'date', 'after_or_equal:expires_from'],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $codes = ActivationCode::query()
            ->with(['package', 'payment', 'purchaser', 'generatedBy', 'batch.company', 'redeemedByChild.student', 'renewalChild.student', 'subscription', 'licenseAdjustmentRequests' => fn ($query) => $query->latest()])
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['intended_use'] ?? null, fn ($query, $purpose) => $query->where('intended_use', $purpose))
            ->when($filters['package_id'] ?? null, fn ($query, $packageId) => $query->where('package_id', $packageId))
            ->when($filters['series_prefix'] ?? null, fn ($query, $series) => $query->where('series_prefix', strtoupper($series)))
            ->when($filters['source'] ?? null, fn ($query, $source) => $query->where('source', $source))
            ->when($filters['created_from'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['created_to'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '<=', $date))
            ->when($filters['expires_from'] ?? null, fn ($query, $date) => $query->whereDate('expires_at', '>=', $date))
            ->when($filters['expires_to'] ?? null, fn ($query, $date) => $query->whereDate('expires_at', '<=', $date))
            ->when($filters['search'] ?? null, function ($query, $search) use ($service): void {
                $term = '%'.trim($search).'%';
                $normalized = $service->normalize($search);
                $fingerprint = $normalized !== '' ? $service->fingerprint($normalized) : null;
                $lastFour = '%'.substr($normalized, -4).'%';
                $series = '%'.strtoupper(trim($search)).'%';
                $query->where(function ($nested) use ($term, $fingerprint, $lastFour, $series): void {
                    $nested->when($fingerprint, fn ($codeQuery) => $codeQuery->where('code_hash', $fingerprint))
                        ->orWhere('code_last_four', 'like', $lastFour)
                        ->orWhere('series_prefix', 'like', $series)
                        ->orWhere('generation_reason', 'like', $term)
                        ->orWhereHas('package', fn ($package) => $package->where('name', 'like', $term)->orWhere('code', 'like', $term))
                        ->orWhereHas('generatedBy', fn ($user) => $user->where('email', 'like', $term)->orWhere('username', 'like', $term)->orWhere('name', 'like', $term))
                        ->orWhereHas('purchaser', fn ($user) => $user->where('email', 'like', $term)->orWhere('username', 'like', $term)->orWhere('name', 'like', $term))
                        ->orWhereHas('redeemedByChild', fn ($user) => $user->where('username', 'like', $term)->orWhere('name', 'like', $term))
                        ->orWhereHas('batch', fn ($batch) => $batch->where('reference', 'like', $term)->orWhere('event_name', 'like', $term)->orWhereHas('company', fn ($company) => $company->where('name', 'like', $term)));
                });
            })
            ->latest()->paginate(20)->withQueryString();

        return view('code-manager.register', [
            'codes' => $codes,
            'packages' => Package::query()->where('is_active', true)->whereNotNull('curriculum_group')->orderBy('name')->get(),
            'seriesPrefixes' => ActivationCode::query()->select('series_prefix')->whereNotNull('series_prefix')->distinct()->orderBy('series_prefix')->pluck('series_prefix'),
            'sources' => ActivationCode::query()->select('source')->whereNotNull('source')->distinct()->orderBy('source')->pluck('source'),
            'stats' => [
                'total' => ActivationCode::query()->count(),
                'unused' => ActivationCode::query()->where('status', ActivationCode::STATUS_UNUSED)->count(),
                'redeemed' => ActivationCode::query()->where('status', ActivationCode::STATUS_REDEEMED)->count(),
                'renewal' => ActivationCode::query()->where('intended_use', 'renewal')->count(),
            ],
            'filters' => $filters,
        ]);
    }

    public function index(): View
    {
        $weeklyStart = now()->startOfWeek()->subWeeks(7);
        $monthlyStart = now()->startOfMonth()->subMonths(11);
        $generatedDates = ActivationCode::query()
            ->where('created_at', '>=', $monthlyStart)
            ->get(['created_at']);

        $weekly = collect(range(0, 7))->map(function (int $offset) use ($weeklyStart, $generatedDates): array {
            $start = $weeklyStart->copy()->addWeeks($offset);
            $end = $start->copy()->endOfWeek();

            return [
                'label' => $start->format('d M'),
                'value' => $generatedDates->filter(fn ($code) => $code->created_at->between($start, $end))->count(),
            ];
        });

        $monthly = collect(range(0, 11))->map(function (int $offset) use ($monthlyStart, $generatedDates): array {
            $month = $monthlyStart->copy()->addMonths($offset);

            return [
                'label' => $month->format('M Y'),
                'value' => $generatedDates->filter(fn ($code) => $code->created_at->isSameMonth($month))->count(),
            ];
        });

        $total = ActivationCode::query()->count();
        $redeemed = ActivationCode::query()->where('status', ActivationCode::STATUS_REDEEMED)->count();

        return view('code-manager.index', [
            'weeklyChart' => $weekly,
            'monthlyChart' => $monthly,
            'recentCodes' => ActivationCode::query()->with(['package', 'purchaser', 'batch.company'])->latest()->limit(10)->get(),
            'batches' => ActivationCodeBatch::query()
                ->with(['company', 'package', 'durationOption', 'creator'])
                ->withCount([
                    'activationCodes',
                    'activationCodes as unused_codes_count' => fn ($query) => $query->where('status', ActivationCode::STATUS_UNUSED),
                    'activationCodes as redeemed_codes_count' => fn ($query) => $query->where('status', ActivationCode::STATUS_REDEEMED),
                ])
                ->latest()->limit(6)->get(),
            'seriesBreakdown' => ActivationCode::query()
                ->select('series_prefix', DB::raw('COUNT(*) as total'))
                ->groupBy('series_prefix')
                ->orderByDesc('total')
                ->get(),
            'stats' => [
                'total' => $total,
                'unused' => ActivationCode::query()->where('status', ActivationCode::STATUS_UNUSED)->count(),
                'redeemed' => $redeemed,
                'generated_week' => ActivationCode::query()->where('created_at', '>=', now()->startOfWeek())->count(),
                'generated_month' => ActivationCode::query()->where('created_at', '>=', now()->startOfMonth())->count(),
                'redemption_rate' => $total > 0 ? round(($redeemed / $total) * 100, 1) : 0,
            ],
        ]);
    }

    public function store(Request $request, ActivationCodeService $service): RedirectResponse
    {
        $validated = $request->validate([
            'parent_login' => ['required', 'string', 'max:255'],
            'package_id' => ['required', 'integer', 'exists:packages,id'],
            'intended_use' => ['required', Rule::in(['new', 'renewal'])],
            'child_login' => ['nullable', 'required_if:intended_use,renewal', 'string', 'max:255'],
            'duration_option_id' => ['nullable', 'integer'],
            'receipt' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'generation_reason' => ['required', 'string', 'max:1000'],
            'return_to' => ['nullable', Rule::in(['individual', 'register'])],
        ]);

        $parent = User::query()->where('role_id', User::ROLE_PARENT)
            ->where(fn ($query) => $query->where('email', $validated['parent_login'])->orWhere('username', $validated['parent_login']))
            ->first();
        if (! $parent) {
            throw ValidationException::withMessages(['parent_login' => 'No parent account matches that email or username.']);
        }

        $package = Package::query()->with('levels')->where('is_active', true)->findOrFail($validated['package_id']);
        $durationOption = null;
        if ($validated['duration_option_id'] ?? null) {
            $durationOption = PackageDurationOption::query()
                ->where('package_id', $package->id)
                ->where('is_active', true)
                ->find($validated['duration_option_id']);
            if (! $durationOption) {
                throw ValidationException::withMessages(['duration_option_id' => 'Select a valid duration for the selected package.']);
            }
        }
        $renewalChild = null;

        if ($validated['intended_use'] === 'renewal') {
            $student = Student::query()->with(['user', 'level'])
                ->where('parent_id', $parent->id)
                ->whereHas('user', fn ($query) => $query->where('username', $validated['child_login'])->orWhere('email', $validated['child_login']))
                ->first();
            if (! $student) {
                throw ValidationException::withMessages(['child_login' => 'That child is not connected to the selected parent.']);
            }
            if (! $package->levels->contains('id', $student->level_id)) {
                throw ValidationException::withMessages(['package_id' => 'This package does not support the child’s current level.']);
            }
            $renewalChild = $student->user;
        }

        $code = $service->issue(
            $package,
            $parent,
            'code_manager',
            generatedBy: $request->user(),
            reason: $validated['generation_reason'],
            intendedUse: $validated['intended_use'],
            renewalChild: $renewalChild,
            durationDays: $durationOption?->duration_days,
            purchaseAmount: $durationOption?->price,
        );

        if ($request->hasFile('receipt')) {
            $path = $request->file('receipt')->store('activation-receipts');
            $code->update(['metadata' => [
                'receipt_path' => $path,
                'receipt_original_name' => $request->file('receipt')->getClientOriginalName(),
                'duration_months' => $durationOption?->months,
            ]]);
        }

        $mailStatus = $code->emailed_at ? 'Email sent.' : 'Email was not delivered; copy the code from the register.';

        $returnRoute = match ($validated['return_to'] ?? null) {
            'individual' => 'code-manager.individual.index',
            'register' => 'code-manager.register.index',
            default => 'code-manager.index',
        };

        return redirect()->route($returnRoute)->with('success', "Activation code generated. {$mailStatus}");
    }

    public function storeBulk(Request $request, ActivationCodeService $service): RedirectResponse
    {
        $request->merge(['series_prefix' => strtoupper((string) preg_replace('/[^A-Z0-9]/i', '', trim((string) $request->input('series_prefix'))))]);

        $validated = $request->validate([
            'source_type' => ['required', Rule::in([ActivationCodeBatch::SOURCE_COMPANY, ActivationCodeBatch::SOURCE_EVENT])],
            'company_id' => ['nullable', 'required_if:source_type,company', Rule::exists('companies', 'id')->where('is_active', true)],
            'event_name' => ['nullable', 'required_if:source_type,event', 'string', 'max:255'],
            'package_id' => ['required', Rule::exists('packages', 'id')->where('is_active', true)],
            'duration_months' => ['required', 'integer', 'min:1', 'max:120'],
            'quantity' => ['required', 'integer', 'min:1', 'max:10000'],
            'series_prefix' => ['nullable', 'string', 'min:2', 'max:20', 'regex:/^[A-Z0-9]+$/'],
            'return_to' => ['nullable', Rule::in(['bulk'])],
        ]);

        $package = Package::query()->where('is_active', true)->findOrFail($validated['package_id']);
        $months = (int) $validated['duration_months'];
        $durationDays = (int) round($months * 365 / 12);
        $expiresAt = now()->addMonths($months)->endOfDay();

        $batch = DB::transaction(function () use ($request, $validated, $package, $months, $durationDays, $expiresAt, $service): ActivationCodeBatch {
            $batch = ActivationCodeBatch::create([
                'reference' => 'BATCH-'.now()->format('Ymd-His').'-'.Str::upper(Str::random(5)),
                'series_prefix' => $validated['series_prefix'] ?? 'HT',
                'source_type' => $validated['source_type'],
                'company_id' => $validated['source_type'] === ActivationCodeBatch::SOURCE_COMPANY ? $validated['company_id'] : null,
                'event_name' => $validated['source_type'] === ActivationCodeBatch::SOURCE_EVENT ? trim($validated['event_name']) : null,
                'package_id' => $package->id,
                'package_duration_option_id' => null,
                'quantity' => (int) $validated['quantity'],
                'status' => 'completed',
                'expires_at' => $expiresAt,
                'created_by_user_id' => $request->user()->id,
                'metadata' => ['duration_months' => $months],
            ]);

            $service->issueBulk($batch, $package, $request->user(), $durationDays);

            return $batch;
        });

        return redirect()->route(($validated['return_to'] ?? null) === 'bulk' ? 'code-manager.bulk.index' : 'code-manager.index')->with('success', number_format($batch->quantity).' activation codes generated in batch '.$batch->reference.'. Use Export CSV to download them.');
    }

    public function exportBatch(ActivationCodeBatch $batch)
    {
        $filename = Str::slug($batch->reference).'.csv';

        return response()->streamDownload(function () use ($batch): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Activation Code', 'Batch', 'Source', 'Company / Event', 'Package', 'Duration', 'Status', 'Expires At']);
            $batch->activationCodes()->with('package')->orderBy('id')->chunk(250, function ($codes) use ($handle, $batch): void {
                foreach ($codes as $code) {
                    fputcsv($handle, [
                        $code->code_value,
                        $batch->reference,
                        ucfirst($batch->source_type),
                        $batch->company?->name ?? $batch->event_name,
                        $code->package->name,
                        (data_get($batch->metadata, 'duration_months') ? data_get($batch->metadata, 'duration_months').' months' : $code->duration_days.' days'),
                        $code->status,
                        $code->expires_at?->format('Y-m-d H:i:s'),
                    ]);
                }
            });
            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function resend(Request $request, string $codeUuid, ActivationCodeService $service): RedirectResponse
    {
        $code = ActivationCode::query()->where('uuid', $codeUuid)->where('status', ActivationCode::STATUS_UNUSED)->firstOrFail();
        $service->resend($code, $request->user());

        return back()->with($code->fresh()->emailed_at ? 'success' : 'error', $code->fresh()->emailed_at ? 'Activation-code email sent.' : 'Email delivery failed. The code remains valid and can be copied.');
    }

    public function revoke(Request $request, string $codeUuid): RedirectResponse
    {
        $validated = $request->validate(['reason' => ['required', 'string', 'max:1000']]);
        $code = ActivationCode::query()->where('uuid', $codeUuid)->where('status', ActivationCode::STATUS_UNUSED)->firstOrFail();
        $code->update(['status' => ActivationCode::STATUS_REVOKED, 'revoked_at' => now(), 'invalid_reason' => $validated['reason']]);

        return back()->with('success', 'The unused code was revoked.');
    }

    public function recordParentRequest(Request $request, string $codeUuid, LicenseAdjustmentService $service): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in([LicenseAdjustmentRequest::TYPE_REFUND, LicenseAdjustmentRequest::TYPE_CANCELLATION])],
            'contact_method' => ['required', Rule::in(['email', 'phone', 'whatsapp', 'in_person', 'other'])],
            'reason' => ['required', 'string', 'min:10', 'max:2000'],
        ]);
        $code = ActivationCode::query()->where('uuid', $codeUuid)->firstOrFail();
        $adjustment = $service->recordParentRequest(
            $code,
            $request->user(),
            $validated['type'],
            $validated['reason'],
            $validated['contact_method'],
        );

        return back()->with('success', ucfirst($adjustment->type).' request recorded for the parent and sent for administrator review.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::min(10)->letters()->mixedCase()->numbers()],
        ]);
        $request->user()->update(['password' => $validated['password']]);

        return back()->with('success', 'Your Code Manager password was changed successfully.');
    }
}
