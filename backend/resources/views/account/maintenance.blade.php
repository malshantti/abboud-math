@extends('layouts.site')
@section('title', 'صيانة مؤقتة')
@section('body')
<main class="auth" style="grid-template-columns:minmax(0,560px);justify-content:center">
  <section class="card" style="text-align:center">
    <img src="{{ asset('ui/logo-mascot.webp') }}" alt="" width="96" height="126" style="margin:0 auto 8px;display:block">
    <h1>البستان في صيانة مؤقتة</h1>
    <p class="lead" style="white-space:pre-line">{{ $message }}</p>
    <p style="margin:0"><a href="{{ route('account.login') }}">دخول المشرفين</a></p>
  </section>
</main>
@endsection
