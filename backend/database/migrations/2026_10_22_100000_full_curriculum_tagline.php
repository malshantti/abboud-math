<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** The site covers the full Palestinian curriculum: drop a stored tagline that lists grade numbers. */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('site_settings')) {
            return;
        }
        $row = DB::table('site_settings')->where('key', 'tagline')->first();
        if ($row && preg_match('/[0-9١-٩]|للصفوف|الصفوف/u', (string) $row->value)) {
            DB::table('site_settings')->where('key', 'tagline')->update(['value' => 'نزرع الفهم، ونحصد المعرفة — المنهاج الفلسطيني كاملًا']);
            Cache::forget('site_settings');
        }
    }

    public function down(): void {}
};
