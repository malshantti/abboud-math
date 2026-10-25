<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// نسخ منشورة (لقطات ثابتة) من مسودات منشئ المحتوى والاختبارات. نسخة واحدة نشطة لكل مسودة على الأكثر.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_publications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('authoring_documents');
            $table->string('kind', 16);
            $table->unsignedInteger('version');
            $table->unsignedInteger('revision');
            $table->string('title', 160);
            $table->json('payload');
            $table->json('scope');
            $table->boolean('active')->default(false)->index();
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['document_id', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_publications');
    }
};
