import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'elearnmath_state_v1';
const SESSION_KEY = 'elearnmath_session_v1';
export const ADMIN_EMAIL_DOMAIN = '@students.um.ac.id';

export const labels = {
  lkpd: 'LKPD',
  latihan: 'Latihan',
  evaluasi: 'Evaluasi'
};

export const roles = {
  siswa: 'Siswa',
  guru: 'Guru',
  admin: 'Admin'
};

export const religions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'];

const uid = () => globalThis.crypto?.randomUUID?.() || 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2);
const clone = (val) => JSON.parse(JSON.stringify(val));

const defaultState = {
  users: {
    admins: [
      {
        namaLengkap: 'Administrator',
        email: 'admin@students.um.ac.id',
        username: 'admin',
        password: 'admin123'
      }
    ],
    gurus: [
      {
        namaLengkap: 'Budi Raharjo, S.Pd.',
        kelas: 'VII-A, VII-B',
        jenisKelamin: 'Laki-laki',
        agama: 'Islam',
        mapel: 'Matematika',
        jadwal: 'Senin 07.30 - 09.00 (VII-A)\nRabu 09.30 - 11.00 (VII-B)',
        alamat: 'Jl. Pendidikan No. 12',
        noHp: '081234567890',
        username: 'guru1',
        password: 'guru123'
      }
    ],
    siswas: [
      {
        namaLengkap: 'Ahmad Faiz',
        kelas: 'VII-A',
        jenisKelamin: 'Laki-laki',
        agama: 'Islam',
        namaWali: 'Hasan',
        nisn: '1234567890',
        asalSekolah: 'SMP Negeri 1',
        alamat: 'Jl. Merdeka No. 5',
        noHp: '082198765432',
        username: 'siswa1',
        password: 'siswa123',
        isOnline: true,
        lastLogin: new Date().toISOString(),
        lastActive: Date.now()
      },
      {
        namaLengkap: 'Siti Nurhaliza',
        kelas: 'VII-A',
        jenisKelamin: 'Perempuan',
        agama: 'Islam',
        namaWali: 'Mansur',
        nisn: '1234567891',
        asalSekolah: 'SMP Negeri 1',
        alamat: 'Jl. Melati No. 8',
        noHp: '082198765433',
        username: 'siswa2',
        password: 'siswa123',
        isOnline: false,
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
        lastActive: Date.now() - 3600000
      }
    ]
  },
  registeredEmails: [],
  flagged: [],
  classes: [
    {
      id: 'c1',
      name: 'VII-A',
      teacherUsername: 'guru1',
      studentUsernames: ['siswa1', 'siswa2']
    }
  ],
  submissions: {},
  progress: {},
  grades: {},
  drafts: {},
  announcements: [
    {
      id: 'a1',
      title: 'Selamat Datang di ElearnMath',
      body: 'Silakan pelajari materi penyajian dan pemusatan data sebelum mengerjakan LKPD dan evaluasi.',
      authorUsername: 'guru1',
      authorName: 'Budi Raharjo, S.Pd.',
      authorRole: 'guru',
      createdAt: new Date().toISOString()
    }
  ],
  settings: {
    lkpdPassingGrade: 75,
    evaluasiDeadline: null
  },
  googleSheet: {
    webAppUrl: '',
    lastSync: null
  },
  materi: [
    {
      id: 'm1',
      icon: 'bar-chart',
      title: 'Mengenal Jenis Data',
      desc: 'Memahami perbedaan data kualitatif dan kuantitatif melalui contoh sehari-hari.',
      subbab: ['Data Kualitatif', 'Data Kuantitatif', 'Contoh dalam Kehidupan Sehari-hari'],
      links: [],
      yt: null
    },
    {
      id: 'm2',
      icon: 'pie-chart',
      title: 'Penyajian Data',
      desc: 'Belajar menyajikan data dalam bentuk tabel dan diagram.',
      subbab: ['Tabel Data', 'Diagram Batang', 'Diagram Lingkaran'],
      links: ['https://www.youtube.com/results?search_query=penyajian+data+matematika'],
      yt: 'https://www.youtube.com/results?search_query=penyajian+data+matematika'
    },
    {
      id: 'm3',
      icon: 'calculator',
      title: 'Ukuran Pemusatan Data',
      desc: 'Mengenal mean, median, dan modus sebagai ukuran pemusatan data.',
      subbab: ['Mean (Rata-rata)', 'Median', 'Modus'],
      links: [],
      yt: null
    }
  ],
  kpd: [
    {
      id: 'q1',
      type: 'pg',
      format: 'text',
      prompt: 'Warna kesukaan siswa termasuk jenis data...',
      media: '',
      opts: ['Data kualitatif', 'Data kuantitatif', 'Data campuran', 'Bukan data'],
      correct: 0,
      feedbackCorrect: 'Benar! Warna kesukaan merupakan data kualitatif.',
      feedbackWrong: 'Jawaban tepat: Data kualitatif, karena berupa kategori bukan angka.'
    },
    {
      id: 'q2',
      type: 'essay',
      format: 'text',
      prompt: 'Jelaskan perbedaan data kualitatif dan data kuantitatif menurut pemahamanmu.',
      media: '',
      opts: [],
      correct: 0
    }
  ],
  latihan: [
    {
      id: 'l1',
      type: 'pg',
      format: 'text',
      prompt: 'Warna kesukaan siswa termasuk jenis data...',
      media: '',
      opts: ['Data kualitatif', 'Data kuantitatif', 'Data campuran', 'Bukan data'],
      correct: 0,
      feedbackCorrect: 'Benar! Warna kesukaan merupakan data kualitatif.',
      feedbackWrong: 'Jawaban yang tepat: Data kualitatif, karena berupa kategori bukan angka.'
    },
    {
      id: 'l2',
      type: 'pg',
      format: 'text',
      prompt: 'Tinggi badan siswa (dalam cm) termasuk jenis data...',
      media: '',
      opts: ['Data kualitatif', 'Data kuantitatif', 'Data nominal', 'Bukan data'],
      correct: 1,
      feedbackCorrect: 'Benar! Tinggi badan berupa angka sehingga termasuk data kuantitatif.',
      feedbackWrong: 'Jawaban yang tepat: Data kuantitatif, karena dinyatakan dalam bentuk angka.'
    },
    {
      id: 'l3',
      type: 'pg',
      format: 'text',
      prompt: 'Diagram yang paling tepat untuk menampilkan perbandingan persentase adalah...',
      media: '',
      opts: ['Diagram batang', 'Diagram lingkaran', 'Diagram garis', 'Tabel frekuensi'],
      correct: 1,
      feedbackCorrect: 'Benar! Diagram lingkaran cocok untuk menunjukkan perbandingan persentase.',
      feedbackWrong: 'Jawaban yang tepat: Diagram lingkaran, karena menunjukkan proporsi dari keseluruhan.'
    },
    {
      id: 'l4',
      type: 'pg',
      format: 'text',
      prompt: 'Nilai yang paling sering muncul dalam sekumpulan data disebut...',
      media: '',
      opts: ['Mean', 'Median', 'Modus', 'Range'],
      correct: 2,
      feedbackCorrect: 'Benar! Nilai yang paling sering muncul disebut modus.',
      feedbackWrong: 'Jawaban yang tepat: Modus, yaitu nilai dengan frekuensi kemunculan terbanyak.'
    },
    {
      id: 'l5',
      type: 'essay',
      format: 'text',
      prompt: 'Menurutmu, mengapa memilih jenis diagram yang tepat penting saat menyajikan data hasil survei kelas? Jelaskan dengan contoh.',
      media: '',
      opts: [],
      correct: 0
    }
  ],
  evaluasi: [
    {
      id: 'e1',
      type: 'essay',
      format: 'text',
      prompt: 'Jelaskan perbedaan data kualitatif dan data kuantitatif, lalu berikan masing-masing satu contoh dari lingkungan sekolahmu.',
      media: '',
      opts: [],
      correct: 0
    },
    {
      id: 'e2',
      type: 'essay',
      format: 'text',
      prompt: 'Sebuah survei mencatat warna favorit 20 siswa. Jelaskan diagram apa yang paling tepat digunakan dan alasannya.',
      media: '',
      opts: [],
      correct: 0
    },
    {
      id: 'e3',
      type: 'essay',
      format: 'text',
      prompt: 'Diketahui nilai ulangan 5 siswa: 80, 90, 70, 90, 85. Tentukan mean dan modus dari data tersebut, sertakan cara mengerjakannya.',
      media: '',
      opts: [],
      correct: 0
    }
  ]
};

