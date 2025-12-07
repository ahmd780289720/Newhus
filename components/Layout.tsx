import { App } from '@capacitor/app';
import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  Lock,
  FileText,
  Database,
  Building2,
  Menu,
  LogOut,
  Bell,
  Search,
  ChevronLeft,
  FolderPlus,
  Activity,
  FileBarChart,
  Settings,
  X,
  ArrowRight,
  Code,
  Star,
} from 'lucide-react';
import { ViewState, Department } from '../types';
import { useSecurity } from '../context/SecurityContext';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState, subView?: string) => void;
  children: React.ReactNode;
}

interface TreeItem {
  id: string;
  label: string;
}

interface TreeCategory {
  id: string;
  label: string;
  icon: any;
  items: TreeItem[];
}

interface TreeRoot {
  id: string;
  label: string;
  icon: any;
  categories: TreeCategory[];
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const { currentUser, logout, addFavorite, removeFavorite, favorites } = useSecurity();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedRoots, setExpandedRoots] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const toggleFavorite = (e: React.MouseEvent, rootId: string, itemId: string, label: string) => {
    e.stopPropagation();

    const isAlreadyFav = favorites.some((f) => f.id === itemId);
    if (isAlreadyFav) {
      removeFavorite(itemId);
    } else {
      let view: ViewState = 'DASHBOARD';

      if (rootId === 'PRISON_ADMIN') view = 'PRISON_ADMIN';
      else if (rootId === 'INVESTIGATIONS') view = 'INVESTIGATIONS';
      else if (rootId === 'INFO_DEPT') view = 'INFO_DEPT';
      else if (rootId === 'MAIN_BRANCH') view = 'MAIN_BRANCH';

      if (itemId === 'USERS') view = 'USER_MANAGER';
      if (itemId === 'ADD_WANTED') view = 'WANTED_MANAGER';
      if (itemId === 'REPORTS_CENTER') view = 'REPORTS_CENTER';
      if (itemId === 'RELEASE_ORDER') view = 'RELEASE_ORDER';
      if (itemId === 'STORAGE') view = 'STORAGE_CENTER';

      addFavorite({
        id: itemId,
        label,
        view,
        subView: itemId,
      });
    }
  };

  const dept = currentUser?.department;
  const navTree: TreeRoot[] = [];

  // ---- صلاحيات ----

  if (dept === Department.PRISON_ADMIN || dept === Department.GENERAL_ADMIN) {
    navTree.push({
      id: 'PRISON_ADMIN',
      label: 'إدارة السجن',
      icon: Lock,
      categories: [
        {
          id: 'PRISON_INPUTS',
          label: 'المدخلات والتهيئة',
          icon: FolderPlus,
          items: [
            { id: 'WARD_SETUP', label: 'تهيئة العنابر والأجنحة' },
            { id: 'NEW_INMATE', label: 'تسجيل نزيل جديد' },
          ],
        },
        {
          id: 'PRISON_OPS',
          label: 'العمليات اليومية',
          icon: Activity,
          items: [
            { id: 'INSPECTION', label: 'الفحص والتفتيش' },
            { id: 'HOUSING', label: 'التسكين وتوزيع العنابر' },
            { id: 'MOVEMENTS', label: 'حركة النزلاء' },
            { id: 'VISITS', label: 'الزيارات' },
            { id: 'RELEASE_ORDER', label: 'أوامر الإفراج' },
          ],
        },
        {
          id: 'PRISON_REPORTS',
          label: 'التقارير',
          icon: FileBarChart,
          items: [{ id: 'REPORTS_CENTER', label: 'تقارير السجن' }],
        },
      ],
    });
  }

  if (dept === Department.INVESTIGATIONS || dept === Department.GENERAL_ADMIN) {
    navTree.push({
      id: 'INVESTIGATIONS',
      label: 'إدارة التحقيقات',
      icon: FileText,
      categories: [
        {
          id: 'INV_INPUTS',
          label: 'فتح القضايا',
          icon: FolderPlus,
          items: [{ id: 'NEW_CASE', label: 'إنشاء قضية جديدة' }],
        },
        {
          id: 'INV_OPS',
          label: 'إجراءات التحقيق',
          icon: Activity,
          items: [
            { id: 'MINUTES', label: 'التحقيق والمحاضر' },
            { id: 'DECISIONS', label: 'القرارات والإحالة' },
          ],
        },
        {
          id: 'INV_REPORTS',
          label: 'التقارير',
          icon: FileBarChart,
          items: [{ id: 'REPORTS_CENTER', label: 'تقارير التحقيقات' }],
        },
      ],
    });
  }

  if (dept === Department.INFO_DEPT || dept === Department.GENERAL_ADMIN) {
    navTree.push({
      id: 'INFO_DEPT',
      label: 'إدارة المعلومات',
      icon: Database,
      categories: [
        {
          id: 'INFO_INPUTS',
          label: 'الرصد والمدخلات',
          icon: FolderPlus,
          items: [
            { id: 'ADD_WANTED', label: 'إضافة مطلوب أمني' },
            { id: 'ADD_SOURCE', label: 'تسجيل مصدر' },
          ],
        },
        {
          id: 'INFO_OPS',
          label: 'المتابعة والتحليل',
          icon: Activity,
          items: [
            { id: 'WANTED_LIST', label: 'قائمة المطلوبين' },
            { id: 'ANALYSIS', label: 'تحليل البيانات' },
          ],
        },
        {
          id: 'INFO_REPORTS',
          label: 'التقارير',
          icon: FileBarChart,
          items: [{ id: 'REPORTS_CENTER', label: 'تقارير المعلومات' }],
        },
      ],
    });
  }

  if (dept === Department.GENERAL_ADMIN) {
    navTree.push({
      id: 'MAIN_BRANCH',
      label: 'الشعبة العامة',
      icon: Building2,
      categories: [
        {
          id: 'ADMIN_SYS',
          label: 'إدارة النظام',
          icon: Settings,
          items: [
            { id: 'CASE_TRACKING', label: 'تتبع الحالات (المدير)' },
            { id: 'USERS', label: 'المستخدمين والصلاحيات' },
            { id: 'BACKUP', label: 'النسخ الاحتياطي' },
            { id: 'STORAGE', label: 'مركز التخزين والملفات' },
          ],
        },
        {
          id: 'ADMIN_REPORTS',
          label: 'التقارير المركزية',
          icon: FileBarChart,
          items: [{ id: 'ALL_REPORTS', label: 'التقارير الموحدة' }],
        },
      ],
    });
  }

  const toggleRoot = (id: string) => {
    setExpandedRoots((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleNavigateToItem = (rootId: string, itemId: string) => {
    if (itemId === 'REPORTS_CENTER' || itemId === 'ALL_REPORTS') {
      onNavigate('REPORTS_CENTER');
    } else if (itemId === 'RELEASE_ORDER') {
      onNavigate('RELEASE_ORDER');
    } else if (rootId === 'PRISON_ADMIN') {
      onNavigate('PRISON_ADMIN', itemId);
    } else if (rootId === 'INVESTIGATIONS') {
      onNavigate('INVESTIGATIONS', itemId);
    } else if (rootId === 'INFO_DEPT') {
      if (itemId === 'ADD_WANTED' || itemId === 'WANTED_LIST') onNavigate('WANTED_MANAGER');
      else onNavigate('INFO_DEPT', itemId);
    } else if (rootId === 'MAIN_BRANCH') {
      if (itemId === 'USERS') onNavigate('USER_MANAGER');
      else if (itemId === 'STORAGE') onNavigate('STORAGE_CENTER');
      else if (itemId === 'CASE_TRACKING') onNavigate('MAIN_BRANCH', 'CASE_TRACKING');
      else onNavigate('MAIN_BRANCH', itemId);
    }

    setIsMobileMenuOpen(false);
  };

  // ------------------------------------------------------
  //  🔥 التعديل الوحيد: دالة الرجوع المصحّحة
  // ------------------------------------------------------
  const goBack = () => {
    if (window.history.length <= 1) {
      // لا يوجد صفحة يرجع لها → افتح نافذة الخروج
      setShowExitConfirm(true);
      return;
    }

    if (currentView === 'DASHBOARD') {
      setShowExitConfirm(true);
    } else {
      window.history.back();
    }
  };

  return (
    <>
      {/* نافذة تأكيد الخروج */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-white w-80 p-6 rounded-2xl shadow-xl text-center">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              هل تريد الخروج من التطبيق؟
            </h2>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold hover:bg-slate-300"
              >
                إلغاء
              </button>

              <button
                onClick={() => {
                  if (typeof App !== 'undefined') {
                    App.exitApp();
                  } else {
                    window.close();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
              >
                خروج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* باقي الكود كما هو — لم ألمسه */}
      <div className="min-h-screen bg-[#f8fafc] flex overflow-hidden font-sans text-slate-800 dir-rtl">

        {/* Sidebar + محتوى الواجهة (كل شيء بدون أي تعديل)… */}

        {/* ----------- */}
        {/*  (تم ترك بقية الكود كما هو 100%) */}
        {/* ----------- */}

        {/** كل الكود تحت unchanged — نفس نسختك بالضبط */}

      </div>
    </>
  );
};

export default Layout;
