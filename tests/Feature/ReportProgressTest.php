<?php

namespace Tests\Feature;

use App\Http\Controllers\Web\ReportController;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Request;
use ReflectionMethod;
use Tests\TestCase;

class ReportProgressTest extends TestCase
{
    use RefreshDatabase;

    public function test_subtopic_sessions_are_aggregated_for_current_child_only(): void
    {
        Schema::create('practice_session', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->unsignedBigInteger('topic_id');
            $table->unsignedBigInteger('subtopic_id')->nullable();
            $table->unsignedInteger('question_type_id');
            $table->string('session_type')->default('practice');
            $table->unsignedSmallInteger('total_questions')->nullable();
            $table->unsignedBigInteger('mastery_session_id')->nullable();
            $table->decimal('score', 8, 2)->nullable();
            $table->unsignedInteger('total_correct')->default(0);
            $table->unsignedInteger('total_skipped')->default(0);
            $table->timestamps();
        });

        $child = User::factory()->create(['role_id' => User::ROLE_CHILD]);
        $otherChild = User::factory()->create(['role_id' => User::ROLE_CHILD]);
        $this->actingAs($child);

        DB::table('practice_session')->insert([
            $this->sessionRow($child->id, 100, 101, 20, now()->subHour()),
            $this->sessionRow($child->id, 100, 101, 60, now()),
            $this->sessionRow($otherChild->id, 100, 101, 100, now()),
        ]);

        $method = new ReflectionMethod(ReportController::class, 'batchCalculateTopicProgress');
        $progress = $method->invoke(app(ReportController::class), [100, 101], 1);

