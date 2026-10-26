<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** Google already confirmed these addresses: mark every Google-linked account as verified. */
    public function up(): void
    {
        DB::table('users')->whereNotNull('google_id')->whereNull('email_verified_at')->update(['email_verified_at' => now()]);
    }

    public function down(): void {}
};
