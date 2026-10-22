<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Additive only. Every account that exists before this migration counts as verified,
// so no current parent is blocked or nagged. New accounts start unverified.
return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')->whereNull('email_verified_at')->update(['email_verified_at' => DB::raw('COALESCE(created_at, CURRENT_TIMESTAMP)')]);

        Schema::create('mail_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('to', 255);
            $table->string('type', 20)->index();
            $table->string('subject', 255)->nullable();
            $table->string('status', 12)->index(); // sent | failed | disabled
            $table->boolean('is_test')->default(false);
            $table->string('error', 500)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mail_logs');
    }
};
