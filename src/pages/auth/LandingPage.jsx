import React, { useState } from 'react';
import jadwalData from '../../data/jadwal.json';
import {
  Search,
  Calendar,
  Clock,
  User,
  LogIn,
  UserPlus,
  Eye,
  Edit3,
  Award,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';

export default function LandingPage({ onGoLogin, onGoRegister }) {
  const [activeTab, setActiveTab] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const siswaJadwal = jadwalData.jadwalSiswa;
  const guruJadwal = jadwalData.jadwalGuru;

  const filteredJadwal = siswaJadwal.filter(j => {
    if (activeTab !== 'semua' && !j.kelas.toLowerCase().includes(activeTab.toLowerCase())) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        j.kelas.toLowerCase().includes(q) ||
        j.kodeMapel.toLowerCase().includes(q) ||
        j.namaMapel.toLowerCase().includes(q) ||
        j.hari.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="travel-landing-container" style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 20px 48px' }}>
      
      {/* 1. TOP NAVBAR HEADER */}
      <header
        className="card"
        style={{
          borderRadius: 999,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap'
        }}
      >
        {/* Brand Logo */}
        <div className="brand" style={{ cursor: 'pointer' }}>
          <div className="logo-badge" style={{ width: 36, height: 36, fontSize: 18 }}>∑</div>
          <div className="logo-text" style={{ fontSize: 20 }}>Elearn<span>Math</span></div>
        </div>

        {/* Navigation Links */}
        <nav className="row" style={{ gap: 20, fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>
          <a href="#beranda" style={{ color: 'var(--blue-800)', fontWeight: 600 }}>Beranda</a>
          <a href="#jadwal" style={{ color: 'var(--muted)' }}>Jadwal Kelas</a>
          <a href="#fitur" style={{ color: 'var(--muted)' }}>Fitur Guru</a>
          <a href="#materi" style={{ color: 'var(--muted)' }}>Modul Materi</a>
          <a href="#langkah" style={{ color: 'var(--muted)' }}>Cara Kerja</a>
        </nav>

        {/* Search Bar */}
        <div className="row" style={{ gap: 10 }}>
          <div className="search-pill" style={{ position: 'relative', width: 210 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Cari kelas, jadwal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: 34,
                paddingRight: 12,
                paddingTop: 7,
                paddingBottom: 7,
                borderRadius: 999,
                fontSize: 12,
                border: '1px solid var(--line)',
                background: 'rgba(255,255,255,0.8)'
              }}
            />
          </div>

          <button
            type="button"
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: 13, borderRadius: 999 }}
            onClick={onGoLogin}
          >
            Masuk / Daftar
          </button>
        </div>
      </header>

      {/* 2. HERO BANNER SECTION */}
      <section
        id="beranda"
        style={{
          position: 'relative',
          borderRadius: 28,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1b4e80 0%, #2e7bc4 50%, #4682B4 100%)',
          color: 'white',
          padding: '60px 36px 48px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(27, 78, 128, 0.25)',
          marginBottom: 36
        }}
      >
        <div style={{ position: 'absolute', top: -50, right: -50, width: 250, height: 250, background: 'rgba(255,255,255,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, background: 'rgba(255,180,84,0.15)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 720, margin: '0 auto' }}>
          <span
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              padding: '6px 16px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: 16
            }}
          >
            MEDIA PEMBELAJARAN MATEMATIKA KELAS VII
          </span>

          <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1, color: '#ffffff', marginBottom: 16, lineHeight: 1.1 }}>
            MATEMATIKA VII
          </h1>

          <p style={{ fontSize: 16, color: 'rgba(234, 246, 255, 0.9)', lineHeight: 1.6, marginBottom: 28 }}>
            Platform pembelajaran interaktif terstruktur untuk Kelas VII A, VII B, dan VII C dengan fitur pemantauan presensi siswa real-time dan pengelolaan materi guru.
          </p>

          <div className="row" style={{ justifyContent: 'center', gap: 14 }}>
            <button
              type="button"
              className="btn-accent"
              style={{ padding: '12px 28px', borderRadius: 999, fontSize: 14, fontWeight: 700 }}
              onClick={onGoLogin}
            >
              <LogIn size={16} />
              Masuk (Sign In)
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{
                padding: '12px 28px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 600,
                background: 'rgba(255,255,255,0.18)',
                color: 'white',
                borderColor: 'rgba(255,255,255,0.4)'
              }}
              onClick={onGoRegister}
            >
              <UserPlus size={16} />
              Daftar Akun Baru
            </button>
          </div>
        </div>
      </section>

      {/* 3. VALUE PROPOSITION SECTION */}
      <section
        id="fitur"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 32,
          alignItems: 'center',
          marginBottom: 40
        }}
      >
        <div>
          <h2 style={{ fontSize: 26, color: 'var(--blue-800)', lineHeight: 1.3, marginBottom: 16 }}>
            Mengapa ElearnMath Menjadi Pilihan Utama Pembelajaran Matematika Kelas VII?
          </h2>
          <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Dirancang khusus untuk membantu siswa memahami konsep penyajian data, diagram, dan statistik dasar secara visual sekaligus memudahkan guru dalam memantau keaktifan siswa.
          </p>

          <div className="row" style={{ gap: 24, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue-800)' }}>3 Kelas</div>
              <div className="hint-text">VII A, VII B, VII C</div>
            </div>
            <div style={{ width: 1, height: 32, background: 'var(--line)' }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue-800)' }}>100+</div>
              <div className="hint-text">LKPD & Latihan Soal</div>
            </div>
            <div style={{ width: 1, height: 32, background: 'var(--line)' }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue-800)' }}>JSON</div>
              <div className="hint-text">Penyimpanan Terstruktur</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <div
            className="card"
            style={{
              padding: '18px 20px',
              borderRadius: 18,
              margin: 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'rgba(95, 168, 232, 0.15)',
                color: 'var(--blue-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Eye size={22} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: 15 }}>Pemantauan Siswa Login Real-time</h3>
              <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>
                Guru (Ibu Mila S.Pd) dapat memantau siswa mana saja yang sedang online dan aktif belajar di kelasnya.
              </p>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '18px 20px',
              borderRadius: 18,
              margin: 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'rgba(34, 181, 115, 0.15)',
                color: '#22b573',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Edit3 size={22} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: 15 }}>Fitur Tambah & Kurangi Materi</h3>
              <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>
                Guru memiliki akses penuh untuk menambah materi baru, mengedit sub-bab, maupun menghapus modul.
              </p>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '18px 20px',
              borderRadius: 18,
              margin: 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'rgba(255, 180, 84, 0.18)',
                color: '#e08000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: 15 }}>Integrasi Data Jadwal JSON</h3>
              <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>
                Data jadwal siswa VII A, VII B, VII C dan Guru tersimpan rapi dalam format JSON lokal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CARD GRID SECTION ("Jadwal Pelajaran Matematika") */}
      <section
        id="jadwal"
        className="card"
        style={{
          borderRadius: 24,
          padding: '30px 28px',
          marginBottom: 40,
          background: 'rgba(255, 255, 255, 0.65)'
        }}
      >
        <div className="row spread" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, margin: 0 }}>Jadwal Pelajaran Matematika</h2>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
              Daftar jadwal pelajaran per kelas dan guru pengampu Ibu Mila S.Pd
            </p>
          </div>

          <div className="row" style={{ gap: 8 }}>
            {['semua', 'VII A', 'VII B', 'VII C'].map((cls) => (
              <button
                key={cls}
                type="button"
                className={activeTab === cls ? 'btn-primary' : 'btn-outline-sm'}
                style={{ fontSize: 12, padding: '5px 14px', borderRadius: 999 }}
                onClick={() => setActiveTab(cls)}
              >
                {cls === 'semua' ? 'Semua Kelas' : cls}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 20
          }}
        >
          {filteredJadwal.map((j, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                background: '#ffffff',
                border: '1px solid rgba(220, 234, 247, 0.8)',
                boxShadow: '0 8px 20px rgba(27, 78, 128, 0.06)',
                transition: 'transform 0.2s ease, boxShadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div
                style={{
                  height: 110,
                  background: idx % 3 === 0
                    ? 'linear-gradient(135deg, #2e7bc4, #5fa8e8)'
                    : idx % 3 === 1
                    ? 'linear-gradient(135deg, #1b4e80, #2e7bc4)'
                    : 'linear-gradient(135deg, #f0932b, #ffb454)',
                  padding: 14,
                  position: 'relative',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <span
                  style={{
                    alignSelf: 'flex-end',
                    background: 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(4px)',
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700
                  }}
                >
                  {j.kodeMapel}
                </span>

                <div>
                  <h3 style={{ color: 'white', margin: 0, fontSize: 18, fontWeight: 700 }}>
                    {j.kelas}
                  </h3>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>{j.namaMapel}</div>
                </div>
              </div>

              <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontSize: 13, display: 'grid', gap: 6 }}>
                  <div className="row" style={{ gap: 6 }}>
                    <User size={14} color="var(--blue-600)" />
                    <span><strong>Guru:</strong> {j.namaGuru}</span>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    <Calendar size={14} color="var(--blue-600)" />
                    <span><strong>Hari:</strong> {j.hari}</span>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    <Clock size={14} color="var(--blue-600)" />
                    <span><strong>Jam:</strong> {j.jam}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-secondary wide"
                  style={{ fontSize: 12, padding: '7px 12px', borderRadius: 10, textAlign: 'center' }}
                  onClick={onGoLogin}
                >
                  Masuk Kelas
                </button>
              </div>
            </div>
          ))}

          {/* Guru Schedule Card */}
          <div
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              background: '#ffffff',
              border: '1.5px solid var(--blue-400)',
              boxShadow: '0 8px 24px rgba(46, 123, 196, 0.12)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                height: 110,
                background: 'linear-gradient(135deg, #1b4e80, #0f2e4d)',
                padding: 14,
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <span
                style={{
                  alignSelf: 'flex-end',
                  background: 'rgba(255,180,84,0.3)',
                  color: '#ffca85',
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700
                }}
              >
                GURU PENGAMPU
              </span>

              <div>
                <h3 style={{ color: 'white', margin: 0, fontSize: 16, fontWeight: 700 }}>
                  {guruJadwal.namaGuru}
                </h3>
                <div style={{ fontSize: 12, opacity: 0.9 }}>Jadwal Mengajar Lengkap</div>
              </div>
            </div>

            <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontSize: 12, display: 'grid', gap: 6 }}>
                {guruJadwal.jadwalMengajar.map((m, i) => (
                  <div key={i} className="hint-text" style={{ color: 'var(--ink)' }}>
                    • <strong>{m.kelas}</strong> ({m.kodeMapel}): {m.hari}, {m.jam}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn-primary wide"
                style={{ fontSize: 12, padding: '7px 12px', borderRadius: 10, textAlign: 'center' }}
                onClick={onGoLogin}
              >
                Login Guru
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PACKAGES / MODUL SECTION */}
      <section
        id="materi"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          marginBottom: 40
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #1b4e80, #2e7bc4)',
            borderRadius: 24,
            padding: 30,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 12px 30px rgba(27,78,128,0.18)'
          }}
        >
          <div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', marginBottom: 12 }}>
              MODUL INTERAKTIF
            </span>
            <h2 style={{ color: 'white', fontSize: 24, marginBottom: 10 }}>
              Materi Matematika Penyajian & Pemusatan Data
            </h2>
            <p style={{ color: 'rgba(234, 246, 255, 0.85)', fontSize: 14, lineHeight: 1.5 }}>
              Dilengkapi penjelasan data kualitatif/kuantitatif, tabel frekuensi, diagram batang, diagram lingkaran, serta mean, median, dan modus.
            </p>
          </div>

          <button
            type="button"
            className="btn-accent"
            style={{ alignSelf: 'flex-start', marginTop: 20, padding: '10px 22px', fontSize: 13 }}
            onClick={onGoLogin}
          >
            Jelajahi Semua Materi
          </button>
        </div>

        <div
          className="card"
          style={{
            borderRadius: 24,
            padding: 24,
            margin: 0,
            background: '#ffffff',
            border: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div className="icon-circle" style={{ background: 'rgba(211, 236, 255, 0.8)' }}>
              <BarChart3 size={20} color="var(--blue-600)" />
            </div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>Penyajian Data & Diagram</h3>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
              Latihan membuat dan membaca diagram secara langsung melalui visualisasi grafik yang intuitif.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            style={{ alignSelf: 'flex-start', marginTop: 16, fontSize: 12, padding: '6px 16px' }}
            onClick={onGoLogin}
          >
            Pelajari Teori
          </button>
        </div>

        <div
          className="card"
          style={{
            borderRadius: 24,
            padding: 24,
            margin: 0,
            background: '#ffffff',
            border: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div className="icon-circle" style={{ background: 'rgba(255, 241, 221, 0.85)' }}>
              <Award size={20} color="#d97706" />
            </div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>LKPD, Latihan & Evaluasi</h3>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
              Soal pilihan ganda & esai terstruktur dengan feedback otomatis dan penilaian transparan.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            style={{ alignSelf: 'flex-start', marginTop: 16, fontSize: 12, padding: '6px 16px' }}
            onClick={onGoLogin}
          >
            Mulai Latihan
          </button>
        </div>
      </section>

      {/* 6. PROCESS STEPS */}
      <section
        id="langkah"
        className="card"
        style={{
          borderRadius: 24,
          padding: '30px 24px',
          textAlign: 'center',
          marginBottom: 32
        }}
      >
        <h2 style={{ fontSize: 22, marginBottom: 6 }}>Alur Mudah Memulai Pembelajaran</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 24 }}>
          Tiga langkah mudah untuk mulai belajar atau mengampu kelas di ElearnMath
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20
          }}
        >
          <div style={{ padding: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'var(--blue-600)',
                color: 'white',
                fontWeight: 700,
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}
            >
              1
            </div>
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>Pilih Peran & Login</h3>
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>
              Masuk sebagai Siswa, Guru (Ibu Mila S.Pd), atau Administrator.
            </p>
          </div>

          <div style={{ padding: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'var(--blue-600)',
                color: 'white',
                fontWeight: 700,
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}
            >
              2
            </div>
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>Akses Jadwal & Materi</h3>
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>
              Pelajari modul interaktif dan lihat jadwal pelajaran sesuai kelas.
            </p>
          </div>

          <div style={{ padding: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'var(--blue-600)',
                color: 'white',
                fontWeight: 700,
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}
            >
              3
            </div>
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>Kerjakan & Pantau Progres</h3>
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>
              Selesaikan LKPD & evaluasi, lalu pantau nilai dan keaktifan siswa.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
        ElearnMath &middot; Media Pembelajaran Matematika Kelas VII (VII A, VII B, VII C)
      </footer>
    </div>
  );
}
