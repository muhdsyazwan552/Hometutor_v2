<?php

namespace App\Services;

use App\Mail\ActivationCodeIssued;
use App\Models\ActivationCode;
use App\Models\ActivationCodeAttempt;
use App\Models\ActivationCodeBatch;
use App\Models\ChildSubscription;
use App\Models\OrderItem;
use App\Models\Package;
use App\Models\PackagePayment;
use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class ActivationCodeService
{
    private const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

    public function __construct(private readonly SubscriptionService $subscriptions) {}

    public function issue(Package $package, ?User $parent, string $source, ?PackagePayment $payment = null, ?User $generatedBy = null, ?string $reason = null, ?string $email = null, string $intendedUse = 'any', ?User $renewalChild = null, ?int $durationDays = null, string|float|null $purchaseAmount = null, bool $sendEmail = true, ?string $seriesPrefix = null): ActivationCode
    {
        $seriesPrefix ??= $this->seriesPrefixFor($parent);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $plain = $this->generatePlainCode($seriesPrefix);
            $hash = $this->fingerprint($plain);

            if (ActivationCode::query()->where('code_hash', $hash)->exists()) {
                continue;
            }

            $code = ActivationCode::create([
                'code_hash' => $hash,
                'code_value' => $plain,
                'series_prefix' => $this->normalizeSeriesPrefix($seriesPrefix),
                'code_last_four' => substr($this->normalize($plain), -4),
                'package_id' => $package->id,
                'duration_days' => $durationDays ?: $package->duration_days,
                'purchase_amount' => $purchaseAmount,
                'purchaser_parent_id' => $parent?->id,
                'package_payment_id' => $payment?->id,
                'source' => $source,
                'intended_use' => $intendedUse,
                'renewal_child_id' => $renewalChild?->id,
                'status' => ActivationCode::STATUS_UNUSED,
                'sent_to_email' => $email ?: $parent?->email,
                'expires_at' => now()->addDays(config('licensing.activation_code_expiry_days', 90)),
                'generated_by_user_id' => $generatedBy?->id,
                'generation_reason' => $reason,
            ]);

            $this->log($code, $generatedBy ?? $parent, 'generate', 'generated');
            if ($sendEmail) {
                $this->sendEmail($code);
            }

            return $code;
        }

        throw new \RuntimeException('Unable to generate a unique activation code.');
    }

    public function validateForParent(string $plainCode, User $parent, ?int $levelId = null, ?Request $request = null, string $action = 'validate'): ActivationCode
    {
        $normalized = $this->normalize($plainCode);
        $code = ActivationCode::query()
            ->with(['package.levels', 'batch.company'])
            ->where('code_hash', $this->fingerprint($normalized))
            ->first();

        $result = $this->invalidReason($code, $parent, $levelId, purpose: 'new');
        $this->log($code, $parent, $action, $result ?: 'valid', $request, $this->fingerprint($normalized), substr($normalized, -4));

        if ($result) {
            if ($code && $result === 'expired' && $code->status === ActivationCode::STATUS_UNUSED) {
                $code->update(['status' => ActivationCode::STATUS_EXPIRED, 'invalid_reason' => 'Code expired before redemption.']);
            }

            throw ValidationException::withMessages(['activation_code' => 'The activation code is invalid, expired, used, or unavailable for this account and level.']);
        }

        return $code;
    }

    public function redeem(string $plainCode, User $parent, User $child, int $levelId, ?Request $request = null, string $purpose = 'any', ?OrderItem $orderItem = null, ?PaymentTransaction $paymentTransaction = null): ChildSubscription
    {
        return DB::transaction(function () use ($plainCode, $parent, $child, $levelId, $request, $purpose, $orderItem, $paymentTransaction) {
            $normalized = $this->normalize($plainCode);
            $code = ActivationCode::query()
                ->with(['package.levels', 'batch.company'])
                ->where('code_hash', $this->fingerprint($normalized))
                ->lockForUpdate()
                ->first();

            $result = $this->invalidReason($code, $parent, $levelId, $child, $purpose);
            $this->log($code, $parent, 'redeem', $result ?: 'valid', $request, $this->fingerprint($normalized), substr($normalized, -4), ['child_user_id' => $child->id]);

            if ($result) {
                throw ValidationException::withMessages(['activation_code' => 'The activation code is invalid, expired, used, or unavailable for this account and level.']);
            }

            $subscription = $purpose === 'renewal'
                ? $this->subscriptions->renew($child, $code->package, $code->duration_days ?: $code->package->duration_days, 'activation_code', $code, $orderItem, $paymentTransaction)
                : $this->subscriptions->grantNew($child, $code->package, $code->duration_days ?: $code->package->duration_days, 'activation_code', $code, $orderItem, $paymentTransaction);

            $code->update([
                'status' => ActivationCode::STATUS_REDEEMED,
                'redeemed_at' => now(),
                'redeemed_by_child_id' => $child->id,
            ]);
            $this->log($code, $parent, 'redeem', 'redeemed', $request, metadata: ['child_user_id' => $child->id, 'child_subscription_id' => $subscription->id]);

            return $subscription;
        });
    }

    public function resend(ActivationCode $code, ?User $actor = null): void
    {
        $this->sendEmail($code, $actor);
    }

    public function issueBulk(ActivationCodeBatch $batch, Package $package, User $creator, int $durationDays): void
    {
        $rows = [];
        $knownHashes = [];
        $now = now();

        while (count($rows) < $batch->quantity) {
            $plain = $this->generatePlainCode($batch->series_prefix);
            $hash = $this->fingerprint($plain);
            if (isset($knownHashes[$hash])) {
                continue;
            }

            $knownHashes[$hash] = true;
            $rows[] = [
                'uuid' => (string) Str::uuid(),
                'code_hash' => $hash,
                'code_value' => Crypt::encryptString($plain),
                'series_prefix' => $batch->series_prefix,
                'code_last_four' => substr($this->normalize($plain), -4),
                'package_id' => $package->id,
                'duration_days' => $durationDays,
                'purchaser_parent_id' => null,
                'package_payment_id' => null,
                'activation_code_batch_id' => $batch->id,
                'source' => 'bulk_'.$batch->source_type,
                'intended_use' => 'new',
                'status' => ActivationCode::STATUS_UNUSED,
                'expires_at' => $batch->expires_at,
                'generated_by_user_id' => $creator->id,
                'generation_reason' => 'Bulk batch '.$batch->reference,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $existing = collect(array_keys($knownHashes))->chunk(400)->contains(
            fn ($hashes) => ActivationCode::query()->whereIn('code_hash', $hashes)->exists()
        );
        if ($existing) {
            throw new \RuntimeException('A code collision occurred. Please generate the batch again.');
        }

        collect($rows)->chunk(250)->each(fn ($chunk) => DB::table('activation_codes')->insert($chunk->all()));

        ActivationCode::query()->where('activation_code_batch_id', $batch->id)->get(['id', 'code_hash', 'code_last_four'])
            ->chunk(250)
            ->each(function ($codes) use ($creator, $now): void {
                DB::table('activation_code_attempts')->insert($codes->map(fn ($code) => [
                    'activation_code_id' => $code->id,
                    'code_fingerprint' => $code->code_hash,
                    'code_last_four' => $code->code_last_four,
                    'actor_user_id' => $creator->id,
                    'action' => 'generate',
                    'result' => 'bulk_generated',
                    'metadata' => null,
                    'created_at' => $now,
                ])->all());
            });
    }

    public function fingerprint(string $code): string
    {
        return hash_hmac('sha256', $this->normalize($code), (string) config('app.key'));
    }

    public function normalize(string $code): string
    {
        return strtoupper((string) preg_replace('/[^A-Z0-9]/i', '', trim($code)));
    }

    private function invalidReason(?ActivationCode $code, User $parent, ?int $levelId, ?User $child = null, string $purpose = 'any'): ?string
    {
        if (! $code) {
            return 'not_found';
        }
        if ($code->purchaser_parent_id && (int) $code->purchaser_parent_id !== (int) $parent->id) {
            return 'wrong_parent';
        }
        if ($code->status !== ActivationCode::STATUS_UNUSED) {
            return $code->status;
        }
        if ($code->expires_at && $code->expires_at->isPast()) {
            return 'expired';
        }
        if ($purpose === 'new' && $code->intended_use === 'renewal') {
            return 'renewal_only';
        }
        if ($purpose === 'renewal' && $code->intended_use === 'new') {
            return 'new_child_only';
        }
        if ($code->renewal_child_id && (! $child || (int) $code->renewal_child_id !== (int) $child->id)) {
            return 'wrong_child';
        }
        if (! $code->package?->is_active) {
            return 'package_inactive';
        }
        if ($levelId && ! $code->package->levels->contains('id', $levelId)) {
            return 'level_not_allowed';
        }

        return null;
    }

    private function generatePlainCode(string $seriesPrefix = 'HT'): string
    {
        $characters = '';
        for ($index = 0; $index < 20; $index++) {
            $characters .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
        }

        return $this->normalizeSeriesPrefix($seriesPrefix).'-'.implode('-', str_split($characters, 4));
    }

    private function normalizeSeriesPrefix(string $seriesPrefix): string
    {
        $normalized = strtoupper((string) preg_replace('/[^A-Z0-9]/i', '', trim($seriesPrefix)));

        return $normalized !== '' ? substr($normalized, 0, 20) : 'HT';
    }

    private function seriesPrefixFor(?User $parent): string
    {
        if (! $parent) {
            return 'HT';
        }

        $companySeries = $parent->company?->code_series;
        if ($companySeries) {
            return $this->normalizeSeriesPrefix($companySeries);
        }

        // Keeps existing Explode accounts correct if they were created before
        // the company code-series setting was introduced.
        $referenceCode = strtoupper((string) ($parent->registration_reference_code ?: $parent->company?->reference_code));

        return $referenceCode === 'EXPLODE' ? 'XCLN' : 'HT';
    }

    private function sendEmail(ActivationCode $code, ?User $actor = null): void
    {
        if (! $code->sent_to_email) {
            $this->log($code, $actor, 'email', 'missing_email');

            return;
        }

        try {
            Mail::to($code->sent_to_email)->send(new ActivationCodeIssued($code));
            $code->update(['emailed_at' => now()]);
            $this->log($code, $actor, 'email', 'sent');
        } catch (Throwable $exception) {
            report($exception);
            $this->log($code, $actor, 'email', 'failed', metadata: ['exception' => $exception::class]);
        }
    }

    private function log(?ActivationCode $code, ?User $actor, string $action, string $result, ?Request $request = null, ?string $fingerprint = null, ?string $lastFour = null, array $metadata = []): void
    {
        ActivationCodeAttempt::create([
            'activation_code_id' => $code?->id,
            'code_fingerprint' => $fingerprint ?: ($code?->code_hash ?? hash('sha256', 'system-event')),
            'code_last_four' => $lastFour ?: $code?->code_last_four,
            'actor_user_id' => $actor?->id,
            'action' => $action,
            'result' => $result,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'metadata' => $metadata ?: null,
        ]);
    }
}