function normalizeState(data) {
  const s = Object.assign(clone(defaultState), data);
  s.users = Object.assign({ admins: [], gurus: [], siswas: [] }, s.users || {});
  for (const key of ['admins', 'gurus', 'siswas']) {
    if (!Array.isArray(s.users[key])) s.users[key] = [];
    if (s.users[key].length === 0 && defaultState.users[key]) {
      s.users[key] = clone(defaultState.users[key]);
    }
  }
  for (const key of ['materi', 'kpd', 'latihan', 'evaluasi', 'classes', 'flagged', 'announcements']) {
    if (!Array.isArray(s[key])) s[key] = [];
    if (s[key].length === 0 && defaultState[key]) {
      s[key] = clone(defaultState[key]);
    }
  }
  for (const key of ['progress', 'grades', 'submissions', 'drafts']) {
    s[key] = s[key] || {};
  }
  s.settings = Object.assign({ lkpdPassingGrade: 75, evaluasiDeadline: null }, s.settings || {});
  s.settings.lkpdPassingGrade = Number(s.settings.lkpdPassingGrade) || 75;
  s.googleSheet = Object.assign({ webAppUrl: '', lastSync: null }, s.googleSheet || {});

  s.materi.forEach(m => {
    m.id = m.id || uid();
    m.subbab = m.subbab || [];
    m.links = Array.isArray(m.links) ? m.links : [];
  });
  ['kpd', 'latihan', 'evaluasi'].forEach(k => s[k].forEach(q => { q.id = q.id || uid(); }));
  Object.values(s.users).flat().forEach(u => {
    u.kelas = u.kelas || '';
    u.agama = u.agama || '';
    u.jenisKelamin = u.jenisKelamin || '';
    if (u.isOnline === undefined) u.isOnline = false;
  });
  s.classes.forEach(c => { c.studentUsernames = c.studentUsernames || []; });
  return s;
}

