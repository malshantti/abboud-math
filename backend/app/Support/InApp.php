<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * In-app browsers (Facebook, Instagram, Messenger, TikTok, generic Android WebView).
 * Google blocks OAuth inside them (disallowed_useragent), so we send the user to a real browser instead.
 */
class InApp
{
    public static function detect(?string $ua): ?string
    {
        $ua = (string) $ua;
        if ($ua === '') {
            return null;
        }
        foreach (['FBAN' => 'facebook', 'FBAV' => 'facebook', 'FB_IAB' => 'facebook', 'FBIOS' => 'facebook', 'Instagram' => 'instagram', 'Messenger' => 'messenger', 'MessengerForiOS' => 'messenger', 'musical_ly' => 'tiktok', 'TikTok' => 'tiktok', 'BytedanceWebview' => 'tiktok', 'Snapchat' => 'snapchat', 'Line/' => 'line'] as $needle => $app) {
            if (stripos($ua, $needle) !== false) {
                return $app;
            }
        }
        // Generic Android WebView ("; wv)") and iOS WKWebView without "Safari/" (not Chrome/Firefox/Edge for iOS).
        if (preg_match('/Android.*;\s*wv\)/i', $ua)) {
            return 'webview';
        }
        if (preg_match('/(iPhone|iPad|iPod)/i', $ua) && ! preg_match('/Safari\//', $ua) && ! preg_match('/CriOS|FxiOS|EdgiOS/', $ua)) {
            return 'webview';
        }

        return null;
    }

    public static function of(Request $request): ?string
    {
        return self::detect($request->userAgent());
    }

    public static function platform(?string $ua): string
    {
        return preg_match('/Android/i', (string) $ua) ? 'android' : (preg_match('/iPhone|iPad|iPod/i', (string) $ua) ? 'ios' : 'other');
    }

    /** Crawlers and link-preview bots (e.g. facebookexternalhit) that follow links but never carry a session. */
    public static function isBot(?string $ua): bool
    {
        return $ua === null || $ua === '' || (bool) preg_match('/facebookexternalhit|facebookcatalog|meta-externalagent|bot\b|crawler|spider|preview|curl\/|wget|python-requests|Mozilla\/5\.0 \(compatible\)$/i', $ua);
    }
}
