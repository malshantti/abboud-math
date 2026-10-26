<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Teacher classes: a teacher only sees students in classes they are assigned to.
     * Purely additive (new tables), so existing data is untouched; existing teachers start with no class (= no students).
     */
    public function up(): void
    {
        Schema::create('classrooms', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80);
            $table->unsignedTinyInteger('grade')->nullable();
            $table->string('code', 12)->unique();
            $table->boolean('join_open')->default(true);
            $table->timestamps();
        });
        Schema::create('classroom_teacher', function (Blueprint $table) {
            $table->foreignId('classroom_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['classroom_id', 'user_id']);
            $table->index('user_id');
        });
        Schema::create('classroom_student', function (Blueprint $table) {
            $table->foreignId('classroom_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->timestamp('joined_at')->nullable();
            $table->primary(['classroom_id', 'student_id']);
            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classroom_student');
        Schema::dropIfExists('classroom_teacher');
        Schema::dropIfExists('classrooms');
    }
};
