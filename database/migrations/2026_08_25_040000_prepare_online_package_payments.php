<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('package_payments', function (Blueprint $table) {
            $table->string('provider', 50)->nullable()->index()->after('method');
            $table->string('provider_reference', 191)->nullable()->unique()->after('provider');
            $table->timestamp('paid_at')->nullable()->index()->after('rejected_at');
        });

        Schema::table('activation_codes', function (Blueprint $table) {
            $table->unique('package_payment_id');
        });
    }

    public function down(): void
    {
        Schema::table('activation_codes', function (Blueprint $table) {
            $table->dropUnique(['package_payment_id']);
        });

        Schema::table('package_payments', function (Blueprint $table) {
            $table->dropUnique(['provider_reference']);
            $table->dropIndex(['provider']);
            $table->dropIndex(['paid_at']);
            $table->dropColumn(['provider', 'provider_reference', 'paid_at']);
        });
    }
};
