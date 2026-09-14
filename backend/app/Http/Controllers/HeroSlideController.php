<?php

namespace App\Http\Controllers;

use App\Models\HeroSlide;
use Illuminate\Http\Request;

class HeroSlideController extends Controller
{
    /**
     * Public: Get active hero slides (for storefront).
     */
    public function publicIndex()
    {
        $slides = HeroSlide::active()
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'slides' => $slides,
        ]);
    }

    /**
     * Admin: List all hero slides.
     */
    public function index()
    {
        $slides = HeroSlide::orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'slides' => $slides,
        ]);
    }

    /**
     * Admin: Create a new hero slide.
     */
    public function store(Request $request)
    {
        $request->validate([
            'image_path' => 'required|string',
            'headline' => 'nullable|string|max:255',
            'subtext' => 'nullable|string',
            'cta_text' => 'nullable|string|max:100',
            'cta_link' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $slide = HeroSlide::create([
            'image_path' => $request->input('image_path'),
            'headline' => $request->input('headline', ''),
            'subtext' => $request->input('subtext', ''),
            'cta_text' => $request->input('cta_text', 'Shop now'),
            'cta_link' => $request->input('cta_link', '/shop'),
            'sort_order' => $request->input('sort_order', 0),
            'is_active' => $request->boolean('is_active', true),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hero slide created successfully.',
            'slide' => $slide,
        ], 201);
    }

    /**
     * Admin: Update an existing hero slide.
     */
    public function update(Request $request, $id)
    {
        $slide = HeroSlide::findOrFail($id);

        $request->validate([
            'image_path' => 'sometimes|required|string',
            'headline' => 'nullable|string|max:255',
            'subtext' => 'nullable|string',
            'cta_text' => 'nullable|string|max:100',
            'cta_link' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $slide->update($request->only([
            'image_path', 'headline', 'subtext', 'cta_text', 'cta_link',
            'sort_order', 'is_active', 'start_date', 'end_date',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Hero slide updated successfully.',
            'slide' => $slide->fresh(),
        ]);
    }

    /**
     * Admin: Delete a hero slide.
     */
    public function destroy($id)
    {
        $slide = HeroSlide::findOrFail($id);
        $slide->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hero slide deleted successfully.',
        ]);
    }
}
