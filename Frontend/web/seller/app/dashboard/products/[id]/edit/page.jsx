'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { sellerApi } from '@/lib/api';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ['Clothing', 'Shoes', 'Bags', 'Accessories', 'Beauty', 'Sports', 'Jewelry'];
const BADGES     = ['', 'NEW', 'HOT', 'SALE', 'TRENDING', 'BEST SELLER'];

const SIZES_BY_CATEGORY = {
  Shoes:       ['UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
  Bags:        ['One Size'],
  Accessories: ['One Size'],
  Jewelry:     ['One Size'],
  Beauty:      ['One Size'],
  default:     ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
};

const PRESET_COLORS = [
  '#000000','#1A1A2E','#FFFFFF','#F5F5F5','#FF385C','#D4A574',
  '#8B3A62','#4682B4','#1E3A5F','#FFD700','#8B4513','#C0392B',
  '#4A5568','#2D3748','#C4A882','#0D9488',
];

// ── Helper ─────────────────────────────────────────────────────────────────────
const Field = ({ label, required, error, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EditProductPage() {
  const router   = useRouter();
  const { id }   = useParams();
  const fileRef  = useRef(null);

  // Existing images from the server: { id, url, color, isPrimary }
  const [existingImages, setExistingImages] = useState([]);
  // New images picked by the user: { file, preview, color }
  const [newImages, setNewImages] = useState([]);

  // Form state
  const [form, setForm] = useState({
    name: '', brand: '', description: '',
    price: '', originalPrice: '',
    category: 'Clothing', badge: '', tryOn: false, isActive: true, stock: '',
    material: '', fit: '', care: '', origin: '',
  });
  const [sizes,       setSizes]       = useState([]);
  const [colors,      setColors]      = useState([]);
  const [customColor, setCustomColor] = useState('#000000');

  // UI state
  const [pageLoading, setPageLoading] = useState(true);
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [serverErr,   setServerErr]   = useState('');
  const [deletingImg, setDeletingImg] = useState(null);

  // ── Load product ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await sellerApi.products.get(id);
        const p   = res.data.data.product;
        setForm({
          name:          p.name          || '',
          brand:         p.brand         || '',
          description:   p.description   || '',
          price:         p.price         != null ? String(p.price) : '',
          originalPrice: p.originalPrice != null ? String(p.originalPrice) : '',
          category:      p.category      || 'Clothing',
          badge:         p.badge         || '',
          tryOn:         p.tryOn         ?? false,
          isActive:      p.isActive      ?? true,
          stock:         p.stock         != null ? String(p.stock) : '',
          material:      p.material      || '',
          fit:           p.fit           || '',
          care:          p.care          || '',
          origin:        p.origin        || '',
        });
        setSizes(p.sizes   || []);
        setColors(p.colors || []);
        // Sort: primary first
        const imgs = [...(p.images || [])].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
        setExistingImages(imgs);
      } catch {
        setServerErr('Failed to load product.');
      } finally {
        setPageLoading(false);
      }
    })();
  }, [id]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const sizeOptions  = SIZES_BY_CATEGORY[form.category] || SIZES_BY_CATEGORY.default;
  const totalImages  = existingImages.length + newImages.length;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // ── Image handlers ────────────────────────────────────────────────────────
  const onFilePick = (e) => {
    const files = Array.from(e.target.files);
    if (totalImages + files.length > 5) {
      alert('Maximum 5 images allowed.');
      return;
    }
    const picked = files.map((file) => ({ file, preview: URL.createObjectURL(file), color: null }));
    setNewImages((prev) => [...prev, ...picked]);
    e.target.value = '';
  };

  const removeNewImage = (idx) => {
    URL.revokeObjectURL(newImages[idx].preview);
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const setNewImageColor = (idx, color) =>
    setNewImages((prev) => prev.map((img, i) => i === idx ? { ...img, color } : img));

  const setExistingImageColor = (idx, color) =>
    setExistingImages((prev) => prev.map((img, i) => i === idx ? { ...img, color } : img));

  const handleDeleteExisting = async (imageId) => {
    if (!confirm('Remove this image?')) return;
    setDeletingImg(imageId);
    try {
      await sellerApi.products.deleteImage(id, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      alert('Failed to delete image.');
    } finally {
      setDeletingImg(null);
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await sellerApi.products.setPrimary(id, imageId);
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, isPrimary: img.id === imageId }))
            .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
      );
    } catch {
      alert('Failed to set primary image.');
    }
  };

  // ── Size / Color toggles ──────────────────────────────────────────────────
  const toggleSize  = (s) => setSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const addColor    = (c) => { if (!colors.includes(c) && colors.length < 8) setColors((prev) => [...prev, c]); };
  const removeColor = (c) => setColors((prev) => prev.filter((x) => x !== c));

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Product name is required.';
    if (!form.brand.trim())    e.brand    = 'Brand is required.';
    if (!form.price || isNaN(+form.price) || +form.price <= 0) e.price = 'Enter a valid price.';
    if (!form.category)        e.category = 'Category is required.';
    if (totalImages === 0)     e.images   = 'At least one image is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerErr('');

    try {
      const fd = new FormData();
      fd.append('name',        form.name.trim());
      fd.append('brand',       form.brand.trim());
      fd.append('description', form.description.trim());
      fd.append('price',       form.price);
      fd.append('originalPrice', form.originalPrice || '');
      fd.append('category',    form.category);
      fd.append('badge',       form.badge);
      fd.append('tryOn',       String(form.tryOn));
      fd.append('isActive',    String(form.isActive));
      fd.append('stock',       form.stock || '0');
      fd.append('sizes',       JSON.stringify(sizes));
      fd.append('colors',      JSON.stringify(colors));
      if (form.material) fd.append('material', form.material.trim());
      if (form.fit)      fd.append('fit',      form.fit.trim());
      if (form.care)     fd.append('care',     form.care.trim());
      if (form.origin)   fd.append('origin',   form.origin.trim());

      // New images only
      newImages.forEach((img) => fd.append('images', img.file));
      fd.append('imageColors', JSON.stringify(newImages.map((img) => img.color || null)));

      await sellerApi.products.update(id, fd);
      router.push('/dashboard/products');
    } catch (err) {
      setServerErr(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <svg className="animate-spin h-7 w-7 text-gray-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard/products"
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Edit Product</h1>
          <p className="text-gray-500 text-sm mt-0.5">Update the details for this product.</p>
        </div>
      </div>

      {serverErr && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
          {serverErr}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>

        {/* ── Images ── */}
        <Section title="Product Images" subtitle="Click an existing image to set it as cover. Use the × button to remove it. Add new images below.">
          <Field label="Images" required error={errors.images}>
            <div className="flex flex-wrap gap-4">

              {/* Existing images */}
              {existingImages.map((img, idx) => (
                <div key={img.id} className="flex flex-col items-center gap-1.5">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => handleSetPrimary(img.id)}
                  >
                    <div className={`w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                      img.isPrimary ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-transparent hover:border-gray-300'
                    }`}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    {img.isPrimary && (
                      <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full pointer-events-none">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteExisting(img.id); }}
                      disabled={deletingImg === img.id}
                      className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center text-xs font-bold disabled:opacity-40"
                    >
                      {deletingImg === img.id ? '…' : '×'}
                    </button>
                  </div>
                  <select
                    value={img.color || ''}
                    onChange={(e) => { e.stopPropagation(); setExistingImageColor(idx, e.target.value || null); }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-24 text-[11px] py-1 px-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 focus:outline-none focus:border-gray-400"
                  >
                    <option value="">All colors</option>
                    {colors.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              ))}

              {/* New images */}
              {newImages.map((img, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed border-blue-300">
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full pointer-events-none">
                      New
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center text-xs font-bold"
                    >
                      ×
                    </button>
                  </div>
                  <select
                    value={img.color || ''}
                    onChange={(e) => setNewImageColor(idx, e.target.value || null)}
                    className="w-24 text-[11px] py-1 px-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 focus:outline-none focus:border-gray-400"
                  >
                    <option value="">All colors</option>
                    {colors.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              ))}

              {/* Add button */}
              {totalImages < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[11px] font-medium">Add</span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onFilePick}
            />
          </Field>
        </Section>

        {/* ── Basic Info ── */}
        <Section title="Basic Information">
          <div className="grid grid-cols-2 gap-5">
            <Field label="Product Name" required error={errors.name}>
              <input
                type="text"
                placeholder="e.g. Minimal Linen Blazer"
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                value={form.name}
                onChange={set('name')}
              />
            </Field>
            <Field label="Brand" required error={errors.brand}>
              <input
                type="text"
                placeholder="e.g. ARKET"
                className={`input-field ${errors.brand ? 'border-red-400' : ''}`}
                value={form.brand}
                onChange={set('brand')}
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              rows={3}
              placeholder="Describe your product…"
              className="input-field resize-none"
              value={form.description}
              onChange={set('description')}
            />
          </Field>
        </Section>

        {/* ── Pricing & Stock ── */}
        <Section title="Pricing & Stock">
          <div className="grid grid-cols-3 gap-5">
            <Field label="Price (₹)" required error={errors.price}>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={`input-field ${errors.price ? 'border-red-400' : ''}`}
                value={form.price}
                onChange={set('price')}
              />
            </Field>
            <Field label="Original Price (₹)" hint="Leave blank if no discount">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="input-field"
                value={form.originalPrice}
                onChange={set('originalPrice')}
              />
            </Field>
            <Field label="Stock" hint="Available quantity — automatically decreases when buyers place orders">
              <input
                type="number"
                min="0"
                placeholder="0"
                className="input-field"
                value={form.stock}
                onChange={set('stock')}
              />
            </Field>
          </div>
        </Section>

        {/* ── Category & Badge ── */}
        <Section title="Category & Labelling">
          <div className="grid grid-cols-2 gap-5">
            <Field label="Category" required error={errors.category}>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => {
                  setForm((f) => ({ ...f, category: e.target.value }));
                  setSizes([]);
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Badge" hint="Highlight label shown on the product card">
              <select
                className="input-field"
                value={form.badge}
                onChange={set('badge')}
              >
                {BADGES.map((b) => (
                  <option key={b} value={b}>{b || 'None'}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-4 pt-1">
            {/* Virtual Try-On */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, tryOn: !f.tryOn }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.tryOn ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.tryOn ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <div>
                <p className="text-sm font-medium text-gray-900">Virtual Try-On</p>
                <p className="text-xs text-gray-400">Allow buyers to try this product virtually</p>
              </div>
            </div>

            {/* Active status */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.isActive ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.isActive ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <div>
                <p className="text-sm font-medium text-gray-900">Active</p>
                <p className="text-xs text-gray-400">Inactive products are hidden from buyers</p>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Product Details ── */}
        <Section title="Product Details" subtitle="Shown in the Details card on the product page.">
          <div className="grid grid-cols-2 gap-5">
            <Field label="Material" hint="e.g. 100% Cotton, Premium Leather">
              <input
                type="text"
                placeholder="e.g. Premium quality fabric blend"
                className="input-field"
                value={form.material}
                onChange={set('material')}
              />
            </Field>
            <Field label="Fit" hint="e.g. Regular fit, Slim fit, Oversized">
              <input
                type="text"
                placeholder="e.g. Regular fit, true to size"
                className="input-field"
                value={form.fit}
                onChange={set('fit')}
              />
            </Field>
            <Field label="Care Instructions" hint="e.g. Machine wash cold, dry clean only">
              <input
                type="text"
                placeholder="e.g. Machine wash cold, tumble dry low"
                className="input-field"
                value={form.care}
                onChange={set('care')}
              />
            </Field>
            <Field label="Origin" hint="e.g. Made in India, Ethically made">
              <input
                type="text"
                placeholder="e.g. Ethically made in India"
                className="input-field"
                value={form.origin}
                onChange={set('origin')}
              />
            </Field>
          </div>
        </Section>

        {/* ── Sizes ── */}
        <Section title="Available Sizes">
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                  sizes.includes(s)
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {sizes.length === 0 && (
            <p className="text-xs text-gray-400">No sizes selected — buyers won't see a size picker.</p>
          )}
        </Section>

        {/* ── Colors ── */}
        <Section title="Available Colors">
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => colors.includes(c) ? removeColor(c) : addColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  colors.includes(c) ? 'border-gray-900 scale-110' : 'border-gray-200 hover:border-gray-400'
                } ${c === '#FFFFFF' || c === '#F5F5F5' ? 'ring-1 ring-gray-200' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="input-field w-32 font-mono text-sm uppercase"
              placeholder="#000000"
            />
            <button
              type="button"
              onClick={() => addColor(customColor)}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
            >
              Add Color
            </button>
          </div>

          {colors.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {colors.map((c) => (
                <div key={c} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                  <span
                    className={`w-4 h-4 rounded-full border ${c === '#FFFFFF' || c === '#F5F5F5' ? 'border-gray-300' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                  <span className="text-xs font-mono text-gray-600 uppercase">{c}</span>
                  <button
                    type="button"
                    onClick={() => removeColor(c)}
                    className="text-gray-400 hover:text-red-500 text-xs font-bold ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Submit ── */}
        <div className="flex items-center gap-4 pb-8">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary max-w-xs"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </span>
            ) : 'Save Changes'}
          </button>
          <Link
            href="/dashboard/products"
            className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
