<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// "Sign in with Google": the stable Google account id (sub). Google-created users get a random password hash.
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'google_id')) {
            Schema::table('users', function (Blueprint $t) {
                $t->string('google_id', 64)->nullable()->unique();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'google_id')) {
            Schema::table('users', function (Blueprint $t) {
                $t->dropUnique(['google_id']);
                $t->dropColumn('google_id');
            });
        }
    }
};
