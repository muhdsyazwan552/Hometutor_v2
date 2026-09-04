<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivationCode;
use App\Models\ActivationCodeAttempt;
use App\Models\Company;
use App\Models\LicenseAdjustmentRequest;
use App\Models\Package;
use App\Models\User;
use App\Services\ActivationCodeService;
use App\Services\OnlinePaymentFulfillmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;

class LicenseManagementController extends Controller
{
    public function index(): View
    {
        return view('admin.licenses.index', [
            'packages' => Package::query()->with('levels')->whereNotNull('curriculum_group')->orderBy('id')->get(),
            'codes' => ActivationCode::query()->with(['purchaser', 'package', 'redeemedByChild', 'generatedBy'])->latest()->limit(100)->get(),
            'attempts' => ActivationCodeAttempt::query()->with('activationCode')->latest()->limit(100)->get(),
            'companies' => Company::query()
                ->withCount('users')
                ->withMax('users as last_registered_at', 'registered_at')
                ->orderByDesc('is_default')
                ->orderBy('name')
                ->get(),
            'licenseRequests' => LicenseAdjustmentRequest::query()
                ->with(['parent', 'requestedBy', 'payment.package', 'activationCode.package', 'activationCode.redeemedByChild', 'childSubscription.child', 'reviewedBy', 'completedBy'])
                ->latest('requested_at')
                ->limit(200)
                ->get(),
        ]);
    }

    public function storeCompany(Request $request): RedirectResponse
    {
        $request->merge([
            'reference_code' => strtoupper(trim((string) $request->input('reference_code'))),
            'code_series' => $this->normalizeCodeSeries((string) $request->input('code_series')),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:companies,name'],
            'reference_code' => ['required', 'string', 'max:50', 'unique:companies,reference_code'],
            'code_series' => ['nullable', 'string', 'min:2', 'max:20', 'regex:/^[A-Z0-9]+$/', 'unique:companies,code_series'],
        ]);

        Company::create([
            'name' => $validated['name'],
            'reference_code' => $validated['reference_code'],
            'code_series' => $validated['code_series'] ?: $validated['reference_code'],
            'is_active' => true,
        ]);

        return back()->with('success', 'Company, registration reference code, and activation-code series were created.');
    }

    public function updateCompanySeries(Request $request, Company $company): RedirectResponse
    {
        $request->merge(['code_series' => $this->normalizeCodeSeries((string) $request->input('code_series'))]);
        $validated = $request->validate([
            'code_series' => ['required', 'string', 'min:2', 'max:20', 'regex:/^[A-Z0-9]+$/', 'unique:companies,code_series,'.$company->id],
        ]);

        $company->update(['code_series' => $validated['code_series']]);

        return back()->with('success', "{$company->name} activation-code series updated.");
    }

    private function normalizeCodeSeries(string $series): string
    {
        return strtoupper((string) preg_replace('/[^A-Z0-9]/i', '', trim($series)));
    }

    public function generate(Request $request, ActivationCodeService $service): RedirectResponse
    {
        $validated = $request->validate([
            'parent_login' => ['required', 'string', 'max:255'],
            'package_id' => ['required', 'integer', 'exists:packages,id'],
            'generation_reason' => ['required', 'string', 'max:2000'],
        ]);
        $parent = User::query()->where('role_id', User::ROLE_PARENT)
            ->where(fn ($query) => $query->where('email', $validated['parent_login'])->orWhere('username', $validated['parent_login']))
            ->firstOrFail();
        $package = Package::query()->where('is_active', true)->findOrFail($validated['package_id']);
        $service->issue($package, $parent, 'admin_manual', generatedBy: $request->user(), reason: $validated['generation_reason']);

        return back()->with('success', 'The code was generated, logged under your admin account, and emailed to the parent. You can also copy it below for WhatsApp.');
    }

    public function testOnlinePayment(Request $request, OnlinePaymentFulfillmentService $service): RedirectResponse
    {
        $validated = $request->validate([
            'parent_login' => ['required', 'string', 'max:255'],
        ]);
        $parent = User::query()->where('role_id', User::ROLE_PARENT)
            ->where(fn ($query) => $query->where('email', $validated['parent_login'])->orWhere('username', $validated['parent_login']))
            ->firstOrFail();
        $package = Package::query()->where('is_active', true)->where('code', 'STD-1-3')->firstOrFail();

        $code = $service->fulfill(
            $parent,
            $package,
            'admin_test',
            'admin-test-'.Str::uuid(),
            $package->price,
            $package->currency,
            ['initiated_by_user_id' => $request->user()->id, 'test_mode' => true],
        );

        $delivery = $code->emailed_at ? 'and the email was sent' : 'but email delivery failed; check the audit log';

        return back()->with('success', "Test online payment completed {$delivery}. The code is visible in the register below.");
    }

    public function revoke(Request $request, string $codeUuid): RedirectResponse
    {
        $validated = $request->validate(['reason' => ['required', 'string', 'max:2000']]);
        $code = ActivationCode::query()->where('uuid', $codeUuid)->where('status', ActivationCode::STATUS_UNUSED)->firstOrFail();
        $code->update(['status' => ActivationCode::STATUS_REVOKED, 'revoked_at' => now(), 'invalid_reason' => $validated['reason']]);

        return back()->with('success', 'Activation code revoked. It can no longer be redeemed.');
    }

    public function updatePackage(Request $request, Package $package): RedirectResponse
    {
        $validated = $request->validate([
            'price' => ['required', 'numeric', 'min:0'],
            'duration_days' => ['required', 'integer', 'min:1', 'max:3650'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $package->update(['price' => $validated['price'], 'duration_days' => $validated['duration_days'], 'is_active' => $request->boolean('is_active')]);

        return back()->with('success', 'Package settings updated.');
    }
}
