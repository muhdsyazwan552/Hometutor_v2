<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LanguageSwitchingTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_authenticated_user_can_switch_between_english_and_bahasa_melayu(): void
    {
        $user = User::factory()->create(['language' => 'en']);

        $response = $this->actingAs($user)->post(route('language.change'), ['locale' => 'ms']);

        $response->assertRedirect();
        $response->assertSessionHas('locale', 'ms');
        $this->assertDatabaseHas('users', ['id' => $user->id, 'language' => 'ms']);
    }

    public function test_an_invalid_language_is_rejected(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->from('/dashboard')->post(route('language.change'), ['locale' => 'fr']);

        $response->assertRedirect('/dashboard');
        $response->assertSessionHasErrors('locale');
    }
}
