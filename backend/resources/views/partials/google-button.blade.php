@if (\App\Http\Controllers\Account\GoogleAuthController::enabled())
@php($inApp = \App\Support\InApp::of(request()))
@php($ret = request()->filled('return') ? ['return' => request()->query('return')] : [])
@if ($inApp)
@php($plat = \App\Support\InApp::platform(request()->userAgent()))
@php($target = request()->fullUrlWithQuery(['google' => 1]))
@php($hostPath = preg_replace('#^https?://#', '', $target))
{{-- In-app browsers (Facebook, Instagram, TikTok…): Google refuses to sign in here, so open the page in the real browser first. --}}
<div class="inapp" data-plat="{{ $plat }}">
  <a class="gbtn inapp-open" id="inapp-open" href="{{ $target }}"
     data-chrome="intent://{{ $hostPath }}#Intent;scheme=https;package=com.android.chrome;end"
     data-generic="intent://{{ $hostPath }}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end"
     data-safari="x-safari-{{ $target }}" data-url="{{ $target }}">
    <svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
    <span>افتح بالمتصفح لتسجّل بحساب Google</span>
  </a>
  <p class="hint inapp-note">التسجيل بحساب Google لا يعمل داخل تطبيق {{ ['facebook' => 'فيسبوك', 'instagram' => 'إنستغرام', 'messenger' => 'ماسنجر', 'tiktok' => 'تيك توك'][$inApp] ?? 'التطبيق' }}. أو أنشئ حسابك بالبريد الإلكتروني أدناه.</p>
</div>
<div class="inapp-ov" id="inapp-ov" hidden role="dialog" aria-modal="true" aria-labelledby="inapp-ov-t">
  <div class="inapp-arrow" aria-hidden="true">⬈</div>
  <div class="inapp-box">
    <b id="inapp-ov-t">اضغط ⋯ ثم «فتح في Safari»</b>
    <p>زر النقاط الثلاث في أعلى الشاشة يفتح الصفحة في المتصفح، فتسجّل بحساب Google مباشرة.</p>
    <button type="button" class="btn wide" id="inapp-copy">نسخ الرابط</button>
    <p class="hint" id="inapp-copied" role="status"></p>
    <button type="button" class="btn ghost wide" id="inapp-close">التسجيل بالبريد بدلًا من ذلك</button>
  </div>
</div>
<style>
.inapp-open{background:#fff}
.inapp-note{text-align:center;margin:8px 0 0}
.inapp-ov{position:fixed;inset:0;z-index:50;background:rgba(20,30,20,.72);display:flex;flex-direction:column;align-items:flex-end;padding:8px 14px}
.inapp-ov[hidden]{display:none}
.inapp-arrow{font-size:56px;line-height:1;color:#fff;margin:0 4px 6px 0}
.inapp-box{background:#fff;border-radius:18px;padding:18px;width:100%;max-width:420px;margin:0 auto;text-align:center}
.inapp-box b{display:block;font-size:20px;margin-bottom:6px}
.inapp-box .btn{margin-top:10px}
</style>
<script>
(function(){
  var a=document.getElementById('inapp-open'),ov=document.getElementById('inapp-ov'),plat=a.parentNode.getAttribute('data-plat');
  function overlay(){ov.hidden=false}
  function stillHere(fn,ms){var gone=false;function h(){if(document.hidden)gone=true}document.addEventListener('visibilitychange',h);setTimeout(function(){document.removeEventListener('visibilitychange',h);if(!gone&&!document.hidden)fn()},ms)}
  a.addEventListener('click',function(e){
    e.preventDefault();
    if(plat==='android'){
      location.href=a.dataset.chrome;
      stillHere(function(){location.href=a.dataset.generic;stillHere(overlay,1500)},1500);
    }else if(plat==='ios'){
      location.href=a.dataset.safari;
      stillHere(overlay,1200);
    }else{overlay()}
  });
  document.getElementById('inapp-copy').addEventListener('click',function(){
    var u=a.dataset.url,m=document.getElementById('inapp-copied');
    function ok(){m.textContent='نُسخ الرابط. الصقه في Safari أو Chrome.'}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u).then(ok,function(){prompt('انسخ الرابط:',u)})}else{prompt('انسخ الرابط:',u)}
  });
  document.getElementById('inapp-close').addEventListener('click',function(){ov.hidden=true;var n=document.getElementById('name')||document.getElementById('email');if(n)n.focus()});
})();
</script>
<div class="or"><span>أو</span></div>
@else
<a class="gbtn" id="gbtn" href="{{ route('account.google', $ret) }}">
  <svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
  <span>الدخول بحساب Google</span>
</a>
@if (request()->boolean('google') && ! $errors->any())
{{-- Opened from an in-app browser with ?google=1: continue straight to Google. --}}
<script>(function(){var b=document.getElementById('gbtn');b.classList.add('pulse');setTimeout(function(){location.replace(b.href)},400)})();</script>
@endif
<script>(function(){var b=document.getElementById('gbtn'),busy=false;b.addEventListener('click',function(e){if(busy){e.preventDefault();return}busy=true;b.setAttribute('aria-busy','true');setTimeout(function(){busy=false;b.removeAttribute('aria-busy')},8000)})})();</script>
<div class="or"><span>أو</span></div>
@endif
@endif
