import React, { useState } from 'react';
import { useApp, labels } from '../../context/AppContext';
import { CheckSquare, Sparkles, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CorrectionPage() {
  const { state, saveStateToStorage, teacherStudents, getSubmission, session, notify } = useApp();
  const students = teacherStudents();

  const [formData, setFormData] = useState({});

  const handleFieldChange = (user, section, index, field, value) => {
    const key = `${user}-${section}-${index}`;
    setFormData(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value
      }
    }));
  };

  const handleSuggest = (student, section, index, essay) => {
    const key = `${student.username}-${section}-${index}`;
    const words = String(essay.answer || '').trim().split(/\s+/).filter(Boolean);

    let suggestedScore = 60;
    let suggestedFeedback = 'Penjelasan perlu dilengkapi dengan konsep matematika yang lebih terperinci.';

    if (words.length > 25) {
      suggestedScore = 90;
      suggestedFeedback = 'Penjelasan terstruktur dengan baik. Periksa kembali kecermatan langkah dan hasil akhir.';
    } else if (words.length > 12) {
      suggestedScore = 80;
      suggestedFeedback = 'Pemahaman konsep cukup baik, lengkapi dengan contoh atau pembuktian sederhana.';
    }

    setFormData(prev => ({
      ...prev,
      [key]: {
        score: suggestedScore,
        feedback: suggestedFeedback
      }
    }));
    notify('Saran koreksi ditampilkan. Tinjau kembali sebelum menyimpan nilai.');
  };

  const handleSave = (student, section, index) => {
    const key = `${student.username}-${section}-${index}`;
    const inputs = formData[key] || {};
    const sub = getSubmission(student.username, section);

    if (!sub || !sub.essays?.[index]) return;

    const currentEssay = sub.essays[index];
    const scoreVal = inputs.score !== undefined ? inputs.score : currentEssay.score;
    const feedbackVal = inputs.feedback !== undefined ? inputs.feedback : currentEssay.feedback;

    const numScore = Number(scoreVal);
    if (scoreVal === '' || scoreVal === null || isNaN(numScore) || numScore < 0 || numScore > 100) {
      notify('Skor harus berupa angka dari 0 hingga 100.');
      return;
    }

    const updatedEssays = {
      ...sub.essays,
      [index]: {
        ...currentEssay,
        score: numScore,
        feedback: String(feedbackVal || '').trim(),
        corrected: true,
        correctedBy: session.username,
        correctedAt: new Date().toISOString()
      }
    };

    const updatedSub = {
      ...sub,
      essays: updatedEssays
    };

    // Recompute final grade
    const allEssays = Object.values(updatedEssays);
    const hasPending = allEssays.some(e => !e.corrected || e.score === null || e.score === undefined);

    let finalGradeVal = null;
    if (!hasPending) {
      const parts = [];
      if (updatedSub.pgScore !== null && updatedSub.pgScore !== undefined) {
        parts.push(Number(updatedSub.pgScore));
      }
      if (allEssays.length > 0) {
        const essayAvg = allEssays.reduce((a, e) => a + Number(e.score), 0) / allEssays.length;
        parts.push(essayAvg);
      }
      if (parts.length > 0) {
        finalGradeVal = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
      }
    }

    const nextSubmissions = {
      ...state.submissions,
      [student.username]: {
        ...(state.submissions[student.username] || {}),
        [section]: updatedSub
      }
    };

    const nextGrades = {
      ...state.grades,
      [student.username]: {
        ...(state.grades[student.username] || {}),
        [section]: finalGradeVal
      }
    };

    if (saveStateToStorage({ ...state, submissions: nextSubmissions, grades: nextGrades })) {
      notify('Koreksi dan nilai berhasil disimpan.');
    }
  };

  const essayEntries = [];
  students.forEach((student) => {
    ['lkpd', 'latihan', 'evaluasi'].forEach((section) => {
      const sub = getSubmission(student.username, section);
      if (sub?.essays) {
        Object.entries(sub.essays).forEach(([idx, essay]) => {
          essayEntries.push({
            student,
            section,
            index: idx,
            essay
          });
        });
      }
    });
  });

  return (
    <div>
      <div className="eyebrow">Penilaian Essay</div>
      <h2>Koreksi Jawaban Uraian / HOTS</h2>
      <p className="section-sub">
        Periksa jawaban uraian dan foto lembar kerja siswa. Nilai akhir dihitung setelah seluruh essay dikoreksi.
      </p>

      {essayEntries.length > 0 ? (
        essayEntries.map(({ student, section, index, essay }) => {
          const formKey = `${student.username}-${section}-${index}`;
          const currentInput = formData[formKey] || {};
          const currentScore = currentInput.score !== undefined ? currentInput.score : (essay.score ?? '');
          const currentFeedback = currentInput.feedback !== undefined ? currentInput.feedback : (essay.feedback || '');

          return (
            <div key={formKey} className="card">
              <div className="row spread" style={{ marginBottom: 12 }}>
                <div className="row" style={{ gap: 8 }}>
                  <strong>{student.namaLengkap}</strong>
                  <span className="badge badge-blue">{labels[section]}</span>
                </div>
                <span className={`badge ${essay.corrected ? 'badge-green' : 'badge-orange'}`}>
                  {essay.corrected ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {essay.corrected ? 'Sudah dinilai' : 'Menunggu koreksi'}
                </span>
              </div>

              <h3 style={{ fontSize: 15, margin: '8px 0' }}>
                Soal #{Number(index) + 1}: {essay.prompt}
              </h3>

              <div className="note pre" style={{ margin: '8px 0' }}>
                {essay.answer || '(Jawaban berupa foto di bawah)'}
              </div>

              {essay.photo && (
                <div className="photo-preview" style={{ margin: '10px 0' }}>
                  <img src={essay.photo} alt="Lembar jawaban siswa" />
                </div>
              )}

              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                <div className="form-grid">
                  <div className="field">
                    <label>Skor Nilai (0 &mdash; 100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      required
                      value={currentScore}
                      onChange={(e) => handleFieldChange(student.username, section, index, 'score', e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Catatan Guru untuk Siswa</label>
                    <input
                      type="text"
                      placeholder="Tuliskan umpan balik atau saran perbaikan..."
                      value={currentFeedback}
                      onChange={(e) => handleFieldChange(student.username, section, index, 'feedback', e.target.value)}
                    />
                  </div>
                </div>

                <div className="row spread" style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleSuggest(student, section, index, essay)}
                  >
                    <Sparkles size={14} />
                    Saran Koreksi Otomatis
                  </button>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleSave(student, section, index)}
                  >
                    <Save size={14} />
                    Simpan Nilai & Koreksi
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="empty-state">
          Belum ada kiriman jawaban essay dari siswa di kelasmu.
        </div>
      )}
    </div>
  );
}
