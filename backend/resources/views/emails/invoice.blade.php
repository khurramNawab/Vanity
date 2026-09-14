<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $order->order_number }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1A1A1A; font-size: 11px; line-height: 1.4; margin: 0; padding: 0; }
        .invoice-box { max-width: 800px; margin: auto; padding: 20px; }
        table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
        table td { padding: 5px; vertical-align: top; }
        .title { font-size: 24px; font-weight: 300; letter-spacing: 2px; color: #1A1A1A; margin: 0; }
        .subtitle { font-size: 9px; color: #9A7E44; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0; }
        .heading { background: #FAF9F6; border-bottom: 2px solid #EAEAEA; font-weight: bold; text-transform: uppercase; font-size: 9px; color: #888888; }
        .item td { border-bottom: 1px solid #FAF9F6; padding: 10px 5px; }
        .totals-table { width: 45%; float: right; margin-top: 20px; }
        .totals-table td { padding: 5px; }
        .footer { text-align: center; margin-top: 50px; font-size: 8px; color: #888888; border-top: 1px solid #EAEAEA; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="invoice-box">
        <table cellpadding="0" cellspacing="0" style="margin-bottom: 40px;">
            <tr>
                <td style="width: 50%;">
                    <h1 class="title">VANITY</h1>
                    <div class="subtitle">Modern Heirlooms</div>
                </td>
                <td style="text-align: right; width: 50%;">
                    <div style="font-size: 16px; font-weight: bold; color: #9A7E44;">INVOICE</div>
                    <div><strong>Invoice No:</strong> INV-{{ date('Y') }}-{{ str_pad($order->id, 6, '0', STR_PAD_LEFT) }}</div>
                    <div><strong>Date:</strong> {{ $order->created_at->format('d M, Y') }}</div>
                    <div><strong>Order Number:</strong> {{ $order->order_number }}</div>
                </td>
            </tr>
        </table>

        <table cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
            <tr>
                <td style="width: 50%;">
                    <strong>Sold By:</strong><br>
                    Vanity Jewels Private Limited<br>
                    {!! nl2br(e(\App\Models\Setting::getValue('store_address', 'Padmini Apartment 44/19 Durgapur Lane Kala Bagan, Chetla, Kolkata, West Bengal 700027'))) !!}<br>
                    GSTIN: 19AAACV1234F1Z1
                </td>
                <td style="width: 50%;">
                    <strong>Bill To / Ship To:</strong><br>
                    @if($order->fulfillment_method === 'pickup')
                        <em>Store Pickup chosen by customer</em><br>
                        <strong>Customer Contact:</strong> {{ $order->shipping_name }}<br>
                        Phone: {{ $order->shipping_phone }}<br>
                        Email: {{ $order->shipping_email }}
                    @else
                        {{ $order->shipping_name }}<br>
                        {{ $order->shipping_address }}<br>
                        @if($order->shipping_apartment){{ $order->shipping_apartment }}<br>@endif
                        {{ $order->shipping_city }}, {{ $order->shipping_state }} — {{ $order->shipping_zip }}<br>
                        Phone: {{ $order->shipping_phone }}
                    @endif
                </td>
            </tr>
        </table>

        <table cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
            <tr class="heading">
                <td style="width: 45%;">Product Description</td>
                <td style="width: 15%; text-align: right;">Weight (g)</td>
                <td style="width: 15%; text-align: center;">Qty</td>
                <td style="width: 25%; text-align: right;">Total Price</td>
            </tr>
            @foreach($order->items as $item)
            <tr class="item">
                <td>
                    <strong>{{ $item->product->name }}</strong><br>
                    <span style="font-size: 8px; color: #888888;">SKU: {{ $item->product->sku }} | Purity: {{ $item->product->silver_purity }}</span>
                </td>
                <td style="text-align: right;">{{ $item->weight }}g</td>
                <td style="text-align: center;">{{ $item->quantity }}</td>
                <td style="text-align: right;">₹{{ number_format($item->line_total, 2) }}</td>
            </tr>
            @endforeach
        </table>

        <div style="width: 100%; overflow: hidden;">
            <table class="totals-table">
                <tr>
                    <td>Subtotal</td>
                    <td style="text-align: right;">₹{{ number_format($order->subtotal, 2) }}</td>
                </tr>
                <tr>
                    <td>GST (3%)</td>
                    <td style="text-align: right;">₹{{ number_format($order->gst_amount, 2) }}</td>
                </tr>
                <tr>
                    <td>Shipping Fees</td>
                    <td style="text-align: right;">{{ $order->shipping_amount == 0 ? 'FREE' : '₹' . number_format($order->shipping_amount, 2) }}</td>
                </tr>
                @if($order->discount_total > 0)
                <tr style="color: #137333;">
                    <td>Discounts</td>
                    <td style="text-align: right;">-₹{{ number_format($order->discount_total, 2) }}</td>
                </tr>
                @endif
                <tr style="font-weight: bold; border-top: 1px solid #EAEAEA; font-size: 13px;">
                    <td>Total Paid</td>
                    <td style="text-align: right; color: #9A7E44;">₹{{ number_format($order->total_amount, 2) }}</td>
                </tr>
            </table>
            
            <div style="float: left; width: 50%; font-size: 9px; margin-top: 20px;">
                <strong>Payment Information:</strong><br>
                Fulfillment: {{ strtoupper($order->fulfillment_method) }}<br>
                Payment ID: {{ $order->razorpay_payment_id }}<br>
                Status: PAID via Razorpay
            </div>
        </div>

        <div class="footer">
            Thank you for purchasing handcrafted heirlooms from Vanity.<br>
            For any queries or returns, please write to returns@vanity.com or call +91 98765 43210.<br>
            This is a computer-generated document and does not require a physical signature.
        </div>
    </div>
</body>
</html>
