import React, { useState } from 'react';
import {
  Shield, LayoutDashboard, Lock, FileText, Database, Building2, Menu,
  LogOut, Bell, Search, ChevronLeft, FolderPlus, Activity, FileBarChart,
  Settings, X, ArrowRight, Code, Star, Folder
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

  // Toggle Favorite Logic (Direct Click)
  const toggleFavorite = (e: React.MouseEvent, rootId: string, itemId: string, label: string) => {
    e.stopPropagation();

    const isAlreadyFav = favorites.some(f => f.id === itemId);
    if (isAlreadyFav) {
      removeFavorite(itemId);
    } else {
      let view: ViewState = 'DASHBOARD';
      // Logic to map item IDs back to Views
      if (rootId === 'PRISON_ADMIN') view = 'PRISON_ADMIN';
      else if (rootId === 'INVESTIGATIONS') view = 'INVESTIGATIONS';
      else if (rootId === 'INFO_DEPT') view = 'INFO_DEPT';
      else if (rootId === 'MAIN_BRANCH') view = 'MAIN_BRANCH';

      // Correction for specific complex routes
      if (itemId === 'USERS') view = 'USER_MANAGER';
      if (itemId === 'ADD_WANTED') view = 'WANTED_MANAGER';
      if (itemId === 'REPORTS_CENTER') view = 'REPORTS_CENTER';
      if (itemId === 'RELEASE_ORDER') view = 'RELEASE_ORDER';
      if (itemId === 'STORAGE') view = 'STORAGE_CENTER';

      addFavorite({
        id: itemId,
        label: label,
        view: view,
        subView: itemId
      });
    }
  };

  const dept = currentUser?.department;
  const navTree: TreeRoot[] = [];

  // Always show Prison Admin for everyone or based on strict roles
  if (dept === Department.PRISON_ADMIN || dept === Department.GENERAL_ADMIN || true) {
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
            { id: 'NEW_INMATE', label: 'تسجيل نزيل جديد' }
          ]
        },
        {
          id: 'PRISON_OPS',
          label: 'العمليات اليومية',
          icon: Activity,
          items: [
            { id: 'INSPECTION', label: 'الفحص والتفتيش' },
            { id: 'HOUSING', label: 'التسكين وتوزيع العنابر' },
            { id: 'MOVEMENTS', label: 'حركة النزلاء' },
            { id: 'VISITS', label: 'الزيارات' },        // ← هذا السطر الجديد
            { id: 'RELEASE_ORDER', label: 'أوامر الإفراج' }
          ]
        },
        {
          id: 'PRISON_REPORTS',
          label: 'التقارير',
          icon: FileBarChart,
          items: [
            { id: 'REPORTS_CENTER', label: 'تقارير السجن' }
          ]
        }
      ]
    });
  }

  if (dept === Department.INVESTIGATIONS || dept === Department.GENERAL_ADMIN || true) {
    navTree.push({
      id: 'INVESTIGATIONS',
      label: 'إدارة التحقيقات',
      icon: FileText,
      categories: [
        {
          id: 'INV_INPUTS',
          label: 'فتح القضايا',
          icon: FolderPlus,
          items: [
            { id: 'NEW_CASE', label: 'إنشاء قضية جديدة' }
          ]
        },
        {
          id: 'INV_OPS',
          label: 'إجراءات التحقيق',
          icon: Activity,
          items: [
            { id: 'MINUTES', label: 'التحقيق والمحاضر' },
            { id: 'DECISIONS', label: 'القرارات والإحالة' }
          ]
        },
        {
          id: 'INV_REPORTS',
          label: 'التقارير',
          icon: FileBarChart,
          items: [
            { id: 'REPORTS_CENTER', label: 'تقارير التحقيقات' }
          ]
        }
      ]
    });
  }

  if (dept === Department.INFO_DEPT || dept === Department.GENERAL_ADMIN || true) {
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
            { id: 'ADD_SOURCE', label: 'تسجيل مصدر' }
          ]
        },
        {
          id: 'INFO_OPS',
          label: 'المتابعة والتحليل',
          icon: Activity,
          items: [
            { id: 'WANTED_LIST', label: 'قائمة المطلوبين' },
            { id: 'ANALYSIS', label: 'تحليل البيانات' }
          ]
        },
        {
          id: 'INFO_REPORTS',
          label: 'التقارير',
          icon: FileBarChart,
          items: [
            { id: 'REPORTS_CENTER', label: 'تقارير المعلومات' }
          ]
        }
      ]
    });
  }

  if (dept === Department.GENERAL_ADMIN || true) {
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
            { id: 'STORAGE', label: 'مركز التخزين والملفات' }
          ]
        },
        {
          id: 'ADMIN_REPORTS',
          label: 'التقارير المركزية',
          icon: FileBarChart,
          items: [
            { id: 'ALL_REPORTS', label: 'التقارير الموحدة' }
          ]
        }
      ]
    });
  }

  const toggleRoot = (id: string) => {
    setExpandedRoots(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
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

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex overflow-hidden font-sans text-slate-800 dir-rtl">

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 lg:translate-x-0 lg:static lg:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
      >
        <div className="h-full flex flex-col relative">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden absolute top-4 left-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors z-50 shadow-sm"
          >
            <X size={24} />
          </button>

          <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20 text-white">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">نظام الحارس</h1>
                <p className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full w-fit mt-1">
                  v2.1
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            <button
              onClick={() => {
                onNavigate('DASHBOARD');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${
                currentView === 'DASHBOARD'
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard size={20} /> لوحة القيادة
            </button>

            {navTree.map(root => {
              const isRootExpanded = expandedRoots.includes(root.id);
              const isRootActive = currentView === root.id;

              return (
                <div
                  key={root.id}
                  className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm mb-2"
                >
                  <button
                    onClick={() => toggleRoot(root.id)}
                    className={`w-full flex items-center justify-between p-4 font-bold transition-colors ${
                      isRootActive ? 'bg-slate-50 text-primary-700' : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <root.icon
                        size={20}
                        className={isRootActive ? 'text-primary-600' : 'text-slate-400'}
                      />
                      {root.label}
                    </div>
                    <ChevronLeft
                      size={16}
                      className={`transition-transform duration-200 ${
                        isRootExpanded ? '-rotate-90' : ''
                      }`}
                    />
                  </button>

                  {isRootExpanded && (
                    <div className="bg-slate-50/50 border-t border-slate-100">
                      {root.categories.map(cat => {
                        const isCatExpanded = expandedCategories.includes(cat.id);
                        return (
                          <div key={cat.id}>
                            <button
                              onClick={() => toggleCategory(cat.id)}
                              className="w-full flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-primary-600 transition-colors"
                            >
                              <cat.icon size={14} />
                              {cat.label}
                            </button>

                            {isCatExpanded && (
                              <div className="pr-10 pl-4 pb-2 space-y-1">
                                {cat.items.map(item => {
                                  const isFav = favorites.some(f => f.id === item.id);
                                  return (
                                    <div
                                      key={item.id}
                                      className="flex items-center group/item hover:bg-primary-50 rounded-lg pr-2 transition-colors"
                                    >
                                      <button
                                        onClick={() => handleNavigateToItem(root.id, item.id)}
                                        className="flex-1 flex items-center gap-2 py-2 text-sm font-medium text-slate-600 hover:text-primary-700"
                                      >
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/item:bg-primary-500 transition-colors"></div>
                                        {item.label}
                                      </button>
                                      <button
                                        onClick={e => toggleFavorite(e, root.id, item.id, item.label)}
                                        className={`p-1.5 rounded-md hover:bg-slate-200 transition-all ${
                                          isFav
                                            ? 'text-amber-400 opacity-100'
                                            : 'text-slate-300 opacity-0 group-hover/item:opacity-100'
                                        }`}
                                        title={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                                      >
                                        <Star
                                          size={16}
                                          className={isFav ? 'fill-amber-400' : ''}
                                        />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100">
            {/* Developer Console Button */}
            <button
              onClick={() => onNavigate('DEVELOPER_CONSOLE')}
              className="w-full flex items-center gap-2 p-3 mb-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/10"
            >
              <Code size={14} className="text-amber-400" /> وحدة تحكم المطور / قواعد البيانات
            </button>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 mt-3">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser?.avatar}
                  className="w-10 h-10 rounded-full border-2 border-white"
                  alt=""
                />
                <div>
                  <p className="text-sm font-bold text-slate-800 truncate max-w-[120px]">
                    {currentUser?.name}
                  </p>
                  <p className="text-[10px] text-slate-500">{currentUser?.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-300 mt-2">
              v2.1.0 - النظام يعمل محلياً بالكامل
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden lg:mr-80 w-full">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 bg-slate-100 rounded-xl text-slate-600"
              >
                <Menu size={24} />
              </button>
            </div>

            {currentView !== 'DASHBOARD' && (
              <button
                onClick={goBack}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
              >
                <ArrowRight size={20} />
              </button>
            )}

            <h2 className="text-lg font-bold text-slate-800 hidden md:block">
              {currentView === 'DASHBOARD'
                ? 'نظرة عامة'
                : currentView === 'DEVELOPER_CONSOLE'
                ? 'إدارة قواعد البيانات'
                : currentView === 'STORAGE_CENTER'
                ? 'مدير الملفات والتخزين'
                : 'النظام الأمني'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="بحث شامل..."
                className="bg-transparent outline-none text-sm w-40"
              />
            </div>
            <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-primary-600 shadow-sm relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto animate-fadeIn">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
