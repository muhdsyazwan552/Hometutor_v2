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
        if (! Schema::hasTable('practice_session')) {
            return;
        }

        if (! Schema::hasColumn('practice_session', 'uuid')) {
            Schema::table('practice_session', function (Blueprint $table) {
                $table->uuid('uuid')->nullable()->unique()->after('id');
            });
        }

        DB::table('practice_session')
            ->whereNull('uuid')
            ->orderBy('id')
            ->eachById(function (object $session): void {
                DB::table('practice_session')
                    ->where('id', $session->id)
                    ->update(['uuid' => (string) Str::uuid()]);
            });
    }

    public function down(): void
    {
        if (Schema::hasTable('practice_session') && Schema::hasColumn('practice_session', 'uuid')) {
            Schema::table('practice_session', function (Blueprint $table) {
                $table->dropUnique(['uuid']);
                $table->dropColumn('uuid');
            });
        }
    }
};
