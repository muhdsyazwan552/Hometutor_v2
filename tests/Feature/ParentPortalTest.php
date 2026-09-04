<?php

namespace Tests\Feature;

use App\Models\ChildSubscription;
use App\Models\Package;
use App\Models\Student;
use App\Models\Subscription;
use App\Models\User;
use App\Services\ActivationCodeService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ParentPortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_parent_can_open_blade_dashboard(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);

        $this->actingAs($parent)->get('/parent')
            ->assertOk()
            ->assertSee('Parent Portal');
    }

    public function test_parent_child_card_shows_real_activity_and_performance_metrics(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $child = User::factory()->create(['role_id' => User::ROLE_CHILD, 'name' => 'Aisyah Sofea', 'username' => 'aisyah_s3']);
        Student::create(['code' => 'HT-CARD', 'user_id' => $child->id, 'parent_id' => $parent->id, 'full_name' => 'Aisyah Sofea']);
        $package = Package::create(['name' => 'Card package', 'price' => 99, 'duration_days' => 365, 'max_children' => 1, 'is_active' => true]);
        ChildSubscription::create(['child_user_id' => $child->id, 'package_id' => $package->id, 'status' => 'active', 'source' => 'test', 'starts_at' => now()->subDay(), 'ends_at' => now()->addYear()]);

        Schema::create('subject', function (Blueprint $table) {
            $table->id();
            $table->string('name');
        });
        Schema::create('practice_session', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->unsignedBigInteger('subject_id');
            $table->decimal('score', 8, 2)->nullable();
            $table->timestamps();
        });
        DB::table('subject')->insert(['id' => 1, 'name' => 'Mathematics']);
        DB::table('practice_session')->insert([
            ['user_id' => $child->id, 'subject_id' => 1, 'score' => 80, 'created_at' => now()->subDay(), 'updated_at' => now()->subDay()],
            ['user_id' => $child->id, 'subject_id' => 1, 'score' => 90, 'created_at' => now(), 'updated_at' => now()],
        ]);
        DB::table('user_streaks')->insert(['user_id' => $child->id, 'question_streak' => 4, 'last_answer_date' => now()->toDateString(), 'created_at' => now(), 'updated_at' => now()]);

        $this->actingAs($parent)->get(route('parent.dashboard'))
            ->assertOk()
            ->assertSee('Aisyah Sofea')
            ->assertSee('2 this week')
            ->assertSee('85%')
            ->assertSee('Mathematics')
            ->assertSee('4 days')
            ->assertSee('View child');
    }

    public function test_parent_child_cards_distinguish_expired_and_renew_soon_subscriptions(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $package = Package::create(['name' => 'Renewal display package', 'price' => 99, 'duration_days' => 365, 'max_children' => 2, 'is_active' => true]);

        $expiredChild = User::factory()->create(['role_id' => User::ROLE_CHILD, 'username' => 'expired_child']);
        Student::create(['code' => 'HT-EXPIRED-CARD', 'user_id' => $expiredChild->id, 'parent_id' => $parent->id, 'full_name' => 'Expired Child']);
        ChildSubscription::create(['child_user_id' => $expiredChild->id, 'package_id' => $package->id, 'status' => ChildSubscription::STATUS_EXPIRED, 'source' => 'test', 'starts_at' => now()->subYear(), 'ends_at' => now()->subDay()]);

        $renewSoonChild = User::factory()->create(['role_id' => User::ROLE_CHILD, 'username' => 'renew_soon_child']);
        Student::create(['code' => 'HT-RENEW-SOON', 'user_id' => $renewSoonChild->id, 'parent_id' => $parent->id, 'full_name' => 'Renew Soon Child']);
        ChildSubscription::create(['child_user_id' => $renewSoonChild->id, 'package_id' => $package->id, 'status' => ChildSubscription::STATUS_ACTIVE, 'source' => 'test', 'starts_at' => now()->subMonth(), 'ends_at' => now()->addDays(7)]);

        $this->actingAs($parent)->get(route('parent.children.index'))
            ->assertOk()
            ->assertSee('Expired Child')
            ->assertSee('Expired')
            ->assertSee('Renew now')
            ->assertSee('Renew Soon Child')
            ->assertSee('Renew soon')
            ->assertSee('Renew subscription');
    }

    public function test_parent_and_child_are_redirected_to_their_own_dashboards_after_login(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $child = User::factory()->create(['role_id' => User::ROLE_CHILD]);

        $this->post('/login', ['username' => $parent->username, 'password' => 'password'])
            ->assertRedirect(route('parent.dashboard', absolute: false));

        $this->post('/logout');

        $this->post('/login', ['username' => $child->username, 'password' => 'password'])
            ->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_inertia_parent_login_forces_full_page_visit_to_blade_portal(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);

        $this->withHeader('X-Inertia', 'true')
            ->post('/login', ['username' => $parent->username, 'password' => 'password'])
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', route('parent.dashboard', absolute: false));
    }

    public function test_child_cannot_open_parent_portal(): void
    {
        $child = User::factory()->create(['role_id' => User::ROLE_CHILD]);

        $this->actingAs($child)->get('/parent')
            ->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_parent_can_open_child_creation_without_a_parent_subscription(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);

        $this->actingAs($parent)->get('/parent/children/create')
            ->assertOk();
    }

    public function test_parent_with_valid_activation_code_can_create_child(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        Schema::create('level', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('abbr')->nullable();
            $table->boolean('is_active')->default(true);
        });
        DB::table('level')->insert(['id' => 7, 'name' => 'Standard 1', 'is_active' => true]);
        $package = Package::create([
            'name' => 'Test package',
            'code' => 'TEST-CODE-PACKAGE',
            'curriculum_group' => 'standard_1_3',
            'price' => 10,
            'duration_days' => 30,
            'max_children' => 1,
            'is_active' => true,
        ]);
        $package->levels()->sync([7]);
        Mail::fake();
        $activationCode = app(ActivationCodeService::class)->issue($package, $parent, 'test');

        $this->actingAs($parent)->get('/parent/children/create')->assertOk();

        $this->actingAs($parent)->post('/parent/children', [
            'name' => 'Aiman Child',
            'username' => 'aiman_child',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'activation_code' => $activationCode->code_value,
            'level_id' => 7,
        ])->assertRedirect(route('parent.children.index', absolute: false));

        $child = User::where('username', 'aiman_child')->firstOrFail();
        $this->assertSame(User::ROLE_CHILD, (int) $child->role_id);
        $this->assertDatabaseHas('students', [
            'user_id' => $child->id,
            'parent_id' => $parent->id,
        ]);
        $this->assertDatabaseHas('child_subscriptions', [
            'child_user_id' => $child->id,
            'status' => ChildSubscription::STATUS_ACTIVE,
        ]);
        $this->assertDatabaseHas('activation_codes', ['id' => $activationCode->id, 'status' => 'redeemed']);
    }

    public function test_child_linked_to_expired_parent_package_sees_renewal_screen(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $child = User::factory()->create(['role_id' => User::ROLE_CHILD]);
        Student::create([
            'code' => 'HT-EXPIRED',
            'user_id' => $child->id,
            'parent_id' => $parent->id,
            'full_name' => $child->name,
        ]);

        $this->actingAs($child)->get('/dashboard')
            ->assertRedirect(route('child.subscription-required', absolute: false));
    }

    public function test_parent_can_open_their_child_dashboard_using_uuid(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $child = User::factory()->create(['role_id' => User::ROLE_CHILD]);
        $student = Student::create([
            'code' => 'HT-OWN-CHILD',
            'user_id' => $child->id,
            'parent_id' => $parent->id,
            'full_name' => 'Owned Child',
        ]);
        $this->giveActiveSubscription($parent);

        $url = route('parent.children.learning-dashboard', $student->uuid, absolute: false);

        $this->assertStringContainsString($student->uuid, $url);
        $this->assertStringNotContainsString("/children/{$student->id}/", $url);

        $this->actingAs($parent)->get($url)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('viewerMode', 'parent')
                ->where('viewedChild.uuid', $student->uuid)
                ->where('viewedChild.name', 'Owned Child')
                ->where('auth.user.id', $parent->id));
    }

    public function test_parent_cannot_open_another_parents_child_dashboard_even_with_uuid(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $otherParent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $otherChild = User::factory()->create(['role_id' => User::ROLE_CHILD]);
        $otherStudent = Student::create([
            'code' => 'HT-OTHER-CHILD',
            'user_id' => $otherChild->id,
            'parent_id' => $otherParent->id,
            'full_name' => 'Another Parent Child',
        ]);
        $this->giveActiveSubscription($parent);

        $this->actingAs($parent)
            ->get(route('parent.children.learning-dashboard', $otherStudent->uuid, absolute: false))
            ->assertNotFound();
    }

    private function giveActiveSubscription(User $parent): void
    {
        $package = Package::create([
            'name' => 'Parent dashboard test package '.$parent->id,
            'price' => 10,
            'duration_days' => 30,
            'max_children' => 3,
            'is_active' => true,
        ]);

        Subscription::create([
            'parent_id' => $parent->id,
            'package_id' => $package->id,
            'status' => Subscription::STATUS_ACTIVE,
            'starts_at' => now()->subMinute(),
            'ends_at' => now()->addMonth(),
        ]);
    }
}
