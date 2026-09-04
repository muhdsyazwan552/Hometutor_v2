<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Package;
use App\Models\PackageDurationOption;
use App\Models\User;
use App\Models\UsernameReservation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

/**
 * Builds a provider-neutral order. It does not collect payment or fulfil items.
 * A future payment callback will mark the order paid and fulfil these items.
 */
class SubscriptionOrderService
{
    public function draftFor(User $parent): Order
    {
        return $parent->orders()
            ->where('status', Order::STATUS_DRAFT)
            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->latest('id')
            ->first() ?? $this->createDraft($parent);
    }

    public function createDraft(User $parent, string $currency = 'MYR'): Order
    {
        return Order::create([
            'parent_id' => $parent->id,
            'status' => Order::STATUS_DRAFT,
            'currency' => strtoupper($currency),
            'expires_at' => now()->addHours(2),
        ]);
    }

    public function addNewChildItem(Order $order, Package $package, array $child, ?PackageDurationOption $durationOption = null): OrderItem
    {
        $username = strtolower(trim((string) ($child['username'] ?? '')));
        $password = (string) ($child['password'] ?? '');

        if ($username === '' || $password === '') {
            throw new InvalidArgumentException('A username and password are required for a new child order item.');
        }

        return DB::transaction(function () use ($order, $package, $child, $durationOption, $username, $password) {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);
            if ($order->status !== Order::STATUS_DRAFT || ($order->expires_at && $order->expires_at->isPast())) {
                throw ValidationException::withMessages(['cart' => 'This cart is no longer available.']);
            }
            [$durationDays, $price, $currency] = $this->packageTerms($package, $durationOption);
            if (strtoupper($currency) !== strtoupper($order->currency)) {
                throw ValidationException::withMessages(['cart' => 'All cart packages must use the same currency.']);
            }
            $item = $order->items()->create([
                'item_type' => OrderItem::TYPE_NEW,
                'fulfillment_status' => OrderItem::FULFILLMENT_PENDING,
                'package_id' => $package->id,
                'package_duration_option_id' => $durationOption?->id,
                'package_name_snapshot' => $package->name,
                'duration_days' => $durationDays,
                'unit_price' => $price,
                'total' => $price,
                'currency' => $currency,
                'new_child_name' => $child['name'] ?? null,
                'new_child_username' => $username,
                'new_child_password_hash' => Hash::make($password),
                'new_child_level_id' => $child['level_id'] ?? null,
                'new_child_class_name' => $child['class_name'] ?? null,
            ]);

            $this->reserveUsername($username, $item);

            $this->recalculateTotals($order);

            return $item;
        });
    }

    public function removeItem(OrderItem $item, User $parent): void
    {
        DB::transaction(function () use ($item, $parent): void {
            $item = OrderItem::query()
                ->whereKey($item->id)
                ->whereHas('order', fn ($query) => $query->where('parent_id', $parent->id)->where('status', Order::STATUS_DRAFT))
                ->lockForUpdate()
                ->firstOrFail();
            $order = Order::query()->lockForUpdate()->findOrFail($item->order_id);
            $item->usernameReservation?->update(['released_at' => now()]);
            $item->delete();
            $this->recalculateTotals($order);
        });
    }

    public function updateNewChildItem(OrderItem $item, User $parent, PackageDurationOption $durationOption, array $child): OrderItem
    {
        return DB::transaction(function () use ($item, $parent, $durationOption, $child): OrderItem {
            $item = OrderItem::query()
                ->with('package')
                ->whereKey($item->id)
                ->where('item_type', OrderItem::TYPE_NEW)
                ->whereHas('order', fn ($query) => $query->where('parent_id', $parent->id)->where('status', Order::STATUS_DRAFT)->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now())))
                ->lockForUpdate()
                ->firstOrFail();
            $order = Order::query()->lockForUpdate()->findOrFail($item->order_id);
            [$durationDays, $price, $currency] = $this->packageTerms($item->package, $durationOption);
            $username = strtolower(trim((string) $child['username']));

            if (strtoupper($currency) !== strtoupper($order->currency)) {
                throw ValidationException::withMessages(['cart' => 'All cart packages must use the same currency.']);
            }

            if ($username !== $item->new_child_username) {
                $item->usernameReservation?->update(['released_at' => now()]);
            }

            $changes = [
                'package_duration_option_id' => $durationOption->id,
                'duration_days' => $durationDays,
                'unit_price' => $price,
                'total' => $price,
                'currency' => $currency,
                'new_child_name' => $child['name'],
                'new_child_username' => $username,
                'new_child_level_id' => $child['level_id'],
                'new_child_class_name' => $child['class_name'] ?? null,
            ];

            if (! empty($child['password'])) {
                $changes['new_child_password_hash'] = Hash::make($child['password']);
            }

            $item->update($changes);
            $this->reserveUsername($username, $item);
            $this->recalculateTotals($order);

            return $item->fresh(['package', 'durationOption', 'level']);
        });
    }

    public function addRenewalItem(Order $order, User $child, Package $package, ?PackageDurationOption $durationOption = null): OrderItem
    {
        return DB::transaction(function () use ($order, $child, $package, $durationOption) {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);
            $child->loadMissing('student');

            if ((int) $child->student?->parent_id !== (int) $order->parent_id) {
                throw new InvalidArgumentException('The selected child does not belong to this parent order.');
            }

            [$durationDays, $price, $currency] = $this->packageTerms($package, $durationOption);
            $item = $order->items()->create([
                'item_type' => OrderItem::TYPE_RENEWAL,
                'fulfillment_status' => OrderItem::FULFILLMENT_PENDING,
                'child_user_id' => $child->id,
                'package_id' => $package->id,
                'package_duration_option_id' => $durationOption?->id,
                'package_name_snapshot' => $package->name,
                'duration_days' => $durationDays,
                'unit_price' => $price,
                'total' => $price,
                'currency' => $currency,
            ]);

            $this->recalculateTotals($order);

            return $item;
        });
    }

    private function packageTerms(Package $package, ?PackageDurationOption $durationOption): array
    {
        if ($durationOption && (int) $durationOption->package_id !== (int) $package->id) {
            throw new InvalidArgumentException('The selected duration does not belong to this package.');
        }

        return [
            $durationOption?->duration_days ?? $package->duration_days,
            $durationOption?->price ?? $package->price,
            $durationOption?->currency ?? $package->currency,
        ];
    }

    private function reserveUsername(string $username, OrderItem $item): void
    {
        if (User::query()->where('username', $username)->exists()) {
            throw ValidationException::withMessages(['username' => 'That username is already in use.']);
        }

        $reservation = UsernameReservation::query()->where('username', $username)->lockForUpdate()->first();

        if ($reservation && (int) $reservation->order_item_id !== (int) $item->id && ! $reservation->released_at && $reservation->expires_at->isFuture()) {
            throw ValidationException::withMessages(['username' => 'That username is temporarily reserved by another cart.']);
        }

        if ($reservation) {
            $reservation->update([
                'order_item_id' => $item->id,
                'expires_at' => now()->addHours(2),
                'released_at' => null,
            ]);

            return;
        }

        UsernameReservation::create([
            'username' => $username,
            'order_item_id' => $item->id,
            'expires_at' => now()->addHours(2),
        ]);
    }

    private function recalculateTotals(Order $order): void
    {
        $subtotal = (float) $order->items()->sum('unit_price');
        $discount = (float) $order->items()->sum('discount_total');
        $tax = (float) $order->items()->sum('tax_total');

        $order->update([
            'subtotal' => $subtotal,
            'discount_total' => $discount,
            'tax_total' => $tax,
            'total' => $subtotal - $discount + $tax,
        ]);
    }
}
