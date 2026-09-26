import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { School, Plus, Edit2, Trash2, Users } from 'lucide-react';

export default function ClassEditor() {
  const { state, saveStateToStorage, notify } = useApp();
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setTeacher('');
    setSelectedStudents([]);
  };

  const startEdit = (cls) => {
    setEditingId(cls.id);
    setName(cls.name || '');
    setTeacher(cls.teacherUsername || '');
    setSelectedStudents(cls.studentUsernames || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStudentToggle = (username) => {
    setSelectedStudents(prev =>
      prev.includes(username) ? prev.filter(u => u !== username) : [...prev, username]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const className = name.trim();
    if (!className) {
      notify('Nama kelas wajib diisi.');
      return;
    }

    const isDuplicate = state.classes.some(
      c => c.id !== editingId && c.name.trim().toLowerCase() === className.toLowerCase()
    );
    if (isDuplicate) {
      notify('Nama kelas sudah ada.');
      return;
    }

    const classData = {
      id: editingId || 'c-' + Date.now(),
      name: className,
      teacherUsername: teacher,
      studentUsernames: selectedStudents
    };

    let nextClasses;
    if (editingId) {
      nextClasses = state.classes.map(c => c.id === editingId ? classData : c);
    } else {
      nextClasses = [...state.classes, classData];
    }

    if (saveStateToStorage({ ...state, classes: nextClasses })) {
      notify(editingId ? 'Data kelas diperbarui.' : 'Kelas baru berhasil ditambahkan.');
      resetForm();
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Hapus kelas ini? Siswa dan guru tidak akan terhapus.')) return;
    const nextClasses = state.classes.filter(c => c.id !== id);
    if (saveStateToStorage({ ...state, classes: nextClasses })) {
      notify('Kelas berhasil dihapus.');
      if (editingId === id) resetForm();
    }
  };

  const getTeacherName = (uname) => {
    const t = state.users.gurus.find(g => g.username === uname);
    return t ? t.namaLengkap : 'Belum ditentukan';
  };

  return (
    <div>
      <div className="eyebrow">Manajemen Rombel</div>
      <h2>Kelola Kelas</h2>
      <p className="section-sub">Atur pembagian kelas, pengampu guru, serta anggota peserta didik.</p>

      <div className="card soal-form-card">
        <h3>{editingId ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Nama Kelas</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: VII-A"
              />
            </div>

            <div className="field">
              <label>Guru Pengajar / Wali</label>
              <select value={teacher} onChange={(e) => setTeacher(e.target.value)}>
                <option value="">Belum ditentukan</option>
                {state.users.gurus.map((g) => (
                  <option key={g.username} value={g.username}>
                    {g.namaLengkap} ({g.username})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Anggota Siswa ({selectedStudents.length} terpilih)</label>
            <div className="checklist-scroll">
              {state.users.siswas.length > 0 ? (
                state.users.siswas.map((s) => (
                  <label key={s.username} style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(s.username)}
                      onChange={() => handleStudentToggle(s.username)}
                    />
                    <span>{s.namaLengkap} ({s.kelas || s.username})</span>
                  </label>
                ))
              ) : (
                <div className="hint-text">Belum ada siswa terdaftar.</div>
              )}
            </div>
          </div>

          <div className="row" style={{ marginTop: 16 }}>
            <button type="submit" className="btn-primary">
              {editingId ? 'Simpan Perubahan' : 'Tambah Kelas'}
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
        <h3>Daftar Kelas ({state.classes.length})</h3>
        {state.classes.length > 0 ? (
          state.classes.map((cls) => (
            <div key={cls.id} className="soal-item">
              <div className="row spread">
                <strong>Kelas {cls.name}</strong>
                <div className="row" style={{ gap: 6 }}>
                  <button
                    type="button"
                    className="btn-outline-sm"
                    onClick={() => startEdit(cls)}
                  >
                    <Edit2 size={13} />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger-sm"
                    onClick={() => handleDelete(cls.id)}
                  >
                    <Trash2 size={13} />
                    Hapus
                  </button>
                </div>
              </div>
              <p className="hint-text" style={{ margin: '4px 0 8px' }}>
                Guru: {getTeacherName(cls.teacherUsername)} &middot; {cls.studentUsernames?.length || 0} Anggota
              </p>
              <div>
                {(cls.studentUsernames || []).map((uname) => {
                  const s = state.users.siswas.find(x => x.username === uname);
                  return (
                    <span key={uname} className="tag-pill">
                      {s ? s.namaLengkap : uname}
                    </span>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">Belum ada kelas yang terdaftar.</div>
        )}
      </div>
    </div>
  );
}
