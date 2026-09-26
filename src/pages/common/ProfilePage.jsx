import React, { useState } from 'react';
import { useApp, roles, religions, ADMIN_EMAIL_DOMAIN } from '../../context/AppContext';
import { User, Save } from 'lucide-react';

export default function ProfilePage() {
  const { session, setSession, own, state, saveStateToStorage, notify } = useApp();
  const u = own();

  const [namaLengkap, setNamaLengkap] = useState(u?.namaLengkap || '');
  const [email, setEmail] = useState(u?.email || '');
  const [kelas, setKelas] = useState(u?.kelas || '');
  const [jenisKelamin, setJenisKelamin] = useState(u?.jenisKelamin || 'Laki-laki');
  const [agama, setAgama] = useState(u?.agama || 'Islam');
  const [alamat, setAlamat] = useState(u?.alamat || '');
  const [noHp, setNoHp] = useState(u?.noHp || '');
  const [username, setUsername] = useState(u?.username || '');
  const [password, setPassword] = useState(u?.password || '');

  // Siswa specific
  const [namaWali, setNamaWali] = useState(u?.namaWali || '');
  const [nisn, setNisn] = useState(u?.nisn || '');
  const [asalSekolah, setAsalSekolah] = useState(u?.asalSekolah || '');

  // Guru specific
  const [mapel, setMapel] = useState(u?.mapel || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUsername = username.trim();
    const newName = namaLengkap.trim();
    const newPass = password.trim();

    if (!newName || !newUsername || !newPass) {
      notify('Nama, username, dan password wajib diisi.');
      return;
    }

    if (session.role === 'admin') {
      const em = email.trim().toLowerCase();
      if (!em.endsWith(ADMIN_EMAIL_DOMAIN)) {
        notify(`Email admin wajib berakhiran ${ADMIN_EMAIL_DOMAIN}`);
        return;
      }
    }

    const targetKey = { admin: 'admins', guru: 'gurus', siswa: 'siswas' }[session.role];
    const updatedUser = {
      ...u,
      namaLengkap: newName,
      username: newUsername,
      password: newPass,
      email: session.role === 'admin' ? email.trim().toLowerCase() : (u.email || ''),
      kelas: session.role !== 'admin' ? kelas.trim() : '',
      jenisKelamin,
      agama,
      alamat: alamat.trim(),
      noHp: noHp.trim(),
      namaWali: session.role === 'siswa' ? namaWali.trim() : (u.namaWali || ''),
      nisn: session.role === 'siswa' ? nisn.trim() : (u.nisn || ''),
      asalSekolah: session.role === 'siswa' ? asalSekolah.trim() : (u.asalSekolah || ''),
      mapel: session.role === 'guru' ? mapel.trim() : (u.mapel || '')
    };

    const nextList = state.users[targetKey].map(x => x.username === u.username ? updatedUser : x);

    let nextState = {
      ...state,
      users: {
        ...state.users,
        [targetKey]: nextList
      }
    };

    // If username changed, update session and references
    if (u.username !== newUsername) {
      const oldU = u.username;
      if (session.role === 'siswa') {
        const nextSubmissions = { ...state.submissions, [newUsername]: state.submissions[oldU] };
        delete nextSubmissions[oldU];
        const nextGrades = { ...state.grades, [newUsername]: state.grades[oldU] };
        delete nextGrades[oldU];
        const nextProgress = { ...state.progress, [newUsername]: state.progress[oldU] };
        delete nextProgress[oldU];
        const nextClasses = state.classes.map(c => ({
          ...c,
          studentUsernames: c.studentUsernames.map(s => s === oldU ? newUsername : s)
        }));
        nextState = {
          ...nextState,
          submissions: nextSubmissions,
          grades: nextGrades,
          progress: nextProgress,
          classes: nextClasses
        };
      }
      const updatedSession = { ...session, username: newUsername };
      setSession(updatedSession);
      try {
        localStorage.setItem('elearnmath_session_v1', JSON.stringify(updatedSession));
      } catch {}
    }

    if (saveStateToStorage(nextState)) {
      notify('Profil berhasil disimpan.');
    }
  };

  return (
    <div>
      <div className="eyebrow">Pengaturan Akun</div>
      <h2>Profil Saya</h2>
      <p className="section-sub">Perbarui informasi diri dan data akun pembelajaranmu.</p>

      <div className="card" style={{ maxWidth: 760 }}>
        <div className="row" style={{ gap: 16, marginBottom: 24 }}>
          <div className="avatar" style={{ width: 54, height: 54, fontSize: 22 }}>
            {(namaLengkap || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <strong style={{ fontSize: 16 }}>{namaLengkap || 'Nama Pengguna'}</strong>
            <div>
              <span className="badge badge-blue" style={{ marginTop: 4 }}>
                {roles[session.role]}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nama Lengkap</label>
            <input
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
            />
          </div>

          {session.role === 'admin' ? (
            <div className="field">
              <label>Email Admin</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          ) : (
            <div className="field">
              <label>{session.role === 'guru' ? 'Kelas yang Diampu (pisahkan dengan koma)' : 'Kelas'}</label>
              <input
                type="text"
                required
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
              />
            </div>
          )}

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

          {session.role === 'siswa' && (
            <div className="form-grid">
              <div className="field">
                <label>Nama Orang Tua / Wali</label>
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

          {session.role === 'guru' && (
            <div className="field">
              <label>Mata Pelajaran yang Diampu</label>
              <input
                type="text"
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
              />
            </div>
          )}

          <div className="form-grid">
            <div className="field">
              <label>Alamat Rumah</label>
              <input
                type="text"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Nomor Telepon / WhatsApp</label>
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
              />
            </div>
            <div className="field">
              <label>Kata Sandi (Password)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: 16 }}>
            <Save size={15} />
            Simpan Perubahan
          </button>
        </form>

        <div className="note" style={{ marginTop: 18 }}>
          {session.role === 'guru'
            ? 'Pengaturan kelas menentukan daftar siswa yang muncul pada dashboard Anda. Jadwal pelajaran dikelola oleh Administrator.'
            : session.role === 'admin'
            ? `Email admin wajib menggunakan domain ${ADMIN_EMAIL_DOMAIN}`
            : 'Samakan penulisan nama kelas dengan guru pengajar agar hasil pengerjaan dapat langsung dipantau oleh guru.'}
        </div>
      </div>
    </div>
  );
}
