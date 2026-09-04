<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_duration_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('months');
            $table->unsignedInteger('duration_days');
            $table->decimal('price', 10, 2);
            $table->string('currency', 3)->default('MYR');
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->unique(['package_id', 'months']);
        });

        Schema::table('package_payments', function (Blueprint $table) {
            $table->foreignId('package_duration_option_id')->nullable()->after('package_id')
                ->constrained('package_duration_options')->nullOnDelete();
        });

        Schema::table('activation_codes', function (Blueprint $table) {
            $table->unsignedInteger('duration_days')->nullable()->after('package_id');
            $table->decimal('purchase_amount', 10, 2)->nullable()->after('duration_days');
        });

        $now = now();
        DB::table('packages')->where('is_active', true)->whereNotNull('curriculum_group')->pluck('id')
            ->each(function (int $packageId) use ($now): void {
                DB::table('package_duration_options')->insert([
                    [
                        'package_id' => $packageId,
                        'months' => 6,
                        'duration_days' => 183,
                        'price' => 500,
                        'currency' => 'MYR',
                        'is_active' => true,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                    [
                        'package_id' => $packageId,
                        'months' => 12,
                        'duration_days' => 365,
                        'price' => 700,
                        'currency' => 'MYR',
                        'is_active' => true,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                ]);
            });

        DB::table('packages')->where('is_active', true)->whereNotNull('curriculum_group')->update([
            'price' => 500,
            'duration_days' => 365,
            'updated_at' => $now,
        ]);
    }

    public function down(): void
    {
        Schema::table('activation_codes', function (Blueprint $table) {
            $table->dropColumn(['duration_days', 'purchase_amount']);
        });

        Schema::table('package_payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('package_duration_option_id');
        });

        Schema::dropIfExists('package_duration_options');
    }
};
