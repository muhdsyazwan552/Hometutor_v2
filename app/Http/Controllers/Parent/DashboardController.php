<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Services\ParentChildOverviewService;
use Illuminate\Http\Request;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __invoke(Request $request, ParentChildOverviewService $overview): View
    {
        $parent = $request->user();
        $children = $overview->enrich($parent->children()->with(['user.childSubscriptions.package', 'level'])->latest()->get());

        return view('parent.dashboard', [
            'parent' => $parent,
            'children' => $children,
            'activeChildCount' => $children->filter(fn ($student) => $student->user->activeChildSubscription())->count(),
            'renewalRequiredCount' => $children->reject(fn ($student) => $student->user->activeChildSubscription())->count(),
            'unusedCodeCount' => $parent->activationCodes()->where('status', 'unused')->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))->count(),
        ]);
    }
}
