<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\SilverRate;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Get all configuration settings.
     */
    public function index(Request $request)
    {
        $settings = Setting::pluck('value', 'key');
        return response()->json([
            'success' => true,
            'settings' => $settings
        ]);
    }

    /**
     * Update settings.
     */
    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array'
        ]);

        foreach ($request->input('settings') as $key => $value) {
            Setting::setValue($key, (string) $value);
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully.',
            'settings' => Setting::pluck('value', 'key')
        ]);
    }

    /**
     * Update silver rate manual value or toggle override.
     */
    public function updateSilverRate(Request $request)
    {
        $request->validate([
            'silver_rate_manual_value' => 'required|numeric|min:0',
            'silver_rate_manual_override' => 'required|in:0,1'
        ]);

        $val = (string) $request->input('silver_rate_manual_value');
        $override = (string) $request->input('silver_rate_manual_override');

        Setting::setValue('silver_rate_manual_value', $val);
        Setting::setValue('silver_rate_manual_override', $override);

        // Record a row in silver_rates history
        SilverRate::create([
            'rate_per_gram' => (float) $val,
            'source' => 'manual',
            'source_detail' => 'Manual override by Administrator',
            'status' => 'open'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Silver rate settings updated successfully.',
            'rate' => (float) $val
        ]);
    }

    /**
     * Upload campaign promo video file.
     */
    public function uploadVideo(Request $request)
    {
        $request->validate([
            'video' => 'required|file|mimes:mp4,mov,avi,webm|max:20480', // max 20MB
        ]);

        if ($request->hasFile('video')) {
            $file = $request->file('video');
            $path = $file->store('videos', 'public');
            $url = asset('storage/' . $path);

            return response()->json([
                'success' => true,
                'url' => $url,
                'message' => 'Video uploaded successfully.'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No video file provided.'
        ], 400);
    }
}
