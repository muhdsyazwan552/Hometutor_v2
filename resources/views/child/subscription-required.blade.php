<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Package required · {{ config('app.name', 'HomeTutor') }}</title>
    @vite('resources/css/app.css')
</head>
<body class="flex min-h-screen items-center justify-center bg-[#061f42] p-5 font-sans antialiased">
    <main class="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-2xl sm:p-10">
        <img src="/images/HT_Rectangle_3D.png" alt="HomeTutor" class="mx-auto h-16 w-auto">
        <div class="mx-auto mt-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">🔒</div>
        <h1 class="mt-5 text-2xl font-bold text-[#082c58]">Learning access is paused</h1>
        <p class="mt-3 leading-7 text-slate-600">Your child subscription has expired or was cancelled. Ask your parent for an unused activation code, or enter it below. Your account and learning data are still safe.</p>
        <form method="POST" action="{{ route('child.subscription.renew') }}" class="mt-6 text-left">@csrf
            <label class="block text-sm font-bold text-slate-700">Activation code<input name="activation_code" required autocomplete="off" class="mt-2 block w-full rounded-xl border-slate-200 font-mono uppercase focus:border-sky-500 focus:ring-sky-500" placeholder="HT-XXXX-XXXX-XXXX-XXXX-XXXX"></label>
            @error('activation_code')<p class="mt-2 text-sm font-semibold text-rose-600">{{ $message }}</p>@enderror
            <button class="mt-4 w-full rounded-xl bg-[#0788c9] px-6 py-3 text-sm font-bold text-white">Renew learning access</button>
        </form>
        <form method="POST" action="{{ route('logout') }}" class="mt-7">
            @csrf
            <button class="text-sm font-bold text-slate-500">Return to login</button>
        </form>
    </main>
</body>
</html>
