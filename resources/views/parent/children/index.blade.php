@extends('layouts.parent')

@section('title', 'Children')

@section('content')
    <div class="flex flex-wrap items-end justify-between gap-4">
        <div><p class="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">Family</p><h1 class="mt-2 text-3xl font-bold text-[#082c58]">Child accounts</h1></div>
        <a href="{{ route('parent.children.create') }}" class="rounded-xl bg-[#f2c237] px-5 py-3 text-sm font-bold text-[#082c58]">Create child with code</a>
    </div>

    <div class="mt-7 grid gap-6 xl:grid-cols-2">
        @forelse ($children as $child)
            @include('parent.children._progress-card', ['child' => $child])
        @empty
            <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center xl:col-span-2"><p class="font-bold text-slate-700">No child accounts yet</p><p class="mt-2 text-sm text-slate-500">Get an activation code, then create a child username.</p></div>
        @endforelse
    </div>
@endsection
