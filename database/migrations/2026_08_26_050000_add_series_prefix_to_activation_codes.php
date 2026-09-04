<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activation_code_batches', function (Blueprint $table) {
            $table->string('series_prefix', 20)->default('HT')->after('reference')->index();
        });

        Schema::table('activation_codes', function (Blueprint $table) {
            $table->string('series_prefix', 20)->default('HT')->after('code_value')->index();
        });
    }

    public function down(): void
    {
        Schema::table('activation_codes', function (Blueprint $table) {
            $table->dropIndex(['series_prefix']);
            $table->dropColumn('series_prefix');
        });

        Schema::table('activation_code_batches', function (Blueprint $table) {
            $table->dropIndex(['series_prefix']);
            $table->dropColumn('series_prefix');
        });
    }
};
