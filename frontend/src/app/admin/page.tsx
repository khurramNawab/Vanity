'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  Processing: 'bg-surface-container-high text-on-surface border border-outline-variant',
  Shipped: 'bg-surface-variant text-on-surface-variant border border-outline-variant',
  Delivered: 'bg-surface-container-lowest text-outline border border-outline-variant',
  Paid: 'bg-[#e8f5e9] text-[#137333] border border-[#a5d6a7]',
  Pending: 'bg-[#fff8e1] text-[#b78103] border border-[#ffe082]'
};

export default function AdminDashboardPage() {
  const [kpiCards, setKpiCards] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [mcxRate, setMcxRate] = useState(84500);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchApi('/admin/dashboard')
      .then(res => {
        if (res.success) {
          const cards = [
            { label: 'Total Sales', value: res.kpis.total_sales, delta: 'Accumulated total', icon: 'account_balance_wallet', up: true },
            { label: "Today's Sales", value: res.kpis.today_sales, delta: 'Realtime spot sales', icon: 'point_of_sale', up: true },
            { label: 'Orders', value: res.kpis.orders, delta: 'Verified orders', icon: 'shopping_bag', up: true },
            { label: 'Customers', value: res.kpis.customers, delta: 'Registered customers', icon: 'group', up: true },
            { label: 'Low Stock Alerts', value: res.kpis.low_stock, delta: 'Stock count <= 5', icon: 'warning', up: false },
          ];
          setKpiCards(cards);
          setRecentOrders(res.recent_orders || []);
          setMcxRate(Number(res.silver_rate) * 1000);
        }
      })
      .catch(err => console.error('Error fetching admin dashboard metrics:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-surface p-5 md:p-12">

      {/* Header */}
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">Dashboard</h2>
          <p className="text-on-surface-variant text-sm mt-1">Overview of store performance &amp; metrics.</p>
        </div>
        <button className="bg-primary text-on-primary px-4 py-2 rounded font-body-md text-sm hover:bg-inverse-surface transition-colors">
          Download Report
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-on-surface-variant font-medium">Loading metrics overview...</p>
        </div>
      ) : (
        <>
          {/* KPI Row — 5 cards */}
          <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {kpiCards.map((card) => (
              <div key={card.label} className="bg-surface-container-lowest border border-outline-variant p-4 flex flex-col justify-between h-32 rounded">
                <div className="flex justify-between items-start">
                  <span className="font-label-upper text-label-upper text-on-surface-variant uppercase text-[10px]">{card.label}</span>
                  <span className="material-symbols-outlined text-outline-variant text-lg">{card.icon}</span>
                </div>
                <div className="mt-4">
                  <div className="font-price-display text-price-display text-primary">{card.value}</div>
                  <div className={`flex items-center gap-1 text-xs mt-1 ${card.up ? 'text-secondary' : 'text-error'}`}>
                    <span className="material-symbols-outlined text-sm">{card.up ? 'arrow_upward' : 'arrow_downward'}</span>
                    <span>{card.delta}</span>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Main Dashboard Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

            {/* Revenue Chart — 2 cols */}
            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant p-6 rounded flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-body-lg text-body-lg font-semibold text-primary">Revenue Overview</h3>
                <select className="bg-surface-container-lowest border border-outline-variant text-sm px-2 py-1 rounded text-on-surface-variant focus:ring-0 focus:border-primary">
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
              </div>
              {/* SVG Chart */}
              <div className="flex-1 relative w-full min-h-[200px] border-b border-l border-outline-variant pt-4 pr-4">
                {/* Y Labels */}
                <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between text-xs text-outline-variant py-4">
                  <span>1M</span><span>500k</span><span>0</span>
                </div>
                {/* X Labels */}
                <div className="absolute left-0 -bottom-6 w-full flex justify-between text-xs text-outline-variant px-4">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
                </div>
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <line className="text-outline-variant opacity-30" stroke="currentColor" strokeDasharray="2,2" strokeWidth="0.2" x1="0" x2="100" y1="25" y2="25" />
                  <line className="text-outline-variant opacity-30" stroke="currentColor" strokeDasharray="2,2" strokeWidth="0.2" x1="0" x2="100" y1="50" y2="50" />
                  <line className="text-outline-variant opacity-30" stroke="currentColor" strokeDasharray="2,2" strokeWidth="0.2" x1="0" x2="100" y1="75" y2="75" />
                  <polyline fill="none" points="0,80 15,60 30,70 45,30 60,40 75,10 100,20" stroke="#1a1c1a" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  <circle cx="15" cy="60" fill="#1a1c1a" r="3" />
                  <circle cx="45" cy="30" fill="#1a1c1a" r="3" />
                  <circle cx="75" cy="10" fill="#1a1c1a" r="3" />
                </svg>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">
              {/* MCX Silver Rate */}
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded">
                <h3 className="font-body-lg text-body-lg font-semibold text-primary mb-4 flex items-center justify-between">
                  MCX Silver Rate
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-on-surface-variant mb-1">Current Market API (Live)</p>
                  <div className="font-price-display text-price-display text-primary">
                    ₹{mcxRate.toLocaleString('en-IN')} <span className="text-sm font-normal text-on-surface-variant">/ kg</span>
                  </div>
                </div>
                <div className="text-xs text-outline-variant">Last updated: Just now</div>
              </div>

              {/* Active Campaigns */}
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded flex-1">
                <h3 className="font-body-lg text-body-lg font-semibold text-primary mb-4">Active Campaigns</h3>
                <ul className="space-y-4">
                  <li className="flex items-center justify-between border-b border-outline-variant pb-2">
                    <div>
                      <p className="text-sm font-medium text-primary">Diwali Heirloom Edit</p>
                      <p className="text-xs text-on-surface-variant">Ends in 12 days</p>
                    </div>
                    <span className="bg-secondary-container text-on-secondary-container text-xs px-2 py-1 rounded font-medium">Active</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary">Bridal Silver Sets</p>
                      <p className="text-xs text-on-surface-variant">Ongoing</p>
                    </div>
                    <span className="bg-surface-variant text-on-surface-variant text-xs px-2 py-1 rounded font-medium">Scheduled</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

      {/* Recent Orders Table */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center">
          <div>
            <h3 className="font-body-lg text-body-lg font-semibold text-primary">Recent Orders</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Live stream of incoming store orders</p>
          </div>
          <Link className="text-sm font-semibold text-secondary hover:underline flex items-center gap-1" href="/admin/orders">
            <span>View All Orders</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant text-xs uppercase text-on-surface-variant font-label-upper">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Payment</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-primary">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-outline-variant hover:bg-surface-container transition-colors last:border-0">
                    <td className="p-4 font-medium">
                      <Link href="/admin/orders" className="font-mono font-bold text-primary hover:underline hover:text-secondary">
                        {order.id}
                      </Link>
                    </td>
                    <td className="p-4 font-medium">{order.customer}</td>
                    <td className="p-4 text-xs text-on-surface-variant">{order.date}</td>
                    <td className="p-4 font-mono font-semibold">{order.amount}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${
                        order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {order.payment_status || 'pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${STATUS_STYLES[order.status] || STATUS_STYLES.Pending}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant text-sm">
                    No orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      </>
      )}
    </div>
  );
}
