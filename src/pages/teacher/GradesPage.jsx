import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, RefreshCw, Save, CheckCircle2 } from 'lucide-react';

export default function GradesPage() {
  const { state, saveStateToStorage, teacherStudents, studentClasses, finalGrade, pendingEssays, notify } = useApp();
  const students = teacherStudents();

  const [localGrades, setLocalGrades] = useState({});
  const [sheetUrl, setSheetUrl] = useState(state.googleSheet?.webAppUrl || '');
  const [syncStatus, setSyncStatus] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleGradeChange = (username, section, val) => {
    setLocalGrades(prev => ({
      ...prev,
      [username]: {
        ...(prev[username] || {}),
        [section]: val
      }
    }));
  };

  const handleSaveGrade = (username) => {
    const changes = localGrades[username];
    if (!changes) return;

    const current = { ...(state.grades[username] || {}) };
    for (const [k, v] of Object.entries(changes)) {
      if (v === '' || v === null) {
        current[k] = null;
      } else {
        const num = Number(v);
        if (isNaN(num) || num < 0 || num > 100) {
          notify('Nilai harus berupa angka antara 0 hingga 100.');
          return;
        }
        current[k] = num;
      }
    }

    const nextGrades = { ...state.grades, [username]: current };
    if (saveStateToStorage({ ...state, grades: nextGrades })) {
      notify('Nilai berhasil disimpan.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Username', 'Nama Lengkap', 'NISN', 'Kelas', 'LKPD', 'Latihan', 'Evaluasi'];
    const rows = students.map(s => [
      `"${s.username}"`,
      `"${s.namaLengkap}"`,
      `"${s.nisn || ''}"`,
      `"${studentClasses(s.username).join(', ')}"`,
      `"${finalGrade(s.username, 'lkpd') ?? ''}"`,
      `"${finalGrade(s.username, 'latihan') ?? ''}"`,
      `"${finalGrade(s.username, 'evaluasi') ?? ''}"`
    ]);

    const csvContent = '\ufeff' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nilai-ElearnMath-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Berkas nilai CSV berhasil diunduh.');
  };

  const handleSaveSheetUrl = (e) => {
    e.preventDefault();
    const nextGS = { ...state.googleSheet, webAppUrl: sheetUrl.trim() };
    if (saveStateToStorage({ ...state, googleSheet: nextGS })) {
      notify('Tautan Web App Google Apps Script disimpan.');
    }
  };

  const handleSyncSheets = async () => {
    const url = state.googleSheet?.webAppUrl;
    if (!url || !url.startsWith('https://script.google.com/')) {
      notify('Masukkan URL Web App Google Apps Script yang valid terlebih dahulu.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Mengirimkan data nilai ke Google Sheets...');

    const rows = students.map(s => ({
      username: s.username,
      nama: s.namaLengkap,
      nisn: s.nisn || '',
      kelas: studentClasses(s.username).join(', '),
      lkpd: finalGrade(s.username, 'lkpd') ?? '',
      latihan: finalGrade(s.username, 'latihan') ?? '',
      evaluasi: finalGrade(s.username, 'evaluasi') ?? ''
    }));

    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ rows })
      });

      const now = new Date().toISOString();
      saveStateToStorage({
        ...state,
        googleSheet: { ...state.googleSheet, lastSync: now }
      });
      setSyncStatus(`Sinkronisasi terkirim pada ${new Date().toLocaleTimeString('id-ID')}. Periksa Google Sheet.`);
      notify('Permintaan sinkronisasi nilai telah dikirim.');
    } catch (err) {
      setSyncStatus('Sinkronisasi gagal. Periksa koneksi internet atau tautan Web App.');
      notify('Gagal sinkron ke Google Sheets.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div>
      <div className="eyebrow">Rekapitulasi</div>
      <h2>Daftar Nilai Siswa</h2>
      <p className="section-sub">Kelola nilai siswa, ekspor ke format Excel (CSV), atau sinkron ke Google Sheets.</p>

      <div className="card">
        <div className="row spread" style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>Tabel Nilai Siswa</h3>
          <button type="button" className="btn-secondary" onClick={handleExportCSV}>
            <Download size={15} />
            Unduh Berkas CSV (Excel)
          </button>
        </div>

        {students.length > 0 ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nama Lengkap</th>
                  <th>NISN</th>
                  <th>LKPD</th>
                  <th>Latihan</th>
                  <th>Evaluasi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const u = s.username;
                  return (
                    <tr key={u}>
                      <td>
                        <strong>{s.namaLengkap}</strong>
                        <div className="hint-text">{studentClasses(u).join(', ') || '—'}</div>
                      </td>
                      <td>{s.nisn || '—'}</td>

                      {['lkpd', 'latihan', 'evaluasi'].map((sec) => {
                        const hasPending = pendingEssays(u, sec);
                        const currentVal = localGrades[u]?.[sec] !== undefined
                          ? localGrades[u][sec]
                          : (finalGrade(u, sec) ?? '');

                        return (
                          <td key={sec}>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              style={{ width: 75 }}
                              disabled={hasPending}
                              value={currentVal}
                              onChange={(e) => handleGradeChange(u, sec, e.target.value)}
                            />
                            {hasPending && (
                              <div className="hint-text" style={{ color: 'var(--orange-dark)', marginTop: 2 }}>
                                Menunggu essay
                              </div>
                            )}
                          </td>
                        );
                      })}

                      <td>
                        <button
                          type="button"
                          className="btn-outline-sm"
                          onClick={() => handleSaveGrade(u)}
                        >
                          <Save size={13} />
                          Simpan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">Belum ada siswa di kelasmu.</div>
        )}
      </div>

      <div className="card">
        <h3>Sinkronisasi Google Sheets</h3>
        <p className="hint-text">
          Hubungkan aplikasi dengan Google Sheets menggunakan Google Apps Script Web App untuk pembaruan nilai otomatis.
        </p>

        <form onSubmit={handleSaveSheetUrl} style={{ marginTop: 12 }}>
          <div className="field">
            <label>URL Web App Google Apps Script</label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
          </div>

          <div className="row">
            <button type="submit" className="btn-primary">
              Simpan Tautan
            </button>
            <button
              type="button"
              className="btn-accent"
              onClick={handleSyncSheets}
              disabled={isSyncing}
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Menyinkronkan...' : 'Sinkron Sekarang'}
            </button>
          </div>
        </form>

        {syncStatus && (
          <div className="note" style={{ marginTop: 14 }}>
            {syncStatus}
          </div>
        )}
      </div>
    </div>
  );
}
