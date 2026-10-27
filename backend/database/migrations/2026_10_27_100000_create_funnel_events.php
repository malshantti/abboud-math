<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// New table only: the family journey log (no personal data beyond user_id; visitor_id is a random id from localStorage).
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('funnel_events')) {
            return;
        }
        Schema::create('funnel_events', function (Blueprint $table) {
            $table->id();
            $table->string('event', 32);
            $table->string('visitor_id', 40)->nullable()->index();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('student_id')->nullable();
            $table->string('subject', 24)->nullable();
            $table->string('page', 32)->nullable();
            $table->string('source', 12)->nullable();
            $table->unsignedInteger('count')->nullable();
            $table->string('meta', 500)->nullable();
            $table->boolean('backfill')->default(false);
            $table->timestamp('created_at')->nullable()->index();
            $table->index(['user_id', 'created_at']);
            $table->index(['event', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('funnel_events');
    }
};
