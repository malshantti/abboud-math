<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** Replace the stored tagline only when it is still exactly the old short text; any custom tagline is left alone. */
return new class extends Migration
{
    public const OLD = 'نزرع الفهم، ونحصد المعرفة';

    public const NEW = 'نزرع الفهم، ونحصد المعرفة — المنهاج الفلسطيني كاملًا';

    public function up(): void
    {
        if (! Schema::hasTable('site_settings')) {
            return;
        }
        $n = DB::table('site_settings')->where('key', 'tagline')->where('value', self::OLD)->update(['value' => self::NEW, 'updated_at' => now()]);
        if ($n) {
            Cache::forget('site_settings');
        }
    }

    public function down(): void {}
};
