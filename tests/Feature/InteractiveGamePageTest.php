<?php

namespace Tests\Feature;

use Database\Seeders\InteractiveGameSeeder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InteractiveGamePageTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('level', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('abbr')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('subject', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('abbr');
            $table->unsignedBigInteger('level_id');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        $migration = include database_path('migrations/2026_08_28_010000_create_interactive_games_table.php');
        $migration->up();

        foreach (range(1, 3) as $standard) {
            DB::table('level')->insert([
                'id' => $standard,
                'name' => "Standard {$standard}",
                'abbr' => "STD{$standard}",
                'is_active' => true,
            ]);
            DB::table('subject')->insert([
                'id' => $standard,
                'name' => 'Bahasa Melayu',
                'abbr' => 'BM',
                'level_id' => $standard,
                'is_active' => true,
            ]);
        }

        $this->seed(InteractiveGameSeeder::class);
    }

    public function test_seeder_creates_literasi_one_to_ten_for_standard_one_to_three(): void
    {
        $this->assertDatabaseCount('interactive_games', 30);
        $this->assertDatabaseHas('interactive_games', [
            'level_id' => 1,
            'subject_id' => 1,
            'slug' => 'literasi-10',
            'launch_url' => 'https://hometutor-v2.s3.ap-southeast-1.amazonaws.com/interactive_games/literasi-10/index.html',
        ]);
    }

    public function test_interactive_page_only_returns_games_for_selected_level_and_subject(): void
    {
        $this->withoutMiddleware()
            ->get('/subject/BM/interact?form=Standard%202&level_id=2&subject_id=2')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('courses/SubjectInteractivePage')
                ->where('form', 'Standard 2')
                ->where('subject_abbr', 'BM')
                ->has('interactiveModules', 10)
                ->where('interactiveModules.0.slug', 'literasi-1')
                ->where('interactiveModules.9.slug', 'literasi-10'));
    }
}
