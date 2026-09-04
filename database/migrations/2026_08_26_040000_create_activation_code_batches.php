<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activation_code_batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('reference', 80)->unique();
            $table->string('source_type', 20)->index();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event_name')->nullable();
            $table->foreignId('package_id')->constrained()->restrictOnDelete();
            $table->foreignId('package_duration_option_id')->nullable()->constrained('package_duration_options')->nullOnDelete();
            $table->unsignedInteger('quantity');
            $table->string('status', 20)->default('completed')->index();
            $table->timestamp('expires_at')->nullable()->index();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::table('activation_codes', function (Blueprint $table) {
            $table->foreignId('activation_code_batch_id')->nullable()->after('package_payment_id')
                ->constrained('activation_code_batches')->nullOnDelete();
            $table->index(['activation_code_batch_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('activation_codes', function (Blueprint $table) {
            $table->dropIndex(['activation_code_batch_id', 'status']);
            $table->dropConstrainedForeignId('activation_code_batch_id');
        });

        Schema::dropIfExists('activation_code_batches');
    }
};
