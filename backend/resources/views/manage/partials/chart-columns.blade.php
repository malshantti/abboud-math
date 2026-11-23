{{--
  Column chart as inline SVG, one series. Time runs right to left (RTL): the first point sits on the right.
  $points: list of ['v' => int, 'tip' => string, 'label' => ?string, 'cap' => bool (value shown on the cap)]
  $w, $h: viewBox size. $axis: show the label row under the columns. $aria: one-line summary for screen readers.
--}}
@php
  $w = $w ?? 300; $h = $h ?? 90; $axis = $axis ?? false; $n = max(1, count($points));
  $top = 18; $bottom = $axis ? 24 : 4; $plotH = $h - $top - $bottom;
  $max = max(1, max(array_map(fn ($p) => $p['v'], $points ?: [['v' => 0]])));
  $slot = $w / $n; $bw = min(24, $slot * 0.62);
  // Rounded data-end (4px) and a square base, as a path.
  $col = function (float $x, float $y, float $bw, float $bh) { $r = min(4, $bw / 2, $bh); return $bh <= 0 ? '' : sprintf('M%.1f %.1fV%.1fQ%.1f %.1f %.1f %.1fH%.1fQ%.1f %.1f %.1f %.1fV%.1fZ', $x, $y + $bh, $y + $r, $x, $y, $x + $r, $y, $x + $bw - $r, $x + $bw, $y, $x + $bw, $y + $r, $y + $bh); };
@endphp
<svg class="chart cols" viewBox="0 0 {{ $w }} {{ $h }}" role="img" aria-label="{{ $aria ?? '' }}">
  <line class="base" x1="0" x2="{{ $w }}" y1="{{ $top + $plotH }}" y2="{{ $top + $plotH }}"/>
  @foreach ($points as $i => $p)
    @php($x = $w - ($i + 0.5) * $slot - $bw / 2)
    @php($bh = $p['v'] ? max(3, $p['v'] / $max * $plotH) : 0)
    @php($y = $top + $plotH - $bh)
    <g class="col" style="--i:{{ $i }}" data-tip="{{ $p['tip'] }}">
      <rect class="hit" x="{{ round($w - ($i + 1) * $slot, 1) }}" y="0" width="{{ round($slot, 1) }}" height="{{ $h }}"/>
      @if ($bh > 0)<path class="mark" d="{{ $col($x, $y, $bw, $bh) }}"/>@else<rect class="zero" x="{{ round($x, 1) }}" y="{{ $top + $plotH - 2 }}" width="{{ round($bw, 1) }}" height="2" rx="1"/>@endif
      @if (! empty($p['cap']) && $p['v'])<text class="cap" x="{{ round($x + $bw / 2, 1) }}" y="{{ round($y - 5, 1) }}" text-anchor="middle">{{ $p['capText'] ?? $p['v'] }}</text>@endif
      @if ($axis && isset($p['label']))<text class="ax" x="{{ round($x + $bw / 2, 1) }}" y="{{ $h - 6 }}" text-anchor="middle">{{ $p['label'] }}</text>@endif
    </g>
  @endforeach
</svg>
