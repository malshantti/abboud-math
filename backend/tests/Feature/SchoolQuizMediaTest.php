<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\SchoolQuiz;
use App\Support\SchoolMath;
use App\Support\SchoolMedia;
use App\Support\Schools;
use App\Support\SchoolTasks;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

/** Quiz builder: images (resized WebP, per-school) and equations ($…$ → MathML). */
class SchoolQuizMediaTest extends TestCase
{
    use RefreshDatabase;

    private function school(string $slug): array
    {
        $this->withoutMiddleware(\App\Http\Middleware\SingleDevice::class);
        $s = School::create(['name' => 'مدرسة '.$slug, 'slug' => $slug, 'is_test' => true]);
        [$t] = Schools::createStaff($s, 'معلم', 'teacher');
        $sec = $s->sections()->create(['grade' => 4, 'name' => 'رابع', 'code' => \App\Models\SchoolSection::newCode()]);
        $sec->teachers()->attach($t->id, ['subjects' => 'math']);
        Schools::createStudents($sec, ['أ1']);

        return [$s, $t, $sec];
    }

    protected function tearDown(): void
    {
        \Illuminate\Support\Facades\File::deleteDirectory(storage_path('app/private/school-media'));
        parent::tearDown();
    }

    public function test_math_renders_and_normalises(): void
    {
        $h = SchoolMath::html('احسب $\frac{3}{4} + x^{2} \le \sqrt{16}$ <script>');
        $this->assertStringContainsString('<mfrac><mrow><mn>3</mn></mrow><mrow><mn>4</mn></mrow></mfrac>', $h);
        $this->assertStringContainsString('<msup><mi mathvariant="normal" class="v">x</mi>', $h);
        $this->assertStringContainsString('<msqrt>', $h);
        $this->assertStringContainsString('&lt;script&gt;', $h);
        $this->assertStringNotContainsString('<script>', SchoolMath::html('$<script>$'));
        $this->assertSame('1/2', SchoolMath::plain('$\frac{1}{2}$'));
        $q = ['type' => 'fill', 'ans' => ['$\frac{1}{2}$', '٠٫٥']];
        $this->assertTrue(SchoolTasks::isRight($q, '1/2'));
        $this->assertTrue(SchoolTasks::isRight($q, '\frac{1}{2}'));
        $this->assertTrue(SchoolTasks::isRight($q, '$\frac{١}{٢}$'));
        $this->assertFalse(SchoolTasks::isRight($q, '1/3'));
        $this->assertSame(['$a|b$', ' ج'], SchoolTasks::splitAns('$a|b$| ج'));
    }

    public function test_image_upload_resized_isolated_and_used_in_quiz(): void
    {
        [$s, $t, $sec] = $this->school('one');
        [$s2, $t2, $sec2] = $this->school('two');
        $url = '/s/one/panel/sections/'.$sec->id.'/quiz-media';
        $this->actingAs($t)->post($url, ['image' => UploadedFile::fake()->create('x.pdf', 10, 'application/pdf')], ['Accept' => 'application/json'])->assertStatus(422);
        $this->actingAs($t)->post($url, ['image' => UploadedFile::fake()->image('big.png', 3000, 1500)->size(7000)], ['Accept' => 'application/json'])->assertStatus(422);
        $r = $this->actingAs($t)->post($url, ['image' => UploadedFile::fake()->image('big.png', 2400, 1200)], ['Accept' => 'application/json'])->assertOk()->json();
        $this->assertMatchesRegularExpression('/^[a-f0-9]{32}\.webp$/', $r['name']);
        $this->assertSame([1200, 600], [$r['w'], $r['h']]);
        [$w, $h, $type] = getimagesize(SchoolMedia::path($s->id, $r['name']));
        $this->assertSame([1200, 600, IMAGETYPE_WEBP], [$w, $h, $type]);
        // another school's teacher cannot upload here, nor see the image
        $this->actingAs($t2)->post($url, ['image' => UploadedFile::fake()->image('a.png', 20, 20)], ['Accept' => 'application/json'])->assertForbidden();
        $this->actingAs($t2)->get('/s/two/media/'.$r['name'])->assertNotFound();
        $this->actingAs($t2)->get('/s/one/media/'.$r['name'])->assertForbidden();
        $this->actingAs($t)->get('/s/one/media/'.$r['name'])->assertOk()->assertHeader('Content-Type', 'image/webp');

        $this->actingAs($t)->get('/s/one/panel/sections/'.$sec->id.'/quizzes/new')->assertOk()->assertSee('school-math.js', false)->assertSee('quiz-media', false);
        $this->actingAs($t)->post('/s/one/panel/sections/'.$sec->id.'/quizzes', [
            'subject' => 'g4-math', 'title' => 'صور ومعادلات',
            'own' => [
                ['type' => 'mcq', 'q' => 'أي كسر يساوي $\frac{1}{2}$؟', 'img' => $r['name'], 'o' => ['$\frac{2}{4}$', '', 'ثلث'], 'oimg' => [null, $r['name'], null], 'a' => '0'],
                ['type' => 'fill', 'q' => '$\sqrt{9} = $ ؟', 'ans' => '٣ | $\sqrt{9}$'],
                ['type' => 'tf', 'q' => '', 'img' => 'ffffffffffffffffffffffffffffffff.webp', 'a' => '1'],
            ],
            'starts' => now('Asia/Gaza')->subMinute()->format('Y-m-d\TH:i'), 'ends' => now('Asia/Gaza')->addDay()->format('Y-m-d\TH:i'),
            'duration' => 10, 'attempts' => 1, 'shuffle' => 0, 'show' => 'now',
        ])->assertRedirect();
        $q = SchoolQuiz::latest('id')->firstOrFail();
        $this->assertCount(2, $q->questions, 'image-only question with a foreign/missing image is dropped');
        $this->assertSame($r['name'], $q->questions[0]['img']);
        $this->assertSame([null, $r['name'], null], $q->questions[0]['oi']);
        $this->assertSame(1, $q->questions[0]['math']);

        $kid = $sec->students()->first();
        $this->actingAs($kid->user)->post('/s/one/me/quiz/'.$q->id.'/start')->assertRedirect();
        $this->get('/s/one/me/quiz/'.$q->id)->assertOk()->assertSee('<mfrac>', false)->assertSee('loading="lazy"', false)->assertSee('school-math.js', false);
        $this->get('/s/one/media/'.$r['name'])->assertOk();
        $this->post('/s/one/me/quiz/'.$q->id.'/submit', ['answers' => [0 => '0', 1 => '\sqrt{9}']])->assertRedirect();
        $this->get('/s/one/me/quiz/'.$q->id.'/result')->assertOk()->assertSee('100');
        $this->actingAs($t)->get('/s/one/panel/sections/'.$sec->id.'/quizzes/'.$q->id)->assertOk()->assertSee('<msqrt>', false)->assertSee('/s/one/media/', false);
        $csv = $this->get('/s/one/panel/sections/'.$sec->id.'/quizzes/'.$q->id.'?format=csv')->streamedContent();
        $this->assertStringContainsString('2/4', $csv);
    }
}
