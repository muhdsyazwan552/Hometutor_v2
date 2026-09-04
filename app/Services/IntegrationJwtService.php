<?php

namespace App\Services;

use Illuminate\Support\Str;
use JsonException;
use RuntimeException;

class IntegrationJwtService
{
    private const ALGORITHM = 'HS256';

    public function issue(string $subject, array $scopes): array
    {
        $now = now()->timestamp;
        $ttl = min(max((int) config('integration_api.token_ttl', 300), 60), 900);

        $claims = [
            'iss' => $this->issuer(),
            'aud' => $this->audience(),
            'sub' => $subject,
            'iat' => $now,
            'nbf' => $now,
            'exp' => $now + $ttl,
            'jti' => (string) Str::uuid(),
            'scope' => implode(' ', array_values(array_unique($scopes))),
        ];

        $header = $this->encode(['alg' => self::ALGORITHM, 'typ' => 'JWT']);
        $payload = $this->encode($claims);
        $signature = $this->base64UrlEncode(hash_hmac('sha256', "{$header}.{$payload}", $this->secret(), true));

        return [
            'access_token' => "{$header}.{$payload}.{$signature}",
            'token_type' => 'Bearer',
            'expires_in' => $ttl,
            'scope' => $claims['scope'],
        ];
    }

    public function validate(string $token): array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3 || in_array('', $parts, true)) {
            throw new RuntimeException('Malformed token.');
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
        $header = $this->decode($encodedHeader);
        $claims = $this->decode($encodedPayload);

        if (($header['alg'] ?? null) !== self::ALGORITHM || ($header['typ'] ?? null) !== 'JWT') {
            throw new RuntimeException('Unsupported token.');
        }

        $expectedSignature = $this->base64UrlEncode(
            hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $this->secret(), true)
        );

        if (! hash_equals($expectedSignature, $encodedSignature)) {
            throw new RuntimeException('Invalid token signature.');
        }

        $now = now()->timestamp;
        $leeway = min(max((int) config('integration_api.clock_leeway', 10), 0), 60);

        if (! is_string($claims['iss'] ?? null) || ! hash_equals($this->issuer(), $claims['iss'])) {
            throw new RuntimeException('Invalid token issuer.');
        }

        if (! is_string($claims['aud'] ?? null) || ! hash_equals($this->audience(), $claims['aud'])) {
            throw new RuntimeException('Invalid token audience.');
        }

        foreach (['iat', 'nbf', 'exp'] as $claim) {
            if (! is_int($claims[$claim] ?? null)) {
                throw new RuntimeException('Invalid token claims.');
            }
        }

        if ($claims['nbf'] > $now + $leeway || $claims['iat'] > $now + $leeway || $claims['exp'] <= $now - $leeway) {
            throw new RuntimeException('Token is not currently valid.');
        }

        if ($claims['exp'] - $claims['iat'] > 900 || $claims['exp'] <= $claims['iat']) {
            throw new RuntimeException('Invalid token lifetime.');
        }

        if (! is_string($claims['sub'] ?? null) || ! is_string($claims['jti'] ?? null) || ! is_string($claims['scope'] ?? null)) {
            throw new RuntimeException('Invalid token claims.');
        }

        return $claims;
    }

    private function encode(array $value): string
    {
        try {
            return $this->base64UrlEncode(json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES));
        } catch (JsonException $exception) {
            throw new RuntimeException('Could not encode token.', previous: $exception);
        }
    }

    private function decode(string $value): array
    {
        if (! preg_match('/^[A-Za-z0-9_-]+$/', $value)) {
            throw new RuntimeException('Malformed token.');
        }

        $padding = (4 - strlen($value) % 4) % 4;
        $decoded = base64_decode(strtr($value.str_repeat('=', $padding), '-_', '+/'), true);

        if ($decoded === false) {
            throw new RuntimeException('Malformed token.');
        }

        try {
            $result = json_decode($decoded, true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new RuntimeException('Malformed token.', previous: $exception);
        }

        if (! is_array($result)) {
            throw new RuntimeException('Malformed token.');
        }

        return $result;
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function secret(): string
    {
        $secret = config('integration_api.jwt_secret');

        if (! is_string($secret) || strlen($secret) < 32) {
            throw new RuntimeException('INTEGRATION_API_JWT_SECRET must contain at least 32 characters.');
        }

        return $secret;
    }

    private function issuer(): string
    {
        return $this->requiredString('issuer', 'INTEGRATION_API_ISSUER');
    }

    private function audience(): string
    {
        return $this->requiredString('audience', 'INTEGRATION_API_AUDIENCE');
    }

    private function requiredString(string $key, string $environmentName): string
    {
        $value = config("integration_api.{$key}");

        if (! is_string($value) || $value === '') {
            throw new RuntimeException("{$environmentName} is not configured.");
        }

        return $value;
    }
}
