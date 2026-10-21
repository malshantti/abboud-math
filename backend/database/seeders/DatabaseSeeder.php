<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /** Seeds site settings defaults (never overwrites values already edited in the panel). No accounts are created here. */
    public function run(): void
    {
        $now = now();
        $rows = [];
        foreach (Setting::DEFAULTS as $key => $value) {
            $rows[] = ['key' => $key, 'value' => $value, 'created_at' => $now, 'updated_at' => $now];
        }
        DB::table('site_settings')->insertOrIgnore($rows);
        Cache::forget('site_settings');
    }
}
