import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Inmate,
  InspectionRecord,
  Case,
  InmateStatus,
  Ward,
  InvestigationMinute,
  WantedPerson,
  Movement,
  BehaviorReport,
  User,
  AuditLog,
  UserRole,
  Department,
  FavoriteItem,
} from '../types';
import { SQLiteService, CollectionKey } from '../src/database/SQLiteService';

interface SecurityContextType {
  // Auth
  currentUser: User | null;
  users: User[];
  login: (name: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;

  // Data
  inmates: Inmate[];
  inspections: InspectionRecord[];
  wards: Ward[];
  cases: Case[];
  minutes: InvestigationMinute[];
  wantedPersons: WantedPerson[];
  movements: Movement[];
  reports: BehaviorReport[];
  auditLogs: AuditLog[];
  departments: Department[];
  favorites: FavoriteItem[];

  // Actions
  addInmate: (inmate: Inmate) => void;
  updateInmate: (inmate: Inmate) => void;
  deleteInmate: (inmateId: string) => void;

  addInspection: (inspection: InspectionRecord) => void;
  updateInmateStatus: (id: string, status: InmateStatus) => void;
  assignWard: (inmateId: string, wardId: string) => void;
  addWard: (ward: Ward) => void;

  // Investigation Actions
  addCase: (newCase: Case) => void;
  addMinute: (minute: InvestigationMinute) => void;

  addWantedPerson: (person: WantedPerson) => void;
  updateWantedPersonStatus: (id: string, status: WantedPerson['status']) => void;
  deleteWantedPerson: (id: string) => void;

  addMovement: (movement: Movement) => void;
  updateMovement: (movement: Movement) => void;

  // Favorites
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;

  // System
  createBackup: () => void;
  parseBackupFile: (file: File) => Promise<any>;
  restoreData: (data: any) => void;
  resetSystem: () => void;
  requestPersistentStorage: () => Promise<boolean>;

  // Dev Console
  updateRawData: (key: string, data: any[]) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const DEFAULT_ADMIN_USER: User = {
  id: 'admin',
  name: 'admin',
  role: UserRole.ADMIN,
  department: Department.GENERAL_ADMIN,
  avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
  password: '123',
};

const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return defaultValue;
    const parsed = JSON.parse(saved);
    // Safety check: ensure arrays stay arrays
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      return defaultValue;
    }
    return parsed;
  } catch (e) {
    console.error('Error loading', key, e);
    return defaultValue;
  }
};

// الحفظ في localStorage + SQLite
const saveToStorage = (key: string, data: any) => {
  // 1) نحفظ في localStorage (متوافق مع الكود القديم، وللسرعة في الواجهة)
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e: any) {
    console.error('Storage Save Error', e);
    alert('تحذير: مساحة التخزين ممتلئة، قد لا يتم حفظ البيانات الجديدة!');
  }

  // 2) نحفظ نفس البيانات في SQLite كمصدر رئيسي طويل الأمد
  if (key.startsWith('sec_sys_')) {
    SQLiteService
      .upsertCollection(key as CollectionKey, data)
      .catch((err) => {
        console.error('SQLite Save Error', err);
      });
  }
};

