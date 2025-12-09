import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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
  Visit,
} from "../types";

import {
  SQLiteService,
  CollectionKey,
} from "../src/database/SQLiteService";

// ======================================================
// ✅ تعريف نوع الكونتكست – كامل بكل الدوال
// ======================================================
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
  visits: Visit[];
  reports: BehaviorReport[];
  auditLogs: AuditLog[];
  departments: Department[];
  favorites: FavoriteItem[];

  // Inmates
  addInmate: (inmate: Inmate) => void;
  updateInmate: (inmate: Inmate) => void;
  deleteInmate: (inmateId: string) => void;

  // Inspection
  addInspection: (inspection: InspectionRecord) => void;
  updateInmateStatus: (id: string, status: InmateStatus) => void;

  // Wards
  assignWard: (inmateId: string, wardId: string) => void;
  addWard: (ward: Ward) => void;

  // Investigation
  addCase: (newCase: Case) => void;
  addMinute: (minute: InvestigationMinute) => void;

  // Wanted
  addWantedPerson: (person: WantedPerson) => void;
  updateWantedPersonStatus: (id: string, status: WantedPerson["status"]) => void;
  deleteWantedPerson: (id: string) => void;

  // Movements
  addMovement: (movement: Movement) => void;
  updateMovement: (movement: Movement) => void;

  // Visits
  addVisit: (visit: Visit) => void;
  updateVisit: (visit: Visit) => void;
  deleteVisit: (id: string) => void;

  // Favorites
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;

  // System / Backup
  createBackup: () => void;
  parseBackupFile: (file: File) => Promise<any>;
  restoreData: (data: any) => void;
  resetSystem: () => void;
  requestPersistentStorage: () => Promise<boolean>;

  // Dev Console
  updateRawData: (key: CollectionKey, data: any[]) => void;
}

// ======================================================
// ✅ مستخدم افتراضي
// ======================================================
const DEFAULT_ADMIN_USER: User = {
  id: "admin",
  name: "admin",
  role: UserRole.ADMIN,
  department: Department.GENERAL_ADMIN,
  avatar:
    "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff",
  password: "123",
};

// ======================================================
// ✅ التخزين – الآن SQLite فقط (لا localStorage)
// ======================================================
const saveToStorage = (key: CollectionKey, data: any) => {
  // نحفظ في SQLite كمصدر أساسي
  SQLiteService.upsertCollection(key, data).catch((err) => {
    console.error("SQLite Save Error:", err);
    alert("خطأ في حفظ البيانات داخل SQLite!");
  });
};

