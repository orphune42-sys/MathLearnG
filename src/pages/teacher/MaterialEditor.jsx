import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit2, Trash2, ExternalLink, BookOpen } from 'lucide-react';

export default function MaterialEditor() {
  const { state, saveStateToStorage, notify } = useApp();
  const [editingId, setEditingId] = useState(null);

  const [icon, setIcon] = useState('bar-chart');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [subbab, setSubbab] = useState('');
  const [links, setLinks] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setIcon('bar-chart');
    setTitle('');
    setDesc('');
    setSubbab('');
    setLinks('');
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setIcon(m.icon || 'bar-chart');
    setTitle(m.title || '');
    setDesc(m.desc || '');
    setSubbab((m.subbab || []).join(', '));
    setLinks((m.links || []).join('\n'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      notify('Judul materi wajib diisi.');
      return;
    }

    const parsedLinks = links
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('http://') || l.startsWith('https://'));

    const parsedSubbab = subbab
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const materialData = {
      id: editingId || 'm-' + Date.now(),
      icon,
      title: title.trim(),
      desc: desc.trim(),
      subbab: parsedSubbab,
      links: parsedLinks,
      yt: parsedLinks[0] || null
    };

    let nextMateri;
    if (editingId) {
      nextMateri = state.materi.map(m => m.id === editingId ? materialData : m);
    } else {
      nextMateri = [...state.materi, materialData];
    }

    if (saveStateToStorage({ ...state, materi: nextMateri })) {
      notify(editingId ? 'Materi berhasil diperbarui.' : 'Materi baru berhasil ditambahkan.');
      resetForm();
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Hapus materi ini?')) return;
    const nextMateri = state.materi.filter(m => m.id !== id);
    if (saveStateToStorage({ ...state, materi: nextMateri })) {
      notify('Materi berhasil dihapus.');
      if (editingId === id) resetForm();
    }
  };

  return (
    <div>
      <div className="eyebrow">Manajemen Materi</div>
      <h2>Kelola Materi Pembelajaran</h2>
      <p className="section-sub">Tambah, ubah, dan susun materi beserta tautan sumber belajar siswa.</p>

      <div className="card soal-form-card">
        <h3>{editingId ? 'Edit Materi Pembelajaran' : 'Tambah Materi Baru'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Tipe Ikon</label>
              <select value={icon} onChange={(e) => setIcon(e.target.value)}>
                <option value="bar-chart">Diagram Batang (Bar Chart)</option>
                <option value="pie-chart">Diagram Lingkaran (Pie Chart)</option>
                <option value="calculator">Kalkulator / Perhitungan</option>
                <option value="book">Buku / Teori Dasar</option>
              </select>
            </div>
            <div className="field">
              <label>Judul Materi</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Mengenal Jenis Data"
              />
            </div>
          </div>

          <div className="field">
            <label>Deskripsi Singkat</label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Deskripsi ringkas mengenai materi ini..."
            />
          </div>

          <div className="field">
            <label>Sub-bab (pisahkan dengan koma)</label>
            <input
              type="text"
              value={subbab}
              onChange={(e) => setSubbab(e.target.value)}
              placeholder="Data Kualitatif, Data Kuantitatif, Contoh Nyata"
            />
          </div>

          <div className="field">
            <label>Tautan Materi / Video (satu tautan per baris)</label>
            <textarea
              rows={3}
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              placeholder="https://youtube.com/watch?v=...&#10;https://drive.google.com/..."
            />
            <p className="hint-text">Mendukung tautan YouTube, Google Drive, atau modul online.</p>
          </div>

          <div className="row" style={{ marginTop: 16 }}>
            <button type="submit" className="btn-primary">
              {editingId ? 'Simpan Perubahan' : 'Tambah Materi'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Batalkan Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Daftar Materi Aktif</h3>
        {state.materi.length > 0 ? (
          state.materi.map((m) => (
            <div key={m.id} className="soal-item">
              <div className="row spread">
                <strong>{m.title}</strong>
                <div className="row" style={{ gap: 6 }}>
                  <button
                    type="button"
                    className="btn-outline-sm"
                    onClick={() => startEdit(m)}
                  >
                    <Edit2 size={13} />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger-sm"
                    onClick={() => handleDelete(m.id)}
                  >
                    <Trash2 size={13} />
                    Hapus
                  </button>
                </div>
              </div>
              <p className="muted" style={{ margin: '6px 0' }}>{m.desc}</p>
              <div>
                {(m.subbab || []).map((s, idx) => (
                  <span key={idx} className="tag-pill">{s}</span>
                ))}
              </div>
              {m.links && m.links.length > 0 && (
                <div className="row" style={{ marginTop: 8 }}>
                  {m.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hint-text"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--blue-600)' }}
                    >
                      <ExternalLink size={12} />
                      Tautan {idx + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">Belum ada materi pembelajaran yang dibuat.</div>
        )}
      </div>
    </div>
  );
}
