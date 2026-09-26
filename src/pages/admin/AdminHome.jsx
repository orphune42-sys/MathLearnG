import React from 'react';
import { useApp } from '../../context/AppContext';
import StatCard from '../../components/StatCard';
import AnnouncementCard from '../../components/AnnouncementCard';
import { Users, BookOpen, School, AlertTriangle, Calendar, Settings } from 'lucide-react';

export default function AdminHome() {
  const { state, setCurrentPage } = useApp();

  const totalTabSwitches = (state.flagged || []).reduce((a, f) => a + (f.count || 0), 0);
  const teachersWithSchedule = state.users.gurus.filter(g => g.jadwal);

  return (
    <div>
      <div className="eyebrow">Panel Administrator</div>
      <h2>Ringkasan Sistem</h2>
      <p className="section-sub">Kelola akun pengguna, data kelas, dan jadwal pengajaran guru.</p>

      <div className="grid grid-4">
        <StatCard
          icon={Users}
          number={state.users.siswas.length}
          label="Siswa Terdaftar"
        />
        <StatCard
          icon={BookOpen}
          number={state.users.gurus.length}
          label="Guru Terdaftar"
        />
        <StatCard
          icon={School}
          number={state.classes.length}
          label="Kelas Dikelola"
        />
        <StatCard
          icon={AlertTriangle}
          number={totalTabSwitches}
          label="Aktivitas Keluar Tab"
        />
      </div>

      <AnnouncementCard />

      {/* Schedule Overview with Quick Action to Revision 2 */}
      <div className="card">
        <div className="row spread" style={{ marginBottom: 14 }}>
          <div className="row" style={{ gap: 8 }}>
            <Calendar size={18} color="var(--blue-600)" />
            <h3 style={{ margin: 0 }}>Jadwal Pelajaran Guru</h3>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setCurrentPage('jadwal-admin')}
          >
            <Settings size={15} />
            Atur Jadwal Guru
          </button>
        </div>

        {teachersWithSchedule.length > 0 ? (
          <div>
            {teachersWithSchedule.map((g) => (
              <div key={g.username} className="subbab-item">
                <div className="row spread">
                  <strong>{g.namaLengkap}</strong>
                  <span className="badge badge-blue">{g.mapel || 'Matematika'}</span>
                </div>
                <div className="pre" style={{ marginTop: 6, fontSize: 13 }}>
                  {g.jadwal}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            Belum ada jadwal pelajaran yang ditentukan.{' '}
            <button
              type="button"
              className="text-btn"
              onClick={() => setCurrentPage('jadwal-admin')}
            >
              Klik di sini untuk mengatur jadwal guru.
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
