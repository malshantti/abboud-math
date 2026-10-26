<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->char('endpoint_hash', 64)->unique();
            $table->text('endpoint');
            $table->string('p256dh', 120);
            $table->string('auth', 60);
            $table->string('platform', 20)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->unsignedSmallInteger('failures')->default(0);
            $table->timestamp('last_sent_at')->nullable();
            $table->timestamps();
        });
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('push_reminders')->default(true);
            $table->date('last_reminder_on')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['push_reminders', 'last_reminder_on']);
        });
    }
};
