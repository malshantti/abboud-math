<?php

namespace Tests\Feature;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPricesTest extends TestCase
{
    use RefreshDatabase;

    public function test_defaults_per_group(): void
    {
        $r = $this->getJson('/api/public/prices')->assertOk();
        $this->assertStringContainsString('max-age=60', $r->headers->get('Cache-Control'));
        $r->assertJsonPath('groups.0.title', 'الصفان الأول والثاني')
            ->assertJsonPath('groups.0.min', 15)->assertJsonPath('groups.0.from', false)
            ->assertJsonPath('groups.1.title', 'الصفان السادس والثامن')
            ->assertJsonPath('groups.1.min', 20)->assertJsonPath('groups.0.days', 30)
            ->assertJsonPath('trial_days', 3);
    }

    public function test_db_price_change_is_reflected_with_from_minimum(): void
    {
        $lines = str_replace('g6-math|20|30', 'g6-math|12|30', Setting::DEFAULTS['prices']);
        Setting::put(['prices' => $lines, 'trial_days' => 5]);
        $this->getJson('/api/public/prices')->assertOk()
            ->assertJsonPath('groups.1.min', 8)->assertJsonPath('groups.1.max', 20)
            ->assertJsonPath('groups.1.from', true)->assertJsonPath('trial_days', 5)
            ->assertJsonPath('plans.g6-math.price', 12);
    }
}
