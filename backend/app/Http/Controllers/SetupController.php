<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

/**
 * One-time setup for shared hosts without SSH. Disabled unless SETUP_TOKEN is
 * set to 32+ characters in .env. Remove the token right after setup.
 */
class SetupController extends Controller
{
    private function guard(Request $request): void
    {
        $token = (string) config('app.setup_token');
        abort_if(strlen($token) < 32, 404);
        abort_unless(hash_equals($token, (string) $request->input('token', $request->header('X-Setup-Token', ''))), 404);
    }

    /** Install/admin endpoints vanish (404) once an admin exists. */
    private function closedWhenInstalled(): void
    {
        abort_if(Schema::hasTable('users') && User::query()->where('is_admin', true)->exists(), 404);
    }

    public function migrate(Request $request)
    {
        $this->guard($request);
        Artisan::call('migrate', ['--force' => true]);
        $out = Artisan::output();
        Artisan::call('db:seed', ['--force' => true]);
        $out .= Artisan::output();

        return response($out, 200, ['Content-Type' => 'text/plain; charset=UTF-8', 'Cache-Control' => 'no-store']);
    }

    /** One call: writable dirs check, migrate, seed defaults, first admin (email defaults to SETUP_ADMIN_EMAIL). */
    public function install(Request $request)
    {
        $this->guard($request);
        $this->closedWhenInstalled();
        $log = $this->ensureWritable();
        Artisan::call('migrate', ['--force' => true]);
        $log .= Artisan::output();
        Artisan::call('db:seed', ['--force' => true]);
        $log .= Artisan::output();
        if (User::query()->where('is_admin', true)->exists()) {
            return response($log."Admin already exists; skipped.\n", 200, ['Content-Type' => 'text/plain; charset=UTF-8', 'Cache-Control' => 'no-store']);
        }
        $res = $this->createAdmin($request);

        return response($log.$res->getContent(), $res->getStatusCode(), ['Content-Type' => 'text/plain; charset=UTF-8', 'Cache-Control' => 'no-store']);
    }

    private function ensureWritable(): string
    {
        $log = '';
        foreach ([storage_path('app/public'), storage_path('app/private'), storage_path('framework/cache/data'), storage_path('framework/sessions'), storage_path('framework/views'), storage_path('logs'), base_path('bootstrap/cache')] as $dir) {
            if (! is_dir($dir)) {
                @mkdir($dir, 0755, true);
            }
            if (! is_writable($dir)) {
                @chmod($dir, 0755);
            }
            $log .= (is_writable($dir) ? 'OK ' : 'NOT WRITABLE ').str_replace(base_path().'/', '', $dir)."\n";
        }

        return $log;
    }

    public function admin(Request $request)
    {
        $this->guard($request);
        $this->closedWhenInstalled();

        return $this->createAdmin($request);
    }

    private function createAdmin(Request $request)
    {
        abort_unless(Schema::hasTable('users'), 409, 'Run migrations first.');
        abort_if(User::query()->where('is_admin', true)->exists(), 409, 'An admin already exists; use php artisan admin:create.');
        $input = $request->all() + ['email' => config('app.setup_admin_email'), 'name' => config('app.setup_admin_name')];
        $validator = \Illuminate\Support\Facades\Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', Password::min(12), fn ($a, $v, $fail) => strlen($v) > 72 ? $fail('Password exceeds 72 bytes.') : null],
        ]);
        if ($validator->fails()) {
            return response(implode("\n", $validator->errors()->all())."\n", 422, ['Content-Type' => 'text/plain; charset=UTF-8']);
        }
        $data = $validator->validated();
        $user = new User(['name' => trim($data['name']), 'email' => Str::lower(trim($data['email'])), 'password' => $data['password']]);
        $user->setRole('admin');
        $user->save();

        return response("Admin created. Now remove SETUP_TOKEN from .env.\n", 201, ['Content-Type' => 'text/plain; charset=UTF-8', 'Cache-Control' => 'no-store']);
    }
}
