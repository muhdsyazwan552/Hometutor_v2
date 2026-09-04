<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\PackageDurationOption;
use App\Models\User;
use App\Services\PackageCheckoutService;
use App\Services\SubscriptionOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\View\View;

class PackageCheckoutController extends Controller
{
    public function create(Request $request, Package $package): View
    {
        abort_unless($package->is_active && $package->curriculum_group, 404);
        $package->load([
            'levels' => fn ($query) => $query->where('is_active', true)->orderBy('id'),
            'durationOptions' => fn ($query) => $query->where('is_active', true)->whereIn('months', [6, 12])->orderBy('months'),
        ]);
        abort_if($package->durationOptions->isEmpty() || $package->levels->isEmpty(), 404);

        return view('parent.checkout.create', [
            'package' => $package,
            'cartMode' => $request->boolean('cart'),
        ]);
    }

    public function usernameAvailability(Request $request): JsonResponse
    {
        $request->merge(['username' => strtolower(trim((string) $request->input('username')))]);
        $validated = $request->validate(['username' => ['required', 'alpha_dash', 'min:4', 'max:40']]);

        return response()->json([
            'available' => ! User::query()->where('username', strtolower($validated['username']))->exists()
                && ! \App\Models\UsernameReservation::query()
                    ->where('username', strtolower($validated['username']))
                    ->whereNull('released_at')
                    ->where('expires_at', '>', now())
                    ->exists(),
        ]);
    }

    public function store(Request $request, Package $package, PackageCheckoutService $checkout): RedirectResponse
    {
        abort_unless($package->is_active && $package->curriculum_group, 404);
        $request->merge(['username' => strtolower(trim((string) $request->input('username')))]);
        $validated = $request->validate([
            'duration_option_id' => ['required', 'integer', Rule::exists('package_duration_options', 'id')->where(fn ($query) => $query->where('package_id', $package->id)->where('is_active', true)->whereIn('months', [6, 12]))],
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'alpha_dash', 'min:4', 'max:40', Rule::unique('users', 'username')],
            'password' => ['required', 'confirmed', Password::min(8)],
            'level_id' => ['required', 'integer', Rule::exists('package_level', 'level_id')->where(fn ($query) => $query->where('package_id', $package->id))],
        ]);

        $option = PackageDurationOption::query()->where('package_id', $package->id)->where('is_active', true)->whereIn('months', [6, 12])->findOrFail($validated['duration_option_id']);
        $result = $checkout->purchase($request, $package, $option, $validated);

        $redirect = redirect()->route('parent.children.index');

        return $result['receipt_sent']
            ? $redirect->with('success', 'Payment submitted. The child account and subscription were created, and the receipt was sent by email.')
            : $redirect->with('error', 'The child account is ready, but the receipt email could not be sent. Please contact support for the receipt.');
    }

    public function storeRenewal(Request $request, string $childUuid, Package $package, PackageCheckoutService $checkout): RedirectResponse
    {
        abort_unless($package->is_active && $package->curriculum_group, 404);
        $student = $request->user()->children()->with(['user', 'level'])->where('uuid', $childUuid)->firstOrFail();
        abort_unless($package->levels()->where('level.id', $student->level_id)->exists(), 404);

        $validated = $request->validate([
            'duration_option_id' => [
                'required',
                'integer',
                Rule::exists('package_duration_options', 'id')->where(fn ($query) => $query
                    ->where('package_id', $package->id)
                    ->where('is_active', true)
                    ->whereIn('months', [6, 12])),
            ],
        ]);

        $option = PackageDurationOption::query()
            ->where('package_id', $package->id)
            ->where('is_active', true)
            ->whereIn('months', [6, 12])
            ->findOrFail($validated['duration_option_id']);
        $result = $checkout->purchaseRenewal($request, $student, $package, $option);

        $redirect = redirect()->route('parent.children.renew', [
            'childUuid' => $student->uuid,
            'activation' => $result['code']->uuid,
        ]);

        return $result['receipt_sent']
            ? $redirect->with('success', 'Payment recorded. Your renewal code and receipt were sent by email. Enter the included code below to renew the child subscription.')
            : $redirect->with('error', 'Payment and renewal code were created, but the receipt email could not be sent. You can still use the code shown below.');
    }

    public function addToCart(Request $request, Package $package, SubscriptionOrderService $orders): RedirectResponse
    {
        abort_unless($package->is_active && $package->curriculum_group, 404);
        $request->merge(['username' => strtolower(trim((string) $request->input('username')))]);
        $validated = $request->validate([
            'duration_option_id' => ['required', 'integer', Rule::exists('package_duration_options', 'id')->where(fn ($query) => $query->where('package_id', $package->id)->where('is_active', true)->whereIn('months', [6, 12]))],
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'alpha_dash', 'min:4', 'max:40', Rule::unique('users', 'username')],
            'password' => ['required', 'confirmed', Password::min(8)],
            'level_id' => ['required', 'integer', Rule::exists('package_level', 'level_id')->where(fn ($query) => $query->where('package_id', $package->id))],
        ]);

        $option = PackageDurationOption::query()
            ->where('package_id', $package->id)
            ->where('is_active', true)
            ->whereIn('months', [6, 12])
            ->findOrFail($validated['duration_option_id']);
        $orders->addNewChildItem($orders->draftFor($request->user()), $package, $validated, $option);

        return redirect()->route('parent.cart.index')->with('success', 'Package and child details were added to your cart.');
    }
}
