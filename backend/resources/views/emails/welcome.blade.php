<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF9F6; color: #1A1A1A; margin: 0; padding: 0; }
        .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #EAEAEA; }
        .header { background-color: #1A1A1A; padding: 40px 20px; text-align: center; }
        .header h1 { color: #FFFFFF; font-size: 28px; letter-spacing: 2px; margin: 0; font-weight: 300; }
        .header p { color: #9A7E44; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin: 10px 0 0 0; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .content h2 { font-size: 20px; color: #1A1A1A; margin-bottom: 20px; font-weight: 400; }
        .coupon-box { background-color: #FAF9F6; border: 1px dashed #9A7E44; padding: 20px; text-align: center; margin: 30px 0; }
        .coupon-code { font-family: monospace; font-size: 24px; color: #9A7E44; font-weight: bold; }
        .cta-btn { display: inline-block; background-color: #1A1A1A; color: #FFFFFF; padding: 15px 30px; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin-top: 20px; }
        .footer { background-color: #FAF9F6; padding: 30px 20px; text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #EAEAEA; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>VANITY</h1>
            <p>Modern Heirlooms</p>
        </div>
        <div class="content">
            <h2>Welcome to Vanity, {{ $user->name }}</h2>
            <p>We are thrilled to have you join our circle. At Vanity, we believe that jewellery should not just be worn; it should tell a story. Every piece in our collection is handcrafted with precision, bringing together fine materials, authentic 925 sterling silver, and timeless design.</p>
            
            @if($couponCode)
            <div class="coupon-box">
                <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888888;">Your Welcome Offer</p>
                <div class="coupon-code">{{ $couponCode }}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #555555;">Use this code at checkout to claim your 10% discount.</p>
            </div>
            @endif

            <p>Explore our seasonal collections, spot the current MCX silver rates live on our platform, and customize your heirloom to your unique taste.</p>
            
            <div style="text-align: center;">
                <a href="{{ url('/') }}" class="cta-btn">Explore The Collections</a>
            </div>
        </div>
        <div class="footer">
            <p>© 2026 Vanity Jewels. All Rights Reserved.<br>{!! nl2br(e(\App\Models\Setting::getValue('store_address', 'Padmini Apartment 44/19 Durgapur Lane Kala Bagan, Chetla, Kolkata, West Bengal 700027'))) !!}</p>
            <p>If you have any questions, reach out to us at {{ \App\Models\Setting::getValue('contact_email', 'thevanityjewels@gmail.com') }}</p>
        </div>
    </div>
</body>
</html>
