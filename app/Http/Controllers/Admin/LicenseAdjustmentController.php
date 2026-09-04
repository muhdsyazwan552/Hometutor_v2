<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LicenseAdjustmentRequest;
use App\Services\LicenseAdjustmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LicenseAdjustmentController extends Controller
{
    public function approve(Request $request, LicenseAdjustmentRequest $licenseRequest, LicenseAdjustmentService $service): RedirectResponse
    {
        $validated = $request->validate(['admin_notes' => ['nullable', 'string', 'max:2000']]);
        $result = $service->approve($licenseRequest, $request->user(), $validated['admin_notes'] ?? null);

        return back()->with('success', $result->status === LicenseAdjustmentRequest::STATUS_APPROVED
            ? 'Request approved, child access was cancelled, and the refund is due within 30 working days.'
            : 'Cancellation completed with no refund. Any attached licence access was cancelled.');
    }

    public function reject(Request $request, LicenseAdjustmentRequest $licenseRequest, LicenseAdjustmentService $service): RedirectResponse
    {
        $validated = $request->validate(['admin_notes' => ['required', 'string', 'min:5', 'max:2000']]);
        $service->reject($licenseRequest, $request->user(), $validated['admin_notes']);

        return back()->with('success', 'Request rejected and the parent log was updated.');
    }

    public function complete(Request $request, LicenseAdjustmentRequest $licenseRequest, LicenseAdjustmentService $service): RedirectResponse
    {
        $validated = $request->validate([
            'refund_reference' => ['required', 'string', 'max:255', 'unique:license_adjustment_requests,refund_reference'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);
        $service->completeRefund($licenseRequest, $request->user(), $validated['refund_reference'], $validated['admin_notes'] ?? null);

        return back()->with('success', 'Refund payment recorded as completed.');
    }
}
