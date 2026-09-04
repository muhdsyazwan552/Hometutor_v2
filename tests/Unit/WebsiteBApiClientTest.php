<?php

namespace Tests\Unit;

use App\Exceptions\WebsiteBApiException;
use App\Services\WebsiteBApiClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WebsiteBApiClientTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('cache.default', 'array');
        config()->set('services.website_b', [
            'base_url' => 'https://website-b.test/api',
            'client_id' => 'website-a-test',
            'client_secret' => 'test-secret',
            'timeout' => 5,
        ]);
        Cache::flush();
    }

    public function test_it_gets_a_jwt_and_creates_a_user(): void
    {
        Http::fake([
            'https://website-b.test/api/auth/token' => Http::response([
                'access_token' => 'jwt-token',
                'token_type' => 'Bearer',
                'expires_in' => 900,
            ]),
            'https://website-b.test/api/users' => Http::response([
                'data' => ['id' => 88, 'source_user_id' => '123', 'status' => 'active'],
            ], 201),
        ]);

        $result = app(WebsiteBApiClient::class)->createUser([
            'source_user_id' => '123',
            'name' => 'Nur Aisyah',
            'email' => 'aisyah@example.test',
        ]);

        $this->assertSame(88, $result['id']);
        Http::assertSent(fn ($request) => $request->url() === 'https://website-b.test/api/users'
            && $request->hasHeader('Authorization', 'Bearer jwt-token'));
    }

    public function test_it_renews_an_expired_token_once(): void
    {
        Http::fakeSequence()
            ->push(['access_token' => 'expired-token', 'expires_in' => 900])
            ->push(['error' => ['code' => 'UNAUTHENTICATED', 'message' => 'Expired']], 401)
            ->push(['access_token' => 'fresh-token', 'expires_in' => 900])
            ->push(['data' => ['id' => 88, 'status' => 'active']], 200);

        $result = app(WebsiteBApiClient::class)->getUser(88);

        $this->assertSame('active', $result['status']);
        Http::assertSentCount(4);
    }

    public function test_it_exposes_website_b_validation_errors(): void
    {
        Http::fakeSequence()
            ->push(['access_token' => 'jwt-token', 'expires_in' => 900])
            ->push([
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'The request data is invalid.',
                    'details' => ['email' => ['The email is invalid.']],
                ],
            ], 422);

        try {
            app(WebsiteBApiClient::class)->createUser(['email' => 'invalid']);
            $this->fail('Expected WebsiteBApiException was not thrown.');
        } catch (WebsiteBApiException $exception) {
            $this->assertSame('VALIDATION_ERROR', $exception->errorCode);
            $this->assertSame(422, $exception->httpStatus);
            $this->assertArrayHasKey('email', $exception->details);
        }
    }
}
