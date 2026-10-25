<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentPublishTest extends TestCase
{
    use RefreshDatabase;

    private function lesson(string $title = 'درس منشور', string $prompt = 'كم يساوي ٢ + ٢؟'): array
    {
        return ['version' => 'bustan-content-draft-v1', 'items' => [[
            'id' => 'lesson-one', 'type' => 'lesson', 'grade' => 6, 'subject' => 'math', 'term' => 1, 'title' => $title, 'description' => 'وصف', 'order' => 1,
            'reference' => ['book' => '', 'page' => null], 'unitId' => null, 'lessonId' => null,
            'steps' => [['id' => 'step-one', 'title' => 'فكرة', 'body' => 'نجمع العددين.']],
            'check' => ['prompt' => $prompt, 'options' => ['٣', '٤', '٥', '٦'], 'answer' => 1, 'feedback' => 'أحسنت'],
        ]]];
    }

    public function test_publish_unpublish_and_rollback(): void
    {
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $id = $this->postJson('/admin/api/documents', ['kind' => 'content', 'title' => 'حزمة', 'document' => $this->lesson()])->assertCreated()->json('id');
        $this->getJson('/api/public/content?grade=6&subject=math')->assertOk()->assertJsonCount(0, 'items');
        $this->postJson("/admin/api/documents/$id/publish", ['revision' => 1])->assertCreated()->assertJsonPath('version', 1);
        $this->getJson('/api/public/content?grade=6&subject=math')->assertJsonPath('items.0.title', 'درس منشور');
        $this->getJson('/api/public/content?grade=8&subject=math')->assertJsonCount(0, 'items');

        $this->putJson("/admin/api/documents/$id", ['title' => 'حزمة', 'document' => $this->lesson('درس معدّل'), 'revision' => 1])->assertOk();
        $this->getJson('/api/public/content?grade=6&subject=math')->assertJsonPath('items.0.title', 'درس منشور');
        $this->postJson("/admin/api/documents/$id/publish", ['revision' => 1])->assertStatus(409);
        $this->postJson("/admin/api/documents/$id/publish", ['revision' => 2])->assertCreated()->assertJsonPath('version', 2);
        $this->getJson('/api/public/content?grade=6&subject=math')->assertJsonPath('items.0.title', 'درس معدّل');
        $this->getJson('/admin/api/documents')->assertJsonPath('data.0.published_version', 2);

        $first = $this->getJson("/admin/api/documents/$id/publications")->assertJsonCount(2, 'publications')->json('publications.1.id');
        $this->postJson("/admin/api/publications/$first/activate")->assertOk();
        $this->getJson('/api/public/content?grade=6&subject=math')->assertJsonPath('items.0.title', 'درس منشور');

        $this->postJson("/admin/api/documents/$id/unpublish")->assertOk();
        $this->getJson('/api/public/content?grade=6&subject=math')->assertJsonCount(0, 'items');
    }

    public function test_incomplete_drafts_cannot_be_published_and_guests_are_rejected(): void
    {
        $this->postJson('/admin/api/documents/1/publish', ['revision' => 1])->assertUnauthorized();
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $id = $this->postJson('/admin/api/documents', ['kind' => 'content', 'title' => 'ناقصة', 'document' => $this->lesson('درس', '')])->assertCreated()->json('id');
        $this->postJson("/admin/api/documents/$id/publish", ['revision' => 1])->assertStatus(422);
        $this->getJson('/api/public/content?grade=7&subject=math')->assertStatus(422);
    }
}