const SecurityContext = createContext<SecurityContextType | undefined>(
  undefined
);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Auth
  const [users, setUsers] = useState<User[]>([DEFAULT_ADMIN_USER]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Main Data
  const [inmates, setInmates] = useState<Inmate[]>([]);
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [minutes, setMinutes] = useState<InvestigationMinute[]>([]);
  const [wantedPersons, setWantedPersons] = useState<WantedPerson[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [reports, setReports] = useState<BehaviorReport[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // ======================================================
  // ✅ تحميل البيانات من SQLite عند تشغيل النظام
  // ======================================================
  useEffect(() => {
    (async () => {
      try {
        const [
          usersFromDb,
          inmatesFromDb,
          inspectionsFromDb,
          wardsFromDb,
          casesFromDb,
          minutesFromDb,
          wantedFromDb,
          movementsFromDb,
          visitsFromDb,
          reportsFromDb,
          logsFromDb,
          favoritesFromDb,
        ] = await Promise.all([
          SQLiteService.getCollection<User>(
            "sec_sys_users_list",
            [DEFAULT_ADMIN_USER]
          ),
          SQLiteService.getCollection<Inmate>("sec_sys_inmates", []),
          SQLiteService.getCollection<InspectionRecord>(
            "sec_sys_inspections",
            []
          ),
          SQLiteService.getCollection<Ward>("sec_sys_wards", []),
          SQLiteService.getCollection<Case>("sec_sys_cases", []),
          SQLiteService.getCollection<InvestigationMinute>(
            "sec_sys_minutes",
            []
          ),
          SQLiteService.getCollection<WantedPerson>("sec_sys_wanted", []),
          SQLiteService.getCollection<Movement>("sec_sys_movements", []),
          SQLiteService.getCollection<Visit>("sec_sys_visits", []),
          SQLiteService.getCollection<BehaviorReport>("sec_sys_reports", []),
          SQLiteService.getCollection<AuditLog>("sec_sys_logs", []),
          SQLiteService.getCollection<FavoriteItem>("sec_sys_favorites", []),
        ]);

        // لو ما فيه ولا مستخدم – نضيف الأدمن ونحفظه
        if (!usersFromDb || usersFromDb.length === 0) {
          setUsers([DEFAULT_ADMIN_USER]);
          saveToStorage("sec_sys_users_list", [DEFAULT_ADMIN_USER]);
        } else {
          setUsers(usersFromDb);
        }

        setInmates(inmatesFromDb);
        setInspections(inspectionsFromDb);
        setWards(wardsFromDb);
        setCases(casesFromDb);
        setMinutes(minutesFromDb);
        setWantedPersons(wantedFromDb);
        setMovements(movementsFromDb);
        setVisits(visitsFromDb);
        setReports(reportsFromDb);
        setAuditLogs(logsFromDb);
        setFavorites(favoritesFromDb);
      } catch (err) {
        console.error("Initial SQLite Load Error:", err);
        alert("تعذر تحميل البيانات من قاعدة SQLite!");
      }
    })();
  }, []);

  // ======================================================
  // ✅ الطلب من المتصفح حفظ البيانات (Storage Persist)
  // ======================================================
  const requestPersistentStorage = async (): Promise<boolean> => {
    if (navigator.storage && navigator.storage.persist) {
      try {
        return await navigator.storage.persist();
      } catch {
        return false;
      }
    }
    return false;
  };

  // ======================================================
  // ✅ سجل العمليات (Audit Log)
  // ======================================================
  const logAction = (action: AuditLog["action"], target: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      target,
      timestamp: new Date().toISOString(),
    };

    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      saveToStorage("sec_sys_logs", updated);
      return updated;
    });
  };

  // ======================================================
  // ✅ Auth
  // ======================================================
  const login = (name: string, password: string): boolean => {
    const user = users.find(
      (u) => u.name === name && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      logAction("LOGIN", "تم تسجيل الدخول");
      return true;
    }
    return false;
  };

  const logout = () => {
    logAction("LOGOUT", "تم تسجيل الخروج");
    setCurrentUser(null);
  };

  // ======================================================
  // ✅ Users
  // ======================================================
  const addUser = (user: User) => {
    setUsers((prev) => {
      const updated = [...prev, user];
      saveToStorage("sec_sys_users_list", updated);
      return updated;
    });
    logAction("CREATE", `إضافة مستخدم جديد: ${user.name}`);
  };

  const updateUser = (user: User) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === user.id ? user : u));
      saveToStorage("sec_sys_users_list", updated);
      return updated;
    });
    logAction("UPDATE", `تعديل بيانات المستخدم: ${user.name}`);
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => {
      const user = prev.find((u) => u.id === userId);
      const updated = prev.filter((u) => u.id !== userId);
      saveToStorage("sec_sys_users_list", updated);
      if (user) {
        logAction("DELETE", `حذف المستخدم: ${user.name}`);
      }
      return updated;
    });
  };

  // ======================================================
  // ✅ Inmates
  // ======================================================
  const addInmate = (inmate: Inmate) => {
    setInmates((prev) => {
      const updated = [...prev, inmate];
      saveToStorage("sec_sys_inmates", updated);
      return updated;
    });
    logAction("CREATE", `إضافة نزيل: ${inmate.fullName}`);
  };

  const updateInmate = (inmate: Inmate) => {
    setInmates((prev) => {
      const updated = prev.map((i) => (i.id === inmate.id ? inmate : i));
      saveToStorage("sec_sys_inmates", updated);
      return updated;
    });
    logAction("UPDATE", `تعديل بيانات النزيل: ${inmate.fullName}`);
  };

  const deleteInmate = (inmateId: string) => {
    setInmates((prev) => {
      const inmate = prev.find((i) => i.id === inmateId);
      const updated = prev.filter((i) => i.id !== inmateId);
      saveToStorage("sec_sys_inmates", updated);
      if (inmate) {
        logAction("DELETE", `حذف النزيل: ${inmate.fullName}`);
      }
      return updated;
    });
  };

  // ======================================================
  // ✅ Inspection
  // ======================================================
  const addInspection = (inspection: InspectionRecord) => {
    setInspections((prev) => {
      const updated = [...prev, inspection];
      saveToStorage("sec_sys_inspections", updated);
      return updated;
    });
    logAction("CREATE", `تسجيل تفتيش بتاريخ ${inspection.date}`);
  };

  const updateInmateStatus = (id: string, status: InmateStatus) => {
    setInmates((prev) => {
      const updated = prev.map((i) => (i.id === id ? { ...i, status } : i));
      saveToStorage("sec_sys_inmates", updated);
      return updated;
    });
    logAction("UPDATE", `تغيير حالة النزيل رقم: ${id} إلى ${status}`);
  };

  // ======================================================
  // ✅ Wards
  // ======================================================
  const assignWard = (inmateId: string, wardId: string) => {
    setInmates((prev) => {
      const updated = prev.map((i) =>
        i.id === inmateId ? { ...i, wardId } : i
      );
      saveToStorage("sec_sys_inmates", updated);
      return updated;
    });
    logAction("UPDATE", `تخصيص عنبر للنزيل رقم: ${inmateId}`);
  };

  const addWard = (ward: Ward) => {
    setWards((prev) => {
      const updated = [...prev, ward];
      saveToStorage("sec_sys_wards", updated);
      return updated;
    });
    logAction("CREATE", `إضافة عنبر: ${ward.name}`);
  };

  // ======================================================
  // ✅ Investigation (Cases + Minutes)
