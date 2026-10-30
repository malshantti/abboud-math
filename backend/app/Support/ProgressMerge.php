<?php

namespace App\Support;

/**
 * Two devices of one student: merge their progress instead of letting the newer upload replace the older one.
 * Only the lesson engine blob of grades 3–8 (done/seen/days…) and the parent report log are merged; other
 * schemas (g6/g8 math app, g6 english app, settings) keep last-write-wins as before.
 */
class ProgressMerge
{
    /** Merge $new into $old. $newIsNewer decides scalar fields that cannot be combined. Returns null when not mergeable. */
    public static function merge(string $key, ?string $old, ?string $new, bool $newIsNewer): ?string
    {
        if ($old === null || $new === null || $old === $new) {
            return null;
        }
        $a = json_decode($old, true);
        $b = json_decode($new, true);
        if (! is_array($a) || ! is_array($b) || array_is_list($a) || array_is_list($b)) {
            return null;
        }
        if ($key === 'bustan_report_v1') {
            $m = self::deep($a, $b, $newIsNewer);
        } elseif (preg_match('/^bustan_g\d+_[a-z]+_v1$/', $key) && is_array($a['done'] ?? null) && is_array($b['done'] ?? null)) {
            $m = self::engine($a, $b, $newIsNewer);
        } else {
            return null;
        }

        return json_encode($m, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /** core.js blob: per-lesson best score, union of seen/days/achievements/log, counters keep the larger value. */
    private static function engine(array $a, array $b, bool $newIsNewer): array
    {
        $out = $newIsNewer ? array_replace($a, $b) : array_replace($b, $a);
        foreach (['xp', 'qs', 'ok', 'rounds'] as $f) {
            if (is_numeric($a[$f] ?? null) && is_numeric($b[$f] ?? null)) {
                $out[$f] = max($a[$f], $b[$f]);
            }
        }
        foreach (['done', 'seen', 'days', 'completed', 'labn', 'std'] as $f) {
            if (is_array($a[$f] ?? null) && is_array($b[$f] ?? null)) {
                $out[$f] = self::deep($a[$f], $b[$f], $newIsNewer);
            }
        }
        foreach (['ach', 'log'] as $f) {
            if (is_array($a[$f] ?? null) && is_array($b[$f] ?? null) && array_is_list($a[$f]) && array_is_list($b[$f])) {
                $out[$f] = self::union($a[$f], $b[$f]);
            }
        }

        return $out;
    }

    /** Recursive: numbers → max, maps → key union, lists → union, other scalars → the newer side. */
    private static function deep(array $a, array $b, bool $newIsNewer): array
    {
        if (array_is_list($a) && array_is_list($b)) {
            return self::union($a, $b);
        }
        $out = $a;
        foreach ($b as $k => $v) {
            if (! array_key_exists($k, $a)) {
                $out[$k] = $v;
            } elseif (is_array($a[$k]) && is_array($v) && $a[$k] !== [] && $v !== [] && array_is_list($a[$k]) === array_is_list($v)) {
                $out[$k] = self::deep($a[$k], $v, $newIsNewer);
            } elseif ((is_int($a[$k]) || is_float($a[$k])) && (is_int($v) || is_float($v))) {
                $out[$k] = max($a[$k], $v);
            } elseif (is_array($a[$k]) && $a[$k] === []) {
                $out[$k] = $v;
            } elseif (! (is_array($v) && $v === [])) {
                $out[$k] = $newIsNewer ? $v : $a[$k];
            }
        }

        return $out;
    }

    /** Union of two lists without duplicates; entries with a time field "t" stay in time order; at most 200 like the client. */
    private static function union(array $a, array $b): array
    {
        $seen = [];
        $out = [];
        foreach (array_merge($a, $b) as $x) {
            $h = json_encode($x);
            if (! isset($seen[$h])) {
                $seen[$h] = true;
                $out[] = $x;
            }
        }
        if ($out && is_array($out[0]) && isset($out[0]['t'])) {
            usort($out, fn ($x, $y) => ($x['t'] ?? 0) <=> ($y['t'] ?? 0));
            if (count($out) > 200) {
                $out = array_slice($out, -200); // the client keeps the last 200 log entries
            }
        }

        return $out;
    }
}
