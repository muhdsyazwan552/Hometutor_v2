<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\ActivationCodeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ChildRenewalController extends Controller
{
    public function store(Request $request, ActivationCodeService $service): RedirectResponse
    {
        $validated = $request->validate(['activation_code' => ['required', 'string', 'max:40']]);
        $student = $request->user()->student()->with('parent')->firstOrFail();
        abort_unless($student->parent, 422, 'A parent account must be connected before this code can be redeemed.');

        $service->redeem($validated['activation_code'], $student->parent, $request->user(), (int) $student->level_id, $request, 'renewal');

        return redirect()->route('dashboard')->with('success', 'Your learning subscription was renewed successfully.');
    }
}
