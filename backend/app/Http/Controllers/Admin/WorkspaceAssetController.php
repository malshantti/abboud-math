<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class WorkspaceAssetController extends Controller
{
    public function __invoke(string $asset): BinaryFileResponse
    {
        $root = config('app.frontend_path') ?: (is_dir(base_path('frontend')) ? base_path('frontend') : dirname(base_path()));
        $files = [];
        foreach (['admin.css', 'math-editor.css', 'quiz-builder.css', 'content-builder.css', 'math-editor.js', 'content-preview.js'] as $file) {
            $files[$file] = $root.'/admin/'.$file;
        }
        foreach (['quiz-builder.js', 'content-builder.js', 'dashboard.js', 'dashboard.css', 'media-picker.js'] as $file) {
            $files[$file] = resource_path('js/admin/'.$file);
        }
        foreach (['cairo-arabic.woff2', 'cairo-latin.woff2', 'baloo-arabic.woff2', 'baloo-latin.woff2'] as $file) {
            $files['fonts/'.$file] = $root.'/assets/fonts/'.$file;
        }
        foreach (['av-read.webp', 'av-think.webp', 'av-encourage.webp'] as $file) {
            $files['img/'.$file] = $root.'/assets/img/'.$file;
        }
        $files['brand/favicon.svg'] = $root.'/assets/brand/favicon.svg';
        $files['catalog.js'] = $root.'/catalog.js';
        abort_unless(isset($files[$asset]) && is_file($files[$asset]), 404);
        $type = match (pathinfo($asset, PATHINFO_EXTENSION)) {
            'js' => 'text/javascript; charset=UTF-8', 'css' => 'text/css; charset=UTF-8', 'woff2' => 'font/woff2', 'svg' => 'image/svg+xml', 'webp' => 'image/webp'
        };

        return response()->file($files[$asset], ['Content-Type' => $type, 'X-Content-Type-Options' => 'nosniff']);
    }
}
