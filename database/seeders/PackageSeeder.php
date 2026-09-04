<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        Package::query()->whereNull('curriculum_group')->update(['is_active' => false]);

        $definitions = [
            ['code' => 'STD-1-3', 'name' => 'Standard 1–3', 'group' => 'standard_1_3', 'patterns' => ['Standard 1', 'Standard 2', 'Standard 3']],
            ['code' => 'STD-4-6', 'name' => 'Standard 4–6', 'group' => 'standard_4_6', 'patterns' => ['Standard 4', 'Standard 5', 'Standard 6']],
            ['code' => 'FORM-1-3', 'name' => 'Form 1–3', 'group' => 'form_1_3', 'patterns' => ['Form 1', 'Form 2', 'Form 3']],
            ['code' => 'FORM-4-5', 'name' => 'Form 4–5', 'group' => 'form_4_5', 'patterns' => ['Form 4', 'Form 5']],
        ];

        foreach ($definitions as $definition) {
            $package = Package::updateOrCreate(['code' => $definition['code']], [
                'name' => $definition['name'],
                'description' => 'Learning access for one child in '.$definition['name'].'.',
                'curriculum_group' => $definition['group'],
                'price' => 500,
                'currency' => 'MYR',
                'duration_days' => 365,
                'max_children' => 1,
                'is_active' => true,
            ]);

            $levelIds = DB::table('level')
                ->whereIn('name', $definition['patterns'])
                ->pluck('id');
            $package->levels()->sync($levelIds);

            $package->durationOptions()->updateOrCreate(['months' => 6], [
                'duration_days' => 183,
                'price' => 500,
                'currency' => 'MYR',
                'is_active' => true,
            ]);
            $package->durationOptions()->updateOrCreate(['months' => 12], [
                'duration_days' => 365,
                'price' => 700,
                'currency' => 'MYR',
                'is_active' => true,
            ]);
        }
    }
}
