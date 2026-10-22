<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// One active device per account ("latest login wins"): the device that logged in last holds the token.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('active_device_token', 64)->nullable();
            $table->string('active_device_ua', 255)->nullable();
            $table->timestamp('active_device_seen_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['active_device_token', 'active_device_ua', 'active_device_seen_at']);
        });
    }
};
