<details class="menu">
  <summary class="btn ghost small">@include('partials.admin-icon',['name'=>'download'])<span>تصدير</span><svg class="ico caret" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6"/></svg></summary>
  <div class="menu-list" role="list">
    @foreach (['users' => 'المستخدمون', 'students' => 'الطلاب', 'progress' => 'التقدّم', 'subscriptions' => 'الاشتراكات'] as $type => $label)
    <a role="listitem" href="{{ route('manage.export', $type) }}">@include('partials.admin-icon',['name'=>'download'])<span>{{ $label }}</span><small>CSV</small></a>
    @endforeach
  </div>
</details>
