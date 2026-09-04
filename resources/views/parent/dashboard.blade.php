@extends('layouts.parent')

@section('title', 'Dashboard')

@section('content')
    <section class="overflow-hidden rounded-3xl bg-[#082c58] p-7 text-white shadow-xl sm:p-10">
        <p class="text-sm font-bold uppercase tracking-[0.16em] text-cyan-200">Parent account</p>
        <h1 class="mt-3 text-3xl font-bold">Welcome, {{ $parent->display_name ?: $parent->name }}.</h1>
        <p class="mt-3 max-w-2xl text-blue-100">Buy activation codes and manage each child’s individual learning subscription.</p>
    </section>

    <div class="mt-7 grid gap-6 lg:grid-cols-3">
        <article class="flex min-h-[360px] flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_10px_35px_rgba(8,44,88,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(8,44,88,0.13)] sm:p-8">
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 text-[#0788c9]">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-10 w-10"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3.4 19 6v5.5c0 4.2-2.8 7.7-7 9.1-4.2-1.4-7-4.9-7-9.1V6l7-2.6Z"/><path stroke-linecap="round" stroke-linejoin="round" d="m8.7 12 2.1 2.1 4.7-4.8"/></svg>
            </div>
            <h2 class="mt-7 text-xl font-extrabold text-[#082c58]">Active licences</h2>
            <p class="mt-3 text-6xl font-extrabold leading-none tracking-tight text-[#062b58]">{{ $activeChildCount }}</p>
            <div class="mt-5">
                @if($renewalRequiredCount === 0)
                    <span class="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700"><span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>All active</span>
                @else
                    <span class="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700"><span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>{{ $renewalRequiredCount }} need renewal</span>
                @endif
            </div>
            <a href="{{ route('parent.subscriptions.index') }}" class="mt-auto inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#0788c9] to-[#0876bc] px-5 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:from-[#0678b4] hover:to-[#0868a5]">Buy licence</a>
        </article>

        <article class="flex min-h-[360px] flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_10px_35px_rgba(8,44,88,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(8,44,88,0.13)] sm:p-8">
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 text-[#0788c9]">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-10 w-10"><path stroke-linecap="round" stroke-linejoin="round" d="M15.5 20v-1.7a4.3 4.3 0 0 0-4.3-4.3H6.3A4.3 4.3 0 0 0 2 18.3V20"/><circle cx="8.8" cy="7" r="4"/><path stroke-linecap="round" stroke-linejoin="round" d="M16 4.3a4 4 0 0 1 0 7.5M22 20v-1.7a4.3 4.3 0 0 0-3.2-4.1"/></svg>
            </div>
            <h2 class="mt-7 text-xl font-extrabold text-[#082c58]">Child accounts</h2>
            <p class="mt-3 text-6xl font-extrabold leading-none tracking-tight text-[#062b58]">{{ $children->count() }}</p>
            <p class="mt-5 text-base font-medium text-slate-500">{{ $children->count() }} linked {{ Str::plural('account', $children->count()) }}</p>
            <a href="{{ route('parent.children.index') }}" class="mt-auto inline-flex w-full items-center justify-center rounded-xl border-2 border-[#0788c9] px-5 py-3 text-sm font-extrabold text-[#0788c9] transition hover:bg-sky-50">Manage children</a>
        </article>

        <article class="flex min-h-[360px] flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_10px_35px_rgba(8,44,88,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(8,44,88,0.13)] sm:p-8">
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 text-[#0788c9]">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-10 w-10"><path stroke-linecap="round" stroke-linejoin="round" d="M4 5h16a1 1 0 0 1 1 1v3a3 3 0 0 0 0 6v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a3 3 0 0 0 0-6V6a1 1 0 0 1 1-1Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M9.5 14.5a3.5 3.5 0 0 0 5.7-1M14.5 9.5a3.5 3.5 0 0 0-5.7 1M9 8.5v2h2M15 15.5v-2h-2"/></svg>
            </div>
            <h2 class="mt-7 text-xl font-extrabold text-[#082c58]">Renewal status</h2>
            <p class="mt-3 text-6xl font-extrabold leading-none tracking-tight text-[#062b58]">{{ $unusedCodeCount }}</p>
            <p class="mt-3 text-base font-medium text-slate-500">Unused {{ Str::plural('code', $unusedCodeCount) }}</p>
            <p class="mt-3 flex items-center gap-2 text-sm font-bold {{ $renewalRequiredCount === 0 ? 'text-emerald-700' : 'text-amber-700' }}">
                @if($renewalRequiredCount === 0)
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5"><circle cx="10" cy="10" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="m6.5 10 2.2 2.2 4.8-5"/></svg>
                @else
                    <span class="flex h-5 w-5 items-center justify-center rounded-full border-2 border-current text-xs">!</span>
                @endif
                {{ $renewalRequiredCount }} {{ Str::plural('child', $renewalRequiredCount) }} {{ $renewalRequiredCount === 1 ? 'needs' : 'need' }} renewal
            </p>
            <a href="{{ route('parent.subscriptions.index') }}" class="mt-auto inline-flex w-full items-center justify-center rounded-xl border-2 border-[#0788c9] px-5 py-3 text-sm font-extrabold text-[#0788c9] transition hover:bg-sky-50">View codes</a>
        </article>
    </div>

    <section class="mt-7">
        <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h2 class="text-xl font-bold text-[#082c58]">Your children</h2>
                <p class="mt-1 text-sm text-slate-500">Accounts connected to this parent account.</p>
            </div>
            <a href="{{ route('parent.children.create') }}" class="rounded-xl bg-[#f2c237] px-4 py-2.5 text-sm font-bold text-[#082c58]">Create child with code</a>
        </div>
        <div class="mt-5 grid gap-6 xl:grid-cols-2">
            @forelse ($children as $child)
                @include('parent.children._progress-card', ['child' => $child])
            @empty
                <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center xl:col-span-2"><p class="font-bold text-slate-700">No child accounts yet</p><p class="mt-2 text-sm text-slate-500">Use an activation code to create the first child account.</p></div>
            @endforelse
        </div>
    </section>
@endsection
