<?php

namespace Tests\Unit;

use App\Models\ZoomMeeting;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ZoomMeetingTest extends TestCase
{
    public function test_active_meeting_is_joinable_inside_the_configured_window(): void
    {
        config()->set('zoom.join_window.minutes_before', 15);
        config()->set('zoom.join_window.minutes_after', 30);

        $meeting = new ZoomMeeting([
            'starts_at' => '2026-07-31 10:00:00',
            'ends_at' => '2026-07-31 11:00:00',
            'is_active' => true,
        ]);

        $this->assertTrue($meeting->isJoinableAt(Carbon::parse('2026-07-31 09:45:00')));
        $this->assertTrue($meeting->isJoinableAt(Carbon::parse('2026-07-31 11:30:00')));
        $this->assertFalse($meeting->isJoinableAt(Carbon::parse('2026-07-31 09:44:59')));
        $this->assertFalse($meeting->isJoinableAt(Carbon::parse('2026-07-31 11:30:01')));
    }

    public function test_inactive_meeting_cannot_be_joined(): void
    {
        $meeting = new ZoomMeeting([
            'starts_at' => now()->subMinute(),
            'ends_at' => now()->addHour(),
            'is_active' => false,
        ]);

        $this->assertFalse($meeting->isJoinableAt(now()));
    }
}
