<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Parent Portal') · {{ config('app.name', 'HomeTutor') }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    @vite('resources/css/app.css')
</head>
<body class="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
    <header class="border-b border-slate-200 bg-white">
        <div class="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:px-8">
            <a href="{{ route('parent.dashboard') }}" class="flex items-center gap-3">
                <img src="/images/HT_Rectangle_3D.png" alt="HomeTutor" class="h-11 w-auto object-contain">
                <span class="hidden text-sm font-bold text-[#082c58] sm:block">Parent Portal</span>
            </a>
            <nav class="grid grid-cols-3 items-stretch gap-1 text-center text-xs font-semibold text-slate-600 sm:flex sm:items-center sm:text-sm">
                <a href="{{ route('parent.dashboard') }}" class="flex items-center justify-center rounded-lg px-2 py-2 hover:bg-sky-50 hover:text-sky-700 sm:px-3">Dashboard</a>
                <a href="{{ route('parent.children.index') }}" class="flex items-center justify-center rounded-lg px-2 py-2 hover:bg-sky-50 hover:text-sky-700 sm:px-3">Children</a>
                <a href="{{ route('parent.subscriptions.index') }}" class="flex items-center justify-center rounded-lg px-2 py-2 hover:bg-sky-50 hover:text-sky-700 sm:px-3">Packages & Codes</a>
                <a href="{{ route('parent.payment-log.index') }}" class="flex items-center justify-center rounded-lg px-2 py-2 hover:bg-sky-50 hover:text-sky-700 sm:px-3">Payment Log</a>
                <a href="{{ route('parent.cart.index') }}" aria-label="Cart with {{ $cartItemCount }} {{ Str::plural('item', $cartItemCount) }}" class="relative flex items-center justify-center rounded-lg px-3 py-2 hover:bg-sky-50 hover:text-sky-700" title="Package cart">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 4h2l1.7 10.1a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 1.9-1.4L21 7H6M9 20h.01M17 20h.01"/></svg>
                    @if($cartItemCount > 0)
                        <span class="absolute right-0 top-0 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold leading-none text-white ring-2 ring-white">{{ $cartItemCount > 99 ? '99+' : $cartItemCount }}</span>
                    @endif
                </a>
                <details class="group relative col-span-3 sm:col-span-1 sm:ml-2">
                    <summary class="flex cursor-pointer list-none items-center justify-center gap-2 rounded-lg bg-[#082c58] px-3 py-2 text-white hover:bg-[#0b407c]">
                        <span class="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-xs font-bold">{{ strtoupper(substr(auth()->user()->name, 0, 1)) }}</span>
                        <span class="max-w-32 truncate">{{ auth()->user()->name }}</span>
                        <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 transition group-open:rotate-180"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd"/></svg>
                    </summary>
                    <div class="absolute right-0 z-50 mt-2 w-full min-w-64 overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-xl sm:w-72">
                        <div class="border-b border-slate-100 px-4 py-3">
                            <p class="truncate text-sm font-bold text-[#082c58]">{{ auth()->user()->name }}</p>
                            <p class="mt-0.5 truncate text-xs text-slate-500">{{ auth()->user()->email }}</p>
                            @if(auth()->user()->mobile_number)<p class="mt-1 text-xs text-slate-500">{{ auth()->user()->mobile_number }}</p>@endif
                        </div>
                        <a href="{{ route('parent.profile.edit') }}" class="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700">Profile & password</a>
                        <form method="POST" action="{{ route('logout') }}" class="border-t border-slate-100">@csrf<button class="w-full px-4 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50">Log out</button></form>
                    </div>
                </details>
            </nav>
        </div>
    </header>

    <main class="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        @if (session('success'))
            <div class="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{{ session('success') }}</div>
        @endif
        @if (session('error'))
            <div class="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{{ session('error') }}</div>
        @endif
        @if ($errors->any())
            <div class="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800"><ul class="list-disc pl-5">@foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul></div>
        @endif
        @yield('content')
    </main>
    @stack('scripts')
</body>
</html>
