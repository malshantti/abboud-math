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

    public function migrate(Request $request)
    {
        $this->guard($request);
        Artisan::call('migrate', ['--force' => true]);

        return response(Artisan::output(), 200, ['Content-Type' => 'text/plain; charset=UTF-8', 'Cache-Control' => 'no-store']);
    }

    public function admin(Request $request)
    {
        $this->guard($request);
        abort_unless(Schema::hasTable('users'), 409, 'Run migrations first.');
        abort_if(User::query()->where('is_admin', true)->exists(), 409, 'An admin already exists; use php artisan admin:create.');
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', Password::min(12), fn ($a, $v, $fail) => strlen($v) > 72 ? $fail('Password exceeds 72 bytes.') : null],
        ]);
        if ($validator->fails()) {
            return response(implode("\n", $validator->errors()->all())."\n", 422, ['Content-Type' => 'text/plain; charset=UTF-8']);
        }
        $data = $validator->validated();
        $user = new User(['name' => trim($data['name']), 'email' => Str::lower(trim($data['email'])), 'password' => $data['password']]);
        $user->is_admin = true;
        $user->save();

        return response("Admin created. Now remove SETUP_TOKEN from .env.\n", 201, ['Content-Type' => 'text/plain; charset=UTF-8', 'Cache-Control' => 'no-store']);
    }
}
