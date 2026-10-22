{!! $m['site'] !!}
{!! str_repeat('=', 24) !!}

@foreach ($m['paragraphs'] as $p)
{!! $p !!}

@endforeach
{!! $m['button'] !!}:
{!! $m['link'] !!}

@if ($m['whatsapp'])
واتساب: {!! $m['whatsapp'] !!}

@endif
{!! $m['note'] !!}

--
{!! $m['site'] !!} — {!! $m['site_url'] !!}
