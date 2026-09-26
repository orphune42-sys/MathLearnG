import React from 'react';
import { useApp, labels } from '../../context/AppContext';
import Hero from '../../components/Hero';
import StatCard from '../../components/StatCard';
import AnnouncementCard from '../../components/AnnouncementCard';
import { BookOpen, FileSpreadsheet, Edit3, Target, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StudentHome() {
  const { state, session, studentClasses, getProgress, finalGrade, lkpdPassed, gateReason, getSubmission } = useApp();
  const u = session.username;
  const p = getProgress(u);

  const readCount = state.materi.filter(m => p.materiRead.includes(m.id)).length;
  const pct = state.materi.length ? Math.round((readCount / state.materi.length) * 100) : 0;

  const sections = ['lkpd', 'latihan', 'evaluasi'].filter(s => getSubmission(u, s));

  const formatDate = (val) => {
    if (!val) return '';
    return new Date(val).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <div>
      <Hero />

      <div className="grid grid-4">
        <StatCard 
          icon={BookOpen} 
          number={`${readCount} / ${state.materi.length}`} 
          label="Materi dibaca" 
        />
        <StatCard 
          icon={FileSpreadsheet} 
          number={finalGrade(u, 'lkpd') ?? '—'} 
          label={`Nilai LKPD (tuntas ≥ ${state.settings.lkpdPassingGrade})`} 
        />
        <StatCard 
          icon={Edit3} 
          number={finalGrade(u, 'latihan') ?? '—'} 
          label="Nilai latihan" 
        />
        <StatCard 
          icon={Target} 
          number={finalGrade(u, 'evaluasi') ?? '—'} 
          label="Nilai evaluasi" 
        />
      </div>

      <div className="card">
        <h3>Progres Belajar</h3>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="muted">{pct}% dari seluruh materi selesai kamu pelajari.</div>

        <div className="note" style={{ marginTop: 14 }}>
          <strong>Kelas:</strong> {studentClasses(u).join(', ') || 'Belum diisi'}<br />
          {lkpdPassed(u) ? 'LKPD tuntas. Tahap latihan telah terbuka.' : gateReason('latihan')}<br />
          <strong>Batas Waktu Evaluasi:</strong> {formatDate(state.settings.evaluasiDeadline) || 'Tidak dibatasi'}
        </div>
      </div>

      <AnnouncementCard />

      <section className="card">
        <h3>Feedback & Evaluasi Pengerjaan</h3>
        <p className="muted">Nilai, perincian jawaban, dan catatan koreksi dari guru.</p>

        {sections.length > 0 ? (
          sections.map((s) => {
            const sub = getSubmission(u, s);
            const g = finalGrade(u, s);

            return (
              <details key={s} open style={{ marginBottom: 16 }}>
                <summary>
                  {labels[s]}{' '}
                  <span className={`badge ${g === null ? 'badge-orange' : 'badge-blue'}`}>
                    {g === null ? 'Menunggu koreksi' : `Nilai: ${g} / 100`}
                  </span>
                </summary>

                {sub.submittedAt && (
                  <p className="hint-text" style={{ margin: '6px 0' }}>
                    Dikirim pada {formatDate(sub.submittedAt)}
                  </p>
                )}

                {sub.pgScore != null && (
                  <p className="hint-text" style={{ margin: '4px 0' }}>
                    Nilai pilihan ganda: {sub.pgScore} / 100
                  </p>
                )}

                {(sub.pgFeedback || []).map((f, idx) => (
                  <div key={idx} className="soal-item">
                    <span className={`badge ${f.correct ? 'badge-green' : 'badge-red'}`}>
                      {f.correct ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {f.correct ? 'Benar' : 'Belum tepat'}
                    </span>
                    <p style={{ margin: '8px 0 4px' }}>
                      <strong>{f.number}. {f.prompt}</strong>
                    </p>
                    <div style={{ fontSize: 13 }}>Jawabanmu: {f.answer}</div>
                    {!f.correct && (
                      <div style={{ fontSize: 13, color: 'var(--blue-800)', fontWeight: 500 }}>
                        Jawaban benar: {f.expected}
                      </div>
                    )}
                    {f.feedback && (
                      <div className="note pre" style={{ marginTop: 8 }}>
                        {f.feedback}
                      </div>
                    )}
                  </div>
                ))}

                {Object.entries(sub.essays || {}).map(([i, e]) => (
                  <div key={i} className="soal-item">
                    <strong>{Number(i) + 1}. {e.prompt}</strong>
                    <p className="pre" style={{ margin: '8px 0' }}>
                      {e.answer || '(Jawaban berupa foto)'}
                    </p>
                    {e.photo && (
                      <div className="photo-preview">
                        <img src={e.photo} alt="Foto jawaban" />
                      </div>
                    )}
                    <span className={`badge ${e.corrected ? 'badge-green' : 'badge-orange'}`}>
                      {e.corrected ? `Skor essay: ${e.score} / 100` : 'Menunggu koreksi guru'}
                    </span>
                    <div className="note pre" style={{ marginTop: 8 }}>
                      {e.corrected 
                        ? (e.feedback || 'Guru belum menambahkan catatan evaluasi.') 
                        : 'Feedback akan muncul setelah guru memeriksa dan menyimpan nilai.'}
                    </div>
                  </div>
                ))}
              </details>
            );
          })
        ) : (
          <div className="empty-state">
            Belum ada hasil pengerjaan. Selesaikan materi dan kirim jawaban LKPD atau latihanmu.
          </div>
        )}
      </section>
    </div>
  );
}
