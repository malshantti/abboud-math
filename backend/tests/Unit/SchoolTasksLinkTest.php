<?php

namespace Tests\Unit;

use App\Support\SchoolTasks;
use Tests\TestCase;

class SchoolTasksLinkTest extends TestCase
{
    public function test_grade6_homework_links_match_site_routes(): void
    {
        $this->assertStringContainsString(rawurlencode('g6/math/#/lesson/S1-1-1'), SchoolTasks::link('g6-math', 'S1-1-1'));
        $this->assertStringContainsString(rawurlencode('g6/arabic/#/u/P1U1'), SchoolTasks::link('g6-arabic', 'P1U1L1'));
        $this->assertStringContainsString(rawurlencode('g6/english/#/u/U3'), SchoolTasks::link('g6-english', 'U3L1'));
        $this->assertStringContainsString(rawurlencode('g4/math/#/u/U1L1'), SchoolTasks::link('g4-math', 'U1L1'));
    }
}
