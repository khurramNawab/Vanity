'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function AdminSilverRatePage() {
  const [rate, setRate] = useState(84.50); // per gram
  const [override, setOverride] = useState('0'); // '0' or '1'
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchRates = () => {
    setLoading(true);
    // Fetch live settings first to read manual override values
    fetchApi('/admin/settings')
      .then(settingsRes => {
        if (settingsRes.success) {
          const val = settingsRes.settings.silver_rate_manual_value || '84.50';
          const over = settingsRes.settings.silver_rate_manual_override || '0';
          setRate(Number(val));
          setOverride(over);
        }
        return fetchApi('/silver-rate');
      })
      .then(rateRes => {
        if (rateRes.success) {
          setHistory(rateRes.history || []);
        }
      })
      .catch(err => console.error('Error fetching silver rate data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetchApi('/admin/silver-rate', {
        method: 'POST',
        body: JSON.stringify({
          silver_rate_manual_value: rate,
          silver_rate_manual_override: override,
        }),
      });

      if (res.success) {
        setSuccess('Silver pricing parameters updated successfully.');
        fetchRates();
      } else {
        setError(res.message || 'Failed to update rates.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error while updating silver rates.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface p-5 md:p-12 max-w-5xl">
      <header className="mb-8">
        <h2 className="font-headline-md text-headline-md text-primary">Silver Rate Calibration</h2>
        <p className="text-on-surface-variant text-sm mt-1">Calibrate spot metals pricing. Dynamic catalogues recalculate based on these settings.</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-on-surface-variant text-sm">Synchronizing metal spot values...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-1 bg-surface-container-lowest border border-outline-variant p-6 rounded-lg space-y-6 self-start">
            <h3 className="font-headline-sm text-sm font-semibold text-primary uppercase tracking-wider mb-2">Calibration Settings</h3>
            
            {error && <div className="p-3 bg-error-container/20 border border-error/30 text-error text-xs rounded">{error}</div>}
            {success && <div className="p-3 bg-[#e8f5e9] border border-[#a5d6a7] text-[#137333] text-xs rounded">{success}</div>}

            <div>
              <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="manual-rate">
                Manual Rate (₹ per gram) *
              </label>
              <input
                id="manual-rate"
                type="number"
                step="0.01"
                required
                min="0.01"
                className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm font-mono font-bold"
                value={rate}
                onChange={e => setRate(Number(e.target.value))}
              />
              <p className="text-[10px] text-on-surface-variant mt-1">Equivalent to ₹{(rate * 1000).toLocaleString('en-IN')}/kg for 999 Fine Silver.</p>
            </div>

            <div className="flex items-start gap-3 p-3 bg-surface-container-low border border-outline-variant rounded">
              <input
                id="override-checkbox"
                type="checkbox"
                className="mt-1 h-4 w-4 border-outline rounded text-primary focus:ring-primary"
                checked={override === '1'}
                onChange={e => setOverride(e.target.checked ? '1' : '0')}
              />
              <div>
                <label className="block text-xs font-semibold text-primary cursor-pointer select-none" htmlFor="override-checkbox">
                  Activate Manual Override
                </label>
                <p className="text-[10px] text-on-surface-variant mt-0.5 leading-normal">
                  If active, the system ignores automated market APIs and locks metal costs to the manual rate above.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-on-primary py-3 rounded font-label-upper text-label-upper uppercase tracking-wider hover:bg-inverse-surface transition-all text-xs font-semibold disabled:opacity-50"
            >
              {submitting ? 'Applying Calibration...' : 'Apply Calibration'}
            </button>
          </form>

          {/* History */}
          <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low/30">
              <h3 className="font-headline-sm text-sm font-semibold text-primary uppercase tracking-wider">Calibration History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low/50 border-b border-outline-variant/20 text-xs font-label-upper text-on-surface-variant">
                    <th className="py-3 px-6">Timestamp</th>
                    <th className="py-3 px-6 text-right">Spot Value</th>
                    <th className="py-3 px-6 text-right">Value per kg</th>
                    <th className="py-3 px-6">Source</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-outline-variant/20">
                  {history.length > 0 ? (
                    history.map((row, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-3 px-6 font-medium text-primary">
                          {new Date(row.created_at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-6 text-right font-mono font-semibold">₹{Number(row.rate_per_gram).toFixed(2)}/g</td>
                        <td className="py-3 px-6 text-right font-mono font-semibold text-secondary">₹{(Number(row.rate_per_gram) * 1000).toLocaleString('en-IN')}/kg</td>
                        <td className="py-3 px-6 capitalize text-on-surface-variant text-xs">{row.source_detail || row.source}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-on-surface-variant text-sm">
                        No previous calibration logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
