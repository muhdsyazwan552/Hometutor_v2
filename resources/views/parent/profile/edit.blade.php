@extends('layouts.parent')
@section('title', 'My Profile')
@section('content')
<div>
    <p class="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">Account settings</p>
    <h1 class="mt-2 text-3xl font-bold text-[#082c58]">My profile</h1>
    <p class="mt-2 text-slate-600">Review your account details and keep your login secure.</p>
</div>

<div class="mt-7 grid gap-6 lg:grid-cols-2">
    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-xl font-bold text-sky-800">{{ strtoupper(substr($parent->name, 0, 1)) }}</div>
            <div><h2 class="text-lg font-bold text-[#082c58]">Profile details</h2><p class="text-sm text-slate-500">Parent account</p></div>
        </div>

        <form method="POST" action="{{ route('parent.profile.update') }}" class="mt-5 space-y-4">
            @csrf
            @method('PATCH')
            <label class="block text-sm font-semibold text-slate-700">Full name
                <input name="name" value="{{ old('name', $parent->name) }}" required maxlength="255" autocomplete="name" class="mt-2 block w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500">
            </label>
            <label class="block text-sm font-semibold text-slate-700">Username
                <input value="{{ $parent->username }}" disabled class="mt-2 block w-full rounded-xl border-slate-200 bg-slate-100 text-slate-500">
            </label>
            <label class="block text-sm font-semibold text-slate-700">Email
                <input value="{{ $parent->email }}" disabled class="mt-2 block w-full rounded-xl border-slate-200 bg-slate-100 text-slate-500">
            </label>
            <label class="block text-sm font-semibold text-slate-700">Mobile number <span class="font-normal text-slate-400">(optional)</span>
                <input name="mobile_number" value="{{ old('mobile_number', $parent->mobile_number) }}" maxlength="30" inputmode="tel" autocomplete="tel" placeholder="e.g. +60 12-345 6789" class="mt-2 block w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500">
            </label>
            <button class="rounded-xl bg-[#082c58] px-5 py-3 text-sm font-bold text-white hover:bg-[#0b407c]">Save profile</button>
        </form>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-bold text-[#082c58]">Change password</h2>
        <p class="mt-1 text-sm text-slate-500">Use your current password to confirm this change.</p>
        <form method="POST" action="{{ route('password.update') }}" class="mt-5 space-y-4">
            @csrf
            @method('PUT')
            <label class="block text-sm font-semibold text-slate-700">Current password
                <input type="password" name="current_password" required autocomplete="current-password" class="mt-2 block w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500">
            </label>
            <label class="block text-sm font-semibold text-slate-700">New password
                <input type="password" name="password" required autocomplete="new-password" class="mt-2 block w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500">
            </label>
            <label class="block text-sm font-semibold text-slate-700">Confirm new password
                <input type="password" name="password_confirmation" required autocomplete="new-password" class="mt-2 block w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500">
            </label>
            <button class="rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white hover:bg-sky-700">Update password</button>
        </form>
    </section>
</div>
@endsection
