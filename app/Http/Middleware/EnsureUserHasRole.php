<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if ($user && collect($roles)->contains(fn (string $role) => $user->hasRole($role))) {
            return $next($request);
        }

        if ($user) {
            return redirect()
                ->route($user->homeRouteName())
                ->with('error', 'You do not have access to that area.');
        }

        return redirect()->route('login');
    }
}
