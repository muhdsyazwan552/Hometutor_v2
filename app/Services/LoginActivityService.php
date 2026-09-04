<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LoginActivityService
{
    public function record(int $userId, Request $request): void
    {
        $location = $request->input('location');

        DB::table('login_activity_logs')->insert([
            'user_id' => $userId,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 1000),
            'device_type' => $this->deviceType((string) $request->userAgent()),
            'latitude' => $this->roundedCoordinate($location['latitude'] ?? null, -90, 90),
            'longitude' => $this->roundedCoordinate($location['longitude'] ?? null, -180, 180),
            'location_accuracy_meters' => isset($location['accuracy']) ? (int) round($location['accuracy']) : null,
            'location_shared_at' => isset($location['latitude'], $location['longitude']) ? now() : null,
            'logged_in_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function roundedCoordinate(mixed $value, float $minimum, float $maximum): ?float
    {
        if (! is_numeric($value)) {
            return null;
        }

        $coordinate = (float) $value;

        return $coordinate >= $minimum && $coordinate <= $maximum ? round($coordinate, 3) : null;
    }

    private function deviceType(string $userAgent): string
    {
        if (preg_match('/iPad|Tablet|Kindle|PlayBook/i', $userAgent)) {
            return 'tablet';
        }

        if (preg_match('/Android|iPhone|iPod|Mobile/i', $userAgent)) {
            return 'mobile';
        }

        return 'desktop';
    }
}
