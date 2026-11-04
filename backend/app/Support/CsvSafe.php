<?php

namespace App\Support;

/** Neutralise spreadsheet formula injection in CSV exports (OWASP): string cells starting with = + - @ TAB CR get a leading '. */
class CsvSafe
{
    public static function cell(mixed $v): mixed
    {
        return is_string($v) && $v !== '' && preg_match('/^[=+\-@\t\r]/', $v) ? "'".$v : $v;
    }

    public static function row(array $r): array
    {
        return array_map([self::class, 'cell'], $r);
    }

    /** @param resource $out */
    public static function put($out, array $r): void
    {
        fputcsv($out, self::row($r));
    }
}
