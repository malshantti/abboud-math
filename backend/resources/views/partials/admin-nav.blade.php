{{-- Unified admin sidebar navigation, shared by the management panel and the content workspace. $spa = true when rendered inside the content workspace (hash links drive its views). --}}
@php($spa = $spa ?? false)
@php($r = request()->route()?->getName() ?? '')
@php($w = fn (string $view) => $spa ? '#'.$view : route('admin.index').'#'.$view)
<nav class="admin-nav" id="navigation" aria-label="أقسام لوحة الإدارة">
  <p class="nav-group">الإدارة</p>
  <a class="nav-item" href="{{ route('manage.dashboard') }}" @if($r==='manage.dashboard') aria-current="page" @endif>@include('partials.admin-icon',['name'=>'home'])<span>لوحة المعلومات</span></a>
  <a class="nav-item" href="{{ route('manage.students') }}" @if(str_starts_with($r,'manage.student')) aria-current="page" @endif>@include('partials.admin-icon',['name'=>'students'])<span>الطلاب والتقدّم</span></a>
  @can('manage-site')
  <a class="nav-item" href="{{ route('manage.users') }}" @if(str_starts_with($r,'manage.user')) aria-current="page" @endif>@include('partials.admin-icon',['name'=>'users'])<span>المستخدمون</span></a>
  <a class="nav-item" href="{{ route('manage.subscriptions') }}" @if(str_starts_with($r,'manage.subscription')) aria-current="page" @endif>@include('partials.admin-icon',['name'=>'card'])<span>الاشتراكات</span></a>
  <a class="nav-item" href="{{ route('manage.settings') }}" @if($r==='manage.settings') aria-current="page" @endif>@include('partials.admin-icon',['name'=>'tag'])<span>الأسعار والإعدادات</span></a>
  <a class="nav-item" href="{{ route('manage.mail') }}" @if($r==='manage.mail') aria-current="page" @endif>@include('partials.admin-icon',['name'=>'mail'])<span>البريد الإلكتروني</span></a>
  <a class="nav-item" href="{{ route('manage.seo') }}" @if($r==='manage.seo') aria-current="page" @endif>@include('partials.admin-icon',['name'=>'search'])<span>عناوين جوجل (SEO)</span></a>
  <a class="nav-item" href="{{ route('manage.activity') }}" @if($r==='manage.activity') aria-current="page" @endif>@include('partials.admin-icon',['name'=>'activity'])<span>سجل النشاط</span></a>
  @endcan
  <p class="nav-group">المحتوى والاختبارات</p>
  <a class="nav-item" href="{{ $w('overview') }}" @if($spa) data-view="overview" @endif>@include('partials.admin-icon',['name'=>'grid'])<span>نظرة على المحتوى</span></a>
  <a class="nav-item" href="{{ $w('library') }}" @if($spa) data-view="library" @endif>@include('partials.admin-icon',['name'=>'book'])<span>مكتبة المحتوى</span></a>
  <a class="nav-item" href="{{ $w('content-builder') }}" @if($spa) data-view="content-builder" @endif>@include('partials.admin-icon',['name'=>'plus'])<span>منشئ المحتوى</span></a>
  <a class="nav-item" href="{{ $w('quiz-builder') }}" @if($spa) data-view="quiz-builder" @endif>@include('partials.admin-icon',['name'=>'quiz'])<span>مصمم الاختبارات</span></a>
  <a class="nav-item" href="{{ $w('courses') }}" @if($spa) data-view="courses" @endif>@include('partials.admin-icon',['name'=>'book'])<span>مواد الموقع</span></a>
  <a class="nav-item" href="{{ $w('students') }}" @if($spa) data-view="students" @endif>@include('partials.admin-icon',['name'=>'star'])<span>تقدّم الطلاب في المحتوى</span></a>
  <a class="nav-item" href="{{ $w('accounts') }}" @if($spa) data-view="accounts" @endif>@include('partials.admin-icon',['name'=>'shield'])<span>المشرفون</span></a>
</nav>
