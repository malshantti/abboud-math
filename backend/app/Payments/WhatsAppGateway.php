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

    public function checkoutUrl(Subscription $subscription): ?string
    {
        $n = static::number();

        return $n === '' ? null : 'https://wa.me/'.$n.'?text='.rawurlencode($this->message($subscription));
    }
}
