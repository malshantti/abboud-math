<?php

// Thin front controller for https://bustankids.com/admin-api/
// It lives in the bustankids.com document root and loads the Laravel app kept
// OUTSIDE the web root in ~/bustankids-app. Edit $appPath if you used another folder.

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$appPath = null;
foreach ([__DIR__.'/../../bustankids-app', __DIR__.'/../../../bustankids-app', __DIR__.'/../bustankids-app'] as $candidate) {
    if (is_file($candidate.'/bootstrap/app.php')) {
        $appPath = realpath($candidate);
        break;
    }
}
if ($appPath === null) {
    http_response_code(500);
    exit('Laravel app folder (bustankids-app) not found. Edit admin-api/index.php.');
}

if (file_exists($maintenance = $appPath.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $appPath.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $appPath.'/bootstrap/app.php';
$app->usePublicPath(__DIR__);

$app->handleRequest(Request::capture());
