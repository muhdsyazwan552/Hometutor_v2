@extends('layouts.parent')
@section('title', 'Renew Child')
@section('content')
<div class="mx-auto max-w-5xl">
    <a href="{{ route('parent.children.index') }}" class="text-sm font-bold text-sky-700">← Back to children</a>

    <div class="mt-4">
        <p class="text-xs font-bold uppercase tracking-wide text-sky-700">Child renewal</p>
        <h1 class="mt-2 text-3xl font-extrabold text-[#082c58]">{{ $child->full_name ?: $child->user->name }}</h1>
        <p class="mt-2 text-sm text-slate-500">{{ '@'.$child->user->username }} · {{ $child->level?->name ?? 'Level not set' }}</p>
    </div>

    <section class="mt-7 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 font-extrabold text-sky-700">1</div>
        <h2 class="mt-4 text-xl font-extrabold text-[#082c58]">Renew using an activation code</h2>
        <p class="mt-2 text-sm text-slate-500">Enter an unused renewal code for {{ $child->level?->name ?? 'this child level' }}. Remaining active days are preserved.</p>

        @if($automaticCode)
            <div class="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">The renewal code from your payment is included automatically. Confirm it below to activate the renewal.</div>
        @endif

        <form method="POST" action="{{ route('parent.children.renew.store', $child->uuid) }}" class="mt-6 grid items-end gap-4 md:grid-cols-[1fr_auto]">
            @csrf
            <label class="block">
                <span class="text-sm font-bold text-slate-700">Activation code</span>
                <input name="activation_code" value="{{ old('activation_code', $automaticCode?->code_value) }}" required autocomplete="off" class="mt-2 block w-full rounded-xl border-slate-200 font-mono uppercase focus:border-sky-500 focus:ring-sky-500" placeholder="HT-XXXX-XXXX-XXXX-XXXX-XXXX">
                @error('activation_code')<span class="mt-1 block text-sm text-rose-600">{{ $message }}</span>@enderror
            </label>
            <button class="rounded-xl bg-[#0788c9] px-6 py-3 font-bold text-white">Redeem and renew</button>
        </form>
    </section>

    <div class="my-8 flex items-center gap-4"><div class="h-px flex-1 bg-slate-200"></div><span class="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">or</span><div class="h-px flex-1 bg-slate-200"></div></div>

    <section>
        <div class="flex items-start gap-4">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 font-extrabold text-amber-800">2</div>
            <div>
                <h2 class="text-xl font-extrabold text-[#082c58]">Get a renewal code by payment</h2>
                <p class="mt-1 text-sm text-slate-500">Select a package for {{ $child->level?->name ?? 'this child level' }} and choose only 6 or 12 months.</p>
            </div>
        </div>

        <div class="mt-5 grid gap-6 lg:grid-cols-2">
            @forelse($packages as $package)
                <form method="POST" action="{{ route('parent.children.renew.payment.store', ['childUuid' => $child->uuid, 'package' => $package]) }}" class="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    @csrf
                    <div class="flex items-start justify-between gap-4">
                        <div><h3 class="text-xl font-extrabold text-[#082c58]">{{ $package->name }}</h3><p class="mt-2 text-sm leading-6 text-slate-600">{{ $package->description }}</p></div>
                        <span class="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">{{ $child->level?->name }}</span>
                    </div>

                    <div class="mt-5 grid gap-3 sm:grid-cols-2">
                        @foreach($package->durationOptions as $option)
                            <label class="cursor-pointer rounded-xl border-2 border-slate-200 p-4 transition has-[:checked]:border-sky-500 has-[:checked]:bg-sky-50">
                                <input type="radio" name="duration_option_id" value="{{ $option->id }}" class="sr-only" {{ old('duration_option_id', $loop->first ? $option->id : null) == $option->id ? 'checked' : '' }} required>
                                <span class="block text-lg font-extrabold text-[#082c58]">{{ $option->months }} months</span>
                                <span class="mt-1 block font-bold text-sky-700">{{ $option->currency }} {{ number_format($option->price, 2) }}</span>
                                <span class="mt-1 block text-xs text-slate-500">{{ $option->duration_days }} days</span>
                            </label>
                        @endforeach
                    </div>

                    @error('duration_option_id')<span class="mt-3 block text-sm text-rose-600">{{ $message }}</span>@enderror
                    <p class="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">Temporary payment mode: clicking below records the payment immediately and emails a child-specific renewal code with the receipt.</p>
                    <button class="mt-4 w-full rounded-xl bg-[#f2c237] px-5 py-3 font-extrabold text-[#082c58] hover:bg-yellow-300">Submit payment and email code</button>
                </form>
            @empty
                <div class="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 lg:col-span-2">No active 6 or 12 month package is configured for this child's level.</div>
            @endforelse
        </div>
    </section>
</div>
@endsection