// ======================================================
  const addCase = (newCase: Case) => {
    setCases((prev) => {
      const updated = [...prev, newCase];
      saveToStorage("sec_sys_cases", updated);
      return updated;
    });
    logAction("CREATE", `تسجيل قضية جديدة للنزيل: ${newCase.inmateId}`);
  };

  const addMinute = (minute: InvestigationMinute) => {
    setMinutes((prev) => {
      const updated = [...prev, minute];
      saveToStorage("sec_sys_minutes", updated);
      return updated;
    });
    logAction("CREATE", `إضافة محضر تحقيق رقم: ${minute.id}`);
  };

  // ======================================================
  // ✅ Wanted Persons
  // ======================================================
  const addWantedPerson = (person: WantedPerson) => {
    setWantedPersons((prev) => {
      const updated = [...prev, person];
      saveToStorage("sec_sys_wanted", updated);
      return updated;
    });
    logAction("CREATE", `إضافة مطلوب أمني: ${person.name}`);
  };

  const updateWantedPersonStatus = (
    id: string,
    status: WantedPerson["status"]
  ) => {
    setWantedPersons((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, status } : p
      );
      saveToStorage("sec_sys_wanted", updated);
      return updated;
    });
    logAction("UPDATE", `تغيير حالة المطلوب رقم: ${id} إلى ${status}`);
  };

  const deleteWantedPerson = (id: string) => {
    setWantedPersons((prev) => {
      const person = prev.find((p) => p.id === id);
      const updated = prev.filter((p) => p.id !== id);
      saveToStorage("sec_sys_wanted", updated);
      if (person) {
        logAction("DELETE", `حذف المطلوب الأمني: ${person.name}`);
      }
      return updated;
    });
  };

  // ======================================================
  // ✅ Movements
  // ======================================================
  const addMovement = (movement: Movement) => {
    setMovements((prev) => {
      const updated = [...prev, movement];
      saveToStorage("sec_sys_movements", updated);
      return updated;
    });
    logAction("CREATE", `تسجيل حركة للنزيل رقم: ${movement.inmateId}`);
  };

  const updateMovement = (movement: Movement) => {
    setMovements((prev) => {
      const updated = prev.map((m) =>
        m.id === movement.id ? movement : m
      );
      saveToStorage("sec_sys_movements", updated);
      return updated;
    });
    logAction("UPDATE", `تعديل حركة للنزيل رقم: ${movement.inmateId}`);
  };

  // ======================================================
  // ✅ Visits
  // ======================================================
  const addVisit = (visit: Visit) => {
    setVisits((prev) => {
      const updated = [...prev, visit];
      saveToStorage("sec_sys_visits", updated);
      return updated;
    });
    logAction("CREATE", `تسجيل زيارة للنزيل: ${visit.inmateName}`);
  };

  const updateVisit = (visit: Visit) => {
    setVisits((prev) => {
      const updated = prev.map((v) =>
        v.id === visit.id ? visit : v
      );
      saveToStorage("sec_sys_visits", updated);
      return updated;
    });
    logAction("UPDATE", `تعديل زيارة للنزيل: ${visit.inmateName}`);
  };

  const deleteVisit = (id: string) => {
    setVisits((prev) => {
      const visit = prev.find((v) => v.id === id);
      const updated = prev.filter((v) => v.id !== id);
      saveToStorage("sec_sys_visits", updated);
      if (visit) {
        logAction("DELETE", `حذف زيارة للنزيل: ${visit.inmateName}`);
      }
      return updated;
    });
  };

  // ======================================================
  // ✅ Behavior Reports (لو كنت تستخدمها من قبل)
