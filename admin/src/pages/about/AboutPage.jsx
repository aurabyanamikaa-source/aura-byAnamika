import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Admin Panel → About Page
// Drives every piece of the storefront's About Us page (client/src/pages/AboutPage.jsx)
// through the same key-value Settings store used elsewhere in the admin — the
// image, story copy, stats grid, button, and the Customer Diaries heading are
// all editable here without touching code.
export default function AboutPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then(r => setSettings(r.data.data))
      .catch(() => toast.error('Failed to load About Page content'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const stats = Array.isArray(settings.about_stats) ? settings.about_stats : [];
  const setStats = (next) => set('about_stats', next);
  const updateStat = (idx, field, value) => setStats(stats.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  const addStat = () => setStats([...stats, { num: '', label: '' }]);
  const removeStat = (idx) => setStats(stats.filter((_, i) => i !== idx));

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('folder', 'about-page');
      const { data } = await api.post('/upload/image', fd);
      set('about_image', data.data.url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Only the About Page fields need to round-trip here — sending the
      // whole settings map back is fine since updateSettings upserts by key.
      const aboutKeys = Object.keys(settings).filter(k => k.startsWith('about_'));
      const payload = {};
      aboutKeys.forEach(k => { payload[k] = settings[k]; });
      await api.put('/settings', payload);
      toast.success('About Page saved!');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #EF2853', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>About Page</h1>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Everything shown on the storefront's About Us page</div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <i className={`bi ${saving ? 'bi-hourglass' : 'bi-check-lg'}`}></i> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Story Section</h3>

          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Image</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ width: 180, aspectRatio: '7/5', borderRadius: 8, overflow: 'hidden', background: '#eee', position: 'relative', flexShrink: 0 }}>
              {settings.about_image && <img src={settings.about_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              {uploadingImage && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-hourglass-split"></i>
                </div>
              )}
            </div>
            <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
              <i className="bi bi-upload"></i> {settings.about_image ? 'Replace Image' : 'Upload Image'}
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files[0]; e.target.value = ''; handleImageUpload(f); }} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16, marginBottom: 16 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Subtitle</label>
              <input className="form-control" value={settings.about_subtitle || ''} onChange={e => set('about_subtitle', e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Title</label>
              <input className="form-control" value={settings.about_title || ''} onChange={e => set('about_title', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Paragraph 1</label>
            <textarea className="form-control" rows={3} value={settings.about_paragraph_1 || ''} onChange={e => set('about_paragraph_1', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Paragraph 2</label>
            <textarea className="form-control" rows={3} value={settings.about_paragraph_2 || ''} onChange={e => set('about_paragraph_2', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Button Text</label>
              <input className="form-control" value={settings.about_button_text || ''} onChange={e => set('about_button_text', e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Button Link</label>
              <input className="form-control" value={settings.about_button_link || ''} onChange={e => set('about_button_link', e.target.value)} placeholder="/shop" />
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <h3 style={{ fontWeight: 700, marginBottom: 4, fontSize: 16 }}>Stats</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>The four number/label tiles next to the story (e.g. 50K+ Happy Customers).</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.map((s, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input className="form-control" style={{ maxWidth: 140 }} placeholder="50K+" value={s.num || ''} onChange={e => updateStat(idx, 'num', e.target.value)} />
                <input className="form-control" placeholder="Happy Customers" value={s.label || ''} onChange={e => updateStat(idx, 'label', e.target.value)} />
                <button type="button" className="btn btn-outline btn-sm btn-icon" style={{ color: '#d33' }} onClick={() => removeStat(idx)}>
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }} onClick={addStat}>
              <i className="bi bi-plus-lg"></i> Add Stat
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3 style={{ fontWeight: 700, marginBottom: 4, fontSize: 16 }}>Customer Diaries Heading</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
            The photos in that strip come from Admin → Customer Diaries. This just controls the heading above them.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Subtitle</label>
              <input className="form-control" value={settings.about_diaries_subtitle || ''} onChange={e => set('about_diaries_subtitle', e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Title</label>
              <input className="form-control" value={settings.about_diaries_title || ''} onChange={e => set('about_diaries_title', e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}