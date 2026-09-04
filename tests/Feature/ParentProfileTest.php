<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ParentProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_parent_can_open_profile_and_update_name_and_mobile_number(): void
    {
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT]);

        $this->actingAs($parent)->get(route('parent.dashboard'))
            ->assertOk()
            ->assertSee('Profile & password', false);

        $this->actingAs($parent)->get(route('parent.profile.edit'))
            ->assertOk()
            ->assertSee('My profile')
            ->assertSee($parent->email);

        $this->actingAs($parent)->patch(route('parent.profile.update'), [
            'name' => 'Parent Updated',
            'mobile_number' => '+60 12-345 6789',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', [
            'id' => $parent->id,
            'name' => 'Parent Updated',
            'mobile_number' => '+60 12-345 6789',
        ]);
    }

    public function test_parent_can_change_password_from_profile(): void
    {
        $parent = User::factory()->create([
            'role_id' => User::ROLE_PARENT,
            'password' => 'old-password',
        ]);

        $this->actingAs($parent)->put(route('password.update'), [
            'current_password' => 'old-password',
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertTrue(Hash::check('new-secure-password', $parent->fresh()->password));
    }
}
