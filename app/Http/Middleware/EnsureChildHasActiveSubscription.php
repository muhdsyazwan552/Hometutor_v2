<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureChildHasActiveSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $student = $user?->student()->first();

        // Admins and legacy students without a parent relationship remain accessible.
        if (! $user?->isChild() || ! $student?->parent_id || $user->activeChildSubscription()) {
            return $next($request);
        }

        return redirect()->route('child.subscription-required');
    }
}
