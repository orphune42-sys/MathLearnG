import React, { useState } from 'react';
import { useApp, labels } from '../../context/AppContext';
import StatCard from '../../components/StatCard';
import AnnouncementCard from '../../components/AnnouncementCard';
import { Users, BookOpen, BarChart2, Award, UserCheck, Clock, CheckCircle2 } from 'lucide-react';

export default function TeacherHome() {
  const { own, teacherStudents, finalGrade, getProgress, lkpdPassed, studentClasses, isStudentOnline } = useApp();
  const teacher = own();
  const students = teacherStudents();

  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  const activeStudents = students.filter(s => isStudentOnline(s.username));

  const avg = (section) => {
    const list = students.map(s => finalGrade(s.username, section)).filter(v => v !== null);
    if (!list.length) return '—';
    return Math.round(list.reduce((a, b) => a + b, 0) / list.length);
  };

  const completedEvaluasiCount = students.filter(s => getProgress(s.username).evaluasiDone).length;

  const displayedStudents = filterActiveOnly ? activeStudents : students;

  const chartData = ['lkpd', 'latihan', 'evaluasi'].map(k => {
    const arr = students.map(s => finalGrade(s.username, k)).filter(v => v !== null);
    return {
      label: labels[k],
      avg: arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null,
      n: arr.length
    };
  });

  const formatLastActive = (ts) => {
    if (!ts) return 'Belum pernah';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
    return new Date(ts).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div>
      <div className="eyebrow">Panel Guru</div>
      <h2>Dashboard Guru</h2>
      <p className="section-sub">Halo, {teacher?.namaLengkap}! Pantau progres dan aktivitas belajar siswa.</p>

      {/* Stat cards */}
      <div className="grid grid-4">
        <StatCard
          icon={Users}
          number={`${activeStudents.length} / ${students.length}`}
          label="Siswa Aktif / Online"
          isLive={true}
        />
        <StatCard
          icon={BookOpen}
          number={completedEvaluasiCount}
          label="Selesai Evaluasi"
        />
        <StatCard
          icon={BarChart2}
          number={avg('latihan')}
          label="Rata-rata Latihan"
        />
        <StatCard
          icon={Award}
          number={avg('evaluasi')}
          label="Rata-rata Evaluasi"
        />
      </div>

      {/* Revision 1: Teacher Active Student Monitoring Panel */}
      <div className="card">
        <div className="row spread" style={{ marginBottom: 16 }}>
          <div className="row" style={{ gap: 10 }}>
            <span className="pulse-dot" />
            <h3 style={{ margin: 0 }}>Pemantauan Siswa Aktif / Sedang Login</h3>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <span className="badge badge-green">
              {activeStudents.length} Siswa Sedang Online
            </span>
            <button
              type="button"
              className={filterActiveOnly ? 'btn-primary' : 'btn-outline-sm'}
              style={{ fontSize: 12, padding: '4px 12px' }}
              onClick={() => setFilterActiveOnly(!filterActiveOnly)}
            >
              {filterActiveOnly ? 'Tampilkan Semua' : 'Hanya yang Aktif'}
            </button>
          </div>
        </div>

        {activeStudents.length > 0 ? (
          <div className="grid grid-3" style={{ marginBottom: 12 }}>
            {activeStudents.map((s) => (
              <div
                key={s.username}
                className="soal-item"
                style={{
                  background: 'rgba(228, 248, 238, 0.65)',
                  border: '1px solid rgba(34, 181, 115, 0.4)'
                }}
              >
                <div className="row spread" style={{ marginBottom: 4 }}>
                  <strong>{s.namaLengkap}</strong>
                  <span className="badge badge-green" style={{ fontSize: 11, padding: '2px 8px' }}>
                    <span className="pulse-dot" style={{ width: 7, height: 7 }} />
                    Online
                  </span>
                </div>
                <div className="hint-text">Kelas: {studentClasses(s.username).join(', ') || '—'}</div>
                <div className="hint-text" style={{ marginTop: 4 }}>
                  <Clock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                  Terakhir aktif: {formatLastActive(s.lastActive)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="note" style={{ textAlign: 'center' }}>
            Saat ini belum ada siswa yang sedang aktif/login di kelasmu.
          </div>
        )}
      </div>

      <AnnouncementCard />

      {/* Chart Card */}
      <div className="card">
        <h3>Rata-rata Capaian Belajar</h3>
        {chartData.every(x => x.avg === null) ? (
          <div className="empty-state">Belum ada nilai final yang tercatat.</div>
        ) : (
          <div>
            <svg className="chart" viewBox="0 0 600 230" role="img" aria-label="Grafik Rata-rata Nilai">
              {[0, 25, 50, 75, 100].map((v) => (
                <g key={v}>
                  <line x1="45" y1={190 - v * 1.6} x2="580" y2={190 - v * 1.6} stroke="#dceaf7" />
                  <text x="8" y={195 - v * 1.6} fontSize="12" fill="#66748c">{v}</text>
                </g>
              ))}
              {chartData.map((v, i) => (
                <g key={i}>
                  <rect
                    x={85 + i * 170}
                    y={190 - (v.avg || 0) * 1.6}
                    width="90"
                    height={(v.avg || 0) * 1.6}
                    rx="8"
                    fill={i === 0 ? 'var(--orange)' : 'var(--blue-600)'}
                  />
                  <text
                    x={130 + i * 170}
                    y={180 - (v.avg || 0) * 1.6}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="600"
                    fill="var(--blue-800)"
                  >
                    {v.avg ?? '—'}
                  </text>
                  <text
                    x={130 + i * 170}
                    y="212"
                    textAnchor="middle"
                    fontSize="13"
                    fill="#66748c"
                  >
                    {v.label} (n={v.n})
                  </text>
                </g>
              ))}
            </svg>
            <p className="hint-text">Rata-rata dihitung dari siswa yang telah memiliki nilai final.</p>
          </div>
        )}
      </div>

      {/* Student List Table */}
      <div className="card">
        <div className="row spread" style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>Daftar Siswa & Progres Nilai</h3>
          <span className="badge badge-blue">{displayedStudents.length} Siswa</span>
        </div>

        {displayedStudents.length > 0 ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Status Login</th>
                  <th>Nama Lengkap</th>
                  <th>Kelas</th>
                  <th>NISN</th>
                  <th>LKPD</th>
                  <th>Latihan</th>
                  <th>Evaluasi</th>
                  <th>Status Belajar</th>
                </tr>
              </thead>
              <tbody>
                {displayedStudents.map((s) => {
                  const p = getProgress(s.username);
                  const isOnline = isStudentOnline(s.username);

                  return (
                    <tr key={s.username}>
                      <td>
                        {isOnline ? (
                          <span className="badge badge-green" style={{ fontSize: 11 }}>
                            <span className="pulse-dot" style={{ width: 7, height: 7 }} />
                            Online
                          </span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(234,246,255,0.7)', color: 'var(--muted)', fontSize: 11 }}>
                            <span className="offline-dot" />
                            Offline
                          </span>
                        )}
                      </td>
                      <td>
                        <strong>{s.namaLengkap}</strong>
                        <div className="hint-text">{s.username}</div>
                      </td>
                      <td>{studentClasses(s.username).join(', ') || '—'}</td>
                      <td>{s.nisn || '—'}</td>
                      <td>{finalGrade(s.username, 'lkpd') ?? '—'}</td>
                      <td>{finalGrade(s.username, 'latihan') ?? '—'}</td>
                      <td>{finalGrade(s.username, 'evaluasi') ?? '—'}</td>
                      <td>
                        <span className="badge badge-blue">
                          {p.evaluasiDone
                            ? 'Selesai evaluasi'
                            : p.latihanDone
                            ? 'Siap evaluasi'
                            : lkpdPassed(s.username)
                            ? 'LKPD tuntas'
                            : p.kpdDone
                            ? 'LKPD belum tuntas'
                            : p.materiRead.length
                            ? 'Membaca materi'
                            : 'Belum mulai'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            {filterActiveOnly
              ? 'Tidak ada siswa yang sedang online saat ini.'
              : 'Belum ada siswa di kelasmu. Atur kelas pada profil atau hubungi admin.'}
          </div>
        )}
      </div>
    </div>
  );
}
