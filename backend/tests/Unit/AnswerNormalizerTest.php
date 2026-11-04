<?php

namespace Tests\Unit;

use App\Support\SchoolTasks;
use PHPUnit\Framework\TestCase;

class AnswerNormalizerTest extends TestCase
{
    public static function accepted(): array
    {
        return [
            ['0.5', '1/2'], ['١/٢', '0.5'], ['٠٫٥', '1/2'], ['0,5', '½'], ['.5', '0.5'], ['0.50', '1/2'], ['2/4', '1/2'],
            ['$\\frac{1}{2}$', '0.5'], ['1 1/2', '1.5'], ['١ ١/٢', '3/2'], ['  15 ', '١٥'], ['1,500', '1500'], ['١٥٠٠', '1,500'],
            ['-3', '−3'], ['15.', '15'], ['7', '07'],
            ['الكتاب', 'كتاب'], ['كتاب', 'الكتاب'], ['أسد', 'اسد'], ['إبراهيم', 'ابراهيم'], ['مدرسة', 'مدرسه'], ['مستشفى', 'مستشفي'],
            ['كَتَبَ', 'كتب'], ['القمرُ', 'قمر'], ['  الشمس   المشرقة ', 'شمس مشرقة'], ['آمن', 'امن'], ['Cat', 'cat'], ['خمسة عشر', 'خمسة عشر'],
            ['الطويلة؟', 'طويلة'],
        ];
    }

    public static function rejected(): array
    {
        return [
            ['5', '0.5'], ['2/1', '1/2'], ['1/3', '0.33'], ['0.3', '1/3'], ['-0.5', '0.5'], ['1.5', '15'], ['15', '150'], ['1/0', '0'],
            ['11/2', '1 1/2'], ['1,5', '15'], ['12', '1/2'], ['', '0'], ['0', ''],
            ['كتب', 'كتاب'], ['قمري', 'قمر'], ['الكتب', 'كتاب'], ['ال', ''], ['الل', 'ل'], ['شمس', 'شمس مشرقة'], ['dog', 'dogs'],
            ['ثلاثة', '3'], ['3', 'ثلاثة'], ['التين', 'تين زيتون'], ['ب', 'باب'], ['cat', 'الcat'],
        ];
    }

    /** @dataProvider accepted */
    public function test_equivalent_answers_are_accepted(string $given, string $expected): void
    {
        $this->assertTrue(SchoolTasks::answerMatches($given, $expected), "«$given» should match «$expected»");
    }

    /** @dataProvider rejected */
    public function test_wrong_answers_are_rejected(string $given, string $expected): void
    {
        $this->assertFalse(SchoolTasks::answerMatches($given, $expected), "«$given» must not match «$expected»");
    }

    public function test_is_right_uses_all_accepted_answers_and_option_values(): void
    {
        $fill = ['type' => 'fill', 'ans' => ['15', 'خمسة عشر']];
        $this->assertTrue(SchoolTasks::isRight($fill, '١٥'));
        $this->assertTrue(SchoolTasks::isRight($fill, 'خمسةَ عشرَ'));
        $this->assertFalse(SchoolTasks::isRight($fill, '51'));
        $this->assertFalse(SchoolTasks::isRight($fill, null));
        $mcq = ['type' => 'mcq', 'o' => ['a', 'b', 'c'], 'a' => 2];
        $this->assertTrue(SchoolTasks::isRight($mcq, '2'));
        $this->assertFalse(SchoolTasks::isRight($mcq, '0'));
    }
}
