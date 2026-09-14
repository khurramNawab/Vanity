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
        .content h2 { font-size: 20px; color: #1A1A1A; margin-bottom: 20px; font-weight: 400; text-align: center; }
        .cart-item { border-bottom: 1px solid #FAF9F6; padding: 15px 0; margin-bottom: 10px; }
        .cart-item-details { display: inline-block; width: 75%; vertical-align: middle; }
        .cart-item-price { display: inline-block; width: 20%; text-align: right; font-weight: bold; font-size: 14px; vertical-align: middle; }
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
        <div class="content" style="padding: 40px 30px; line-height: 1.6;">
            @if(!empty($customMessage))
                <h2 style="font-size: 20px; color: #1A1A1A; margin-bottom: 20px; font-weight: 400; text-align: center;">Personal Note from Our Curators</h2>
                <div style="background-color: #FAF9F6; border-left: 3px solid #9A7E44; padding: 15px 20px; margin-bottom: 25px; font-size: 14px; line-height: 1.7; color: #2B2B2B; white-space: pre-wrap;">{{ $customMessage }}</div>
            @elseif($templateType === 'urgency')
                <h2>Only a Few Left!</h2>
                <p>Items in your Vanity shopping cart are selling fast, and inventory is extremely limited. We wanted to let you know before they are gone!</p>
            @elseif($templateType === 'discount')
                <h2>An Exclusive Offer For You</h2>
                <p>We noticed you didn't complete your order, so we'd love to offer you an extra incentive to complete your purchase today.</p>
            @else
                <h2>Did You Forget Something?</h2>
                <p>We saved the items you left in your shopping cart. Simply click the link below to resume your checkout and make them yours.</p>
            @endif

            <div style="margin: 30px 0;">
                @foreach($cartSession->cart_data as $item)
                <div class="cart-item">
                    <div class="cart-item-details">
                        <strong style="font-size: 14px; color: #1A1A1A;">{{ $item['name'] ?? 'Vanity Jewel' }}</strong><br>
                        <span style="font-size: 12px; color: #888888;">Purity: 925 Sterling Silver | Qty: {{ $item['qty'] }}</span>
                    </div>
                    <div class="cart-item-price">
                        ₹{{ number_format(($item['price'] ?? 0) * $item['qty'], 2) }}
                    </div>
                </div>
                @endforeach
            </div>

            @if($couponCode)
            <div class="coupon-box">
                <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888888;">Your Special Coupon Code</p>
                <div class="coupon-code">{{ $couponCode }}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #555555;">Use this code during checkout for 10% off your purchase.</p>
            </div>
            @endif

            <div style="text-align: center; margin-top: 20px;">
                <a href="{{ url('/checkout?cart_session_id=' . $cartSession->id) }}" class="cta-btn">Complete Your Purchase</a>
            </div>
        </div>
        <div class="footer">
            <p>© 2026 Vanity Jewels. All Rights Reserved.<br>{!! nl2br(e(\App\Models\Setting::getValue('store_address', 'Padmini Apartment 44/19 Durgapur Lane Kala Bagan, Chetla, Kolkata, West Bengal 700027'))) !!}</p>
            <p>If you have any questions, reach out to us at {{ \App\Models\Setting::getValue('contact_email', 'thevanityjewels@gmail.com') }}</p>
        </div>
    </div>
</body>
</html>
