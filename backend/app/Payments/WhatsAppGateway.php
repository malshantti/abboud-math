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

    public function message(Subscription $s): string
    {
        $u = $s->user;
        $lines = [
            'السلام عليكم، أرغب في الاشتراك في '.Setting::get('site_name').'.',
            'اسم ولي الأمر: '.$u->name,
            'البريد الإلكتروني: '.$u->email,
            'الطالب: '.($s->student?->name ?? 'كل الطلاب في الحساب'),
            'الصف والمادة: '.$s->plan_name,
            'المدة: '.Ar::num($s->days).' يومًا',
            'السعر: '.Ar::num($s->price).' '.$s->currency,
            'رمز الطلب: '.$s->code,
        ];

        return implode("\n", $lines);
    }

    /** One message for several subscriptions requested together (same parent and student). */
    public function batchMessage(iterable $subs): string
    {
        $subs = collect($subs)->values();
        if ($subs->count() === 1) {
            return $this->message($subs[0]);
        }
        $first = $subs[0];
        $u = $first->user;
        $lines = [
            'السلام عليكم، أرغب في الاشتراك في '.Setting::get('site_name').'.',
            'اسم ولي الأمر: '.$u->name,
            'البريد الإلكتروني: '.$u->email,
            'الطالب: '.($first->student?->name ?? 'كل الطلاب في الحساب'),
            'المواد المطلوبة ('.Ar::num($subs->count()).'):',
        ];
        foreach ($subs as $i => $s) {
            $lines[] = Ar::num($i + 1).') '.$s->plan_name.' — '.Ar::num($s->price).' '.$s->currency.' لمدة '.Ar::num($s->days).' يومًا — رمز الطلب: '.$s->code;
        }
        $lines[] = 'المجموع: '.Ar::num($subs->sum('price')).' '.$first->currency;
        $lines[] = 'رموز الطلبات: '.$subs->pluck('code')->join('، ');

        return implode("\n", $lines);
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
