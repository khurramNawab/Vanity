<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    /**
     * Store new appointment booking from storefront.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'nullable|email|max:255',
            'preferred_date' => 'nullable|date',
            'time_slot' => 'nullable|string|max:100',
            'consultation_type' => 'nullable|string|max:100',
            'jewelry_interest' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $appointment = Appointment::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'preferred_date' => $request->preferred_date,
            'time_slot' => $request->time_slot,
            'consultation_type' => $request->consultation_type ?: 'video_call',
            'jewelry_interest' => $request->jewelry_interest ?: 'Sterling Silver Personalized Jewelry',
            'notes' => $request->notes,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your appointment request has been received! Our stylist will contact you via WhatsApp/Phone shortly.',
            'appointment' => $appointment
        ], 201);
    }

    /**
     * Admin: List appointments.
     */
    public function index(Request $request)
    {
        $appointments = Appointment::orderBy('created_at', 'desc')->paginate(20);
        return response()->json([
            'success' => true,
            'appointments' => $appointments
        ]);
    }

    /**
     * Admin: Update appointment status.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled'
        ]);

        $appointment = Appointment::findOrFail($id);
        $appointment->status = $request->status;
        $appointment->save();

        return response()->json([
            'success' => true,
            'message' => 'Appointment status updated.',
            'appointment' => $appointment
        ]);
    }
}
