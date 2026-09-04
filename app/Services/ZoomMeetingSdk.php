<?php

namespace App\Services;

use RuntimeException;

class ZoomMeetingSdk
{
    public function isConfigured(): bool
    {
        return filled(config('zoom.meeting_sdk.client_id'))
            && filled(config('zoom.meeting_sdk.client_secret'));
    }

    /**
     * Generate a short-lived Meeting SDK JWT.
     *
     * The role is intentionally fixed to participant. Starting a meeting as
     * host requires a separately obtained ZAK token and must not be enabled by
     * accepting a role value from the browser.
     */
    public function participantSignature(string $meetingNumber): string
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('Zoom Meeting SDK credentials are not configured.');
        }

        $clientId = (string) config('zoom.meeting_sdk.client_id');
        $clientSecret = (string) config('zoom.meeting_sdk.client_secret');
        $issuedAt = now()->timestamp - 30;
        $expiresAt = $issuedAt + 3600;

        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT',
        ];

        $payload = [
            'appKey' => $clientId,
            'mn' => $meetingNumber,
            'role' => 0,
            'iat' => $issuedAt,
            'exp' => $expiresAt,
            'tokenExp' => $expiresAt,
        ];

        $unsignedToken = $this->base64UrlEncode($header)
            .'.'
            .$this->base64UrlEncode($payload);

        $signature = hash_hmac('sha256', $unsignedToken, $clientSecret, true);

        return $unsignedToken.'.'.$this->base64UrlEncode($signature);
    }

    private function base64UrlEncode(array|string $value): string
    {
        if (is_array($value)) {
            $value = json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
        }

        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
