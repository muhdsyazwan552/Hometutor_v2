# Website B integration API

This read-only REST API lets Website B copy child and child-subscription records. It does not expose passwords, parent contact details, payments, activation codes, or other application tables.

## Configuration

Set these values in the production `.env` file. Generate the two secrets independently and transfer the client secret to Website B through a secure channel.

```dotenv
INTEGRATION_API_CLIENT_ID=website-b
INTEGRATION_API_CLIENT_SECRET=<at-least-32-random-characters>
INTEGRATION_API_JWT_SECRET=<a-different-at-least-32-random-characters>
INTEGRATION_API_ISSUER=https://hometutor.example
INTEGRATION_API_AUDIENCE=website-b
INTEGRATION_API_TOKEN_TTL=300
INTEGRATION_API_REQUIRE_HTTPS=true
```

After changing production configuration, run `php artisan config:cache`. Rotate both secrets immediately if either one is disclosed. Changing `INTEGRATION_API_JWT_SECRET` invalidates all outstanding access tokens.

## Obtain an access token

`POST /api/integration/v1/auth/token`

```json
{
  "grant_type": "client_credentials",
  "client_id": "website-b",
  "client_secret": "<client-secret>"
}
```

The response contains a short-lived HS256 JWT with only `children:read` and `subscriptions:read` scopes. Do not put credentials or tokens in URLs or logs.

## Copy records

Send `Authorization: Bearer <access_token>` and `Accept: application/json` to:

- `GET /api/integration/v1/children`
- `GET /api/integration/v1/subscriptions`

Both endpoints accept `per_page` (1-200), `cursor`, and an ISO-8601 `updated_since` timestamp. Follow `meta.next_cursor` until it is `null`. Use each record's UUID as the destination upsert key and `child_uuid` to connect a subscription to its child.

For a reliable incremental sync, save the sync start time before requesting the first page, fetch every page using the same `updated_since`, and use the saved start time for the next run. Periodically perform a full reconciliation because hard-deleted local records cannot appear in an incremental response.

The API is rate-limited and rejects non-HTTPS production requests. It is intentionally read-only.
