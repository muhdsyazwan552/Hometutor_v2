@extends('layouts.parent')
@section('title', 'Package Checkout')
@section('content')
<div class="mx-auto max-w-5xl">
    <a href="{{ route('parent.subscriptions.index') }}" class="text-sm font-bold text-sky-700">← Back to packages</a>
    <div class="mt-4"><p class="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">{{ $cartMode ? 'Add package to cart' : 'Package checkout' }}</p><h1 class="mt-2 text-3xl font-extrabold text-[#082c58]">{{ $package->name }}</h1><p class="mt-2 text-slate-600">Choose 6 or 12 months and enter the child details for this package.</p></div>

    <form id="checkout-form" method="POST" action="{{ $cartMode ? route('parent.packages.cart.store', $package) : route('parent.packages.checkout.store', $package) }}" class="mt-7 grid gap-6 lg:grid-cols-[1fr_340px]">
        @csrf
        <div class="space-y-6">
            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-lg font-extrabold text-[#082c58]">1. Select subscription duration</h2>
                <div class="mt-4 grid gap-3 sm:grid-cols-2">
                    @foreach($package->durationOptions as $option)
                    <label class="duration-card cursor-pointer rounded-2xl border-2 p-5 transition has-[:checked]:border-sky-500 has-[:checked]:bg-sky-50">
                        <input type="radio" name="duration_option_id" value="{{ $option->id }}" data-price="{{ $option->price }}" data-currency="{{ $option->currency }}" class="sr-only" {{ (string) old('duration_option_id', $loop->first ? $option->id : '') === (string) $option->id ? 'checked' : '' }}>
                        <span class="block text-xl font-extrabold text-[#082c58]">{{ $option->months }} months</span>
                        <span class="mt-2 block text-2xl font-extrabold text-sky-700">{{ $option->currency }} {{ number_format($option->price, 2) }}</span>
                    </label>
                    @endforeach
                </div>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-lg font-extrabold text-[#082c58]">2. Child account information</h2>
                <div class="mt-5 grid gap-5 sm:grid-cols-2">
                    <label class="sm:col-span-2"><span class="text-sm font-bold text-slate-700">Child name</span><input name="name" value="{{ old('name') }}" required maxlength="255" class="mt-2 w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500"></label>
                    <label class="sm:col-span-2"><span class="text-sm font-bold text-slate-700">Username</span><input id="username" name="username" value="{{ old('username') }}" required minlength="4" maxlength="40" pattern="[A-Za-z0-9_-]+" autocomplete="off" class="mt-2 w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500"><span id="username-status" class="mt-2 block text-xs text-slate-500">Use at least 4 letters, numbers, dashes, or underscores.</span></label>
                    <label><span class="text-sm font-bold text-slate-700">Password</span><input type="password" name="password" required minlength="8" autocomplete="new-password" class="mt-2 w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500"></label>
                    <label><span class="text-sm font-bold text-slate-700">Confirm password</span><input type="password" name="password_confirmation" required minlength="8" autocomplete="new-password" class="mt-2 w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500"></label>
                    <label class="sm:col-span-2"><span class="text-sm font-bold text-slate-700">Child level</span><select name="level_id" required class="mt-2 w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500"><option value="">Select a level in {{ $package->name }}</option>@foreach($package->levels as $level)<option value="{{ $level->id }}" @selected((string) old('level_id') === (string) $level->id)>{{ $level->name }}</option>@endforeach</select></label>
                </div>
            </section>
        </div>

        <aside class="h-fit rounded-2xl bg-[#082c58] p-6 text-white shadow-xl lg:sticky lg:top-6">
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-sky-200">Order summary</p><h2 class="mt-2 text-xl font-extrabold">{{ $package->name }}</h2>
            <div class="mt-5 border-y border-white/20 py-4"><div class="flex justify-between text-sm"><span>One child licence</span><span id="summary-duration">—</span></div></div>
            <div class="mt-5 flex items-end justify-between"><span class="font-bold">Total</span><span id="summary-total" class="text-2xl font-extrabold text-[#f2c237]">—</span></div>
            <p class="mt-5 rounded-xl bg-white/10 p-3 text-xs leading-5 text-sky-100">{{ $cartMode ? 'Child details are saved as pending. The account is created only after the combined cart payment.' : 'This buys one package, creates the child account, activates the subscription, and emails the receipt.' }}</p>
            <button id="submit-button" data-mode="{{ $cartMode ? 'cart' : 'buy' }}" class="mt-5 w-full rounded-xl bg-[#f2c237] px-4 py-3 font-extrabold text-[#082c58] hover:bg-yellow-300">{{ $cartMode ? 'Add to cart' : 'Buy package' }}</button>
        </aside>
    </form>
</div>
@endsection
@push('scripts')
<script>
(() => {
    const radios = document.querySelectorAll('input[name="duration_option_id"]');
    const duration = document.getElementById('summary-duration');
    const total = document.getElementById('summary-total');
    const submit = document.getElementById('submit-button');
    const username = document.getElementById('username');
    const status = document.getElementById('username-status');
    let timer;

    function updateTotal() {
        const selected = document.querySelector('input[name="duration_option_id"]:checked');
        if (!selected) return;
        duration.textContent = selected.closest('label').querySelector('.text-xl').textContent;
        total.textContent = `${selected.dataset.currency} ${Number(selected.dataset.price).toFixed(2)}`;
        submit.textContent = `${submit.dataset.mode === 'cart' ? 'Add to cart' : 'Buy package'} · ${total.textContent}`;
    }

    async function checkUsername() {
        const value = username.value.trim();
        if (!/^[A-Za-z0-9_-]{4,40}$/.test(value)) {
            status.textContent = 'Enter a valid username with at least 4 characters.';
            status.className = 'mt-2 block text-xs text-rose-600';
            return;
        }
        status.textContent = 'Checking username…';
        status.className = 'mt-2 block text-xs text-slate-500';
        try {
            const response = await fetch(@json(route('parent.children.username-availability')), {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': @json(csrf_token())},
                body: JSON.stringify({username: value})
            });
            const data = await response.json();
            status.textContent = data.available ? 'Username is available.' : 'Username is already used. Choose another.';
            status.className = `mt-2 block text-xs font-bold ${data.available ? 'text-emerald-600' : 'text-rose-600'}`;
            username.setCustomValidity(data.available ? '' : 'This username is already used.');
        } catch (_) {
            status.textContent = 'Username will be checked again when you submit.';
            status.className = 'mt-2 block text-xs text-amber-600';
            username.setCustomValidity('');
        }
    }

    radios.forEach(radio => radio.addEventListener('change', updateTotal));
    username.addEventListener('input', () => { username.setCustomValidity(''); clearTimeout(timer); timer = setTimeout(checkUsername, 450); });
    username.addEventListener('blur', checkUsername);
    updateTotal();
})();
</script>
@endpush
