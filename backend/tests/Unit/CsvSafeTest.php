<?php

namespace Tests\Unit;

use App\Support\CsvSafe;
use PHPUnit\Framework\TestCase;

class CsvSafeTest extends TestCase
{
    public function test_formula_cells_are_prefixed(): void
    {
        foreach (['=1+1', '+SUM(A1)', '-2+3', '@cmd', "\tx", "\rx"] as $v) {
            $this->assertSame("'".$v, CsvSafe::cell($v));
        }
    }

    public function test_safe_cells_unchanged(): void
    {
        $this->assertSame(['أحمد', 'x=1', 5, -3, 2.5, '', null], CsvSafe::row(['أحمد', 'x=1', 5, -3, 2.5, '', null]));
        $o = fopen('php://memory', 'w+');
        fwrite($o, "\xEF\xBB\xBF");
        CsvSafe::put($o, ['=HYPERLINK("x")', 'محمد']);
        rewind($o);
        $this->assertSame("\xEF\xBB\xBF\"'=HYPERLINK(\"\"x\"\")\",محمد\n", stream_get_contents($o));
    }
}
