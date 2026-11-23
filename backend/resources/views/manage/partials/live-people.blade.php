{{-- One row per family: online ones first (green dot, «متصل الآن»), the rest with their last time today. Mirrored by row() in live.blade.php. --}}
@forelse ($people as $p)
@php($on = in_array($p['id'], $onlineIds ?? [], true))
<li class="pp{{ $on ? ' on' : '' }}{{ $p['excluded'] ? ' flag' : '' }}" data-id="{{ $p['id'] }}">
  <span class="pp-dot" aria-hidden="true"></span>
  <div class="pp-main">
    <p class="pp-line"><b class="who">{{ $p['name'] }}</b>@if ($p['excluded'])<span class="tag">غير محسوب</span>@endif @if ($p['new_today'])<span class="tag new">جديد اليوم</span>@endif @if ($p['source'] || $p['last'])<span class="pp-meta">{{ implode(' · ', array_filter([$p['source'] ? 'من '.$p['source'] : null, $p['last']])) }}</span>@endif</p>
    @if (count($p['students']))<p class="pp-kids">@foreach ($p['students'] as $k)<span class="kid{{ $k['active'] ? ' on' : '' }}">{{ $k['name'] }} <small>{{ $k['grade'] }}</small></span>@endforeach</p>@endif
  </div>
  <span class="pp-time">@if ($on)<b>متصل الآن</b>@else{{ $p['time'] }}<small>{{ $p['ago'] }}</small>@endif</span>
</li>
@empty<li class="hint">{{ $empty }}</li>@endforelse
