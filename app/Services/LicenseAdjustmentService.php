<?php

namespace App\Services;

use App\Models\ActivationCode;
use App\Models\ActivationCodeAttempt;
use App\Models\ChildSubscription;
use App\Models\LicenseAdjustmentRequest;
use App\Models\PackagePayment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LicenseAdjustmentService
{
    public function recordParentRequest(ActivationCode $code, User $recordedBy, string $type, string $reason, string $contactMethod): LicenseAdjustmentRequest
    {
        return DB::transaction(function () use ($code, $recordedBy, $type, $reason, $contactMethod) {
            $code = ActivationCode::query()->with(['payment', 'package'])->lockForUpdate()->findOrFail($code->id);

            if (! $code->purchaser_parent_id) {
                throw ValidationException::withMessages(['request' => 'This code is not assigned to a parent account.']);
            }
            if (! in_array($code->status, [ActivationCode::STATUS_UNUSED, ActivationCode::STATUS_REDEEMED], true)) {
                throw ValidationException::withMessages(['request' => 'This licence is already revoked or expired.']);
            }
            if ($code->licenseAdjustmentRequests()->whereIn('status', [LicenseAdjustmentRequest::STATUS_REQUESTED, LicenseAdjustmentRequest::STATUS_APPROVED])->exists()) {
                throw ValidationException::withMessages(['request' => 'An open refund or cancellation request already exists for this licence.']);
            }

            $payment = $code->payment;
            $purchasedAt = $payment?->paid_at ?? $payment?->created_at ?? $code->created_at;
            $paymentCanBeRefunded = $payment
                && in_array($payment->status, [PackagePayment::STATUS_PAID, PackagePayment::STATUS_APPROVED], true);
            $withinRefundWindow = now()->lte($purchasedAt->copy()->addDays(30)->endOfDay());
            $refundEligible = $paymentCanBeRefunded && $withinRefundWindow;

            if ($type === LicenseAdjustmentRequest::TYPE_REFUND && ! $refundEligible) {
                throw ValidationException::withMessages([
                    'request' => $payment
                        ? 'Refunds must be reported within 30 days from the purchase date.'
                        : 'This licence has no recorded payment and cannot be refunded. Record a cancellation instead.',
                ]);
            }

            return LicenseAdjustmentRequest::create([
                'parent_id' => $code->purchaser_parent_id,
                'requested_by_user_id' => $recordedBy->id,
                'package_payment_id' => $payment?->id,
                'activation_code_id' => $code->id,
                'child_subscription_id' => ChildSubscription::query()->where('activation_code_id', $code->id)->value('id'),
                'type' => $type,
                'status' => LicenseAdjustmentRequest::STATUS_REQUESTED,
                'reason' => 'Reported via '.ucfirst(str_replace('_', ' ', $contactMethod)).' by '.($recordedBy->display_name ?: $recordedBy->name ?: $recordedBy->username).":\n\n".$reason,
                'contact_method' => $contactMethod,
                'purchased_at' => $purchasedAt,
                'requested_at' => now(),
                'refund_eligible' => $refundEligible,
                'refund_amount' => $refundEligible ? $payment->amount : 0,
                'currency' => $payment?->currency ?? $code->package->currency,
                'metadata' => ['reported_on_behalf_of_parent' => true],
            ]);
        });
    }

    public function approve(LicenseAdjustmentRequest $adjustment, User $admin, ?string $notes = null): LicenseAdjustmentRequest
    {
        return DB::transaction(function () use ($adjustment, $admin, $notes) {
            $adjustment = LicenseAdjustmentRequest::query()->lockForUpdate()->findOrFail($adjustment->id);

            if ($adjustment->status !== LicenseAdjustmentRequest::STATUS_REQUESTED) {
                throw ValidationException::withMessages(['request' => 'Only a newly requested item can be approved.']);
            }

            $code = ActivationCode::query()->lockForUpdate()->findOrFail($adjustment->activation_code_id);
            $subscription = ChildSubscription::query()->where('activation_code_id', $code->id)->lockForUpdate()->first();

            if ($code->status === ActivationCode::STATUS_UNUSED) {
                $code->update([
                    'status' => ActivationCode::STATUS_REVOKED,
                    'revoked_at' => now(),
                    'invalid_reason' => 'Licence cancelled through approved '.$adjustment->type.' request.',
                ]);
            }

            if ($subscription && $subscription->status === ChildSubscription::STATUS_ACTIVE) {
                $subscription->update(['status' => ChildSubscription::STATUS_CANCELLED]);
            }

            ActivationCodeAttempt::create([
                'activation_code_id' => $code->id,
                'code_fingerprint' => $code->code_hash,
                'code_last_four' => $code->code_last_four,
                'actor_user_id' => $admin->id,
                'action' => $adjustment->type,
                'result' => $adjustment->refund_eligible ? 'approved_refund_pending' : 'cancelled_no_refund',
                'metadata' => ['license_adjustment_request_id' => $adjustment->id],
            ]);

            $isRefundPending = $adjustment->refund_eligible && $adjustment->refund_amount > 0;
            $adjustment->update([
                'child_subscription_id' => $subscription?->id,
                'status' => $isRefundPending ? LicenseAdjustmentRequest::STATUS_APPROVED : LicenseAdjustmentRequest::STATUS_COMPLETED,
                'admin_notes' => $notes,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
                'refund_due_at' => $isRefundPending ? now()->addWeekdays(30) : null,
                'completed_by' => $isRefundPending ? null : $admin->id,
                'completed_at' => $isRefundPending ? null : now(),
            ]);

            return $adjustment->fresh();
        });
    }

    public function reject(LicenseAdjustmentRequest $adjustment, User $admin, string $notes): LicenseAdjustmentRequest
    {
        return DB::transaction(function () use ($adjustment, $admin, $notes) {
            $adjustment = LicenseAdjustmentRequest::query()->lockForUpdate()->findOrFail($adjustment->id);

            if ($adjustment->status !== LicenseAdjustmentRequest::STATUS_REQUESTED) {
                throw ValidationException::withMessages(['request' => 'Only a newly requested item can be rejected.']);
            }

            $adjustment->update([
                'status' => LicenseAdjustmentRequest::STATUS_REJECTED,
                'admin_notes' => $notes,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ]);

            return $adjustment->fresh();
        });
    }

    public function completeRefund(LicenseAdjustmentRequest $adjustment, User $admin, string $refundReference, ?string $notes = null): LicenseAdjustmentRequest
    {
        return DB::transaction(function () use ($adjustment, $admin, $refundReference, $notes) {
            $adjustment = LicenseAdjustmentRequest::query()->lockForUpdate()->findOrFail($adjustment->id);

            if ($adjustment->status !== LicenseAdjustmentRequest::STATUS_APPROVED || ! $adjustment->refund_eligible || ! $adjustment->package_payment_id) {
                throw ValidationException::withMessages(['request' => 'This request is not awaiting a refund payment.']);
            }

            $payment = PackagePayment::query()->lockForUpdate()->findOrFail($adjustment->package_payment_id);
            $payment->update(['status' => PackagePayment::STATUS_REFUNDED]);
            $adjustment->update([
                'status' => LicenseAdjustmentRequest::STATUS_COMPLETED,
                'refund_reference' => $refundReference,
                'admin_notes' => $notes ?: $adjustment->admin_notes,
                'completed_by' => $admin->id,
                'completed_at' => now(),
            ]);

            return $adjustment->fresh();
        });
    }
}
