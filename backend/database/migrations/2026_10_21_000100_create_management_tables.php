<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// New tables only.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 60);
            $table->unsignedTinyInteger('grade')->nullable();
            $table->string('avatar', 20)->default('idle');
            $table->string('local_id', 40)->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'local_id']);
            $table->index('last_synced_at');
            $table->index('grade');
        });
        Schema::create('student_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('key', 60);
            $table->longText('value')->nullable();
            $table->unsignedBigInteger('client_updated_at')->default(0);
            $table->timestamps();
            $table->unique(['student_id', 'key']);
        });
        Schema::create('site_settings', function (Blueprint $table) {
            $table->string('key', 60)->primary();
            $table->text('value')->nullable();
            $table->timestamps();
        });
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 60)->index();
            $table->string('subject', 120)->nullable();
            $table->text('details')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });
        Schema::create('trial_claims', function (Blueprint $table) {
            $table->id();
            $table->string('email_hash', 64)->unique();
            $table->timestamp('created_at')->useCurrent();
        });
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->nullable()->constrained()->nullOnDelete();
            $table->string('code', 16)->unique();
            $table->string('plan', 40);
            $table->string('plan_name', 80);
            $table->unsignedInteger('price')->default(0);
            $table->string('currency', 10)->default('');
            $table->unsignedSmallInteger('days');
            $table->string('scope', 80)->nullable();
            $table->string('gateway', 30)->default('whatsapp');
            $table->string('status', 20)->default('pending')->index();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->foreignId('activated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status', 'ends_at']);
            $table->index(['plan', 'status']);
        });
    }

    public function down(): void
    {
        foreach (['subscriptions', 'trial_claims', 'activity_logs', 'site_settings', 'student_progress', 'students'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
