import React from 'react';
import { useApp, roles } from '../../context/AppContext';
import { Download, Upload, Edit2, Trash2, ShieldCheck, Users } from 'lucide-react';

export default function UsersPage({ onEditUser }) {
  const { state, saveStateToStorage, notify, logout } = useApp();

  const handleDeleteUser = (role, username) => {
    if (!window.confirm(`Hapus akun dan semua data terkait ${username}?`)) return;

    const targetKey = role === 'guru' ? 'gurus' : 'siswas';
    const nextList = state.users[targetKey].filter(x => x.username !== username);

    const nextClasses = state.classes.map(c => {
      if (role === 'guru' && c.teacherUsername === username) return { ...c, teacherUsername: '' };
      if (role === 'siswa') return { ...c, studentUsernames: c.studentUsernames.filter(u => u !== username) };
      return c;
    });

    let nextState = {
      ...state,
      users: { ...state.users, [targetKey]: nextList },
      classes: nextClasses
    };

    if (role === 'siswa') {
      const nextGrades = { ...state.grades };
      delete nextGrades[username];
      const nextProgress = { ...state.progress };
      delete nextProgress[username];
      const nextSubmissions = { ...state.submissions };
      delete nextSubmissions[username];
      const nextDrafts = { ...state.drafts };
      delete nextDrafts[username];
      const nextFlagged = (state.flagged || []).filter(f => f.username !== username && f.name !== username);

      nextState = {
        ...nextState,
        grades: nextGrades,
        progress: nextProgress,
        submissions: nextSubmissions,
        drafts: nextDrafts,
        flagged: nextFlagged
      };
    }

    if (saveStateToStorage(nextState)) {
      notify(`Akun ${username} berhasil dihapus.`);
    }
  };

  const handleDownloadBackup = () => {
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cadangan-ElearnMath-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Cadangan data berhasil diunduh.');
  };

  const handleRestoreFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.users || !parsed.materi || !parsed.kpd) {
          throw new Error('Format cadangan JSON tidak sesuai.');
        }
        if (!window.confirm('Pemulihan cadangan akan menggantikan seluruh data saat ini. Lanjutkan?')) {
          return;
        }
        saveStateToStorage(parsed);
        notify('Data cadangan berhasil dipulihkan. Silakan masuk kembali.');
        logout();
      } catch (err) {
        notify('Berkas cadangan tidak valid atau rusak.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div className="eyebrow">Basis Data</div>
      <h2>Semua Data Akun Pengguna</h2>
      <p className="section-sub">
        Informasi akun lokal tersimpan dalam peramban. Kata sandi pengguna hanya dapat ditinjau oleh Administrator.
      </p>

      {['guru', 'siswa'].map((role) => {
        const key = role === 'guru' ? 'gurus' : 'siswas';
        const list = state.users[key] || [];

        return (
          <div key={role} className="card">
            <div className="row spread" style={{ marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>
                {roles[role]} ({list.length})
              </h3>
              <span className="badge badge-blue">{list.length} Akun</span>
            </div>

            {list.length > 0 ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Nama Lengkap</th>
                      <th>Kelas</th>
                      <th>JK</th>
                      <th>Agama</th>
                      {role === 'guru' ? (
                        <>
                          <th>Mata Pelajaran</th>
                          <th>Jadwal Pelajaran</th>
                        </>
                      ) : (
                        <>
                          <th>Wali</th>
                          <th>NISN</th>
                          <th>Asal Sekolah</th>
                        </>
                      )}
                      <th>Alamat</th>
                      <th>No. HP</th>
                      <th>Username</th>
                      <th>Sandi</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((u) => (
                      <tr key={u.username}>
                        <td><strong>{u.namaLengkap}</strong></td>
                        <td>{u.kelas || '—'}</td>
                        <td>{u.jenisKelamin || '—'}</td>
                        <td>{u.agama || '—'}</td>
                        {role === 'guru' ? (
                          <>
                            <td>{u.mapel || '—'}</td>
                            <td className="pre">{u.jadwal || '—'}</td>
                          </>
                        ) : (
                          <>
                            <td>{u.namaWali || '—'}</td>
                            <td>{u.nisn || '—'}</td>
                            <td>{u.asalSekolah || '—'}</td>
                          </>
                        )}
                        <td>{u.alamat || '—'}</td>
                        <td>{u.noHp || '—'}</td>
                        <td>{u.username}</td>
                        <td><span className="mono-pw">{u.password}</span></td>
                        <td>
                          <div className="row" style={{ gap: 6 }}>
                            <button
                              type="button"
                              className="btn-outline-sm"
                              onClick={() => onEditUser(role, u.username)}
                            >
                              <Edit2 size={12} />
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn-danger-sm"
                              onClick={() => handleDeleteUser(role, u.username)}
                            >
                              <Trash2 size={12} />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">Belum ada {role} terdaftar.</div>
            )}
          </div>
        );
      })}

      {/* Cadangkan & Pulihkan */}
      <div className="card">
        <h3>Cadangkan & Pulihkan Data</h3>
        <p className="hint-text">
          Unduh salinan JSON seluruh data (akun, materi, soal, nilai, dan jawaban siswa) untuk disimpan atau dipindahkan ke perangkat lain.
        </p>

        <div className="row" style={{ marginTop: 14 }}>
          <button type="button" className="btn-secondary" onClick={handleDownloadBackup}>
            <Download size={14} />
            Unduh Cadangan JSON
          </button>

          <label className="btn-outline-sm" style={{ cursor: 'pointer' }}>
            <Upload size={14} />
            Pulihkan dari Berkas JSON
            <input
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={(e) => handleRestoreFile(e.target.files?.[0])}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
