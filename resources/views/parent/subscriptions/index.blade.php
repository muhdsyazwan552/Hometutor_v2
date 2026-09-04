@extends('layouts.parent')
@section('title', 'Packages and Codes')
@section('content')
<div class="flex flex-wrap items-end justify-between gap-4"><div><p class="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">Child licences</p><h1 class="mt-2 text-3xl font-bold text-[#082c58]">Packages and activation codes</h1><p class="mt-2 max-w-3xl text-slate-600">Buy one package directly, or add several child packages to a cart and pay once.</p></div></div>
<div class="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><p class="font-bold">Submit-only payment flow</p><p class="mt-1">The checkout button currently records a successful payment submission; no external payment gateway is charged. A receipt and the child account information are sent to the parent email.</p></div>
<div class="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
@php($packageImages = [
    'standard_1_3' => '/images/package/standard1-3.png',
    'standard_4_6' => '/images/package/standard4-6.png',
    'form_1_3' => '/images/package/form1-3.png',
    'form_4_5' => '/images/package/form4-5.png',
])
@forelse ($packages as $package)
<article class="group flex overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl md:flex-col">
    <div class="relative min-h-48 w-2/5 overflow-hidden bg-slate-100 md:h-48 md:w-full">
        <img src="{{ $packageImages[$package->curriculum_group] ?? '/images/package/standard1-3.png' }}" alt="Students learning in the {{ $package->name }} package" loading="lazy" class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105">
        <div class="absolute inset-0 bg-gradient-to-t from-[#061f42]/75 via-transparent to-transparent"></div>
        <span class="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#0788c9] shadow-sm">{{ $package->code }}</span>
        <span class="absolute bottom-4 left-4 rounded-full bg-[#f2c237] px-3 py-1 text-xs font-extrabold text-[#082c58]">One child licence</span>
    </div>
    <div class="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <h2 class="text-xl font-extrabold text-[#082c58]">{{ $package->name }}</h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">{{ $package->description }}</p>
        <div class="mt-4 flex flex-wrap gap-2">@forelse($package->levels as $level)<span class="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700">{{ $level->name }}</span>@empty<span class="text-xs font-semibold text-slate-400">Levels not configured</span>@endforelse</div>
        <div class="mt-5 grid grid-cols-2 gap-2 text-xs"><div class="rounded-xl bg-slate-50 px-3 py-2"><span class="block font-extrabold text-[#082c58]">6 or 12 months</span><span class="text-slate-500">Choose next</span></div><div class="rounded-xl bg-slate-50 px-3 py-2"><span class="block font-extrabold text-[#082c58]">1 account</span><span class="text-slate-500">Single child</span></div></div>
        @php($lowestOption = $package->durationOptions->sortBy('price')->first())
        <div class="mt-auto pt-5"><p class="text-xs font-bold uppercase tracking-wide text-slate-400">Starting from</p><p class="mt-1 text-3xl font-extrabold text-[#0788c9]">{{ $lowestOption?->currency ?? $package->currency }} {{ number_format($lowestOption?->price ?? $package->price, 2) }}</p><div class="mt-4 grid grid-cols-2 gap-2"><a href="{{ route('parent.packages.checkout', $package) }}" class="block rounded-xl bg-[#082c58] px-3 py-3 text-center text-sm font-bold text-white hover:bg-[#0b407c]">Buy package</a><a href="{{ route('parent.packages.checkout', ['package' => $package, 'cart' => 1]) }}" class="block rounded-xl border-2 border-[#0788c9] px-3 py-3 text-center text-sm font-bold text-[#0788c9] hover:bg-sky-50">Add to cart</a></div></div>
    </div>
</article>
@empty
<div class="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 md:col-span-2">No child packages are active. Ask an administrator to configure package prices and levels.</div>
@endforelse
</div>
<section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 class="text-lg font-bold text-[#082c58]">Your activation codes</h2><div class="mt-4 divide-y divide-slate-100">
@forelse ($codes as $code)
<div class="py-5"><div class="flex flex-wrap items-start justify-between gap-4"><div><p class="font-bold text-slate-800">{{ $code->package->name }}</p><p class="mt-1 text-sm text-slate-500">Purchased {{ ($code->payment?->paid_at ?? $code->payment?->created_at ?? $code->created_at)->format('d M Y, H:i') }}</p>@if($code->redeemedByChild)<p class="mt-1 text-sm font-semibold text-sky-700">Child: {{ $code->redeemedByChild->display_name ?: $code->redeemedByChild->name }}</p>@elseif($code->renewalChild)<p class="mt-1 text-sm font-semibold text-sky-700">Renewal for: {{ $code->renewalChild->display_name ?: $code->renewalChild->name }}</p>@endif</div><div class="text-right"><span class="rounded-full px-3 py-1 text-xs font-bold capitalize {{ $code->status === 'unused' ? 'bg-emerald-50 text-emerald-700' : ($code->status === 'redeemed' ? 'bg-sky-50 text-sky-700' : 'bg-rose-50 text-rose-700') }}">{{ $code->status }}</span>@if ($code->status === 'unused')<p class="mt-2 font-mono text-sm font-bold text-[#082c58]">{{ $code->code_value }}</p>@if($code->intended_use === 'renewal' && $code->renewalChild?->student)<a href="{{ route('parent.children.renew', ['childUuid' => $code->renewalChild->student->uuid, 'activation' => $code->uuid]) }}" class="mt-2 block text-xs font-bold text-sky-700">Use renewal code</a>@endif<form method="POST" action="{{ route('parent.activation-codes.resend', $code->uuid) }}" class="mt-2">@csrf<button class="text-xs font-bold text-sky-700">Resend email</button></form>@else<p class="mt-2 text-xs text-slate-400">Code ending {{ $code->code_last_four }}</p>@endif</div></div></div>
@empty
<p class="py-5 text-sm text-slate-500">No activation codes have been issued yet.</p>
@endforelse
</div></section>
@endsection
