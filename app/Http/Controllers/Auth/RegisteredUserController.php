<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Company;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', Rules\Password::defaults()],
            'reference_code' => ['nullable', 'string', 'max:50'],
        ]);

        $referenceCode = strtoupper(trim((string) $request->input('reference_code')));
        $company = $referenceCode === ''
            ? Company::default()
            : Company::query()->where('reference_code', $referenceCode)->where('is_active', true)->first();

        if (! $company) {
            return back()->withErrors(['reference_code' => 'This reference code is not valid.'])->onlyInput('name', 'email', 'reference_code');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'display_name' => $request->name,
            'role_id' => User::ROLE_PARENT,
            'is_active' => true,
            'company_id' => $company->id,
            'registration_reference_code' => $referenceCode ?: null,
            'registered_at' => now(),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return Inertia::location(route('parent.dashboard', absolute: false));
    }
}
