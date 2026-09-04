<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PackageDurationOption;
use App\Services\CartCheckoutService;
use App\Services\SubscriptionOrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\View\View;

class CartController extends Controller
{
    public function index(Request $request): View
    {
        $order = $request->user()->orders()
            ->where('status', Order::STATUS_DRAFT)
            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->with(['items.package', 'items.durationOption', 'items.level'])
            ->latest('id')
            ->first();

        return view('parent.cart.index', compact('order'));
    }

    public function destroy(Request $request, string $itemUuid, SubscriptionOrderService $orders): RedirectResponse
    {
        $item = OrderItem::query()
            ->where('uuid', $itemUuid)
            ->whereHas('order', fn ($query) => $query->where('parent_id', $request->user()->id)->where('status', Order::STATUS_DRAFT)->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now())))
            ->firstOrFail();
        $orders->removeItem($item, $request->user());

        return back()->with('success', 'The package was removed from your cart.');
    }

    public function edit(Request $request, string $itemUuid): View
    {
        $item = $this->parentDraftItem($request, $itemUuid)->load([
            'package.levels' => fn ($query) => $query->where('is_active', true)->orderBy('id'),
            'package.durationOptions' => fn ($query) => $query->where('is_active', true)->whereIn('months', [6, 12])->orderBy('months'),
            'level',
        ]);

        return view('parent.cart.edit', compact('item'));
    }

    public function update(Request $request, string $itemUuid, SubscriptionOrderService $orders): RedirectResponse
    {
        $item = $this->parentDraftItem($request, $itemUuid)->load('package');
        $request->merge(['username' => strtolower(trim((string) $request->input('username')))]);
        $validated = $request->validate([
            'duration_option_id' => ['required', 'integer', Rule::exists('package_duration_options', 'id')->where(fn ($query) => $query->where('package_id', $item->package_id)->where('is_active', true)->whereIn('months', [6, 12]))],
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'alpha_dash', 'min:4', 'max:40', Rule::unique('users', 'username')],
            'password' => ['nullable', 'confirmed', Password::min(8)],
            'level_id' => ['required', 'integer', Rule::exists('package_level', 'level_id')->where(fn ($query) => $query->where('package_id', $item->package_id))],
            'class_name' => ['nullable', 'string', 'max:50'],
        ]);
        $option = PackageDurationOption::query()
            ->where('package_id', $item->package_id)
            ->where('is_active', true)
            ->whereIn('months', [6, 12])
            ->findOrFail($validated['duration_option_id']);
        $orders->updateNewChildItem($item, $request->user(), $option, $validated);

        return redirect()->route('parent.cart.index')->with('success', 'The child and package details were updated.');
    }

    public function checkout(Request $request, CartCheckoutService $checkout): RedirectResponse
    {
        $order = $request->user()->orders()
            ->where('status', Order::STATUS_DRAFT)
            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->latest('id')
            ->firstOrFail();
        $result = $checkout->checkout($request, $order);

        return $result['receipt_sent']
            ? redirect()->route('parent.children.index')->with('success', 'One payment completed for all cart items. The child accounts were created and a combined receipt was emailed.')
            : redirect()->route('parent.children.index')->with('error', 'The child accounts were created, but the combined receipt email could not be sent.');
    }

    private function parentDraftItem(Request $request, string $itemUuid): OrderItem
    {
        return OrderItem::query()
            ->where('uuid', $itemUuid)
            ->where('item_type', OrderItem::TYPE_NEW)
            ->whereHas('order', fn ($query) => $query->where('parent_id', $request->user()->id)->where('status', Order::STATUS_DRAFT)->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now())))
            ->firstOrFail();
    }
}
