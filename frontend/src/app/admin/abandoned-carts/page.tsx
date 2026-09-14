'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function AdminAbandonedCartsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Selection states
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  // Modal states for sending email
  const [showModal, setShowModal] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [targetSession, setTargetSession] = useState<any | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<'nudge' | 'urgency' | 'discount' | 'custom'>('nudge');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [attachDiscount, setAttachDiscount] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const loadSessions = () => {
    setLoading(true);
    fetchApi('/admin/abandoned-carts')
      .then(res => {
        if (res.success) {
          setSessions(res.sessions || []);
          setSelectedIds([]); // Clear selection on reload
        } else {
          setError(res.message || 'Failed to load abandoned carts.');
        }
      })
      .catch(err => setError(err.message || 'Network error.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleOpenSingleModal = (session: any) => {
    setIsBulkMode(false);
    setTargetSession(session);
    setSelectedTemplate('nudge');
    setCustomSubject('');
    setCustomMessage('');
    setAttachDiscount(false);
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const handleOpenBulkModal = () => {
    if (selectedIds.length === 0) return;
    setIsBulkMode(true);
    setTargetSession(null);
    setSelectedTemplate('nudge');
    setCustomSubject('');
    setCustomMessage('');
    setAttachDiscount(false);
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: any = {
        template: selectedTemplate,
        custom_subject: selectedTemplate === 'custom' ? customSubject : undefined,
        custom_message: selectedTemplate === 'custom' ? customMessage : undefined,
        attach_discount: selectedTemplate === 'custom' ? attachDiscount : undefined,
      };

      if (isBulkMode) {
        // Bulk send
        payload.ids = selectedIds;
        const res = await fetchApi('/admin/abandoned-carts/bulk-send-email', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (res.success) {
          setSuccess(res.message || `Bulk recovery emails sent to ${selectedIds.length} users successfully.`);
          setShowModal(false);
          setSelectedIds([]);
          loadSessions();
        } else {
          setError(res.message || 'Failed to send bulk emails.');
        }
      } else {
        // Single send
        if (!targetSession) return;
        const res = await fetchApi(`/admin/abandoned-carts/${targetSession.id}/send-email`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (res.success) {
          setSuccess(`Recovery email successfully queued and sent to ${targetSession.email || 'customer'}.`);
          setShowModal(false);
          setTargetSession(null);
          loadSessions();
        } else {
          setError(res.message || 'Failed to send email.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error while dispatching email.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Selection Checkbox Helpers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === sessions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sessions.map(s => s.id));
    }
  };

  const handleToggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  // Helper for computing cart total value
  const getCartTotal = (items: any[]) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.qty || 1), 0);
  };

  // Helper for formatting time difference
  const getRelativeTime = (timestamp: string) => {
    const past = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="bg-surface p-5 md:p-12">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">Abandoned Checkouts</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Monitor users who started checkout but did not complete payment. Send targeted email reminders with discount codes.
          </p>
        </div>

        {/* Bulk Action Button */}
        {selectedIds.length > 0 && (
          <button
            onClick={handleOpenBulkModal}
            className="px-5 py-2.5 bg-primary text-white hover:bg-zinc-800 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 rounded shadow-md focus:outline-none animate-bounce-subtle"
          >
            <span className="material-symbols-outlined text-[16px]">group</span>
            Bulk Nudge ({selectedIds.length})
          </button>
        )}
      </header>

      {error && <div className="p-3 bg-error-container/20 border border-error/30 text-error text-sm rounded mb-6 max-w-4xl">{error}</div>}
      {success && <div className="p-3 bg-[#e8f5e9] border border-[#a5d6a7] text-[#137333] text-sm rounded mb-6 max-w-4xl">{success}</div>}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden max-w-6xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-on-surface-variant text-sm">Loading abandoned sessions...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant/20 text-xs font-label-upper text-on-surface-variant">
                  <th className="py-4 px-4 text-center w-12">
                    <input
                      type="checkbox"
                      className="accent-primary cursor-pointer w-4 h-4 rounded"
                      checked={sessions.length > 0 && selectedIds.length === sessions.length}
                      onChange={handleToggleSelectAll}
                    />
                  </th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Items Abandoned</th>
                  <th className="py-4 px-6 text-right">Value</th>
                  <th className="py-4 px-6 text-center">Time Abandoned</th>
                  <th className="py-4 px-6 text-center">Mail Follow-up</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-outline-variant/20 text-primary">
                {sessions.length > 0 ? (
                  sessions.map((session) => {
                    const total = getCartTotal(session.cart_data);
                    const isChecked = selectedIds.includes(session.id);
                    return (
                      <tr key={session.id} className={`hover:bg-surface-container-low/30 transition-colors ${isChecked ? 'bg-[#9A7E44]/5' : ''}`}>
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            className="accent-primary cursor-pointer w-4 h-4 rounded"
                            checked={isChecked}
                            onChange={() => handleToggleSelect(session.id)}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-semibold">{session.shipping_name || session.user?.name || 'Guest User'}</span>
                            <span className="text-xs text-on-surface-variant mt-0.5">{session.email}</span>
                            {session.shipping_phone && (
                              <span className="text-[10px] text-on-surface-variant mt-0.5 font-mono">Phone: {session.shipping_phone}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="max-w-[280px] overflow-hidden truncate">
                            {session.cart_data && session.cart_data.map((item: any, idx: number) => (
                              <div key={idx} className="text-xs text-primary font-medium">
                                • {item.name} <span className="text-on-surface-variant font-normal font-sans">x{item.qty}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-semibold">
                          ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-center text-xs text-on-surface-variant font-medium">
                          {getRelativeTime(session.last_activity_at || session.updated_at)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {session.email_sent ? (
                            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-[#e8f5e9] border border-[#a5d6a7] text-[#137333]">
                              Sent ({getRelativeTime(session.email_sent_at)})
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-surface-container border border-outline-variant/30 text-on-surface-variant">
                              Not Sent
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleOpenSingleModal(session)}
                            className="bg-[#1A1A1A] hover:bg-[#9A7E44] text-[#9A7E44] hover:text-[#1A1A1A] border border-[#9A7E44]/40 font-semibold rounded px-3 py-1.5 text-xs transition-colors flex items-center justify-center gap-1.5 ml-auto focus:outline-none"
                          >
                            <span className="material-symbols-outlined text-[16px]">mail</span>
                            Nudge
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-on-surface-variant text-sm">
                      No active abandoned checkouts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Popup for recovery email */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white border border-outline-variant/30 rounded-lg max-w-lg w-full shadow-2xl p-6 relative my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="font-headline-md text-lg text-primary font-bold mb-2">
              {isBulkMode ? `Bulk Send Recovery (${selectedIds.length} carts)` : 'Send Recovery Email'}
            </h3>
            
            <p className="text-xs text-on-surface-variant mb-4">
              {isBulkMode 
                ? `Select a pre-built template or compose custom content for all ${selectedIds.length} selected customers.`
                : `Select a template or write a custom message to dispatch to ${targetSession?.email}.`
              }
            </p>

            <div className="space-y-3 mb-5">
              <label className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-colors ${selectedTemplate === 'nudge' ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:bg-surface-container-low'}`}>
                <input 
                  type="radio" 
                  name="template" 
                  value="nudge"
                  checked={selectedTemplate === 'nudge'}
                  onChange={() => setSelectedTemplate('nudge')}
                  className="accent-primary mt-1"
                />
                <div>
                  <span className="text-sm font-semibold text-primary block">Complete Purchase (Standard Nudge)</span>
                  <span className="text-[10px] text-on-surface-variant block">Warm reminder about items saved in checkout.</span>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-colors ${selectedTemplate === 'urgency' ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:bg-surface-container-low'}`}>
                <input 
                  type="radio" 
                  name="template" 
                  value="urgency"
                  checked={selectedTemplate === 'urgency'}
                  onChange={() => setSelectedTemplate('urgency')}
                  className="accent-primary mt-1"
                />
                <div>
                  <span className="text-sm font-semibold text-primary block">Only a Few Left (Urgency Reminder)</span>
                  <span className="text-[10px] text-on-surface-variant block">Urgency banner suggesting limited inventory counts.</span>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-colors ${selectedTemplate === 'discount' ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:bg-surface-container-low'}`}>
                <input 
                  type="radio" 
                  name="template" 
                  value="discount"
                  checked={selectedTemplate === 'discount'}
                  onChange={() => setSelectedTemplate('discount')}
                  className="accent-primary mt-1"
                />
                <div>
                  <span className="text-sm font-semibold text-primary block">10% Off Incentive (Auto-create Coupon)</span>
                  <span className="text-[10px] text-on-surface-variant block">Auto-creates a unique 10% coupon code and links it.</span>
                </div>
              </label>

              {/* Custom Message / Add Content Section */}
              <label className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-colors ${selectedTemplate === 'custom' ? 'border-primary bg-[#9A7E44]/10 shadow-sm' : 'border-outline-variant/30 hover:bg-surface-container-low'}`}>
                <input 
                  type="radio" 
                  name="template" 
                  value="custom"
                  checked={selectedTemplate === 'custom'}
                  onChange={() => setSelectedTemplate('custom')}
                  className="accent-primary mt-1"
                />
                <div className="w-full">
                  <span className="text-sm font-semibold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">edit_note</span>
                    Custom Message (Add Content Section)
                  </span>
                  <span className="text-[10px] text-on-surface-variant block">Compose your own personalized message and custom subject.</span>
                </div>
              </label>
            </div>

            {/* Custom Content Inputs Section */}
            {selectedTemplate === 'custom' && (
              <div className="bg-[#FAF9F6] border border-[#9A7E44]/30 rounded-lg p-4 mb-5 space-y-3.5 animate-fade-in">
                <div className="flex items-center justify-between border-b border-[#9A7E44]/20 pb-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">feed</span>
                    Custom Content Editor
                  </span>
                  <span className="text-[10px] text-secondary font-semibold">Live Personalized Body</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Email Subject Line:
                  </label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="e.g., We saved your handcrafted 925 silver pieces at Vanity"
                    className="w-full bg-white border border-outline-variant/50 rounded px-3 py-2 text-xs text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Custom Message Body / Personal Note:
                  </label>
                  <textarea
                    rows={4}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="e.g., Dear Jewellery Lover,\n\nWe noticed you didn't complete your order for your selected handcrafted silver pieces. Our Kolkata atelier has reserved your items for 24 hours.\n\nLet us know if you need any assistance."
                    className="w-full bg-white border border-outline-variant/50 rounded p-3 text-xs text-primary focus:outline-none focus:border-primary leading-relaxed font-sans"
                  />
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attachDiscount}
                    onChange={(e) => setAttachDiscount(e.target.checked)}
                    className="accent-primary w-4 h-4 rounded"
                  />
                  <span className="text-xs text-on-surface font-medium">
                    Also generate & attach an automatic 10% coupon code (RECOVER-XXXXXX)
                  </span>
                </label>
              </div>
            )}

            <div className="flex gap-2 justify-end border-t border-outline-variant/20 pt-4">
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="bg-primary text-on-primary hover:bg-opacity-95 font-semibold text-xs px-5 py-2.5 rounded transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                {sendingEmail ? 'Queuing emails...' : 'Send Recovery Email'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setTargetSession(null);
                }}
                className="border border-outline-variant hover:bg-surface-container-low font-semibold text-xs px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
