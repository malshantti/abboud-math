<?php

namespace Tests\Unit;

use App\Support\Ar;
use PHPUnit\Framework\TestCase;

class ArCountTest extends TestCase
{
    public function test_agreement_forms(): void
    {
        $this->assertSame('١ سؤال', Ar::count(1, 'سؤال'));
        $this->assertSame('٢ سؤالان', Ar::count(2, 'سؤال'));
        $this->assertSame('٢ دقيقتين', Ar::count(2, 'دقيقة', true));
        $this->assertSame('٦ أسئلة', Ar::count(6, 'سؤال'));
        $this->assertSame('١٠ دقائق', Ar::count(10, 'دقيقة'));
        $this->assertSame('٢ يومان', Ar::count(2, 'يوم'));
        $this->assertSame('١١ يومًا', Ar::count(11, 'يوم'));
        $this->assertSame('٩٩ طالبًا', Ar::count(99, 'طالب'));
        $this->assertSame('١٠٠ طالب', Ar::count(100, 'طالب'));
        $this->assertSame('١٠٣ طلاب', Ar::count(103, 'طالب'));
        $this->assertSame('١١٥ مهمةً', Ar::count(115, 'مهمة'));
        $this->assertSame('٠ واجب', Ar::count(0, 'واجب'));
    }

    public function test_wrong_forms_never_produced(): void
    {
        foreach (array_keys(Ar::NOUNS) as $noun) {
            [$sing, , , $plural, $acc] = Ar::NOUNS[$noun];
            foreach ([3, 6, 10] as $n) $this->assertStringNotContainsString($acc, Ar::count($n, $noun));
            $this->assertStringNotContainsString(' '.$plural, Ar::count(1, $noun));
            $this->assertStringNotContainsString(' '.$plural, Ar::count(25, $noun));
        }
    }

    public function test_unknown_noun_throws(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Ar::count(3, 'زرافة');
    }
}
