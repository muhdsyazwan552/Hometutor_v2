<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // The framework migration 0001_01_01_000000 already creates this
        // table. This duplicate migration previously made fresh installs and
        // the test database fail with "table users already exists".
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Intentionally empty: this migration does not own the users table.
    }
};
