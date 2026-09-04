@php
    $metrics = $child->card_metrics ?? [];
    $activeLicense = $child->user->childSubscriptions
        ->filter(fn ($license) => $license->status === 'active' && $license->starts_at <= now() && $license->ends_at > now())
        ->sortByDesc('ends_at')
        ->first();
    $latestLicense = $child->user->childSubscriptions->sortByDesc('ends_at')->first();
    $isExpired = ! $activeLicense && $latestLicense && $latestLicense->ends_at <= now();
    $isExpiringSoon = $activeLicense && $activeLicense->ends_at <= now()->addDays(30);
    $licenseLabel = $isExpired ? 'Expired' : ($isExpiringSoon ? 'Renew soon' : ($activeLicense ? 'Active' : 'Renewal required'));
    $licenseBadgeClass = $isExpired
        ? 'border-rose-200/70 bg-rose-500 text-white'
        : ($isExpiringSoon
            ? 'border-amber-200/70 bg-amber-400 text-[#082c58]'
            : ($activeLicense ? 'border-emerald-300/60 bg-emerald-500/90 text-white' : 'border-amber-200/70 bg-amber-400 text-[#082c58]'));
    $score = $metrics['average_score'] ?? null;
    $scoreProgress = max(0, min(100, $score ?? 0));
    $childName = $child->full_name ?: $child->user->display_name ?: $child->user->name;
@endphp

