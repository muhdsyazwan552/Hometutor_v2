<?php

namespace Tests\Feature\Auth;

use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('parent.dashboard', absolute: false));
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'role_id' => \App\Models\User::ROLE_PARENT,
            'company_id' => Company::query()->where('name', 'Dasar Jati')->value('id'),
        ]);
    }

    public function test_reference_code_attributes_registration_to_its_company(): void
    {
        $response = $this->post('/register', [
            'name' => 'Explode User',
            'email' => 'explode@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'reference_code' => 'explode',
        ]);

        $response->assertRedirect(route('parent.dashboard', absolute: false));
        $this->assertDatabaseHas('users', [
            'email' => 'explode@example.com',
            'company_id' => Company::query()->where('name', 'Explode')->value('id'),
            'registration_reference_code' => 'EXPLODE',
        ]);
    }

    public function test_invalid_reference_code_cannot_be_used(): void
    {
        $response = $this->from('/register')->post('/register', [
            'name' => 'Invalid Code User',
            'email' => 'invalid-code@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'reference_code' => 'INVALID',
        ]);

        $response->assertRedirect('/register')->assertSessionHasErrors('reference_code');
        $this->assertGuest();
    }
}
