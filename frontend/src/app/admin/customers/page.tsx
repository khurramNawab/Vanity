'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchApi('/admin/customers')
      .then(res => {
        if (res.success) {
          setCustomers(res.customers || []);
        } else {
          setError(res.message || 'Failed to load customers.');
        }
      })
      .catch(err => setError(err.message || 'Network error.'))
      .finally(() => setLoading(false));
  }, []);

  // Filter customers based on search query
  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    );
  });

  const getFullAddress = (c: any) => {
    const parts = [c.address_line1, c.address_line2, c.city, c.state, c.pincode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '—';
  };

  return (
    <div className="bg-surface p-5 md:p-12">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">Customers Management</h2>
          <p className="text-on-surface-variant text-sm mt-1">Review registered customers, inspect profiles, and check purchasing history.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-xs w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm text-primary"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {error && <div className="p-3 bg-error-container/20 border border-error/30 text-error text-sm rounded mb-6 max-w-4xl">{error}</div>}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden max-w-6xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-on-surface-variant text-sm">Loading customers list...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant/20 text-xs font-label-upper text-on-surface-variant">
                  <th className="py-4 px-6">Customer Details</th>
                  <th className="py-4 px-6">Registered Date</th>
                  <th className="py-4 px-6">Address</th>
                  <th className="py-4 px-6 text-center">Orders</th>
                  <th className="py-4 px-6 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-outline-variant/20 text-primary">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/20 overflow-hidden shrink-0">
                            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">person</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-primary">{c.name}</span>
                            <span className="text-xs text-on-surface-variant mt-0.5">{c.email}</span>
                            {c.phone && (
                              <span className="text-[10px] text-on-surface-variant font-mono mt-0.5">Phone: {c.phone}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-on-surface-variant">
                        {new Date(c.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-6 text-xs text-on-surface-variant max-w-xs truncate">
                        {getFullAddress(c)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#9A7E44]/10 text-[#9A7E44] border border-[#9A7E44]/20">
                          {c.orders_count} orders
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-semibold">
                        ₹{Number(c.total_spent).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-on-surface-variant text-sm">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
