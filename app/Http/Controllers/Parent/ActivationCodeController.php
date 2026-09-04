<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Services\ActivationCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivationCodeController extends Controller
{
    public function validateCode(Request $request, ActivationCodeService $service): JsonResponse
    {
        $validated = $request->validate(['activation_code' => ['required', 'string', 'max:40']]);
        $code = $service->validateForParent($validated['activation_code'], $request->user(), request: $request);

        return response()->json([
            'valid' => true,
            'package' => ['name' => $code->package->name, 'duration_days' => $code->duration_days ?: $code->package->duration_days],
            'levels' => $code->package->levels->map(fn ($level) => ['id' => $level->id, 'name' => $level->name])->values(),
            'expires_at' => $code->expires_at?->toIso8601String(),
        ]);
    }
}
