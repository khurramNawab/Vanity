'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

interface AppointmentItem {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  interest_type: string;
  special_notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

export default function AppointmentsAdminPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/appointments');
      if (res.success && res.appointments) {
        setAppointments(res.appointments);
      }
    } catch (e) {
      console.error('Failed to load appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetchApi(`/admin/appointments/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setAppointments(prev =>
          prev.map(a => (a.id === id ? { ...a, status: newStatus as any } : a))
        );
      }
    } catch (e) {
      console.error('Status update failed:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = appointments.filter(a => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const matchesSearch =
      search === '' ||
      a.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search) ||
      a.interest_type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-[#1C3A35] flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-teal-700">calendar_month</span>
            Custom Jewellery Appointments
          </h1>
          <p className="text-sm text-stone-600 mt-1 font-sans">
            Client requests from the &ldquo;Sterling Silver Personalized Jewelry - Book an Appointment&rdquo; form.
          </p>
        </div>
        <button
          onClick={loadAppointments}
          className="self-start md:self-auto px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-sm transition"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Search by client name, email, phone, or jewellery interest..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-teal-700 font-sans"
          />
        </div>
        <div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-teal-700 font-sans cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-stone-500 font-sans">Loading appointment leads...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-stone-500">
            <span className="material-symbols-outlined text-4xl text-stone-400 mb-2">event_busy</span>
            <p className="text-base font-semibold text-stone-700 font-sans">No appointments found</p>
            <p className="text-xs text-stone-500 mt-1 font-sans">
              Leads submitted from the homepage appointment form will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-700">
              <thead className="bg-[#FAF7F2] text-stone-800 text-xs uppercase font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3.5">Client</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Interest</th>
                  <th className="px-5 py-3.5">Preferred Slot</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-sans">
                {filtered.map(appt => (
                  <tr key={appt.id} className="hover:bg-stone-50 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-stone-900">{appt.full_name}</div>
                      {appt.special_notes && (
                        <div className="text-xs text-stone-500 mt-1 italic line-clamp-2 max-w-xs">
                          &ldquo;{appt.special_notes}&rdquo;
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-stone-800">{appt.email}</div>
                      <div className="text-xs text-teal-800 font-medium">{appt.phone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block px-2.5 py-1 bg-stone-100 text-stone-800 rounded-full text-xs font-medium">
                        {appt.interest_type || 'Custom Jewelry'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-xs text-stone-900">{appt.preferred_date || 'Flexible'}</div>
                      <div className="text-xs text-stone-500">{appt.preferred_time || 'Any Time'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={appt.status}
                        disabled={updatingId === appt.id}
                        onChange={e => handleStatusChange(appt.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer ${appt.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : appt.status === 'completed'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : appt.status === 'cancelled'
                                ? 'bg-red-50 text-red-700 border-red-300'
                                : 'bg-amber-50 text-amber-700 border-amber-300'
                          }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-xs text-stone-500">
                      {new Date(appt.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
