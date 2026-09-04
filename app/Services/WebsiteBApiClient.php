<?php

namespace App\Services;

use App\Exceptions\WebsiteBApiException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class WebsiteBApiClient
{
    public function createUser(array $payload): array
    {
        return $this->request('POST', '/users', $payload);
    }

    public function getUser(int|string $websiteBUserId): array
    {
        return $this->request('GET', '/users/'.rawurlencode((string) $websiteBUserId));
    }

    public function findUserBySourceId(int|string $sourceUserId): array
    {
        return $this->request('GET', '/users', ['source_user_id' => (string) $sourceUserId]);
    }

    public function findUserByEmail(string $email): array
    {
        return $this->request('GET', '/users', ['email' => $email]);
    }

    public function updateUser(int|string $websiteBUserId, array $payload): array
    {
        return $this->request('PATCH', '/users/'.rawurlencode((string) $websiteBUserId), $payload);
    }

    public function suspendUser(int|string $websiteBUserId): array
    {
        return $this->request('POST', '/users/'.rawurlencode((string) $websiteBUserId).'/suspend');
    }

    public function terminateUser(int|string $websiteBUserId): array
    {
        return $this->request('POST', '/users/'.rawurlencode((string) $websiteBUserId).'/terminate');
    }

    public function forgetAccessToken(): void
    {
        Cache::forget($this->tokenCacheKey());
    }

    private function request(string $method, string $path, array $payload = []): array
    {
        $response = $this->send($method, $path, $payload, $this->accessToken());

        if ($response->status() === 401) {
            $this->forgetAccessToken();
            $response = $this->send($method, $path, $payload, $this->accessToken());
        }

        return $this->dataOrFail($response);
    }

    private function send(string $method, string $path, array $payload, string $token): Response
    {
        $options = strtoupper($method) === 'GET' ? ['query' => $payload] : ['json' => $payload];

        try {
            return Http::acceptJson()
                ->asJson()
                ->withToken($token)
                ->timeout($this->timeout())
                ->send($method, $this->baseUrl().$path, $options);
        } catch (ConnectionException $exception) {
            throw new WebsiteBApiException(
                'WEBSITE_B_UNAVAILABLE',
                'Website B could not be reached.',
                0,
                ['reason' => $exception->getMessage()],
            );
        }
    }

    private function accessToken(): string
    {
        if ($token = Cache::get($this->tokenCacheKey())) {
            return $token;
        }

        try {
            $response = Http::acceptJson()
                ->asJson()
                ->timeout($this->timeout())
                ->post($this->baseUrl().'/auth/token', [
                    'client_id' => $this->clientId(),
                    'client_secret' => $this->clientSecret(),
                ]);
        } catch (ConnectionException $exception) {
            throw new WebsiteBApiException('WEBSITE_B_UNAVAILABLE', 'Website B could not be reached.', 0);
        }

        $body = $this->dataOrFail($response, false);
        $token = $body['access_token'] ?? null;

        if (! is_string($token) || $token === '') {
            throw new WebsiteBApiException('INVALID_TOKEN_RESPONSE', 'Website B returned an invalid token response.', $response->status());
        }

        $ttl = max(1, ((int) ($body['expires_in'] ?? 900)) - 30);
        Cache::put($this->tokenCacheKey(), $token, now()->addSeconds($ttl));

        return $token;
    }

    private function dataOrFail(Response $response, bool $unwrapData = true): array
    {
        $body = $response->json();

        if (! $response->successful()) {
            $error = is_array($body) ? ($body['error'] ?? []) : [];

            throw new WebsiteBApiException(
                (string) ($error['code'] ?? 'WEBSITE_B_API_ERROR'),
                (string) ($error['message'] ?? 'Website B rejected the request.'),
                $response->status(),
                is_array($error['details'] ?? null) ? $error['details'] : [],
            );
        }

        if (! is_array($body)) {
            throw new WebsiteBApiException('INVALID_API_RESPONSE', 'Website B returned a non-JSON response.', $response->status());
        }

        $result = $unwrapData ? ($body['data'] ?? $body) : $body;

        if (! is_array($result)) {
            throw new WebsiteBApiException('INVALID_API_RESPONSE', 'Website B returned an invalid JSON structure.', $response->status());
        }

        return $result;
    }

    private function baseUrl(): string
    {
        $url = config('services.website_b.base_url');

        if (! is_string($url) || ! str_starts_with($url, 'http')) {
            throw new RuntimeException('WEBSITE_B_API_URL is not configured.');
        }

        return rtrim($url, '/');
    }

    private function clientId(): string
    {
        return $this->requiredConfig('client_id', 'WEBSITE_B_CLIENT_ID');
    }

    private function clientSecret(): string
    {
        return $this->requiredConfig('client_secret', 'WEBSITE_B_CLIENT_SECRET');
    }

    private function requiredConfig(string $key, string $environmentName): string
    {
        $value = config("services.website_b.{$key}");

        if (! is_string($value) || $value === '') {
            throw new RuntimeException("{$environmentName} is not configured.");
        }

        return $value;
    }

    private function timeout(): int
    {
        return max(1, (int) config('services.website_b.timeout', 15));
    }

    private function tokenCacheKey(): string
    {
        return 'website_b:access_token:'.sha1($this->baseUrl().'|'.(string) config('services.website_b.client_id'));
    }
}
