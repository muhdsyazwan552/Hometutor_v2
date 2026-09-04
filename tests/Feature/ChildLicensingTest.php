<?php

namespace Tests\Feature;

use App\Mail\ActivationCodeIssued;
use App\Mail\AssistedChildAccountCreated;
use App\Models\ActivationCode;
use App\Models\ChildSubscription;
use App\Models\Company;
use App\Models\OrderItem;
use App\Models\Package;
use App\Models\PackageDurationOption;
use App\Models\PackagePayment;
use App\Models\Student;
use App\Models\User;
use App\Services\ActivationCodeService;
use App\Services\OnlinePaymentFulfillmentService;
use App\Services\SubscriptionOrderService;
use App\Services\SubscriptionService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ChildLicensingTest extends TestCase
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
        });
        DB::table('level')->insert(['id' => 1, 'name' => 'Standard 1', 'abbr' => 'ST1', 'is_active' => true]);
    }

    public function test_admin_direct_code_generation_logs_who_generated_it_and_emails_parent(): void
    {
        Mail::fake();
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $admin = User::factory()->create(['role_id' => User::ROLE_ADMIN]);
        $package = $this->package();

        $this->actingAs($admin)->post(route('admin.licenses.generate'), [
            'parent_login' => $parent->email,
            'package_id' => $package->id,
            'generation_reason' => 'WhatsApp arrangement REF-123',
        ])->assertRedirect();

        $code = ActivationCode::firstOrFail();
        $this->assertSame(ActivationCode::STATUS_UNUSED, $code->status);
        $this->assertSame('admin_manual', $code->source);
        $this->assertSame($parent->id, $code->purchaser_parent_id);
        $this->assertSame($admin->id, $code->generated_by_user_id);
        $this->assertSame('WhatsApp arrangement REF-123', $code->generation_reason);
        $this->assertDatabaseCount('package_payments', 0);
        $this->assertDatabaseHas('activation_code_attempts', ['activation_code_id' => $code->id, 'action' => 'generate', 'result' => 'generated']);
        $this->assertDatabaseHas('activation_code_attempts', ['activation_code_id' => $code->id, 'action' => 'email', 'result' => 'sent']);
        Mail::assertSent(ActivationCodeIssued::class, fn ($mail) => $mail->hasTo($parent->email));
    }

    public function test_online_payment_fulfillment_is_idempotent_and_emails_one_code(): void
    {
        Mail::fake();
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $package = $this->package();
        $service = app(OnlinePaymentFulfillmentService::class);

        $firstCode = $service->fulfill($parent, $package, 'future_gateway', 'gateway-payment-123', '99.00', 'MYR', ['event' => 'paid']);
        $retryCode = $service->fulfill($parent, $package, 'future_gateway', 'gateway-payment-123', '99.00', 'MYR', ['event' => 'paid']);

        $this->assertSame($firstCode->id, $retryCode->id);
        $this->assertDatabaseCount('package_payments', 1);
        $this->assertDatabaseCount('activation_codes', 1);
        $this->assertDatabaseHas('package_payments', [
            'provider' => 'future_gateway',
            'provider_reference' => 'gateway-payment-123',
            'status' => PackagePayment::STATUS_PAID,
        ]);
        $this->assertSame('online_payment', $firstCode->source);
        $this->assertNull($firstCode->generated_by_user_id);
        Mail::assertSent(ActivationCodeIssued::class, 1);
    }

    public function test_explode_reference_code_generates_an_xcln_activation_code_after_payment(): void
    {
        Mail::fake();
        $explode = Company::query()->where('reference_code', 'EXPLODE')->firstOrFail();
        $explode->update(['code_series' => 'XCLN']);
        $parent = User::factory()->create([
            'role_id' => User::ROLE_PARENT,
            'company_id' => $explode->id,
            'registration_reference_code' => 'EXPLODE',
        ]);
        $package = $this->package();

        $code = app(OnlinePaymentFulfillmentService::class)->fulfill(
            $parent,
            $package,
            'future_gateway',
            'explode-payment-123',
            '99.00',
        );

        $this->assertSame('XCLN', $code->series_prefix);
        $this->assertStringStartsWith('XCLN-', $code->code_value);
    }

    public function test_successful_payment_handoff_automatically_includes_code_on_create_child_form(): void
    {
        Mail::fake();
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $otherParent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $package = $this->package();
        $code = app(OnlinePaymentFulfillmentService::class)->fulfill(
            $parent,
            $package,
            'future_gateway',
            'gateway-payment-auto-child',
            '99.00',
        );
        $payment = $code->payment;

        $this->actingAs($otherParent)
            ->get(route('parent.payments.create-child', $payment))
            ->assertNotFound();

        $this->actingAs($parent)
            ->get(route('parent.payments.create-child', $payment))
            ->assertRedirect(route('parent.children.create', ['activation' => $code->uuid]));

        $this->actingAs($parent)
            ->get(route('parent.children.create', ['activation' => $code->uuid]))
            ->assertOk()
            ->assertSee('Payment successful')
            ->assertSee('Included automatically')
            ->assertSee($code->code_value)
            ->assertSee('Standard 1');
    }

    public function test_admin_can_simulate_standard_one_to_three_online_payment(): void
    {
        Mail::fake();
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $admin = User::factory()->create(['role_id' => User::ROLE_ADMIN]);
        $this->package();

        $this->actingAs($admin)->post(route('admin.licenses.test-online-payment'), [
            'parent_login' => $parent->email,
        ])->assertRedirect();

        $payment = PackagePayment::firstOrFail();
        $this->assertSame('admin_test', $payment->provider);
        $this->assertSame($admin->id, $payment->metadata['initiated_by_user_id']);
        $this->assertTrue($payment->metadata['test_mode']);
        $this->assertDatabaseHas('activation_codes', [
            'package_payment_id' => $payment->id,
            'source' => 'online_payment',
            'purchaser_parent_id' => $parent->id,
        ]);
        Mail::assertSent(ActivationCodeIssued::class, fn ($mail) => $mail->hasTo($parent->email));
    }

    public function test_admin_login_opens_full_page_license_management(): void
    {
        $admin = User::factory()->create(['role_id' => User::ROLE_ADMIN]);

        $this->withHeader('X-Inertia', 'true')
            ->post('/login', ['username' => $admin->username, 'password' => 'password'])
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', route('admin.licenses.index', absolute: false));
    }

    public function test_code_manager_login_opens_full_page_code_management(): void
    {
        $manager = User::factory()->create(['role_id' => User::ROLE_CODE_MANAGER]);

        $this->withHeader('X-Inertia', 'true')
            ->post('/login', ['username' => $manager->username, 'password' => 'password'])
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', route('code-manager.index', absolute: false));
    }

    public function test_role_four_code_manager_can_open_portal_and_generate_new_child_code(): void
    {
        Mail::fake();
        $manager = User::factory()->create(['role_id' => User::ROLE_CODE_MANAGER]);
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $package = $this->package();

        $this->actingAs($manager)->get(route('code-manager.index'))
            ->assertOk()
            ->assertSee('Activation-code dashboard');

        $this->actingAs($manager)->post(route('code-manager.codes.store'), [
            'parent_login' => $parent->email,
            'package_id' => $package->id,
            'intended_use' => 'new',
            'generation_reason' => 'New account payment TEST-NEW',
        ])->assertRedirect(route('code-manager.index'));

        $code = ActivationCode::firstOrFail();
        $this->assertSame('new', $code->intended_use);
        $this->assertSame('code_manager', $code->source);
        $this->assertSame($manager->id, $code->generated_by_user_id);
        $this->assertNull($code->renewal_child_id);
        Mail::assertSent(ActivationCodeIssued::class, fn ($mail) => $mail->hasTo($parent->email));
    }

    public function test_code_manager_can_record_selected_duration_price_and_optional_receipt(): void
    {
        Mail::fake();
        Storage::fake();
        $manager = User::factory()->create(['role_id' => User::ROLE_CODE_MANAGER]);
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $package = $this->package();
        $option = PackageDurationOption::create(['package_id' => $package->id, 'months' => 6, 'duration_days' => 183, 'price' => 59.90, 'currency' => 'MYR', 'is_active' => true]);

        $this->actingAs($manager)->post(route('code-manager.codes.store'), [
            'parent_login' => $parent->email,
            'package_id' => $package->id,
            'intended_use' => 'new',
            'duration_option_id' => $option->id,
            'receipt' => UploadedFile::fake()->create('payment-receipt.pdf', 100, 'application/pdf'),
            'generation_reason' => 'Manual payment with receipt',
        ])->assertRedirect(route('code-manager.index'));

        $code = ActivationCode::firstOrFail();
        $this->assertSame(183, $code->duration_days);
        $this->assertSame('59.90', $code->purchase_amount);
        $this->assertSame(6, $code->metadata['duration_months']);
        Storage::assertExists($code->metadata['receipt_path']);
    }

    public function test_code_manager_can_create_child_and_auto_generate_code_for_parent(): void
    {
        Mail::fake();
        $manager = User::factory()->create(['role_id' => User::ROLE_CODE_MANAGER]);
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $package = $this->package();
        $option = PackageDurationOption::create(['package_id' => $package->id, 'months' => 6, 'duration_days' => 183, 'price' => 59.90, 'currency' => 'MYR', 'is_active' => true]);

        $this->actingAs($manager)->post(route('code-manager.assisted-child.store'), [
            'parent_id' => $parent->id,
            'has_code' => 'no',
            'package_id' => $package->id,
            'duration_option_id' => $option->id,
            'name' => 'Assisted Child',
            'username' => 'assisted_child',
            'password' => 'secure-pass',
            'password_confirmation' => 'secure-pass',
            'level_id' => 1,
        ])->assertRedirect(route('code-manager.assisted-child.create'));

        $child = User::query()->where('username', 'assisted_child')->firstOrFail();
        $code = ActivationCode::firstOrFail();
        $this->assertSame(ActivationCode::STATUS_REDEEMED, $code->status);
        $this->assertSame(183, $code->duration_days);
        $this->assertSame($parent->id, $child->student->parent_id);
        $this->assertNotEmpty($child->student->class_name);
        Mail::assertSent(AssistedChildAccountCreated::class, fn ($mail) => $mail->hasTo($parent->email) && $mail->childPassword === 'secure-pass');
    }

    public function test_code_manager_can_create_child_with_a_valid_existing_code(): void
    {
        Mail::fake();
        $manager = User::factory()->create(['role_id' => User::ROLE_CODE_MANAGER]);
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $package = $this->package();
        $code = app(ActivationCodeService::class)->issue($package, $parent, 'code_manager', generatedBy: $manager, intendedUse: 'new', sendEmail: false);

        $this->actingAs($manager)->post(route('code-manager.assisted-child.store'), [
            'parent_id' => $parent->id,
            'has_code' => 'yes',
            'activation_code' => strtolower($code->code_value),
            'name' => 'Existing Code Child',
            'username' => 'existing_code_child',
            'password' => 'secure-pass',
            'password_confirmation' => 'secure-pass',
            'level_id' => 1,
        ])->assertRedirect(route('code-manager.assisted-child.create'));

        $this->assertDatabaseCount('activation_codes', 1);
        $this->assertSame(ActivationCode::STATUS_REDEEMED, $code->fresh()->status);
        $this->assertDatabaseHas('students', ['parent_id' => $parent->id, 'full_name' => 'Existing Code Child']);
        Mail::assertSent(AssistedChildAccountCreated::class, fn ($mail) => $mail->hasTo($parent->email));
    }

    public function test_renewal_code_is_bound_to_the_selected_child(): void
    {
        Mail::fake();
        $manager = User::factory()->create(['role_id' => User::ROLE_CODE_MANAGER]);
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $targetChild = User::factory()->create(['role_id' => User::ROLE_CHILD, 'username' => 'renew_target']);
        $otherChild = User::factory()->create(['role_id' => User::ROLE_CHILD, 'username' => 'renew_other']);
        $targetStudent = Student::create(['code' => 'HT-TARGET', 'user_id' => $targetChild->id, 'parent_id' => $parent->id, 'full_name' => 'Target Child', 'level_id' => 1]);
        $otherStudent = Student::create(['code' => 'HT-OTHER', 'user_id' => $otherChild->id, 'parent_id' => $parent->id, 'full_name' => 'Other Child', 'level_id' => 1]);
        $package = $this->package();

        $this->actingAs($manager)->post(route('code-manager.codes.store'), [
            'parent_login' => $parent->email,
            'package_id' => $package->id,
            'intended_use' => 'renewal',
            'child_login' => $targetChild->username,
            'generation_reason' => 'Renew target child only',
        ])->assertRedirect(route('code-manager.index'));

        $code = ActivationCode::firstOrFail();
        $this->assertSame('renewal', $code->intended_use);
        $this->assertSame($targetChild->id, $code->renewal_child_id);

        $this->actingAs($parent)->post(route('parent.children.renew.store', $otherStudent->uuid), ['activation_code' => $code->code_value])
            ->assertSessionHasErrors('activation_code');
        $this->assertSame(ActivationCode::STATUS_UNUSED, $code->fresh()->status);

        $this->actingAs($parent)->post(route('parent.children.renew.store', $targetStudent->uuid), ['activation_code' => $code->code_value])
            ->assertRedirect(route('parent.children.index'));
        $this->assertSame(ActivationCode::STATUS_REDEEMED, $code->fresh()->status);
        $this->assertSame($targetChild->id, $code->fresh()->redeemed_by_child_id);
    }

    public function test_non_code_manager_cannot_open_code_manager_portal(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);

        $this->actingAs($parent)->get(route('code-manager.index'))
            ->assertRedirect(route('parent.dashboard'));
    }

    public function test_code_is_parent_bound_level_bound_single_use_and_invalid_attempts_are_logged(): void
    {
        Mail::fake();
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $otherParent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $package = $this->package();
        $code = app(ActivationCodeService::class)->issue($package, $parent, 'test');

        $this->actingAs($otherParent)->postJson(route('parent.activation-codes.validate'), ['activation_code' => $code->code_value])
            ->assertUnprocessable();
        $this->assertDatabaseHas('activation_code_attempts', ['activation_code_id' => $code->id, 'result' => 'wrong_parent']);

        $this->actingAs($parent)->post(route('parent.children.store'), [
            'activation_code' => $code->code_value,
            'name' => 'Licensed Child',
            'username' => 'licensed_child',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'level_id' => 1,
        ])->assertRedirect(route('parent.children.index'));

        $child = User::query()->where('username', 'licensed_child')->firstOrFail();
        $this->assertNotNull($child->activeChildSubscription());
        $this->assertSame(ActivationCode::STATUS_REDEEMED, $code->fresh()->status);

        $this->actingAs($parent)->postJson(route('parent.activation-codes.validate'), ['activation_code' => $code->code_value])
            ->assertUnprocessable();
        $this->assertSame(1, ChildSubscription::query()->where('activation_code_id', $code->id)->count());
    }

    public function test_renewal_extends_existing_child_expiry_without_losing_remaining_days(): void
    {
        Mail::fake();
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $child = User::factory()->create(['role_id' => User::ROLE_CHILD]);
        $student = Student::create(['code' => 'HT-RENEW', 'user_id' => $child->id, 'parent_id' => $parent->id, 'full_name' => 'Renew Child', 'level_id' => 1]);
        $package = $this->package();
        ChildSubscription::create(['child_user_id' => $child->id, 'package_id' => $package->id, 'status' => 'active', 'source' => 'test', 'starts_at' => now()->subDay(), 'ends_at' => now()->addDays(20)]);
        $oldEndsAt = $child->activeChildSubscription()->ends_at->copy();
        $code = app(ActivationCodeService::class)->issue($package, $parent, 'test');

        $this->actingAs($parent)->post(route('parent.children.renew.store', $student->uuid), ['activation_code' => $code->code_value])
            ->assertRedirect(route('parent.children.index'));

        $renewal = ChildSubscription::query()->where('activation_code_id', $code->id)->firstOrFail();
        $this->assertTrue($renewal->starts_at->equalTo($oldEndsAt));
        $this->assertTrue($renewal->ends_at->equalTo($oldEndsAt->copy()->addDays($package->duration_days)));
        $this->assertSame(ChildSubscription::STATUS_SCHEDULED, $renewal->status);
        $this->assertSame(ChildSubscription::TYPE_RENEWAL, $renewal->subscription_type);
    }

    public function test_subscription_service_creates_new_access_and_renewal_as_separate_records(): void
    {
        $child = User::factory()->create(['role_id' => User::ROLE_CHILD]);
        $package = $this->package();
        $service = app(SubscriptionService::class);

        $new = $service->grantNew($child, $package, 30, ChildSubscription::SOURCE_ADMIN_MANUAL);
        $renewal = $service->renew($child, $package, 60, ChildSubscription::SOURCE_ADMIN_MANUAL);

        $this->assertSame(ChildSubscription::TYPE_NEW, $new->subscription_type);
        $this->assertSame(ChildSubscription::STATUS_ACTIVE, $new->status);
        $this->assertSame(ChildSubscription::TYPE_RENEWAL, $renewal->subscription_type);
        $this->assertSame($new->id, $renewal->previous_subscription_id);
        $this->assertSame(ChildSubscription::STATUS_SCHEDULED, $renewal->status);
        $this->assertTrue($renewal->starts_at->equalTo($new->ends_at));
        $this->assertTrue($renewal->ends_at->equalTo($new->ends_at->copy()->addDays(60)));
    }

    public function test_order_service_keeps_new_child_details_pending_until_future_payment_fulfilment(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $package = $this->package();
        $service = app(SubscriptionOrderService::class);
        $order = $service->createDraft($parent);

        $item = $service->addNewChildItem($order, $package, [
            'name' => 'Pending Child',
            'username' => 'pending_child',
            'password' => 'secure-password',
            'level_id' => 1,
        ]);

        $this->assertSame(OrderItem::TYPE_NEW, $item->item_type);
        $this->assertSame(OrderItem::FULFILLMENT_PENDING, $item->fulfillment_status);
        $this->assertSame('pending_child', $item->new_child_username);
        $this->assertTrue(Hash::check('secure-password', $item->new_child_password_hash));
        $this->assertDatabaseMissing('users', ['username' => 'pending_child']);
        $this->assertDatabaseHas('username_reservations', ['username' => 'pending_child', 'order_item_id' => $item->id]);
        $this->assertSame('99.00', $order->fresh()->total);
    }

    private function package(): Package
    {
        $package = Package::create([
            'name' => 'Standard 1–3',
            'code' => 'STD-1-3',
            'description' => 'Test child licence',
            'curriculum_group' => 'standard_1_3',
            'price' => 99,
            'currency' => 'MYR',
            'duration_days' => 365,
            'max_children' => 1,
            'is_active' => true,
        ]);
        $package->levels()->sync([1]);

        return $package;
    }
}
