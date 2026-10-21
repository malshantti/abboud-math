{{-- لوحة جانبية لصفحات الدخول والتسجيل: الشعار، وعد الفترة التجريبية، وثلاث مزايا --}}
<aside class="side" aria-label="عن بستان التعلّم">
  <div class="side-hero">
    <picture><source srcset="{{ asset('ui/logo-mascot.webp') }}" type="image/webp"><img class="side-mascot" src="{{ asset('ui/logo-mascot.png') }}" alt="" width="200" height="263"></picture>
    <p class="bubble">{{ $say ?? 'أهلًا بك في البستان' }}</p>
  </div>
  <p class="trial"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Zm0 0h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z"/></svg><span><b>{{ $ar::num(\App\Models\Setting::get('trial_days') ?: 3) }} أيام مجانًا</b> بكل المواد، دون بطاقة دفع</span></p>
  <ul class="perks">
    <li><span class="ic g"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/></svg></span><span>دروس قصيرة ممتعة تناسب صفّ طفلك</span></li>
    <li><span class="ic b"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM11 18h2"/></svg></span><span>التقدّم محفوظ ومتزامن على كل الأجهزة</span></li>
    <li><span class="ic o"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg></span><span>حساب واحد للعائلة يجمع كل الأبناء</span></li>
  </ul>
</aside>
