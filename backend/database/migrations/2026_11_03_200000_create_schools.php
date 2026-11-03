<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Schools phase 1 — additive only: new tables + nullable columns. Existing families, students and progress are untouched.
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('schools')) {
            Schema::create('schools', function (Blueprint $t) {
                $t->id();
                $t->string('name', 120);
                $t->string('slug', 60)->unique();
                $t->string('logo_path', 160)->nullable();
                $t->string('color', 9)->default('#6f9e23');
                $t->string('color2', 9)->default('#ffc83d');
                $t->boolean('is_test')->default(false);
                $t->timestamps();
            });
        }
        if (! Schema::hasTable('school_sections')) {
            Schema::create('school_sections', function (Blueprint $t) {
                $t->id();
                $t->foreignId('school_id')->constrained()->cascadeOnDelete();
                $t->unsignedTinyInteger('grade');
                $t->string('name', 60);
                $t->string('code', 12)->unique();
                $t->timestamps();
                $t->index(['school_id', 'grade']);
            });
        }
        if (! Schema::hasTable('school_section_teacher')) {
            Schema::create('school_section_teacher', function (Blueprint $t) {
                $t->foreignId('school_section_id')->constrained()->cascadeOnDelete();
                $t->foreignId('user_id')->constrained()->cascadeOnDelete();
                $t->string('subjects', 120)->nullable();
                $t->primary(['school_section_id', 'user_id']);
                $t->index('user_id');
            });
        }
        Schema::table('users', function (Blueprint $t) {
            if (! Schema::hasColumn('users', 'school_id')) {
                $t->unsignedBigInteger('school_id')->nullable()->index();
            }
            if (! Schema::hasColumn('users', 'school_role')) {
                $t->string('school_role', 12)->nullable();
            }
            if (! Schema::hasColumn('users', 'school_logout_at')) {
                $t->timestamp('school_logout_at')->nullable();
            }
            if (! Schema::hasColumn('users', 'username')) {
                $t->string('username', 40)->nullable()->unique();
            }
        });
        Schema::table('students', function (Blueprint $t) {
            if (! Schema::hasColumn('students', 'school_section_id')) {
                $t->unsignedBigInteger('school_section_id')->nullable()->index();
            }
            if (! Schema::hasColumn('students', 'pin_enc')) {
                $t->text('pin_enc')->nullable();
            }
            if (! Schema::hasColumn('students', 'pin_fails')) {
                $t->unsignedTinyInteger('pin_fails')->default(0);
            }
            if (! Schema::hasColumn('students', 'pin_locked_until')) {
                $t->timestamp('pin_locked_until')->nullable();
            }
        });
    }

    public function down(): void
    {
        // Additive migration: nothing is dropped on rollback.
    }
};
