{{--
  Line + area chart as inline SVG, one series, time running right to left (RTL).
  $points: list of ['v' => int, 'tip' => string]. $ends: [first label, last label] under the axis.
  $w, $h: viewBox size. $aria: one-line summary for screen readers.
--}}
@php
  $w = $w ?? 600; $h = $h ?? 200; $n = count($points);
  $top = 16; $bottom = 24; $right = 30; $plotH = $h - $top - $bottom; $plotW = $w - $right - 8;
  $rawMax = max(1, max(array_map(fn ($p) => $p['v'], $points ?: [['v' => 0]])));
  $step = $rawMax <= 4 ? 1 : ($rawMax <= 10 ? 2 : (int) ceil($rawMax / 4 / 5) * 5);
  $max = (int) (ceil($rawMax / $step) * $step);
  $xAt = fn ($i) => $plotW - ($n > 1 ? $i * $plotW / ($n - 1) : $plotW / 2);
  $yAt = fn ($v) => $top + $plotH - $v / $max * $plotH;
  $line = collect($points)->map(fn ($p, $i) => sprintf('%s%.1f %.1f', $i ? 'L' : 'M', $xAt($i), $yAt($p['v'])))->implode('');
  $area = $line.sprintf('L%.1f %.1fL%.1f %.1fZ', $xAt($n - 1), $top + $plotH, $xAt(0), $top + $plotH);
  $last = $points[$n - 1] ?? ['v' => 0];
@endphp
<svg class="chart area" viewBox="0 0 {{ $w }} {{ $h }}" role="img" aria-label="{{ $aria ?? '' }}">
  @foreach (range(0, $max, $step) as $t)
    <line class="grid" x1="0" x2="{{ $plotW }}" y1="{{ round($yAt($t), 1) }}" y2="{{ round($yAt($t), 1) }}"/>
    <text class="ax" x="{{ $w - 2 }}" y="{{ round($yAt($t) + 4, 1) }}" text-anchor="end">{{ $t }}</text>
  @endforeach
  <path class="fill" d="{{ $area }}"/>
  <path class="ln" d="{{ $line }}" pathLength="1"/>
  <circle class="end" cx="{{ round($xAt($n - 1), 1) }}" cy="{{ round($yAt($last['v']), 1) }}" r="4.5"/>
  @if (! empty($ends))
    <text class="ax" x="{{ round($xAt(0), 1) }}" y="{{ $h - 6 }}" text-anchor="end">{{ $ends[0] }}</text>
    <text class="ax" x="{{ round($xAt($n - 1), 1) }}" y="{{ $h - 6 }}" text-anchor="start">{{ $ends[1] }}</text>
  @endif
  <g class="hover">
  @foreach ($points as $i => $p)
    <g class="pt" data-tip="{{ $p['tip'] }}"><rect class="hit" x="{{ round($xAt($i) - $plotW / max(1, $n - 1) / 2, 1) }}" y="0" width="{{ round($plotW / max(1, $n - 1), 1) }}" height="{{ $h }}"/><line class="xh" x1="{{ round($xAt($i), 1) }}" x2="{{ round($xAt($i), 1) }}" y1="{{ $top }}" y2="{{ $top + $plotH }}"/><circle class="dot" cx="{{ round($xAt($i), 1) }}" cy="{{ round($yAt($p['v']), 1) }}" r="4.5"/></g>
  @endforeach
  </g>
</svg>
