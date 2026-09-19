'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

interface ProductImage {
  id: number;
  image_path: string;
  alt_text?: string | null;
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
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  canonical_url?: string | null;
  og_image_url?: string | null;
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
  const [modalTab, setModalTab] = useState<'details' | 'pricing' | 'seo'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form States - Details
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [purity, setPurity] = useState('925');
  const [weight, setWeight] = useState('');
  const [stock, setStock] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Form States - Pricing & Media
  const [makingCharge, setMakingCharge] = useState('');
  const [makingChargeType, setMakingChargeType] = useState<'flat' | 'percent'>('flat');
  const [basePrice, setBasePrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAltText, setImageAltText] = useState('');

  // Form States - SEO Engine
  const [slug, setSlug] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [serpPreviewDevice, setSerpPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Bulk Import States
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Cloudinary / Image Upload States
  const [uploadingImage, setUploadingImage] = useState(false);

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
          if (!imageAltText && name) {
            setImageAltText(`${name} - Handcrafted 925 Sterling Silver Jewellery`);
          }
        }
        alert(`Image uploaded successfully to Cloudinary! CDN URL generated.`);
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

  const loadProducts = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/admin/products?page=${page}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (selectedCategory) url += `&category_id=${selectedCategory}`;

      const res = await fetchApi(url);
      if (res.success && res.data) {
        setProducts(res.data.data);
        setCurrentPage(res.data.current_page);
        setLastPage(res.data.last_page);
        setTotal(res.data.total);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetchApi('/admin/categories');
      if (res.success && res.data) {
        setCategories(res.data);
        if (res.data.length > 0 && !categoryId) {
          setCategoryId(res.data[0].id.toString());
        }
      }
    } catch (err: any) {
      console.error('Error loading categories:', err);
    }
  };

  useEffect(() => {
    loadProducts(currentPage);
    loadCategories();
  }, [currentPage, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts(1);
  };

  const resetForm = () => {
    setSku('');
    setName('');
    setDescription('');
    setPurity('925');
    setWeight('');
    setMakingCharge('');
    setMakingChargeType('flat');
    setBasePrice('');
    setDiscountPercent('0');
    setStock('0');
    setIsFeatured(false);
    setIsBestseller(false);
    setIsNewArrival(false);
    setStatus('active');
    setImageUrl('');
    setImageAltText('');
    setSlug('');
    setMetaTitle('');
    setMetaDescription('');
    setMetaKeywords('');
    setCanonicalUrl('');
    setModalTab('details');
  };

  const autoGenerateSeoTitle = () => {
    if (!name) return;
    const cat = categories.find(c => c.id.toString() === categoryId)?.name || 'Jewellery';
    setMetaTitle(`${name} | 925 Sterling Silver ${cat} | Vanity`);
  };

  const autoGenerateMetaDescription = () => {
    if (!name) return;
    const cat = categories.find(c => c.id.toString() === categoryId)?.name || 'Silver Jewellery';
    const excerpt = description ? description.slice(0, 75).trim() + '. ' : '';
    setMetaDescription(`Buy handcrafted ${name} in 925 sterling silver. ${excerpt}Certified BIS Hallmark with lifetime authenticity from Vanity.`);
  };

  const autoGenerateSlug = () => {
    if (!name) return;
    setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    resetForm();
    setShowFormModal(true);
    setError(null);
  };

  const handleOpenEdit = (product: Product) => {
    setIsEditing(true);
    setEditingId(product.id);
    setSku(product.sku);
    setName(product.name);
    setDescription(product.description || '');
    setCategoryId(product.category_id.toString());
    setPurity(product.silver_purity);
    setWeight(product.silver_weight);
    setMakingCharge(product.making_charge);
    setMakingChargeType(product.making_charge_type);
    setBasePrice(product.base_price || '');
    setDiscountPercent(product.discount_percent);
    setStock(product.stock_quantity.toString());
    setIsFeatured(product.is_featured);
    setIsBestseller(product.is_bestseller);
    setIsNewArrival(product.is_new_arrival);
    setStatus(product.status);
    setImageUrl(product.images?.[0]?.image_path || '');
    setImageAltText(product.images?.[0]?.alt_text || '');
    setSlug(product.slug || '');
    setMetaTitle(product.meta_title || '');
    setMetaDescription(product.meta_description || '');
    setMetaKeywords(product.meta_keywords || '');
    setCanonicalUrl(product.canonical_url || '');
    setModalTab('details');
    setShowFormModal(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      sku,
      name,
      slug: slug || undefined,
      description,
      meta_title: metaTitle || undefined,
      meta_description: metaDescription || undefined,
      meta_keywords: metaKeywords || undefined,
      canonical_url: canonicalUrl || undefined,
      category_id: parseInt(categoryId),
      silver_purity: purity,
      silver_weight: parseFloat(weight),
      making_charge: parseFloat(makingCharge),
      making_charge_type: makingChargeType,
      base_price: basePrice ? parseFloat(basePrice) : null,
      discount_percent: parseFloat(discountPercent),
      stock_quantity: parseInt(stock),
      is_featured: isFeatured,
      is_bestseller: isBestseller,
      is_new_arrival: isNewArrival,
      status,
      image_urls: imageUrl ? [imageUrl] : [],
      image_alt_text: imageAltText || undefined,
    };

    try {
      if (isEditing && editingId) {
        await fetchApi(`/admin/products/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await fetchApi('/admin/products', { method: 'POST', body: JSON.stringify(payload) });
      }
      setShowFormModal(false);
      loadProducts(currentPage);
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
      loadProducts(currentPage);
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

  const effectiveTitle = metaTitle || (name ? `${name} | 925 Sterling Silver | Vanity` : 'Product Title | Vanity Jewels');
  const effectiveDesc = metaDescription || (description ? description.slice(0, 155) : 'Discover handcrafted 925 sterling silver jewellery with BIS hallmarking.');
  const effectiveSlug = slug || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'product-slug');

  return (
    <div className="bg-surface min-h-screen">
      {/* Sticky Top Action Bar */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-outline-variant/30 px-5 md:px-12 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-primary">Products</h2>
          <p className="text-on-surface-variant text-sm mt-1">Manage catalog and customize SEO metadata per item</p>
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
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {/* Bulk Import Button */}
          <button
            onClick={() => setShowBulkModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-secondary text-secondary hover:bg-secondary/10 rounded font-label-upper text-label-upper text-xs transition-colors"
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
            Bulk CSV
          </button>
          {/* Add Product Button */}
          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary hover:bg-inverse-surface rounded font-label-upper text-label-upper text-xs transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Product
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-5 md:p-12 max-w-[1600px] mx-auto space-y-8">
        {/* Products Table */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                  <th className="py-4 px-6 font-label-upper text-xs text-on-surface-variant font-semibold">Product</th>
                  <th className="py-4 px-6 font-label-upper text-xs text-on-surface-variant font-semibold">SKU</th>
                  <th className="py-4 px-6 font-label-upper text-xs text-on-surface-variant font-semibold">Category</th>
                  <th className="py-4 px-6 font-label-upper text-xs text-on-surface-variant font-semibold">Weight / Purity</th>
                  <th className="py-4 px-6 font-label-upper text-xs text-on-surface-variant font-semibold">Stock</th>
                  <th className="py-4 px-6 font-label-upper text-xs text-on-surface-variant font-semibold">SEO Status</th>
                  <th className="py-4 px-6 font-label-upper text-xs text-on-surface-variant font-semibold">Status</th>
                  <th className="py-4 px-6 font-label-upper text-xs text-on-surface-variant font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                      <div className="inline-block animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
                      <p>Loading products...</p>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                      No products found. Click &quot;Add Product&quot; to create your first item.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const img = getPrimaryImage(p);
                    const badge = getStatusBadge(p);
                    const hasSeo = Boolean(p.meta_title && p.meta_description);
                    return (
                      <tr key={p.id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded bg-surface-container-low overflow-hidden shrink-0 border border-outline-variant/30">
                              {img ? (
                                <img src={img} alt={p.images?.[0]?.alt_text || p.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-outline">
                                  <span className="material-symbols-outlined text-lg">image</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-primary">{p.name}</p>
                              <p className="text-xs text-on-surface-variant">₹{parseFloat(p.base_price || '0').toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-on-surface-variant">{p.sku}</td>
                        <td className="py-4 px-6 text-on-surface-variant">{p.category?.name || '—'}</td>
                        <td className="py-4 px-6 text-on-surface-variant">{p.silver_weight}g / {p.silver_purity}</td>
                        <td className="py-4 px-6">
                          <span className={`font-semibold ${p.stock_quantity === 0 ? 'text-error' : 'text-primary'}`}>
                            {p.stock_quantity}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {hasSeo ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span> SEO Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <span className="material-symbols-outlined text-[14px]">info</span> Auto SEO
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              title="Edit product & SEO"
                              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              title="Delete product"
                              className="p-1.5 text-on-surface-variant hover:text-error hover:bg-surface-container-low rounded transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
              <span>Showing page {currentPage} of {lastPage} ({total} items)</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 border border-outline-variant/40 rounded disabled:opacity-40 hover:bg-surface-container-low"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === lastPage}
                  onClick={() => setCurrentPage(prev => Math.min(lastPage, prev + 1))}
                  className="px-3 py-1.5 border border-outline-variant/40 rounded disabled:opacity-40 hover:bg-surface-container-low"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Product Add / Edit Modal with SEO Engine */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-outline-variant/30 rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 md:p-8">
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30 mb-6">
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-primary">
                  {isEditing ? 'Edit Product & SEO' : 'Add New Product'}
                </h3>
                <p className="text-on-surface-variant text-xs mt-0.5">Customize specifications, media, and direct search engine metadata.</p>
              </div>
              <button onClick={() => setShowFormModal(false)} className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {error && (
              <div className="mb-6 p-3.5 bg-error-container/20 border border-error/30 text-error rounded text-sm">
                {error}
              </div>
            )}

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-outline-variant/30 mb-6">
              {[
                { id: 'details', label: '1. Basic Specifications', icon: 'info' },
                { id: 'pricing', label: '2. Pricing & Media', icon: 'payments' },
                { id: 'seo', label: '3. SEO & SERP Preview', icon: 'troubleshoot' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setModalTab(t.id as any)}
                  className={`flex items-center gap-2 pb-3 px-4 text-xs font-label-upper font-semibold transition-all ${
                    modalTab === t.id
                      ? 'text-primary border-b-2 border-primary -mb-px'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                  {t.label}
                  {t.id === 'seo' && (
                    <span className="ml-1 text-[10px] bg-secondary/15 text-secondary px-1.5 py-0.2 rounded font-bold uppercase">Client SEO</span>
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* TAB 1: Basic Specifications */}
              {modalTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-1 font-medium">Product Name *</label>
                      <input
                        className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                        }}
                        placeholder="e.g. Royal Peacock Silver Necklace"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-1 font-medium">SKU (Unique Code) *</label>
                      <input
                        className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest font-mono"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="VNT-NEC-001"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-on-surface-variant mb-1 font-medium">Product Description</label>
                    <textarea
                      className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest resize-none"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detailed artisan description of the silver jewellery piece..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-1 font-medium">Category *</label>
                      <select
                        className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                      >
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-1 font-medium">Catalog Status</label>
                      <select
                        className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                      >
                        <option value="active">Active (Visible on Storefront)</option>
                        <option value="inactive">Draft (Hidden)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-1 font-medium">Silver Purity *</label>
                      <select
                        className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest"
                        value={purity}
                        onChange={(e) => setPurity(e.target.value)}
                      >
                        <option value="999">999 Fine Silver</option>
                        <option value="925">925 Sterling Silver</option>
                        <option value="916">916 Silver</option>
                        <option value="835">835 Silver</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-1 font-medium">Net Weight (grams) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="e.g. 14.50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-1 font-medium">Stock Inventory *</label>
                      <input
                        type="number"
                        className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="e.g. 10"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    {[
                      { label: 'Featured Product', value: isFeatured, setter: setIsFeatured },
                      { label: 'Bestseller Badge', value: isBestseller, setter: setIsBestseller },
                      { label: 'New Arrival', value: isNewArrival, setter: setIsNewArrival },
                    ].map(({ label, value, setter }) => (
                      <label key={label} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary"
                          checked={value}
                          onChange={(e) => setter(e.target.checked)}
                        />
                        <span className="text-sm text-on-surface-variant font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: Pricing & Media */}
              {modalTab === 'pricing' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-1 font-medium">Making Charge *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest"
                        value={makingCharge}
                        onChange={(e) => setMakingCharge(e.target.value)}
                        placeholder="e.g. 450.00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-1 font-medium">Making Charge Type</label>
                      <select
                        className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest"
                        value={makingChargeType}
                        onChange={(e) => setMakingChargeType(e.target.value as 'flat' | 'percent')}
                      >
                        <option value="flat">Flat Amount (₹)</option>
                        <option value="percent">Percentage of Metal (%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-1 font-medium">Discount Percent (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        placeholder="e.g. 10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-on-surface-variant mb-1 font-medium">Base Price Override (₹) — optional</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      placeholder="Leave blank to use dynamic MCX daily live rate calculation"
                    />
                  </div>

                  {/* Primary Image Upload & Dedicated Alt Text */}
                  <div className="p-4 bg-surface-container-low border border-outline-variant/30 rounded-lg space-y-3">
                    <label className="block text-sm font-semibold text-primary">Primary Product Image & Google Images Alt-Tag</label>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        className="flex-1 border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest font-mono"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://res.cloudinary.com/... or upload below"
                      />
                      <label className="cursor-pointer bg-secondary text-on-secondary px-4 py-2 rounded text-xs font-semibold hover:bg-primary hover:text-white transition-colors inline-flex items-center justify-center gap-1 shrink-0">
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

                    {/* Dedicated Image Alt-Text input */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-medium text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-secondary">image_search</span>
                          Image Alt Text (SEO Alt Attribute)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (name) setImageAltText(`${name} - Handcrafted 925 Sterling Silver Jewellery by Vanity`);
                          }}
                          className="text-[11px] text-secondary hover:underline"
                        >
                          Auto-fill
                        </button>
                      </div>
                      <input
                        type="text"
                        className="w-full border border-outline-variant/50 rounded px-3 py-2 text-xs focus:outline-none focus:border-primary bg-surface-container-lowest"
                        value={imageAltText}
                        onChange={(e) => setImageAltText(e.target.value)}
                        placeholder="e.g. Handcrafted 925 sterling silver emerald cut solitaire ring top view"
                      />
                      <p className="text-[11px] text-on-surface-variant mt-1">
                        Specific keyword-rich description for Google Images search engine indexing.
                      </p>
                    </div>

                    {imageUrl && (
                      <div className="mt-2 flex items-center gap-3 p-2 bg-surface rounded border border-outline-variant/30">
                        <img src={imageUrl} alt={imageAltText || name} className="w-14 h-14 object-cover rounded border border-outline-variant/30" />
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium text-primary truncate">{imageAltText || 'No Alt Text set yet'}</p>
                          <span className="text-[11px] text-on-surface-variant truncate font-mono block">{imageUrl}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Dynamic SEO Management & Live SERP Simulator */}
              {modalTab === 'seo' && (
                <div className="space-y-6">
                  {/* Google SERP Live Simulator */}
                  <div className="p-4 bg-white border border-outline-variant/40 rounded-xl shadow-sm space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
                      <span className="text-xs font-bold text-[#202124] flex items-center gap-1.5 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-sm text-[#4285F4]">search</span>
                        Google Search Live Simulator (SERP Preview)
                      </span>
                      <div className="flex gap-1 bg-[#F1F3F4] p-0.5 rounded text-[11px]">
                        <button
                          type="button"
                          onClick={() => setSerpPreviewDevice('desktop')}
                          className={`px-2 py-0.5 rounded font-medium ${serpPreviewDevice === 'desktop' ? 'bg-white text-primary shadow-xs font-semibold' : 'text-on-surface-variant'}`}
                        >
                          Desktop
                        </button>
                        <button
                          type="button"
                          onClick={() => setSerpPreviewDevice('mobile')}
                          className={`px-2 py-0.5 rounded font-medium ${serpPreviewDevice === 'mobile' ? 'bg-white text-primary shadow-xs font-semibold' : 'text-on-surface-variant'}`}
                        >
                          Mobile
                        </button>
                      </div>
                    </div>

                    {/* Google Search Card Preview */}
                    <div className={`pt-2 ${serpPreviewDevice === 'mobile' ? 'max-w-sm' : 'max-w-xl'}`}>
                      <div className="flex items-center gap-2 text-xs text-[#202124] mb-1">
                        <div className="w-4 h-4 rounded-full bg-[#1A1A1A] text-[#9A7E44] flex items-center justify-center text-[10px] font-bold">V</div>
                        <span className="text-[12px] text-[#202124] font-medium truncate">thevanityjewels.com › products › {effectiveSlug}</span>
                      </div>
                      <h4 className="text-[#1a0dab] hover:underline text-[18px] font-normal leading-snug cursor-pointer line-clamp-1">
                        {effectiveTitle}
                      </h4>
                      <p className="text-[13px] text-[#4d5156] leading-relaxed mt-1 line-clamp-2">
                        {effectiveDesc}
                      </p>
                      {/* Rich Snippet Badges */}
                      <div className="flex items-center gap-3 text-[12px] text-[#70757a] mt-2 pt-1.5 border-t border-[#f1f3f4]">
                        <span className="flex items-center gap-0.5 text-[#e37400]">
                          ★ ★ ★ ★ ★ <strong className="text-[#3c4043] ml-1">4.9</strong> (128)
                        </span>
                        <span>·</span>
                        <span className="font-semibold text-[#3c4043]">₹{basePrice || '2,500'}</span>
                        <span>·</span>
                        <span className="text-[#137333] font-medium">In stock</span>
                        <span>·</span>
                        <span>BIS 925 Hallmark</span>
                      </div>
                    </div>
                  </div>

                  {/* SEO Input Fields */}
                  <div className="space-y-4">
                    {/* SEO Meta Title */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-primary flex items-center gap-1">
                          SEO Meta Title (Title Tag)
                        </label>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-mono ${metaTitle.length > 60 ? 'text-error font-bold' : metaTitle.length >= 45 ? 'text-emerald-700' : 'text-on-surface-variant'}`}>
                            {metaTitle.length} / 60 chars
                          </span>
                          <button
                            type="button"
                            onClick={autoGenerateSeoTitle}
                            className="text-[11px] text-secondary hover:underline font-medium"
                          >
                            Auto-Generate
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder="e.g. Royal Peacock Silver Necklace | BIS 925 Hallmark | Vanity"
                      />
                      <p className="text-[11px] text-on-surface-variant mt-1">Optimal length: 50–60 characters. Appears as the main clickable headline in search engines.</p>
                    </div>

                    {/* SEO Meta Description */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-primary">
                          SEO Meta Description
                        </label>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-mono ${metaDescription.length > 160 ? 'text-error font-bold' : metaDescription.length >= 130 ? 'text-emerald-700' : 'text-on-surface-variant'}`}>
                            {metaDescription.length} / 160 chars
                          </span>
                          <button
                            type="button"
                            onClick={autoGenerateMetaDescription}
                            className="text-[11px] text-secondary hover:underline font-medium"
                          >
                            Auto-Generate
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={3}
                        className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest resize-none"
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="Compelling description summarizing the jewellery piece with target keywords to maximize search clicks..."
                      />
                      <p className="text-[11px] text-on-surface-variant mt-1">Optimal length: 140–160 characters. Displayed beneath the title in Google search results.</p>
                    </div>

                    {/* URL Handle / Slug */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-primary">Custom URL Handle / Slug</label>
                          <button
                            type="button"
                            onClick={autoGenerateSlug}
                            className="text-[11px] text-secondary hover:underline font-medium"
                          >
                            Auto-Slugify
                          </button>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-surface-container-low border border-r-0 border-outline-variant/50 rounded-l px-2.5 py-2 text-xs text-on-surface-variant select-none">
                            /products/
                          </span>
                          <input
                            type="text"
                            className="w-full border border-outline-variant/50 rounded-r px-3 py-2 text-xs focus:outline-none focus:border-primary bg-surface-container-lowest font-mono"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                            placeholder="royal-peacock-necklace"
                          />
                        </div>
                      </div>

                      {/* Focus Keywords / Meta Tags */}
                      <div>
                        <label className="block text-xs font-semibold text-primary mb-1">Focus Keywords / Meta Tags</label>
                        <input
                          type="text"
                          className="w-full border border-outline-variant/50 rounded px-3 py-2 text-xs focus:outline-none focus:border-primary bg-surface-container-lowest"
                          value={metaKeywords}
                          onChange={(e) => setMetaKeywords(e.target.value)}
                          placeholder="silver necklace, handcrafted 925, kolkata jewellery"
                        />
                        <p className="text-[11px] text-on-surface-variant mt-1">Comma-separated target keywords for search queries.</p>
                      </div>
                    </div>

                    {/* Canonical URL Override */}
                    <div>
                      <label className="block text-xs font-semibold text-primary mb-1">Canonical URL Override (Optional)</label>
                      <input
                        type="url"
                        className="w-full border border-outline-variant/50 rounded px-3 py-2 text-xs focus:outline-none focus:border-primary bg-surface-container-lowest font-mono"
                        value={canonicalUrl}
                        onChange={(e) => setCanonicalUrl(e.target.value)}
                        placeholder="https://thevanityjewels.com/products/... (Leave blank for default URL)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex gap-3 pt-4 border-t border-outline-variant/30">
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
                  className="flex-1 bg-primary text-on-primary hover:bg-inverse-surface rounded px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : isEditing ? 'Save Changes & SEO' : 'Add Product with SEO'}
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
                  Bulk Products & SEO CSV Import
                </h3>
                <p className="text-on-surface-variant text-sm mt-1">Upload a CSV file with SEO metadata and image alt-texts to create or update catalog instantly.</p>
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
                    <span className="material-symbols-outlined text-sm text-secondary">table_view</span>
                    Supported CSV & SEO Columns
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">Download our verified sample template with complete SEO columns.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="bg-primary text-on-primary hover:bg-inverse-surface px-4 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download Sample CSV
                </button>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse border border-outline-variant/30 bg-surface rounded">
                  <thead>
                    <tr className="bg-surface-container-low/70 border-b border-outline-variant/30">
                      <th className="p-2.5 font-semibold text-primary">Column Header</th>
                      <th className="p-2.5 font-semibold text-primary">Type</th>
                      <th className="p-2.5 font-semibold text-primary">Description & Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 font-mono text-[11px]">
                    <tr><td className="p-2 text-primary font-bold">sku</td><td className="p-2 text-secondary">Required</td><td className="p-2 text-on-surface-variant font-sans">Unique alphanumeric SKU code (e.g. VNT-RNG-101)</td></tr>
                    <tr><td className="p-2 text-primary font-bold">name</td><td className="p-2 text-secondary">Required</td><td className="p-2 text-on-surface-variant font-sans">Product display name (e.g. Emerald Cut Solitaire Ring)</td></tr>
                    <tr><td className="p-2 text-primary font-bold">category_name</td><td className="p-2 text-secondary">Required</td><td className="p-2 text-on-surface-variant font-sans">Rings, Necklaces, Bracelets, Earrings, etc.</td></tr>
                    <tr><td className="p-2 text-primary font-bold">image_url</td><td className="p-2 text-on-surface-variant">Optional</td><td className="p-2 text-on-surface-variant font-sans">Direct Cloudinary or HTTPS image URL</td></tr>
                    <tr className="bg-secondary/5"><td className="p-2 text-secondary font-bold">image_alt_text</td><td className="p-2 text-secondary">SEO</td><td className="p-2 text-on-surface-variant font-sans">Keyword-rich description for Google Images ranking</td></tr>
                    <tr className="bg-secondary/5"><td className="p-2 text-secondary font-bold">meta_title</td><td className="p-2 text-secondary">SEO</td><td className="p-2 text-on-surface-variant font-sans">Custom SEO Title tag (e.g. Solitaire Ring | 925 Silver | Vanity)</td></tr>
                    <tr className="bg-secondary/5"><td className="p-2 text-secondary font-bold">meta_description</td><td className="p-2 text-secondary">SEO</td><td className="p-2 text-on-surface-variant font-sans">Search snippet description (up to 160 characters)</td></tr>
                    <tr className="bg-secondary/5"><td className="p-2 text-secondary font-bold">meta_keywords</td><td className="p-2 text-secondary">SEO</td><td className="p-2 text-on-surface-variant font-sans">Comma-separated focus keywords</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upload Area */}
            <form onSubmit={handleBulkImportSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-outline-variant/50 hover:border-primary rounded-xl p-8 text-center bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-4xl text-secondary mb-2">cloud_upload</span>
                <p className="text-sm font-semibold text-primary mb-1">Select or drag CSV file here</p>
                <p className="text-xs text-on-surface-variant mb-4">Supports .csv and .xlsx files up to 10MB</p>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-inverse-surface cursor-pointer"
                />
              </div>

              {importError && (
                <div className="p-3 bg-error-container/20 border border-error/30 text-error rounded text-sm">{importError}</div>
              )}

              {importResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-sm">
                  <p className="font-semibold">{importResult.message}</p>
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
                  className="flex-1 bg-primary text-on-primary hover:bg-inverse-surface rounded px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {importing ? 'Importing Products...' : 'Start Bulk Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
