<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use App\Support\Devices;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Latest login wins: one active device per parent account; admins exempt; admin toggle and sign-out-all. */
class SingleDeviceTest extends TestCase
{
    use RefreshDatabase;

    private function loginAs(User $u, string $ua): string
    {
        auth()->forgetGuards();
        $this->flushSession();
        $this->app['auth']->guard('web')->logout();
        $r = $this->withHeader('User-Agent', $ua)->post('/account/login', ['email' => $u->email, 'password' => 'password']);
        $r->assertRedirect();
        $cookie = collect($r->headers->getCookies())->first(fn ($c) => $c->getName() === Devices::COOKIE);
        $this->assertNotNull($cookie);
        auth()->forgetGuards();
        $this->flushSession();

        return \Illuminate\Cookie\CookieValuePrefix::remove(app('encrypter')->decrypt($cookie->getValue(), false));
    }

    private function device(User $u, string $token)
    {
        return $this->actingAs($u->fresh())->withCredentials()->withCookie(Devices::COOKIE, $token);
    }

    public function test_second_login_revokes_the_first_device(): void
    {
        $u = User::factory()->create(['trial_ends_at' => now()->addDay()]);
        $a = $this->loginAs($u, 'Mozilla/5.0 (Windows NT 10.0) Chrome/130');
        $this->device($u, $a)->getJson('/api/session')->assertJson(['authenticated' => true]);
        $b = $this->loginAs($u, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Safari/604');
        $this->assertNotSame($a, $b);
        $this->assertSame('آيفون — Safari', $u->fresh()->deviceLabel(), (string) $u->fresh()->active_device_ua);

        $this->device($u->fresh(), $a)->getJson('/api/session')->assertOk()->assertJson(['authenticated' => false, 'revoked' => true, 'message' => Devices::MESSAGE]);
        $this->device($u->fresh(), $a)->getJson('/api/students/'.$u->students()->create(['name' => 'سندس', 'grade' => 6])->id.'/progress')->assertStatus(401)->assertJson(['revoked' => true]);
        $this->device($u->fresh(), $a)->get('/account')->assertRedirect(route('account.login'))->assertSessionHasErrors(['email' => Devices::MESSAGE]);
        // Its session gone (database sessions are dropped at the new login): the old device cookie alone tells it why.
        auth()->forgetGuards();
        $this->flushSession();
        $this->withCredentials()->withCookie(Devices::COOKIE, $a)->getJson('/api/session')->assertJson(['authenticated' => false, 'revoked' => true]);
        $this->withCredentials()->withCookie(Devices::COOKIE, $b)->getJson('/api/session')->assertJson(['authenticated' => false])->assertJsonMissingPath('revoked');
        $r = $this->device($u->fresh(), $b)->getJson('/api/session');
        $this->assertTrue($r->json('authenticated'), json_encode([$r->json(), substr($b, 0, 20), \Illuminate\Support\Str::limit((string) $u->fresh()->active_device_token, 10)]));
    }

    public function test_toggle_off_allows_both_devices_and_admins_are_exempt(): void
    {
        $u = User::factory()->create();
        $a = $this->loginAs($u, 'A');
        $this->loginAs($u, 'B');
        Setting::put(['single_device' => '0']);
        $this->device($u->fresh(), $a)->getJson('/api/session')->assertJson(['authenticated' => true]);

        Setting::put(['single_device' => '1']);
        $admin = User::factory()->create();
        $admin->setRole('admin');
        $admin->save();
        $x = $this->loginAs($admin, 'A');
        $this->loginAs($admin, 'B');
        $this->device($admin->fresh(), $x)->getJson('/api/session')->assertJson(['authenticated' => true]);
    }

    public function test_default_on_settings_toggle_and_admin_sign_out_all(): void
    {
        $this->assertTrue(Setting::flag('single_device'));
        $admin = User::factory()->create();
        $admin->setRole('admin');
        $admin->save();
        $u = User::factory()->create();
        $t = $this->loginAs($u, 'Mozilla/5.0 (Linux; Android 14) Chrome/130');
        $this->device($admin, 'x')->get(route('manage.user', $u))->assertOk()->assertSee('الجهاز الحالي')->assertSee('أندرويد — Chrome')->assertSee('تسجيل الخروج من كل الأجهزة');
        $this->device($admin, 'x')->post(route('manage.user.devices', $u))->assertRedirect();
        $this->device($u->fresh(), $t)->getJson('/api/session')->assertJson(['authenticated' => false, 'revoked' => true]);
        $this->device($admin, 'x')->get(route('manage.settings', ['tab' => 'accounts']))->assertOk()->assertSee('جهاز واحد لكل حساب');
    }
}
