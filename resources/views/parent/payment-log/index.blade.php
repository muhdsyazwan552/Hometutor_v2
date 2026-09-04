@extends('layouts.parent')
@section('title', 'Payment and Activation Log')
@section('content')
<div>
    <p class="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">Account history</p>
    <h1 class="mt-2 text-3xl font-extrabold text-[#082c58]">Payment and activation log</h1>
    <p class="mt-2 max-w-3xl text-slate-600">Review payment references, purchased durations, activation-code status, and child assignments.</p>
</div>

<section class="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="border-b border-slate-200 p-6"><h2 class="text-lg font-extrabold text-[#082c58]">Payment history</h2><p class="mt-1 text-sm text-slate-500">Only payments made using your parent account are shown.</p></div>
    <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th class="px-5 py-3">Date / reference</th><th class="px-5 py-3">Package</th><th class="px-5 py-3">Duration</th><th class="px-5 py-3">Total</th><th class="px-5 py-3">Code</th></tr></thead>
            <tbody class="divide-y divide-slate-100">
            @forelse($payments as $payment)
                <tr class="align-top">
                    <td class="whitespace-nowrap px-5 py-4"><span class="font-semibold text-slate-800">{{ ($payment->paid_at ?? $payment->created_at)->format('d M Y, H:i') }}</span><span class="mt-1 block font-mono text-xs text-slate-500">{{ $payment->provider_reference ?? $payment->manual_reference ?? $payment->uuid }}</span></td>
                    <td class="px-5 py-4"><span class="font-bold text-[#082c58]">{{ $payment->package?->name ?? 'Package removed' }}</span><span class="mt-1 block text-xs capitalize text-slate-500">{{ str_replace('_', ' ', $payment->method) }}</span></td>
                    <td class="whitespace-nowrap px-5 py-4">@if($payment->durationOption)<span class="font-bold">{{ $payment->durationOption->months }} months</span><span class="block text-xs text-slate-500">{{ $payment->durationOption->duration_days }} days</span>@elseif($payment->activationCode?->duration_days)<span class="font-bold">{{ $payment->activationCode->duration_days }} days</span>@else<span class="text-slate-400">—</span>@endif</td>
                    <td class="whitespace-nowrap px-5 py-4 font-extrabold text-sky-700">{{ $payment->currency }} {{ number_format($payment->amount, 2) }}</td>
                    <td class="px-5 py-4">@if($payment->activationCode)<span class="font-bold capitalize text-slate-700">{{ $payment->activationCode->status }}</span><span class="block text-xs text-slate-500">Code ending {{ $payment->activationCode->code_last_four }}</span>@else<span class="text-slate-400">No code</span>@endif</td>
                </tr>
            @empty
                <tr><td colspan="6" class="px-5 py-8 text-center text-slate-500">No payment records yet.</td></tr>
            @endforelse
            </tbody>
        </table>
    </div>
    @if($payments->hasPages())<div class="border-t border-slate-200 p-5">{{ $payments->withQueryString()->links() }}</div>@endif
</section>

<section class="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="border-b border-slate-200 p-6"><h2 class="text-lg font-extrabold text-[#082c58]">Activation-code log</h2><p class="mt-1 text-sm text-slate-500">Includes checkout-generated and manually issued codes.</p></div>
    <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th class="px-5 py-3">Issued</th><th class="px-5 py-3">Package</th><th class="px-5 py-3">Code</th><th class="px-5 py-3">Status</th><th class="px-5 py-3">Child account</th><th class="px-5 py-3">Action / request</th></tr></thead>
            <tbody class="divide-y divide-slate-100">
            @forelse($codes as $code)
                <tr class="align-top">
                    <td class="whitespace-nowrap px-5 py-4">{{ $code->created_at->format('d M Y, H:i') }}<span class="mt-1 block text-xs capitalize text-slate-500">{{ str_replace('_', ' ', $code->source) }}</span></td>
                    <td class="px-5 py-4"><span class="font-bold text-[#082c58]">{{ $code->package?->name ?? 'Package removed' }}</span><span class="mt-1 block text-xs text-slate-500">{{ $code->duration_days ?: $code->package?->duration_days }} days</span></td>
                    <td class="px-5 py-4 font-mono font-bold text-slate-700">{{ $code->status === 'unused' ? $code->code_value : '•••• '.$code->code_last_four }}</td>
                    <td class="px-5 py-4"><span class="rounded-full px-2.5 py-1 text-xs font-bold capitalize {{ $code->status === 'unused' ? 'bg-emerald-50 text-emerald-700' : ($code->status === 'redeemed' ? 'bg-sky-50 text-sky-700' : 'bg-rose-50 text-rose-700') }}">{{ $code->status }}</span>@if($code->redeemed_at)<span class="mt-2 block whitespace-nowrap text-xs text-slate-500">{{ $code->redeemed_at->format('d M Y, H:i') }}</span>@endif</td>
                    <td class="px-5 py-4">@if($code->redeemedByChild)<span class="font-bold">{{ $code->redeemedByChild->name }}</span><span class="block text-xs text-slate-500">{{ $code->redeemedByChild->username }} · {{ $code->redeemedByChild->student?->level?->name }}</span>@elseif($code->renewalChild)<span class="font-bold">{{ $code->renewalChild->name }}</span><span class="block text-xs text-slate-500">{{ $code->renewalChild->username }} · {{ $code->renewalChild->student?->level?->name }}</span>@else<span class="text-slate-400">Not assigned</span>@endif</td>
                    <td class="px-5 py-4">@if($code->status === 'unused' && $code->intended_use === 'renewal' && $code->renewalChild?->student)<a href="{{ route('parent.children.renew', ['childUuid' => $code->renewalChild->student->uuid, 'activation' => $code->uuid]) }}" class="font-bold text-sky-700">Renew child</a><form method="POST" action="{{ route('parent.activation-codes.resend', $code->uuid) }}" class="mt-2">@csrf<button class="text-xs font-bold text-slate-600 hover:text-sky-700">Resend code email</button></form>@elseif($code->status === 'unused')<a href="{{ route('parent.children.create', ['activation' => $code->uuid]) }}" class="font-bold text-sky-700">Create child account</a><form method="POST" action="{{ route('parent.activation-codes.resend', $code->uuid) }}" class="mt-2">@csrf<button class="text-xs font-bold text-slate-600 hover:text-sky-700">Resend code email</button></form>@else<span class="text-slate-400">Completed</span>@endif</td>
                </tr>
            @empty
                <tr><td colspan="6" class="px-5 py-8 text-center text-slate-500">No activation codes yet.</td></tr>
            @endforelse
            </tbody>
        </table>
    </div>
    @if($codes->hasPages())<div class="border-t border-slate-200 p-5">{{ $codes->withQueryString()->links() }}</div>@endif
</section>
@endsection
