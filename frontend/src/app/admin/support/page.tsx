'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchTickets = () => {
    setLoading(true);
    fetchApi('/admin/support')
      .then(res => {
        if (res.success) {
          setTickets(res.tickets || []);
        } else {
          setError(res.message || 'Failed to load support tickets.');
        }
      })
      .catch(err => setError(err.message || 'Network error.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolve = async (ticketId: number) => {
    setError(null);
    setSuccess(null);

    try {
      const res = await fetchApi(`/admin/support/${ticketId}/resolve`, {
        method: 'POST'
      });

      if (res.success) {
        setSuccess('Support ticket marked as resolved.');
        // Refresh local items
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t));
      } else {
        setError(res.message || 'Failed to resolve ticket.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    }
  };

  return (
    <div className="bg-surface p-5 md:p-12">
      <header className="mb-8">
        <h2 className="font-headline-md text-headline-md text-primary">Support Center</h2>
        <p className="text-on-surface-variant text-sm mt-1">Review contact inquiries and client requests sent via the storefront contact portal.</p>
      </header>

      {error && <div className="p-3 bg-error-container/20 border border-error/30 text-error text-sm rounded mb-6 max-w-4xl">{error}</div>}
      {success && <div className="p-3 bg-[#e8f5e9] border border-[#a5d6a7] text-[#137333] text-sm rounded mb-6 max-w-4xl">{success}</div>}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden max-w-6xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-on-surface-variant text-sm">Loading support inquiries...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant/20 text-xs font-label-upper text-on-surface-variant">
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Subject</th>
                  <th className="py-4 px-6">Message</th>
                  <th className="py-4 px-6 text-center">Received Date</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-outline-variant/20 text-primary">
                {tickets.length > 0 ? (
                  tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary">{t.name}</span>
                          <span className="text-xs text-on-surface-variant mt-0.5">{t.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-xs max-w-xs truncate">
                        {t.subject || '—'}
                      </td>
                      <td className="py-4 px-6 text-xs text-on-surface-variant max-w-sm whitespace-pre-wrap leading-relaxed">
                        {t.message}
                      </td>
                      <td className="py-4 px-6 text-center text-xs text-on-surface-variant">
                        {new Date(t.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-bold border ${
                          t.status === 'resolved'
                            ? 'bg-[#e8f5e9] text-[#1b5e20] border-[#a5d6a7]'
                            : 'bg-[#fff8e1] text-[#b78103] border-[#ffe082]'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {t.status === 'pending' && (
                          <button
                            onClick={() => handleResolve(t.id)}
                            className="bg-[#1A1A1A] hover:bg-[#1b5e20] text-white font-semibold rounded px-3 py-1.5 text-xs transition-colors focus:outline-none"
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant text-sm">
                      No support tickets logged.
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
