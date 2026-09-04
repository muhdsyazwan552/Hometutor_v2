<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LiterasiWebGameDemoTest extends TestCase
{
    public function test_demo_page_is_available_without_a_unity_build(): void
    {
        $this->get('/demo/literasi-web')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Demos/LiterasiWebGame/Index'));
    }
}
