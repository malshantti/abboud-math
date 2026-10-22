<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// One active device per account ("latest login wins"): the device that logged in last holds the token.
return new class extends Migration
{
    public function up(): void
    {
        // Idempotent: a partial earlier run may already have added some columns.
        foreach (['active_device_token' => fn (Blueprint $t) => $t->string('active_device_token', 64)->nullable(),
            'active_device_ua' => fn (Blueprint $t) => $t->string('active_device_ua', 255)->nullable(),
            'active_device_seen_at' => fn (Blueprint $t) => $t->timestamp('active_device_seen_at')->nullable()] as $col => $add) {
            if (! Schema::hasColumn('users', $col)) {
                Schema::table('users', $add);
            }
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(array_values(array_filter(['active_device_token', 'active_device_ua', 'active_device_seen_at'], fn ($c) => Schema::hasColumn('users', $c))));
        });
    }
};
