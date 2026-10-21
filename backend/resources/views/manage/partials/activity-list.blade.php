<ul class="list act">
@forelse ($entries as ['log' => $l, 'items' => $items])
  <li>
    <div class="act-top"><span class="chip grey">{{ $l->label() }}</span><b class="who">{{ $l->user?->name ?? 'زائر' }}</b></div>
    <div class="act-meta">@if ($l->user?->email)<span class="act-mail" dir="ltr" title="{{ $l->user->email }}">{{ $l->user->email }}</span>@else<span class="act-mail"></span>@endif<time class="when" datetime="{{ $l->created_at?->toIso8601String() }}">{{ $ar::when($l->created_at) }}</time></div>
    @if (count($items) > 1)
      <div class="act-items"><small>{{ $ar::num(count($items)) }} مواد في طلب واحد:</small>@foreach ($items as [$code, $name])<span class="pill" title="{{ $code }}">{{ $name ?: $code }}</span>@endforeach</div>
    @elseif ($items)
      <div class="act-sub"><span class="mono" dir="ltr">{{ $items[0][0] }}</span> {{ $items[0][1] }}</div>
    @elseif (($subj = $l->subject === $l->user?->email ? null : $l->subject) || $l->details)
      <div class="act-sub">{{ $subj }}{{ $subj && $l->details ? ' — ' : '' }}{{ $l->details }}</div>
    @endif
    @if (! empty($showIp) && $l->ip)<small class="act-ip" dir="ltr">IP {{ $l->ip }}</small>@endif
  </li>
@empty<li class="hint">لا نشاط بعد.</li>@endforelse
</ul>