        $this->assertSame(0, $progress[100]['total_sessions']);
        $this->assertSame(2, (int) $progress[101]['total_sessions']);
        $this->assertSame(40.0, (float) $progress[101]['average_score']);
        $this->assertSame('20 - 60', $progress[101]['score_statistic']);
        $this->assertNotNull($progress[101]['last_session']);
    }

    private function sessionRow(int $userId, int $topicId, int $subtopicId, int $score, $createdAt): array
    {
        return [
            'user_id' => $userId,
            'topic_id' => $topicId,
            'subtopic_id' => $subtopicId,
            'question_type_id' => 1,
            'session_type' => 'practice',
            'total_questions' => 5,
            'mastery_session_id' => null,
            'score' => $score,
            'total_correct' => (int) ($score / 20),
            'total_skipped' => 0,
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ];
    }

    public function test_report_details_use_stored_question_count_for_practice_and_mission(): void
    {
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->string('name');
        });
        Schema::create('practice_session', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->unsignedBigInteger('topic_id');
            $table->unsignedBigInteger('subtopic_id')->nullable();
            $table->unsignedInteger('question_type_id');
            $table->string('session_type')->default('practice');
            $table->unsignedSmallInteger('total_questions')->nullable();
            $table->unsignedBigInteger('mastery_session_id')->nullable();
            $table->decimal('score', 8, 2)->nullable();
            $table->unsignedInteger('total_correct')->default(0);
            $table->unsignedInteger('total_skipped')->default(0);
            $table->unsignedInteger('total_time_seconds')->default(0);
            $table->timestamps();
        });

        DB::table('topics')->insert(['id' => 101, 'name' => 'Fractions']);
        $child = User::factory()->create(['role_id' => User::ROLE_CHILD]);
        $this->actingAs($child);

        DB::table('practice_session')->insert([
            [
                'user_id' => $child->id,
                'topic_id' => 100,
                'subtopic_id' => 101,
                'question_type_id' => 1,
                'session_type' => 'practice',
                'total_questions' => 5,
                'total_correct' => 3,
                'total_skipped' => 1,
                'score' => 60,
                'total_time_seconds' => 50,
                'created_at' => now()->subMinute(),
                'updated_at' => now()->subMinute(),
            ],
            [
                'user_id' => $child->id,
                'topic_id' => 100,
                'subtopic_id' => 101,
                'question_type_id' => 1,
                'session_type' => 'mission',
                'total_questions' => 10,
                'total_correct' => 6,
                'total_skipped' => 0,
                'score' => 60,
                'total_time_seconds' => 100,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $response = app(ReportController::class)->getSubtopicDetails(
            101,
            Request::create('/subtopic/101/details', 'GET', ['questionType' => 'Objective'])
        );
        $sessions = $response->getData(true)['sessions'];

        $this->assertSame('mission', $sessions[0]['session_type']);
        $this->assertSame(10, $sessions[0]['total_questions']);
        $this->assertSame(4, $sessions[0]['total_wrong']);
        $this->assertSame('60%', $sessions[0]['score']);
        $this->assertSame('practice', $sessions[1]['session_type']);
        $this->assertSame(5, $sessions[1]['total_questions']);
        $this->assertSame(1, $sessions[1]['total_wrong']);
        $this->assertSame('60%', $sessions[1]['score']);
    }

    public function test_wrong_mission_review_hides_correct_answer_flag(): void
    {
        $controller = app(ReportController::class);
        $formatAnswer = new ReflectionMethod(ReportController::class, 'formatAnswer');
        $formatSession = new ReflectionMethod(ReportController::class, 'formatSession');
        $attempt = (object) [
            'choosen_answer_id' => 10,
            'answer_status' => 0,
        ];
        $chosenAnswer = (object) ['id' => 10];
        $wrongAnswer = (object) [
            'id' => 10,
            'answer_text' => 'Wrong option',
            'answer_option_file' => null,
            'iscorrectanswer' => 0,
        ];
        $correctAnswer = (object) [
            'id' => 11,
            'answer_text' => 'Correct option',
            'answer_option_file' => null,
            'iscorrectanswer' => 1,
        ];

        $formattedWrong = $formatAnswer->invoke($controller, $wrongAnswer, $attempt, $chosenAnswer);
        $formattedCorrect = $formatAnswer->invoke($controller, $correctAnswer, $attempt, $chosenAnswer, false);
        $formattedPracticeCorrect = $formatAnswer->invoke($controller, $correctAnswer, $attempt, $chosenAnswer);
        $formattedSession = $formatSession->invoke($controller, (object) [
            'id' => 1,
            'total_correct' => 6,
            'total_skipped' => 0,
            'score' => 60,
            'total_time_seconds' => 100,
            'created_at' => now(),
            'topic_name' => 'Science',
            'question_type_id' => 1,
            'session_type' => 'mission',
            'total_questions' => 10,
        ]);

        $this->assertTrue($formattedWrong['was_wrong']);
        $this->assertFalse($formattedCorrect['is_correct']);
        $this->assertFalse($formattedCorrect['show_correct']);
        $this->assertTrue($formattedPracticeCorrect['is_correct']);
        $this->assertTrue($formattedPracticeCorrect['show_correct']);
        $this->assertSame('mission', $formattedSession['session_type']);
        $this->assertSame(10, $formattedSession['total_questions']);
    }

    public function test_wrong_mission_review_api_redacts_correction_and_explanation(): void
    {
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->string('name');
        });
        Schema::create('practice_session', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->unsignedBigInteger('topic_id');
            $table->unsignedInteger('question_type_id');
            $table->string('session_type');
            $table->unsignedSmallInteger('total_questions');
            $table->unsignedInteger('total_correct')->default(0);
            $table->unsignedInteger('total_skipped')->default(0);
            $table->decimal('score', 8, 2)->nullable();
            $table->unsignedInteger('total_time_seconds')->default(0);
            $table->timestamps();
        });
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('topic_id');
            $table->unsignedInteger('question_type_id');
            $table->text('question_text')->nullable();
            $table->string('question_file')->nullable();
        });
        Schema::create('answers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('question_id');
            $table->text('answer_text')->nullable();
            $table->string('answer_option_file')->nullable();
            $table->boolean('iscorrectanswer')->default(false);
            $table->text('reason')->nullable();
            $table->text('sample_answer')->nullable();
            $table->unsignedInteger('seq')->default(0);
        });
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->unsignedBigInteger('session_id');
            $table->unsignedBigInteger('question_id');
            $table->unsignedBigInteger('topic_id');
            $table->unsignedBigInteger('subtopic_id')->nullable();
            $table->unsignedBigInteger('choosen_answer_id')->default(0);
            $table->boolean('answer_status')->default(false);
            $table->text('subjective_answer')->nullable();
            $table->unsignedInteger('time_taken')->default(0);
            $table->unsignedInteger('question_type_id');
            $table->timestamps();
        });

        $child = User::factory()->create(['role_id' => User::ROLE_CHILD]);
        $this->actingAs($child);
        DB::table('topics')->insert(['id' => 100, 'name' => 'Mission topic']);
        DB::table('practice_session')->insert([
            'id' => 50,
            'user_id' => $child->id,
            'topic_id' => 100,
            'question_type_id' => 1,
            'session_type' => 'mission',
            'total_questions' => 10,
            'total_correct' => 0,
            'total_skipped' => 0,
            'score' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('questions')->insert([
            'id' => 200,
            'topic_id' => 100,
            'question_type_id' => 1,
            'question_text' => 'Mission question',
        ]);
        DB::table('answers')->insert([
            ['id' => 300, 'question_id' => 200, 'answer_text' => 'Chosen wrong', 'iscorrectanswer' => false, 'reason' => null, 'seq' => 1],
            ['id' => 301, 'question_id' => 200, 'answer_text' => 'Secret correct', 'iscorrectanswer' => true, 'reason' => 'Secret explanation', 'seq' => 2],
        ]);
        DB::table('quiz_attempts')->insert([
            'user_id' => $child->id,
            'session_id' => 50,
            'question_id' => 200,
            'topic_id' => 100,
            'choosen_answer_id' => 300,
            'answer_status' => false,
            'time_taken' => 10,
            'question_type_id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $payload = app(ReportController::class)->getQuestionAttempts(50)->getData(true);
        $attempt = $payload['attempts'][0];
        $correctOption = collect($attempt['answers'])->firstWhere('id', 301);

        $this->assertNull($attempt['explanation']);
        $this->assertFalse($correctOption['is_correct']);
        $this->assertFalse($correctOption['show_correct']);
        $this->assertTrue(collect($attempt['answers'])->firstWhere('id', 300)['was_wrong']);
    }
}
