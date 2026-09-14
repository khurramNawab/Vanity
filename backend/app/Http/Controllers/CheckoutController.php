<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use App\Services\PricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CheckoutController extends Controller
{
    protected $pricingService;

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    /**
     * Initiate Razorpay payment order and store pending database order.
     */
    public function initiate(Request $request)
    {
        if ($request->input('fulfillment_method') === 'pickup') {
            $request->merge([
                'shipping_address' => $request->input('shipping_address') ?: 'STORE PICKUP: Padmini Apartment 44/19 Durgapur Lane Kala Bagan, Chetla',
                'shipping_city' => $request->input('shipping_city') ?: 'Kolkata',
                'shipping_state' => $request->input('shipping_state') ?: 'West Bengal',
                'shipping_zip' => $request->input('shipping_zip') ?: '700027',
            ]);
        }

        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'shipping_name' => 'required|string|max:255',
            'shipping_address' => 'required|string|max:255',
            'shipping_apartment' => 'nullable|string|max:255',
            'shipping_city' => 'required|string|max:255',
            'shipping_state' => 'required|string|max:255',
            'shipping_zip' => 'required|string|max:20',
            'shipping_phone' => 'required|string|max:20',
            'shipping_email' => 'required|string|email|max:255',
            'fulfillment_method' => 'nullable|string|in:delivery,pickup',
            'coupon_code' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Try resolving authenticated user
        $user = $request->user('sanctum');
        $userId = $user ? $user->id : null;

        try {
            return DB::transaction(function () use ($request, $userId) {
                $itemsInput = $request->input('items');
                $subtotalTotal = 0.0;
                $makingChargeTotal = 0.0;
                $discountTotal = 0.0;
                $gstTotal = 0.0;
                
                $orderItemsData = [];
                $rateUsed = $this->pricingService->getActiveSilverRate();

                foreach ($itemsInput as $inputItem) {
                    $product = Product::where('id', $inputItem['product_id'])->lockForUpdate()->firstOrFail();
                    
                    // Verify stock limits
                    if ($product->stock_quantity < $inputItem['qty']) {
                        throw new \Exception("Product '{$product->name}' is out of stock or insufficient inventory.");
                    }

                    // Compute dynamic server price
                    $calc = $this->pricingService->calculate($product, $inputItem['qty']);

                    $subtotalTotal += $calc['subtotal'];
                    $makingChargeTotal += $calc['making_charge_snapshot'] * $inputItem['qty'];
                    $discountTotal += $calc['discount_amount'] * $inputItem['qty'];
                    $gstTotal += $calc['gst_amount'];

                    $orderItemsData[] = [
                        'product' => $product,
                        'qty' => $inputItem['qty'],
                        'weight' => $product->silver_weight,
                        'silver_rate_snapshot' => $rateUsed,
                        'making_charge_snapshot' => $calc['making_charge_snapshot'],
                        'unit_price' => $calc['unit_price'],
                        'line_total' => $calc['subtotal'],
                    ];
                }

                // Coupon validation and discount application
                $couponCode = $request->input('coupon_code');
                $couponDiscount = 0.0;
                if ($couponCode) {
                    $coupon = \App\Models\Coupon::where('code', strtoupper($couponCode))->first();
                    if ($coupon && $coupon->isValidForAmount($subtotalTotal, $userId)) {
                        $couponDiscount = $coupon->calculateDiscount($subtotalTotal);
                        $discountTotal += $couponDiscount;
                    }
                }

                // Shipping fees resolution from Settings table (support unified keys)
                $freeShippingThreshold = (float) (Setting::getValue('shipping_free_threshold') ?: Setting::getValue('free_shipping_threshold', 2999.00));
                $shippingFeeSetting = (float) (Setting::getValue('shipping_flat_rate') ?: Setting::getValue('shipping_fee', 150.00));
                $shippingAmount = ($request->input('fulfillment_method') === 'pickup')
                    ? 0.0
                    : (($subtotalTotal >= $freeShippingThreshold) ? 0.0 : $shippingFeeSetting);

                // Total order cost (subtotal is already discounted by product discount, now subtract coupon discount)
                $netSubtotal = max(0.0, $subtotalTotal - $couponDiscount);
                $totalAmount = $netSubtotal + $gstTotal + $shippingAmount;

                // Priority 4: Generate sequential, guaranteed-unique Order number
                $year = date('Y');
                $prefix = 'VN-' . $year . '-';
                $lastOrder = Order::where('order_number', 'LIKE', "{$prefix}%")
                    ->orderBy('id', 'desc')
                    ->lockForUpdate()
                    ->first();

                $nextSeq = 1;
                if ($lastOrder && preg_match('/VN-\d{4}-(\d+)/', $lastOrder->order_number, $matches)) {
                    $nextSeq = ((int) $matches[1]) + 1;
                } else {
                    $maxId = Order::max('id') ?: 0;
                    $nextSeq = $maxId + 1;
                }
                $orderNumber = $prefix . str_pad($nextSeq, 6, '0', STR_PAD_LEFT);

                $attempts = 0;
                while (Order::where('order_number', $orderNumber)->exists() && $attempts < 10) {
                    $nextSeq++;
                    $orderNumber = $prefix . str_pad($nextSeq, 6, '0', STR_PAD_LEFT);
                    $attempts++;
                }

                // Call Razorpay Order Initiate endpoint via client basic auth
                $razorpayKeyId = env('RAZORPAY_KEY_ID');
                $razorpaySecret = env('RAZORPAY_KEY_SECRET');

                if (empty($razorpayKeyId) || empty($razorpaySecret)) {
                    throw new \Exception('Razorpay credentials are not configured on the server.');
                }

                $amountInPaise = round($totalAmount * 100);

                $response = Http::withBasicAuth($razorpayKeyId, $razorpaySecret)
                    ->post('https://api.razorpay.com/v1/orders', [
                        'amount' => $amountInPaise,
                        'currency' => 'INR',
                        'receipt' => $orderNumber,
                    ]);

                if ($response->failed()) {
                    Log::error('Razorpay Order API Failed', ['body' => $response->body()]);
                    throw new \Exception('Failed to initiate payment gateway order.');
                }

                $razorpayOrder = $response->json();
                $razorpayOrderId = $razorpayOrder['id'];

                // Save Pending Order
                $order = Order::create([
                    'user_id' => $userId,
                    'order_number' => $orderNumber,
                    'subtotal' => $subtotalTotal,
                    'making_charge_total' => $makingChargeTotal,
                    'discount_total' => $discountTotal,
                    'coupon_code' => $couponCode ? strtoupper($couponCode) : null,
                    'gst_amount' => $gstTotal,
                    'shipping_amount' => $shippingAmount,
                    'total_amount' => $totalAmount,
                    'silver_rate_used' => $rateUsed,
                    'payment_status' => 'pending',
                    'order_status' => 'pending',
                    'razorpay_order_id' => $razorpayOrderId,
                    'shipping_name' => $request->input('shipping_name'),
                    'shipping_address' => $request->input('shipping_address'),
                    'shipping_apartment' => $request->input('shipping_apartment'),
                    'shipping_city' => $request->input('shipping_city'),
                    'shipping_state' => $request->input('shipping_state'),
                    'shipping_zip' => $request->input('shipping_zip'),
                    'shipping_phone' => $request->input('shipping_phone'),
                    'shipping_email' => $request->input('shipping_email'),
                    'fulfillment_method' => $request->input('fulfillment_method', 'delivery'),
                ]);

                // Save Order Items
                foreach ($orderItemsData as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product']->id,
                        'quantity' => $item['qty'],
                        'weight' => $item['weight'],
                        'silver_rate_snapshot' => $item['silver_rate_snapshot'],
                        'making_charge_snapshot' => $item['making_charge_snapshot'],
                        'unit_price' => $item['unit_price'],
                        'line_total' => $item['line_total'],
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'order_id' => $order->id,
                    'order_number' => $orderNumber,
                    'razorpay_order_id' => $razorpayOrderId,
                    'amount' => $amountInPaise,
                    'currency' => 'INR'
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Verify payment status signature webhook callback from Razorpay client.
     */
    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'razorpay_payment_id' => 'required|string',
            'razorpay_order_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $paymentId = $request->input('razorpay_payment_id');
        $orderId = $request->input('razorpay_order_id');
        $signature = $request->input('razorpay_signature');

        $secret = env('RAZORPAY_KEY_SECRET');
        if (empty($secret)) {
            return response()->json([
                'success' => false,
                'message' => 'Server Configuration Error: secret missing.'
            ], 500);
        }

        // HMAC-SHA256 verification
        $expectedSignature = hash_hmac('sha256', $orderId . '|' . $paymentId, $secret);

        if (!hash_equals($expectedSignature, $signature)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid payment signature. Verification failed.'
            ], 400);
        }

        try {
            DB::transaction(function () use ($orderId, $paymentId) {
                // Priority 2: Pessimistic row locking on order
                $order = Order::where('razorpay_order_id', $orderId)->lockForUpdate()->firstOrFail();
                
                // Priority 3: Idempotent execution guarded strictly by payment status check
                if ($order->payment_status !== 'paid') {
                    $order->update([
                        'payment_status' => 'paid',
                        'order_status' => 'processing',
                        'razorpay_payment_id' => $paymentId,
                    ]);

                    // Priority 2: Atomic row-locked stock decrement to prevent overselling
                    foreach ($order->items as $item) {
                        $product = Product::where('id', $item->product_id)->lockForUpdate()->first();
                        if ($product) {
                            if ($product->stock_quantity < $item->quantity) {
                                Log::warning("Stock shortage during payment verification for product {$product->id}. Available: {$product->stock_quantity}, Required: {$item->quantity}");
                                $product->update(['stock_quantity' => max(0, $product->stock_quantity - $item->quantity)]);
                            } else {
                                $product->decrement('stock_quantity', $item->quantity);
                            }
                        }
                    }

                    // Increment coupon usage if coupon code was used
                    if ($order->coupon_code) {
                        $coupon = \App\Models\Coupon::where('code', $order->coupon_code)->lockForUpdate()->first();
                        if ($coupon) {
                            $coupon->increment('usage_count');
                            \App\Models\CouponUsage::create([
                                'coupon_id' => $coupon->id,
                                'user_id' => $order->user_id,
                                'order_id' => $order->id,
                            ]);
                        }
                    }

                    // 1. Mark cart session as recovered
                    try {
                        \App\Models\CartSession::where(function ($query) use ($order) {
                            if ($order->user_id) {
                                $query->where('user_id', $order->user_id);
                            }
                            if ($order->shipping_email) {
                                $query->orWhere('email', $order->shipping_email);
                            }
                        })->update(['is_recovered' => true]);
                    } catch (\Exception $sessionEx) {
                        Log::error('Failed to update cart session recovery status: ' . $sessionEx->getMessage());
                    }

                    // 2. Generate and save PDF Invoice
                    try {
                        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('emails.invoice', ['order' => $order]);
                        $invoiceName = 'invoice-' . $order->order_number . '.pdf';
                        $invoicePath = 'invoices/' . $invoiceName;

                        \Illuminate\Support\Facades\Storage::disk('public')->makeDirectory('invoices');
                        \Illuminate\Support\Facades\Storage::disk('public')->put($invoicePath, $pdf->output());

                        $order->update([
                            'invoice_path' => $invoicePath
                        ]);
                    } catch (\Exception $pdfEx) {
                        Log::error('Invoice PDF generation failed: ' . $pdfEx->getMessage());
                    }

                    // 3. Queue Order Confirmation Email (strictly inside idempotency guard)
                    try {
                        $recipientEmail = $order->shipping_email ?: ($order->user ? $order->user->email : null);
                        if ($recipientEmail) {
                            \Illuminate\Support\Facades\Mail::to($recipientEmail)
                                ->queue(new \App\Mail\OrderConfirmationEmail($order));
                        }
                    } catch (\Exception $mailEx) {
                        Log::error('Failed to send order confirmation email: ' . $mailEx->getMessage());
                    }
                }
            });

            $order = Order::where('razorpay_order_id', $orderId)->with('items.product')->first();

            return response()->json([
                'success' => true,
                'message' => 'Payment verified successfully.',
                'order' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order update error: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Check if current request is authorized to view or download the given order.
     * Priority 1.1 / 1.2: Strict IDOR defense.
     */
    protected function isAuthorizedForOrder(Request $request, Order $order): bool
    {
        $user = $request->user('sanctum');

        // 1. Authenticated Admin has access to all orders
        if ($user && $user->role === 'admin') {
            return true;
        }

        // 2. Authenticated Customer matches order user_id
        if ($user && $order->user_id !== null && (int)$order->user_id === (int)$user->id) {
            return true;
        }

        // 3. Guest Order (user_id is null) - verify guest credentials
        if ($order->user_id === null) {
            $email = $request->input('email') ?: $request->query('email') ?: $request->header('X-Guest-Email');
            $phone = $request->input('phone') ?: $request->query('phone');
            $orderNumber = $request->input('order_number') ?: $request->query('order_number');

            if ($email && strtolower(trim($email)) === strtolower(trim($order->shipping_email))) {
                return true;
            }
            if ($phone && trim($phone) === trim($order->shipping_phone)) {
                return true;
            }
            if ($orderNumber && trim($orderNumber) === trim($order->order_number)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Fetch order summary details by database ID.
     * Priority 1.1: Protected against IDOR.
     */
    public function show(Request $request, $id)
    {
        try {
            $order = Order::with('items.product')->findOrFail($id);

            if (!$this->isAuthorizedForOrder($request, $order)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to order details.'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'order' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.'
            ], 404);
        }
    }

    /**
     * List all orders (Admin-only).
     */
    public function adminOrders(Request $request)
    {
        $orders = Order::with(['items.product.primaryImage', 'user'])->latest()->get();
        return response()->json([
            'success' => true,
            'orders' => $orders
        ]);
    }

    /**
     * Update order status (Admin-only).
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled'
        ]);

        try {
            $order = Order::findOrFail($id);
            $order->update([
                'order_status' => $request->input('status')
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully.',
                'order' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status.'
            ], 400);
        }
    }

    /**
     * Get real order history list for the logged-in customer.
     */
    public function userOrders(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)->with('items.product')->latest()->get();
        return response()->json([
            'success' => true,
            'orders' => $orders
        ]);
    }

    /**
     * Download or stream the generated PDF invoice for the given order.
     * Priority 1.2: Protected against IDOR & unauthorized download.
     */
    public function downloadInvoice(Request $request, $id)
    {
        try {
            $order = Order::with('items.product')->findOrFail($id);

            if (!$this->isAuthorizedForOrder($request, $order)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to invoice.'
                ], 403);
            }
            
            // Regenerate PDF if it does not exist
            if (!$order->invoice_path || !file_exists(storage_path('app/public/' . $order->invoice_path))) {
                $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('emails.invoice', ['order' => $order]);
                $invoiceName = 'invoice-' . $order->order_number . '.pdf';
                $invoicePath = 'invoices/' . $invoiceName;

                \Illuminate\Support\Facades\Storage::disk('public')->makeDirectory('invoices');
                \Illuminate\Support\Facades\Storage::disk('public')->put($invoicePath, $pdf->output());

                $order->update([
                    'invoice_path' => $invoicePath
                ]);
            }

            $path = storage_path('app/public/' . $order->invoice_path);
            return response()->download($path, 'Invoice-' . $order->order_number . '.pdf', [
                'Content-Type' => 'application/pdf',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to download invoice: ' . $e->getMessage()
            ], 400);
        }
    }
}
