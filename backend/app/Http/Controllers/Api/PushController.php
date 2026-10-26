<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use App\Models\Setting;
use App\Support\WebPush;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushController extends Controller
{
    public function key(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'enabled' => Setting::flag('push_enabled') && WebPush::configured(),
            'key' => WebPush::publicKey(),
            'reminders' => $user ? (bool) $user->push_reminders : null,
        ]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $data = $request->validate([
            'endpoint' => ['required', 'url', 'starts_with:https://', 'max:1000'],
            'keys.p256dh' => ['required', 'string', 'max:120'],
            'keys.auth' => ['required', 'string', 'max:60'],
            'platform' => ['nullable', 'string', 'max:20'],
        ]);
        PushSubscription::updateOrCreate(['endpoint_hash' => hash('sha256', $data['endpoint'])], [
            'user_id' => $request->user()->id, 'endpoint' => $data['endpoint'], 'p256dh' => $data['keys']['p256dh'], 'auth' => $data['keys']['auth'],
            'platform' => $data['platform'] ?? null, 'user_agent' => mb_substr((string) $request->userAgent(), 0, 255), 'failures' => 0,
        ]);
        $request->user()->forceFill(['push_reminders' => true])->save();

        return response()->json(['ok' => true]);
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $endpoint = (string) $request->input('endpoint', '');
        PushSubscription::where('user_id', $request->user()->id)->where('endpoint_hash', hash('sha256', $endpoint))->delete();

        return response()->json(['ok' => true]);
    }
}
