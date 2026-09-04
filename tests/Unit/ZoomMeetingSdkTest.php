<?php

namespace Tests\Unit;

use App\Services\ZoomMeetingSdk;
use Tests\TestCase;

class ZoomMeetingSdkTest extends TestCase
{
    public function test_it_generates_a_valid_participant_signature(): void
    {
        config()->set('zoom.meeting_sdk.client_id', 'test-client-id');
        config()->set('zoom.meeting_sdk.client_secret', 'test-client-secret');

        $token = app(ZoomMeetingSdk::class)->participantSignature('12345678901');
        [$encodedHeader, $encodedPayload, $encodedSignature] = explode('.', $token);

        $payload = json_decode($this->decode($encodedPayload), true, flags: JSON_THROW_ON_ERROR);
        $expectedSignature = hash_hmac(
            'sha256',
            $encodedHeader.'.'.$encodedPayload,
            'test-client-secret',
            true
        );

        $this->assertSame('test-client-id', $payload['appKey']);
        $this->assertSame('12345678901', $payload['mn']);
        $this->assertSame(0, $payload['role']);
        $this->assertSame($payload['exp'], $payload['tokenExp']);
        $this->assertSame(3600, $payload['exp'] - $payload['iat']);
        $this->assertSame($expectedSignature, $this->decode($encodedSignature));
    }

    private function decode(string $value): string
    {
        return base64_decode(
            strtr($value, '-_', '+/').str_repeat('=', (4 - strlen($value) % 4) % 4),
            true
        );
    }
}
