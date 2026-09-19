<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF9F6; color: #1A1A1A; margin: 0; padding: 0; }
        .wrapper { width: 100%; max-width: 540px; margin: 20px auto; background-color: #ffffff; border: 1px solid #EAEAEA; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background-color: #1A1A1A; padding: 32px 20px; text-align: center; }
        .header h1 { color: #FFFFFF; font-size: 24px; letter-spacing: 3px; margin: 0; font-weight: 300; }
        .header p { color: #9A7E44; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 8px 0 0 0; }
        .content { padding: 36px 30px; line-height: 1.6; text-align: center; }
        .content h2 { font-size: 18px; color: #1A1A1A; margin-bottom: 12px; font-weight: 500; }
        .content p { font-size: 14px; color: #555555; margin: 0 0 24px 0; }
        .otp-container { background-color: #FAF9F6; border: 1px dashed #9A7E44; border-radius: 6px; padding: 24px; margin: 24px 0; }
        .otp-title { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #888888; margin-bottom: 8px; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 34px; letter-spacing: 8px; color: #1A1A1A; font-weight: 700; }
        .expiry-note { font-size: 12px; color: #888888; margin-top: 10px; }
        .footer { background-color: #FAF9F6; padding: 24px 20px; text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #EAEAEA; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>VANITY</h1>
            <p>Modern Heirlooms</p>
        </div>
        <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hello {{ $name }}, thank you for signing up with Vanity. Please use the verification code below to verify your email address and activate your account.</p>
            
            <div class="otp-container">
                <div class="otp-title">One-Time Verification Code</div>
                <div class="otp-code">{{ $otp }}</div>
                <div class="expiry-note">This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.</div>
            </div>

            <p style="font-size: 12px; color: #777777;">If you did not initiate this request, you can safely disregard this email.</p>
        </div>
        <div class="footer">
            <p>© 2026 Vanity Jewels. All Rights Reserved.<br>{!! nl2br(e(\App\Models\Setting::getValue('store_address', 'Padmini Apartment 44/19 Durgapur Lane Kala Bagan, Chetla, Kolkata, West Bengal 700027'))) !!}</p>
        </div>
    </div>
</body>
</html>
