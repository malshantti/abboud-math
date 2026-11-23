<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\DashboardCharts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** The dashboard charts render from real data (a chart failure is swallowed in production, so assert they are there). */
class DashboardChartsTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_shows_week_signup_and_revenue_charts(): void
    {
        $admin = User::factory()->create(['email' => 'charts-admin@example.test', 'password' => 'An-example-passphrase-123']);
        $admin->setRole('admin');
        $admin->save();
        $parent = User::factory()->create();
        $student = $parent->students()->create(['name' => 'سارة', 'grade' => 1]);
        $student->forceFill(['last_synced_at' => now()])->save();
        $parent->subscriptions()->create(['student_id' => $student->id, 'code' => 'CH1', 'plan' => 'g1-all', 'plan_name' => 'الصف الأول', 'days' => 30, 'price' => 25, 'currency' => 'ILS', 'status' => 'active'])
            ->forceFill(['starts_at' => now(), 'ends_at' => now()->addDays(30)])->save();

        $charts = DashboardCharts::all();
        $this->assertCount(7, $charts['week']);
        $this->assertCount(30, $charts['signups']);
        $this->assertSame(1, end($charts['week'])['students']);
        $this->assertSame(25, end($charts['revenue'])['amount']);

        $page = $this->actingAs($admin)->get('/admin/manage')->assertOk();
        foreach (['signups', 'students', 'requests', 'signups30', 'revenue'] as $chart) {
            $page->assertSee('data-chart="'.$chart.'"', false);
        }
        $page->assertSee('class="chart cols"', false)->assertSee('class="chart area"', false)->assertSee('25 '.(\App\Models\Setting::get('currency') ?: 'شيكل'), false);
    }
}
