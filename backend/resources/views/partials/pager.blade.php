@if ($p->hasPages())
<nav class="pager row" aria-label="الصفحات">
  @if (! $p->onFirstPage())<a class="btn ghost small" href="{{ $p->previousPageUrl() }}">السابق</a>@endif
  <span>صفحة {{ $ar::num($p->currentPage()) }} من {{ $ar::num($p->lastPage()) }}</span>
  @if ($p->hasMorePages())<a class="btn ghost small" href="{{ $p->nextPageUrl() }}">التالي</a>@endif
</nav>
@endif
