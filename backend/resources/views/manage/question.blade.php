@extends('layouts.manage')
@section('title', $question->exists ? 'تعديل سؤال' : 'سؤال جديد')
@section('content')
@php($site = rtrim((string) config('app.student_site_url'), '/').'/')
@php($choices = old('choices', $question->choices ?: []))
@php($correct = (int) old('correct', $question->correctIndex() ?? 0))
@while (count($choices) < 4) @php($choices[] = ['t' => '', 'm' => '']) @endwhile
<div class="head"><h1>{{ $question->exists ? 'تعديل سؤال' : 'سؤال جديد' }}</h1><a class="btn ghost small" href="{{ route('manage.questions', ['grade'=>$question->grade,'subject'=>$question->subject,'lesson'=>$question->lesson]) }}">@include('partials.admin-icon',['name'=>'back'])العودة إلى البنك</a></div>
@if ($errors->any())<p class="alert err" role="alert">{{ $errors->first() }}</p>@endif
<form method="post" enctype="multipart/form-data" action="{{ $question->exists ? route('manage.questions.update', $question) : route('manage.questions.store') }}" class="card">@csrf @if($question->exists) @method('put') @endif
<div class="filters" style="margin:0 0 12px">
  <div><label for="grade">الصف</label><select id="grade" name="grade">@foreach (\App\Models\Setting::gradeOptions() as $g => $l)<option value="{{ $g }}" @selected((int) old('grade', $question->grade) === $g)>{{ $l }}</option>@endforeach</select></div>
  <div><label for="subject">المادة</label><select id="subject" name="subject">@foreach ($subjects as $k => $l)<option value="{{ $k }}" @selected(old('subject', $question->subject) === $k)>{{ $l }}</option>@endforeach</select></div>
  <div><label for="lesson">رمز الدرس</label><input id="lesson" name="lesson" value="{{ old('lesson', $question->lesson) }}" required dir="ltr" placeholder="S1-1-1" maxlength="40"></div>
  <div><label for="lt">اسم الدرس</label><input id="lt" name="lesson_title" value="{{ old('lesson_title', $question->lesson_title) }}" maxlength="190"></div>
</div>
<div class="field"><label for="qq">نص السؤال</label><textarea id="qq" name="q" rows="3" required maxlength="2000">{{ old('q', $question->q) }}</textarea></div>
<fieldset class="field" style="border:0;padding:0"><legend><b>الخيارات</b> — حدّد الإجابة الصحيحة، واكتب لكل خيار خاطئ سبب الخطأ (يظهر للطالب). اترك الخيار فارغًا لحذفه.</legend>
@foreach ($choices as $i => $c)
<div style="display:grid;grid-template-columns:auto 1fr 1.4fr;gap:8px;align-items:center;margin:6px 0">
  <label style="display:flex;gap:6px;align-items:center"><input type="radio" name="correct" value="{{ $i }}" @checked($correct === $i)> صحيحة</label>
  <input name="choices[{{ $i }}][t]" value="{{ $c['t'] ?? '' }}" maxlength="300" aria-label="الخيار {{ $i + 1 }}" placeholder="الخيار {{ $i + 1 }}">
  <input name="choices[{{ $i }}][m]" value="{{ $c['m'] ?? '' }}" maxlength="500" aria-label="سبب الخطأ {{ $i + 1 }}" placeholder="سبب الخطأ إن اختاره الطالب">
</div>
@endforeach
</fieldset>
<div class="field"><label for="hint">تلميح</label><input id="hint" name="hint" value="{{ old('hint', $question->hint) }}" maxlength="1000"></div>
<div class="field"><label for="ex">شرح بعد الإجابة (اختياري)</label><textarea id="ex" name="explain" rows="2" maxlength="2000">{{ old('explain', $question->explain) }}</textarea></div>
<div class="field"><label>صورة السؤال (اختيارية)</label>
  @if ($question->image)<p><img src="{{ $site.$question->image }}" alt="" style="max-width:260px;max-height:180px;border-radius:10px;border:1px solid #e2e7d9"><br><label><input type="checkbox" name="remove_image" value="1"> إزالة الصورة</label></p>@endif
  <input type="file" name="image_file" accept="image/png,image/jpeg,image/webp,image/gif">
  <p class="hint">أو اكتب مسار صورة من <a href="{{ route('manage.media') }}" target="_blank">مكتبة الوسائط</a>:</p>
  <input name="image" value="{{ old('image', $question->image) }}" dir="ltr" placeholder="media/u/shape-1a2b3c.webp" maxlength="300">
</div>
<div class="field"><label><input type="checkbox" name="active" value="1" @checked(old('active', $question->active))> مفعّل — يظهر للطلاب</label></div>
<button class="btn" type="submit">@include('partials.admin-icon',['name'=>'save'])حفظ</button>
</form>
@if ($question->exists)
<form method="post" action="{{ route('manage.questions.destroy', $question) }}" style="margin-top:12px" onsubmit="return confirm('حذف هذا السؤال نهائيًا؟')">@csrf @method('delete')<button class="btn ghost small" type="submit">@include('partials.admin-icon',['name'=>'trash'])حذف السؤال</button></form>
@endif
@endsection
