<?php

namespace App\Providers;

use App\Models\Order;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        View::composer('layouts.parent', function ($view): void {
            $cartItemCount = 0;
            $parent = auth()->user();

            if ($parent?->isParent()) {
                $draft = Order::query()
                    ->where('parent_id', $parent->id)
                    ->where('status', Order::STATUS_DRAFT)
                    ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                    ->withCount(['items as cart_item_count' => fn ($query) => $query->where('fulfillment_status', 'pending')])
                    ->latest('id')
                    ->first();
                $cartItemCount = (int) ($draft?->cart_item_count ?? 0);
            }

            $view->with('cartItemCount', $cartItemCount);
        });
    }
}
