<?php

namespace App\Services;

use App\Mail\PackageCheckoutReceipt;
use App\Mail\RenewalCheckoutReceipt;
use App\Models\Package;
use App\Models\PackageDurationOption;
use App\Models\PackagePayment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class PackageCheckoutService
{
    public function __construct(private ActivationCodeService $activationCodes) {}

    public function purchase(Request $request, Package $package, PackageDurationOption $option, array $data): array
    {
        $result = DB::transaction(function () use ($request, $package, $option, $data): array {
            $parent = $request->user();
            $payment = PackagePayment::create([
                'parent_id' => $parent->id,
                'package_id' => $package->id,
                'package_duration_option_id' => $option->id,
                'method' => 'checkout_submit',
                'provider' => 'internal_submit',
                'provider_reference' => 'HT-'.now()->format('Ymd').'-'.Str::upper(Str::random(10)),
                'status' => PackagePayment::STATUS_PAID,
                'amount' => $option->price,
                'currency' => $option->currency,
                'paid_at' => now(),
                'metadata' => ['payment_mode' => 'submit_only', 'duration_months' => $option->months],
            ]);

            $child = User::create([
                'name' => $data['name'],
                'display_name' => $data['name'],
                'username' => Str::lower($data['username']),
                'email' => Str::lower($data['username']).'@children.hometutor.local',
                'password' => Hash::make($data['password']),
                'role_id' => User::ROLE_CHILD,
                'is_active' => true,
            ]);

            Student::create([
                'user_id' => $child->id,
                'parent_id' => $parent->id,
                'code' => 'HT-'.Str::upper(Str::random(10)),
                'full_name' => $data['name'],
                'level_id' => $data['level_id'],
            ]);

            $code = $this->activationCodes->issue(
                package: $package,
                parent: $parent,
                source: 'package_checkout',
                payment: $payment,
                generatedBy: $parent,
                reason: 'Automatically generated during package checkout.',
                email: $parent->email,
                intendedUse: 'new',
                durationDays: $option->duration_days,
                purchaseAmount: $option->price,
                sendEmail: false,
            );

            $subscription = $this->activationCodes->redeem(
                $code->code_value,
                $parent,
                $child,
                (int) $data['level_id'],
                $request,
                'new',
            );

            return compact('payment', 'child', 'code', 'subscription');
        });

        $result['receipt_sent'] = false;
        try {
            Mail::to($request->user()->email)->send(new PackageCheckoutReceipt(
                $result['payment']->load('package'),
                $option,
                $result['child']->load('student.level'),
                $data['password'],
                $result['subscription'],
                $result['code'],
            ));
            $result['receipt_sent'] = true;
        } catch (Throwable $exception) {
            report($exception);
        }

        return $result;
    }

    public function purchaseRenewal(Request $request, Student $student, Package $package, PackageDurationOption $option): array
    {
        $result = DB::transaction(function () use ($request, $student, $package, $option): array {
            $parent = $request->user();
            $payment = PackagePayment::create([
                'parent_id' => $parent->id,
                'package_id' => $package->id,
                'package_duration_option_id' => $option->id,
                'method' => 'checkout_submit',
                'provider' => 'internal_submit',
                'provider_reference' => 'HT-RNW-'.now()->format('Ymd').'-'.Str::upper(Str::random(10)),
                'status' => PackagePayment::STATUS_PAID,
                'amount' => $option->price,
                'currency' => $option->currency,
                'paid_at' => now(),
                'metadata' => [
                    'payment_mode' => 'submit_only',
                    'purchase_type' => 'renewal',
                    'duration_months' => $option->months,
                    'child_user_id' => $student->user_id,
                ],
            ]);

            $code = $this->activationCodes->issue(
                package: $package,
                parent: $parent,
                source: 'package_checkout',
                payment: $payment,
                generatedBy: $parent,
                reason: 'Automatically generated during child renewal checkout.',
                email: $parent->email,
                intendedUse: 'renewal',
                renewalChild: $student->user,
                durationDays: $option->duration_days,
                purchaseAmount: $option->price,
                sendEmail: false,
            );

            return compact('payment', 'code');
        });

        $result['receipt_sent'] = false;

        try {
            Mail::to($request->user()->email)->send(new RenewalCheckoutReceipt(
                $result['payment']->load('package'),
                $option,
                $student->load('user', 'level'),
                $result['code'],
            ));
            $result['receipt_sent'] = true;
        } catch (Throwable $exception) {
            report($exception);
        }

        return $result;
    }
}
