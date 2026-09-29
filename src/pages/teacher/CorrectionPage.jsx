import React, { useState } from 'react';
import { useApp, labels } from '../../context/AppContext';
import { Sparkles, Save, CheckCircle2, AlertCircle, Loader2, Key, Settings } from 'lucide-react';
import { evaluateEssayWithGemini } from '../../services/gemini';

export default function CorrectionPage() {
  const { state, saveStateToStorage, teacherStudents, getSubmission, session, notify } = useApp();
  const students = teacherStudents();

  const [formData, setFormData] = useState({});
  const [loadingKey, setLoadingKey] = useState(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(state.settings?.geminiApiKey || '');

  const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const activeApiKey = apiKeyInput.trim() || state.settings?.geminiApiKey || envKey;

  const handleSaveApiKey = () => {
    const nextSettings = {
      ...state.settings,
      geminiApiKey: apiKeyInput.trim()
    };
    if (saveStateToStorage({ ...state, settings: nextSettings })) {
      notify('API Key Gemini berhasil disimpan.');
      setShowKeyInput(false);
    }
  };

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

  const handleSuggest = async (student, section, index, essay) => {
    const key = `${student.username}-${section}-${index}`;

    if (!activeApiKey) {
      notify('Harap masukkan Gemini API Key terlebih dahulu.');
      setShowKeyInput(true);
      return;
    }

    setLoadingKey(key);

    try {
      const result = await evaluateEssayWithGemini({
        prompt: essay.prompt,
        answer: essay.answer,
        photo: essay.photo,
        apiKey: activeApiKey
      });

      setFormData(prev => ({
        ...prev,
        [key]: {
          score: result.score,
          feedback: result.feedback
        }
      }));

      notify('Koreksi AI Gemini selesai! Nilai dan catatan berhasil diperbarui.');
    } catch (err) {
      notify(`Gagal mengevaluasi dengan AI: ${err.message}`);
      if (err.message.includes('API Key')) {
        setShowKeyInput(true);
      }
    } finally {
      setLoadingKey(null);
    }
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
      <div className="eyebrow">Koreksi AI Gemini</div>
      <div className="row spread" style={{ alignItems: 'flex-start' }}>
        <div>
          <h2>Koreksi Jawaban Uraian / HOTS</h2>
          <p className="section-sub">
            Periksa jawaban uraian dan foto lembar kerja siswa dengan bantuan kecerdasan buatan Google Gemini.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => setShowKeyInput(!showKeyInput)}
          style={{ gap: 6 }}
        >
          <Key size={14} />
          {activeApiKey ? 'Pengaturan API Key (Aktif)' : 'Setel Gemini API Key'}
        </button>
      </div>

      {showKeyInput && (
        <div className="card" style={{ marginBottom: 20, backgroundColor: 'var(--surface-hover, #f8fafc)' }}>
          <h4 style={{ margin: '0 0 8px 0' }} className="row">
            <Settings size={16} /> Pengaturan Gemini API Key
          </h4>
          <p style={{ fontSize: 13, color: 'var(--muted, #64748b)', marginBottom: 12 }}>
            Masukkan API Key dari Google AI Studio (https://aistudio.google.com) agar fitur koreksi AI otomatis dapat bekerja.
          </p>
          <div className="row" style={{ gap: 8 }}>
            <input
              type="password"
              placeholder="Masukkan Gemini API Key (AIzaSy...)"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="button" className="btn-primary" onClick={handleSaveApiKey}>
              Simpan Key
            </button>
          </div>
        </div>
      )}

      {essayEntries.length > 0 ? (
        essayEntries.map(({ student, section, index, essay }) => {
          const formKey = `${student.username}-${section}-${index}`;
          const currentInput = formData[formKey] || {};
          const currentScore = currentInput.score !== undefined ? currentInput.score : (essay.score ?? '');
          const currentFeedback = currentInput.feedback !== undefined ? currentInput.feedback : (essay.feedback || '');
          const isLoading = loadingKey === formKey;

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
                    disabled={isLoading}
                    onClick={() => handleSuggest(student, section, index, essay)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                        Menganalisis dengan AI...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Koreksi AI (Gemini)
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn-primary"
                    disabled={isLoading}
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
