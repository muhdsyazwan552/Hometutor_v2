<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('license_adjustment_requests', function (Blueprint $table) {
            $table->string('contact_method', 30)->nullable()->after('reason');
            $table->foreignId('requested_by_user_id')->nullable()->after('parent_id')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('license_adjustment_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('requested_by_user_id');
            $table->dropColumn('contact_method');
        });
    }
};
