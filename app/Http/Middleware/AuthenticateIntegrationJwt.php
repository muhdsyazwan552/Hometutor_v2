<?php

namespace App\Http\Middleware;

use App\Services\IntegrationJwtService;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateIntegrationJwt
{
    public function __construct(private readonly IntegrationJwtService $jwt) {}

    public function handle(Request $request, Closure $next, string ...$requiredScopes): Response
    {
        if ($this->httpsIsRequired() && ! $request->isSecure()) {
            return $this->error('HTTPS_REQUIRED', 'HTTPS is required.', 400);
        }

        $token = $request->bearerToken();

        if (! is_string($token) || $token === '') {
            return $this->unauthorized('A Bearer token is required.');
        }

        try {
            $claims = $this->jwt->validate($token);
        } catch (RuntimeException) {
            return $this->unauthorized('The access token is invalid or expired.');
        }

        $scopes = array_values(array_filter(explode(' ', $claims['scope'])));

        foreach ($requiredScopes as $scope) {
            if (! in_array($scope, $scopes, true)) {
                return $this->error('INSUFFICIENT_SCOPE', 'The access token does not have the required scope.', 403);
            }
        }

        $request->attributes->set('integration_jwt', $claims);

        return $next($request);
    }

    private function httpsIsRequired(): bool
    {
        return app()->environment('production') && (bool) config('integration_api.require_https', true);
    }

    private function unauthorized(string $message): JsonResponse
    {
        return $this->error('UNAUTHENTICATED', $message, 401)
            ->header('WWW-Authenticate', 'Bearer realm="integration-api"');
    }

    private function error(string $code, string $message, int $status): JsonResponse
    {
        return response()->json(['error' => ['code' => $code, 'message' => $message]], $status);
    }
}
