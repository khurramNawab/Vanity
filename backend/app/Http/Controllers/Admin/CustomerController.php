<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * List all registered customers with aggregate stats.
     */
    public function index(Request $request)
    {
        $customers = User::where('role', 'customer')
            ->withCount('orders')
            ->get()
            ->map(function ($c) {
                $totalSpent = Order::where('user_id', $c->id)
                    ->where('payment_status', 'paid')
                    ->sum('total_amount');

                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'email' => $c->email,
                    'phone' => $c->phone,
                    'address_line1' => $c->address_line1,
                    'address_line2' => $c->address_line2,
                    'city' => $c->city,
                    'state' => $c->state,
                    'pincode' => $c->pincode,
                    'created_at' => $c->created_at,
                    'orders_count' => $c->orders_count,
                    'total_spent' => (float) $totalSpent
                ];
            });

        return response()->json([
            'success' => true,
            'customers' => $customers
        ]);
    }
}
