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
        .receipt-summary { background-color: #FAF9F6; border: 1px solid #EAEAEA; padding: 20px; margin-bottom: 30px; font-size: 13px; }
        .receipt-summary table { width: 100%; }
        .receipt-summary td { padding: 4px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; font-size: 13px; }
        .items-table th { background-color: #FAF9F6; text-align: left; padding: 10px; border-bottom: 2px solid #EAEAEA; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; color: #888888; }
        .items-table td { padding: 12px 10px; border-bottom: 1px solid #FAF9F6; vertical-align: top; }
        .breakdown-table { width: 100%; margin-top: 20px; font-size: 13px; border-top: 2px solid #EAEAEA; }
        .breakdown-table td { padding: 8px 10px; }
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
            <h2>Order Confirmed</h2>
            <p>Thank you for shopping with Vanity. We have received payment for your order and are currently preparing your handcrafted heirlooms. Below is the summary of your transaction. Your official invoice is attached to this email as a PDF.</p>
            
            <div class="receipt-summary">
                <table>
                    <tr>
                        <td><strong>Order Number:</strong></td>
                        <td>{{ $order->order_number }}</td>
                    </tr>
                    <tr>
                        <td><strong>Fulfillment Method:</strong></td>
                        <td>{{ $order->fulfillment_method === 'pickup' ? 'Store Pickup' : 'Home Delivery' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Payment Status:</strong></td>
                        <td>Paid (Razorpay: {{ $order->razorpay_payment_id }})</td>
                    </tr>
                    <tr>
                        <td><strong>Estimated Delivery:</strong></td>
                        <td>
                            @if($order->fulfillment_method === 'pickup')
                                Ready for pickup within 2-3 business days
                            @else
                                4-5 business days
                            @endif
                        </td>
                    </tr>
                </table>
            </div>

            <div style="font-size: 14px; margin-bottom: 10px;">
                @if($order->fulfillment_method === 'pickup')
                    <strong>Pickup Location:</strong><br>
                    Vanity Jewels Studio<br>
                    Padmini Apartment 44/19 Durgapur Lane Kala Bagan, Chetla, Kolkata 700027<br>
                    Hours: Mon-Sat, 11:00 AM - 8:00 PM
                @else
                    <strong>Shipping Address:</strong><br>
                    {{ $order->shipping_name }}<br>
                    {{ $order->shipping_address }}<br>
                    @if($order->shipping_apartment){{ $order->shipping_apartment }}<br>@endif
                    {{ $order->shipping_city }}, {{ $order->shipping_state }} — {{ $order->shipping_zip }}<br>
                    Phone: {{ $order->shipping_phone }}
                @endif
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Total Price</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                    <tr>
                        <td>
                            <strong>{{ $item->product->name }}</strong><br>
                            <span style="font-size: 11px; color: #888888;">
                                Weight: {{ $item->weight }}g | Purity: {{ $item->product->silver_purity }}
                            </span>
                        </td>
                        <td style="text-align: center;">{{ $item->quantity }}</td>
                        <td style="text-align: right;">₹{{ number_format($item->line_total, 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>

            <table class="breakdown-table">
                <tr>
                    <td>Subtotal</td>
                    <td style="text-align: right;">₹{{ number_format($order->subtotal, 2) }}</td>
                </tr>
                <tr>
                    <td>GST (3%)</td>
                    <td style="text-align: right;">₹{{ number_format($order->gst_amount, 2) }}</td>
                </tr>
                <tr>
                    <td>Shipping Charges</td>
                    <td style="text-align: right;">{{ $order->shipping_amount == 0 ? 'FREE' : '₹' . number_format($order->shipping_amount, 2) }}</td>
                </tr>
                @if($order->discount_total > 0)
                <tr style="color: #137333;">
                    <td>Discounts</td>
                    <td style="text-align: right;">-₹{{ number_format($order->discount_total, 2) }}</td>
                </tr>
                @endif
                <tr style="font-weight: bold; font-size: 16px; border-top: 1px solid #EAEAEA;">
                    <td>Total Paid</td>
                    <td style="text-align: right; color: #9A7E44;">₹{{ number_format($order->total_amount, 2) }}</td>
                </tr>
            </table>

            <div style="text-align: center; margin-top: 40px;">
                <a href="{{ url('/order-confirmation?order_id=' . $order->id) }}" class="cta-btn">Track Your Order</a>
            </div>
        </div>
        <div class="footer">
            <p>© 2026 Vanity Jewels. All Rights Reserved.<br>{!! nl2br(e(\App\Models\Setting::getValue('store_address', 'Padmini Apartment 44/19 Durgapur Lane Kala Bagan, Chetla, Kolkata, West Bengal 700027'))) !!}</p>
            <p>If you have any questions, reach out to us at {{ \App\Models\Setting::getValue('contact_email', 'thevanityjewels@gmail.com') }}</p>
        </div>
    </div>
</body>
</html>
