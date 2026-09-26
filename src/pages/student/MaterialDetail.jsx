import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, ExternalLink, CheckCircle2, ChevronLeft, ChevronRight, BarChart2, PieChart, Calculator, BookOpen } from 'lucide-react';

const iconMap = {
  'bar-chart': BarChart2,
  'pie-chart': PieChart,
  'calculator': Calculator,
  'book': BookOpen
};

export default function MaterialDetail() {
  const { state, currentMaterialId, setCurrentMaterialId, setCurrentPage } = useApp();
  const m = state.materi.find(x => x.id === currentMaterialId) || state.materi[0];

  if (!m) {
    return (
      <div className="card">
        <p>Materi tidak ditemukan.</p>
        <button type="button" className="btn-secondary" onClick={() => setCurrentPage('materi')}>
          Kembali ke Daftar Materi
        </button>
      </div>
    );
  }

  const Icon = iconMap[m.icon] || BookOpen;
  const currentIndex = state.materi.findIndex(x => x.id === m.id);

  const handleNav = (dir) => {
    const nextIdx = (currentIndex + dir + state.materi.length) % state.materi.length;
    setCurrentMaterialId(state.materi[nextIdx].id);
  };

  return (
    <div>
      <button
        type="button"
        className="btn-outline-sm"
        onClick={() => setCurrentPage('materi')}
        style={{ marginBottom: 16 }}
      >
        <ArrowLeft size={14} />
        Kembali ke daftar materi
      </button>

      <div className="card">
        <div className="icon-circle">
          <Icon size={22} />
        </div>
        <h2>{m.title}</h2>
        <p className="muted">{m.desc}</p>

        <h3 style={{ marginTop: 24, marginBottom: 12 }}>Sub-bab Materi</h3>
        {m.subbab.map((s, idx) => (
          <div key={idx} className="subbab-item">
            <CheckCircle2 size={15} color="var(--success)" style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            {s}
          </div>
        ))}

        {m.links && m.links.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 10 }}>Tautan Pendukung</h3>
            <div className="row">
              {m.links.map((link, idx) => (
                <a
                  key={idx}
                  className="btn-secondary"
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={14} />
                  Buka Sumber Belajar {idx + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="row spread" style={{ marginTop: 32, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleNav(-1)}
          >
            <ChevronLeft size={16} />
            Materi Sebelumnya
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleNav(1)}
          >
            Materi Selanjutnya
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
