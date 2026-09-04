<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->activeSubscription()) {
            return $next($request);
        }

        return redirect()
            ->route('parent.subscriptions.index')
            ->with('error', 'An active package is required before you can create a child account.');
    }
}
