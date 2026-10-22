<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// The parent sets each student's 4-digit PIN on the account page; devices receive the salted hash only.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('pin_salt', 32)->nullable()->after('local_id');
            $table->string('pin_hash', 80)->nullable()->after('pin_salt');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['pin_salt', 'pin_hash']);
        });
    }
};
