<?php

namespace Tests\Feature;

use App\Mail\ActivationCodeIssued;
use App\Mail\PackageCheckoutReceipt;
use App\Mail\RenewalCheckoutReceipt;
use App\Models\ActivationCode;
use App\Models\Package;
use App\Models\PackageDurationOption;
use App\Models\PackagePayment;
use App\Models\Student;
use App\Models\User;
use App\Services\ActivationCodeService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PackageCheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Schema::create('level', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('abbr')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        DB::table('level')->insert([
            ['id' => 1, 'name' => 'Standard 1', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Standard 4', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function test_checkout_shows_two_duration_options_and_only_package_levels(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        [$package] = $this->packageWithOptions();

        $this->actingAs($parent)->get(route('parent.packages.checkout', $package))
            ->assertOk()
            ->assertSee('6 months')
            ->assertSee('MYR 500.00')
            ->assertSee('12 months')
            ->assertSee('MYR 700.00')
            ->assertSee('Standard 1')
            ->assertDontSee('Standard 4');
    }

    public function test_username_availability_reports_existing_and_available_names(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        User::factory()->create(['username' => 'already_used']);

        $this->actingAs($parent)->postJson(route('parent.children.username-availability'), ['username' => 'already_used'])
            ->assertOk()->assertJson(['available' => false]);
        $this->actingAs($parent)->postJson(route('parent.children.username-availability'), ['username' => 'new_child'])
            ->assertOk()->assertJson(['available' => true]);
    }

    public function test_six_month_checkout_creates_paid_order_child_subscription_code_and_receipt(): void
    {
        Mail::fake();
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        [$package, $sixMonths] = $this->packageWithOptions();

        $this->actingAs($parent)->post(route('parent.packages.checkout.store', $package), [
            'duration_option_id' => $sixMonths->id,
            'name' => 'Aiman Child',
            'username' => 'aiman_checkout',
            'password' => 'strong-password',
            'password_confirmation' => 'strong-password',
            'level_id' => 1,
        ])->assertRedirect(route('parent.children.index'));

        $child = User::query()->where('username', 'aiman_checkout')->firstOrFail();
        $payment = PackagePayment::firstOrFail();
        $code = ActivationCode::firstOrFail();
        $subscription = $child->activeChildSubscription();

        $this->assertSame(PackagePayment::STATUS_PAID, $payment->status);
        $this->assertSame($sixMonths->id, $payment->package_duration_option_id);
        $this->assertSame('500.00', $payment->amount);
        $this->assertSame(183, $code->duration_days);
        $this->assertSame(ActivationCode::STATUS_REDEEMED, $code->status);
        $this->assertSame($child->id, $code->redeemed_by_child_id);
        $this->assertEquals(183, $subscription->starts_at->diffInDays($subscription->ends_at));
        $this->assertDatabaseHas('students', ['user_id' => $child->id, 'parent_id' => $parent->id, 'level_id' => 1]);
        Mail::assertSent(PackageCheckoutReceipt::class, fn ($mail) => $mail->hasTo($parent->email));
        Mail::assertSent(PackageCheckoutReceipt::class, fn ($mail) => $mail->childPassword === 'strong-password' && str_contains($mail->render(), 'strong-password'));
        Mail::assertNotSent(ActivationCodeIssued::class);
    }

    public function test_checkout_rejects_duplicate_username_and_level_from_another_package(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        User::factory()->create(['username' => 'duplicate_child']);
        [$package, $sixMonths] = $this->packageWithOptions();

        $this->actingAs($parent)->post(route('parent.packages.checkout.store', $package), [
            'duration_option_id' => $sixMonths->id,
            'name' => 'Invalid Child',
            'username' => 'duplicate_child',
            'password' => 'strong-password',
            'password_confirmation' => 'strong-password',
            'level_id' => 2,
        ])->assertSessionHasErrors(['username', 'level_id']);

        $this->assertDatabaseCount('package_payments', 0);
        $this->assertDatabaseCount('activation_codes', 0);
    }

    public function test_twelve_month_checkout_charges_seven_hundred_and_grants_365_days(): void
    {
        Mail::fake();
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        [$package, , $twelveMonths] = $this->packageWithOptions();

        $this->actingAs($parent)->post(route('parent.packages.checkout.store', $package), [
            'duration_option_id' => $twelveMonths->id,
            'name' => 'Sara Child',
            'username' => 'Sara_Checkout',
            'password' => 'strong-password',
            'password_confirmation' => 'strong-password',
            'level_id' => 1,
        ])->assertRedirect(route('parent.children.index'));

        $this->assertDatabaseHas('package_payments', ['package_duration_option_id' => $twelveMonths->id, 'amount' => 700, 'status' => PackagePayment::STATUS_PAID]);
        $this->assertDatabaseHas('activation_codes', ['duration_days' => 365, 'purchase_amount' => 700, 'status' => ActivationCode::STATUS_REDEEMED]);
        $this->assertDatabaseHas('users', ['username' => 'sara_checkout']);
    }

    public function test_renewal_payment_creates_child_bound_code_and_emails_receipt_without_redeeming_it(): void
    {
        Mail::fake();
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $child = User::factory()->create(['role_id' => User::ROLE_CHILD, 'username' => 'renew_payment_child']);
        $student = Student::create(['code' => 'HT-RENEW-PAY', 'user_id' => $child->id, 'parent_id' => $parent->id, 'full_name' => 'Renew Payment Child', 'level_id' => 1]);
        [$package, $sixMonths] = $this->packageWithOptions();
        PackageDurationOption::create(['package_id' => $package->id, 'months' => 3, 'duration_days' => 90, 'price' => 300, 'currency' => 'MYR', 'is_active' => true]);

        $this->actingAs($parent)->get(route('parent.children.renew', $student->uuid))
            ->assertOk()
            ->assertSee($package->name)
            ->assertSee('Standard 1')
            ->assertSee('6 months')
            ->assertSee('12 months')
            ->assertDontSee('3 months');

        $response = $this->actingAs($parent)->post(route('parent.children.renew.payment.store', [
            'childUuid' => $student->uuid,
            'package' => $package,
        ]), ['duration_option_id' => $sixMonths->id]);

        $payment = PackagePayment::firstOrFail();
        $code = ActivationCode::firstOrFail();

        $response->assertRedirect(route('parent.children.renew', [
            'childUuid' => $student->uuid,
            'activation' => $code->uuid,
        ]));
        $this->assertSame(PackagePayment::STATUS_PAID, $payment->status);
        $this->assertSame('renewal', $payment->metadata['purchase_type']);
        $this->assertSame($child->id, $payment->metadata['child_user_id']);
        $this->assertSame(ActivationCode::STATUS_UNUSED, $code->status);
        $this->assertSame('renewal', $code->intended_use);
        $this->assertSame($child->id, $code->renewal_child_id);
        $this->assertSame(183, $code->duration_days);
        $this->assertDatabaseCount('child_subscriptions', 0);
        Mail::assertSent(RenewalCheckoutReceipt::class, fn ($mail) => $mail->hasTo($parent->email)
            && str_contains($mail->render(), $code->code_value)
            && str_contains($mail->render(), $payment->provider_reference));

        $this->actingAs($parent)->get($response->headers->get('Location'))
            ->assertOk()
            ->assertSee($code->code_value);
    }

    public function test_parent_payment_log_shows_only_their_payments_and_activation_codes(): void
    {
        Mail::fake();
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $otherParent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        [$package, $sixMonths] = $this->packageWithOptions();

        $ownPayment = PackagePayment::create(['parent_id' => $parent->id, 'package_id' => $package->id, 'package_duration_option_id' => $sixMonths->id, 'method' => 'checkout_submit', 'provider' => 'internal_submit', 'provider_reference' => 'OWN-RECEIPT-100', 'status' => 'paid', 'amount' => 500, 'currency' => 'MYR', 'paid_at' => now()]);
        $otherPayment = PackagePayment::create(['parent_id' => $otherParent->id, 'package_id' => $package->id, 'package_duration_option_id' => $sixMonths->id, 'method' => 'checkout_submit', 'provider' => 'internal_submit', 'provider_reference' => 'OTHER-RECEIPT-999', 'status' => 'paid', 'amount' => 500, 'currency' => 'MYR', 'paid_at' => now()]);
        app(ActivationCodeService::class)->issue($package, $parent, 'package_checkout', $ownPayment, durationDays: 183, purchaseAmount: 500, sendEmail: false);
        app(ActivationCodeService::class)->issue($package, $otherParent, 'package_checkout', $otherPayment, durationDays: 183, purchaseAmount: 500, sendEmail: false);

        $this->actingAs($parent)->get(route('parent.payment-log.index'))
            ->assertOk()
            ->assertSee('Payment and activation log')
            ->assertSee('OWN-RECEIPT-100')
            ->assertDontSee('OTHER-RECEIPT-999')
            ->assertSee('MYR 500.00')
            ->assertSee('6 months')
            ->assertSee('Create child account');
    }

    private function packageWithOptions(): array
    {
        $package = Package::create([
            'name' => 'Standard 1–3',
            'code' => 'STD-1-3',
            'description' => 'Primary package',
            'curriculum_group' => 'standard_1_3',
            'price' => 500,
            'currency' => 'MYR',
            'duration_days' => 365,
            'max_children' => 1,
            'is_active' => true,
        ]);
        $package->levels()->sync([1]);
        $sixMonths = PackageDurationOption::create(['package_id' => $package->id, 'months' => 6, 'duration_days' => 183, 'price' => 500, 'currency' => 'MYR', 'is_active' => true]);
        $twelveMonths = PackageDurationOption::create(['package_id' => $package->id, 'months' => 12, 'duration_days' => 365, 'price' => 700, 'currency' => 'MYR', 'is_active' => true]);

        return [$package, $sixMonths, $twelveMonths];
    }
}
