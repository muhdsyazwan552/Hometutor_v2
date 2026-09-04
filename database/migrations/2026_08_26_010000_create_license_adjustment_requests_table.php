<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('license_adjustment_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('parent_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('package_payment_id')->nullable()->constrained('package_payments')->nullOnDelete();
            $table->foreignId('activation_code_id')->constrained('activation_codes')->restrictOnDelete();
            $table->foreignId('child_subscription_id')->nullable()->constrained('child_subscriptions')->nullOnDelete();
            $table->string('type', 30)->index();
            $table->string('status', 30)->default('requested')->index();
            $table->text('reason');
            $table->timestamp('purchased_at');
            $table->timestamp('requested_at');
            $table->boolean('refund_eligible')->default(false);
            $table->decimal('refund_amount', 10, 2)->default(0);
            $table->string('currency', 3)->default('MYR');
            $table->timestamp('refund_due_at')->nullable()->index();
            $table->string('refund_reference')->nullable()->unique();
            $table->text('admin_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('completed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['parent_id', 'created_at']);
            $table->index(['activation_code_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('license_adjustment_requests');
    }
};
