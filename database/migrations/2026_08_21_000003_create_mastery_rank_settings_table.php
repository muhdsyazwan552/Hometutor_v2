<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('mastery_levels')) {
            Schema::create('mastery_levels', function (Blueprint $table) {
                $table->id();
                $table->string('name', 50)->nullable();
                $table->unsignedTinyInteger('min_score')->nullable();
                $table->unsignedInteger('points')->nullable();
                $table->string('color', 20)->nullable();
                $table->unsignedTinyInteger('display_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        Schema::create('mastery_configurations', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('questions_per_session')->default(10);
            $table->timestamps();
        });

        Schema::create('mastery_rank_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('rank')->unique();
            $table->unsignedBigInteger('mastery_level_id')->unique();
            $table->string('key', 50)->unique();
            $table->string('label', 100);
            $table->unsignedInteger('min_questions')->default(0);
            $table->decimal('min_accuracy', 5, 2)->default(0);
            $table->string('color', 20);
            $table->string('icon_key', 50);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        $now = now();
        DB::table('mastery_configurations')->insert([
            'questions_per_session' => 10,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $levels = [
            ['id' => 1, 'name' => 'mastered', 'min_score' => 85, 'points' => 100, 'color' => '#34d399', 'display_order' => 1],
            ['id' => 2, 'name' => 'proficient', 'min_score' => 75, 'points' => 80, 'color' => '#8b5cf6', 'display_order' => 2],
            ['id' => 3, 'name' => 'familiar', 'min_score' => 60, 'points' => 60, 'color' => '#fbbf24', 'display_order' => 3],
            ['id' => 4, 'name' => 'practiced', 'min_score' => 50, 'points' => 40, 'color' => '#22d3ee', 'display_order' => 4],
            ['id' => 5, 'name' => 'need_practice', 'min_score' => 0, 'points' => 20, 'color' => '#fb7185', 'display_order' => 5],
            ['id' => 6, 'name' => 'not_started', 'min_score' => 0, 'points' => 0, 'color' => '#cbd5e1', 'display_order' => 6],
        ];

        foreach ($levels as $level) {
            DB::table('mastery_levels')->updateOrInsert(
                ['id' => $level['id']],
                array_merge($level, ['is_active' => true, 'created_at' => $now, 'updated_at' => $now])
            );
        }

        DB::table('mastery_rank_settings')->insert([
            ['rank' => 1, 'mastery_level_id' => 5, 'key' => 'need_practice', 'label' => 'Need practice', 'min_questions' => 1, 'min_accuracy' => 0, 'color' => '#fb7185', 'icon_key' => 'spark', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['rank' => 2, 'mastery_level_id' => 4, 'key' => 'practiced', 'label' => 'Practised', 'min_questions' => 10, 'min_accuracy' => 50, 'color' => '#22d3ee', 'icon_key' => 'paper_plane', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['rank' => 3, 'mastery_level_id' => 3, 'key' => 'familiar', 'label' => 'Familiar', 'min_questions' => 20, 'min_accuracy' => 60, 'color' => '#fbbf24', 'icon_key' => 'star_message', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['rank' => 4, 'mastery_level_id' => 2, 'key' => 'proficient', 'label' => 'Proficient', 'min_questions' => 30, 'min_accuracy' => 75, 'color' => '#8b5cf6', 'icon_key' => 'winged_shield', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['rank' => 5, 'mastery_level_id' => 1, 'key' => 'mastered', 'label' => 'Mastered', 'min_questions' => 40, 'min_accuracy' => 85, 'color' => '#34d399', 'icon_key' => 'crown_medal', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('mastery_rank_settings');
        Schema::dropIfExists('mastery_configurations');
    }
};
