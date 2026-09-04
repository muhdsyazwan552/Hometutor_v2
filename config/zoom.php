<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Zoom Meeting SDK
    |--------------------------------------------------------------------------
    |
    | Create a Meeting SDK app in the Zoom App Marketplace and keep both
    | credentials on the server. The client secret must never be exposed to
    | the React application.
    |
    */
    'meeting_sdk' => [
        'client_id' => env('ZOOM_MEETING_SDK_CLIENT_ID'),
        'client_secret' => env('ZOOM_MEETING_SDK_CLIENT_SECRET'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Participant join window
    |--------------------------------------------------------------------------
    */
    'join_window' => [
        'minutes_before' => (int) env('ZOOM_JOIN_MINUTES_BEFORE', 15),
        'minutes_after' => (int) env('ZOOM_JOIN_MINUTES_AFTER', 30),
    ],
];
