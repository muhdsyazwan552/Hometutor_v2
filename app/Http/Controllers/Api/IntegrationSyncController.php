<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChildSubscription;
use App\Models\Student;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntegrationSyncController extends Controller
{
    public function children(Request $request): JsonResponse
    {
        $filters = $this->filters($request);

        $query = Student::query()
            ->with([
                'user:id,username,display_name,is_active',
                'level:id,abbr,name',
                'school:id,name',
            ])
            ->select(['id', 'uuid', 'user_id', 'code', 'school_id', 'full_name', 'level_id', 'class_name', 'created_at', 'updated_at'])
            ->whereNotNull('uuid');

        $this->applyFilters($query, $filters);
        $page = $query->orderBy('id')->cursorPaginate($filters['per_page']);

        return $this->syncResponse([
            'data' => collect($page->items())->map(fn (Student $student) => [
                'uuid' => $student->uuid,
                'code' => $student->code,
                'username' => $student->user?->username,
                'display_name' => $student->user?->display_name,
                'full_name' => $student->full_name,
                'class_name' => $student->class_name,
                'level' => $student->level ? [
                    'id' => $student->level->id,
                    'code' => $student->level->abbr,
                    'name' => $student->level->name,
                ] : null,
                'school' => $student->school ? [
                    'id' => $student->school->id,
                    'name' => $student->school->name,
                ] : null,
                'is_active' => (bool) $student->user?->is_active,
                'created_at' => $student->created_at?->toIso8601String(),
                'updated_at' => $student->updated_at?->toIso8601String(),
            ])->values(),
            'meta' => $this->paginationMeta($page->nextCursor()?->encode()),
        ]);
    }

    public function subscriptions(Request $request): JsonResponse
    {
        $filters = $this->filters($request);

        $query = ChildSubscription::query()
            ->with([
                'child:id',
                'child.student:id,user_id,uuid',
                'package:id,code,name,duration_days',
            ])
            ->select(['id', 'uuid', 'child_user_id', 'package_id', 'status', 'source', 'subscription_type', 'starts_at', 'ends_at', 'created_at', 'updated_at']);

        $this->applyFilters($query, $filters);
        $page = $query->orderBy('id')->cursorPaginate($filters['per_page']);

        return $this->syncResponse([
            'data' => collect($page->items())->map(fn (ChildSubscription $subscription) => [
                'uuid' => $subscription->uuid,
                'child_uuid' => $subscription->child?->student?->uuid,
                'package' => $subscription->package ? [
                    'code' => $subscription->package->code,
                    'name' => $subscription->package->name,
                    'duration_days' => $subscription->package->duration_days,
                ] : null,
                'status' => $subscription->status,
                'effective_status' => $this->effectiveStatus($subscription),
                'source' => $subscription->source,
                'subscription_type' => $subscription->subscription_type,
                'starts_at' => $subscription->starts_at?->toIso8601String(),
                'ends_at' => $subscription->ends_at?->toIso8601String(),
                'created_at' => $subscription->created_at?->toIso8601String(),
                'updated_at' => $subscription->updated_at?->toIso8601String(),
            ])->values(),
            'meta' => $this->paginationMeta($page->nextCursor()?->encode()),
        ]);
    }

    private function filters(Request $request): array
    {
        $filters = $request->validate([
            'updated_since' => ['nullable', 'date'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:200'],
            'cursor' => ['nullable', 'string', 'max:2048'],
        ]);

        return [
            'per_page' => $filters['per_page'] ?? 100,
            'updated_since' => $filters['updated_since'] ?? null,
        ];
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if ($filters['updated_since']) {
            $query->where('updated_at', '>=', $filters['updated_since']);
        }
    }

    private function paginationMeta(?string $nextCursor): array
    {
        return [
            'next_cursor' => $nextCursor,
            'has_more' => $nextCursor !== null,
        ];
    }

    private function effectiveStatus(ChildSubscription $subscription): string
    {
        if ($subscription->status === ChildSubscription::STATUS_CANCELLED) {
            return ChildSubscription::STATUS_CANCELLED;
        }

        if ($subscription->starts_at?->isFuture()) {
            return ChildSubscription::STATUS_SCHEDULED;
        }

        return $subscription->ends_at?->isPast()
            ? ChildSubscription::STATUS_EXPIRED
            : $subscription->status;
    }

    private function syncResponse(array $payload): JsonResponse
    {
        return response()->json($payload)
            ->header('Cache-Control', 'no-store, private')
            ->header('Pragma', 'no-cache')
            ->header('X-Content-Type-Options', 'nosniff');
    }
}
