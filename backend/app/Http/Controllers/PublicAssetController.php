<?php

namespace App\Http\Controllers;

use Symfony\Component\HttpFoundation\BinaryFileResponse;

/** Public, whitelisted brand files (fonts, logo, mascot) for account pages. Same origin; no CDN. */
class PublicAssetController extends Controller
{
    public function __invoke(string $asset): BinaryFileResponse
    {
        $root = config('app.frontend_path') ?: (is_dir(base_path('frontend')) ? base_path('frontend') : dirname(base_path()));
        $allowed = ['fonts/baloo-arabic.woff2', 'fonts/baloo-latin.woff2', 'fonts/cairo-arabic.woff2', 'fonts/cairo-latin.woff2', 'brand/favicon.svg', 'img/av-read.webp', 'img/av-think.webp', 'img/av-encourage.webp', 'img/av-idle.webp', 'img/av-celebrate.webp'];
        abort_unless(in_array($asset, $allowed, true) && is_file($root.'/assets/'.$asset), 404);
        $type = ['woff2' => 'font/woff2', 'svg' => 'image/svg+xml', 'webp' => 'image/webp'][pathinfo($asset, PATHINFO_EXTENSION)];

        return response()->file($root.'/assets/'.$asset, ['Content-Type' => $type, 'Cache-Control' => 'public, max-age=604800', 'X-Content-Type-Options' => 'nosniff']);
    }
}
