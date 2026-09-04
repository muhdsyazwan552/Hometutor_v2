<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('roles')->updateOrInsert(
            ['id' => 4],
            ['name' => 'Code Manager', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        );

        Schema::table('activation_codes', function (Blueprint $table) {
            $table->string('intended_use', 20)->default('any')->index()->after('source');
            $table->foreignId('renewal_child_id')->nullable()->after('purchaser_parent_id')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('activation_codes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('renewal_child_id');
            $table->dropIndex(['intended_use']);
            $table->dropColumn('intended_use');
        });

        DB::table('roles')->where('id', 4)->where('name', 'Code Manager')->delete();
    }
};