const toBase64 = (str: string) => window.btoa(unescape(encodeURIComponent(str)));
const fromBase64 = (str: string) => decodeURIComponent(escape(window.atob(str)));

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() =>
    loadFromStorage('sec_sys_users_list', [DEFAULT_ADMIN_USER]),
  );
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadFromStorage('sec_sys_user', null),
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadFromStorage('sec_sys_logs', []),
  );
  const [inmates, setInmates] = useState<Inmate[]>(() =>
    loadFromStorage('sec_sys_inmates', []),
  );
  const [inspections, setInspections] = useState<InspectionRecord[]>(() =>
    loadFromStorage('sec_sys_inspections', []),
  );
  const [wards, setWards] = useState<Ward[]>(() =>
    loadFromStorage('sec_sys_wards', []),
  );
  const [cases, setCases] = useState<Case[]>(() =>
    loadFromStorage('sec_sys_cases', []),
  );
  const [minutes, setMinutes] = useState<InvestigationMinute[]>(() =>
    loadFromStorage('sec_sys_minutes', []),
  );
  const [wantedPersons, setWantedPersons] = useState<WantedPerson[]>(() =>
    loadFromStorage('sec_sys_wanted', []),
  );
  const [movements, setMovements] = useState<Movement[]>(() =>
    loadFromStorage('sec_sys_movements', []),
  );
  const [reports, setReports] = useState<BehaviorReport[]>(() =>
    loadFromStorage('sec_sys_reports', []),
  );
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() =>
    loadFromStorage('sec_sys_favorites', []),
  );

  // --- PERSISTENCE EFFECT HOOKS (Backup) ---
  // While we use synchronous saving in functions, these hooks act as a safety net
  useEffect(() => saveToStorage('sec_sys_inmates', inmates), [inmates]);
  useEffect(() => saveToStorage('sec_sys_inspections', inspections), [inspections]);
  useEffect(() => saveToStorage('sec_sys_wards', wards), [wards]);
  useEffect(() => saveToStorage('sec_sys_cases', cases), [cases]);
  useEffect(() => saveToStorage('sec_sys_minutes', minutes), [minutes]);
  useEffect(() => saveToStorage('sec_sys_wanted', wantedPersons), [wantedPersons]);
  useEffect(() => saveToStorage('sec_sys_movements', movements), [movements]);
  useEffect(() => saveToStorage('sec_sys_reports', reports), [reports]);
  useEffect(() => saveToStorage('sec_sys_users_list', users), [users]);
  useEffect(() => saveToStorage('sec_sys_logs', auditLogs), [auditLogs]);
  useEffect(() => saveToStorage('sec_sys_favorites', favorites), [favorites]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('sec_sys_user', JSON.stringify(currentUser));
    else localStorage.removeItem('sec_sys_user');
  }, [currentUser]);

  const requestPersistentStorage = async (): Promise<boolean> => {
    if (navigator.storage && navigator.storage.persist) {
      return await navigator.storage.persist();
    }
    return false;
  };

  const logAction = (action: AuditLog['action'], target: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      target,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const login = (name: string, password: string): boolean => {
    const user = users.find((u) => u.name === name && u.password === password);
    if (user) {
      setCurrentUser(user);
      logAction('LOGIN', 'تم تسجيل الدخول');
      return true;
    }
    return false;
  };

  const logout = () => {
    logAction('LOGOUT', 'تم تسجيل الخروج');
    setCurrentUser(null);
  };

  // --- ATOMIC SAVE FUNCTIONS ---
  const addUser = (user: User) => {
    setUsers((prev) => {
      const updated = [...prev, user];
      saveToStorage('sec_sys_users_list', updated);
      return updated;
    });
    logAction('CREATE', `إضافة مستخدم جديد: ${user.name}`);
  };

  const updateUser = (user: User) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === user.id ? user : u));
      saveToStorage('sec_sys_users_list', updated);
      return updated;
    });
    logAction('UPDATE', `تعديل بيانات المستخدم: ${user.name}`);
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => {
      const user = prev.find((u) => u.id === userId);
      const updated = prev.filter((u) => u.id !== userId);
      saveToStorage('sec_sys_users_list', updated);
      if (user) {
        logAction('DELETE', `حذف المستخدم: ${user.name}`);
      }
      return updated;
    });
  };

  const addInmate = (inmate: Inmate) => {
    setInmates((prev) => {
      const updated = [...prev, inmate];
      saveToStorage('sec_sys_inmates', updated);
      return updated;
    });
    logAction('CREATE', `إضافة نزيل: ${inmate.name}`);
  };

  const updateInmate = (inmate: Inmate) => {
    setInmates((prev) => {
      const updated = prev.map((i) => (i.id === inmate.id ? inmate : i));
      saveToStorage('sec_sys_inmates', updated);
      return updated;
    });
    logAction('UPDATE', `تعديل بيانات النزيل: ${inmate.name}`);
  };

  const deleteInmate = (inmateId: string) => {
    setInmates((prev) => {
      const inmate = prev.find((i) => i.id === inmateId);
      const updated = prev.filter((i) => i.id !== inmateId);
      saveToStorage('sec_sys_inmates', updated);
      if (inmate) {
        logAction('DELETE', `حذف النزيل: ${inmate.name}`);
      }
      return updated;
    });
  };

  const addInspection = (inspection: InspectionRecord) => {
    setInspections((prev) => {
      const updated = [...prev, inspection];
      saveToStorage('sec_sys_inspections', updated);
      return updated;
    });
    logAction('CREATE', `تسجيل تفتيش بتاريخ ${inspection.date}`);
  };

  const updateInmateStatus = (id: string, status: InmateStatus) => {
    setInmates((prev) => {
      const updated = prev.map((i) => (i.id === id ? { ...i, status } : i));
      saveToStorage('sec_sys_inmates', updated);
      return updated;
    });
    logAction('UPDATE', `تغيير حالة النزيل رقم: ${id} إلى ${status}`);
  };

  const assignWard = (inmateId: string, wardId: string) => {
    setInmates((prev) => {
      const updated = prev.map((i) => (i.id === inmateId ? { ...i, wardId } : i));
      saveToStorage('sec_sys_inmates', updated);
      return updated;
    });
    logAction('UPDATE', `تخصيص عنبر للنزيل رقم: ${inmateId}`);
  };

  const addWard = (ward: Ward) => {
    setWards((prev) => {
      const updated = [...prev, ward];
      saveToStorage('sec_sys_wards', updated);
      return updated;
    });
    logAction('CREATE', `إضافة عنبر: ${ward.name}`);
  };

  const addCase = (newCase: Case) => {
    setCases((prev) => {
      const updated = [...prev, newCase];
      saveToStorage('sec_sys_cases', updated);
      return updated;
    });
    logAction('CREATE', `تسجيل قضية جديدة للنزيل رقم: ${newCase.inmateId}`);
  };

  const addMinute = (minute: InvestigationMinute) => {
    setMinutes((prev) => {
      const updated = [...prev, minute];
      saveToStorage('sec_sys_minutes', updated);
      return updated;
    });
    logAction('CREATE', `إضافة محضر تحقيق رقم: ${minute.id}`);
  };

  const addWantedPerson = (person: WantedPerson) => {
    setWantedPersons((prev) => {
      const updated = [...prev, person];
      saveToStorage('sec_sys_wanted', updated);
      return updated;
    });
    logAction('CREATE', `إضافة مطلوب أمني: ${person.name}`);
  };

  const updateWantedPersonStatus = (id: string, status: WantedPerson['status']) => {
    setWantedPersons((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, status } : p));
      saveToStorage('sec_sys_wanted', updated);
      return updated;
    });
    logAction('UPDATE', `تغيير حالة المطلوب رقم: ${id} إلى ${status}`);
  };

  const deleteWantedPerson = (id: string) => {
    setWantedPersons((prev) => {
      const person = prev.find((p) => p.id === id);
      const updated = prev.filter((p) => p.id !== id);
      saveToStorage('sec_sys_wanted', updated);
      if (person) {
        logAction('DELETE', `حذف المطلوب الأمني: ${person.name}`);
      }
      return updated;
    });
  };

  const addMovement = (movement: Movement) => {
    setMovements((prev) => {
      const updated = [...prev, movement];
      saveToStorage('sec_sys_movements', updated);
      return updated;
    });
    logAction('CREATE', `تسجيل حركة للنزيل رقم: ${movement.inmateId}`);
  };

  const updateMovement = (movement: Movement) => {
    setMovements((prev) => {
      const updated = prev.map((m) => (m.id === movement.id ? movement : m));
      saveToStorage('sec_sys_movements', updated);
      return updated;
    });
    logAction('UPDATE', `تعديل حركة للنزيل رقم: ${movement.inmateId}`);
  };

  const addFavorite = (item: FavoriteItem) => {
    setFavorites((prev) => {
      const updated = [...prev, item];
      saveToStorage('sec_sys_favorites', updated);
      return updated;
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      saveToStorage('sec_sys_favorites', updated);
      return updated;
    });
  };

  const createBackup = () => {
    const data = {
      users,
      inmates,
      inspections,
      wards,
      cases,
      minutes,
      wantedPersons,
      movements,
      reports,
      auditLogs,
      favorites,
      version: 1,
      createdAt: new Date().toISOString(),
    };

    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security_system_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    alert('تم إنشاء نسخة احتياطية بنجاح');
  };

  const parseBackupFile = async (file: File): Promise<any> => {
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      return data;
    } catch (e) {
      alert('ملف النسخة الاحتياطية غير صالح');
      throw e;
    }
  };

  const restoreData = (data: any) => {
    if (!window.confirm('سيتم استبدال كل البيانات الحالية بالنسخة الاحتياطية، هل أنت متأكد؟')) {
      return;
    }

    setUsers(data.users || []);
    setInmates(data.inmates || []);
    setInspections(data.inspections || []);
    setWards(data.wards || []);
    setCases(data.cases || []);
    setMinutes(data.minutes || []);
    setWantedPersons(data.wantedPersons || []);
    setMovements(data.movements || []);
    setReports(data.reports || []);
    setAuditLogs(data.auditLogs || []);
    setFavorites(data.favorites || []);

    saveToStorage('sec_sys_users_list', data.users || []);
    saveToStorage('sec_sys_inmates', data.inmates || []);
    saveToStorage('sec_sys_inspections', data.inspections || []);
    saveToStorage('sec_sys_wards', data.wards || []);
    saveToStorage('sec_sys_cases', data.cases || []);
    saveToStorage('sec_sys_minutes', data.minutes || []);
    saveToStorage('sec_sys_wanted', data.wantedPersons || []);
    saveToStorage('sec_sys_movements', data.movements || []);
    saveToStorage('sec_sys_reports', data.reports || []);
    saveToStorage('sec_sys_logs', data.auditLogs || []);
    saveToStorage('sec_sys_favorites', data.favorites || []);

    alert('تم استعادة البيانات بنجاح');
  };

  const resetSystem = () => {
    if (
      !window.confirm(
        'تحذير: سيتم حذف كل البيانات وإعادة النظام لحالته الافتراضية، هل أنت متأكد؟',
      )
    ) {
      return;
    }

    const initialUsers = [DEFAULT_ADMIN_USER];

    setUsers(initialUsers);
    setCurrentUser(null);
    setAuditLogs([]);
    setInmates([]);
    setInspections([]);
    setWards([]);
    setCases([]);
    setMinutes([]);
    setWantedPersons([]);
    setMovements([]);
    setReports([]);
    setFavorites([]);

    saveToStorage('sec_sys_users_list', initialUsers);
    saveToStorage('sec_sys_inmates', []);
    saveToStorage('sec_sys_inspections', []);
    saveToStorage('sec_sys_wards', []);
    saveToStorage('sec_sys_cases', []);
    saveToStorage('sec_sys_minutes', []);
    saveToStorage('sec_sys_wanted', []);
    saveToStorage('sec_sys_movements', []);
    saveToStorage('sec_sys_reports', []);
    saveToStorage('sec_sys_logs', []);
    saveToStorage('sec_sys_favorites', []);

    alert('تمت إعادة تهيئة النظام. بيانات الدخول: admin / 123');
  };

  // Dev helper لتعديل الداتا الخام
  const updateRawData = (key: string, data: any[]) => {
    switch (key) {
      case 'sec_sys_users_list':
        setUsers(data as User[]);
        break;
      case 'sec_sys_inmates':
        setInmates(data as Inmate[]);
        break;
      case 'sec_sys_inspections':
        setInspections(data as InspectionRecord[]);
        break;
      case 'sec_sys_wards':
        setWards(data as Ward[]);
        break;
      case 'sec_sys_cases':
        setCases(data as Case[]);
        break;
      case 'sec_sys_minutes':
        setMinutes(data as InvestigationMinute[]);
        break;
      case 'sec_sys_wanted':
        setWantedPersons(data as WantedPerson[]);
        break;
      case 'sec_sys_movements':
        setMovements(data as Movement[]);
        break;
      case 'sec_sys_reports':
        setReports(data as BehaviorReport[]);
        break;
      case 'sec_sys_logs':
        setAuditLogs(data as AuditLog[]);
        break;
      case 'sec_sys_favorites':
        setFavorites(data as FavoriteItem[]);
        break;
      default:
        console.warn('Unknown key for updateRawData', key);
    }
    saveToStorage(key, data);
  };

  return (
    <SecurityContext.Provider
      value={{
        currentUser,
        users,
        inmates,
        inspections,
        wards,
        cases,
        minutes,
        wantedPersons,
        movements,
        reports,
        auditLogs,
        favorites,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        addInmate,
        updateInmate,
        deleteInmate,
        addInspection,
        updateInmateStatus,
        assignWard,
        addWard,
        addCase,
        addMinute,
        addWantedPerson,
        updateWantedPersonStatus,
        deleteWantedPerson,
        addMovement,
        updateMovement,
        addFavorite,
        removeFavorite,
        createBackup,
        parseBackupFile,
        restoreData,
        resetSystem,
        requestPersistentStorage,
        updateRawData,
        departments: Object.values(Department),
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
