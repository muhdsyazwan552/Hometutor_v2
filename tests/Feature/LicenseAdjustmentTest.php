<?php

namespace Tests\Feature;

use App\Models\ActivationCode;
use App\Models\ChildSubscription;
use App\Models\LicenseAdjustmentRequest;
use App\Models\Package;
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

class LicenseAdjustmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        Schema::create('level', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('abbr')->nullable();
            $table->boolean('is_active')->default(true);
        });
        DB::table('level')->insert(['id' => 1, 'name' => 'Standard 1', 'abbr' => 'ST1', 'is_active' => true]);
    }

    public function test_code_manager_can_record_parent_refund_within_thirty_days(): void
    {
        [$parent, , $manager, $admin, $payment, $code] = $this->paidLicence(now()->subDays(30));

        $this->actingAs($manager)->get(route('code-manager.register.index'))
            ->assertOk()
            ->assertSee('Record refund / cancellation');

        $this->actingAs($manager)->post(route('code-manager.parent-requests.store', $code->uuid), [
            'type' => 'refund',
            'contact_method' => 'whatsapp',
            'reason' => 'The package is no longer required.',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseHas('license_adjustment_requests', [
            'parent_id' => $parent->id,
            'package_payment_id' => $payment->id,
            'activation_code_id' => $code->id,
            'type' => 'refund',
            'status' => 'requested',
            'refund_eligible' => true,
            'refund_amount' => '99.00',
            'requested_by_user_id' => $manager->id,
            'contact_method' => 'whatsapp',
        ]);

        $this->actingAs($parent)->get(route('parent.subscriptions.index'))
            ->assertOk()
            ->assertDontSee('Submit request')
            ->assertDontSee('refund')
            ->assertDontSee('cancellation')
            ->assertDontSee('request reported via whatsapp');

        $this->actingAs($admin)->get(route('admin.licenses.index'))
            ->assertOk()
            ->assertSee('Reported via Whatsapp');
    }

    public function test_code_manager_cannot_record_refund_after_thirty_days_but_can_record_cancellation(): void
    {
        [, , $manager, , , $code] = $this->paidLicence(now()->subDays(31));

        $this->actingAs($manager)->post(route('code-manager.parent-requests.store', $code->uuid), [
            'type' => 'refund',
            'contact_method' => 'phone',
            'reason' => 'Please return the payment for this package.',
        ])->assertSessionHasErrors('request');

        $this->actingAs($manager)->post(route('code-manager.parent-requests.store', $code->uuid), [
            'type' => 'cancellation',
            'contact_method' => 'phone',
            'reason' => 'Please cancel this licence and child access.',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseHas('license_adjustment_requests', [
            'activation_code_id' => $code->id,
            'type' => 'cancellation',
            'refund_eligible' => false,
            'refund_amount' => '0.00',
        ]);
    }

    public function test_admin_approval_cancels_child_access_but_preserves_parent_and_child_accounts(): void
    {
        [$parent, $child, $manager, $admin, , $code] = $this->paidLicence(now()->subDays(5), true);

        $this->actingAs($manager)->post(route('code-manager.parent-requests.store', $code->uuid), [
            'type' => 'refund',
            'contact_method' => 'email',
            'reason' => 'We need to stop using the learning package.',
        ])->assertRedirect();
        $adjustment = LicenseAdjustmentRequest::firstOrFail();

        $this->actingAs($admin)->post(route('admin.license-requests.approve', $adjustment), [
            'admin_notes' => 'Eligibility and payment checked.',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $adjustment->refresh();
        $this->assertSame(LicenseAdjustmentRequest::STATUS_APPROVED, $adjustment->status);
        $this->assertNotNull($adjustment->refund_due_at);
        $this->assertSame(ChildSubscription::STATUS_CANCELLED, ChildSubscription::where('activation_code_id', $code->id)->value('status'));
        $this->assertDatabaseHas('users', ['id' => $parent->id, 'is_active' => true]);
        $this->assertDatabaseHas('users', ['id' => $child->id, 'is_active' => true]);

        $this->actingAs($child)->get(route('dashboard'))->assertRedirect(route('child.subscription-required'));
        $this->actingAs($parent)->get(route('parent.dashboard'))->assertOk();
    }

    public function test_completed_refund_updates_payment_without_showing_adjustment_details_to_parent(): void
    {
        [$parent, , $manager, $admin, $payment, $code] = $this->paidLicence(now()->subDays(5));
        $this->actingAs($manager)->post(route('code-manager.parent-requests.store', $code->uuid), [
            'type' => 'refund',
            'contact_method' => 'whatsapp',
            'reason' => 'We purchased this package by mistake.',
        ]);
        $adjustment = LicenseAdjustmentRequest::firstOrFail();
        $this->actingAs($admin)->post(route('admin.license-requests.approve', $adjustment));

        $this->actingAs($admin)->post(route('admin.license-requests.complete', $adjustment), [
            'refund_reference' => 'REFUND-TEST-001',
            'admin_notes' => 'Bank transfer completed.',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertSame(PackagePayment::STATUS_REFUNDED, $payment->fresh()->status);
        $this->assertDatabaseHas('license_adjustment_requests', [
            'id' => $adjustment->id,
            'status' => 'completed',
            'refund_reference' => 'REFUND-TEST-001',
        ]);
        $this->actingAs($parent)->get(route('parent.subscriptions.index'))
            ->assertOk()
            ->assertSee('/images/package/standard1-3.png')
            ->assertDontSee('REFUND-TEST-001');
        $this->actingAs($parent)->get(route('parent.payment-log.index'))
            ->assertOk()
            ->assertDontSee('REFUND-TEST-001')
            ->assertDontSee('refund')
            ->assertDontSee('cancellation');
    }

    private function paidLicence($paidAt, bool $redeemed = false): array
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $child = User::factory()->create(['role_id' => User::ROLE_CHILD]);
        $manager = User::factory()->create(['role_id' => User::ROLE_CODE_MANAGER]);
        $admin = User::factory()->create(['role_id' => User::ROLE_ADMIN]);
        Student::create(['code' => 'HT-'.strtoupper(fake()->unique()->bothify('????####')), 'user_id' => $child->id, 'parent_id' => $parent->id, 'full_name' => $child->name, 'level_id' => 1]);
        $package = Package::create([
            'name' => 'Standard 1–3', 'code' => 'STD-1-3', 'description' => 'Test licence',
            'curriculum_group' => 'standard_1_3', 'price' => 99, 'currency' => 'MYR',
            'duration_days' => 365, 'max_children' => 1, 'is_active' => true,
        ]);
        $package->levels()->sync([1]);
        $payment = PackagePayment::create([
            'parent_id' => $parent->id, 'package_id' => $package->id, 'method' => 'online',
            'provider' => 'test', 'provider_reference' => 'PAY-'.fake()->unique()->uuid(),
            'status' => PackagePayment::STATUS_PAID, 'amount' => 99, 'currency' => 'MYR', 'paid_at' => $paidAt,
        ]);
        $code = app(ActivationCodeService::class)->issue($package, $parent, 'online_payment', $payment);

        if ($redeemed) {
            app(ActivationCodeService::class)->redeem($code->code_value, $parent, $child, 1);
            $code->refresh();
        }

        return [$parent, $child, $manager, $admin, $payment, $code];
    }
}
