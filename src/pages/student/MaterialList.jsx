import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart2, PieChart, Calculator, BookOpen, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap = {
  'bar-chart': BarChart2,
  'pie-chart': PieChart,
  'calculator': Calculator,
  'book': BookOpen
};

export default function MaterialList() {
  const { state, session, getProgress, setCurrentPage, setCurrentMaterialId, saveStateToStorage } = useApp();
  const p = getProgress(session.username);

  const handleOpenMaterial = (id) => {
    setCurrentMaterialId(id);
    if (!p.materiRead.includes(id)) {
      const nextProgress = {
        ...state.progress,
        [session.username]: {
          ...p,
          materiRead: [...p.materiRead, id]
        }
      };
      saveStateToStorage({ ...state, progress: nextProgress });
    }
    setCurrentPage('materi-detail');
  };

  return (
    <div>
      <div className="eyebrow">Modul Pembelajaran</div>
      <h2>Pilih Materi Matematika</h2>
      <p className="section-sub">
        Materi dapat dipelajari dan diulang kapan saja untuk mempermudah pengerjaan LKPD.
      </p>

      <div className="grid grid-3">
        {state.materi.length > 0 ? (
          state.materi.map((m) => {
            const Icon = iconMap[m.icon] || BookOpen;
            const isRead = p.materiRead.includes(m.id);

            return (
              <motion.button
                key={m.id}
                type="button"
                className="card materi-card"
                onClick={() => handleOpenMaterial(m.id)}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
              >
                <div className="icon-circle">
                  <Icon size={22} />
                </div>
                <h3>{m.title}</h3>
                <p className="muted" style={{ fontSize: 13, minHeight: 40 }}>
                  {m.desc}
                </p>
                <div className="row" style={{ marginTop: 12 }}>
                  <span className="badge badge-orange">{m.subbab.length} sub-bab</span>
                  {isRead && (
                    <span className="badge badge-green">
                      <CheckCircle2 size={12} />
                      Selesai dibaca
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })
        ) : (
          <div className="empty-state">Guru belum menambahkan materi pembelajaran.</div>
        )}
      </div>
    </div>
  );
}
