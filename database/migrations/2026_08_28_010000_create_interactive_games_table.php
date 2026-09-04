<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interactive_games', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('level_id')->index();
            $table->unsignedBigInteger('subject_id')->index();
            $table->string('content_group', 50)->default('literasi')->index();
            $table->string('slug', 100);
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('launch_url', 2048);
            $table->string('thumbnail_url', 2048)->nullable();
            $table->unsignedSmallInteger('sequence')->default(1);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->unique(['level_id', 'subject_id', 'slug']);
            $table->index(['level_id', 'subject_id', 'is_active', 'sequence'], 'interactive_games_listing_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interactive_games');
    }
};
