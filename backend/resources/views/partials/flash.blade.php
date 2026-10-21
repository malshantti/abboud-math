@if (session('status'))<p class="alert ok" role="status">{{ session('status') }}</p>@endif
@if ($errors->any())<div class="alert err" role="alert"><ul>@foreach ($errors->all() as $e)<li>{{ $e }}</li>@endforeach</ul></div>@endif
