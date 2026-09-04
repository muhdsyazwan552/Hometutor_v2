<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\ActivationCode;
use App\Models\PackagePayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PaymentCompletionController extends Controller
{
    public function createChild(Request $request, PackagePayment $payment): RedirectResponse
    {
        abort_unless((int) $payment->parent_id === (int) $request->user()->id, 404);
        abort_unless($payment->status === PackagePayment::STATUS_PAID, 404);

        $code = $payment->activationCode()
            ->where('status', ActivationCode::STATUS_UNUSED)
            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->firstOrFail();

        return redirect()->route('parent.children.create', ['activation' => $code->uuid]);
    }
}
