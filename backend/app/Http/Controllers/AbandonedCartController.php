<?php

namespace App\Http\Controllers;

use App\Models\CartSession;
use App\Models\Coupon;
use App\Mail\AbandonedCartEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AbandonedCartController extends Controller
{
    /**
     * Save progress of checkout cart.
     */
    public function saveProgress(Request $request)
    {
        $request->validate([
            'email' => 'nullable|string|email|max:255',
            'shipping_name' => 'nullable|string|max:255',
            'shipping_phone' => 'nullable|string|max:20',
            'items' => 'required|array|min:1',
        ]);

        $user = $request->user('sanctum');
        $userId = $user ? $user->id : null;
        $email = $request->input('email') ?: ($user ? $user->email : null);

        if (!$email && !$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Email or authenticated user required to save progress.'
            ], 422);
        }

        // Find existing session or create new
        $session = CartSession::where('is_recovered', false)
            ->where(function ($query) use ($userId, $email) {
                if ($userId) {
                    $query->where('user_id', $userId);
                }
                if ($email) {
                    $query->orWhere('email', $email);
                }
            })
            ->first();

        if (!$session) {
            $session = new CartSession();
            $session->is_recovered = false;
        }

        $session->user_id = $userId;
        $session->email = $email;
        $session->shipping_name = $request->input('shipping_name');
        $session->shipping_phone = $request->input('shipping_phone');
        $session->cart_data = $request->input('items');
        $session->last_activity_at = now();
        $session->save();

        return response()->json([
            'success' => true,
            'message' => 'Checkout progress synced successfully.',
            'session_id' => $session->id
        ]);
    }

    /**
     * List all abandoned checkouts (Admin only).
     */
    public function index(Request $request)
    {
        // Abandoned = updated more than 15 mins ago and not recovered
        $sessions = CartSession::where('is_recovered', false)
            ->where('last_activity_at', '<', now()->subMinutes(15))
            ->with('user')
            ->latest('last_activity_at')
            ->get();

        return response()->json([
            'success' => true,
            'sessions' => $sessions
        ]);
    }

    /**
     * Send manual marketing recovery email (Admin only).
     */
    public function sendFollowup(Request $request, $id)
    {
        $request->validate([
            'template' => 'required|string|in:nudge,urgency,discount,custom',
            'custom_subject' => 'nullable|string|max:255',
            'custom_message' => 'nullable|string|max:5000',
            'attach_discount' => 'nullable|boolean'
        ]);

        try {
            $session = CartSession::findOrFail($id);
            $template = $request->input('template');
            $customSubject = $request->input('custom_subject');
            $customMessage = $request->input('custom_message');
            $attachDiscount = $request->boolean('attach_discount');
            $couponCode = null;

            if ($template === 'discount' || ($template === 'custom' && $attachDiscount)) {
                // Generate a unique 10% coupon code
                $couponCode = 'RECOVER-' . strtoupper(Str::random(6));
                Coupon::create([
                    'code' => $couponCode,
                    'type' => 'percent',
                    'value' => 10.00,
                    'min_order_value' => 500.00,
                    'max_discount' => 1000.00,
                    'expiry_date' => now()->addDays(7),
                    'usage_limit' => 1,
                    'usage_count' => 0,
                    'status' => 'active',
                ]);
            }

            $recipientEmail = $session->email ?: ($session->user ? $session->user->email : null);
            if (!$recipientEmail) {
                throw new \Exception('No email address associated with this cart session.');
            }

            // Send mail
            Mail::to($recipientEmail)->send(new AbandonedCartEmail($session, $couponCode, $template, $customSubject, $customMessage));

            $session->update([
                'email_sent' => true,
                'email_sent_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Recovery email dispatched successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send recovery email: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Restore abandoned checkout session (Public route).
     */
    public function getCartSession(Request $request)
    {
        $id = $request->query('id');
        if (!$id) {
            return response()->json(['success' => false, 'message' => 'Session ID is required.'], 400);
        }

        try {
            $session = CartSession::findOrFail($id);
            return response()->json([
                'success' => true,
                'session' => $session
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Cart session not found.'], 404);
        }
    }

    /**
     * Send bulk recovery emails (Admin only).
     */
    public function bulkSendFollowup(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer',
            'template' => 'required|string|in:nudge,urgency,discount,custom',
            'custom_subject' => 'nullable|string|max:255',
            'custom_message' => 'nullable|string|max:5000',
            'attach_discount' => 'nullable|boolean'
        ]);

        $ids = $request->input('ids');
        $template = $request->input('template');
        $customSubject = $request->input('custom_subject');
        $customMessage = $request->input('custom_message');
        $attachDiscount = $request->boolean('attach_discount');
        $successCount = 0;
        $errors = [];

        foreach ($ids as $id) {
            try {
                $session = CartSession::findOrFail($id);
                $couponCode = null;

                if ($template === 'discount' || ($template === 'custom' && $attachDiscount)) {
                    $couponCode = 'RECOVER-' . strtoupper(Str::random(6));
                    Coupon::create([
                        'code' => $couponCode,
                        'type' => 'percent',
                        'value' => 10.00,
                        'min_order_value' => 500.00,
                        'max_discount' => 1000.00,
                        'expiry_date' => now()->addDays(7),
                        'usage_limit' => 1,
                        'usage_count' => 0,
                        'status' => 'active',
                    ]);
                }

                $recipientEmail = $session->email ?: ($session->user ? $session->user->email : null);
                if (!$recipientEmail) {
                    throw new \Exception('No email address associated with this cart session.');
                }

                Mail::to($recipientEmail)->send(new AbandonedCartEmail($session, $couponCode, $template, $customSubject, $customMessage));

                $session->update([
                    'email_sent' => true,
                    'email_sent_at' => now()
                ]);

                $successCount++;
            } catch (\Exception $e) {
                $errors[$id] = $e->getMessage();
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Bulk emails sent: {$successCount} succeeded, " . count($errors) . " failed.",
            'success_count' => $successCount,
            'errors' => $errors
        ]);
    }
}