<article class="group overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_18px_45px_-28px_rgba(8,44,88,0.5)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_-28px_rgba(8,44,88,0.6)]">
    <header class="relative overflow-hidden bg-gradient-to-r from-[#082c58] via-[#075895] to-[#0798dc] px-5 py-6 text-white sm:px-7">
        <div class="absolute -right-10 -top-16 h-44 w-44 rounded-full border-[22px] border-white/5"></div>
        <div class="absolute right-24 top-8 h-2 w-2 rounded-full bg-cyan-200/30"></div>
        <div class="relative flex items-center justify-between gap-4">
            <div class="flex min-w-0 items-center gap-4">
                <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-sky-300 to-sky-600 text-2xl font-bold shadow-lg sm:h-24 sm:w-24 sm:text-3xl">
                    {{ $metrics['initials'] ?? 'HT' }}
                </div>
                <div class="min-w-0">
                    <h3 class="truncate text-xl font-bold sm:text-2xl">{{ $childName }}</h3>
                    <p class="mt-1 truncate text-sm text-blue-100">{{ '@'.$child->user->username }}</p>
                    <p class="mt-1 text-sm font-medium text-white/90">{{ $child->level?->name ?? 'Level not set' }}</p>
                </div>
            </div>
            <span class="inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm {{ $licenseBadgeClass }}">
                <span class="h-2 w-2 rounded-full bg-current"></span>{{ $licenseLabel }}
            </span>
        </div>
    </header>

    <div class="px-5 py-5 sm:px-7">
        <div class="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div class="flex items-center gap-3 py-3 sm:py-1 sm:pr-4">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 2v3m8-3v3M3.5 9h17M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z"/></svg>
                </span>
                <div><p class="text-xs font-medium text-slate-500">Last active</p><p class="mt-0.5 text-sm font-bold text-[#082c58]">{{ $metrics['last_active_label'] ?? 'No activity yet' }}</p></div>
            </div>
            <div class="flex items-center gap-3 py-3 sm:px-4 sm:py-1">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0788c9]">
                    <svg viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6" aria-hidden="true"><path d="M4 13h3v7H4v-7Zm6-5h4v12h-4V8Zm7-5h3v17h-3V3Z"/></svg>
                </span>
                <div><p class="text-xs font-medium text-slate-500">Sessions</p><p class="mt-0.5 text-sm font-bold text-[#082c58]">{{ $metrics['sessions_this_week'] ?? 0 }} this week</p></div>
            </div>
            <div class="flex items-center gap-3 py-3 sm:py-1 sm:pl-4">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                    <svg viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6" aria-hidden="true"><path d="M13.5 2.2c.8 3.4-.7 4.8-2.1 6.1-1.3 1.2-2.5 2.4-1.7 4.7.4-1.6 1.6-2.5 2.7-3.4 1.5 1.6 3 3.4 3 6A3.4 3.4 0 0 1 12 19a3.4 3.4 0 0 1-3.4-3.4c0-.5.1-1 .3-1.5-1.5 1.1-2.4 2.8-2.4 4.4A5.5 5.5 0 0 0 12 24a5.5 5.5 0 0 0 5.5-5.5c0-3.8-2.1-6.2-4-8.4-1.8-2-2.1-4.8 0-7.9Z"/></svg>
                </span>
                <div><p class="text-xs font-medium text-slate-500">Streak</p><p class="mt-0.5 text-sm font-bold text-[#082c58]">{{ $metrics['streak_days'] ?? 0 }} days</p></div>
            </div>
        </div>

        <div class="my-5 h-px bg-slate-100"></div>

        <div class="grid items-center gap-5 sm:grid-cols-2">
            <div class="flex items-center gap-4 sm:border-r sm:border-slate-100 sm:pr-5">
                <div class="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full" style="background: conic-gradient(#0788c9 {{ $scoreProgress }}%, #e2e8f0 0)">
                    <div class="flex h-[5.6rem] w-[5.6rem] flex-col items-center justify-center rounded-full bg-white shadow-inner">
                        <span class="text-[11px] font-medium text-slate-500">Average</span>
                        <span class="text-2xl font-bold text-[#082c58]">{{ $score !== null ? $score.'%' : '—' }}</span>
                    </div>
                </div>
                <div><p class="text-xs font-medium uppercase tracking-wide text-slate-400">Performance</p><p class="mt-1 text-sm leading-5 text-slate-600">{{ $score !== null ? 'Average score over the last 30 days.' : 'No completed sessions in the last 30 days.' }}</p></div>
            </div>
            <div class="flex items-center gap-4 sm:pl-1">
                <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-7 w-7" aria-hidden="true"><path stroke-linecap="round" stroke-width="2" d="M5 5h6M8 2v6m7-3h4m-2-2v4M5 16h6m4-3 4 4m0-4-4 4"/></svg>
                </span>
                <div><p class="text-xs font-medium text-slate-500">Weakest subject</p><p class="mt-1 text-lg font-bold text-[#082c58]">{{ $metrics['weakest_subject'] ?? 'Not enough data' }}</p></div>
            </div>
        </div>
    </div>

    <footer class="border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-7">
        <div class="mb-3 flex items-center gap-2 text-sm {{ $activeLicense ? 'text-slate-600' : 'text-amber-700' }}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 2v3m8-3v3M3.5 9h17M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z"/></svg>
            <span class="font-medium">
                @if($isExpired)
                    Expired on {{ $latestLicense->ends_at->format('d M Y') }}
                @elseif($activeLicense)
                    Active until {{ $activeLicense->ends_at->format('d M Y') }}
                @else
                    A renewal code is required
                @endif
            </span>
        </div>
        <div class="grid gap-3 {{ $isExpired || $isExpiringSoon ? 'sm:grid-cols-2' : '' }}">
            <a href="{{ route('parent.children.learning-dashboard', $child->uuid) }}" class="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#082c58] to-[#0b4a8d] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:from-[#0b3b72] hover:to-[#0788c9] focus:outline-none focus:ring-4 focus:ring-sky-200">View child</a>
            @if($isExpired || $isExpiringSoon)
                <a href="{{ route('parent.children.renew', $child->uuid) }}" class="flex w-full items-center justify-center rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-[#082c58] shadow-sm transition hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200">{{ $isExpired ? 'Renew now' : 'Renew subscription' }}</a>
            @endif
        </div>
    </footer>
</article>
