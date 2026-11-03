@forelse ($people as $p)
<li @if($p['excluded']) class="flag" @endif><span class="live-dot" aria-hidden="true"></span><b class="who">{{ $p['name'] }}</b>@if($p['excluded'])<span class="chip">غير محسوب</span>@endif @if($p['new_today'])<span class="chip warn">جديد اليوم</span>@endif @if($p['source'])<span class="chip">{{ $p['source'] }}</span>@endif @if($p['last'])<span class="muted">{{ $p['last'] }}</span>@endif<span class="t">{{ $p['time'] }} · {{ $p['ago'] }}</span>
@if(count($p['students']))<div class="kids">@foreach($p['students'] as $k)<span class="pill kid @if($k['active']) on @endif">{{ $k['name'] }} · {{ $k['grade'] }}</span>@endforeach</div>@endif</li>
@empty<li class="hint">{{ $empty }}</li>@endforelse
