<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('code_series', 20)->nullable()->unique()->after('reference_code');
        });

        DB::table('companies')->where('is_default', true)->update(['code_series' => 'HT']);
        DB::table('companies')->whereRaw('UPPER(reference_code) = ?', ['EXPLODE'])->update(['code_series' => 'XCLN']);
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropUnique(['code_series']);
            $table->dropColumn('code_series');
        });
    }
};
