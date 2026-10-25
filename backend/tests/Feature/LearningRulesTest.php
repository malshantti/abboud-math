<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LearningRulesTest extends TestCase
{
    use RefreshDatabase;

    public function test_defaults_are_public_and_neutral(): void
    {
        $r = $this->getJson('/api/site')->assertOk();
        $r->assertJsonPath('rules.hidden', [])->assertJsonPath('rules.badges', true)->assertJsonPath('rules.points', 1);
    }

    public function test_admin_hides_subjects_and_sets_badges_and_points(): void
    {
        $u = User::factory()->create();
        $u->setRole('admin');
        $u->save();
        $this->actingAs($u)->get('/admin/manage/settings?tab=learning')->assertOk()->assertSee('المواد والتحفيز')->assertSee('data-show="g6-science"', false);
        $prices = array_map(fn ($p) => ['price' => $p['price'], 'days' => $p['days'], 'active' => $p['active']], Setting::plans());
        // Partial API-style submission keeps everything else.
        $this->actingAs($u)->put('/admin/manage/settings', ['prices' => $prices, 'hidden' => ['g6-science', 'g1-life', 'bogus-x'], 'points_multiplier' => '2', 'badges_enabled' => '0'])->assertSessionHasErrors('hidden.2');
        $this->actingAs($u)->put('/admin/manage/settings', ['prices' => $prices, 'hidden' => ['g6-science', 'g1-life'], 'points_multiplier' => '2', 'badges_enabled' => '0'])->assertSessionHasNoErrors();
        $rules = Setting::learningRules();
        $this->assertSame(['g1-life', 'g6-science'], $rules['hidden']);
        $this->assertFalse($rules['badges']);
        $this->assertSame(2.0, $rules['points']);
        $this->assertSame('15', (string) Setting::plans()['g1-math']['price']);
        $this->actingAs($u)->put('/admin/manage/settings', ['prices' => $prices, 'points_multiplier' => '7'])->assertSessionHasErrors('points_multiplier');
    }
}
