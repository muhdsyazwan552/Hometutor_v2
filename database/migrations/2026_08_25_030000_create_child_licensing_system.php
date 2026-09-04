<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->string('code', 50)->nullable()->unique()->after('id');
            $table->string('curriculum_group', 50)->nullable()->index()->after('description');
        });

        Schema::create('package_level', function (Blueprint $table) {
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('level_id');
            $table->primary(['package_id', 'level_id']);
            $table->index('level_id');
        });

        Schema::create('package_payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('parent_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('package_id')->constrained()->restrictOnDelete();
            $table->string('method', 30)->default('manual');
            $table->string('status', 30)->default('pending')->index();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('MYR');
            $table->string('manual_reference')->nullable()->index();
            $table->text('parent_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['parent_id', 'status']);
        });

        Schema::create('activation_codes', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->char('code_hash', 64)->unique();
            $table->text('code_value');
            $table->string('code_last_four', 4)->index();
            $table->foreignId('package_id')->constrained()->restrictOnDelete();
            $table->foreignId('purchaser_parent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('package_payment_id')->nullable()->constrained('package_payments')->nullOnDelete();
            $table->string('source', 40)->index();
            $table->string('status', 30)->default('unused')->index();
            $table->string('sent_to_email')->nullable();
            $table->timestamp('emailed_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamp('redeemed_at')->nullable();
            $table->foreignId('redeemed_by_child_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('revoked_at')->nullable();
            $table->text('invalid_reason')->nullable();
            $table->foreignId('generated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('generation_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['purchaser_parent_id', 'status']);
        });

        Schema::create('activation_code_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activation_code_id')->nullable()->constrained()->nullOnDelete();
            $table->char('code_fingerprint', 64)->index();
            $table->string('code_last_four', 4)->nullable();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 40)->index();
            $table->string('result', 40)->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('child_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('child_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('package_id')->constrained()->restrictOnDelete();
            $table->foreignId('activation_code_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->foreignId('previous_subscription_id')->nullable()->constrained('child_subscriptions')->nullOnDelete();
            $table->string('status', 30)->default('active')->index();
            $table->string('source', 40)->default('activation_code');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->index();
            $table->timestamps();
            $table->index(['child_user_id', 'status', 'ends_at']);
        });

        $this->backfillLegacySubscriptions();
    }

    private function backfillLegacySubscriptions(): void
    {
        if (! Schema::hasTable('subscriptions') || ! Schema::hasTable('students')) {
            return;
        }

        DB::table('subscriptions')
            ->where('status', 'active')
            ->whereNotNull('starts_at')
            ->whereNotNull('ends_at')
            ->orderBy('id')
            ->get()
            ->each(function (object $subscription): void {
                DB::table('students')
                    ->where('parent_id', $subscription->parent_id)
                    ->pluck('user_id')
                    ->each(function (int $childUserId) use ($subscription): void {
                        $exists = DB::table('child_subscriptions')
                            ->where('child_user_id', $childUserId)
                            ->where('ends_at', $subscription->ends_at)
                            ->exists();

                        if (! $exists) {
                            DB::table('child_subscriptions')->insert([
                                'uuid' => (string) Str::uuid(),
                                'child_user_id' => $childUserId,
                                'package_id' => $subscription->package_id,
                                'status' => 'active',
                                'source' => 'legacy_parent_subscription',
                                'starts_at' => $subscription->starts_at,
                                'ends_at' => $subscription->ends_at,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }
                    });
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('child_subscriptions');
        Schema::dropIfExists('activation_code_attempts');
        Schema::dropIfExists('activation_codes');
        Schema::dropIfExists('package_payments');
        Schema::dropIfExists('package_level');
        Schema::table('packages', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropColumn(['code', 'curriculum_group']);
        });
    }
};
