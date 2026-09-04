<?php

return [
    'client_id' => env('INTEGRATION_API_CLIENT_ID'),
    'client_secret' => env('INTEGRATION_API_CLIENT_SECRET'),
    'jwt_secret' => env('INTEGRATION_API_JWT_SECRET'),
    'issuer' => env('INTEGRATION_API_ISSUER', env('APP_URL')),
    'audience' => env('INTEGRATION_API_AUDIENCE', 'website-b'),
    'token_ttl' => (int) env('INTEGRATION_API_TOKEN_TTL', 300),
    'clock_leeway' => (int) env('INTEGRATION_API_CLOCK_LEEWAY', 10),
    'require_https' => env('INTEGRATION_API_REQUIRE_HTTPS', true),
];
