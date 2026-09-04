<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\ZoomMeeting;
use App\Services\ZoomMeetingSdk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ZoomMeetingController extends Controller
{
    public function show(
        Request $request,
        ZoomMeeting $zoomMeeting,
        ZoomMeetingSdk $meetingSdk
    ): Response {
        $this->ensureUserCanJoin($zoomMeeting);

        return Inertia::render('Zoom/JoinMeeting', [
            'meeting' => [
                'id' => $zoomMeeting->id,
                'title' => $zoomMeeting->title,
                'startsAt' => $zoomMeeting->starts_at->toIso8601String(),
                'endsAt' => $zoomMeeting->ends_at->toIso8601String(),
            ],
            'zoomConfigured' => $meetingSdk->isConfigured(),
        ]);
    }

    public function signature(
        Request $request,
        ZoomMeeting $zoomMeeting,
        ZoomMeetingSdk $meetingSdk
    ): JsonResponse {
        $this->ensureUserCanJoin($zoomMeeting);

        abort_unless(
            $meetingSdk->isConfigured(),
            503,
            'Zoom Meeting SDK credentials are not configured.'
        );

        $user = $request->user();
        $displayName = $user->display_name ?: $user->name;

        return response()->json([
            'signature' => $meetingSdk->participantSignature($zoomMeeting->zoom_meeting_id),
            'meetingNumber' => $zoomMeeting->zoom_meeting_id,
            'password' => $zoomMeeting->passcode ?: '',
            'userName' => $displayName,
            'userEmail' => $user->email,
            'leaveUrl' => route('dashboard'),
        ]);
    }

    private function ensureUserCanJoin(ZoomMeeting $zoomMeeting): void
    {
        abort_unless(
            $zoomMeeting->isJoinableAt(now()),
            403,
            'This meeting is not currently available.'
        );

        // Add course/class enrollment authorization here once the project has
        // a meeting-to-class enrollment relationship.
    }
}
