@extends('layouts.code-manager')
@section('title', 'Dashboard')
@section('headerTitle', 'Code analytics')
@section('content')
<div><div class="flex items-center gap-2 text-xs font-medium text-slate-400"><span>Code Manager</span><span>/</span><span class="text-[#3c50e0]">Dashboard</span></div><h1 class="mt-2 text-2xl font-semibold text-slate-800 sm:text-3xl">Activation-code dashboard</h1><p class="mt-2 text-sm text-slate-500">Monitor code generation, inventory, and redemption performance.</p></div>

<div class="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
@foreach([
    ['Total codes',$stats['total'],'text-[#3c50e0]','All time'],
    ['Generated this week',$stats['generated_week'],'text-sky-600',now()->startOfWeek()->format('d M').' – '.now()->endOfWeek()->format('d M')],
    ['Generated this month',$stats['generated_month'],'text-violet-600',now()->format('F Y')],
    ['Not used',$stats['unused'],'text-amber-600','Available inventory'],
    ['Redemption rate',$stats['redemption_rate'].'%','text-emerald-600',number_format($stats['redeemed']).' redeemed'],
] as [$label,$value,$colour,$note])
<article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ $label }}</p><p class="mt-3 text-2xl font-semibold {{ $colour }}">{{ is_numeric($value) ? number_format($value) : $value }}</p><p class="mt-1 text-xs text-slate-400">{{ $note }}</p></article>
@endforeach
</div>

