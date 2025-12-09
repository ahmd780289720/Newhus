import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
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
  CollectionKey
} from "../src/database/SQLiteService";

// ======================================================
// 🔥 1) حذف loadFromStorage — لأننا لا نستخدم localStorage إطلاقًا
// ======================================================

// ======================================================
// 🔥 2) تعديل saveToStorage — الآن يخزن في SQLite فقط
// ======================================================
const saveToStorage = async (key: CollectionKey, data: any) => {
  try {
    await SQLiteService.upsertCollection(key, data);
  } catch (err) {
    console.error("SQLite Save Error:", err);
    alert("خطأ في حفظ البيانات داخل SQLite!");
  }
};

// ======================================================
// 🔥 3) مستخدم افتراضي
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
const SecurityContext = createContext<any>(undefined);
export const SecurityProvider = ({ children }: { children: ReactNode }) => {
  // Users
  const [users, setUsers] = useState<User[]>([DEFAULT_ADMIN_USER]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // System Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Main App Data
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
  // 🔥 تحميل البيانات من SQLite عند بدء تشغيل النظام
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
          SQLiteService.getCollection<Movement>(
            "sec_sys_movements",
            []
          ),
          SQLiteService.getCollection<Visit>("sec_sys_visits", []),
          SQLiteService.getCollection<BehaviorReport>(
            "sec_sys_reports",
            []
          ),
          SQLiteService.getCollection<AuditLog>("sec_sys_logs", []),
          SQLiteService.getCollection<FavoriteItem>(
            "sec_sys_favorites",
            []
          ),
        ]);

        setUsers(usersFromDb);
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
        alert("تعذر تحميل البيانات من قاعدة البيانات!");
      }
    })();
  }, []);
  // تسجيل الدخول
  const login = (name: string, password: string): boolean => {
    const user = users.find(
      (u) => u.name === name && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  // ======================================================
  // 🔥 وظائف CRUD — كلها تكتب SQLite فقط
  // ======================================================

  const addUser = async (user: User) => {
    const updated = [...users, user];
    setUsers(updated);
    await saveToStorage("sec_sys_users_list", updated);
  };

  const updateUser = async (user: User) => {
    const updated = users.map((u) => (u.id === user.id ? user : u));
    setUsers(updated);
    await saveToStorage("sec_sys_users_list", updated);
  };

  const deleteUser = async (id: string) => {
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    await saveToStorage("sec_sys_users_list", updated);
  };

  // --------------------------
  // 🟦 النزلاء
  // --------------------------
  const addInmate = async (inmate: Inmate) => {
    const updated = [...inmates, inmate];
    setInmates(updated);
    await saveToStorage("sec_sys_inmates", updated);
  };

  const updateInmate = async (inmate: Inmate) => {
    const updated = inmates.map((i) => (i.id === inmate.id ? inmate : i));
    setInmates(updated);
    await saveToStorage("sec_sys_inmates", updated);
  };

  const deleteInmate = async (id: string) => {
    const updated = inmates.filter((i) => i.id !== id);
    setInmates(updated);
    await saveToStorage("sec_sys_inmates", updated);
  };

  // --------------------------
  // 🟦 التفتيش
  // --------------------------
  const addInspection = async (rec: InspectionRecord) => {
    const updated = [...inspections, rec];
    setInspections(updated);
    await saveToStorage("sec_sys_inspections", updated);
  };

  const updateInmateStatus = async (id: string, status: InmateStatus) => {
    const updated = inmates.map((i) =>
      i.id === id ? { ...i, status } : i
    );
    setInmates(updated);
    await saveToStorage("sec_sys_inmates", updated);
  };

  // --------------------------
  // 🟦 العنابر
  // --------------------------
  const assignWard = async (inmateId: string, wardId: string) => {
    const updated = inmates.map((i) =>
      i.id === inmateId ? { ...i, wardId } : i
    );
    setInmates(updated);
    await saveToStorage("sec_sys_inmates", updated);
  };

  const addWard = async (ward: Ward) => {
    const updated = [...wards, ward];
    setWards(updated);
    await saveToStorage("sec_sys_wards", updated);
  };

  // --------------------------
  // 🟦 الزيارات
  // --------------------------
  const addVisit = async (v: Visit) => {
    const updated = [...visits, v];
    setVisits(updated);
    await saveToStorage("sec_sys_visits", updated);
  };

  const updateVisit = async (visit: Visit) => {
    const updated = visits.map((v) =>
      v.id === visit.id ? visit : v
    );
    setVisits(updated);
    await saveToStorage("sec_sys_visits", updated);
  };

  const deleteVisit = async (id: string) => {
    const updated = visits.filter((v) => v.id !== id);
    setVisits(updated);
    await saveToStorage("sec_sys_visits", updated);
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
        visits,
        reports,
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

        addVisit,
        updateVisit,
        deleteVisit,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => useContext(SecurityContext);
