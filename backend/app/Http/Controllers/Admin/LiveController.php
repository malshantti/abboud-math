<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\LiveStats;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;

/** «المتصلون الآن واليوم»: who is online, who was active today, and today's numbers (admin only, read-only). */
class LiveController extends Controller
{
    public function index(): View
    {
        return view('manage.live', [
            'online' => LiveStats::online(),
            'today' => LiveStats::people(LiveStats::dayStart(), 80),
            'stats' => LiveStats::summary(),
        ]);
    }

    public function online(): JsonResponse
    {
        return response()->json(LiveStats::online())->header('Cache-Control', 'no-store, private');
    }
}
