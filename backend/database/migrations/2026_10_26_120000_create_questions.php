<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $t) {
            $t->id();
            $t->unsignedTinyInteger('grade');
            $t->string('subject', 20);
            $t->string('lesson', 40);
            $t->string('lesson_title', 190)->nullable();
            $t->string('unit', 190)->nullable();
            $t->unsignedInteger('position')->default(0);
            $t->text('q');
            $t->json('choices');
            $t->text('hint')->nullable();
            $t->text('explain')->nullable();
            $t->string('image', 300)->nullable();
            $t->boolean('active')->default(false);
            $t->string('origin', 10)->default('admin'); // sample = عيّنة من المولّد، admin = كتبه المدير
            $t->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
            $t->index(['grade', 'subject', 'lesson']);
        });
        Schema::create('question_lessons', function (Blueprint $t) {
            $t->id();
            $t->unsignedTinyInteger('grade');
            $t->string('subject', 20);
            $t->string('lesson', 40);
            $t->string('mode', 8)->default('mix'); // mix = مع المولّد، only = البنك فقط
            $t->timestamps();
            $t->unique(['grade', 'subject', 'lesson']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_lessons');
        Schema::dropIfExists('questions');
    }
};
