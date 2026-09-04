<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->unique()->after('id');
            $table->string('order_number', 50)->nullable()->unique()->after('uuid');
            $table->foreignId('parent_id')->nullable()->after('order_number')->constrained('users')->nullOnDelete();
            $table->string('status', 30)->default('draft')->index()->after('parent_id');
            $table->string('currency', 3)->default('MYR')->after('status');
            $table->decimal('subtotal', 12, 2)->default(0)->after('currency');
            $table->decimal('discount_total', 12, 2)->default(0)->after('subtotal');
            $table->decimal('tax_total', 12, 2)->default(0)->after('discount_total');
            $table->decimal('total', 12, 2)->default(0)->after('tax_total');
            $table->string('provider', 40)->nullable()->after('total');
            $table->timestamp('expires_at')->nullable()->after('provider');
            $table->timestamp('paid_at')->nullable()->after('expires_at');
            $table->timestamp('cancelled_at')->nullable()->after('paid_at');
            $table->json('metadata')->nullable()->after('cancelled_at');
            $table->index(['parent_id', 'status']);
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('item_type', 30)->default('new')->index();
            $table->string('fulfillment_status', 30)->default('pending')->index();
            $table->foreignId('child_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('package_id')->constrained()->restrictOnDelete();
            $table->foreignId('package_duration_option_id')->nullable()->constrained()->nullOnDelete();
            $table->string('package_name_snapshot')->nullable();
            $table->integer('duration_days');
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('discount_total', 12, 2)->default(0);
            $table->decimal('tax_total', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->string('currency', 3)->default('MYR');
            $table->string('new_child_name')->nullable();
            $table->string('new_child_username')->nullable();
            $table->text('new_child_password_hash')->nullable();
            $table->unsignedBigInteger('new_child_level_id')->nullable();
            $table->string('new_child_class_name')->nullable();
            $table->foreignId('fulfilled_child_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fulfilled_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['order_id', 'fulfillment_status']);
            $table->index(['child_user_id', 'item_type']);
        });

        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 40)->index();
            $table->string('provider_order_reference', 100)->nullable()->index();
            $table->string('provider_transaction_reference', 100)->nullable()->unique();
            $table->string('status', 30)->default('pending')->index();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('MYR');
            $table->string('payment_channel', 50)->nullable();
            $table->string('message')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['provider', 'provider_order_reference']);
        });

        Schema::create('payment_callback_events', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('payment_transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->string('provider', 40)->index();
            $table->string('provider_order_reference', 100)->nullable()->index();
            $table->string('provider_transaction_reference', 100)->nullable()->index();
            $table->string('payment_status', 30)->nullable()->index();
            $table->boolean('signature_valid')->nullable();
            $table->json('payload');
            $table->timestamp('received_at')->useCurrent();
            $table->timestamp('processed_at')->nullable();
            $table->string('processing_result', 50)->nullable();
            $table->text('processing_error')->nullable();
            $table->timestamps();
        });

        Schema::create('username_reservations', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->foreignId('order_item_id')->nullable()->constrained()->cascadeOnDelete();
            $table->timestamp('expires_at')->index();
            $table->timestamp('released_at')->nullable();
            $table->timestamps();
        });

        Schema::table('child_subscriptions', function (Blueprint $table) {
            $table->string('subscription_type', 30)->default('new')->index()->after('source');
            $table->foreignId('order_item_id')->nullable()->after('activation_code_id')->constrained()->nullOnDelete();
            $table->foreignId('payment_transaction_id')->nullable()->after('order_item_id')->constrained()->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable()->after('ends_at');
            $table->text('cancellation_reason')->nullable()->after('cancelled_at');
        });
    }

    public function down(): void
    {
        Schema::table('child_subscriptions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('payment_transaction_id');
            $table->dropConstrainedForeignId('order_item_id');
            $table->dropIndex(['subscription_type']);
            $table->dropColumn(['subscription_type', 'cancelled_at', 'cancellation_reason']);
        });

        Schema::dropIfExists('username_reservations');
        Schema::dropIfExists('payment_callback_events');
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('order_items');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropIndex(['parent_id', 'status']);
            $table->dropIndex(['status']);
            $table->dropUnique(['uuid']);
            $table->dropUnique(['order_number']);
            $table->dropColumn(['uuid', 'order_number', 'parent_id', 'status', 'currency', 'subtotal', 'discount_total', 'tax_total', 'total', 'provider', 'expires_at', 'paid_at', 'cancelled_at', 'metadata']);
        });
    }
};
