import React, { createContext, useContext, useEffect, useState } from "react";

/* ============================
      🟦 استيراد المستودعات
============================ */

import { InmatesRepository } from "../repositories/InmatesRepository";
import { InspectionsRepository } from "../repositories/InspectionsRepository";
import { WardsRepository } from "../repositories/WardsRepository";
import { MovementsRepository } from "../repositories/MovementsRepository";
import { VisitsRepository } from "../repositories/VisitsRepository";
import { CasesRepository } from "../repositories/CasesRepository";
import { MinutesRepository } from "../repositories/MinutesRepository";
import { WantedRepository } from "../repositories/WantedRepository";
import { SourcesRepository } from "../repositories/SourcesRepository";
import { ReportsRepository } from "../repositories/ReportsRepository";
import { FileRepository } from "../repositories/FileRepository";

const SecurityContext = createContext<any>(null);
export const useSecurity = () => useContext(SecurityContext);

export const SecurityProvider = ({ children }) => {
  /* ============================
        🟦 بيانات المستخدم
  ============================ */
  const [currentUser, setCurrentUser] = useState<any>(null);

  const login = async (user) => setCurrentUser(user);
  const logout = async () => setCurrentUser(null);

  /* ============================
        ⭐ المفضلة
  ============================ */
  const [favorites, setFavorites] = useState<any[]>([]);

  const addFavorite = (item) => setFavorites((prev) => [...prev, item]);
  const removeFavorite = (id) =>
    setFavorites((prev) => prev.filter((f) => f.id !== id));

  /* ============================
        🟦 إدارة النزلاء
  ============================ */
  const [inmates, setInmates] = useState<any[]>([]);

  const loadInmates = async () => {
    const data = await InmatesRepository.getAll();
    setInmates(data);
  };

  const addInmate = async (inmate) => {
    await InmatesRepository.add(inmate);
    await loadInmates();
  };

  const updateInmate = async (id, updates) => {
    const existing = await InmatesRepository.getById(id);
    if (!existing) return;
    await InmatesRepository.update({ ...existing, ...updates });
    await loadInmates();
  };

  const deleteInmate = async (id) => {
    await InmatesRepository.delete(id);
    await loadInmates();
  };

  /* ============================
        🟦 إدارة الفحص والتفتيش
  ============================ */
  const [inspections, setInspections] = useState<any[]>([]);

  const loadInspections = async () => {
    const data = await InspectionsRepository.getAll();
    setInspections(data);
  };

  const addInspection = async (inspect) => {
    await InspectionsRepository.add(inspect);
    await loadInspections();
  };

  /* ============================
        🟦 إدارة العنابر
  ============================ */
  const [wards, setWards] = useState<any[]>([]);

  const loadWards = async () => {
    const data = await WardsRepository.getAll();
    setWards(data);
  };

  const addWard = async (ward) => {
    await WardsRepository.add(ward);
    await loadWards();
  };

  const updateWard = async (id, updates) => {
    const existing = await WardsRepository.getById(id);
    if (!existing) return;
    await WardsRepository.update({ ...existing, ...updates });
    await loadWards();
  };

  const deleteWard = async (id) => {
    await WardsRepository.delete(id);
    await loadWards();
  };

  /* ============================
        🟦 إدارة الحركات
  ============================ */
  const [movements, setMovements] = useState<any[]>([]);

  const loadMovements = async () => {
    const data = await MovementsRepository.getAll();
    setMovements(data);
  };

  const addMovement = async (move) => {
    await MovementsRepository.add(move);
    await loadMovements();
  };

  /* ============================
        🟦 إدارة الزيارات
  ============================ */
  const [visits, setVisits] = useState<any[]>([]);

  const loadVisits = async () => {
    const data = await VisitsRepository.getAll();
    setVisits(data);
  };

  const addVisit = async (visit) => {
    await VisitsRepository.add(visit);
    await loadVisits();
  };

  /* ============================
        🟦 إدارة القضايا
  ============================ */
  const [cases, setCases] = useState<any[]>([]);

  const loadCases = async () => {
    const data = await CasesRepository.getAll();
    setCases(data);
  };

  const addCase = async (c) => {
    await CasesRepository.add(c);
    await loadCases();
  };

  /* ============================
        🟦 إدارة المحاضر
  ============================ */
  const [minutes, setMinutes] = useState<any[]>([]);

  const loadMinutes = async () => {
    const data = await MinutesRepository.getAll();
    setMinutes(data);
  };

  const addMinute = async (m) => {
    await MinutesRepository.add(m);
    await loadMinutes();
  };

  /* ============================
        🟦 إدارة المطلوبين
  ============================ */
  const [wanted, setWanted] = useState<any[]>([]);

  const loadWanted = async () => {
    const data = await WantedRepository.getAll();
    setWanted(data);
  };

  const addWanted = async (w) => {
    await WantedRepository.add(w);
    await loadWanted();
  };

  /* ============================
        🟦 إدارة المصادر
  ============================ */
  const [sources, setSources] = useState<any[]>([]);

  const loadSources = async () => {
    const data = await SourcesRepository.getAll();
    setSources(data);
  };

  const addSource = async (s) => {
    await SourcesRepository.add(s);
    await loadSources();
  };

  /* ============================
        🟦 إدارة التقارير
  ============================ */
  const generateReport = async (filters) => {
    return await ReportsRepository.generate(filters);
  };

  /* ============================
        🟦 إدارة ملفات PDF
  ============================ */
  const saveFile = async (file) => {
    return await FileRepository.save(file);
  };

  const loadFiles = async () => {
    return await FileRepository.getAll();
  };

  /* ============================
      🟦 تحميل كل البيانات عند التشغيل
  ============================ */
  useEffect(() => {
    loadInmates();
    loadInspections();
    loadWards();
    loadMovements();
    loadVisits();
    loadCases();
    loadMinutes();
    loadWanted();
    loadSources();
  }, []);

  return (
    <SecurityContext.Provider
      value={{
        currentUser,
        login,
        logout,
        favorites,
        addFavorite,
        removeFavorite,

        inmates,
        addInmate,
        updateInmate,
        deleteInmate,

        inspections,
        addInspection,

        wards,
        addWard,
        updateWard,
        deleteWard,

        movements,
        addMovement,

        visits,
        addVisit,

        cases,
        addCase,

        minutes,
        addMinute,

        wanted,
        addWanted,

        sources,
        addSource,

        generateReport,

        saveFile,
        loadFiles,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export default SecurityContext;
