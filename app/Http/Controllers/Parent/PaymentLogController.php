<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PaymentLogController extends Controller
{
    public function __invoke(Request $request): View
    {
        $parent = $request->user();

        return view('parent.payment-log.index', [
            'payments' => $parent->packagePayments()
                ->with(['package', 'durationOption', 'activationCode.redeemedByChild', 'activationCode.renewalChild.student.level'])
                ->latest('created_at')
                ->paginate(15, ['*'], 'payments_page'),
            'codes' => $parent->activationCodes()
                ->with(['package', 'payment.durationOption', 'redeemedByChild.student.level', 'renewalChild.student.level'])
                ->latest('created_at')
                ->paginate(15, ['*'], 'codes_page'),
        ]);
    }
}
