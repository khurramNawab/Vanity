'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

interface Slide {
  id: number;
  image_path: string;
  headline: string | null;
  subtext: string | null;
  cta_text: string;
  cta_link: string;
  sort_order: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
}

export default function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [editId, setEditId] = useState<number | null>(null);
  const [imagePath, setImagePath] = useState('');
  const [headline, setHeadline] = useState('');
  const [subtext, setSubtext] = useState('');
  const [ctaText, setCtaText] = useState('Shop now');
  const [ctaLink, setCtaLink] = useState('/shop');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/hero-slides');
      if (res.success) {
        setSlides(res.slides);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch hero slides.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slide: Slide) => {
    setEditId(slide.id);
    setImagePath(slide.image_path);
    setHeadline(slide.headline || '');
    setSubtext(slide.subtext || '');
    setCtaText(slide.cta_text);
    setCtaLink(slide.cta_link);
    setSortOrder(slide.sort_order);
    setIsActive(slide.is_active);
    
    // Format dates to YYYY-MM-DDThh:mm for datetime-local input
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const pad = (num: number) => String(num).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setStartDate(formatDate(slide.start_date));
    setEndDate(formatDate(slide.end_date));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hero slide?')) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetchApi(`/admin/hero-slides/${id}`, { method: 'DELETE' });
      if (res.success) {
        setSuccess('Hero slide deleted successfully.');
        fetchSlides();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete hero slide.');
    }
  };

  const resetForm = () => {
    setEditId(null);
    setImagePath('');
    setHeadline('');
    setSubtext('');
    setCtaText('Shop now');
    setCtaLink('/shop');
    setSortOrder(0);
    setIsActive(true);
    setStartDate('');
    setEndDate('');
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const payload = {
      image_path: imagePath,
      headline: headline || null,
      subtext: subtext || null,
      cta_text: ctaText,
      cta_link: ctaLink,
      sort_order: sortOrder,
      is_active: isActive,
      start_date: startDate || null,
      end_date: endDate || null,
    };

    try {
      const endpoint = editId ? `/admin/hero-slides/${editId}` : '/admin/hero-slides';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetchApi(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccess(editId ? 'Hero slide updated successfully.' : 'Hero slide created successfully.');
        resetForm();
        fetchSlides();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save hero slide.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-5 md:p-12 max-w-6xl">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">Homepage Hero Slides</h2>
          <p className="text-on-surface-variant text-sm mt-1">Manage single-image static banner or multi-image carousel slides.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-on-primary px-5 py-2.5 rounded font-label-upper text-label-upper text-xs uppercase tracking-wider hover:bg-opacity-95 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">add</span> Add Slide
          </button>
        )}
      </header>

      {error && (
        <div className="p-4 bg-error-container/20 border border-error/30 text-error text-sm rounded mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-[#e8f5e9] border border-[#a5d6a7] text-[#137333] text-sm rounded mb-6">
          {success}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-10 bg-surface-container-lowest border border-outline-variant p-6 rounded-lg space-y-6">
          <h3 className="font-headline-sm text-sm font-semibold text-primary border-b border-outline-variant/30 pb-2 uppercase tracking-wider">
            {editId ? 'Edit Hero Slide' : 'Create New Hero Slide'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="imagePath">
                Image URL *
              </label>
              <input
                id="imagePath"
                type="url"
                required
                className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                value={imagePath}
                onChange={e => setImagePath(e.target.value)}
                placeholder="https://images.unsplash.com/... or /images/..."
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="headline">
                Headline
              </label>
              <input
                id="headline"
                type="text"
                className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                placeholder="Online jewellery shopping in Kolkata"
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="subtext">
                Subtext
              </label>
              <input
                id="subtext"
                type="text"
                className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                value={subtext}
                onChange={e => setSubtext(e.target.value)}
                placeholder="Silver, brass, precious & semi-precious stone jewellery..."
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="ctaText">
                CTA Button Text
              </label>
              <input
                id="ctaText"
                type="text"
                className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                value={ctaText}
                onChange={e => setCtaText(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="ctaLink">
                CTA Link URL
              </label>
              <input
                id="ctaLink"
                type="text"
                className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                value={ctaLink}
                onChange={e => setCtaLink(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="sortOrder">
                Sort Order
              </label>
              <input
                id="sortOrder"
                type="number"
                className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                value={sortOrder}
                onChange={e => setSortOrder(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="isActive">
                Status
              </label>
              <select
                id="isActive"
                className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                value={isActive ? 'true' : 'false'}
                onChange={e => setIsActive(e.target.value === 'true')}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="startDate">
                Schedule Start Date (Optional)
              </label>
              <input
                id="startDate"
                type="datetime-local"
                className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="endDate">
                Schedule End Date (Optional)
              </label>
              <input
                id="endDate"
                type="datetime-local"
                className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-outline-variant/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="border border-outline-variant text-on-surface px-6 py-2.5 rounded font-label-upper text-label-upper text-xs uppercase tracking-wider hover:bg-surface-container-high transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-on-primary px-8 py-2.5 rounded font-label-upper text-label-upper uppercase tracking-wider hover:bg-inverse-surface transition-all text-xs font-semibold disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Slide'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-on-surface-variant text-sm">Loading slides list...</p>
        </div>
      ) : slides.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-outline mb-2">view_carousel</span>
          <h3 className="font-semibold text-primary mb-1">No slides configured</h3>
          <p className="text-on-surface-variant text-sm mb-4">Add a hero slide to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {slides.map(slide => (
            <div key={slide.id} className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col">
              <div className="relative aspect-[16/9] bg-surface-container-low border-b border-outline-variant/20">
                <img
                  src={slide.image_path}
                  alt={slide.headline || 'Hero Slide'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x337/FAF9F6/1A1A1A?text=No+Image';
                  }}
                />
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className={`font-label-upper text-[9px] px-2 py-0.5 tracking-wider uppercase font-semibold text-white ${slide.is_active ? 'bg-green-600' : 'bg-red-600'}`}>
                    {slide.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {(slide.start_date || slide.end_date) && (
                    <span className="font-label-upper text-[9px] px-2 py-0.5 tracking-wider uppercase font-semibold bg-primary text-white">
                      Scheduled
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-primary text-base truncate mb-1">{slide.headline || 'Untitled Slide'}</h4>
                  <p className="text-on-surface-variant text-xs line-clamp-2 mb-4">{slide.subtext || 'No description text.'}</p>
                  
                  <div className="space-y-1 text-[11px] text-on-surface-variant mb-4">
                    <p className="flex justify-between">
                      <span>Order:</span> <strong>{slide.sort_order}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span>CTA Button:</span> <strong>{slide.cta_text} &rarr; {slide.cta_link}</strong>
                    </p>
                    {slide.start_date && (
                      <p className="flex justify-between">
                        <span>Starts:</span> <strong>{new Date(slide.start_date).toLocaleString()}</strong>
                      </p>
                    )}
                    {slide.end_date && (
                      <p className="flex justify-between">
                        <span>Ends:</span> <strong>{new Date(slide.end_date).toLocaleString()}</strong>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 border-t border-outline-variant/20 pt-4 mt-auto">
                  <button
                    onClick={() => handleEdit(slide)}
                    className="flex-1 border border-outline-variant text-on-surface-variant py-2 text-xs font-semibold hover:bg-surface-container-high transition-all flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="flex-1 border border-red-200 text-red-700 py-2 text-xs font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
