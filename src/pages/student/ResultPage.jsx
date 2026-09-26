import React from 'react';
import { useApp } from '../../context/AppContext';
import StatCard from '../../components/StatCard';
import { CheckCircle2, XCircle, Award, ArrowLeft } from 'lucide-react';

export default function ResultPage() {
  const { session, getSubmission, finalGrade, setCurrentPage } = useApp();
  const sub = getSubmission(session.username, 'evaluasi');
  const score = finalGrade(session.username, 'evaluasi');

  if (!sub) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 32 }}>
        <p>Belum ada data hasil evaluasi.</p>
        <button type="button" className="btn-primary" onClick={() => setCurrentPage('home')}>
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const correctCount = (sub.pgFeedback || []).filter(x => x.correct).length;
  const totalPg = sub.pgFeedback?.length || 0;

  return (
    <div className="card" style={{ textAlign: 'center', padding: '40px 24px', maxWidth: 700, margin: '20px auto' }}>
      <h2>Evaluasi Selesai</h2>
      <p className="muted">Jawaban evaluasi kamu telah berhasil dikirimkan ke sistem.</p>

      <div className="score-ring" style={{ '--pct': score ?? 0 }}>
        <div className="score-ring-inner">
          {score ?? '?'}
          <span className="hint-text" style={{ fontSize: 11 }}>dari 100</span>
        </div>
      </div>

      <div style={{ margin: '14px 0' }}>
        <span className={`badge ${score === null ? 'badge-orange' : 'badge-green'}`}>
          {score === null
            ? 'Menunggu Koreksi Guru'
            : score >= 90
            ? 'Sangat Baik'
            : score >= 80
            ? 'Baik'
            : score >= 70
            ? 'Cukup'
            : 'Perlu Belajar Lagi'}
        </span>
      </div>

      <div className="grid grid-3" style={{ marginTop: 24, textAlign: 'left' }}>
        <StatCard icon={CheckCircle2} number={correctCount} label="Pilihan ganda benar" />
        <StatCard icon={XCircle} number={totalPg - correctCount} label="Pilihan ganda salah" />
        <StatCard icon={Award} number={score === null ? 'Menunggu' : `${score}%`} label="Pencapaian Akhir" />
      </div>

      <div className="note" style={{ marginTop: 20 }}>
        {score === null
          ? 'Nilai final akan otomatis terhitung setelah seluruh jawaban essay dinilai oleh guru.'
          : 'Ulasan lengkap dan catatan guru dapat diakses kembali melalui halaman Beranda.'}
      </div>

      <button
        type="button"
        className="btn-primary"
        onClick={() => setCurrentPage('home')}
        style={{ marginTop: 24 }}
      >
        <ArrowLeft size={16} />
        Kembali ke Beranda
      </button>
    </div>
  );
}
