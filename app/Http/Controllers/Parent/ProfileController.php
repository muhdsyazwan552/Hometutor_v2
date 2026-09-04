<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ProfileController extends Controller
{
    public function edit(Request $request): View
    {
        return view('parent.profile.edit', [
            'parent' => $request->user(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'mobile_number' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+()\-\s]+$/'],
        ], [
            'mobile_number.regex' => 'The mobile number may only contain numbers, spaces, +, -, and brackets.',
        ]);

        $request->user()->update([
            'name' => $validated['name'],
            'mobile_number' => $validated['mobile_number'] ?: null,
        ]);

        return back()->with('success', 'Profile details updated successfully.');
    }
}
