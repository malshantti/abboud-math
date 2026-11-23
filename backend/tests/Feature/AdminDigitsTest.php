<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Ar;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** The admin panel shows Western digits; everything families see (pages, emails, messages) keeps Arabic-Indic digits. */
class AdminDigitsTest extends TestCase
{
    use RefreshDatabase;

    public function test_arabic_digits_outside_the_admin_panel(): void
    {
        $this->assertFalse(Ar::latinDigits());
        $this->assertSame('١٢', Ar::num(12));
    }

    public function test_latin_switch_and_family_scope(): void
    {
        Ar::useLatinDigits(true);
        try {
            $this->assertSame('12', Ar::num(12));
            $this->assertSame('0', (string) Ar::html(0), 'A Western zero needs no drawn ring');
            $this->assertSame('١٢', Ar::forFamilies(fn () => Ar::num(12)), 'Family-facing text keeps Arabic-Indic digits');
            $this->assertTrue(Ar::latinDigits(), 'The switch is restored after the family scope');
        } finally {
            Ar::useLatinDigits(false);
        }
    }

    public function test_admin_pages_use_western_digits_and_reset_after_the_request(): void
    {
        $admin = User::factory()->create(['email' => 'digits-admin@example.test', 'password' => 'An-example-passphrase-123']);
        $admin->setRole('admin');
        $admin->save();
        User::factory()->count(3)->create();

        $page = $this->actingAs($admin)->get('/admin/manage')->assertOk();
        $page->assertSee('data-stat="parents"', false)->assertSee('<b>3</b>', false)->assertDontSee('<b>٣</b>', false);
        $this->assertFalse(Ar::latinDigits(), 'The switch is off again once the admin request ends');
    }
}
