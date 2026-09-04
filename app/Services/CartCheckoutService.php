<?php

namespace App\Services;

use App\Mail\CartCheckoutReceipt;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentTransaction;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class CartCheckoutService
{
    public function __construct(private readonly ActivationCodeService $activationCodes) {}

    public function checkout(Request $request, Order $order): array
    {
        $result = DB::transaction(function () use ($request, $order): array {
            $parent = $request->user();
            $order = Order::query()
                ->whereKey($order->id)
                ->where('parent_id', $parent->id)
                ->where('status', Order::STATUS_DRAFT)
                ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                ->lockForUpdate()
                ->firstOrFail();
            $items = $order->items()->with(['package', 'durationOption'])->lockForUpdate()->get();

            if ($items->isEmpty()) {
                throw ValidationException::withMessages(['cart' => 'Your cart is empty.']);
            }

            $transaction = PaymentTransaction::create([
                'order_id' => $order->id,
                'provider' => 'internal_submit',
                'provider_order_reference' => $order->order_number,
                'provider_transaction_reference' => 'HT-CART-'.now()->format('Ymd').'-'.Str::upper(Str::random(10)),
                'status' => PaymentTransaction::STATUS_PAID,
                'amount' => $order->total,
                'currency' => $order->currency,
                'payment_channel' => 'submit_only',
                'message' => 'Temporary internal cart payment.',
                'paid_at' => now(),
                'metadata' => ['payment_mode' => 'submit_only', 'item_count' => $items->count()],
            ]);

            foreach ($items as $item) {
                if ($item->item_type !== OrderItem::TYPE_NEW || $item->fulfillment_status !== OrderItem::FULFILLMENT_PENDING) {
                    throw ValidationException::withMessages(['cart' => 'One cart item cannot be fulfilled.']);
                }

                if (User::query()->where('username', $item->new_child_username)->exists()) {
                    throw ValidationException::withMessages(['cart' => "Username {$item->new_child_username} is no longer available."]);
                }

                $child = User::create([
                    'name' => $item->new_child_name,
                    'display_name' => $item->new_child_name,
                    'username' => $item->new_child_username,
                    'email' => $item->new_child_username.'@children.hometutor.local',
                    'password' => $item->new_child_password_hash,
                    'role_id' => User::ROLE_CHILD,
                    'is_active' => true,
                ]);

                Student::create([
                    'user_id' => $child->id,
                    'parent_id' => $parent->id,
                    'code' => 'HT-'.Str::upper(Str::random(10)),
                    'full_name' => $item->new_child_name,
                    'level_id' => $item->new_child_level_id,
                    'class_name' => $item->new_child_class_name,
                ]);

                $code = $this->activationCodes->issue(
                    package: $item->package,
                    parent: $parent,
                    source: 'cart_checkout',
                    generatedBy: $parent,
                    reason: "Automatically generated for {$order->order_number}.",
                    email: $parent->email,
                    intendedUse: 'new',
                    durationDays: $item->duration_days,
                    purchaseAmount: $item->total,
                    sendEmail: false,
                );
                $code->update(['metadata' => [
                    'order_id' => $order->id,
                    'order_item_id' => $item->id,
                    'payment_transaction_id' => $transaction->id,
                ]]);

                $this->activationCodes->redeem(
                    $code->code_value,
                    $parent,
                    $child,
                    (int) $item->new_child_level_id,
                    $request,
                    'new',
                    $item,
                    $transaction,
                );

                $item->update([
                    'fulfillment_status' => OrderItem::FULFILLMENT_FULFILLED,
                    'fulfilled_child_user_id' => $child->id,
                    'fulfilled_at' => now(),
                ]);
                $item->usernameReservation?->update(['released_at' => now()]);
            }

            $order->update([
                'status' => Order::STATUS_FULFILLED,
                'provider' => 'internal_submit',
                'paid_at' => now(),
            ]);

            return compact('order', 'transaction');
        });

        $result['receipt_sent'] = false;

        try {
            $result['order']->load(['items.package', 'items.durationOption', 'items.fulfilledChild.student.level']);
            Mail::to($request->user()->email)->send(new CartCheckoutReceipt($result['order'], $result['transaction']));
            $result['receipt_sent'] = true;
        } catch (Throwable $exception) {
            report($exception);
        }

        return $result;
    }
}
