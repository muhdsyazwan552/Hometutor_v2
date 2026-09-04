# Integrasi Website A dengan Website B

Projek ini ialah **Website A**. Ia tidak menerbitkan API pengguna untuk Website B; sebaliknya ia memanggil REST API yang disediakan oleh Website B menggunakan service account dan JWT.

## Maklumat yang perlu diterima daripada pemilik Website B

Untuk setiap environment (staging dan production), dapatkan:

1. Base URL API, contohnya `https://staging.website-b.example/api`.
2. `client_id` dan `client_secret` service account Website A.
3. Endpoint token dan tempoh luput JWT.
4. Spesifikasi payload sebenar bagi create/update pengguna dan subscription.
5. Senarai kod error, rate limit, polisi retry, dan IP allowlist jika ada.
6. ID package/subscription Website B yang perlu dipadankan dengan package Website A.

## Konfigurasi Website A

Tambahkan credentials yang dibekalkan oleh Website B pada `.env`:

```dotenv
WEBSITE_B_API_URL=https://staging.website-b.example/api
WEBSITE_B_CLIENT_ID=website-a-staging
WEBSITE_B_CLIENT_SECRET=<secret-daripada-website-b>
WEBSITE_B_API_TIMEOUT=15
```

Gunakan credentials berlainan di production. Jangan letakkan secret dalam JavaScript, repository, atau browser. Selepas mengubah `.env`, jalankan:

```bash
php artisan config:clear
```

## Komponen yang tersedia

`App\Services\WebsiteBApiClient` mengurus perkara berikut secara automatik:

- mendapatkan JWT daripada `POST /auth/token`;
- menyimpan token dalam Laravel cache sehingga hampir luput;
- menghantar header `Authorization: Bearer <token>`;
- mendapatkan token baharu dan mencuba sekali lagi apabila menerima `401`;
- menormalkan error Website B sebagai `WebsiteBApiException`;
- menetapkan connection timeout.

Kaedah yang tersedia:

```php
$client->createUser($payload);
$client->getUser($websiteBUserId);
$client->findUserBySourceId($localUserId);
$client->findUserByEmail($email);
$client->updateUser($websiteBUserId, $payload);
$client->suspendUser($websiteBUserId);
$client->terminateUser($websiteBUserId);
```

Contoh penggunaan daripada controller, listener atau queued job:

```php
use App\Services\WebsiteBApiClient;

$websiteBUser = app(WebsiteBApiClient::class)->createUser([
    'source_user_id' => (string) $user->id,
    'name' => $user->name,
    'email' => $user->email,
    'subscription' => [
        'package_id' => $websiteBPackageId,
        'status' => 'active',
        'starts_at' => $startsAt->toIso8601String(),
        'ends_at' => $endsAt->toIso8601String(),
    ],
]);
```

`source_user_id` hendaklah menggunakan ID pengguna Website A yang stabil. Untuk operasi selepas penciptaan, Website A boleh mencari pengguna melalui `findUserBySourceId()` jika ID Website B belum disimpan secara lokal.

## Pengendalian error

```php
use App\Exceptions\WebsiteBApiException;

try {
    $client->suspendUser($websiteBUserId);
} catch (WebsiteBApiException $exception) {
    report($exception);

    $code = $exception->errorCode;
    $status = $exception->httpStatus;
    $fieldErrors = $exception->details;
}
```

Untuk operasi automatik sebenar, panggilan API disarankan dibuat melalui queued job supaya gangguan sementara Website B tidak membatalkan transaksi utama Website A. Retry hanya sesuai untuk connection error, `429`, dan kebanyakan error `5xx`; jangan retry error validasi `422` secara automatik.

## Perkara yang belum boleh diaktifkan

Integrasi pada event sebenar—contohnya selepas pembayaran, pembaharuan subscription, suspend atau terminate pengguna—memerlukan dokumen API dan credentials sebenar daripada Website B. Setelah diterima, padankan field dan package ID sebelum menghidupkan job automatik di production.
