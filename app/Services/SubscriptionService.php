<?php

namespace App\Services;

use App\Models\ActivationCode;
use App\Models\ChildSubscription;
use App\Models\OrderItem;
use App\Models\Package;
use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * The single authority for creating child access periods.
 *
 * Payment providers and activation codes only prove that an item is eligible;
 * this service decides when that child's new access period actually begins.
 */
class SubscriptionService
{
    public function grantNew(User $child, Package $package, int $durationDays, string $source, ?ActivationCode $activationCode = null, ?OrderItem $orderItem = null, ?PaymentTransaction $paymentTransaction = null): ChildSubscription
    {
        return $this->grant($child, $package, $durationDays, ChildSubscription::TYPE_NEW, $source, $activationCode, $orderItem, $paymentTransaction);
    }

    public function renew(User $child, Package $package, int $durationDays, string $source, ?ActivationCode $activationCode = null, ?OrderItem $orderItem = null, ?PaymentTransaction $paymentTransaction = null): ChildSubscription
    {
        return $this->grant($child, $package, $durationDays, ChildSubscription::TYPE_RENEWAL, $source, $activationCode, $orderItem, $paymentTransaction);
    }

    public function grant(User $child, Package $package, int $durationDays, string $subscriptionType, string $source, ?ActivationCode $activationCode = null, ?OrderItem $orderItem = null, ?PaymentTransaction $paymentTransaction = null): ChildSubscription
    {
        if ($durationDays < 1) {
            throw new InvalidArgumentException('Subscription duration must be at least one day.');
        }

        if (! in_array($subscriptionType, [ChildSubscription::TYPE_NEW, ChildSubscription::TYPE_RENEWAL], true)) {
            throw new InvalidArgumentException('Subscription type must be new or renewal.');
        }

        return DB::transaction(function () use ($child, $package, $durationDays, $subscriptionType, $source, $activationCode, $orderItem, $paymentTransaction) {
            // Serialise subscription grants for the same child, so two callbacks
            // cannot both start from the same previous expiry date.
            $lockedChild = User::query()->lockForUpdate()->findOrFail($child->id);
            $previous = null;
            $startsAt = now();

            if ($subscriptionType === ChildSubscription::TYPE_RENEWAL) {
                $previous = ChildSubscription::query()
                    ->where('child_user_id', $lockedChild->id)
                    ->whereIn('status', [ChildSubscription::STATUS_ACTIVE, ChildSubscription::STATUS_SCHEDULED])
                    ->orderByDesc('ends_at')
                    ->lockForUpdate()
                    ->first();

                if ($previous?->ends_at?->isFuture()) {
                    $startsAt = $previous->ends_at->copy();
                }
            }

            return ChildSubscription::create([
                'child_user_id' => $lockedChild->id,
                'package_id' => $package->id,
                'activation_code_id' => $activationCode?->id,
                'order_item_id' => $orderItem?->id,
                'payment_transaction_id' => $paymentTransaction?->id,
                'previous_subscription_id' => $previous?->id,
                'status' => $startsAt->isFuture() ? ChildSubscription::STATUS_SCHEDULED : ChildSubscription::STATUS_ACTIVE,
                'source' => $source,
                'subscription_type' => $subscriptionType,
                'starts_at' => $startsAt,
                'ends_at' => $startsAt->copy()->addDays($durationDays),
            ]);
        });
    }
}
