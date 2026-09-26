import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Clock } from 'lucide-react';

export default function DetectionPage() {
  const { state, session, teacherStudents } = useApp();

  const allowedUsernames = new Set(teacherStudents().map(s => s.username));
  const rows = session.role === 'admin'
    ? (state.flagged || [])
    : (state.flagged || []).filter(f => allowedUsernames.has(f.username || f.name));

  const formatTime = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const getStudentName = (uname) => {
    const s = state.users.siswas.find(x => x.username === uname);
    return s ? s.namaLengkap : uname;
  };

  return (
    <div>
      <div className="eyebrow">Pemantauan Pengerjaan</div>
      <h2>Siswa Terdeteksi Keluar dari Tab</h2>
      <p className="section-sub">
        Catatan perpindahan fokus jendela peramban saat pengerjaan evaluasi. Digunakan sebagai evaluasi kedisiplinan mandiri.
      </p>

      <div className="card">
        {rows.length > 0 ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nama Siswa</th>
                  <th>Aktivitas Ujian</th>
                  <th>Frekuensi Keluar</th>
                  <th>Waktu Terakhir</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((f, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{getStudentName(f.username || f.name)}</strong>
                      <div className="hint-text">{f.username || f.name}</div>
                    </td>
                    <td>{f.activity}</td>
                    <td>
                      <span className="badge badge-red">
                        <AlertTriangle size={12} />
                        {f.count} kali
                      </span>
                    </td>
                    <td>
                      <Clock size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                      {formatTime(f.lastAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            Belum ada aktivitas perpindahan tab yang tercatat.
          </div>
        )}
      </div>
    </div>
  );
}
