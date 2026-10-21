<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Additive only: new nullable/defaulted columns; nothing existing is changed or dropped.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('parent')->index();
            $table->timestamp('disabled_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable()->index();
        });
        DB::table('users')->where('is_admin', true)->update(['role' => 'admin']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['trial_ends_at']);
            $table->dropColumn(['role', 'disabled_at', 'last_login_at', 'trial_ends_at']);
        });
    }
};
