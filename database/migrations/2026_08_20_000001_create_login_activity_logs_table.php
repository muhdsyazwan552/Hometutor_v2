<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('login_activity_logs')) {
            Schema::create('login_activity_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('ip_address', 45)->nullable();
                $table->string('device_type', 20);
                $table->string('user_agent', 1000)->nullable();
                $table->decimal('latitude', 6, 3)->nullable();
                $table->decimal('longitude', 6, 3)->nullable();
                $table->unsignedInteger('location_accuracy_meters')->nullable();
                $table->timestamp('location_shared_at')->nullable();
                $table->timestamp('logged_in_at');
                $table->timestamps();

                $table->index(['user_id', 'logged_in_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('login_activity_logs');
    }
};
