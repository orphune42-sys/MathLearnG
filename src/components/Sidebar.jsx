import React from 'react';
import { useApp, roles } from '../context/AppContext';
import { 
  Home, 
  BookOpen, 
  FileSpreadsheet, 
  Edit3, 
  Target, 
  Info, 
  User, 
  LayoutDashboard, 
  BarChart2, 
  Calendar, 
  AlertTriangle, 
  CheckSquare, 
  School, 
  UserPlus, 
  UserCheck, 
  Users, 
  Lock,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const { session, own, currentPage, setCurrentPage, logout, gateReason } = useApp();
  const user = own();

  if (!session || !user) return null;

  const menus = {
    siswa: [
      { id: 'home', icon: Home, label: 'Beranda' },
      { id: 'materi', icon: BookOpen, label: 'Materi' },
      { id: 'lkpd', icon: FileSpreadsheet, label: 'LKPD' },
      { id: 'latihan', icon: Edit3, label: 'Latihan' },
      { id: 'evaluasi', icon: Target, label: 'Evaluasi' },
      { id: 'tentang', icon: Info, label: 'Tentang' },
      { id: 'profile', icon: User, label: 'Profil Saya' }
    ],
    guru: [
      { id: 'home', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'materi-editor', icon: BookOpen, label: 'Kelola Materi' },
      { id: 'kpd-editor', icon: FileSpreadsheet, label: 'Kelola LKPD' },
      { id: 'latihan-editor', icon: Edit3, label: 'Kelola Latihan' },
      { id: 'evaluasi-editor', icon: Target, label: 'Kelola Evaluasi' },
      { id: 'nilai', icon: BarChart2, label: 'Nilai & Sinkron' },
      { id: 'jadwal', icon: Calendar, label: 'Jadwal Pelajaran' },
      { id: 'deteksi', icon: AlertTriangle, label: 'Deteksi Keluar Tab' },
      { id: 'koreksi', icon: CheckSquare, label: 'Koreksi Essay' },
      { id: 'profile', icon: User, label: 'Profil Saya' }
    ],
    admin: [
      { id: 'home', icon: LayoutDashboard, label: 'Ringkasan' },
      { id: 'jadwal-admin', icon: Calendar, label: 'Atur Jadwal Guru' },
      { id: 'kelas', icon: School, label: 'Kelola Kelas' },
      { id: 'siswa-editor', icon: UserPlus, label: 'Tambah Siswa' },
      { id: 'guru-editor', icon: UserCheck, label: 'Tambah Guru' },
      { id: 'users', icon: Users, label: 'Data Pengguna' },
      { id: 'deteksi', icon: AlertTriangle, label: 'Deteksi Keluar Tab' },
      { id: 'profile', icon: User, label: 'Profil Saya' }
    ]
  };

  const currentMenu = menus[session.role] || [];

  return (
    <aside className="side-nav">
      <div className="brand">
        <div className="logo-badge">∑</div>
        <div className="logo-text">Elearn<span>Math</span></div>
      </div>
      <div className="side-role">
        <span className="badge badge-blue">{roles[session.role]}</span>
      </div>

      <nav className="side-nav-links" aria-label="Navigasi utama">
        {currentMenu.map((item) => {
          const Icon = item.icon;
          const isLocked = session.role === 'siswa' && ['lkpd', 'latihan', 'evaluasi'].includes(item.id) && !!gateReason(item.id);
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentPage(item.id)}
              className={`${isActive ? 'active ' : ''}${isLocked ? 'locked' : ''}`}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{item.label}</span>
              {isLocked && <Lock size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
            </button>
          );
        })}
      </nav>

      <div className="side-foot">
        <div className="avatar">
          {(user.namaLengkap || 'U').charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="side-foot-name">{user.namaLengkap}</div>
          <button type="button" className="logout" onClick={logout}>
            Keluar
          </button>
        </div>
      </div>
    </aside>
  );
}
