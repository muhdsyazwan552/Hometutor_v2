<!DOCTYPE html>
<html lang="en-us">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes">
    <title>Unity Web Player | {{ $game->title }}</title>
    <style>
        html,
        body {
            width: 100%;
            height: 100%;
            margin: 0;
            overflow: hidden;
            background-color: #231f20;
        }

        #unity-player {
            display: block;
            width: 100%;
            height: 100%;
            border: 0;
        }
    </style>
</head>
<body>
    <iframe
        id="unity-player"
        src="{{ $game->launch_url }}"
        title="{{ $game->title }}"
        allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write"
        allowfullscreen
    ></iframe>
</body>
</html>
