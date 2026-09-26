import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

// Common Components
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';

// Auth
import AuthPage from './pages/auth/AuthPage';

// Student
import StudentHome from './pages/student/StudentHome';
import MaterialList from './pages/student/MaterialList';
import MaterialDetail from './pages/student/MaterialDetail';
import AssessmentPage from './pages/student/AssessmentPage';
import ResultPage from './pages/student/ResultPage';
import AboutPage from './pages/student/AboutPage';

// Teacher
import TeacherHome from './pages/teacher/TeacherHome';
import MaterialEditor from './pages/teacher/MaterialEditor';
import QuestionEditor from './pages/teacher/QuestionEditor';
import GradesPage from './pages/teacher/GradesPage';
import ScheduleView from './pages/teacher/ScheduleView';
import DetectionPage from './pages/teacher/DetectionPage';
import CorrectionPage from './pages/teacher/CorrectionPage';

// Admin
import AdminHome from './pages/admin/AdminHome';
import ScheduleAdminPage from './pages/admin/ScheduleAdminPage';
import ClassEditor from './pages/admin/ClassEditor';
import UserEditor from './pages/admin/UserEditor';
import UsersPage from './pages/admin/UsersPage';

// Common Page
import ProfilePage from './pages/common/ProfilePage';

export default function App() {
  const { session, currentPage, setCurrentPage } = useApp();
  const [editingUserParams, setEditingUserParams] = useState(null);

  const ambientOrbs = (
    <div className="glass-ambient-container" aria-hidden="true">
      <div className="glass-orb glass-orb-1" />
      <div className="glass-orb glass-orb-2" />
      <div className="glass-orb glass-orb-3" />
      <div className="glass-orb glass-orb-4" />
    </div>
  );

  if (!session) {
    return (
      <>
        {ambientOrbs}
        <AuthPage />
        <Toast />
      </>
    );
  }

  const handleEditUser = (role, username) => {
    setEditingUserParams({ role, username });
    setCurrentPage(role === 'guru' ? 'guru-editor' : 'siswa-editor');
  };

  const renderContent = () => {
    switch (currentPage) {
      // Common Home
      case 'home':
        if (session.role === 'siswa') return <StudentHome />;
        if (session.role === 'guru') return <TeacherHome />;
        return <AdminHome />;

      // Student Pages
      case 'materi':
        return <MaterialList />;
      case 'materi-detail':
        return <MaterialDetail />;
      case 'lkpd':
        return <AssessmentPage section="lkpd" />;
      case 'latihan':
        return <AssessmentPage section="latihan" />;
      case 'evaluasi':
        return <AssessmentPage section="evaluasi" />;
      case 'result':
        return <ResultPage />;
      case 'tentang':
        return <AboutPage />;

      // Teacher Pages
      case 'materi-editor':
        return <MaterialEditor />;
      case 'kpd-editor':
        return <QuestionEditor sectionKey="kpd" />;
      case 'latihan-editor':
        return <QuestionEditor sectionKey="latihan" />;
      case 'evaluasi-editor':
        return <QuestionEditor sectionKey="evaluasi" />;
      case 'nilai':
        return <GradesPage />;
      case 'jadwal':
        return <ScheduleView />;
      case 'koreksi':
        return <CorrectionPage />;

      // Admin Pages
      case 'jadwal-admin':
        return <ScheduleAdminPage />;
      case 'kelas':
        return <ClassEditor />;
      case 'siswa-editor':
        return (
          <UserEditor
            role="siswa"
            editUsername={editingUserParams?.role === 'siswa' ? editingUserParams.username : null}
            onFinished={() => {
              setEditingUserParams(null);
              setCurrentPage('users');
            }}
          />
        );
      case 'guru-editor':
        return (
          <UserEditor
            role="guru"
            editUsername={editingUserParams?.role === 'guru' ? editingUserParams.username : null}
            onFinished={() => {
              setEditingUserParams(null);
              setCurrentPage('users');
            }}
          />
        );
      case 'users':
        return <UsersPage onEditUser={handleEditUser} />;

      // Shared Monitoring & Profile
      case 'deteksi':
        return <DetectionPage />;
      case 'profile':
        return <ProfilePage />;

      default:
        return <StudentHome />;
    }
  };

  return (
    <>
      {ambientOrbs}
      <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="foot">
          ElearnMath &middot; Media Pembelajaran Matematika Interaktif
          <br />
          Data tersimpan secara lokal pada peramban ini.
        </footer>
      </div>
      <Toast />
    </div>
    </>
  );
}
