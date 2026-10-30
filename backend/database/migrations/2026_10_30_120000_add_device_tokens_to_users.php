<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Additive only: the list of devices currently allowed on an account (free month: 2).
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'device_tokens')) {
            Schema::table('users', fn (Blueprint $t) => $t->text('device_tokens')->nullable());
        }
    }

    public function down(): void
    {
        // Additive migration: nothing is dropped on rollback.
    }
};
