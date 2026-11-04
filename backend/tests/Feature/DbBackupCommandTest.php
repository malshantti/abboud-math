<?php

namespace Tests\Feature;

use Tests\TestCase;

class DbBackupCommandTest extends TestCase
{
    public function test_command_is_registered_and_refuses_non_mysql(): void
    {
        config(['database.default' => 'sqlite']);
        $this->artisan('db:backup')->assertExitCode(1);
    }
}
