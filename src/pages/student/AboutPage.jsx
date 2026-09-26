import React from 'react';
import { useApp } from '../../context/AppContext';
import { Target, User, School, Compass } from 'lucide-react';

export default function AboutPage() {
  const { state, session, studentClasses } = useApp();
  const cls = studentClasses(session.username).map(k => k.trim().toLowerCase());

  const teachers = state.users.gurus.filter(g => {
    const teacherClasses = (g.kelas || '').split(',').map(c => c.trim().toLowerCase());
    return teacherClasses.some(k => cls.includes(k)) ||
      state.classes.some(c => c.teacherUsername === g.username && c.studentUsernames.includes(session.username));
  });

  return (
    <div>
      <div className="eyebrow">Informasi Pembelajaran</div>
      <h2>Tentang ElearnMath</h2>
      <p className="section-sub">Media pembelajaran matematika interaktif materi statistika kelas VII.</p>

      <div className="grid grid-2">
        <div className="card">
          <div className="row" style={{ gap: 8, marginBottom: 10 }}>
            <Target size={18} color="var(--blue-600)" />
            <h3 style={{ margin: 0 }}>Tujuan Pembelajaran</h3>
          </div>
          <p className="muted">
            Peserta didik mampu mengenali, mengorganisasi, membedakan jenis data kualitatif dan kuantitatif, serta menyajikan data ke dalam format tabel dan diagram yang relevan.
          </p>
        </div>

        <div className="card">
          <div className="row" style={{ gap: 8, marginBottom: 10 }}>
            <User size={18} color="var(--blue-600)" />
            <h3 style={{ margin: 0 }}>Profil Guru Pengampu</h3>
          </div>
          <p className="muted">
            {teachers.length > 0 ? (
              teachers.map(g => (
                <span key={g.username} style={{ display: 'block', marginBottom: 4 }}>
                  <strong>{g.namaLengkap}</strong> &mdash; Pengampu {g.mapel || 'Matematika'}
                </span>
              ))
            ) : (
              'Belum ada guru yang terhubung dengan kelasmu.'
            )}
          </p>
        </div>

        <div className="card">
          <div className="row" style={{ gap: 8, marginBottom: 10 }}>
            <School size={18} color="var(--blue-600)" />
            <h3 style={{ margin: 0 }}>Informasi Kelas</h3>
          </div>
          <p className="muted">
            {studentClasses(session.username).join(', ') || 'Belum ditentukan'} &middot; Tahun Ajaran 2026/2027
          </p>
        </div>

        <div className="card">
          <div className="row" style={{ gap: 8, marginBottom: 10 }}>
            <Compass size={18} color="var(--blue-600)" />
            <h3 style={{ margin: 0 }}>Kompetensi Dasar</h3>
          </div>
          <p className="muted">
            Memahami konsep dasar analisis data, penyajian diagram batang dan lingkaran, serta perhitungan ukuran pemusatan (mean, median, modus).
          </p>
        </div>
      </div>
    </div>
  );
}
