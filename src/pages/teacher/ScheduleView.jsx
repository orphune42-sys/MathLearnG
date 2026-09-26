import React from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, BookOpen } from 'lucide-react';

export default function ScheduleView() {
  const { own } = useApp();
  const g = own();

  const scheduleLines = (g?.jadwal || '')
    .split(/[\n,]/)
    .map(x => x.trim())
    .filter(Boolean);

  return (
    <div>
      <div className="eyebrow">Jadwal Mengajar</div>
      <h2>Jadwal Pelajaran Guru</h2>
      <p className="section-sub">
        Jadwal pelajaran diatur dan diperbarui oleh Admin. Hubungi pihak administrator apabila ada penyesuaian.
      </p>

      <div className="card">
        <div className="row spread" style={{ marginBottom: 14 }}>
          <div className="row" style={{ gap: 8 }}>
            <BookOpen size={18} color="var(--blue-600)" />
            <h3 style={{ margin: 0 }}>Mata Pelajaran: {g?.mapel || 'Matematika'}</h3>
          </div>
          <span className="badge badge-blue">{g?.namaLengkap}</span>
        </div>

        {scheduleLines.length > 0 ? (
          <div>
            {scheduleLines.map((line, idx) => (
              <div key={idx} className="subbab-item" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Calendar size={16} color="var(--blue-600)" />
                <span style={{ fontWeight: 500 }}>{line}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            Admin belum mengisikan jadwal pelajaran untuk akunmu.
          </div>
        )}
      </div>
    </div>
  );
}
