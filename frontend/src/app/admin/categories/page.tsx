'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  products_count?: number;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Necklaces', slug: 'necklaces', description: 'Exquisite silver neckpieces and chains for all occasions.', products_count: 4 },
  { id: 2, name: 'Earrings', slug: 'earrings', description: 'Beautiful drop, stud, and hoop earrings in 925 sterling silver.', products_count: 4 },
  { id: 3, name: 'Bracelets', slug: 'bracelets', description: 'Elegantly structured bracelets and cuffs.', products_count: 3 },
  { id: 4, name: 'Bangles', slug: 'bangles', description: 'Handcrafted silver and oxidised bangles and kadas.', products_count: 2 },
  { id: 5, name: 'Pendants', slug: 'pendants', description: 'Delicate and statement silver pendants with precious stones.', products_count: 3 },
  { id: 6, name: 'Tops', slug: 'tops', description: 'Daily wear and festive silver tops and studs.', products_count: 2 },
  { id: 7, name: 'Mala', slug: 'mala', description: 'Traditional artisan beaded and silver malas.', products_count: 1 },
  { id: 8, name: 'Rings', slug: 'rings', description: 'Sophisticated and premium silver rings crafted to perfection.', products_count: 2 },
  { id: 9, name: 'Silver', slug: 'silver', description: 'Pure 925 sterling silver and fine silver jewellery.', products_count: 8 },
  { id: 10, name: 'Brass', slug: 'brass', description: 'Handcrafted brass and oxidised designer ornaments.', products_count: 2 },
  { id: 11, name: 'Stones', slug: 'stones', description: 'Precious & semi-precious stone embedded jewellery.', products_count: 3 },
  { id: 12, name: 'CZ Diamonds', slug: 'cz-diamonds', description: 'Brilliant cubic zirconia diamond embellished ornaments.', products_count: 4 },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      let response = await fetchApi('/admin/categories');
      if (!response.success || !response.data || response.data.length === 0) {
        response = await fetchApi('/categories');
      }
      const list = response.data || response.categories || [];
      if (Array.isArray(list) && list.length > 0) {
        setCategories(list);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (err: any) {
      console.error('Error loading categories:', err);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setShowFormModal(true);
    setError(null);
  };

  const handleOpenEdit = (category: Category) => {
    setIsEditing(true);
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || '');
    setShowFormModal(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let res;
      if (isEditing && editingId) {
        res = await fetchApi(`/admin/categories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ name: name.trim(), description: description.trim() }),
        });
      } else {
        res = await fetchApi('/admin/categories', {
          method: 'POST',
          body: JSON.stringify({ name: name.trim(), description: description.trim() }),
        });
      }

      if (res && res.success) {
        setShowFormModal(false);
        loadCategories();
      } else {
        setError(res?.message || 'Failed to save category. Please check details.');
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? All nested products may lose their category link.')) {
      return;
    }

    try {
      const res = await fetchApi(`/admin/categories/${id}`, { method: 'DELETE' });
      if (res && res.success) {
        loadCategories();
      } else {
        alert(res?.message || 'Failed to delete category');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="bg-surface min-h-screen p-5 md:p-10 space-y-6">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary tracking-tight">Categories</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage categories in your jewellery catalog</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-lg shadow-sm transition-all text-sm font-medium whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Category
        </button>
      </div>

      {error && !showFormModal && (
        <div className="p-3.5 bg-error-container/20 border border-error/30 text-error rounded-lg text-sm">{error}</div>
      )}

      {/* Main categories list */}
      {loading ? (
        <div className="flex flex-col items-center py-16">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm mt-3">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 text-center py-16 rounded-xl">
          <span className="material-symbols-outlined text-[48px] text-outline-variant">category</span>
          <h3 className="font-headline-md text-headline-md text-primary mt-2">No categories found</h3>
          <p className="text-on-surface-variant text-sm mt-1">Get started by creating your first product category.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low/40">
                  <th className="py-4 px-6 font-label-upper text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Name</th>
                  <th className="py-4 px-6 font-label-upper text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Slug</th>
                  <th className="py-4 px-6 font-label-upper text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Description</th>
                  <th className="py-4 px-6 font-label-upper text-xs font-semibold text-on-surface-variant tracking-wider uppercase text-center">Products</th>
                  <th className="py-4 px-6 font-label-upper text-xs font-semibold text-on-surface-variant tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-on-surface">{category.name}</td>
                    <td className="py-4 px-6 text-on-surface-variant font-mono text-xs">{category.slug}</td>
                    <td className="py-4 px-6 text-on-surface-variant max-w-md truncate">{category.description || '—'}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
                        {category.products_count ?? 0}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3 font-medium text-xs">
                        <button
                          onClick={() => handleOpenEdit(category)}
                          className="text-neutral-700 hover:text-black hover:underline transition-colors px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-700 hover:underline transition-colors px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-lg shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-secondary/30" />
            <div className="border-b border-outline-variant/30 px-6 py-4 flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-primary">
                {isEditing ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-error-container/20 border border-error/20 text-error rounded text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm text-on-surface-variant mb-1" htmlFor="cat-name">Category Name *</label>
                <input
                  id="cat-name"
                  className="w-full bg-surface-container-lowest border border-primary/20 rounded px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Necklaces"
                />
              </div>
              <div>
                <label className="block text-sm text-on-surface-variant mb-1" htmlFor="cat-desc">Description</label>
                <textarea
                  id="cat-desc"
                  className="w-full bg-surface-container-lowest border border-primary/20 rounded px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-low rounded px-4 py-2.5 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-on-primary hover:bg-inverse-surface rounded px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Category'}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
