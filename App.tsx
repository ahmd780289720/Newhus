import { App as CapacitorApp } from '@capacitor/app';
import React, { useState, useEffect } from 'react';
import { SQLiteService } from './src/database/SQLiteService';
import Layout from './components/Layout';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import PrisonAdministration from './components/PrisonAdministration';
import Investigations from './components/Investigations';
import InformationDept from './components/InformationDept';
import MainBranch from './components/MainBranch';
import WantedManager from './components/WantedManager';
import ReportsManager from './components/ReportsManager';
import StorageManager from './components/SyncManager'; // Updated Import
import UserManager from './components/UserManager';
import InmateProfileModal from './components/InmateProfileModal';
import ReleaseOrder from './components/ReleaseOrder';
import DeveloperConsole from './components/DeveloperConsole'; // Import
import ErrorBoundary from './components/ErrorBoundary'; // Import
import { ViewState } from './types';
import { useSecurity } from './context/SecurityContext';

const App: React.FC = () => {
  // تهيئة قاعدة البيانات
  useEffect(() => {
    SQLiteService.getInstance();
  }, []);

  // دالة اختبار (كما هي)
  const testInsert = async () => {
    const db = await SQLiteService.getInstance();
    await db.run('INSERT INTO departments (id, name) VALUES (?, ?)', ['dep-1', 'Main Department']);
    alert('تم الإدخال بنجاح');
  };

  const { currentUser } = useSecurity();
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [subView, setSubView] = useState<string | undefined>(undefined);
  const [selectedInmateId, setSelectedInmateId] = useState<string | null>(null);

  // ================================
  // التحكم بزِر الرجوع في المتصفح (popstate)
  // ================================
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
        setSubView(event.state.subView);
      } else {
        setCurrentView('DASHBOARD');
        setSubView(undefined);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ================================
  // زر الرجوع في أندرويد (Capacitor)
  // ================================
  useEffect(() => {
    const backHandler = CapacitorApp.addListener('backButton', () => {
      if (currentView === 'DASHBOARD') {
        // نرسل حدث لـ Layout عشان يفتح نافذة تأكيد الخروج
        window.dispatchEvent(new CustomEvent('show-exit-dialog'));
      } else {
        window.history.back();
      }
    });

    return () => {
      backHandler.remove();
    };
  }, [currentView]);

  // لو مافيش مستخدم مسجّل دخول → شاشة الدخول
  if (!currentUser) {
    return <LoginScreen />;
  }

  const handleShowProfile = (inmateId: string) => {
    setSelectedInmateId(inmateId);
  };

  const handleNavigate = (view: ViewState, sub?: string) => {
    window.history.pushState({ view, subView: sub }, '', '');
    setCurrentView(view);
    setSubView(sub);
  };

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onShowProfile={handleShowProfile}
          />
        );
      case 'PRISON_ADMIN':
        return (
          <PrisonAdministration
            onShowProfile={handleShowProfile}
            initialTab={subView}
          />
        );
      case 'INVESTIGATIONS':
        return (
          <Investigations
            onShowProfile={handleShowProfile}
            initialTab={subView}
          />
        );
      case 'INFO_DEPT':
        return <InformationDept initialTab={subView} />;
      case 'MAIN_BRANCH':
        return <MainBranch initialTab={subView} />;
      case 'WANTED_MANAGER':
        return <WantedManager />;
      case 'REPORTS_CENTER':
        return <ReportsManager onNavigate={handleNavigate} />;
      case 'STORAGE_CENTER':
        return <StorageManager />;
      case 'USER_MANAGER':
        return <UserManager />;
      case 'RELEASE_ORDER':
        return <ReleaseOrder />;
      case 'DEVELOPER_CONSOLE':
        return <DeveloperConsole />;
      default:
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onShowProfile={handleShowProfile}
          />
        );
    }
  };

  return (
    <ErrorBoundary>
      <Layout currentView={currentView} onNavigate={handleNavigate}>
        <div className="animate-fadeIn pb-10">
          {renderView()}
        </div>

        {selectedInmateId && (
          <InmateProfileModal
            inmateId={selectedInmateId}
            onClose={() => setSelectedInmateId(null)}
          />
        )}
      </Layout>
    </ErrorBoundary>
  );
};

export default App;
