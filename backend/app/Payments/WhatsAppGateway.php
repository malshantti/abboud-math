<?php

namespace App\Payments;

use App\Models\Setting;
use App\Models\Subscription;
use App\Support\Ar;

class WhatsAppGateway implements PaymentGateway
{
    public function key(): string
    {
        return 'whatsapp';
    }

    public static function number(): string
    {
        return preg_replace('/\D+/', '', Setting::get('whatsapp_number'));
    }

    public const PLACEHOLDERS = ['{student}' => 'اسم الطالب', '{subjects}' => 'قائمة المواد وأسعارها', '{total}' => 'المجموع مع العملة', '{code}' => 'رمز الطلب', '{parent}' => 'اسم ولي الأمر', '{email}' => 'بريد ولي الأمر', '{site}' => 'اسم الموقع'];

    public function message(Subscription $s): string
    {
        return $this->batchMessage([$s]);
    }

    /** One message for one or more subscriptions requested together, from the admin-editable template. */
    public function batchMessage(iterable $subs): string
    {
        $subs = collect($subs)->values();
        $first = $subs[0];
        $u = $first->user;
        $items = $subs->map(fn ($s, $i) => Ar::num($i + 1).') '.$s->plan_name.' — '.Ar::num($s->price).' '.$s->currency.' لمدة '.Ar::num($s->days).' يومًا'.($subs->count() > 1 ? ' — '.$s->code : ''))->join("\n");
        $code = $first->batch && $subs->count() > 1 ? $first->batch.' ('.$subs->pluck('code')->join('، ').')' : $first->code;
        $template = trim(Setting::get('whatsapp_template')) ?: Setting::DEFAULTS['whatsapp_template'];

        return strtr(str_replace("\r\n", "\n", $template), [
            '{student}' => $first->student?->name ?? 'كل الطلاب في الحساب', '{subjects}' => $items,
            '{total}' => Ar::num($subs->sum('price')).' '.$first->currency, '{code}' => $code,
            '{parent}' => (string) $u?->name, '{email}' => (string) $u?->email, '{site}' => Setting::get('site_name'),
        ]);
    }

    public function batchCheckoutUrl(iterable $subs): ?string
    {
        $n = static::number();

        return $n === '' ? null : 'https://wa.me/'.$n.'?text='.rawurlencode($this->batchMessage($subs));
    }

    public function checkoutUrl(Subscription $subscription): ?string
    {
        $n = static::number();

        return $n === '' ? null : 'https://wa.me/'.$n.'?text='.rawurlencode($this->message($subscription));
    }
}
