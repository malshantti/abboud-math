<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class StreakTest extends TestCase
{
    use RefreshDatabase;

    public function test_streak_counts_consecutive_days_once_per_day_and_resets_after_gap(): void
    {
        Carbon::setTestNow('2026-11-01 10:00:00');
        $u = User::factory()->create(['trial_ends_at' => now()->addDays(30)]);
        $s = $u->students()->create(['name' => 'س', 'grade' => 6]);
        $this->actingAs($u);
        $put = fn ($v, $t) => $this->putJson("/api/students/{$s->id}/progress", ['items' => ['bustan_g6_math_v1' => ['value' => $v, 'updated' => $t]]])->assertOk();
        $put('a', 1000);
        $put('b', 2000);
        $this->assertSame(1, $s->fresh()->currentStreak());
        Carbon::setTestNow('2026-11-02 09:00:00');
        $put('c', 3000);
        $this->assertSame(2, $s->fresh()->currentStreak());
        $this->getJson('/api/session')->assertJsonPath('students.0.streak', 2);
        Carbon::setTestNow('2026-11-05 09:00:00');
        $this->assertSame(0, $s->fresh()->currentStreak());
        $put('d', 4000);
        $this->assertSame(1, $s->fresh()->currentStreak());
        $this->assertSame(2, $s->fresh()->streak_best);
        Carbon::setTestNow();
    }
}