<section class="mt-7 rounded-2xl border border-slate-200 bg-white shadow-sm">
<div class="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 class="font-semibold text-slate-800">Codes generated</h2><p class="mt-1 text-xs text-slate-500">Number of activation codes created in each period, including personal and bulk codes.</p></div><div class="inline-flex w-fit rounded-lg bg-slate-100 p-1"><button type="button" data-chart-button="weekly" class="rounded-md bg-white px-4 py-2 text-xs font-semibold text-[#3c50e0] shadow-sm">Weekly</button><button type="button" data-chart-button="monthly" class="rounded-md px-4 py-2 text-xs font-semibold text-slate-500">Monthly</button></div></div>

@foreach(['weekly'=>$weeklyChart,'monthly'=>$monthlyChart] as $period=>$points)
@php($maximum=max(1,(int)$points->max('value')))
<div data-chart-panel="{{ $period }}" class="p-6 {{ $period==='monthly'?'hidden':'' }}">
<div class="flex h-72 items-end gap-2 border-b border-l border-slate-200 px-3 pt-6 sm:gap-4">
@foreach($points as $point)
@php($height=$point['value']>0?max(7,round(($point['value']/$maximum)*100)):2)
<div class="group flex h-full min-w-0 flex-1 flex-col justify-end text-center"><div class="relative flex flex-1 items-end justify-center"><span class="absolute hidden rounded-md bg-slate-800 px-2 py-1 text-[10px] font-semibold text-white group-hover:block" style="bottom:calc({{ $height }}% + 8px)">{{ number_format($point['value']) }} codes</span><div class="w-full max-w-12 rounded-t-md bg-gradient-to-t from-[#3c50e0] to-[#7380ec] transition hover:from-[#2637cf] hover:to-[#5363e8]" style="height:{{ $height }}%"></div></div><p class="mt-3 truncate text-[10px] text-slate-500 sm:text-xs" title="{{ $point['label'] }}">{{ $point['label'] }}</p></div>
@endforeach
</div>
<div class="mt-4 flex items-center justify-between text-xs text-slate-400"><span>Highest period: {{ number_format($maximum) }} codes</span><span>{{ $period==='weekly'?'Last 8 weeks':'Last 12 months' }}</span></div>
</div>
@endforeach
</section>

<div class="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
<section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div class="flex items-center justify-between border-b border-slate-200 px-6 py-5"><div><h2 class="font-semibold text-slate-800">Recent codes</h2><p class="mt-1 text-xs text-slate-500">Latest personal and bulk activation codes.</p></div><a href="{{ route('code-manager.register.index') }}" class="text-xs font-semibold text-[#3c50e0]">View register →</a></div><div class="overflow-x-auto"><table class="min-w-full text-left text-sm"><thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="px-5 py-3">Code / series</th><th class="px-5 py-3">Parent / campaign</th><th class="px-5 py-3">Package</th><th class="px-5 py-3">Status</th><th class="px-5 py-3">Generated</th></tr></thead><tbody class="divide-y divide-slate-100">@forelse($recentCodes as $code)<tr><td class="whitespace-nowrap px-5 py-4"><p class="font-mono text-xs font-semibold text-slate-700">{{ $code->status==='unused'?$code->code_value:$code->series_prefix.'-••••-'.$code->code_last_four }}</p><p class="mt-1 text-[10px] font-bold text-indigo-600">{{ $code->series_prefix }}</p></td><td class="px-5 py-4"><p class="font-medium text-slate-700">{{ $code->purchaser?->name ?? $code->batch?->company?->name ?? $code->batch?->event_name ?? 'Unassigned' }}</p><p class="mt-1 text-xs text-slate-400">{{ ucfirst(str_replace('_',' ',$code->source)) }}</p></td><td class="whitespace-nowrap px-5 py-4 text-slate-600">{{ $code->package->name }}</td><td class="px-5 py-4"><span class="rounded-full px-2.5 py-1 text-xs font-semibold {{ $code->status==='redeemed'?'bg-emerald-50 text-emerald-700':($code->status==='unused'?'bg-amber-50 text-amber-700':'bg-slate-100 text-slate-600') }}">{{ $code->status==='unused'?'Not used':ucfirst($code->status) }}</span></td><td class="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{{ $code->created_at->format('d M Y H:i') }}</td></tr>@empty<tr><td colspan="5" class="p-8 text-center text-slate-500">No codes generated yet.</td></tr>@endforelse</tbody></table></div></section>

<aside class="space-y-6"><section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 class="font-semibold text-slate-800">Codes by series</h2><div class="mt-5 space-y-4">@forelse($seriesBreakdown as $series)<div><div class="flex justify-between text-sm"><span class="font-semibold text-slate-700">{{ $series->series_prefix ?: 'No series' }}</span><span class="text-slate-500">{{ number_format($series->total) }}</span></div><div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-[#3c50e0]" style="width:{{ $stats['total']?max(2,round(($series->total/$stats['total'])*100)):0 }}%"></div></div></div>@empty<p class="text-sm text-slate-500">No series data yet.</p>@endforelse</div></section>

<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div class="flex items-center justify-between"><h2 class="font-semibold text-slate-800">Recent batches</h2><a href="{{ route('code-manager.bulk.index') }}" class="text-xs font-semibold text-[#3c50e0]">View all →</a></div><div class="mt-4 divide-y divide-slate-100">@forelse($batches as $batch)<div class="py-3 first:pt-0"><div class="flex items-start justify-between gap-3"><div><p class="text-sm font-semibold text-slate-700">{{ $batch->company?->name ?? $batch->event_name }}</p><p class="mt-1 font-mono text-[10px] text-slate-400">{{ $batch->reference }}</p></div><span class="rounded bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">{{ $batch->series_prefix }}</span></div><p class="mt-2 text-xs text-slate-500">{{ number_format($batch->activation_codes_count) }} codes · {{ number_format($batch->redeemed_codes_count) }} redeemed</p></div>@empty<p class="text-sm text-slate-500">No batches generated yet.</p>@endforelse</div></section></aside>
</div>
@endsection
@push('scripts')
<script>(()=>{const buttons=document.querySelectorAll('[data-chart-button]'),panels=document.querySelectorAll('[data-chart-panel]');buttons.forEach(button=>button.addEventListener('click',()=>{const period=button.dataset.chartButton;panels.forEach(panel=>panel.classList.toggle('hidden',panel.dataset.chartPanel!==period));buttons.forEach(item=>{const active=item===button;item.classList.toggle('bg-white',active);item.classList.toggle('text-[#3c50e0]',active);item.classList.toggle('shadow-sm',active);item.classList.toggle('text-slate-500',!active)})}))})();</script>
@endpush
