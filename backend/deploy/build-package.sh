#!/usr/bin/env bash
# Builds /workspace/bustankids-laravel.zip in the cPanel layout (bustankids-app/ + public_html/admin-api/), with vendor, without .env.
set -euo pipefail
REPO=$(cd "$(dirname "$0")/../.." && pwd); OUT=${1:-/workspace/bustankids-laravel.zip}; B=$(mktemp -d)
APP=$B/bustankids-app
rsync -a --exclude .env --exclude vendor --exclude node_modules --exclude .phpunit.result.cache --exclude 'storage/logs/*.log' --exclude 'storage/framework/sessions/*' --exclude 'storage/framework/views/*.php' --exclude 'storage/framework/cache/data/*' "$REPO/backend/" "$APP/"
(cd "$APP" && composer install --no-dev --optimize-autoloader --no-interaction -q)
mkdir -p "$APP/frontend/admin" "$APP/frontend/assets/brand" "$APP/frontend/assets/img" "$APP/frontend/assets/fonts"
cp "$REPO"/admin/{admin.css,math-editor.css,quiz-builder.css,content-builder.css,math-editor.js,content-preview.js} "$APP/frontend/admin/"
cp "$REPO/assets/brand/favicon.svg" "$APP/frontend/assets/brand/"
cp "$REPO"/assets/img/av-{idle,encourage,think,read,celebrate}.webp "$APP/frontend/assets/img/"
cp "$REPO"/assets/fonts/*.woff2 "$APP/frontend/assets/fonts/"
cp "$REPO/catalog.js" "$APP/frontend/"
cp "$REPO/backend/deploy/app-root.htaccess" "$APP/.htaccess"
mkdir -p "$B/public_html" && cp -a "$REPO/backend/deploy/admin-api" "$B/public_html/"
rm -f "$OUT"; (cd "$B" && zip -qr "$OUT" bustankids-app public_html)
echo "$B"
