@php
    $purchasedAt = $code->payment?->paid_at ?? $code->payment?->created_at ?? $code->created_at;
    $refundAvailable = $code->payment
        && in_array($code->payment->status, ['paid', 'approved'])
        && now()->lte($purchasedAt->copy()->addDays(30)->endOfDay());
@endphp

@if($openRequest)
<div class="mt-2 rounded-lg bg-amber-50 p-2 text-left text-xs font-semibold capitalize text-amber-800">{{ $openRequest->type }} request: {{ str_replace('_', ' ', $openRequest->status) }}</div>
@elseif($code->purchaser && in_array($code->status, ['unused', 'redeemed']))
<details class="mt-2 min-w-64 text-left"><summary class="cursor-pointer text-xs font-semibold text-violet-700">Record refund / cancellation</summary><form method="POST" action="{{ route('code-manager.parent-requests.store', $code->uuid) }}" class="mt-2 grid gap-2 rounded-xl border border-violet-100 bg-violet-50 p-3">@csrf<label class="text-[11px] font-bold text-slate-600">Action<select name="type" required class="mt-1 block w-full rounded-lg border-violet-200 text-xs">@if($refundAvailable)<option value="refund">Full refund</option>@endif<option value="cancellation">Cancel licence{{ $refundAvailable ? ' + refund review' : ' (no refund)' }}</option></select></label><label class="text-[11px] font-bold text-slate-600">Parent contacted by<select name="contact_method" required class="mt-1 block w-full rounded-lg border-violet-200 text-xs"><option value="whatsapp">WhatsApp</option><option value="email">Email</option><option value="phone">Phone call</option><option value="in_person">In person</option><option value="other">Other</option></select></label><label class="text-[11px] font-bold text-slate-600">Parent reason / reference<textarea name="reason" required minlength="10" maxlength="2000" rows="3" class="mt-1 block w-full rounded-lg border-violet-200 text-xs"></textarea></label><button class="rounded-lg bg-violet-700 px-3 py-2 text-xs font-bold text-white">Send for admin review</button></form></details>
@endif
