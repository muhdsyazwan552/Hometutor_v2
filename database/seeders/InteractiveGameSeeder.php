<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class InteractiveGameSeeder extends Seeder
{
    private const S3_BASE_URL = 'https://hometutor-v2.s3.ap-southeast-1.amazonaws.com/interactive_games';

    public function run(): void
    {
        if (! Schema::hasTable('interactive_games') || ! Schema::hasTable('level') || ! Schema::hasTable('subject')) {
            $this->command?->warn('Interactive games were not seeded because level or subject tables are unavailable.');

            return;
        }

        $levels = DB::table('level')
            ->where('is_active', 1)
            ->whereIn('name', ['Standard 1', 'Standard 2', 'Standard 3'])
            ->orderBy('id')
            ->get(['id', 'name']);

        foreach ($levels as $level) {
            $subject = DB::table('subject')
                ->where('level_id', $level->id)
                ->where('is_active', 1)
                ->where(function ($query) {
                    $query->whereIn('abbr', ['BM', 'MAL'])
                        ->orWhere('name', 'like', 'Bahasa Malays%')
                        ->orWhere('name', 'like', 'Bahasa Melayu%');
                })
                ->orderBy('id')
                ->first(['id']);

            if (! $subject) {
                $this->command?->warn("No Bahasa Melayu/Malaysia subject was found for {$level->name}.");

                continue;
            }

            foreach (range(1, 10) as $number) {
                DB::table('interactive_games')->updateOrInsert(
                    [
                        'level_id' => $level->id,
                        'subject_id' => $subject->id,
                        'slug' => "literasi-{$number}",
                    ],
                    [
                        'content_group' => 'literasi',
                        'title' => "Literasi {$number}",
                        'description' => "Aktiviti pembelajaran interaktif Literasi {$number} untuk {$level->name}.",
                        'launch_url' => self::S3_BASE_URL."/literasi-{$number}/index.html",
                        'sequence' => $number,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                );
            }
        }
    }
}
