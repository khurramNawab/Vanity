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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
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
      const response = await fetchApi('/admin/categories');
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
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
      if (isEditing && editingId) {
        await fetchApi(`/admin/categories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ name, description }),
        });
      } else {
        await fetchApi('/admin/categories', {
          method: 'POST',
          body: JSON.stringify({ name, description }),
        });
      }
      setShowFormModal(false);
      loadCategories();
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
      await fetchApi(`/admin/categories/${id}`, { method: 'DELETE' });
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="bg-surface min-h-screen p-5 md:p-12 space-y-6">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-primary">Categories</h2>
          <p className="text-on-surface-variant text-sm mt-1">Manage categories in your jewellery catalog</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center px-4 py-2.5 bg-primary text-on-primary rounded hover:bg-on-surface-variant transition-colors text-sm font-medium whitespace-nowrap"
        >
          <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
          Add Category
        </button>
      </div>

      {error && !showFormModal && (
        <div className="p-3 bg-error-container/20 border border-error/20 text-error rounded text-sm">{error}</div>
      )}

      {/* Main categories list */}
      {loading ? (
        <div className="flex flex-col items-center py-12">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm mt-3">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 text-center py-12 rounded">
          <span className="material-symbols-outlined text-[48px] text-outline-variant">category</span>
          <h3 className="font-headline-md text-headline-md text-primary mt-2">No categories found</h3>
          <p className="text-on-surface-variant text-sm mt-1">Get started by creating your first product category.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                  <th className="py-3 px-4 font-label-upper text-label-upper text-on-surface-variant text-[10px]">Name</th>
                  <th className="py-3 px-4 font-label-upper text-label-upper text-on-surface-variant text-[10px]">Slug</th>
                  <th className="py-3 px-4 font-label-upper text-label-upper text-on-surface-variant text-[10px]">Description</th>
                  <th className="py-3 px-4 font-label-upper text-label-upper text-on-surface-variant text-[10px] text-center">Products</th>
                  <th className="py-3 px-4 font-label-upper text-label-upper text-on-surface-variant text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-body-md text-sm text-on-surface">
                {categories.map((category, idx) => (
                  <tr key={category.id} className={`hover:bg-surface-container-lowest/80 transition-colors group ${idx % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}>
                    <td className="py-3 px-4 font-medium text-primary">{category.name}</td>
                    <td className="py-3 px-4 text-on-surface-variant font-mono text-xs">{category.slug}</td>
                    <td className="py-3 px-4 text-on-surface-variant max-w-xs truncate">{category.description || '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant">
                        {category.products_count ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleOpenEdit(category)}
                          className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-error/80 hover:text-error transition-colors text-sm font-medium"
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
