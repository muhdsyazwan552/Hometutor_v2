<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MasteryRankSettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Settings/MasteryRanks', [
            'configuration' => DB::table('mastery_configurations')->first(),
            'ranks' => DB::table('mastery_rank_settings')->orderBy('rank')->get(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'questions_per_session' => ['required', 'integer', 'min:5', 'max:50'],
            'ranks' => ['required', 'array', 'size:5'],
            'ranks.*.rank' => ['required', 'integer', 'between:1,5', 'distinct'],
            'ranks.*.min_questions' => ['required', 'integer', 'min:1', 'max:1000'],
            'ranks.*.min_accuracy' => ['required', 'numeric', 'between:0,100'],
        ]);

        $ranks = collect($validated['ranks'])->sortBy('rank')->values();
        for ($index = 1; $index < $ranks->count(); $index++) {
            $previous = $ranks[$index - 1];
            $current = $ranks[$index];

            if ($current['min_questions'] <= $previous['min_questions']) {
                throw ValidationException::withMessages([
                    "ranks.{$index}.min_questions" => 'Each rank must require more questions than the previous rank.',
                ]);
            }

            if ((float) $current['min_accuracy'] < (float) $previous['min_accuracy']) {
                throw ValidationException::withMessages([
                    "ranks.{$index}.min_accuracy" => 'Accuracy cannot be lower than the previous rank.',
                ]);
            }
        }

        DB::transaction(function () use ($validated, $ranks) {
            DB::table('mastery_configurations')->updateOrInsert(
                ['id' => 1],
                ['questions_per_session' => $validated['questions_per_session'], 'updated_at' => now()]
            );

            foreach ($ranks as $rank) {
                DB::table('mastery_rank_settings')->where('rank', $rank['rank'])->update([
                    'min_questions' => $rank['min_questions'],
                    'min_accuracy' => $rank['min_accuracy'],
                    'updated_at' => now(),
                ]);

                $setting = DB::table('mastery_rank_settings')->where('rank', $rank['rank'])->first();
                DB::table('mastery_levels')->where('id', $setting->mastery_level_id)->update([
                    'min_score' => round($rank['min_accuracy']),
                    'updated_at' => now(),
                ]);
            }
        });

        return back()->with('success', 'Mastery rank rules updated successfully.');
    }
}
