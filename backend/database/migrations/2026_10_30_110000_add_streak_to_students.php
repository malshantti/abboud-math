<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Additive only: consecutive learning days per child (saved on the server, same on every device).
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (! Schema::hasColumn('students', 'streak_days')) {
                $table->unsignedInteger('streak_days')->default(0);
            }
            if (! Schema::hasColumn('students', 'streak_last')) {
                $table->date('streak_last')->nullable();
            }
            if (! Schema::hasColumn('students', 'streak_best')) {
                $table->unsignedInteger('streak_best')->default(0);
            }
        });
    }

    public function down(): void
    {
        // Additive migration: nothing is dropped on rollback.
    }
};
