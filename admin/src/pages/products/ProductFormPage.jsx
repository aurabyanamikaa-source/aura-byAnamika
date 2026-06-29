import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '', category: '',
    price: '', salePrice: '', stock: 0, sku: '',
    isFeatured: false, isNewArrival: false, isBestSeller: false, isActive: true,
    sizes: [], colors: [], tags: '',
    images: [], thumbnail: '',
    seo: { metaTitle: '', metaDescription: '' },
    weight: '', trackInventory: true,
  });

  const [newColor, setNewColor] = useState({ name: '', hex: '#000000' });

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data)).catch(() => {});
    if (isEdit) {
      setLoading(true);
      api.get(`/products/${id}`)
        .then(r => {
          const p = r.data.data;
          setForm({
            ...p,
            price: p.price || '',
            salePrice: p.salePrice || '',
            tags: p.tags?.join(', ') || '',
            colors: p.colors || [],
            sizes: p.sizes || [],
          });
        })
        .catch(() => toast.error('Failed to load product'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setSeo = (key, val) => setForm(f => ({ ...f, seo: { ...f.seo, [key]: val } }));

  const handleImageUpload = async (files) => {
    if (!files.length) return;
    if (!id) {
      toast.error('Save the product first before uploading images');
      return;
    }
    setUploadingImages(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('images', f));
      const { data } = await api.post(`/products/${id}/images`, fd);
      set('images', data.data);
      toast.success(`${files.length} image(s) uploaded`);
    } catch { toast.error('Image upload failed'); }
    finally { setUploadingImages(false); }
  };

  const removeImage = (idx) => {
    const imgs = form.images.filter((_, i) => i !== idx);
    set('images', imgs);
    if (form.thumbnail === form.images[idx]?.url) {
      set('thumbnail', imgs[0]?.url || '');
    }
  };

  const setThumbnail = (url) => set('thumbnail', url);

  const toggleSize = (size) => {
    set('sizes', form.sizes.includes(size) ? form.sizes.filter(s => s !== size) : [...form.sizes, size]);
  };

  const addColor = () => {
    if (!newColor.name) return;
    set('colors', [...(form.colors || []), { ...newColor }]);
    setNewColor({ name: '', hex: '#000000' });
  };

  const removeColor = (idx) => set('colors', form.colors.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.description) {
      toast.error('Please fill required fields: Name, Price, Category, Description');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags,
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        stock: parseInt(form.stock) || 0,
      };
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated!');
      } else {
        const { data } = await api.post('/products', payload);
        toast.success('Product created!');
        navigate(`/products/${data.data._id}/edit`);
        return;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ width: 40, height: 40, border: '3px solid #EF2853', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}></div>
    </div>
  );

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'pricing', label: 'Pricing & Stock' },
    { id: 'variants', label: 'Variants' },
    { id: 'images', label: 'Images' },
    { id: 'seo', label: 'SEO' },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          {isEdit && form.name && <p style={{ color: 'var(--muted)', fontSize: 13 }}>{form.name}</p>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/products')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <i className={`bi ${saving ? 'bi-hourglass' : 'bi-check-lg'}`}></i>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Left Column */}
        <div>
          {/* Tabs */}
          <div className="admin-tabs">
            {tabs.map(tab => (
              <button key={tab.id} type="button" className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="card">
            <div className="card-body">
              {/* Basic Info */}
              {activeTab === 'basic' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input className="form-control" placeholder="e.g. Premium Cotton T-Shirt" required value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Short Description</label>
                    <input className="form-control" placeholder="Brief product summary (shown in cards)" value={form.shortDescription || ''} onChange={e => set('shortDescription', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Description *</label>
                    <textarea className="form-control" style={{ minHeight: 200 }} required placeholder="Detailed product description (supports HTML)" value={form.description} onChange={e => set('description', e.target.value)} />
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Supports HTML tags for formatting</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-control" required value={form.category?._id || form.category || ''} onChange={e => set('category', e.target.value)}>
                      <option value="">Select a category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (comma-separated)</label>
                    <input className="form-control" placeholder="e.g. summer, casual, cotton" value={form.tags} onChange={e => set('tags', e.target.value)} />
                  </div>
                </div>
              )}

              {/* Pricing & Stock */}
              {activeTab === 'pricing' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Regular Price ($) *</label>
                      <input className="form-control" type="number" step="0.01" min="0" required placeholder="0.00" value={form.price} onChange={e => set('price', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sale Price ($)</label>
                      <input className="form-control" type="number" step="0.01" min="0" placeholder="Leave empty for no sale" value={form.salePrice || ''} onChange={e => set('salePrice', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">SKU</label>
                      <input className="form-control" placeholder="e.g. SKU-00001" value={form.sku || ''} onChange={e => set('sku', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Stock Quantity</label>
                      <input className="form-control" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Weight (kg)</label>
                      <input className="form-control" type="number" step="0.1" min="0" placeholder="0.0" value={form.weight || ''} onChange={e => set('weight', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="toggle">
                      <input type="checkbox" checked={form.trackInventory} onChange={e => set('trackInventory', e.target.checked)} />
                      <span className="toggle-slider"></span>
                      <span style={{ fontSize: 14 }}>Track inventory</span>
                    </label>
                  </div>

                  {form.price && form.salePrice && (
                    <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 16, marginTop: 16 }}>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>
                        Discount: {Math.round(((form.price - form.salePrice) / form.price) * 100)}% off
                      </span>
                      <span style={{ color: '#666', marginLeft: 12, fontSize: 13 }}>Customer saves ${(form.price - form.salePrice).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Variants */}
              {activeTab === 'variants' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Available Sizes</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {SIZES.map(size => (
                        <button key={size} type="button"
                          onClick={() => toggleSize(size)}
                          style={{
                            padding: '7px 16px', borderRadius: 8, border: '1.5px solid',
                            borderColor: form.sizes?.includes(size) ? '#EF2853' : 'var(--border)',
                            background: form.sizes?.includes(size) ? '#EF2853' : 'transparent',
                            color: form.sizes?.includes(size) ? '#fff' : 'var(--text)',
                            fontWeight: 500, fontSize: 13, cursor: 'pointer', transition: '0.2s',
                          }}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Colors</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      {(form.colors || []).map((color, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f5f5f5', borderRadius: 999, padding: '5px 12px 5px 6px' }}>
                          <span className="color-dot" style={{ background: color.hex }}></span>
                          <span style={{ fontSize: 13 }}>{color.name}</span>
                          <button type="button" onClick={() => removeColor(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontSize: 12 }}>Color Name</label>
                        <input className="form-control" placeholder="e.g. Black" value={newColor.name} onChange={e => setNewColor(n => ({ ...n, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: 12 }}>Hex Color</label>
                        <input type="color" value={newColor.hex} onChange={e => setNewColor(n => ({ ...n, hex: e.target.value }))} style={{ height: 38, width: 60, borderRadius: 8, border: '1.5px solid var(--border)', cursor: 'pointer' }} />
                      </div>
                      <button type="button" className="btn btn-secondary" onClick={addColor}>
                        <i className="bi bi-plus-lg"></i> Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Images */}
              {activeTab === 'images' && (
                <div>
                  {!isEdit && (
                    <div style={{ background: '#fef9c3', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 13, color: '#854d0e' }}>
                      <i className="bi bi-info-circle me-2"></i>
                      Save the product first, then come back to upload images.
                    </div>
                  )}
                  <div
                    className="upload-area"
                    onClick={() => document.getElementById('img-upload').click()}
                    style={{ opacity: !isEdit ? 0.5 : 1, pointerEvents: !isEdit ? 'none' : 'all' }}
                  >
                    <i className={`bi ${uploadingImages ? 'bi-hourglass-split' : 'bi-cloud-arrow-up'}`}></i>
                    <p style={{ fontWeight: 500, marginBottom: 4 }}>{uploadingImages ? 'Uploading...' : 'Click to upload images'}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>PNG, JPG, WEBP up to 10MB each. Multiple allowed.</p>
                  </div>
                  <input id="img-upload" type="file" multiple accept="image/*" style={{ display: 'none' }}
                    onChange={e => handleImageUpload(e.target.files)} />

                  {form.images?.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <label className="form-label">Uploaded Images ({form.images.length})</label>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Click an image to set as thumbnail</p>
                      <div className="image-grid">
                        {form.images.map((img, i) => (
                          <div key={i} className="image-grid-item" style={{ outline: form.thumbnail === img.url ? '3px solid #EF2853' : 'none', outlineOffset: 2 }}>
                            <img src={img.url} alt={`Product ${i + 1}`} onClick={() => setThumbnail(img.url)} style={{ cursor: 'pointer' }} />
                            {form.thumbnail === img.url && (
                              <div style={{ position: 'absolute', bottom: 4, left: 4, background: '#EF2853', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                                THUMB
                              </div>
                            )}
                            <button className="remove-btn" onClick={() => removeImage(i)}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SEO */}
              {activeTab === 'seo' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Meta Title</label>
                    <input className="form-control" placeholder={form.name || 'Product name'} value={form.seo?.metaTitle || ''} onChange={e => setSeo('metaTitle', e.target.value)} />
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{(form.seo?.metaTitle || form.name || '').length}/60 characters</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meta Description</label>
                    <textarea className="form-control" style={{ minHeight: 80 }} placeholder={form.shortDescription || 'Product description for search engines'} value={form.seo?.metaDescription || ''} onChange={e => setSeo('metaDescription', e.target.value)} />
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{(form.seo?.metaDescription || '').length}/160 characters</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status */}
          <div className="card">
            <div className="card-header"><span className="card-title">Status</span></div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'isActive', label: 'Active (visible in store)' },
                  { key: 'isFeatured', label: 'Featured on homepage' },
                  { key: 'isNewArrival', label: 'New Arrival badge' },
                  { key: 'isBestSeller', label: 'Best Seller badge' },
                ].map(({ key, label }) => (
                  <label key={key} className="toggle">
                    <input type="checkbox" checked={!!form[key]} onChange={e => set(key, e.target.checked)} />
                    <span className="toggle-slider"></span>
                    <span style={{ fontSize: 13 }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Thumbnail Preview */}
          {form.thumbnail && (
            <div className="card">
              <div className="card-header"><span className="card-title">Thumbnail Preview</span></div>
              <div style={{ padding: 16 }}>
                <img src={form.thumbnail} alt="Thumbnail" style={{ width: '100%', borderRadius: 10, aspectRatio: '3/4', objectFit: 'cover' }} />
              </div>
            </div>
          )}

          {/* Quick stats */}
          {isEdit && (
            <div className="card">
              <div className="card-header"><span className="card-title">Product Info</span></div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Sold</span>
                    <span style={{ fontWeight: 600 }}>{form.soldCount || 0} units</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Rating</span>
                    <span style={{ fontWeight: 600 }}>⭐ {form.ratings || 0} ({form.numReviews || 0})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Created</span>
                    <span style={{ fontWeight: 500 }}>{form.createdAt ? new Date(form.createdAt).toLocaleDateString() : '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
