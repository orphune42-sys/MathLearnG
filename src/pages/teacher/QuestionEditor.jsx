import React, { useState } from 'react';
import { useApp, labels } from '../../context/AppContext';
import { Plus, Edit2, Trash2, HelpCircle, Upload, CheckCircle2 } from 'lucide-react';

export default function QuestionEditor({ sectionKey }) {
  const { state, saveStateToStorage, notify } = useApp();
  const label = sectionKey === 'kpd' ? 'LKPD' : labels[sectionKey];

  const [editingId, setEditingId] = useState(null);
  const [type, setType] = useState('pg');
  const [format, setFormat] = useState('text');
  const [prompt, setPrompt] = useState('');
  const [media, setMedia] = useState('');
  const [opts, setOpts] = useState(['', '', '', '']);
  const [correct, setCorrect] = useState(0);
  const [feedbackCorrect, setFeedbackCorrect] = useState('');
  const [feedbackWrong, setFeedbackWrong] = useState('');

  // Settings
  const [passingGrade, setPassingGrade] = useState(state.settings.lkpdPassingGrade || 75);
  const [deadline, setDeadline] = useState(
    state.settings.evaluasiDeadline ? new Date(new Date(state.settings.evaluasiDeadline) - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''
  );

  const resetForm = () => {
    setEditingId(null);
    setType('pg');
    setFormat('text');
    setPrompt('');
    setMedia('');
    setOpts(['', '', '', '']);
    setCorrect(0);
    setFeedbackCorrect('');
    setFeedbackWrong('');
  };

  const startEdit = (q) => {
    setEditingId(q.id);
    setType(q.type);
    setFormat(q.format || 'text');
    setPrompt(q.prompt || '');
    setMedia(q.media || '');
    setOpts(q.opts?.length === 4 ? [...q.opts] : ['', '', '', '']);
    setCorrect(q.correct ?? 0);
    setFeedbackCorrect(q.feedbackCorrect || '');
    setFeedbackWrong(q.feedbackWrong || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      notify('Teks pertanyaan wajib diisi.');
      return;
    }

    if (type === 'pg' && opts.some(o => !o.trim())) {
      notify('Semua pilihan jawaban A, B, C, D wajib diisi.');
      return;
    }

    const questionData = {
      id: editingId || 'q-' + Date.now(),
      type,
      format,
      prompt: prompt.trim(),
      media: format === 'text' ? '' : media.trim(),
      opts: type === 'pg' ? opts.map(o => o.trim()) : [],
      correct: type === 'pg' ? Number(correct) : 0,
      feedbackCorrect: feedbackCorrect.trim(),
      feedbackWrong: feedbackWrong.trim()
    };

    const targetList = state[sectionKey] || [];
    let nextList;
    if (editingId) {
      nextList = targetList.map(q => q.id === editingId ? questionData : q);
    } else {
      nextList = [...targetList, questionData];
    }

    if (saveStateToStorage({ ...state, [sectionKey]: nextList })) {
      notify(editingId ? 'Soal berhasil diperbarui.' : 'Soal baru berhasil ditambahkan.');
      resetForm();
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Hapus soal ini? Siswa yang sedang mengerjakan tidak akan terganggu.')) return;
    const nextList = (state[sectionKey] || []).filter(q => q.id !== id);
    if (saveStateToStorage({ ...state, [sectionKey]: nextList })) {
      notify('Soal dihapus.');
      if (editingId === id) resetForm();
    }
  };

  const handleSavePassingGrade = (e) => {
    e.preventDefault();
    const val = Number(passingGrade);
    if (isNaN(val) || val < 0 || val > 100) {
      notify('Nilai kelulusan harus berkisar antara 0 - 100.');
      return;
    }
    const nextSettings = { ...state.settings, lkpdPassingGrade: val };
    if (saveStateToStorage({ ...state, settings: nextSettings })) {
      notify('Batas ketuntasan LKPD berhasil disimpan.');
    }
  };

  const handleSaveDeadline = (e) => {
    e.preventDefault();
    const isoVal = deadline ? new Date(deadline).toISOString() : null;
    const nextSettings = { ...state.settings, evaluasiDeadline: isoVal };
    if (saveStateToStorage({ ...state, settings: nextSettings })) {
      notify('Batas waktu evaluasi berhasil disimpan.');
    }
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMedia(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="eyebrow">Manajemen Soal</div>
      <h2>Kelola Soal {label}</h2>
      <p className="section-sub">Susun soal pilihan ganda maupun essay beserta kunci dan catatan pembahasan.</p>

      {/* Passing grade setting for LKPD */}
      {sectionKey === 'kpd' && (
        <div className="card">
          <h3>Batas Ketuntasan LKPD</h3>
          <form onSubmit={handleSavePassingGrade} className="row" style={{ alignItems: 'flex-end', gap: 12 }}>
            <div className="field" style={{ margin: 0, flex: 1, maxWidth: 300 }}>
              <label>Nilai Minimal Ketuntasan (0 &mdash; 100)</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={passingGrade}
                onChange={(e) => setPassingGrade(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">
              Simpan Batas Ketuntasan
            </button>
          </form>
          <p className="hint-text" style={{ marginTop: 8 }}>
            Siswa harus menuntaskan LKPD dan memperoleh nilai minimal ini agar menu Latihan terbuka.
          </p>
        </div>
      )}

      {/* Deadline setting for Evaluasi */}
      {sectionKey === 'evaluasi' && (
        <div className="card">
          <h3>Batas Waktu Pengumpulan Evaluasi</h3>
          <form onSubmit={handleSaveDeadline} className="row" style={{ alignItems: 'flex-end', gap: 12 }}>
            <div className="field" style={{ margin: 0, flex: 1, maxWidth: 320 }}>
              <label>Tenggat Waktu (Tanggal & Jam)</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">
              Simpan Deadline
            </button>
          </form>
          <p className="hint-text" style={{ marginTop: 8 }}>
            Kosongkan jika pengerjaan evaluasi tidak dibatasi waktu.
          </p>
        </div>
      )}

      {/* Add / Edit Question Form */}
      <div className="card soal-form-card">
        <h3>{editingId ? 'Edit Soal' : `Tambah Soal ${label}`}</h3>
        <form onSubmit={handleSaveQuestion}>
          <div className="form-grid">
            <div className="field">
              <label>Tipe Soal</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="pg">Pilihan Ganda</option>
                <option value="essay">Essay / Uraian</option>
              </select>
            </div>
            <div className="field">
              <label>Format Pertanyaan</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="text">Teks Standar</option>
                <option value="image">Sertakan Gambar</option>
                <option value="video">Sertakan Tautan Video</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Teks Pertanyaan</label>
            <textarea
              rows={3}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Tuliskan butir soal pertanyaan di sini..."
            />
          </div>

          {format === 'image' && (
            <div className="field">
              <label>URL Gambar atau Unggah Berkas</label>
              <input
                type="text"
                placeholder="https://... atau data image"
                value={media}
                onChange={(e) => setMedia(e.target.value)}
              />
              <div style={{ marginTop: 8 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                />
              </div>
              {media && (
                <div style={{ marginTop: 8 }}>
                  <img src={media} alt="Preview media" style={{ maxHeight: 160, borderRadius: 8 }} />
                </div>
              )}
            </div>
          )}

          {format === 'video' && (
            <div className="field">
              <label>Tautan Video (YouTube dsb)</label>
              <input
                type="url"
                placeholder="https://youtube.com/..."
                value={media}
                onChange={(e) => setMedia(e.target.value)}
              />
            </div>
          )}

          {type === 'pg' ? (
            <div>
              <div className="field">
                <label>Pilihan Jawaban (Pilih radio untuk jawaban yang benar):</label>
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="opt-row">
                    <input
                      type="radio"
                      name="correct-choice"
                      checked={correct === idx}
                      onChange={() => setCorrect(idx)}
                      style={{ width: 'auto' }}
                    />
                    <span style={{ fontWeight: 600, minWidth: 20 }}>
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                      value={opts[idx] || ''}
                      onChange={(e) => {
                        const nextOpts = [...opts];
                        nextOpts[idx] = e.target.value;
                        setOpts(nextOpts);
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Ulasan Jika Benar (Opsional)</label>
                  <input
                    type="text"
                    value={feedbackCorrect}
                    onChange={(e) => setFeedbackCorrect(e.target.value)}
                    placeholder="Penjelasan ringkas bila jawaban tepat..."
                  />
                </div>
                <div className="field">
                  <label>Ulasan Jika Salah (Opsional)</label>
                  <input
                    type="text"
                    value={feedbackWrong}
                    onChange={(e) => setFeedbackWrong(e.target.value)}
                    placeholder="Petunjuk konsep bila jawaban belum tepat..."
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="note" style={{ margin: '12px 0' }}>
              Jawaban essay dinilai secara langsung oleh guru melalui menu Koreksi Essay.
            </div>
          )}

          <div className="row" style={{ marginTop: 16 }}>
            <button type="submit" className="btn-primary">
              {editingId ? 'Simpan Perubahan' : 'Tambah Soal'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Batalkan Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List of Questions */}
      <div className="card">
        <h3>Daftar Soal {label} ({state[sectionKey]?.length || 0})</h3>
        {state[sectionKey]?.length > 0 ? (
          state[sectionKey].map((q, idx) => (
            <div key={q.id} className="soal-item">
              <div className="row spread" style={{ marginBottom: 6 }}>
                <span className={`badge ${q.type === 'pg' ? 'badge-blue' : 'badge-orange'}`}>
                  {q.type === 'pg' ? 'Pilihan Ganda' : 'Essay'}
                </span>
                <div className="row" style={{ gap: 6 }}>
                  <button
                    type="button"
                    className="btn-outline-sm"
                    onClick={() => startEdit(q)}
                  >
                    <Edit2 size={13} />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger-sm"
                    onClick={() => handleDelete(q.id)}
                  >
                    <Trash2 size={13} />
                    Hapus
                  </button>
                </div>
              </div>

              <p className="pre" style={{ margin: '8px 0', fontWeight: 500 }}>
                {idx + 1}. {q.prompt}
              </p>

              {q.media && (
                <div style={{ margin: '8px 0' }}>
                  <img src={q.media} alt="Media soal" style={{ maxHeight: 120, borderRadius: 8 }} />
                </div>
              )}

              {q.type === 'pg' && (
                <div className="hint-text">
                  Kunci: <strong>{String.fromCharCode(65 + q.correct)}.</strong> {q.opts[q.correct]}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">Belum ada soal pada bagian ini.</div>
        )}
      </div>
    </div>
  );
}
