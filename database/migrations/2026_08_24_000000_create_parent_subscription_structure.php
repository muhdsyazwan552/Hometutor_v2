<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'role_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedSmallInteger('role_id')->default(7)->after('username');
            });
        }

        if (! Schema::hasColumn('users', 'display_name')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('display_name')->nullable()->after('role_id');
            });
        }

        if (! Schema::hasColumn('users', 'is_active')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('is_active')->default(true)->after('password');
            });
        }

        if (! Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table) {
                $table->unsignedInteger('id')->primary();
                $table->string('name', 100);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        DB::table('roles')->updateOrInsert(['id' => 6], [
            'name' => 'Child',
            'is_active' => true,
            'updated_at' => now(),
            'created_at' => now(),
        ]);
        DB::table('roles')->updateOrInsert(['id' => 7], [
            'name' => 'Parent',
            'is_active' => true,
            'updated_at' => now(),
            'created_at' => now(),
        ]);

        if (! Schema::hasTable('students')) {
            Schema::create('students', function (Blueprint $table) {
                $table->id();
                $table->string('code', 50)->unique();
                $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
                $table->foreignId('parent_id')->nullable()->constrained('users')->nullOnDelete();
                $table->unsignedBigInteger('school_id')->nullable();
                $table->string('ic_number', 12)->nullable();
                $table->string('full_name')->nullable();
                $table->unsignedBigInteger('level_id')->nullable();
                $table->string('profile_picture')->nullable();
                $table->string('class_name', 50)->nullable();
                $table->timestamps();
            });
        } elseif (! Schema::hasColumn('students', 'parent_id')) {
            Schema::table('students', function (Blueprint $table) {
                $table->foreignId('parent_id')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
            });
        }

        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('currency', 3)->default('MYR');
            $table->unsignedInteger('duration_days');
            $table->unsignedInteger('max_children')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('package_id')->constrained()->restrictOnDelete();
            $table->string('status', 20)->default('pending')->index();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 50);
            $table->string('provider_reference')->nullable()->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('MYR');
            $table->string('status', 20)->default('pending')->index();
            $table->timestamp('paid_at')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('packages');

        if (Schema::hasColumn('students', 'parent_id')) {
            Schema::table('students', function (Blueprint $table) {
                $table->dropConstrainedForeignId('parent_id');
            });
        }
    }
};
