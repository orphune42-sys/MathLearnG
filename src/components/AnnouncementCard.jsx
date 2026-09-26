import React, { useState } from 'react';
import { useApp, roles } from '../context/AppContext';
import { Bell, Plus, Trash2 } from 'lucide-react';

export default function AnnouncementCard() {
  const { state, saveStateToStorage, session, own, notify } = useApp();
  const [openAdd, setOpenAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const isStaff = session && ['guru', 'admin'].includes(session.role);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      notify('Judul dan isi pengumuman wajib diisi.');
      return;
    }

    const newAnnouncement = {
      id: 'a-' + Date.now(),
      title: title.trim(),
      body: body.trim(),
      authorUsername: session.username,
      authorName: own()?.namaLengkap || 'Staf',
      authorRole: session.role,
      createdAt: new Date().toISOString()
    };

    const nextState = {
      ...state,
      announcements: [...state.announcements, newAnnouncement]
    };

    if (saveStateToStorage(nextState)) {
      setTitle('');
      setBody('');
      setOpenAdd(false);
      notify('Pengumuman berhasil diterbitkan.');
    }
  };

  const handleDelete = (id) => {
    if (session?.role !== 'admin') return;
    if (!window.confirm('Hapus pengumuman ini?')) return;

    const nextState = {
      ...state,
      announcements: state.announcements.filter(a => a.id !== id)
    };
    saveStateToStorage(nextState);
    notify('Pengumuman dihapus.');
  };

  const formatDate = (val) => {
    if (!val) return '';
    return new Date(val).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <section className="card">
      <div className="row spread" style={{ marginBottom: 14 }}>
        <div className="row" style={{ gap: 8 }}>
          <Bell size={18} color="var(--orange-dark)" />
          <h3 style={{ margin: 0 }}>Pengumuman</h3>
        </div>
        <span className="badge badge-orange">{state.announcements.length} pengumuman</span>
      </div>

      {isStaff && (
        <div style={{ marginBottom: 16 }}>
          <button 
            type="button" 
            className="btn-outline-sm"
            onClick={() => setOpenAdd(!openAdd)}
            style={{ marginBottom: 10 }}
          >
            <Plus size={14} />
            {openAdd ? 'Tutup Form' : 'Tambah Pengumuman'}
          </button>

          {openAdd && (
            <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
              <div className="field">
                <label>Judul Pengumuman</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                  maxLength={160} 
                  placeholder="Ketik judul pengumuman..."
                />
              </div>
              <div className="field">
                <label>Isi Pengumuman</label>
                <textarea 
                  rows={3} 
                  value={body} 
                  onChange={(e) => setBody(e.target.value)} 
                  required 
                  maxLength={10000}
                  placeholder="Ketik isi pengumuman secara rinci..."
                />
              </div>
              <button type="submit" className="btn-primary">
                Terbitkan Pengumuman
              </button>
            </form>
          )}
        </div>
      )}

      {state.announcements.length > 0 ? (
        state.announcements.slice().reverse().map((a) => (
          <article key={a.id} className="soal-item announcement">
            <div className="row spread">
              <strong>{a.title}</strong>
              {session?.role === 'admin' && (
                <button 
                  type="button" 
                  className="btn-danger-sm" 
                  onClick={() => handleDelete(a.id)}
                >
                  <Trash2 size={13} />
                  Hapus
                </button>
              )}
            </div>
            <div className="hint-text" style={{ marginTop: 4 }}>
              {a.authorName} &middot; {roles[a.authorRole] || 'Guru'} &middot; {formatDate(a.createdAt)}
            </div>
            <div className="pre" style={{ marginTop: 10 }}>
              {a.body}
            </div>
          </article>
        ))
      ) : (
        <div className="empty-state">Belum ada pengumuman.</div>
      )}
    </section>
  );
}
