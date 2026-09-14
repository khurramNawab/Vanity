'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

interface ProductImage {
  id: number;
  image_path: string;
  is_primary: boolean;
}

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: number;
  silver_purity: string;
  silver_weight: string;
  making_charge: string;
  making_charge_type: 'flat' | 'percent';
  base_price: string | null;
  discount_percent: string;
  stock_quantity: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  status: 'active' | 'inactive';
  category?: Category;
  images?: ProductImage[];
  primary_image?: ProductImage;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [purity, setPurity] = useState('925');
  const [weight, setWeight] = useState('');
  const [makingCharge, setMakingCharge] = useState('');
  const [makingChargeType, setMakingChargeType] = useState<'flat' | 'percent'>('flat');
  const [basePrice, setBasePrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [stock, setStock] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [imageUrl, setImageUrl] = useState('');

  // Bulk Import States
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Cloudinary / Image Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleDownloadSampleCsv = () => {
    const a = document.createElement('a');
    a.href = '/vanity_products_import_sample.csv';
    a.download = 'vanity_products_import_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleUploadProductImage = async (file: File, callback?: (url: string) => void) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const data = await fetchApi('/admin/products/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (data.success && data.url) {
        if (callback) {
          callback(data.url);
        } else {
          setImageUrl(data.url);
        }
        alert(`Image uploaded successfully to Cloudinary/Storage! CDN URL generated.`);
      } else {
        alert(data.message || 'Image upload failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Error uploading image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBulkImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      setImportError('Please select a CSV file to upload.');
      return;
    }
    setImportError(null);
    setImportResult(null);
    setImporting(true);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const res = await fetchApi('/admin/products/import', {
        method: 'POST',
        body: formData,
      });

      if (res.success) {
        setImportResult(res);
        loadProducts();
      } else {
        setImportError(res.message || 'Import failed. Please check the CSV column format.');
      }
    } catch (err: any) {
      setImportError(err.message || 'Network error while uploading file.');
    } finally {
      setImporting(false);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      let endpoint = `/admin/products?page=${currentPage}&search=${searchTerm}`;
      if (selectedCategory) endpoint += `&category_id=${selectedCategory}`;
      const response = await fetchApi(endpoint);
      if (response.success) {
        setProducts(response.data.data);
        setLastPage(response.data.last_page);
        setTotal(response.data.total || response.data.data.length);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetchApi('/admin/categories');
      if (response.success) setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadProducts(); }, [currentPage, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const resetForm = () => {
    setSku(''); setName(''); setDescription('');
    setCategoryId(categories[0]?.id.toString() || '');
    setPurity('925'); setWeight(''); setMakingCharge('');
    setMakingChargeType('flat'); setBasePrice('');
    setDiscountPercent('0'); setStock('0');
    setIsFeatured(false); setIsBestseller(false); setIsNewArrival(false);
    setStatus('active'); setImageUrl('');
  };

  const handleOpenCreate = () => {
    setIsEditing(false); setEditingId(null);
    resetForm();
    setShowFormModal(true); setError(null);
  };

  const handleOpenEdit = (product: Product) => {
    setIsEditing(true); setEditingId(product.id);
    setSku(product.sku); setName(product.name);
    setDescription(product.description || '');
    setCategoryId(product.category_id.toString());
    setPurity(product.silver_purity); setWeight(product.silver_weight);
    setMakingCharge(product.making_charge);
    setMakingChargeType(product.making_charge_type);
    setBasePrice(product.base_price || '');
    setDiscountPercent(product.discount_percent);
    setStock(product.stock_quantity.toString());
    setIsFeatured(product.is_featured); setIsBestseller(product.is_bestseller);
    setIsNewArrival(product.is_new_arrival); setStatus(product.status);
    setImageUrl(product.images?.[0]?.image_path || '');
    setShowFormModal(true); setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSubmitting(true);
    const payload = {
      sku, name, description, category_id: parseInt(categoryId),
      silver_purity: purity, silver_weight: parseFloat(weight),
      making_charge: parseFloat(makingCharge), making_charge_type: makingChargeType,
      base_price: basePrice ? parseFloat(basePrice) : null,
      discount_percent: parseFloat(discountPercent),
      stock_quantity: parseInt(stock),
      is_featured: isFeatured, is_bestseller: isBestseller,
      is_new_arrival: isNewArrival, status,
      image_urls: imageUrl ? [imageUrl] : [],
    };
    try {
      if (isEditing && editingId) {
        await fetchApi(`/admin/products/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await fetchApi('/admin/products', { method: 'POST', body: JSON.stringify(payload) });
      }
      setShowFormModal(false);
      loadProducts();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await fetchApi(`/admin/products/${id}`, { method: 'DELETE' });
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const getPrimaryImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find(img => img.is_primary);
      return primary ? primary.image_path : product.images[0].image_path;
    }
    return null;
  };

  const getStatusBadge = (p: Product) => {
    if (p.status === 'inactive') return { label: 'Draft', cls: 'bg-surface-variant text-on-surface-variant' };
    if (p.stock_quantity === 0) return { label: 'Out of Stock', cls: 'bg-[#FFF3E0] text-[#E65100]' };
    if (p.stock_quantity <= 5) return { label: 'Low Stock', cls: 'bg-[#FFF3E0] text-[#E65100]' };
    return { label: 'Active', cls: 'bg-[#E6F4EA] text-[#137333]' };
  };

  return (
    <div className="bg-surface min-h-screen">

      {/* Sticky Top Action Bar */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-outline-variant/30 px-5 md:px-12 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-primary">Products</h2>
          <p className="text-on-surface-variant text-sm mt-1">Manage your jewellery catalog</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
            />
          </form>
          {/* Category filter */}
          <select
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-outline-variant/50 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors text-sm font-medium"
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {/* Bulk Import button */}
          <button
            onClick={() => {
              setShowBulkModal(true);
              setImportFile(null);
              setImportResult(null);
              setImportError(null);
            }}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-primary text-primary bg-surface-container-lowest rounded hover:bg-surface-container-low transition-colors text-sm font-medium whitespace-nowrap"
          >
            <span className="material-symbols-outlined mr-2 text-lg">upload_file</span>
            Bulk Import CSV
          </button>
          {/* Add button */}
          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-primary text-on-primary rounded hover:bg-inverse-surface transition-colors text-sm font-medium whitespace-nowrap"
          >
            <span className="material-symbols-outlined mr-2 text-lg">add</span>
            Add Product
          </button>
        </div>
      </header>

      {/* Table */}
      <div className="px-5 md:px-12 mt-6">
        {error && !showFormModal && (
          <div className="mb-4 p-3 bg-error-container/20 border border-error/20 text-error rounded text-sm">{error}</div>
        )}

        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                  <th className="py-3 px-4 w-12 text-center">
                    <input className="rounded-sm border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer" type="checkbox" />
                  </th>
                  <th className="py-3 px-4 font-label-upper text-label-upper text-on-surface-variant whitespace-nowrap text-[10px]">Product</th>
                  <th className="py-3 px-4 font-label-upper text-label-upper text-on-surface-variant whitespace-nowrap text-[10px]">SKU</th>
                  <th className="py-3 px-4 font-label-upper text-label-upper text-on-surface-variant whitespace-nowrap text-[10px]">Category</th>
                  <th className="py-3 px-4 font-label-upper text-label-upper text-on-surface-variant whitespace-nowrap text-[10px]">Purity / Weight</th>
                  <th className="py-3 px-4 font-label-upper text-label-upper text-on-surface-variant whitespace-nowrap text-[10px] text-right">Stock</th>
                  <th className="py-3 px-4 font-label-upper text-label-upper text-on-surface-variant whitespace-nowrap text-[10px] text-center">Status</th>
                  <th className="py-3 px-4 font-label-upper text-label-upper text-on-surface-variant whitespace-nowrap text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-body-md text-sm text-on-surface">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Loading catalog...</span>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-on-surface-variant text-sm">
                      No products found. Add your first product.
                    </td>
                  </tr>
                ) : products.map((product, idx) => {
                  const imgSrc = getPrimaryImage(product);
                  const badge = getStatusBadge(product);
                  return (
                    <tr key={product.id} className={`hover:bg-surface-container-lowest/80 transition-colors group ${idx % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}>
                      <td className="py-3 px-4 text-center">
                        <input className="rounded-sm border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer" type="checkbox" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded bg-surface-container overflow-hidden flex-shrink-0 border border-outline-variant/10">
                            {imgSrc ? (
                              <img className="w-full h-full object-cover" src={imgSrc} alt={product.name} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-outline-variant">
                                <span className="material-symbols-outlined text-2xl">image_not_supported</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-on-surface">{product.name}</span>
                            {product.base_price && (
                              <span className="text-xs text-on-surface-variant mt-0.5">₹{parseFloat(product.base_price).toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant font-mono text-xs">{product.sku}</td>
                      <td className="py-3 px-4">{product.category?.name || '—'}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span>{product.silver_purity} Sterling</span>
                          <span className="text-xs text-on-surface-variant">{product.silver_weight}g</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${product.stock_quantity === 0 ? 'text-outline' : product.stock_quantity <= 5 ? 'text-error' : ''}`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-error/80 hover:text-error transition-colors text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && products.length > 0 && (
            <div className="border-t border-outline-variant/30 px-4 py-3 flex items-center justify-between bg-surface-container-lowest">
              <div className="text-sm text-on-surface-variant">
                Page <span className="font-medium text-on-surface">{currentPage}</span> of{' '}
                <span className="font-medium text-on-surface">{lastPage}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-outline-variant/50 rounded text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(lastPage, 5) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${currentPage === page ? 'bg-primary text-on-primary' : 'border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-low'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
                  disabled={currentPage === lastPage}
                  className="px-3 py-1 border border-outline-variant/50 rounded text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-4 flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-primary">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-error-container/20 border border-error/20 text-error rounded text-sm">{error}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Product Name *</label>
                  <input className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">SKU *</label>
                  <input className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest font-mono" value={sku} onChange={(e) => setSku(e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="block text-sm text-on-surface-variant mb-1">Description</label>
                <textarea className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest resize-none" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Category *</label>
                  <select className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Status</label>
                  <select className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest" value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}>
                    <option value="active">Active</option>
                    <option value="inactive">Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Silver Purity *</label>
                  <select className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest" value={purity} onChange={(e) => setPurity(e.target.value)}>
                    <option value="999">999 Fine</option>
                    <option value="925">925 Sterling</option>
                    <option value="916">916</option>
                    <option value="835">835</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Weight (g) *</label>
                  <input type="number" step="0.01" className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest" value={weight} onChange={(e) => setWeight(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Stock Qty *</label>
                  <input type="number" className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest" value={stock} onChange={(e) => setStock(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Making Charge *</label>
                  <input type="number" step="0.01" className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest" value={makingCharge} onChange={(e) => setMakingCharge(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Charge Type</label>
                  <select className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest" value={makingChargeType} onChange={(e) => setMakingChargeType(e.target.value as 'flat' | 'percent')}>
                    <option value="flat">Flat (₹)</option>
                    <option value="percent">Percent (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Discount %</label>
                  <input type="number" step="0.01" min="0" max="100" className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm text-on-surface-variant mb-1">Base Price Override (₹) — optional</label>
                <input type="number" step="0.01" className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="Leave blank to use live rate calculation" />
              </div>

              <div>
                <label className="block text-sm text-on-surface-variant mb-1 font-medium">Product Image URL / Cloudinary Upload</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    className="flex-1 border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest font-mono"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/... or upload below"
                  />
                  <label className="cursor-pointer bg-secondary text-on-secondary px-3 py-2 rounded text-xs font-semibold hover:bg-primary hover:text-white transition-colors inline-flex items-center justify-center gap-1 shrink-0">
                    <span className="material-symbols-outlined text-sm">cloud_upload</span>
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadProductImage(file);
                      }}
                    />
                  </label>
                </div>
                {imageUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={imageUrl} alt="Preview" className="w-12 h-12 object-cover rounded border border-outline-variant/30" />
                    <span className="text-xs text-on-surface-variant truncate font-mono">{imageUrl}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                {[
                  { label: 'Featured', value: isFeatured, setter: setIsFeatured },
                  { label: 'Bestseller', value: isBestseller, setter: setIsBestseller },
                  { label: 'New Arrival', value: isNewArrival, setter: setIsNewArrival },
                ].map(({ label, value, setter }) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary" checked={value} onChange={(e) => setter(e.target.checked)} />
                    <span className="text-sm text-on-surface-variant">{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2 border-t border-outline-variant/30">
                <button type="button" onClick={() => setShowFormModal(false)} className="flex-1 border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-low rounded px-4 py-2.5 text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 bg-primary text-on-primary hover:bg-inverse-surface rounded px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50">
                  {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-outline-variant/30 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30 mb-6">
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">upload_file</span>
                  Bulk Products Excel / CSV Import
                </h3>
                <p className="text-on-surface-variant text-sm mt-1">Upload a CSV file to create or update multiple products instantly.</p>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Step 1: Excel / CSV Format Reference Table */}
            <div className="mb-6 bg-surface-container-low border border-outline-variant/30 rounded-lg p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                  <h4 className="font-semibold text-primary text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-lg text-secondary">grid_on</span>
                    Required Excel / CSV Header Structure
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">Your file must contain the exact column headers shown below.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="/vanity_products_import_sample.xlsx"
                    download="vanity_products_import_sample.xlsx"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1D6F42] text-white rounded text-xs font-semibold hover:bg-[#155231] transition-colors shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">description</span>
                    Download Excel Sample (.xlsx)
                  </a>
                  <a
                    href="/vanity_products_import_sample.csv"
                    download="vanity_products_import_sample.csv"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-secondary transition-colors shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Download CSV Sample (.csv)
                  </a>
                </div>
              </div>

              <div className="overflow-x-auto border border-outline-variant/20 rounded bg-surface">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-surface-container-high border-b border-outline-variant/30 text-primary">
                      <th className="py-2 px-3">Header Name</th>
                      <th className="py-2 px-3">Required</th>
                      <th className="py-2 px-3">Format / Values</th>
                      <th className="py-2 px-3">Sample Value</th>
                      <th className="py-2 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 text-on-surface-variant">
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-primary">sku</td>
                      <td className="py-2 px-3 text-error font-semibold">Yes</td>
                      <td className="py-2 px-3">Text</td>
                      <td className="py-2 px-3 font-mono">VNT-RNG-101</td>
                      <td className="py-2 px-3">Unique Product SKU (upserts existing product if matched)</td>
                    </tr>
                    <tr className="bg-surface-container-low/30">
                      <td className="py-2 px-3 font-mono font-bold text-primary">name</td>
                      <td className="py-2 px-3 text-error font-semibold">Yes</td>
                      <td className="py-2 px-3">Text</td>
                      <td className="py-2 px-3 font-mono">Emerald Solitaire Ring</td>
                      <td className="py-2 px-3">Product Title</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-primary">category_name</td>
                      <td className="py-2 px-3 text-error font-semibold">Yes</td>
                      <td className="py-2 px-3">Text</td>
                      <td className="py-2 px-3 font-mono">Rings</td>
                      <td className="py-2 px-3">Category name (automatically created if missing)</td>
                    </tr>
                    <tr className="bg-surface-container-low/30">
                      <td className="py-2 px-3 font-mono font-bold text-primary">silver_purity</td>
                      <td className="py-2 px-3 text-error font-semibold">Yes</td>
                      <td className="py-2 px-3">Choice</td>
                      <td className="py-2 px-3 font-mono">925</td>
                      <td className="py-2 px-3">`925` or `999`</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-primary">silver_weight</td>
                      <td className="py-2 px-3 text-error font-semibold">Yes</td>
                      <td className="py-2 px-3">Decimal</td>
                      <td className="py-2 px-3 font-mono">6.50</td>
                      <td className="py-2 px-3">Weight in grams</td>
                    </tr>
                    <tr className="bg-surface-container-low/30">
                      <td className="py-2 px-3 font-mono font-bold text-primary">making_charge</td>
                      <td className="py-2 px-3 text-error font-semibold">Yes</td>
                      <td className="py-2 px-3">Decimal</td>
                      <td className="py-2 px-3 font-mono">450.00</td>
                      <td className="py-2 px-3">Making charge amount</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-primary">making_charge_type</td>
                      <td className="py-2 px-3 text-error font-semibold">Yes</td>
                      <td className="py-2 px-3">Choice</td>
                      <td className="py-2 px-3 font-mono">flat</td>
                      <td className="py-2 px-3">`flat` (₹) or `percent` (%)</td>
                    </tr>
                    <tr className="bg-surface-container-low/30">
                      <td className="py-2 px-3 font-mono font-bold text-primary">stock_quantity</td>
                      <td className="py-2 px-3 text-error font-semibold">Yes</td>
                      <td className="py-2 px-3">Integer</td>
                      <td className="py-2 px-3 font-mono">15</td>
                      <td className="py-2 px-3">Available stock units</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-primary">base_price</td>
                      <td className="py-2 px-3 text-outline">Optional</td>
                      <td className="py-2 px-3">Decimal</td>
                      <td className="py-2 px-3 font-mono">2500.00</td>
                      <td className="py-2 px-3">Manual price override (leave empty for live MCX calculation)</td>
                    </tr>
                    <tr className="bg-surface-container-low/30">
                      <td className="py-2 px-3 font-mono font-bold text-primary">discount_percent</td>
                      <td className="py-2 px-3 text-outline">Optional</td>
                      <td className="py-2 px-3">Decimal</td>
                      <td className="py-2 px-3 font-mono">10.00</td>
                      <td className="py-2 px-3">Discount percentage (0–100)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-primary">image_url</td>
                      <td className="py-2 px-3 text-outline">Optional</td>
                      <td className="py-2 px-3">URL</td>
                      <td className="py-2 px-3 font-mono">https://.../img.jpg</td>
                      <td className="py-2 px-3">Primary product image web link</td>
                    </tr>
                    <tr className="bg-surface-container-low/30">
                      <td className="py-2 px-3 font-mono font-bold text-primary">description</td>
                      <td className="py-2 px-3 text-outline">Optional</td>
                      <td className="py-2 px-3">Text</td>
                      <td className="py-2 px-3 font-mono">Handcrafted sterling...</td>
                      <td className="py-2 px-3">Item details / features</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Cloudinary CDN Image Helper */}
            <div className="mb-6 bg-surface-container-low/40 border border-outline-variant/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-secondary">cloud_upload</span>
                  Cloudinary Image CDN Helper
                </h5>
                <span className="text-[10px] text-on-surface-variant bg-surface px-2 py-0.5 rounded border border-outline-variant/20 font-mono">
                  Cloudinary Powered
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mb-3">
                Need Cloudinary CDN URLs for your Excel `image_url` column? Upload a photo here to copy its Cloudinary link instantly!
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUploadProductImage(file, (url) => {
                        navigator.clipboard.writeText(url);
                        setCopiedUrl(url);
                        alert(`Copied Cloudinary CDN URL to clipboard:\n${url}`);
                      });
                    }
                  }}
                  className="w-full text-xs text-on-surface-variant file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-on-secondary hover:file:bg-primary cursor-pointer"
                />
                {copiedUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(copiedUrl);
                      alert('Copied URL to clipboard!');
                    }}
                    className="w-full sm:w-auto text-xs bg-surface border border-outline-variant px-3 py-1.5 rounded font-mono text-primary truncate max-w-xs hover:border-primary transition-colors"
                  >
                    📋 Copy Last URL: {copiedUrl}
                  </button>
                )}
              </div>
            </div>

            {/* Step 2: Upload Input & Submit */}
            <form onSubmit={handleBulkImportSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-outline-variant/50 hover:border-primary transition-colors rounded-lg p-6 text-center bg-surface-container-low/30">
                <span className="material-symbols-outlined text-4xl text-secondary mb-2 block">cloud_upload</span>
                <p className="text-sm font-semibold text-primary mb-1">Select or drag your CSV file here</p>
                <p className="text-xs text-on-surface-variant mb-4">Supported formats: .csv, .txt (up to 5MB)</p>
                <input
                  type="file"
                  accept=".csv, text/csv, text/plain"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-secondary cursor-pointer"
                />
              </div>

              {importError && (
                <div className="p-4 bg-error-container/20 border border-error/20 text-error rounded-lg text-sm flex items-start gap-2">
                  <span className="material-symbols-outlined text-lg mt-0.5">error</span>
                  <div>
                    <p className="font-semibold">Import Error</p>
                    <p className="text-xs mt-0.5">{importError}</p>
                  </div>
                </div>
              )}

              {importResult && (
                <div className="p-5 bg-[#E6F4EA] border border-[#137333]/30 text-[#137333] rounded-lg text-sm space-y-2">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                    Import Results Summary
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center py-2 bg-white/70 rounded border border-[#137333]/20">
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase font-semibold">Created</p>
                      <p className="text-lg font-bold text-[#137333]">{importResult.summary?.created || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase font-semibold">Updated</p>
                      <p className="text-lg font-bold text-primary">{importResult.summary?.updated || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase font-semibold">Failed</p>
                      <p className="text-lg font-bold text-error">{importResult.summary?.failed || 0}</p>
                    </div>
                  </div>
                  {importResult.summary?.errors && importResult.summary.errors.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#137333]/20">
                      <p className="font-semibold text-xs text-error uppercase mb-1">Row Warning Messages:</p>
                      <ul className="list-disc pl-5 text-xs text-error space-y-1 max-h-32 overflow-y-auto font-mono">
                        {importResult.summary.errors.map((err: string, i: number) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-low rounded px-4 py-2.5 text-sm transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={importing || !importFile}
                  className="flex-1 bg-primary text-on-primary hover:bg-inverse-surface rounded px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {importing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading & Processing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">upload</span>
                      Start Import Process
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
