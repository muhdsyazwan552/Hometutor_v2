<?php

namespace Tests\Feature;

use App\Models\ChildSubscription;
use App\Models\Package;
use App\Models\Student;
use App\Models\User;
use App\Services\IntegrationJwtService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IntegrationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('integration_api', [
            'client_id' => 'website-b-test',
            'client_secret' => str_repeat('c', 32),
            'jwt_secret' => str_repeat('j', 32),
            'issuer' => 'https://hometutor.test',
            'audience' => 'website-b',
            'token_ttl' => 300,
            'clock_leeway' => 10,
            'require_https' => false,
        ]);
    }

    public function test_valid_client_credentials_issue_a_short_lived_scoped_jwt(): void
    {
        $response = $this->postJson('/api/integration/v1/auth/token', [
            'grant_type' => 'client_credentials',
            'client_id' => 'website-b-test',
            'client_secret' => str_repeat('c', 32),
        ])->assertOk()
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertJsonPath('token_type', 'Bearer')
            ->assertJsonPath('expires_in', 300)
            ->assertJsonPath('scope', 'children:read subscriptions:read');

        $token = $response->json('access_token');

        $this->assertIsString($token);
        $this->assertCount(3, explode('.', $token));
    }

    public function test_invalid_client_credentials_are_rejected(): void
    {
        $this->postJson('/api/integration/v1/auth/token', [
            'grant_type' => 'client_credentials',
            'client_id' => 'website-b-test',
            'client_secret' => str_repeat('x', 32),
        ])->assertUnauthorized()
            ->assertJsonPath('error.code', 'INVALID_CLIENT');
    }

    public function test_children_and_child_subscriptions_are_exposed_without_sensitive_fields(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);
        $child = User::factory()->create([
            'role_id' => User::ROLE_CHILD,
            'username' => 'child-sync',
            'display_name' => 'Sync Child',
            'email' => 'private-child@example.test',
            'password' => 'very-secret-password',
        ]);
        $student = Student::create([
            'code' => 'HT-SYNC',
            'user_id' => $child->id,
            'parent_id' => $parent->id,
            'full_name' => 'Sync Child Full Name',
            'class_name' => '3 Amanah',
        ]);
        $package = Package::create([
            'name' => 'Learning 30',
            'code' => 'LEARN-30',
            'price' => 10,
            'duration_days' => 30,
            'max_children' => 1,
            'is_active' => true,
        ]);
        $subscription = ChildSubscription::create([
            'child_user_id' => $child->id,
            'package_id' => $package->id,
            'status' => ChildSubscription::STATUS_ACTIVE,
            'source' => 'integration-test',
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDays(29),
        ]);

        $token = app(IntegrationJwtService::class)
            ->issue('website-b-test', ['children:read', 'subscriptions:read'])['access_token'];

        $children = $this->withToken($token)
            ->getJson('/api/integration/v1/children')
            ->assertOk()
            ->assertJsonPath('data.0.uuid', $student->uuid)
            ->assertJsonPath('data.0.username', 'child-sync')
            ->assertJsonMissingPath('data.0.email')
            ->assertJsonMissingPath('data.0.password')
            ->assertJsonMissingPath('data.0.parent_id')
            ->assertJsonPath('meta.has_more', false);

        $this->assertCount(1, $children->json('data'));

        $subscriptions = $this->withToken($token)
            ->getJson('/api/integration/v1/subscriptions')
            ->assertOk()
            ->assertJsonPath('data.0.uuid', $subscription->uuid)
            ->assertJsonPath('data.0.child_uuid', $student->uuid)
            ->assertJsonPath('data.0.package.code', 'LEARN-30')
            ->assertJsonMissingPath('data.0.activation_code_id');

        $this->assertCount(1, $subscriptions->json('data'));
    }

    public function test_missing_tampered_and_under_scoped_tokens_are_rejected(): void
    {
        $this->getJson('/api/integration/v1/children')
            ->assertUnauthorized()
            ->assertJsonPath('error.code', 'UNAUTHENTICATED');

        $token = app(IntegrationJwtService::class)
            ->issue('website-b-test', ['children:read'])['access_token'];

        $this->withToken($token.'tampered')
            ->getJson('/api/integration/v1/children')
            ->assertUnauthorized();

        $this->withToken($token)
            ->getJson('/api/integration/v1/subscriptions')
            ->assertForbidden()
            ->assertJsonPath('error.code', 'INSUFFICIENT_SCOPE');
    }

    public function test_expired_tokens_are_rejected(): void
    {
        $token = app(IntegrationJwtService::class)
            ->issue('website-b-test', ['children:read'])['access_token'];

        $this->travel(6)->minutes();

        $this->withToken($token)
            ->getJson('/api/integration/v1/children')
            ->assertUnauthorized()
            ->assertJsonPath('error.code', 'UNAUTHENTICATED');
    }
}
