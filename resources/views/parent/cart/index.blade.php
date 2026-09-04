@extends('layouts.parent')
@section('title', 'Package Cart')
@section('content')
<div class="flex flex-wrap items-end justify-between gap-4">
    <div>
        <p class="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">One-off payment</p>
        <h1 class="mt-2 text-3xl font-extrabold text-[#082c58]">Package cart</h1>
        <p class="mt-2 text-slate-600">Each package contains the details for one child account.</p>
    </div>
    <a href="{{ route('parent.subscriptions.index') }}" class="rounded-xl border-2 border-sky-600 px-4 py-2.5 text-sm font-bold text-sky-700">Add another package</a>
</div>

@if($order && $order->items->isNotEmpty())
    <section class="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
                <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th class="px-5 py-3">Child details</th><th class="px-5 py-3">Package</th><th class="px-5 py-3">Duration</th><th class="px-5 py-3 text-right">Total</th><th class="px-5 py-3"></th></tr></thead>
                <tbody class="divide-y divide-slate-100">
                @foreach($order->items as $item)
                    <tr>
                        <td class="px-5 py-4"><span class="font-bold text-[#082c58]">{{ $item->new_child_name }}</span><span class="mt-1 block text-xs text-slate-500">{{ '@'.$item->new_child_username }} · {{ $item->level?->name ?? 'Level not set' }}</span></td>
                        <td class="px-5 py-4 font-semibold">{{ $item->package_name_snapshot }}</td>
                        <td class="whitespace-nowrap px-5 py-4"><span class="font-bold">{{ $item->durationOption?->months }} months</span><span class="block text-xs text-slate-500">{{ $item->duration_days }} days</span></td>
                        <td class="whitespace-nowrap px-5 py-4 text-right font-extrabold text-sky-700">{{ $item->currency }} {{ number_format($item->total, 2) }}</td>
                        <td class="px-5 py-4 text-right"><a href="{{ route('parent.cart.items.edit', $item->uuid) }}" class="text-xs font-bold text-sky-700">Edit</a><form method="POST" action="{{ route('parent.cart.items.destroy', $item->uuid) }}" class="mt-2">@csrf @method('DELETE')<button class="text-xs font-bold text-rose-600">Remove</button></form></td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
        <div class="border-t border-slate-200 bg-slate-50 p-6">
            <div class="ml-auto max-w-sm">
                <div class="flex items-end justify-between"><span class="font-bold text-slate-600">{{ $order->items->count() }} child {{ Str::plural('package', $order->items->count()) }}</span><span class="text-3xl font-extrabold text-[#082c58]">{{ $order->currency }} {{ number_format($order->total, 2) }}</span></div>
                <p class="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">Temporary payment mode: one click records one successful payment for this complete order.</p>
                <form method="POST" action="{{ route('parent.cart.checkout') }}" class="mt-4">@csrf<button class="w-full rounded-xl bg-[#f2c237] px-5 py-3 font-extrabold text-[#082c58] hover:bg-yellow-300">Pay once for all packages</button></form>
            </div>
        </div>
    </section>
@else
    <div class="mt-7 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"><p class="text-lg font-bold text-[#082c58]">Your cart is empty</p><p class="mt-2 text-sm text-slate-500">Choose a package and enter the child details before adding it.</p><a href="{{ route('parent.subscriptions.index') }}" class="mt-5 inline-block rounded-xl bg-[#082c58] px-5 py-3 text-sm font-bold text-white">Browse packages</a></div>
@endif
@endsection
