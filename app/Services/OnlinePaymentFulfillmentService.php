<?php

namespace App\Services;

use App\Models\ActivationCode;
use App\Models\Package;
use App\Models\PackagePayment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class OnlinePaymentFulfillmentService
{
    public function __construct(private readonly ActivationCodeService $activationCodes) {}

    /**
     * Call this only after a payment gateway webhook has passed signature and
     * payment-status verification. The gateway reference makes retries idempotent.
     */
    public function fulfill(
        User $parent,
        Package $package,
        string $provider,
        string $providerReference,
        string|float $amount,
        string $currency = 'MYR',
        array $gatewayMetadata = [],
    ): ActivationCode {
        if (! $parent->isParent()) {
            throw new InvalidArgumentException('Online payment must belong to a parent account.');
        }

        if ($this->toCents($amount) !== $this->toCents($package->price) || strtoupper($currency) !== strtoupper($package->currency)) {
            throw new InvalidArgumentException('The paid amount or currency does not match the package.');
        }

        return DB::transaction(function () use ($parent, $package, $provider, $providerReference, $amount, $currency, $gatewayMetadata) {
            $payment = PackagePayment::query()
                ->where('provider_reference', $providerReference)
                ->lockForUpdate()
                ->first();

            if ($payment) {
                if ((int) $payment->parent_id !== (int) $parent->id || (int) $payment->package_id !== (int) $package->id || $payment->provider !== $provider) {
                    throw new InvalidArgumentException('Gateway reference is already attached to a different payment.');
                }

                $existingCode = $payment->activationCode()->first();
                if ($existingCode) {
                    return $existingCode;
                }
            } else {
                $payment = PackagePayment::create([
                    'parent_id' => $parent->id,
                    'package_id' => $package->id,
                    'method' => 'online',
                    'provider' => $provider,
                    'provider_reference' => $providerReference,
                    'status' => PackagePayment::STATUS_PAID,
                    'amount' => $amount,
                    'currency' => strtoupper($currency),
                    'paid_at' => now(),
                    'metadata' => $gatewayMetadata,
                ]);
            }

            return $this->activationCodes->issue(
                $package,
                $parent,
                'online_payment',
                $payment,
                reason: 'Automatically fulfilled successful '.$provider.' payment',
            );
        });
    }

    private function toCents(string|float|null $amount): int
    {
        return (int) round((float) $amount * 100);
    }
}
