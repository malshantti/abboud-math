<?php

namespace App\Support;

/**
 * Tiny equation renderer for teacher-made quiz questions.
 * Text may contain equations between $…$ using a small LaTeX subset:
 * \frac{a}{b}, \sqrt{x}, \sqrt[n]{x}, x^{2}, x_{1}, \times \div \le \ge \ne \pm \cdot \pi.
 * Rendered on the server to MathML (built into browsers), so students need no JavaScript.
 */
class SchoolMath
{
    private const SYM = ['times' => ['mo', '×'], 'div' => ['mo', '÷'], 'le' => ['mo', '≤'], 'leq' => ['mo', '≤'], 'ge' => ['mo', '≥'], 'geq' => ['mo', '≥'],
        'ne' => ['mo', '≠'], 'neq' => ['mo', '≠'], 'pm' => ['mo', '±'], 'cdot' => ['mo', '·'], 'pi' => ['mi', 'π'], 'degree' => ['mo', '°'], 'circ' => ['mo', '°'],
        'lt' => ['mo', '<'], 'gt' => ['mo', '>'], 'approx' => ['mo', '≈'], 'infty' => ['mi', '∞'], 'angle' => ['mo', '∠'], 'triangle' => ['mo', '△'], '%' => ['mo', '%']];

    public static function has(string $s): bool
    {
        return (bool) preg_match('/\$[^$]+\$/u', $s);
    }

    /** Escaped HTML with $…$ segments turned into MathML. */
    public static function html(?string $s): string
    {
        $s = (string) $s;
        $out = '';
        foreach (preg_split('/(\$[^$]+\$)/u', $s, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY) as $part) {
            $out .= (mb_strlen($part) > 2 && $part[0] === '$' && str_ends_with($part, '$'))
                ? self::math(mb_substr($part, 1, -1)) : e($part);
        }

        return $out;
    }

    public static function math(string $tex): string
    {
        $chars = mb_str_split($tex);
        $i = 0;

        return '<math dir="ltr" class="eq"><mrow>'.self::seq($chars, $i, null).'</mrow></math>';
    }

    private static function seq(array $c, int &$i, ?string $stop): string
    {
        $items = [];
        $n = count($c);
        while ($i < $n) {
            $ch = $c[$i];
            if ($stop !== null && $ch === $stop) {
                $i++;
                break;
            }
            if ($ch === ' ') {
                $i++;

                continue;
            }
            if (($ch === '^' || $ch === '_') && $items) {
                $i++;
                $arg = self::arg($c, $i);
                $base = array_pop($items);
                $items[] = $ch === '^' ? "<msup>$base$arg</msup>" : "<msub>$base$arg</msub>";

                continue;
            }
            $items[] = self::atom($c, $i);
        }

        return implode('', $items);
    }

    /** One argument: {group} or a single atom. */
    private static function arg(array $c, int &$i): string
    {
        while (($c[$i] ?? null) === ' ') {
            $i++;
        }
        if (($c[$i] ?? null) === '{') {
            $i++;

            return '<mrow>'.self::seq($c, $i, '}').'</mrow>';
        }

        return $i < count($c) ? self::atom($c, $i) : '<mrow></mrow>';
    }

    private static function atom(array $c, int &$i): string
    {
        $ch = $c[$i];
        if ($ch === '{') {
            $i++;

            return '<mrow>'.self::seq($c, $i, '}').'</mrow>';
        }
        if ($ch === '\\') {
            $i++;
            $name = '';
            while ($i < count($c) && preg_match('/[a-zA-Z]/', $c[$i])) {
                $name .= $c[$i++];
            }
            if ($name === '' && $i < count($c)) {
                $name = $c[$i++];
            }
            if ($name === 'frac') {
                $a = self::arg($c, $i);

                return '<mfrac>'.$a.self::arg($c, $i).'</mfrac>';
            }
            if ($name === 'sqrt') {
                if (($c[$i] ?? null) === '[') {
                    $i++;
                    $idx = '<mrow>'.self::seq($c, $i, ']').'</mrow>';

                    return '<mroot>'.self::arg($c, $i).$idx.'</mroot>';
                }

                return '<msqrt>'.self::arg($c, $i).'</msqrt>';
            }
            if (isset(self::SYM[$name])) {
                [$t, $v] = self::SYM[$name];

                return "<$t>$v</$t>";
            }

            return '<mi>'.e($name).'</mi>';
        }
        if (preg_match('/[0-9٠-٩]/u', $ch)) {
            $num = '';
            while ($i < count($c) && preg_match('/[0-9٠-٩.,٫]/u', $c[$i])) {
                $num .= $c[$i++];
            }

            return '<mn>'.e(rtrim($num, '.,٫')).'</mn>'.(preg_match('/[.,٫]$/u', $num) ? '<mo>'.e(mb_substr($num, -1)).'</mo>' : '');
        }
        if (preg_match('/\p{Arabic}/u', $ch)) {
            $w = '';
            while ($i < count($c) && preg_match('/\p{Arabic}/u', $c[$i]) && ! preg_match('/[٠-٩٫]/u', $c[$i])) {
                $w .= $c[$i++];
            }

            return '<mi mathvariant="normal">'.e($w).'</mi>';
        }
        $i++;
        if (preg_match('/[a-zA-Zπ∞]/u', $ch)) {
            return '<mi>'.e($ch).'</mi>';
        }

        return '<mo>'.e($ch).'</mo>';
    }

    /** Plain readable text (CSV, answer matching): \frac{a}{b} → a/b, \sqrt{x} → √x. */
    public static function plain(?string $s): string
    {
        $s = (string) $s;
        for ($k = 0; $k < 6; $k++) {
            $s = preg_replace(['/\\\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/u', '/\\\\sqrt\s*\[([^\]]*)\]\s*\{([^{}]*)\}/u', '/\\\\sqrt\s*\{([^{}]*)\}/u', '/\^\{([^{}]*)\}/u', '/_\{([^{}]*)\}/u'],
                ['($1)/($2)', '$1√($2)', '√($1)', '^($1)', '_($1)'], $s);
        }
        $map = [];
        foreach (self::SYM as $k => [, $v]) {
            $map['\\'.$k] = $v;
        }
        uksort($map, fn ($a, $b) => strlen($b) - strlen($a));
        $s = strtr($s, $map);
        $s = preg_replace('/\((\w+|[0-9٠-٩.]+)\)/u', '$1', $s);

        return trim(str_replace(['$', '{', '}'], '', $s));
    }
}
