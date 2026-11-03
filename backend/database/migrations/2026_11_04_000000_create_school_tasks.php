<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Schools phase 3: homework, quizzes and quiz attempts. Additive only. */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('school_homework')) {
            Schema::create('school_homework', function (Blueprint $t) {
                $t->id();
                $t->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $t->foreignId('school_section_id')->constrained('school_sections')->cascadeOnDelete();
                $t->unsignedBigInteger('teacher_id')->nullable();
                $t->string('subject', 20);
                $t->string('title', 120);
                $t->json('items');
                $t->timestamp('due_at')->nullable();
                $t->boolean('is_test')->default(false);
                $t->timestamps();
                $t->index(['school_section_id', 'due_at']);
            });
        }
        if (! Schema::hasTable('school_quizzes')) {
            Schema::create('school_quizzes', function (Blueprint $t) {
                $t->id();
                $t->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $t->foreignId('school_section_id')->constrained('school_sections')->cascadeOnDelete();
                $t->unsignedBigInteger('teacher_id')->nullable();
                $t->string('subject', 20);
                $t->string('title', 120);
                $t->json('questions');
                $t->timestamp('starts_at')->nullable();
                $t->timestamp('ends_at')->nullable();
                $t->unsignedSmallInteger('duration_min')->default(15);
                $t->unsignedTinyInteger('attempts')->default(1);
                $t->boolean('shuffle')->default(true);
                $t->string('show_results', 6)->default('now');
                $t->boolean('is_test')->default(false);
                $t->timestamps();
                $t->index(['school_section_id', 'ends_at']);
            });
        }
        if (! Schema::hasTable('school_quiz_attempts')) {
            Schema::create('school_quiz_attempts', function (Blueprint $t) {
                $t->id();
                $t->foreignId('school_quiz_id')->constrained('school_quizzes')->cascadeOnDelete();
                $t->foreignId('student_id')->constrained('students')->cascadeOnDelete();
                $t->unsignedTinyInteger('attempt')->default(1);
                $t->timestamp('started_at');
                $t->timestamp('deadline_at');
                $t->timestamp('submitted_at')->nullable();
                $t->json('layout');
                $t->json('answers')->nullable();
                $t->unsignedSmallInteger('correct')->default(0);
                $t->unsignedSmallInteger('total')->default(0);
                $t->unsignedTinyInteger('score')->nullable();
                $t->unsignedSmallInteger('tab_switches')->default(0);
                $t->boolean('auto_submitted')->default(false);
                $t->timestamps();
                $t->unique(['school_quiz_id', 'student_id', 'attempt']);
            });
        }
        if (Schema::hasTable('students') && ! Schema::hasColumn('students', 'school_seen_at')) {
            Schema::table('students', fn (Blueprint $t) => $t->timestamp('school_seen_at')->nullable());
        }
    }

    public function down(): void
    {
        // additive only
    }
};
