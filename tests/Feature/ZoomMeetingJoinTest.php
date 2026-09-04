<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\ZoomMeeting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ZoomMeetingJoinTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('zoom.meeting_sdk.client_id', 'test-client-id');
        config()->set('zoom.meeting_sdk.client_secret', 'test-client-secret');
    }

    public function test_verified_user_can_request_participant_join_credentials(): void
    {
        $user = User::factory()->create();
        $meeting = $this->createJoinableMeeting();

        $response = $this
            ->actingAs($user)
            ->postJson(route('zoom.meetings.signature', $meeting));

        $response
            ->assertOk()
            ->assertJsonPath('meetingNumber', '12345678901')
            ->assertJsonPath('password', 'Class123')
            ->assertJsonPath('userName', $user->name)
            ->assertJsonPath('userEmail', $user->email)
            ->assertJsonStructure(['signature', 'leaveUrl']);

        $payload = json_decode(
            $this->decode(explode('.', $response->json('signature'))[1]),
            true,
            flags: JSON_THROW_ON_ERROR
        );

        $this->assertSame(0, $payload['role']);
    }

    public function test_user_cannot_request_credentials_outside_the_join_window(): void
    {
        $user = User::factory()->create();
        $meeting = $this->createJoinableMeeting([
            'starts_at' => now()->addHours(2),
            'ends_at' => now()->addHours(3),
        ]);

        $this
            ->actingAs($user)
            ->postJson(route('zoom.meetings.signature', $meeting))
            ->assertForbidden();
    }

    public function test_guest_cannot_open_the_meeting_page(): void
    {
        $meeting = $this->createJoinableMeeting();

        $this
            ->get(route('zoom.meetings.join', $meeting))
            ->assertRedirect(route('login'));
    }

    private function createJoinableMeeting(array $attributes = []): ZoomMeeting
    {
        return ZoomMeeting::create(array_merge([
            'title' => 'Mathematics Class',
            'zoom_meeting_id' => '12345678901',
            'passcode' => 'Class123',
            'starts_at' => now()->subMinutes(5),
            'ends_at' => now()->addHour(),
            'is_active' => true,
        ], $attributes));
    }

    private function decode(string $value): string
    {
        return base64_decode(
            strtr($value, '-_', '+/').str_repeat('=', (4 - strlen($value) % 4) % 4),
            true
        );
    }
}
