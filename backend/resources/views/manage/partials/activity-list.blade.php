{{-- Activity feed: one line per entry under day headings; email and IP only on the full log. --}}
@php($tz = config('app.display_timezone', 'Asia/Gaza'))
@php($today = now($tz)->startOfDay())
@php($lastDay = null)
<ol class="feed">
@forelse ($entries as ['log' => $l, 'items' => $items, 'count' => $count])
  @php($at = $l->created_at?->copy()->timezone($tz))
  @php($day = $at?->format('Y-m-d'))
  @if ($day !== $lastDay)
    @php($lastDay = $day)
    <li class="feed-day">{{ ! $at ? '—' : ($at->isSameDay($today) ? 'اليوم' : ($at->isSameDay($today->copy()->subDay()) ? 'أمس' : $ar::date($at, false))) }}</li>
  @endif
  @php($obj = $items ? null : $l->object())
  <li class="ev t-{{ $l->tone() }}">
    <span class="ev-ic">@include('partials.admin-icon', ['name' => $l->icon()])</span>
    <div class="ev-body">
      <p class="ev-line">
        @if ($l->user)
          @can('manage-site')<a class="who" href="{{ route('manage.user', $l->user) }}" title="{{ $l->user->email }}">{{ $l->user->name }}</a>@else<b class="who" title="{{ $l->user->email }}">{{ $l->user->name }}</b>@endcan
        @else<b class="who">زائر</b>@endif
        <span class="ev-what">{{ $l->label() }}</span>
        @if ($obj)<span class="ev-obj"@if (str_starts_with($l->action, 'subscription.') && $l->subject) title="{{ $l->subject }}"@endif>{{ $obj }}</span>@endif
        @if ($count > 1)<span class="ev-n" dir="ltr" title="تكرّر {{ $ar::num($count) }} مرات متتالية">×{{ $ar::num($count) }}</span>@endif
      </p>
      @if (count($items) > 1)
        <div class="act-items"><small>{{ $ar::num(count($items)) }} مواد في طلب واحد:</small>@foreach ($items as [$code, $name])<span class="pill" title="{{ $code }}">{{ $name ?: $code }}</span>@endforeach</div>
      @elseif ($items)
        <div class="act-items"><span class="pill" title="{{ $items[0][0] }}">{{ $items[0][1] ?: $items[0][0] }}</span></div>
      @endif
      @if (! empty($showIp) && ($l->user?->email || $l->ip))
        <small class="ev-meta" dir="ltr">{{ $l->user?->email }}{{ $l->user?->email && $l->ip ? ' · ' : '' }}{{ $l->ip ? 'IP '.$l->ip : '' }}</small>
      @endif
    </div>
    <time class="ev-time" datetime="{{ $l->created_at?->toIso8601String() }}" title="{{ $ar::date($l->created_at) }}">{{ $at ? $ar::num($at->format('h:i')).' '.($at->format('A') === 'AM' ? 'ص' : 'م') : '—' }}</time>
  </li>
@empty<li class="hint">لا نشاط بعد.</li>@endforelse
</ol>
