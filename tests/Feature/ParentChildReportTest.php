<?php

namespace Tests\Feature;

use App\Models\Package;
use App\Models\PracticeSession;
use App\Models\Student;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ParentChildReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createLearningTables();
        DB::table('level')->insert(['id' => 7, 'name' => 'Standard 3', 'abbr' => 'ST3']);
        DB::table('subject')->insert(['id' => 20, 'name' => 'Mathematics', 'abbr' => 'MATH', 'level_id' => 7, 'seq' => 1, 'is_active' => true]);
        DB::table('topics')->insert(['id' => 30, 'name' => 'Fractions', 'subject_id' => 20, 'level_id' => 7, 'parent_id' => 0, 'seq' => 1, 'is_active' => true]);
    }

    public function test_parent_report_aggregates_only_the_selected_child_sessions(): void
    {
        [$parent, $child, $student] = $this->family('OWN');
        $sibling = User::factory()->create(['role_id' => User::ROLE_CHILD]);
        Student::create([
            'code' => 'HT-SIBLING',
            'user_id' => $sibling->id,
            'parent_id' => $parent->id,
            'full_name' => 'Child Sibling',
            'level_id' => 7,
        ]);
        $otherChild = User::factory()->create(['role_id' => User::ROLE_CHILD]);

        $practice = $this->createSession($child, 'practice', 4, 5, 80);
        $mission = $this->createSession($child, 'mission', 6, 10, 60);
        $this->createSession($otherChild, 'mission', 10, 10, 100);

        $this->actingAs($parent)
            ->get(route('parent.children.reports', $student->uuid, absolute: false))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Parent/ChildReportCard')
                ->where('viewerMode', 'parent')
                ->where('summary.total_sessions', 2)
                ->where('summary.average_score', 70)
                ->where('recentSessions.0.uuid', $mission->uuid)
                ->where('recentSessions.1.uuid', $practice->uuid)
                ->has('reportChildren', 2)
                ->where('reportChildren.0.selected', true));

        $this->actingAs($parent)
            ->get(route('parent.children.reports.history', $student->uuid, absolute: false))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Parent/ChildReport')
                ->where('summary.total_questions', 15)
                ->where('summary.correct', 10)
                ->where('summary.wrong', 5));

        $this->actingAs($parent)
            ->get(route('parent.children.reports.history', $student->uuid, absolute: false).'?form=all')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Parent/ChildReport')
                ->where('filters.form', 'all')
                ->where('summary.total_sessions', 2));
    }

    public function test_parent_cannot_open_another_parents_report(): void
    {
        [$parent] = $this->family('FIRST');
        [, , $otherStudent] = $this->family('OTHER');

        $this->actingAs($parent)
            ->get(route('parent.children.reports.history', $otherStudent->uuid, absolute: false))
            ->assertNotFound();
    }

    public function test_parent_can_open_the_new_report_card_without_removing_session_history(): void
    {
        [$parent, $child, $student] = $this->family('CARD');
        $this->createSession($child, 'practice', 4, 5, 80);
        $this->createSession($child, 'mission', 3, 5, 60);

        $this->actingAs($parent)
            ->get(route('parent.children.reports', $student->uuid, absolute: false))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Parent/ChildReportCard')
                ->where('summary.total_sessions', 2)
                ->where('summary.average_score', 70)
                ->where('subjects.0.name', 'Mathematics')
                ->has('recentSessions', 2));

        $this->actingAs($parent)
            ->get(route('parent.children.reports.history', $student->uuid, absolute: false))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Parent/ChildReport'));
    }

    public function test_parent_session_history_table_is_paginated_without_changing_the_summary(): void
    {
        [$parent, $child, $student] = $this->family('PAGED');

        foreach (range(1, 21) as $index) {
            $session = $this->createSession($child, 'practice', 4, 5, 80);
            $session->update(['created_at' => now()->subMinutes($index)]);
        }

        $this->actingAs($parent)
            ->get(route('parent.children.reports.history', $student->uuid, absolute: false))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Parent/ChildReport')
                ->has('sessions.data', 20)
                ->where('sessions.meta.current_page', 1)
                ->where('sessions.meta.last_page', 2)
                ->where('sessions.meta.total', 21)
                ->where('summary.total_sessions', 21));

        $this->actingAs($parent)
            ->get(route('parent.children.reports.history', $student->uuid, absolute: false).'?page=2')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Parent/ChildReport')
                ->has('sessions.data', 1)
                ->where('sessions.meta.current_page', 2)
                ->where('sessions.meta.total', 21)
                ->where('summary.total_sessions', 21));
    }

    public function test_parent_review_redacts_wrong_mission_answer_and_rejects_another_child_session(): void
    {
        [$parent, $child, $student] = $this->family('REVIEW');
        $mission = $this->createSession($child, 'mission', 0, 10, 0);

        DB::table('questions')->insert(['id' => 200, 'topic_id' => 30, 'question_type_id' => 1, 'question_text' => 'Mission question']);
        DB::table('answers')->insert([
            ['id' => 300, 'question_id' => 200, 'answer_text' => 'Chosen wrong', 'iscorrectanswer' => false, 'reason' => null, 'seq' => 1],
            ['id' => 301, 'question_id' => 200, 'answer_text' => 'Secret correct', 'iscorrectanswer' => true, 'reason' => 'Secret explanation', 'seq' => 2],
        ]);
        DB::table('quiz_attempts')->insert([
            'user_id' => $child->id,
            'session_id' => $mission->id,
            'question_id' => 200,
            'topic_id' => 30,
            'choosen_answer_id' => 300,
            'answer_status' => false,
            'time_taken' => 10,
            'question_type_id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $payload = $this->actingAs($parent)
            ->getJson(route('parent.children.reports.review', [$student->uuid, $mission->uuid], absolute: false))
            ->assertOk()
            ->json();

        $attempt = $payload['attempts'][0];
        $correctOption = collect($attempt['answers'])->firstWhere('id', 301);
        $this->assertNull($attempt['explanation']);
        $this->assertFalse($correctOption['is_correct']);
        $this->assertFalse($correctOption['show_correct']);

        $otherChild = User::factory()->create(['role_id' => User::ROLE_CHILD]);
        $otherSession = $this->createSession($otherChild, 'practice', 5, 5, 100);

        $this->actingAs($parent)
            ->getJson(route('parent.children.reports.review', [$student->uuid, $otherSession->uuid], absolute: false))
            ->assertNotFound();
    }

    private function family(string $suffix): array
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $child = User::factory()->create(['role_id' => User::ROLE_CHILD]);
        $student = Student::create([
            'code' => 'HT-'.$suffix,
            'user_id' => $child->id,
            'parent_id' => $parent->id,
            'full_name' => 'Child '.$suffix,
            'level_id' => 7,
        ]);

        $package = Package::create(['name' => 'Package '.$suffix, 'price' => 10, 'duration_days' => 30, 'max_children' => 3, 'is_active' => true]);
        Subscription::create(['parent_id' => $parent->id, 'package_id' => $package->id, 'status' => Subscription::STATUS_ACTIVE, 'starts_at' => now()->subDay(), 'ends_at' => now()->addMonth()]);

        return [$parent, $child, $student];
    }

    private function createSession(User $child, string $type, int $correct, int $total, float $score): PracticeSession
    {
        return PracticeSession::create([
            'user_id' => $child->id,
            'subject_id' => 20,
            'topic_id' => 30,
            'subtopic_id' => null,
            'question_type_id' => 1,
            'session_type' => $type,
            'total_questions' => $total,
            'total_correct' => $correct,
            'total_skipped' => 0,
            'score' => $score,
            'total_time_seconds' => 90,
        ]);
    }

    private function createLearningTables(): void
    {
        Schema::create('level', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('abbr')->nullable();
        });
        Schema::create('subject', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('abbr')->nullable();
            $table->unsignedBigInteger('level_id');
            $table->unsignedInteger('seq')->default(0);
            $table->boolean('is_active')->default(true);
        });
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedBigInteger('subject_id');
            $table->unsignedBigInteger('level_id');
            $table->unsignedBigInteger('parent_id')->default(0);
            $table->unsignedInteger('seq')->default(0);
            $table->boolean('is_active')->default(true);
        });
        Schema::create('practice_session', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id');
            $table->unsignedBigInteger('subject_id');
            $table->unsignedBigInteger('topic_id');
            $table->unsignedBigInteger('subtopic_id')->nullable();
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
    }
}
