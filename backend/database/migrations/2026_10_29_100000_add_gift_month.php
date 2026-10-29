<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Gift month: remember when a family dismissed the on-site gift notice (shown once per account). Schema only; no gift is applied here. */
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'gift_notice_seen_at')) {
            Schema::table('users', fn (Blueprint $t) => $t->timestamp('gift_notice_seen_at')->nullable());
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'gift_notice_seen_at')) {
            Schema::table('users', fn (Blueprint $t) => $t->dropColumn('gift_notice_seen_at'));
        }
    }
};
