import React, { useState, useEffect } from 'react';
import { useApp, roles, religions } from '../../context/AppContext';
import { UserPlus, Save, ArrowLeft } from 'lucide-react';

export default function UserEditor({ role = 'siswa', editUsername = null, onFinished }) {
  const { state, saveStateToStorage, notify, setCurrentPage } = useApp();
  const targetKey = role === 'guru' ? 'gurus' : 'siswas';

  const existing = editUsername
    ? state.users[targetKey].find(u => u.username === editUsername)
    : null;

  const [namaLengkap, setNamaLengkap] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [kelas, setKelas] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('Laki-laki');
  const [agama, setAgama] = useState('Islam');
  const [alamat, setAlamat] = useState('');
  const [noHp, setNoHp] = useState('');

  // Siswa specific
  const [namaWali, setNamaWali] = useState('');
  const [nisn, setNisn] = useState('');
  const [asalSekolah, setAsalSekolah] = useState('');

  // Guru specific
  const [mapel, setMapel] = useState('Matematika');
  const [jadwal, setJadwal] = useState('');

  useEffect(() => {
    if (existing) {
      setNamaLengkap(existing.namaLengkap || '');
      setUsername(existing.username || '');
      setPassword(existing.password || '');
      setKelas(existing.kelas || '');
      setJenisKelamin(existing.jenisKelamin || 'Laki-laki');
      setAgama(existing.agama || 'Islam');
      setAlamat(existing.alamat || '');
      setNoHp(existing.noHp || '');
      setNamaWali(existing.namaWali || '');
      setNisn(existing.nisn || '');
      setAsalSekolah(existing.asalSekolah || '');
      setMapel(existing.mapel || 'Matematika');
      setJadwal(existing.jadwal || '');
    } else {
      setNamaLengkap('');
      setUsername('');
      setPassword('');
      setKelas('');
      setJenisKelamin('Laki-laki');
      setAgama('Islam');
      setAlamat('');
      setNoHp('');
      setNamaWali('');
      setNisn('');
      setAsalSekolah('');
      setMapel('Matematika');
      setJadwal('');
    }
  }, [existing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const u = username.trim();
    const n = namaLengkap.trim();
    const p = password.trim();

    if (!n || !u || !p) {
      notify('Nama, username, dan password wajib diisi.');
      return;
    }

    if (!/^[A-Za-z0-9_.-]+$/.test(u)) {
      notify('Username hanya boleh menggunakan huruf, angka, titik, strip, atau garis bawah.');
      return;
    }

    const allUsers = [...state.users.admins, ...state.users.gurus, ...state.users.siswas];
    const isConflict = allUsers.some(
      x => x.username.toLowerCase() === u.toLowerCase() && (!existing || existing.username.toLowerCase() !== u.toLowerCase())
    );
    if (isConflict) {
      notify('Username sudah digunakan oleh akun lain.');
      return;
    }

    const userData = {
      namaLengkap: n,
      username: u,
      password: p,
      kelas: kelas.trim(),
      jenisKelamin,
      agama,
      alamat: alamat.trim(),
      noHp: noHp.trim(),
      namaWali: role === 'siswa' ? namaWali.trim() : '',
      nisn: role === 'siswa' ? nisn.trim() : '',
      asalSekolah: role === 'siswa' ? asalSekolah.trim() : '',
      mapel: role === 'guru' ? mapel.trim() : '',
      jadwal: role === 'guru' ? jadwal.trim() : ''
    };

    let nextTargetList;
    if (existing) {
      nextTargetList = state.users[targetKey].map(x => x.username === existing.username ? userData : x);
    } else {
      nextTargetList = [...state.users[targetKey], userData];
    }

    // Update references if username changed
    let nextState = {
      ...state,
      users: {
        ...state.users,
        [targetKey]: nextTargetList
      }
    };

    if (existing && existing.username !== u) {
      const oldU = existing.username;
      if (role === 'siswa') {
        const nextSubmissions = { ...state.submissions, [u]: state.submissions[oldU] };
        delete nextSubmissions[oldU];
        const nextGrades = { ...state.grades, [u]: state.grades[oldU] };
        delete nextGrades[oldU];
        const nextProgress = { ...state.progress, [u]: state.progress[oldU] };
        delete nextProgress[oldU];
        const nextClasses = state.classes.map(c => ({
          ...c,
          studentUsernames: c.studentUsernames.map(s => s === oldU ? u : s)
        }));
        nextState = {
          ...nextState,
          submissions: nextSubmissions,
          grades: nextGrades,
          progress: nextProgress,
          classes: nextClasses
        };
      } else if (role === 'guru') {
        const nextClasses = state.classes.map(c => ({
          ...c,
          teacherUsername: c.teacherUsername === oldU ? u : c.teacherUsername
        }));
        nextState = { ...nextState, classes: nextClasses };
      }
    }

    if (saveStateToStorage(nextState)) {
      notify(existing ? 'Data akun berhasil diperbarui.' : `Akun ${roles[role]} baru berhasil dibuat.`);
      if (onFinished) onFinished();
      else setCurrentPage('users');
    }
  };

  return (
    <div>
      <div className="eyebrow">Manajemen Pengguna</div>
      <h2>{existing ? 'Edit Data' : 'Tambah'} {roles[role]}</h2>
      <p className="section-sub">Data akun langsung aktif dan dapat digunakan untuk masuk ke dalam aplikasi.</p>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Nama Lengkap</label>
              <input
                type="text"
                required
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                placeholder="Nama lengkap..."
              />
            </div>

            <div className="field">
              <label>{role === 'guru' ? 'Kelas yang Diampu' : 'Kelas'}</label>
              <input
                type="text"
                required
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder={role === 'guru' ? 'VII-A, VII-B' : 'VII-A'}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Jenis Kelamin</label>
              <select value={jenisKelamin} onChange={(e) => setJenisKelamin(e.target.value)}>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div className="field">
              <label>Agama</label>
              <select value={agama} onChange={(e) => setAgama(e.target.value)}>
                {religions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {role === 'siswa' && (
            <div className="form-grid">
              <div className="field">
                <label>Nama Wali / Orang Tua</label>
                <input
                  type="text"
                  value={namaWali}
                  onChange={(e) => setNamaWali(e.target.value)}
                />
              </div>
              <div className="field">
                <label>NISN</label>
                <input
                  type="text"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Asal Sekolah</label>
                <input
                  type="text"
                  value={asalSekolah}
                  onChange={(e) => setAsalSekolah(e.target.value)}
                />
              </div>
            </div>
          )}

          {role === 'guru' && (
            <div>
              <div className="field">
                <label>Mata Pelajaran yang Diampu</label>
                <input
                  type="text"
                  value={mapel}
                  onChange={(e) => setMapel(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Jadwal Mengajar</label>
                <textarea
                  rows={2}
                  value={jadwal}
                  onChange={(e) => setJadwal(e.target.value)}
                  placeholder="Contoh: Senin 07.30 - 09.00 (VII-A)"
                />
              </div>
            </div>
          )}

          <div className="form-grid">
            <div className="field">
              <label>Alamat Tinggal</label>
              <input
                type="text"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Nomor HP / WhatsApp</label>
              <input
                type="tel"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid" style={{ paddingTop: 10, borderTop: '1px solid var(--line)' }}>
            <div className="field">
              <label>Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username login..."
              />
            </div>
            <div className="field">
              <label>Kata Sandi (Password)</label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata sandi..."
              />
            </div>
          </div>

          <div className="row" style={{ marginTop: 16 }}>
            <button type="submit" className="btn-primary">
              <Save size={14} />
              Simpan Data {roles[role]}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setCurrentPage('users')}
            >
              Batalkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
