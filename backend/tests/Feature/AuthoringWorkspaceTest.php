<?php

namespace Tests\Feature;

use App\Models\AuthoringDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthoringWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    private function signIn(): User
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin);

        return $admin;
    }

    private function unit(string $id = 'unit-one'): array
    {
        return ['id' => $id, 'type' => 'unit', 'grade' => 6, 'subject' => 'math', 'term' => 1, 'title' => '', 'description' => '  نص مع فراغات  ', 'order' => 1, 'reference' => ['book' => '', 'page' => null], 'unitId' => null, 'lessonId' => null, 'objectives' => []];
    }

    private function bundle(array $items = []): array
    {
        return ['version' => 'bustan-content-draft-v1', 'items' => $items];
    }

    private function quiz(): array
    {
        return ['version' => 'bustan-quiz-draft-v1', 'metadata' => ['title' => '', 'grade' => 8, 'subject' => 'math', 'durationMinutes' => null], 'questions' => [['id' => 'question-one', 'type' => 'mcq', 'prompt' => '', 'points' => null, 'reference' => ['book' => '', 'page' => null], 'options' => ['', '', '', ''], 'answer' => null]]];
    }

    private function create(array $document, string $kind = 'content', string $title = 'مسودة فحص'): int
    {
        return $this->postJson('/admin/api/documents', compact('document', 'kind', 'title'))->assertCreated()->assertJsonPath('revision', 1)->json('id');
    }

    public function test_workspace_and_assets_reject_guests_and_non_admins(): void
    {
        $this->getJson('/admin/api/summary')->assertUnauthorized();
        $this->postJson('/admin/api/documents', [])->assertUnauthorized();
        $this->get('/admin/assets/dashboard.js')->assertRedirect('/login');
        $this->actingAs(User::factory()->create())->getJson('/admin/api/documents')->assertForbidden();
        $this->get('/admin/assets/catalog.js')->assertForbidden();
    }

    public function test_drafts_are_persisted_with_empty_strings_and_exact_text_without_publishing(): void
    {
        $admin = $this->signIn();
        $document = $this->bundle([$this->unit()]);
        $id = $this->create($document);
        $this->getJson('/admin/api/documents/'.$id)->assertOk()->assertJsonPath('document', $document)->assertJsonPath('counts.unit', 1);
        $this->assertDatabaseHas('authoring_documents', ['id' => $id, 'updated_by' => $admin->id, 'revision' => 1]);
        $this->assertDatabaseCount('admin_activities', 1);
        $response = $this->getJson('/admin/api/documents');
        $response->assertJsonPath('total', 1)->assertJsonMissingPath('data.0.document');
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
    }

    public function test_updates_use_optimistic_revisions_and_do_not_overwrite_a_newer_save(): void
    {
        $this->signIn();
        $id = $this->create($this->bundle());
        $document = $this->bundle([$this->unit()]);
        $this->putJson('/admin/api/documents/'.$id, ['title' => 'تعديل أحدث', 'document' => $document, 'revision' => 1])->assertOk()->assertJsonPath('revision', 2);
        $this->putJson('/admin/api/documents/'.$id, ['title' => 'تعديل قديم', 'document' => $this->bundle(), 'revision' => 1])->assertStatus(409);
        $this->getJson('/admin/api/documents/'.$id)->assertJsonPath('title', 'تعديل أحدث')->assertJsonPath('document', $document);
        $this->assertDatabaseCount('admin_activities', 2);
    }

    public function test_trash_and_restore_preserve_the_document_and_increment_revisions(): void
    {
        $this->signIn();
        $document = $this->quiz();
        $id = $this->create($document, 'quiz');
        $this->deleteJson('/admin/api/documents/'.$id, ['revision' => 1])->assertOk();
        $this->assertSoftDeleted('authoring_documents', ['id' => $id]);
        $this->getJson('/admin/api/documents/'.$id)->assertNotFound();
        $this->getJson('/admin/api/documents?trash=1')->assertJsonPath('total', 1)->assertJsonPath('data.0.revision', 2);
        $this->postJson('/admin/api/documents/'.$id.'/restore', ['revision' => 1])->assertStatus(409);
        $this->postJson('/admin/api/documents/'.$id.'/restore', ['revision' => 2])->assertOk();
        $this->getJson('/admin/api/documents/'.$id)->assertJsonPath('document', $document)->assertJsonPath('revision', 3);
        $this->assertDatabaseCount('admin_activities', 3);
    }

    public function test_library_is_paginated_and_search_treats_wildcards_as_literal_text(): void
    {
        $this->signIn();
        for ($i = 0; $i < 13; $i++) {
            $this->create($this->bundle(), 'content', 'عنوان '.$i);
        }
        $this->create($this->quiz(), 'quiz', 'علامة % _ !');
        $this->getJson('/admin/api/documents')->assertJsonPath('total', 14)->assertJsonCount(12, 'data');
        $this->getJson('/admin/api/documents?page=2')->assertJsonCount(2, 'data');
        $this->getJson('/admin/api/documents?kind=quiz')->assertJsonPath('total', 1);
        $this->getJson('/admin/api/documents?search='.urlencode('% _ !'))->assertJsonPath('total', 1);
        $this->getJson('/admin/api/documents?kind=invalid')->assertUnprocessable();
    }

    public function test_malformed_types_unknown_fields_and_duplicate_ids_cannot_be_saved(): void
    {
        $this->signIn();
        $bad = [];
        $unit = $this->unit();
        $unit['is_admin'] = true;
        $bad[] = $this->bundle([$unit]);
        $unit = $this->unit();
        $unit['title'] = null;
        $bad[] = $this->bundle([$unit]);
        $unit = $this->unit();
        $unit['grade'] = 1;
        $bad[] = $this->bundle([$unit]);
        $bad[] = $this->bundle([$this->unit(), $this->unit()]);
        $bad[] = ['version' => 'wrong', 'items' => []];
        foreach ($bad as $document) {
            $this->postJson('/admin/api/documents', ['kind' => 'content', 'title' => 'غير صالح', 'document' => $document])->assertUnprocessable();
        }
        $this->assertDatabaseCount('authoring_documents', 0);
        $this->assertDatabaseCount('admin_activities', 0);
    }

    public function test_valid_relations_are_saved_but_cross_subject_missing_and_duplicate_step_ids_are_rejected(): void
    {
        $this->signIn();
        $lesson = [...$this->unit('lesson-one'), 'type' => 'lesson', 'unitId' => 'unit-one', 'steps' => [['id' => 'step-one', 'title' => '', 'body' => '']], 'check' => ['prompt' => '', 'options' => ['', '', '', ''], 'answer' => null, 'feedback' => '']];
        unset($lesson['objectives']);
        $document = $this->bundle([$this->unit(), $lesson]);
        $id = $this->create($document);
        $lesson['subject'] = 'science';
        $this->putJson('/admin/api/documents/'.$id, ['title' => 'تعديل', 'document' => $this->bundle([$this->unit(), $lesson]), 'revision' => 1])->assertUnprocessable();
        $lesson['subject'] = 'math';
        $lesson['unitId'] = 'missing-unit';
        $this->postJson('/admin/api/documents', ['kind' => 'content', 'title' => 'فحص', 'document' => $this->bundle([$lesson])])->assertUnprocessable();
        $lesson['unitId'] = 'unit-one';
        $lesson['steps'][] = $lesson['steps'][0];
        $this->postJson('/admin/api/documents', ['kind' => 'content', 'title' => 'فحص', 'document' => $this->bundle([$this->unit(), $lesson])])->assertUnprocessable();
        $this->assertSame($document, AuthoringDocument::findOrFail($id)->document);
    }

    public function test_math_zero_denominators_invalid_tokens_and_quiz_answers_are_rejected(): void
    {
        $this->signIn();
        $document = $this->quiz();
        $document['questions'][0]['math'] = ['version' => 1, 'tokens' => [['kind' => 'fraction', 'numerator' => '١', 'denominator' => '−٠٫٠٠']]];
        $this->postJson('/admin/api/documents', ['kind' => 'quiz', 'title' => 'فحص', 'document' => $document])->assertUnprocessable();
        $document['questions'][0]['math']['tokens'][0]['denominator'] = 'س';
        $id = $this->create($document, 'quiz');
        $document['questions'][0]['answer'] = 4;
        $this->putJson('/admin/api/documents/'.$id, ['title' => 'فحص', 'document' => $document, 'revision' => 1])->assertUnprocessable();
        $document['questions'][0]['answer'] = null;
        $document['questions'][0]['math']['tokens'][0]['kind'] = 'script';
        $this->putJson('/admin/api/documents/'.$id, ['title' => 'فحص', 'document' => $document, 'revision' => 1])->assertUnprocessable();
    }

    public function test_all_editor_templates_and_question_types_round_trip_as_private_drafts(): void
    {
        $this->signIn();
        $common = $this->unit();
        unset($common['objectives']);
        $check = ['prompt' => '', 'options' => ['', '', '', ''], 'answer' => null, 'feedback' => ''];
        $items = [
            $this->unit(),
            [...$common, 'id' => 'lesson-one', 'type' => 'lesson', 'unitId' => 'unit-one', 'steps' => [], 'check' => $check],
            [...$common, 'id' => 'adventure-one', 'type' => 'adventure', 'unitId' => 'unit-one', 'lessonId' => 'lesson-one', 'template' => 'path', 'stages' => [['id' => 'stage-one', ...$check]]],
        ];
        foreach (['fraction' => ['parts' => 4, 'selected' => 2], 'number-line' => ['min' => -10, 'max' => 10, 'point' => 0], 'observe' => ['question' => '', 'observations' => ['']]] as $template => $config) {
            $items[] = [...$common, 'id' => 'lab-'.$template, 'type' => 'lab', 'lessonId' => 'lesson-one', 'template' => $template, 'config' => $config];
        }
        $document = $this->bundle($items);
        $id = $this->create($document);
        $this->getJson('/admin/api/documents/'.$id)->assertJsonPath('document', $document)->assertJsonPath('counts.lab', 3)->assertJsonPath('counts.adventure', 1);

        $quiz = $this->quiz();
        $question = $quiz['questions'][0];
        unset($question['options'], $question['answer']);
        $quiz['questions'][] = [...$question, 'id' => 'question-tf', 'type' => 'tf', 'answer' => false];
        $quiz['questions'][] = [...$question, 'id' => 'question-short', 'type' => 'short', 'acceptedAnswers' => ['', 'إجابة']];
        $id = $this->create($quiz, 'quiz');
        $this->getJson('/admin/api/documents/'.$id)->assertJsonPath('document', $quiz)->assertJsonPath('counts.questions', 3);
    }

    public function test_images_are_decoded_and_checked_for_mime_dimensions_and_external_links(): void
    {
        $this->signIn();
        $raster = imagecreatetruecolor(2, 2);
        ob_start();
        imagepng($raster);
        $bytes = ob_get_clean();
        imagedestroy($raster);
        $image = ['dataUrl' => 'data:image/png;base64,'.base64_encode($bytes), 'mime' => 'image/png', 'width' => 2, 'height' => 2, 'alt' => ''];
        $unit = [...$this->unit(), 'image' => $image];
        $id = $this->create($this->bundle([$unit]));
        foreach (['dimensions', 'mime', 'external', 'corrupt'] as $case) {
            $changed = $unit;
            if ($case === 'dimensions') {
                $changed['image']['width'] = 3;
            }if ($case === 'mime') {
                $changed['image']['mime'] = 'image/jpeg';
            }if ($case === 'external') {
                $changed['image']['dataUrl'] = 'https://example.test/image.png';
            }if ($case === 'corrupt') {
                $changed['image']['dataUrl'] = 'data:image/png;base64,'.base64_encode('not a raster');
            }$this->putJson('/admin/api/documents/'.$id, ['title' => 'فحص', 'document' => $this->bundle([$changed]), 'revision' => 1])->assertUnprocessable();
        }
    }

    public function test_summary_reports_saved_counts_activity_and_real_admin_accounts_only(): void
    {
        $admin = $this->signIn();
        $this->create($this->bundle([$this->unit()]));
        $id = $this->create($this->quiz(), 'quiz');
        $response = $this->getJson('/admin/api/summary')->assertOk()->assertJsonPath('documents', 2)->assertJsonPath('quizzes', 1)->assertJsonPath('counts.unit', 1)->assertJsonPath('counts.questions', 1)->assertJsonPath('admins', 1)->assertJsonPath('accounts.0.email', $admin->email)->assertJsonCount(2, 'activities');
        $response->assertJsonMissingPath('accounts.0.password');
        $this->deleteJson('/admin/api/documents/'.$id, ['revision' => 1])->assertOk();
        $this->getJson('/admin/api/summary')->assertJsonPath('documents', 1)->assertJsonPath('trash', 1)->assertJsonPath('counts.questions', 0);
    }

    public function test_asset_allowlist_and_private_headers_prevent_arbitrary_file_reads(): void
    {
        $this->signIn();
        $response = $this->get('/admin/assets/dashboard.js')->assertOk()->assertHeader('Content-Type', 'text/javascript; charset=UTF-8');
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $this->get('/admin/assets/.env')->assertNotFound();
        $this->get('/admin/assets/profiles.js')->assertNotFound();
        $this->get('/admin/assets/sw.js')->assertNotFound();
    }

    public function test_workspace_mutations_require_csrf_in_the_real_middleware(): void
    {
        $this->signIn();
        $this->app->detectEnvironment(fn () => 'local');
        $this->postJson('/admin/api/documents', ['kind' => 'content', 'title' => 'فحص', 'document' => $this->bundle()])->assertStatus(419);
        $this->assertDatabaseCount('authoring_documents', 0);
    }
}
