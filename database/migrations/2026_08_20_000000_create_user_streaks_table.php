<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('user_streaks')) {
            Schema::create('user_streaks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
                $table->unsignedInteger('login_streak')->default(0);
                $table->unsignedInteger('question_streak')->default(0);
                $table->unsignedInteger('longest_login_streak')->default(0);
                $table->unsignedInteger('longest_question_streak')->default(0);
                $table->unsignedInteger('answers_today')->default(0);
                $table->date('last_login_date')->nullable();
                $table->date('last_answer_date')->nullable();
                $table->date('answers_today_date')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('user_streaks');
    }
};
