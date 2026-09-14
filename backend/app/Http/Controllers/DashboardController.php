<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\PricingService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected $pricingService;

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    /**
     * Get aggregate KPIs and lists for admin dashboard.
     */
    public function index(Request $request)
    {
        // 1. Total Sales (Paid orders)
        $totalSales = (float) Order::where('payment_status', 'paid')->sum('total_amount');

        // 2. Today's Sales
        $todaySales = (float) Order::where('payment_status', 'paid')
            ->whereDate('created_at', Carbon::today())
            ->sum('total_amount');

        // 3. Orders Count (All real customer orders)
        $ordersCount = Order::count();

        // 4. Customers Count (unique users)
        $customersCount = User::where('role', 'customer')->count();

        // 5. Low Stock Alerts
        $lowStockCount = Product::where('stock_quantity', '<=', 5)->count();

        // 6. Recent Orders (Dynamic live stream)
        $recentOrders = Order::latest()
            ->limit(8)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => '#' . $order->order_number,
                    'raw_id' => $order->id,
                    'customer' => $order->shipping_name ?: ($order->user ? $order->user->name : 'Guest Customer'),
                    'date' => $order->created_at->format('M d, Y, h:i A'),
                    'amount' => '₹' . number_format($order->total_amount, 2),
                    'payment_status' => $order->payment_status,
                    'status' => ucfirst($order->order_status),
                ];
            });

        // 7. Live MCX Silver Rate
        $silverRate = $this->pricingService->getActiveSilverRate();

        $formattedTotalSales = $totalSales >= 100000
            ? '₹' . number_format($totalSales / 100000.0, 2) . 'L'
            : '₹' . number_format($totalSales, 2);

        return response()->json([
            'success' => true,
            'kpis' => [
                'total_sales' => $formattedTotalSales,
                'today_sales' => '₹' . number_format($todaySales, 2),
                'orders' => number_format($ordersCount),
                'customers' => number_format($customersCount),
                'low_stock' => (string) $lowStockCount
            ],
            'recent_orders' => $recentOrders,
            'silver_rate' => $silverRate
        ]);
    }
}
