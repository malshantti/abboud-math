@extends('layouts.manage')
@section('title', 'لوحة المعلومات')
@section('content')
<div class="head"><h1>لوحة المعلومات</h1>@can('manage-site')<div class="row"><a class="btn ghost small" href="{{ route('manage.export','users') }}">تصدير المستخدمين</a><a class="btn ghost small" href="{{ route('manage.export','students') }}">تصدير الطلاب</a><a class="btn ghost small" href="{{ route('manage.export','progress') }}">تصدير التقدّم</a><a class="btn ghost small" href="{{ route('manage.export','subscriptions') }}">تصدير الاشتراكات</a></div>@endcan</div>
<div class="stats">
  @foreach ([['parents','أولياء الأمور'],['students','الطلاب'],['new_week','حسابات جديدة هذا الأسبوع'],['active_week','طلاب نشطون هذا الأسبوع'],['trials','في فترة تجريبية'],['subs_active','اشتراكات فعّالة'],['subs_pending','طلبات بانتظار الدفع'],['staff','المشرفون والمعلّمون'],['disabled','حسابات معطّلة'],['drafts','مسودات المحتوى']] as [$k,$label])
  <div class="stat"><b>{{ $ar::num($stats[$k]) }}</b><span>{{ $label }}</span></div>
  @endforeach
</div>
<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));margin-top:18px">
  <section class="card"><h2 style="margin-top:0">الطلاب حسب الصف</h2>
    @php($max = max(1, $byGrade->max() ?? 1))
    @foreach ($ar::GRADES + [0 => 'غير محدد'] as $g => $label)
      @php($n = $byGrade[$g ?: null] ?? ($g === 0 ? ($byGrade[''] ?? 0) : 0))
      <div style="margin:8px 0"><div class="row" style="justify-content:space-between"><span>{{ $label }}</span><b>{{ $ar::num($n) }}</b></div><div class="bar" style="width:{{ max(2, $n / $max * 100) }}%"></div></div>
    @endforeach
  </section>
  <section class="card"><h2 style="margin-top:0">طلاب لديهم تقدّم في كل مادة</h2>
    <table><tbody>
    @foreach ($ar::KEYS as $key => [$g, $subj])
      @if (isset($bySubject[$key]))<tr><td>{{ $subj }} — {{ $ar::grade($g) }}</td><td>{{ $ar::num($bySubject[$key]) }}</td></tr>@endif
    @endforeach
    @if (empty($bySubject))<tr><td>لا يوجد تقدّم متزامن بعد.</td></tr>@endif
    </tbody></table>
  </section>
  @can('manage-site')
  <section class="card"><h2 style="margin-top:0">طلبات اشتراك جديدة</h2>
    @forelse ($pending as $s)<p><b dir="ltr">{{ $s->code }}</b> — {{ $s->user?->name }} — {{ $s->plan_name }} <a href="{{ route('manage.subscriptions', ['q' => $s->code]) }}">مراجعة</a></p>
    @empty<p>لا طلبات معلّقة.</p>@endforelse
  </section>
  <section class="card"><h2 style="margin-top:0">آخر النشاط</h2>
    @foreach ($recent as $l)<p style="margin:4px 0"><span class="chip grey">{{ $l->label() }}</span> {{ $l->user?->name ?? 'زائر' }} {{ $l->subject ? '— '.$l->subject : '' }} <small class="hint">{{ $ar::date($l->created_at) }}</small></p>@endforeach
    <p><a href="{{ route('manage.activity') }}">السجل كاملًا</a></p>
  </section>
  @endcan
</div>
@endsection
