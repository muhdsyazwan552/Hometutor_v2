<?php

namespace Tests\Feature;

use App\Mail\CartCheckoutReceipt;
use App\Models\ActivationCode;
use App\Models\ChildSubscription;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Package;
use App\Models\PackageDurationOption;
use App\Models\PaymentTransaction;
use App\Models\User;
use App\Models\UsernameReservation;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class CartCheckoutTest extends TestCase
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
        DB::table('level')->insert([
            ['id' => 1, 'name' => 'Standard 1', 'is_active' => true],
            ['id' => 4, 'name' => 'Standard 4', 'is_active' => true],
        ]);
    }

    public function test_parent_can_add_multiple_child_packages_and_pay_once(): void
    {
        Mail::fake();
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        [$lowerPackage, $lowerSix] = $this->package('Standard 1–3', 'STD-1-3', 'standard_1_3', 1, 500);
        [$upperPackage, , $upperTwelve] = $this->package('Standard 4–6', 'STD-4-6', 'standard_4_6', 4, 500);

        $this->actingAs($parent)->post(route('parent.packages.cart.store', $lowerPackage), [
            'duration_option_id' => $lowerSix->id,
            'name' => 'First Cart Child',
            'username' => 'first_cart_child',
            'password' => 'strong-password-1',
            'password_confirmation' => 'strong-password-1',
            'level_id' => 1,
        ])->assertRedirect(route('parent.cart.index'));

        $this->actingAs($parent)->post(route('parent.packages.cart.store', $upperPackage), [
            'duration_option_id' => $upperTwelve->id,
            'name' => 'Second Cart Child',
            'username' => 'second_cart_child',
            'password' => 'strong-password-2',
            'password_confirmation' => 'strong-password-2',
            'level_id' => 4,
        ])->assertRedirect(route('parent.cart.index'));

        $order = Order::firstOrFail();
        $this->assertSame(Order::STATUS_DRAFT, $order->status);
        $this->assertSame('1200.00', $order->total);
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 2);
        $this->assertDatabaseMissing('users', ['username' => 'first_cart_child']);
        $this->assertDatabaseMissing('users', ['username' => 'second_cart_child']);
        $this->assertTrue(Hash::check('strong-password-1', OrderItem::where('new_child_username', 'first_cart_child')->firstOrFail()->new_child_password_hash));

        $this->actingAs($parent)->get(route('parent.cart.index'))
            ->assertOk()
            ->assertSee('Cart with 2 items')
            ->assertSee('First Cart Child')
            ->assertSee('Second Cart Child')
            ->assertSee('MYR 1,200.00')
            ->assertSee('Pay once for all packages');

        $firstItem = OrderItem::query()->where('new_child_username', 'first_cart_child')->firstOrFail();
        $this->actingAs($parent)->get(route('parent.cart.items.edit', $firstItem->uuid))
            ->assertOk()
            ->assertSee('Edit cart item')
            ->assertSee('First Cart Child');
        $this->actingAs($parent)->patch(route('parent.cart.items.update', $firstItem->uuid), [
            'duration_option_id' => $lowerSix->id,
            'name' => 'Updated First Child',
            'username' => 'updated_first_child',
            'password' => 'updated-password-1',
            'password_confirmation' => 'updated-password-1',
            'level_id' => 1,
            'class_name' => '1 Bestari',
        ])->assertRedirect(route('parent.cart.index'));
        $this->assertNotNull(UsernameReservation::query()->where('username', 'first_cart_child')->firstOrFail()->released_at);
        $this->assertNull(UsernameReservation::query()->where('username', 'updated_first_child')->firstOrFail()->released_at);
        $this->assertDatabaseHas('order_items', ['id' => $firstItem->id, 'new_child_name' => 'Updated First Child', 'new_child_username' => 'updated_first_child', 'new_child_class_name' => '1 Bestari']);

        $this->actingAs($parent)->post(route('parent.cart.checkout'))
            ->assertRedirect(route('parent.children.index'));

        $this->assertSame(Order::STATUS_FULFILLED, $order->fresh()->status);
        $this->assertDatabaseCount('payment_transactions', 1);
        $this->assertDatabaseHas('payment_transactions', ['order_id' => $order->id, 'status' => PaymentTransaction::STATUS_PAID, 'amount' => 1200]);
        $this->assertDatabaseCount('child_subscriptions', 2);
        $this->assertDatabaseCount('activation_codes', 2);
        $this->assertDatabaseMissing('order_items', ['order_id' => $order->id, 'fulfillment_status' => OrderItem::FULFILLMENT_PENDING]);
        $this->assertDatabaseMissing('users', ['username' => 'first_cart_child']);
        $this->assertDatabaseHas('users', ['username' => 'updated_first_child']);
        $this->assertDatabaseHas('users', ['username' => 'second_cart_child']);
        $this->assertTrue(Hash::check('updated-password-1', User::query()->where('username', 'updated_first_child')->firstOrFail()->password));
        $this->assertTrue(Hash::check('strong-password-2', User::query()->where('username', 'second_cart_child')->firstOrFail()->password));
        $this->assertSame(2, ActivationCode::query()->where('status', ActivationCode::STATUS_REDEEMED)->count());
        $this->assertSame(2, ChildSubscription::query()->where('payment_transaction_id', PaymentTransaction::firstOrFail()->id)->count());
        $this->actingAs($parent)->get(route('parent.children.index'))->assertOk()->assertSee('Cart with 0 items');
        Mail::assertSent(CartCheckoutReceipt::class, fn ($mail) => $mail->hasTo($parent->email)
            && str_contains($mail->render(), 'Updated First Child')
            && str_contains($mail->render(), 'Second Cart Child')
            && str_contains($mail->render(), 'MYR 1,200.00'));
    }

    private function package(string $name, string $code, string $group, int $levelId, int $sixMonthPrice): array
    {
        $package = Package::create([
            'name' => $name,
            'code' => $code,
            'description' => 'Cart test package',
            'curriculum_group' => $group,
            'price' => $sixMonthPrice,
            'currency' => 'MYR',
            'duration_days' => 365,
            'max_children' => 1,
            'is_active' => true,
        ]);
        $package->levels()->sync([$levelId]);
        $six = PackageDurationOption::create(['package_id' => $package->id, 'months' => 6, 'duration_days' => 183, 'price' => $sixMonthPrice, 'currency' => 'MYR', 'is_active' => true]);
        $twelve = PackageDurationOption::create(['package_id' => $package->id, 'months' => 12, 'duration_days' => 365, 'price' => $sixMonthPrice + 200, 'currency' => 'MYR', 'is_active' => true]);

        return [$package, $six, $twelve];
    }
}
