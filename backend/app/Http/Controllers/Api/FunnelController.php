<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\Funnel;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** Public beacon (navigator.sendBeacon): one small JSON event, always answers 204 quickly. */
class FunnelController extends Controller
{
    public function store(Request $request): Response
    {
        try {
            $raw = $request->getContent();
            $d = strlen($raw) <= 4000 ? json_decode($raw, true) : null;
            if (! is_array($d)) {
                $d = $request->only(['e', 'v', 'p', 's', 'n', 'src', 'm']);
            }
            if (\App\Support\InApp::isBot($request->userAgent())) {
                return response()->noContent();
            }
            $event = (string) ($d['e'] ?? '');
            if (! in_array($event, Funnel::CLIENT, true)) {
                return response()->noContent();
            }
            $vid = Funnel::cleanVid(is_string($d['v'] ?? null) ? $d['v'] : null) ?? Funnel::visitorId($request);
            $user = $request->user();
            if ($user && $user->isStaff()) {
                return response()->noContent(); // staff browsing the site is not a family
            }
            $src = is_array($d['src'] ?? null) ? $d['src'] : null;
            $clean = null;
            if ($src) {
                $clean = [];
                foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'] as $k) {
                    if (isset($src[$k]) && is_scalar($src[$k]) && $src[$k] !== '') {
                        $clean[$k] = mb_substr(preg_replace('/[^\p{L}\p{N}._\- \/:]/u', '', (string) $src[$k]), 0, 80);
                    }
                }
                if (! empty($src['fbclid'])) {
                    $clean['fbclid'] = 1;
                }
            }
            $source = $src !== null ? Funnel::sourceFrom($clean ?? [], $request->userAgent()) : Funnel::cleanSource(is_string($d['c'] ?? null) ? $d['c'] : null);
            $page = in_array($d['p'] ?? null, Funnel::PAGES, true) ? $d['p'] : null;
            $subject = is_string($d['s'] ?? null) && preg_match('/^g\d{1,2}-[a-z]{2,12}$/', $d['s']) ? $d['s'] : null;
            $m = is_array($d['m'] ?? null) ? array_slice(array_filter($d['m'], fn ($v, $k) => is_string($k) && strlen($k) <= 20 && (is_scalar($v) || $v === null), ARRAY_FILTER_USE_BOTH), 0, 8, true) : [];
            foreach ($m as $k => $v) {
                $m[$k] = is_string($v) ? mb_substr($v, 0, 60) : $v;
            }
            if ($clean) {
                $m += $clean;
            }
            if ($event === 'visit' || $event === 'inapp') {
                if ($app = \App\Support\InApp::of($request)) {
                    $m['inapp'] = $app;
                }
                $m['dev'] = \App\Support\InApp::platform($request->userAgent());
            }
            Funnel::log($event, [
                'user_id' => $user?->id, 'visitor_id' => $vid, 'subject' => $subject, 'page' => $page,
                'count' => isset($d['n']) && is_numeric($d['n']) ? (int) $d['n'] : null, 'meta' => $m ?: null,
            ] + ($source ? ['source' => $source] : []));
            if ($user && $vid) {
                Funnel::link($user, $vid);
            }
        } catch (\Throwable) {
        }

        return response()->noContent();
    }
}
