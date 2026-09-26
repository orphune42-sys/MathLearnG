import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Plus, Save, Trash2, Edit2, Clock, BookOpen, School } from 'lucide-react';

export default function ScheduleAdminPage() {
  const { state, updateTeacherSchedule, notify } = useApp();
  const teachers = state.users.gurus || [];
  const classes = state.classes || [];

  const [selectedGuru, setSelectedGuru] = useState(teachers[0]?.username || '');
  const [mapel, setMapel] = useState(teachers[0]?.mapel || 'Matematika');
  const [jadwalText, setJadwalText] = useState(teachers[0]?.jadwal || '');

  // Quick builder states
  const [builderHari, setBuilderHari] = useState('Senin');
  const [builderJamMulai, setBuilderJamMulai] = useState('07:30');
  const [builderJamSelesai, setBuilderJamSelesai] = useState('09:00');
  const [builderKelas, setBuilderKelas] = useState(classes[0]?.name || 'VII-A');

  const handleTeacherChange = (username) => {
    setSelectedGuru(username);
    const teacher = teachers.find(t => t.username === username);
    if (teacher) {
      setMapel(teacher.mapel || 'Matematika');
      setJadwalText(teacher.jadwal || '');
    }
  };

  const handleAddToSchedule = () => {
    const entry = `${builderHari} ${builderJamMulai} - ${builderJamSelesai} (${builderKelas})`;
    const current = jadwalText.trim();
    const updated = current ? `${current}\n${entry}` : entry;
    setJadwalText(updated);
    notify('Jadwal ditambahkan ke draf. Klik "Simpan Jadwal Guru" untuk menyimpan.');
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedGuru) {
      notify('Pilih guru terlebih dahulu.');
      return;
    }
    updateTeacherSchedule(selectedGuru, mapel, jadwalText);
  };

  const handleQuickEdit = (teacher) => {
    setSelectedGuru(teacher.username);
    setMapel(teacher.mapel || 'Matematika');
    setJadwalText(teacher.jadwal || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearSchedule = (teacherUsername) => {
    if (!window.confirm('Kosongkan jadwal mengajar untuk guru ini?')) return;
    const t = teachers.find(x => x.username === teacherUsername);
    updateTeacherSchedule(teacherUsername, t?.mapel || 'Matematika', '');
    if (selectedGuru === teacherUsername) {
      setJadwalText('');
    }
  };

  return (
    <div>
      <div className="eyebrow">Manajemen Kurikulum</div>
      <h2>Atur Jadwal Guru Pelajaran</h2>
      <p className="section-sub">
        Tetapkan mata pelajaran, kelas, dan jadwal mengajar mingguan untuk setiap guru.
      </p>

      {/* Form Atur Jadwal */}
      <div className="card soal-form-card">
        <h3>Formulir Pengaturan Jadwal Guru</h3>

        {teachers.length > 0 ? (
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="field">
                <label>Pilih Guru Pengajar</label>
                <select
                  value={selectedGuru}
                  onChange={(e) => handleTeacherChange(e.target.value)}
                  required
                >
                  {teachers.map((g) => (
                    <option key={g.username} value={g.username}>
                      {g.namaLengkap} ({g.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Mata Pelajaran yang Diampu</label>
                <input
                  type="text"
                  required
                  value={mapel}
                  onChange={(e) => setMapel(e.target.value)}
                  placeholder="Contoh: Matematika"
                />
              </div>
            </div>

            {/* Quick builder helper */}
            <div className="soal-item" style={{ margin: '14px 0', background: 'rgba(234, 246, 255, 0.7)' }}>
              <div className="row" style={{ gap: 6, marginBottom: 10 }}>
                <Clock size={16} color="var(--blue-600)" />
                <strong>Penyusun Jadwal Cepat (Quick Builder)</strong>
              </div>

              <div className="form-grid">
                <div className="field" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Hari</label>
                  <select
                    value={builderHari}
                    onChange={(e) => setBuilderHari(e.target.value)}
                  >
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="field" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Jam Mulai</label>
                  <input
                    type="time"
                    value={builderJamMulai}
                    onChange={(e) => setBuilderJamMulai(e.target.value)}
                  />
                </div>

                <div className="field" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Jam Selesai</label>
                  <input
                    type="time"
                    value={builderJamSelesai}
                    onChange={(e) => setBuilderJamSelesai(e.target.value)}
                  />
                </div>

                <div className="field" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Kelas</label>
                  {classes.length > 0 ? (
                    <select
                      value={builderKelas}
                      onChange={(e) => setBuilderKelas(e.target.value)}
                    >
                      {classes.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={builderKelas}
                      onChange={(e) => setBuilderKelas(e.target.value)}
                      placeholder="VII-A"
                    />
                  )}
                </div>
              </div>

              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: 12 }}
                onClick={handleAddToSchedule}
              >
                <Plus size={14} />
                Tambahkan ke Draf Jadwal
              </button>
            </div>

            <div className="field">
              <label>Draf Rincian Jadwal Mengajar (dapat diedit langsung)</label>
              <textarea
                rows={4}
                value={jadwalText}
                onChange={(e) => setJadwalText(e.target.value)}
                placeholder="Contoh:&#10;Senin 07.30 - 09.00 (VII-A)&#10;Rabu 09.30 - 11.00 (VII-B)"
              />
              <p className="hint-text">
                Jadwal ini akan langsung tampil pada akun Guru bersangkutan dan halaman profil.
              </p>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: 12 }}>
              <Save size={15} />
              Simpan Jadwal Guru
            </button>
          </form>
        ) : (
          <div className="empty-state">
            Belum ada akun guru yang terdaftar. Tambahkan guru terlebih dahulu melalui menu Tambah Guru.
          </div>
        )}
      </div>

      {/* Tabel Semua Jadwal Guru */}
      <div className="card">
        <div className="row spread" style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>Daftar Jadwal Mengajar Semua Guru</h3>
          <span className="badge badge-blue">{teachers.length} Guru</span>
        </div>

        {teachers.length > 0 ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nama Guru</th>
                  <th>Mata Pelajaran</th>
                  <th>Kelas Pengampu</th>
                  <th>Jadwal Pelajaran</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((g) => (
                  <tr key={g.username}>
                    <td>
                      <strong>{g.namaLengkap}</strong>
                      <div className="hint-text">{g.username}</div>
                    </td>
                    <td>
                      <span className="badge badge-blue">{g.mapel || 'Matematika'}</span>
                    </td>
                    <td>{g.kelas || '—'}</td>
                    <td>
                      {g.jadwal ? (
                        <div className="pre" style={{ fontSize: 13, color: 'var(--blue-800)' }}>
                          {g.jadwal}
                        </div>
                      ) : (
                        <span className="muted" style={{ fontStyle: 'italic' }}>Belum diatur</span>
                      )}
                    </td>
                    <td>
                      <div className="row" style={{ gap: 6 }}>
                        <button
                          type="button"
                          className="btn-outline-sm"
                          onClick={() => handleQuickEdit(g)}
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                        {g.jadwal && (
                          <button
                            type="button"
                            className="btn-danger-sm"
                            onClick={() => handleClearSchedule(g.username)}
                          >
                            <Trash2 size={12} />
                            Kosongkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">Belum ada data guru.</div>
        )}
      </div>
    </div>
  );
}
