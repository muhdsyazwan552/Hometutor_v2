<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\IntegrationJwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class IntegrationTokenController extends Controller
{
    public function __invoke(Request $request, IntegrationJwtService $jwt): JsonResponse
    {
        if ($this->httpsIsRequired() && ! $request->isSecure()) {
            return $this->error('HTTPS_REQUIRED', 'HTTPS is required.', 400);
        }

        $credentials = $request->validate([
            'grant_type' => ['required', 'string', 'in:client_credentials'],
            'client_id' => ['required', 'string', 'max:255'],
            'client_secret' => ['required', 'string', 'max:1024'],
        ]);

        $configuredId = config('integration_api.client_id');
        $configuredSecret = config('integration_api.client_secret');

        if (! is_string($configuredId) || $configuredId === '' || ! is_string($configuredSecret) || strlen($configuredSecret) < 32) {
            return $this->error('SERVER_MISCONFIGURED', 'The integration API is not configured.', 503);
        }

        $idMatches = hash_equals($configuredId, $credentials['client_id']);
        $secretMatches = hash_equals($configuredSecret, $credentials['client_secret']);

        if (! $idMatches || ! $secretMatches) {
            return $this->error('INVALID_CLIENT', 'The client credentials are invalid.', 401)
                ->header('WWW-Authenticate', 'Bearer realm="integration-api"');
        }

        try {
            return response()->json($jwt->issue($configuredId, ['children:read', 'subscriptions:read']))
                ->header('Cache-Control', 'no-store')
                ->header('Pragma', 'no-cache');
        } catch (RuntimeException) {
            return $this->error('SERVER_MISCONFIGURED', 'The integration API is not configured.', 503);
        }
    }

    private function httpsIsRequired(): bool
    {
        return app()->environment('production') && (bool) config('integration_api.require_https', true);
    }

    private function error(string $code, string $message, int $status): JsonResponse
    {
        return response()->json(['error' => ['code' => $code, 'message' => $message]], $status);
    }
}
