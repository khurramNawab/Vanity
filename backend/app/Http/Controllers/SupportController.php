<?php

namespace App\Http\Controllers;

use App\Models\SupportMessage;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    /**
     * Store a new support/contact request.
     */
    public function submit(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        $msg = SupportMessage::create([
            'name' => $request->name,
            'email' => $request->email,
            'subject' => $request->subject,
            'message' => $request->message,
            'status' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your message has been successfully recorded. Our support team will get in touch shortly.',
            'support_message' => $msg
        ]);
    }

    /**
     * List all support tickets for admin.
     */
    public function index()
    {
        $tickets = SupportMessage::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'tickets' => $tickets
        ]);
    }

    /**
     * Resolve a ticket.
     */
    public function resolve($id)
    {
        $ticket = SupportMessage::findOrFail($id);
        $ticket->status = 'resolved';
        $ticket->save();

        return response()->json([
            'success' => true,
            'message' => 'Ticket resolved successfully.',
            'ticket' => $ticket
        ]);
    }
}
