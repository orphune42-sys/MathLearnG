import React, { useState, useEffect, useCallback } from 'react';
import { useApp, labels } from '../../context/AppContext';
import CameraModal from '../../components/CameraModal';
import { Lock, Camera, Upload, Trash2, ArrowLeft, ArrowRight, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AssessmentPage({ section }) {
  const {
    state,
    saveStateToStorage,
    session,
    gateReason,
    deadlinePassed,
    getSubmission,
    getProgress,
    getGrades,
    notify,
    setCurrentPage
  } = useApp();

  const u = session.username;
  const reason = gateReason(section);
  const key = section === 'lkpd' ? 'kpd' : section;

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraQuestionIndex, setCameraQuestionIndex] = useState(null);
  const [tabWarning, setTabWarning] = useState(false);

  // Tab switch detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && section && state.drafts?.[u]?.[section] && !reason) {
        setTabWarning(true);
        const activity = `${labels[section]} Bab Statistika`;
        const flaggedList = state.flagged || [];
        const existing = flaggedList.find(f => (f.username || f.name) === u && f.activity === activity);

        let nextFlagged;
        if (existing) {
          nextFlagged = flaggedList.map(f =>
            (f.username || f.name) === u && f.activity === activity
              ? { ...f, count: f.count + 1, lastAt: new Date().toISOString() }
              : f
          );
        } else {
          nextFlagged = [
            ...flaggedList,
            { username: u, name: u, activity, count: 1, lastAt: new Date().toISOString() }
          ];
        }

        saveStateToStorage({ ...state, flagged: nextFlagged });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [section, u, reason, state, saveStateToStorage]);

  const draft = state.drafts?.[u]?.[section] || null;
  const sub = getSubmission(u, section);

  const startAssessment = () => {
    if (reason) {
      notify(reason);
      return;
    }
    if (section === 'evaluasi' && deadlinePassed()) {
      notify('Batas waktu evaluasi sudah berakhir.');
      return;
    }
    if (!state[key].length) {
      notify('Belum ada soal yang tersedia.');
      return;
    }
    if (sub && !draft && !window.confirm('Mulai pengerjaan ulang? Nilai sebelumnya akan diperbarui setelah jawaban baru dikirim.')) {
      return;
    }

    const newDraft = {
      id: 'draft-' + Date.now(),
      questions: JSON.parse(JSON.stringify(state[key])),
      answers: {},
      photos: {},
      index: 0,
      startedAt: new Date().toISOString()
    };

    const nextDrafts = {
      ...state.drafts,
      [u]: {
        ...(state.drafts?.[u] || {}),
        [section]: newDraft
      }
    };

    saveStateToStorage({ ...state, drafts: nextDrafts });
  };

  const isAnswered = (qIndex) => {
    if (!draft) return false;
    const q = draft.questions[qIndex];
    const a = draft.answers[qIndex];
    if (q.type === 'pg') {
      return Number.isInteger(a) && a >= 0 && a < q.opts.length;
    }
    return !!(String(a || '').trim() || draft.photos[qIndex]);
  };

  const handleChooseAnswer = (qIndex, optIndex) => {
    if (section === 'evaluasi' && deadlinePassed()) {
      notify('Batas waktu evaluasi telah berakhir.');
      return;
    }
    if (section === 'latihan' && draft.answers[qIndex] !== undefined) {
      return; // locked once answered in latihan
    }

    const updatedAnswers = { ...draft.answers, [qIndex]: optIndex };
    const updatedDraft = { ...draft, answers: updatedAnswers };

    const nextState = {
      ...state,
      drafts: {
        ...state.drafts,
        [u]: {
          ...state.drafts[u],
          [section]: updatedDraft
        }
      }
    };
    saveStateToStorage(nextState);
  };

  const handleTextAnswer = (qIndex, text) => {
    if (section === 'evaluasi' && deadlinePassed()) return;

    const updatedAnswers = { ...draft.answers, [qIndex]: text };
    const updatedDraft = { ...draft, answers: updatedAnswers };

    const nextState = {
      ...state,
      drafts: {
        ...state.drafts,
        [u]: {
          ...state.drafts[u],
          [section]: updatedDraft
        }
      }
    };
    saveStateToStorage(nextState);
  };

  const handleFileUpload = (qIndex, file) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) {
      notify('Pilih format gambar yang valid (PNG, JPEG, WebP).');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      notify('Ukuran gambar maksimal 12 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const factor = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * factor);
        canvas.height = Math.round(img.naturalHeight * factor);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.78);

        const updatedPhotos = { ...draft.photos, [qIndex]: compressed };
        const updatedDraft = { ...draft, photos: updatedPhotos };
        const nextState = {
          ...state,
          drafts: {
            ...state.drafts,
            [u]: {
              ...state.drafts[u],
              [section]: updatedDraft
            }
          }
        };
        saveStateToStorage(nextState);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (qIndex) => {
    const updatedPhotos = { ...draft.photos };
    delete updatedPhotos[qIndex];
    const updatedDraft = { ...draft, photos: updatedPhotos };
    const nextState = {
      ...state,
      drafts: {
        ...state.drafts,
        [u]: {
          ...state.drafts[u],
          [section]: updatedDraft
        }
      }
    };
    saveStateToStorage(nextState);
  };

  const handlePracticeNav = (dir) => {
    if (dir > 0 && !isAnswered(draft.index)) {
      notify('Pilih jawaban terlebih dahulu sebelum lanjut.');
      return;
    }
    if (dir > 0 && draft.index === draft.questions.length - 1) {
      handleSubmit();
      return;
    }
    const nextIdx = Math.max(0, Math.min(draft.questions.length - 1, draft.index + dir));
    const updatedDraft = { ...draft, index: nextIdx };
    saveStateToStorage({
      ...state,
      drafts: { ...state.drafts, [u]: { ...state.drafts[u], [section]: updatedDraft } }
    });
  };

  const handleSubmit = () => {
    if (section === 'evaluasi' && deadlinePassed()) {
      notify('Batas waktu evaluasi sudah berakhir. Jawaban disimpan sebagai draft.');
      return;
    }

    const missing = draft.questions
      .map((_, i) => (isAnswered(i) ? null : i + 1))
      .filter(x => x !== null);

    if (missing.length > 0) {
      notify(`Mohon lengkapi semua soal. Nomor belum diisi: ${missing.join(', ')}`);
      return;
    }

    let correctCount = 0;
    let pgTotal = 0;
    const submission = {
      pgScore: null,
      pgFeedback: [],
      essays: {},
      submittedAt: new Date().toISOString(),
      attemptId: draft.id
    };

    draft.questions.forEach((q, i) => {
      if (q.type === 'pg') {
        pgTotal++;
        const isOk = draft.answers[i] === q.correct;
        if (isOk) correctCount++;
        submission.pgFeedback.push({
          number: i + 1,
          prompt: q.prompt,
          answer: q.opts[draft.answers[i]],
          expected: q.opts[q.correct],
          correct: isOk,
          feedback: isOk
            ? (q.feedbackCorrect || 'Jawaban tepat!')
            : (q.feedbackWrong || 'Pelajari kembali materi terkait soal ini.')
        });
      } else {
        submission.essays[i] = {
          prompt: q.prompt,
          answer: String(draft.answers[i] || '').trim(),
          photo: draft.photos[i] || null,
          score: null,
          feedback: '',
          corrected: false
        };
      }
    });

    if (pgTotal > 0) {
      submission.pgScore = Math.round((correctCount / pgTotal) * 100);
    }

    const userSubmissions = {
      ...(state.submissions[u] || {}),
      [section]: submission
    };

    // Calculate final grade if no essays pending
    const essayList = Object.values(submission.essays);
    let calculatedGrade = null;
    if (essayList.length === 0 && submission.pgScore !== null) {
      calculatedGrade = submission.pgScore;
    }

    const userGrades = {
      ...(state.grades[u] || {}),
      [section]: calculatedGrade
    };

    const userProgress = {
      ...getProgress(u),
      [section === 'lkpd' ? 'kpdDone' : `${section}Done`]: true
    };

    const updatedUserDrafts = { ...state.drafts[u] };
    delete updatedUserDrafts[section];

    const nextState = {
      ...state,
      submissions: { ...state.submissions, [u]: userSubmissions },
      grades: { ...state.grades, [u]: userGrades },
      progress: { ...state.progress, [u]: userProgress },
      drafts: { ...state.drafts, [u]: updatedUserDrafts }
    };

    if (saveStateToStorage(nextState)) {
      if (section === 'evaluasi') {
        setCurrentPage('result');
      } else {
        setCurrentPage('home');
      }
      notify(`${labels[section]} berhasil dikirim.${essayList.length > 0 ? ' Essay menunggu penilaian guru.' : ''}`);
    }
  };

  if (reason) {
    return (
      <div>
        <h2>{labels[section]}</h2>
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'var(--blue-100)', marginBottom: 16 }}>
            <Lock size={32} color="var(--blue-800)" />
          </div>
          <h3>Tahap Belum Terbuka</h3>
          <p className="muted" style={{ maxWidth: 440, margin: '0 auto 20px' }}>
            {reason}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setCurrentPage(section === 'lkpd' ? 'materi' : 'lkpd')}
          >
            {section === 'lkpd' ? 'Buka Materi' : 'Kembali ke LKPD'}
          </button>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div>
        <h2>{labels[section]}</h2>
        <p className="section-sub">
          {section === 'lkpd' ? 'Lembar Kerja Peserta Didik — Eksplorasi Konsep' : 'Evaluasi Penguasaan Materi'}
        </p>

        <div className="card">
          <h3>{sub ? 'Pengerjaan Sudah Dikirim' : 'Petunjuk Pengerjaan'}</h3>
          <p className="muted">
            {sub
              ? 'Hasil dan catatan guru dapat ditinjau pada beranda. Kamu dapat mengerjakan ulang jika diperlukan perbaikan.'
              : 'Kerjakan seluruh soal dengan cermat. Jawaban essay dapat dituliskan secara langsung atau diunggah dalam bentuk foto.'}
          </p>

          <div className="row" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={startAssessment}
              disabled={section === 'evaluasi' && deadlinePassed()}
            >
              {sub ? 'Kerjakan Ulang' : `Mulai ${labels[section]}`}
            </button>
            {sub && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCurrentPage('home')}
              >
                Lihat Nilai & Feedback
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const filledCount = draft.questions.filter((_, i) => isAnswered(i)).length;
  const progressPct = draft.questions.length ? Math.round((filledCount / draft.questions.length) * 100) : 0;

  const renderQuestionBlock = (q, i) => {
    const a = draft.answers[i];
    const photo = draft.photos[i];
    const isPracticeLocked = section === 'latihan' && a !== undefined;

    return (
      <article key={i} className="question-block" style={{ marginBottom: 28 }}>
        <h3 className="pre" style={{ fontSize: 15, marginBottom: 12 }}>
          {i + 1}. {q.prompt}
        </h3>

        {q.media && (
          <div className="soal-media-preview" style={{ marginBottom: 12 }}>
            <img src={q.media} alt={`Media soal ${i + 1}`} />
          </div>
        )}

        {q.type === 'pg' ? (
          <div>
            {q.opts.map((opt, n) => {
              const isSelected = a === n;
              const isCorrect = isPracticeLocked && n === q.correct;
              const isWrong = isPracticeLocked && isSelected && n !== q.correct;

              return (
                <button
                  key={n}
                  type="button"
                  className={`option-btn ${isSelected ? 'selected ' : ''}${isCorrect ? 'correct ' : ''}${isWrong ? 'wrong' : ''}`}
                  onClick={() => handleChooseAnswer(i, n)}
                  disabled={isPracticeLocked}
                >
                  <span className="letter">{String.fromCharCode(65 + n)}</span>
                  <span>{opt}</span>
                </button>
              );
            })}

            {section === 'latihan' && a !== undefined && (
              <div className={`feedback-box ${a === q.correct ? 'feedback-correct' : 'feedback-wrong'}`}>
                {a === q.correct ? (
                  <div className="row" style={{ gap: 6 }}>
                    <CheckCircle2 size={16} />
                    <span>{q.feedbackCorrect || 'Jawaban benar!'}</span>
                  </div>
                ) : (
                  <div className="row" style={{ gap: 6 }}>
                    <AlertTriangle size={16} />
                    <span>{q.feedbackWrong || `Belum tepat. Jawaban yang benar adalah pilihan ${String.fromCharCode(65 + q.correct)}.`}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="field">
              <label className="sr-only" htmlFor={`ans-${i}`}>Jawaban soal {i + 1}</label>
              <textarea
                id={`ans-${i}`}
                rows={3}
                placeholder="Tuliskan langkah dan jawabanmu di sini..."
                value={a || ''}
                onChange={(e) => handleTextAnswer(i, e.target.value)}
              />
            </div>

            <div className="camera-box">
              <div className="hint-text" style={{ marginBottom: 8 }}>
                Atau sertakan foto lembar jawaban tulisan tanganmu:
              </div>
              <div className="row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setCameraQuestionIndex(i);
                    setCameraOpen(true);
                  }}
                >
                  <Camera size={14} />
                  Buka Kamera
                </button>

                <label className="btn-outline-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={13} />
                  Unggah Foto
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => handleFileUpload(i, e.target.files?.[0])}
                  />
                </label>
              </div>

              {photo && (
                <div className="photo-preview" style={{ marginTop: 12 }}>
                  <img src={photo} alt={`Foto jawaban nomor ${i + 1}`} />
                  <div className="row" style={{ marginTop: 6 }}>
                    <span className="badge badge-green">Foto jawaban tersimpan</span>
                    <button
                      type="button"
                      className="btn-danger-sm"
                      onClick={() => handleRemovePhoto(i)}
                    >
                      <Trash2 size={12} />
                      Hapus Foto
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </article>
    );
  };

  return (
    <div>
      <div className="eyebrow">{labels[section]}</div>
      <h2>{labels[section]} &mdash; Statistika</h2>

      {tabWarning && (
        <div className="error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} />
          <span>Aktivitas berpindah tab dicatat untuk pemantauan pembelajaran.</span>
        </div>
      )}

      <div className="card">
        <div className="row spread" style={{ marginBottom: 8 }}>
          <div className="eyebrow" style={{ margin: 0 }}>
            Progres: {filledCount} dari {draft.questions.length} soal terjawab
          </div>
          <span className="badge badge-blue">{progressPct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>

        <fieldset disabled={section === 'evaluasi' && deadlinePassed()}>
          {section === 'latihan' ? (
            <div>
              <div className="eyebrow" style={{ margin: '14px 0 8px' }}>
                Soal {draft.index + 1} dari {draft.questions.length}
              </div>
              {renderQuestionBlock(draft.questions[draft.index], draft.index)}
              <div className="row spread" style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={draft.index === 0}
                  onClick={() => handlePracticeNav(-1)}
                >
                  <ArrowLeft size={15} />
                  Soal Sebelumnya
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handlePracticeNav(1)}
                >
                  {draft.index === draft.questions.length - 1 ? 'Selesai & Kirim Jawaban' : 'Soal Berikutnya'}
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div>
              {draft.questions.map((q, i) => renderQuestionBlock(q, i))}
              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: 20 }}
                onClick={handleSubmit}
                disabled={section === 'evaluasi' && deadlinePassed()}
              >
                <Send size={15} />
                Kirim Jawaban {labels[section]}
              </button>
            </div>
          )}
        </fieldset>
      </div>

      <CameraModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(dataUrl) => {
          if (cameraQuestionIndex !== null) {
            const updatedPhotos = { ...draft.photos, [cameraQuestionIndex]: dataUrl };
            const updatedDraft = { ...draft, photos: updatedPhotos };
            saveStateToStorage({
              ...state,
              drafts: { ...state.drafts, [u]: { ...state.drafts[u], [section]: updatedDraft } }
            });
          }
        }}
      />
    </div>
  );
}
