<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('authoring_documents', function (Blueprint $table) {
            $table->id();
            $table->string('kind', 16)->index();
            $table->string('title', 160);
            $table->json('document');
            $table->json('counts');
            $table->unsignedInteger('revision')->default(1);
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('admin_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('document_id')->constrained('authoring_documents');
            $table->string('action', 16);
            $table->string('title', 160);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_activities');
        Schema::dropIfExists('authoring_documents');
    }
};
