<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Additive only: mobile number (login without email) and «من وين سمعت عنا؟».
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'phone')) {
                $table->string('phone', 20)->nullable()->unique();
            }
            if (! Schema::hasColumn('users', 'heard_from')) {
                $table->string('heard_from', 20)->nullable();
            }
        });
    }

    public function down(): void
    {
        // Additive migration: nothing is dropped on rollback (no data loss).
    }
};
