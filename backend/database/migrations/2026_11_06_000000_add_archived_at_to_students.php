<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Additive only: a school student can be archived (hidden, can't log in) and restored; nothing is deleted. */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('students', 'archived_at')) {
            Schema::table('students', function (Blueprint $t) {
                $t->timestamp('archived_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        // Intentionally empty: never drop data.
    }
};
