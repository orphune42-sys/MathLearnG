import React, { useState } from 'react';
import { useApp, roles, religions, ADMIN_EMAIL_DOMAIN } from '../../context/AppContext';
import { GraduationCap, BookOpen, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function AuthPage() {
  const { state, saveStateToStorage, login, notify } = useApp();
  const [mode, setMode] = useState('choose'); // 'choose', 'login', 'register'
  const [selectedRole, setSelectedRole] = useState('siswa');
  const [error, setError] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [kelas, setKelas] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('');
  const [agama, setAgama] = useState('');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setMode('login');
    setError('');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = login(selectedRole, username, password);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');

    const u = username.trim();
    const p = password.trim();
    const n = namaLengkap.trim();

    if (!n || !u || !p) {
      setError('Nama lengkap, username, dan password wajib diisi.');
      return;
    }

    if (!/^[A-Za-z0-9_.-]+$/.test(u)) {
      setError('Username hanya boleh mengandung huruf, angka, titik, strip, atau garis bawah.');
      return;
    }

    const allUsers = [...state.users.admins, ...state.users.gurus, ...state.users.siswas];
    if (allUsers.some(user => user.username.toLowerCase() === u.toLowerCase())) {
      setError('Username sudah digunakan. Silakan gunakan username lain.');
      return;
    }

    if (selectedRole !== 'admin' && !kelas.trim()) {
      setError('Kelas wajib diisi.');
      return;
    }

    if (selectedRole === 'admin') {
      const em = email.trim().toLowerCase();
      if (!em.endsWith(ADMIN_EMAIL_DOMAIN)) {
        setError(`Email admin wajib menggunakan domain ${ADMIN_EMAIL_DOMAIN}`);
        return;
      }
      if (state.users.admins.some(a => a.email === em)) {
        setError('Email admin sudah terdaftar.');
        return;
      }
    }

    const newRecord = {
      namaLengkap: n,
      username: u,
      password: p,
      kelas: kelas.trim(),
      jenisKelamin,
      agama,
      namaWali: '',
      nisn: '',
      asalSekolah: '',
      alamat: '',
      noHp: '',
      mapel: selectedRole === 'guru' ? 'Matematika' : '',
      jadwal: '',
      email: selectedRole === 'admin' ? email.trim().toLowerCase() : ''
    };

    const targetKey = { admin: 'admins', guru: 'gurus', siswa: 'siswas' }[selectedRole];
    const nextState = {
      ...state,
      users: {
        ...state.users,
        [targetKey]: [...state.users[targetKey], newRecord]
      }
    };

    if (saveStateToStorage(nextState)) {
      notify('Akun berhasil dibuat. Silakan login.');
      setMode('login');
      setPassword('');
      setError('');
    }
  };

  return (
    <section className="center-shell">
      <div className="card auth-card">
        <div className="brand">
          <div className="logo-badge">∑</div>
          <div className="logo-text">Elearn<span>Math</span></div>
        </div>

        {mode === 'choose' && (
          <div>
            <p className="muted" style={{ marginBottom: 24 }}>
              Masuk sesuai peranmu untuk mulai belajar matematika
            </p>
            <div className="grid" style={{ gap: 12 }}>
              <button
                type="button"
                className="btn-primary wide"
                onClick={() => handleRoleSelect('siswa')}
              >
                <GraduationCap size={18} />
                Masuk sebagai Siswa
              </button>
              <button
                type="button"
                className="btn-secondary wide"
                onClick={() => handleRoleSelect('guru')}
              >
                <BookOpen size={18} />
                Masuk sebagai Guru
              </button>
              <button
                type="button"
                className="btn-secondary wide"
                onClick={() => handleRoleSelect('admin')}
              >
                <ShieldCheck size={18} />
                Masuk sebagai Admin
              </button>
            </div>
            <div className="auth-switch" style={{ marginTop: 20 }}>
              Belum punya akun?{' '}
              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  setSelectedRole('siswa');
                  setMode('register');
                  setError('');
                }}
              >
                Daftar di sini
              </button>
            </div>
          </div>
        )}

        {mode === 'login' && (
          <div>
            <p className="muted" style={{ marginBottom: 20 }}>
              Login {roles[selectedRole]}
            </p>

            <form onSubmit={handleLoginSubmit}>
              <div className="field">
                <label>Username</label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ketik username..."
                />
              </div>

              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ketik password..."
                />
              </div>

              {error && <div className="error">{error}</div>}

              <button type="submit" className="btn-primary wide" style={{ marginTop: 8 }}>
                Login {roles[selectedRole]}
              </button>
            </form>

            <div className="auth-switch" style={{ marginTop: 16 }}>
              Belum punya akun?{' '}
              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
              >
                Daftar sebagai {roles[selectedRole]}
              </button>
            </div>

            <div className="auth-switch">
              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  setMode('choose');
                  setError('');
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <ArrowLeft size={13} />
                Kembali ke pilihan peran
              </button>
            </div>
          </div>
        )}

        {mode === 'register' && (
          <div>
            <p className="muted" style={{ marginBottom: 20 }}>
              Buat akun baru
            </p>

            <form onSubmit={handleRegisterSubmit}>
              <div className="field">
                <label>Daftar sebagai</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="siswa">Siswa</option>
                  <option value="guru">Guru</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

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

              {selectedRole === 'admin' ? (
                <div className="field">
                  <label>Email khusus admin</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@students.um.ac.id"
                  />
                  <p className="hint-text">Gunakan domain {ADMIN_EMAIL_DOMAIN}</p>
                </div>
              ) : (
                <div className="field">
                  <label>{selectedRole === 'guru' ? 'Kelas yang Diampu' : 'Kelas'}</label>
                  <input
                    type="text"
                    required
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    placeholder={selectedRole === 'guru' ? 'VII-A, VII-B' : 'VII-A'}
                  />
                  <p className="hint-text">
                    {selectedRole === 'guru'
                      ? 'Pisahkan beberapa kelas dengan koma.'
                      : 'Samakan penulisan dengan kelas gurumu.'}
                  </p>
                </div>
              )}

              {selectedRole !== 'siswa' && (
                <div className="form-grid">
                  <div className="field">
                    <label>Jenis Kelamin</label>
                    <select
                      value={jenisKelamin}
                      onChange={(e) => setJenisKelamin(e.target.value)}
                      required
                    >
                      <option value="">Pilih</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Agama</label>
                    <select
                      value={agama}
                      onChange={(e) => setAgama(e.target.value)}
                      required
                    >
                      <option value="">Pilih</option>
                      {religions.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="field">
                <label>Username</label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Gunakan huruf dan angka..."
                />
              </div>

              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ketik kata sandi..."
                />
              </div>

              {error && <div className="error">{error}</div>}

              <button type="submit" className="btn-primary wide" style={{ marginTop: 8 }}>
                Daftar
              </button>
            </form>

            <div className="auth-switch" style={{ marginTop: 16 }}>
              Sudah punya akun?{' '}
              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
              >
                Login
              </button>
            </div>
          </div>
        )}

        <div className="note" style={{ marginTop: 24 }}>
          Akun dan data tersimpan lokal pada browser ini. Gunakan akun demonstrasi atau daftarkan akun baru.
        </div>
      </div>
    </section>
  );
}