// ======================================================
  const addFavorite = (item: FavoriteItem) => {
    setFavorites((prev) => {
      const updated = [...prev, item];
      saveToStorage("sec_sys_favorites", updated);
      return updated;
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      saveToStorage("sec_sys_favorites", updated);
      return updated;
    });
  };

  // ======================================================
  // ✅ Backup / Restore
  // ======================================================
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
      visits,
      reports,
      auditLogs,
      favorites,
      version: 1,
      createdAt: new Date().toISOString(),
    };

    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security_system_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    alert("تم إنشاء نسخة احتياطية بنجاح");
  };

  const parseBackupFile = async (file: File): Promise<any> => {
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      return data;
    } catch (e) {
      alert("ملف النسخة الاحتياطية غير صالح");
      throw e;
    }
  };

  const restoreData = (data: any) => {
    if (
      !window.confirm(
        "سيتم استبدال كل البيانات الحالية بالنسخة الاحتياطية، هل أنت متأكد؟"
      )
    ) {
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
    setVisits(data.visits || []);
    setReports(data.reports || []);
    setAuditLogs(data.auditLogs || []);
    setFavorites(data.favorites || []);

    saveToStorage("sec_sys_users_list", data.users || []);
    saveToStorage("sec_sys_inmates", data.inmates || []);
    saveToStorage("sec_sys_inspections", data.inspections || []);
    saveToStorage("sec_sys_wards", data.wards || []);
    saveToStorage("sec_sys_cases", data.cases || []);
    saveToStorage("sec_sys_minutes", data.minutes || []);
    saveToStorage("sec_sys_wanted", data.wantedPersons || []);
    saveToStorage("sec_sys_movements", data.movements || []);
    saveToStorage("sec_sys_visits", data.visits || []);
    saveToStorage("sec_sys_reports", data.reports || []);
    saveToStorage("sec_sys_logs", data.auditLogs || []);
    saveToStorage("sec_sys_favorites", data.favorites || []);

    alert("تم استعادة البيانات بنجاح");
  };

  const resetSystem = () => {
    if (
      !window.confirm(
        "تحذير: سيتم حذف كل البيانات وإعادة النظام لحالته الافتراضية، هل أنت متأكد؟"
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
    setVisits([]);
    setReports([]);
    setFavorites([]);

    saveToStorage("sec_sys_users_list", initialUsers);
    saveToStorage("sec_sys_inmates", []);
    saveToStorage("sec_sys_inspections", []);
    saveToStorage("sec_sys_wards", []);
    saveToStorage("sec_sys_cases", []);
    saveToStorage("sec_sys_minutes", []);
    saveToStorage("sec_sys_wanted", []);
    saveToStorage("sec_sys_movements", []);
    saveToStorage("sec_sys_visits", []);
    saveToStorage("sec_sys_reports", []);
    saveToStorage("sec_sys_logs", []);
    saveToStorage("sec_sys_favorites", []);

    alert("تمت إعادة تهيئة النظام. بيانات الدخول: admin / 123");
  };

  // ======================================================
  // ✅ Dev Console – تعديل الداتا الخام من شاشة المطور
  // ======================================================
  const updateRawData = (key: CollectionKey, data: any[]) => {
    switch (key) {
      case "sec_sys_users_list":
        setUsers(data as User[]);
        break;
      case "sec_sys_inmates":
        setInmates(data as Inmate[]);
        break;
      case "sec_sys_inspections":
        setInspections(data as InspectionRecord[]);
        break;
      case "sec_sys_wards":
        setWards(data as Ward[]);
        break;
      case "sec_sys_cases":
        setCases(data as Case[]);
        break;
      case "sec_sys_minutes":
        setMinutes(data as InvestigationMinute[]);
        break;
      case "sec_sys_wanted":
        setWantedPersons(data as WantedPerson[]);
        break;
      case "sec_sys_movements":
        setMovements(data as Movement[]);
        break;
      case "sec_sys_visits":
        setVisits(data as Visit[]);
        break;
      case "sec_sys_reports":
        setReports(data as BehaviorReport[]);
        break;
      case "sec_sys_logs":
        setAuditLogs(data as AuditLog[]);
        break;
      case "sec_sys_favorites":
        setFavorites(data as FavoriteItem[]);
        break;
      default:
        console.warn("Unknown key for updateRawData", key);
    }
    saveToStorage(key, data);
  };

  // ======================================================
  // ✅ Provider
  // ======================================================
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
        visits,
        reports,
        auditLogs,
        favorites,
        departments: Object.values(Department),

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

        addVisit,
        updateVisit,
        deleteVisit,

        addFavorite,
        removeFavorite,

        createBackup,
        parseBackupFile,
        restoreData,
        resetSystem,
        requestPersistentStorage,
        updateRawData,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

// ✅ hook للاستخدام
export const useSecurity = (): SecurityContextType => {
  const ctx = useContext(SecurityContext);
  if (!ctx) {
    throw new Error("useSecurity must be used within a SecurityProvider");
  }
  return ctx;
};
