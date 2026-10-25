<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Read-only share link for a student's progress report (parents create/revoke it from the account page). */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('report_token', 64)->nullable()->unique();
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique(['report_token']);
            $table->dropColumn('report_token');
        });
    }
};
