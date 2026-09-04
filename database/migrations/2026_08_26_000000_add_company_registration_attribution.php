<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('reference_code', 50)->nullable()->unique();
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        $dasarJatiId = DB::table('companies')->insertGetId([
            'name' => 'Dasar Jati',
            'reference_code' => null,
            'is_default' => true,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('companies')->insert([
            'name' => 'Explode',
            'reference_code' => 'EXPLODE',
            'is_default' => false,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->string('registration_reference_code', 50)->nullable()->after('company_id');
            $table->timestamp('registered_at')->nullable()->after('email_verified_at');
            $table->index(['company_id', 'registered_at']);
        });

        // Existing accounts were registered before reference codes existed, so they
        // follow the same no-code rule and belong to Dasar Jati.
        DB::table('users')->update([
            'company_id' => $dasarJatiId,
            'registered_at' => DB::raw('created_at'),
        ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['company_id', 'registered_at']);
            $table->dropConstrainedForeignId('company_id');
            $table->dropColumn(['registration_reference_code', 'registered_at']);
        });

        Schema::dropIfExists('companies');
    }
};
