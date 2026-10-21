<?php

namespace App\Payments;

use App\Models\Subscription;

/** Pluggable payment step. Only the manual WhatsApp gateway is enabled; an online gateway can implement this later. */
interface PaymentGateway
{
    public function key(): string;

    /** URL the parent is sent to in order to pay for this pending request. */
    public function checkoutUrl(Subscription $subscription): ?string;
}