const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return normalizeState(JSON.parse(raw));
    } catch (e) {
      console.error(e);
    }
    return normalizeState(defaultState);
  });

  const [session, setSession] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      return saved;
    } catch {
      return null;
    }
  });

  const [currentPage, setCurrentPage] = useState('home');
  const [toastMessage, setToastMessage] = useState(null);
  const [currentMaterialId, setCurrentMaterialId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const toastTimer = useRef(null);

  const notify = useCallback((msg) => {
    setToastMessage(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 4500);
  }, []);

  const saveStateToStorage = useCallback((newState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setState(newState);
      return true;
    } catch (e) {
      notify('Gagal menyimpan data: Penyimpanan browser penuh.');
      return false;
    }
  }, [notify]);

  // Sync state changes across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setState(normalizeState(JSON.parse(e.newValue)));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Revision 1: Student Presence Heartbeat
  useEffect(() => {
    if (!session || session.role !== 'siswa') return;

    const updateHeartbeat = () => {
      setState(prev => {
        const siswas = prev.users.siswas.map(s => {
          if (s.username === session.username) {
            return {
              ...s,
              isOnline: true,
              lastActive: Date.now()
            };
          }
          return s;
        });
        const next = { ...prev, users: { ...prev.users, siswas } };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    };

    updateHeartbeat();
    const interval = setInterval(updateHeartbeat, 15000);

    const onActivity = () => updateHeartbeat();
    window.addEventListener('pointerdown', onActivity);
    window.addEventListener('keydown', onActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('keydown', onActivity);
    };
  }, [session]);

  const store = useCallback((role) => {
    const map = { admin: 'admins', guru: 'gurus', siswa: 'siswas' };
    return state.users[map[role]] || [];
  }, [state.users]);

  const own = useCallback(() => {
    if (!session) return null;
    return store(session.role).find(u => u.username === session.username) || null;
  }, [session, store]);

  // Check if a specific student is online/active
  const isStudentOnline = useCallback((username) => {
    const s = state.users.siswas.find(x => x.username === username);
    if (!s) return false;
    const FIVE_MINUTES = 5 * 60 * 1000;
    return !!s.isOnline && (Date.now() - (s.lastActive || 0) < FIVE_MINUTES);
  }, [state.users.siswas]);

  const login = useCallback((role, username, password) => {
    const list = state.users[{ admin: 'admins', guru: 'gurus', siswa: 'siswas' }[role]] || [];
    const user = list.find(u => u.username === username.trim() && u.password === password);
    if (!user) {
      return { success: false, message: 'Username atau password salah, atau akun belum terdaftar sebagai ' + roles[role] + '.' };
    }

    const newSession = { role, username: user.username };
    setSession(newSession);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    } catch {}

    // Record presence if student
    if (role === 'siswa') {
      const siswas = state.users.siswas.map(s => {
        if (s.username === user.username) {
          return {
            ...s,
            isOnline: true,
            lastLogin: new Date().toISOString(),
            lastActive: Date.now()
          };
        }
        return s;
      });
      const next = { ...state, users: { ...state.users, siswas } };
      saveStateToStorage(next);
    }

    setCurrentPage('home');
    return { success: true };
  }, [state, saveStateToStorage]);

  const logout = useCallback(() => {
    if (session && session.role === 'siswa') {
      const siswas = state.users.siswas.map(s => {
        if (s.username === session.username) {
          return {
            ...s,
            isOnline: false,
            lastActive: Date.now()
          };
        }
        return s;
      });
      saveStateToStorage({ ...state, users: { ...state.users, siswas } });
    }
    setSession(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    setCurrentPage('login');
  }, [session, state, saveStateToStorage]);

  const classNames = (text) => String(text || '').split(',').map(v => v.trim()).filter(Boolean);
  const normClass = (name) => name.trim().toLocaleLowerCase('id-ID');

  const studentClasses = useCallback((username) => {
    const rec = state.users.siswas.find(s => s.username === username);
    return [...new Set([
      ...classNames(rec?.kelas),
      ...state.classes.filter(c => c.studentUsernames.includes(username)).map(c => c.name)
    ])];
  }, [state.users.siswas, state.classes]);

  const teacherStudents = useCallback(() => {
    if (session?.role === 'admin') return state.users.siswas;
    const teacher = own();
    if (!teacher) return [];
    const managed = state.classes.filter(c => c.teacherUsername === teacher.username);
    const names = new Set([...classNames(teacher.kelas), ...managed.map(c => c.name)].map(normClass));
    const assigned = new Set(managed.flatMap(c => c.studentUsernames));
    return state.users.siswas.filter(s => assigned.has(s.username) || studentClasses(s.username).some(k => names.has(normClass(k))));
  }, [session, own, state.classes, state.users.siswas, studentClasses]);

  const getProgress = useCallback((u) => {
    return state.progress[u] || { materiRead: [], kpdDone: false, latihanDone: false, evaluasiDone: false };
  }, [state.progress]);

  const getGrades = useCallback((u) => {
    return state.grades[u] || { lkpd: null, latihan: null, evaluasi: null };
  }, [state.grades]);

  const getSubmission = useCallback((u, section) => {
    return state.submissions[u]?.[section] || null;
  }, [state.submissions]);

  const pendingEssays = useCallback((u, section) => {
    return Object.values(getSubmission(u, section)?.essays || {}).some(e => !e.corrected || e.score === null || e.score === undefined || e.score === '');
  }, [getSubmission]);

  const finalGrade = useCallback((u, section) => {
    if (pendingEssays(u, section)) return null;
    const v = getGrades(u)[section];
    return v === null || v === undefined || v === '' ? null : Number(v);
  }, [pendingEssays, getGrades]);

  const allMateriRead = useCallback((u) => {
    return state.materi.length > 0 && state.materi.every(m => getProgress(u).materiRead.includes(m.id));
  }, [state.materi, getProgress]);

  const lkpdPassed = useCallback((u) => {
    const score = finalGrade(u, 'lkpd');
    return getProgress(u).kpdDone && score !== null && score >= state.settings.lkpdPassingGrade;
  }, [finalGrade, getProgress, state.settings.lkpdPassingGrade]);

  const gateReason = useCallback((section, u = session?.username) => {
    if (!u) return 'Silakan login sebagai siswa.';
    if (section === 'lkpd' && !allMateriRead(u)) return 'Baca seluruh materi terlebih dahulu sebelum mengerjakan LKPD.';
    if (section === 'latihan' && !lkpdPassed(u)) {
      if (!getProgress(u).kpdDone) return 'Kirim jawaban LKPD terlebih dahulu. Nilai minimal untuk membuka latihan: ' + state.settings.lkpdPassingGrade + '.';
      if (finalGrade(u, 'lkpd') === null) return 'Nilai LKPD masih menunggu koreksi guru. Latihan terbuka setelah nilai final minimal ' + state.settings.lkpdPassingGrade + '.';
      return 'Nilai LKPD kamu ' + finalGrade(u, 'lkpd') + '. Batas ketuntasan ' + state.settings.lkpdPassingGrade + '. Perbaiki LKPD sebelum membuka latihan.';
    }
    if (section === 'evaluasi' && (!getProgress(u).latihanDone || !lkpdPassed(u))) {
      return 'Tuntaskan LKPD sesuai batas nilai dan selesaikan latihan sebelum evaluasi.';
    }
    return '';
  }, [allMateriRead, lkpdPassed, getProgress, finalGrade, state.settings.lkpdPassingGrade, session]);

  const deadlinePassed = useCallback(() => {
    return !!state.settings.evaluasiDeadline && Date.now() >= new Date(state.settings.evaluasiDeadline).getTime();
  }, [state.settings.evaluasiDeadline]);

  // Revision 2: Admin Teacher Schedule Manager Action
  const updateTeacherSchedule = useCallback((guruUsername, mapel, jadwal) => {
    const gurus = state.users.gurus.map(g => {
      if (g.username === guruUsername) {
        return {
          ...g,
          mapel: mapel.trim(),
          jadwal: jadwal.trim()
        };
      }
      return g;
    });
    const next = { ...state, users: { ...state.users, gurus } };
    saveStateToStorage(next);
    notify('Jadwal pelajaran berhasil diperbarui.');
  }, [state, saveStateToStorage, notify]);

  const value = {
    state,
    setState,
    saveStateToStorage,
    session,
    setSession,
    currentPage,
    setCurrentPage,
    currentMaterialId,
    setCurrentMaterialId,
    editingId,
    setEditingId,
    toastMessage,
    notify,
    store,
    own,
    login,
    logout,
    studentClasses,
    teacherStudents,
    getProgress,
    getGrades,
    getSubmission,
    pendingEssays,
    finalGrade,
    allMateriRead,
    lkpdPassed,
    gateReason,
    deadlinePassed,
    isStudentOnline,
    updateTeacherSchedule
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
