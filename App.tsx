import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import ReportsCenter from "./components/ReportsCenter";
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
import StorageManager from './components/SyncManager';
import UserManager from './components/UserManager';
import InmateProfileModal from './components/InmateProfileModal';
import ReleaseOrder from './components/ReleaseOrder';
import DeveloperConsole from './components/DeveloperConsole';
import ErrorBoundary from './components/ErrorBoundary';

import { ViewState } from './types';
import { useSecurity } from './context/SecurityContext';

// 🔥 إضافة ToastProvider هنا
import { ToastProvider } from './src/context/ToastContext';

const App: React.FC = () => {
  const { currentUser } = useSecurity();

  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [subView, setSubView] = useState<string | undefined>(undefined);
  const [selectedInmateId, setSelectedInmateId] = useState<string | null>(null);

  // تشغيل SQLite
  useEffect(() => {
    SQLiteService.getInstance();
  }, []);

  // ================================
  // 👇 زر الرجوع الخاص بأندرويد
  // ================================
  useEffect(() => {
    const backHandler = CapacitorApp.addListener('backButton', () => {
      if (currentView === 'DASHBOARD') {
        window.dispatchEvent(new CustomEvent('show-exit-dialog'));
      } else {
        window.history.back();
      }
    });

    return () => backHandler.remove();
  }, [currentView]);

  // ================================
  // دعم التنقل عبر popstate
  // ================================
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
        setSubView(event.state.subView);
      } else {
        setCurrentView('DASHBOARD');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ================================
  // شاشة تسجيل الدخول
  // ================================
  if (!currentUser) {
    return (
      <ToastProvider>
        <LoginScreen />
      </ToastProvider>
    );
  }

  // ================================
  // دوال التنقل
  // ================================
  const handleShowProfile = (inmateId: string) => {
    setSelectedInmateId(inmateId);
  };

  const handleNavigate = (view: ViewState, sub?: string) => {
    window.history.pushState({ view, subView: sub }, '', '');
    setCurrentView(view);
    setSubView(sub);
  };

  // ================================
  // اختيار الشاشة المناسبة
  // ================================
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
  return <ReportsCenter onNavigate={handleNavigate} />;
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

  // ================================
  // الواجهة النهائية
  // ================================
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Layout currentView={currentView} onNavigate={handleNavigate}>
          <div className="animate-fadeIn pb-10">{renderView()}</div>

          {selectedInmateId && (
            <InmateProfileModal
              inmateId={selectedInmateId}
              onClose={() => setSelectedInmateId(null)}
            />
          )}
        </Layout>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
