<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuestionBankTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role): User
    {
        $u = User::factory()->create();
        $u->setRole($role);
        $u->save();

        return $u;
    }

    public function test_import_is_inactive_and_idempotent(): void
    {
        $this->artisan('questions:import', ['file' => 'database/data/questions-g6-math.json'])->assertSuccessful();
        $n = Question::count();
        $this->assertGreaterThan(100, $n);
        $this->assertSame(0, Question::where('active', true)->count());
        $this->artisan('questions:import', ['file' => 'database/data/questions-g6-math.json'])->expectsOutput('imported 0');
        $this->assertSame($n, Question::count());
        $this->getJson('/api/questions/6/math')->assertOk()->assertJsonPath('lessons', []);
    }

    public function test_admin_edits_and_feed_goes_live(): void
    {
        $this->actingAs($this->user('admin'));
        $q = Question::create(['grade' => 6, 'subject' => 'math', 'lesson' => 'S1-1-1', 'lesson_title' => '1-1 أولويات', 'q' => 'قديم', 'choices' => [['t' => '1', 'ok' => true], ['t' => '2']], 'origin' => 'sample']);
        $this->get('/admin/manage/questions?grade=6&subject=math&lesson=S1-1-1')->assertOk()->assertSee('قديم')->assertSee('بنك الأسئلة');
        $this->get('/admin/manage/questions/'.$q->id)->assertOk()->assertSee('قديم');
        $this->put('/admin/manage/questions/'.$q->id, ['grade' => 6, 'subject' => 'math', 'lesson' => 'S1-1-1', 'q' => '(2 + 3) × 4 = ؟',
            'choices' => [['t' => '14', 'm' => 'الأقواس أولًا'], ['t' => '20'], ['t' => ''], ['t' => '24']], 'correct' => 1, 'hint' => 'الأقواس', 'active' => 1])->assertRedirect();
        $q->refresh();
        $this->assertSame([['t' => '14', 'ok' => false, 'm' => 'الأقواس أولًا'], ['t' => '20', 'ok' => true], ['t' => '24', 'ok' => false]], $q->choices);
        $feed = $this->getJson('/api/questions/6/math')->assertOk()->json();
        $this->assertSame('(2 + 3) × 4 = ؟', $feed['lessons']['S1-1-1']['items'][0]['q']);
        $this->assertSame('mix', $feed['lessons']['S1-1-1']['mode']);
        $this->assertTrue($feed['lessons']['S1-1-1']['items'][0]['choices'][1]['ok']);

        $this->post('/admin/manage/questions/mode', ['grade' => 6, 'subject' => 'math', 'lesson' => 'S1-1-1', 'mode' => 'only'])->assertRedirect();
        $this->assertSame('only', $this->getJson('/api/questions/6/math')->json('lessons')['S1-1-1']['mode']);

        $this->put('/admin/manage/questions/'.$q->id, ['grade' => 6, 'subject' => 'math', 'lesson' => 'S1-1-1', 'q' => 'x', 'choices' => [['t' => ''], ['t' => '2']], 'correct' => 0])->assertSessionHasErrors('correct');
        $this->put('/admin/manage/questions/'.$q->id, ['grade' => 6, 'subject' => 'math', 'lesson' => 'S1-1-1', 'q' => 'x', 'choices' => [['t' => '2'], ['t' => '2']], 'correct' => 0])->assertSessionHasErrors('choices');

        $this->post('/admin/manage/questions/'.$q->id.'/toggle')->assertRedirect();
        $this->getJson('/api/questions/6/math')->assertJsonPath('lessons', []);

        $this->post('/admin/manage/questions', ['grade' => 6, 'subject' => 'math', 'lesson' => 'S1-1-2', 'q' => 'جديد', 'choices' => [['t' => 'أ'], ['t' => 'ب']], 'correct' => 0, 'active' => 1])->assertRedirect();
        $this->assertSame('أ', $this->getJson('/api/questions/6/math')->json('lessons')['S1-1-2']['items'][0]['choices'][0]['t']);
        $this->delete('/admin/manage/questions/'.$q->id)->assertRedirect();
        $this->assertModelMissing($q);
    }

    public function test_non_admins_blocked(): void
    {
        Setting::put(['single_device' => '0']);
        $this->actingAs($this->user('teacher'))->get('/admin/manage/questions')->assertForbidden();
        $this->actingAs($this->user('parent'))->getJson('/api/questions/6/math')->assertOk();
        $this->get('/admin/manage/questions')->assertRedirect();
    }
}
