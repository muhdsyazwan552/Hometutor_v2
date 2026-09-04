<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('question_reports')) {
            return;
        }

        Schema::create('question_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('question_id');
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->unsignedBigInteger('topic_id')->nullable();
            $table->string('question_code', 100)->nullable();
            $table->string('report_type', 40);
            $table->text('details')->nullable();
            $table->string('context', 60)->nullable();
            $table->text('page_url')->nullable();
            $table->string('status', 20)->default('open');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['question_id', 'status']);
            $table->index(['user_id', 'created_at']);
            $table->index('question_code');
            $table->index('subject_id');
            $table->index('topic_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        // Preserve the table because older installations may have created it outside migrations.
    }
};
