<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\EmailOtp;
use App\Mail\RegistrationOtpMail;
use App\Mail\WelcomeEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Step 1: Send Registration OTP (Does NOT create user in DB yet).
     */
    public function sendRegistrationOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $otp = (string) random_int(100000, 999999);

        EmailOtp::updateOrCreate(
            ['email' => strtolower(trim($request->email))],
            [
                'name' => trim($request->name),
                'otp_hash' => Hash::make($otp),
                'password_hash' => Hash::make($request->password),
                'expires_at' => now()->addMinutes(10),
                'attempts' => 0,
            ]
        );

        try {
            Mail::to($request->email)->send(new RegistrationOtpMail($request->name, $otp));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send registration OTP email: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification email. Please check your email address and try again.'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Verification code has been sent to your email address.'
        ]);
    }

    /**
     * Step 2: Verify Registration OTP and Create User in Database.
     */
    public function verifyRegistrationOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $email = strtolower(trim($request->email));
        $record = EmailOtp::where('email', $email)->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'No pending registration found for this email. Please submit the form again.'
            ], 422);
        }

        if (now()->gt($record->expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'The verification code has expired. Please click resend to get a new code.'
            ], 422);
        }

        if ($record->attempts >= 5) {
            return response()->json([
                'success' => false,
                'message' => 'Too many failed attempts. Please request a new verification code.'
            ], 422);
        }

        if (!Hash::check(trim($request->otp), $record->otp_hash)) {
            $record->increment('attempts');
            return response()->json([
                'success' => false,
                'message' => 'Incorrect verification code. Please enter the 6-digit code sent to your email.'
            ], 422);
        }

        // Double check user doesn't already exist
        if (User::where('email', $email)->exists()) {
            $record->delete();
            return response()->json([
                'success' => false,
                'message' => 'An account with this email already exists. Please sign in.'
            ], 422);
        }

        // Create permanent verified user
        $user = User::create([
            'name' => $record->name,
            'email' => $record->email,
            'password' => $record->password_hash,
            'role' => 'customer',
            'email_verified_at' => now(),
        ]);

        // Clean up OTP record
        $record->delete();

        // Issue auth token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Send Welcome email with coupon code
        try {
            Mail::to($user->email)->send(new WelcomeEmail($user, 'VANITY10'));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send welcome email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Email verified! Account created successfully.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ], 201);
    }

    /**
     * Resend Registration OTP.
     */
    public function resendRegistrationOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $email = strtolower(trim($request->email));
        $record = EmailOtp::where('email', $email)->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'No pending registration found for this email. Please restart registration.'
            ], 422);
        }

        // Throttle resends to 45 seconds
        if ($record->updated_at && $record->updated_at->gt(now()->subSeconds(45))) {
            $wait = 45 - now()->diffInSeconds($record->updated_at);
            return response()->json([
                'success' => false,
                'message' => "Please wait {$wait} seconds before requesting a new code."
            ], 429);
        }

        $otp = (string) random_int(100000, 999999);
        $record->update([
            'otp_hash' => Hash::make($otp),
            'expires_at' => now()->addMinutes(10),
            'attempts' => 0,
        ]);

        try {
            Mail::to($record->email)->send(new RegistrationOtpMail($record->name, $otp));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to resend registration OTP: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification email. Please try again later.'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'A new 6-digit verification code has been sent to your email.'
        ]);
    }

    /**
     * Legacy register fallback.
     */
    public function register(Request $request)
    {
        return $this->sendRegistrationOtp($request);
    }

    /**
     * Handle user login (Both Customers and Admins).
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password'
            ], 401);
        }

        // Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }

    /**
     * Handle user logout (Revokes token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Update user profile settings.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'address_line1' => 'nullable|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'pincode' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'address_line1' => $request->input('address_line1'),
            'address_line2' => $request->input('address_line2'),
            'city' => $request->input('city'),
            'state' => $request->input('state'),
            'pincode' => $request->input('pincode'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'address_line1' => $user->address_line1,
                'address_line2' => $user->address_line2,
                'city' => $user->city,
                'state' => $user->state,
                'pincode' => $user->pincode,
            ]
        ]);
    }
}
