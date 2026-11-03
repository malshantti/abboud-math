<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('school_challenges')) {
            Schema::create('school_challenges', function (Blueprint $t) {
                $t->id();
                $t->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $t->string('title', 120);
                $t->string('metric', 20); // stars | days | minutes | homework
                $t->json('section_ids');
                $t->date('starts_on');
                $t->date('ends_on');
                $t->boolean('is_test')->default(false);
                $t->timestamps();
                $t->index(['school_id', 'ends_on']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('school_challenges');
    }
};
