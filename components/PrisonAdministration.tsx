import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  UserPlus,
  Scan,
  Edit2,
  Building,
  Shield,
  HelpCircle,
  Camera,
  AlertOctagon,
  LayoutDashboard,
  Plus,
  Save,
  ArrowLeft,
  CheckCircle,
  Layout,
  ClipboardList,
  X,
  Briefcase,
  FileBadge,
} from "lucide-react";

import {
  InmateStatus,
  Inmate,
  InspectionRecord,
  Ward,
} from "../types";
import { useToast } from "../src/context/ToastContext";
import { useSecurity } from "../context/SecurityContext";
import MovementsManager from "./MovementsManager";
import VisitManager from "./VisitManager";
import InmateManager from "./InmateManager";
import InmateProfileModal from "./InmateProfileModal";
import { BelongingsRepository } from '../repositories/BelongingsRepository';
interface PrisonAdministrationProps {
  onShowProfile?: (id: string) => void;
  initialTab?: string;
}

const PrisonAdministration: React.FC<PrisonAdministrationProps> = ({
  onShowProfile,
  initialTab,
}) => {
const { showToast } = useToast();
  const {
    inmates,
    wards,
    addInmate,
    addInspection,
    addWard,
    assignWard,
    updateInmateStatus,
    updateInmate,
    deleteInmate,
  } = useSecurity();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [currentView, setCurrentView] = useState<string>("NEW_INMATE");
  useEffect(() => {
    if (initialTab) setCurrentView(initialTab);
  }, [initialTab]);

  // مضبوطات
  const [newItemType, setNewItemType] = useState<string>("");
  const [newItemData, setNewItemData] = useState<any>({});
  // =========================
  // حالة تعديل المضبوطات
  // =========================
  const [editingBelongingIndex, setEditingBelongingIndex] = useState<number | null>(null);
  const [editBelongingData, setEditBelongingData] = useState<any>({});
  const [editBelongingType, setEditBelongingType] = useState<string>('');  

  // =======================
  //      STATES
  // =======================

  const [wardForm, setWardForm] = useState({
    name: "",
    capacity: 20,
    supervisor: "",
  });

  const todayDefault = new Date().toISOString().split("t")[0];
  const nowDefault = new Date().toLocaleTimeString("en-gb", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const [intakeForm, setIntakeForm] = useState<Partial<Inmate>>({
    type: "SUSPECT" as any,
    fullName: "",
    documentType: "ID" as any,
    nationalId: "",
    entryDate: todayDefault,
    entryTime: nowDefault,
    governorate: "",
    village: "",
    residence: "",
    referringAuthority: "الشرطة العسكرية",
    primaryCharge: "",
    chargeType: "Regular" as any,
    maritalStatus: "Single" as any,
    childrenBoys: undefined,
    childrenGirls: undefined,
    educationLevel: "HighSchool" as any,
    specialization: "",
    unit: "",
    front: "",
    capturePlace: "",
    workStatus: "Unemployed" as any,
    jobTitle: "",
    employer: "",
    wardId: "",
  });

  const [inmateImage, setInmateImage] = useState<string | null>(null);

  const [selectedInmateForInspection, setSelectedInmateForInspection] =
    useState<string | null>(null);

  const [inspectionForm, setInspectionForm] =
    useState<Partial<InspectionRecord>>({
      isPhysicallyInspected: "No" as any,
      physicalNotes: "",
      belongings: [],
      securityIntel: "",
      documents: [],
    });

  // اختيار العنبر من شاشة التفتيش (اختياري)
  const [inspectionWardId, setInspectionWardId] = useState<string>("");

  // شاشة التسكين
  const [selectedInmateForHousing, setSelectedInmateForHousing] =
    useState<string | null>(null);
  const [selectedWardId, setSelectedWardId] = useState<string>("");

  // =======================
  //      ACTIONS
  // =======================

  // إضافة عنبر جديد
  const handleAddWard = (e: React.FormEvent) => {
    e.preventDefault();
    const newWard: Ward = {
      id: `W-${Date.now()}`,
      name: wardForm.name,
      capacity: Number(wardForm.capacity),
      currentCount: 0,
      supervisor: wardForm.supervisor,
    };
    addWard(newWard);
    alert("تم إضافة العنبر بنجاح!");
    setWardForm({ name: "", capacity: 20, supervisor: "" });
  };

  // رفع صورة النزيل
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setInmateImage(imageUrl);
    }
  };

  // حفظ بيانات النزيل
  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newId = Math.random().toString(36).substring(2, 9);
    const today = new Date().toISOString().split("t")[0];
    const now = new Date().toLocaleTimeString("en-gb", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newInmate: Inmate = {
      ...(intakeForm as Inmate),
      id: newId,
      fullName: intakeForm.fullName || "",
      nationalId: intakeForm.nationalId || "",
      type: intakeForm.type || "SUSPECT",
      entryDate: intakeForm.entryDate || today,
      entryTime: intakeForm.entryTime || now,
      photoUrl: inmateImage || "https://via.placeholder.com/150",
      status: InmateStatus.PROCESSING,
      referringAuthority: intakeForm.referringAuthority || "",
      primaryCharge: intakeForm.primaryCharge || "",
    };

    addInmate(newInmate);

    alert("تم تسجيل النزيل بنجاح!");

    // تصفير النموذج
    setIntakeForm({
      type: "SUSPECT" as any,
      fullName: "",
      documentType: "ID" as any,
      nationalId: "",
      referringAuthority: "الشرطة العسكرية",
      primaryCharge: "",
      maritalStatus: "Single" as any,
      educationLevel: "HighSchool" as any,
      workStatus: "Unemployed" as any,
      entryDate: today,
      entryTime: now,
      childrenBoys: undefined,
      childrenGirls: undefined,
      unit: "",
      front: "",
      capturePlace: "",
      residence: "",
      governorate: "",
      village: "",
      wardId: "",
    });

    setInmateImage(null);

    // الانتقال للفحص
    setCurrentView("INSPECTION");
    setSelectedInmateForInspection(newId);
    setInspectionWardId("");
  };
// اعتماد الفحص (يستخدم في زر "اعتماد الفحص")
const handleInspectionSubmit = async () => {
  if (!selectedInmateForInspection) return;

  const newStatus =
    inspectionWardId === "" ? InmateStatus.WAITING : InmateStatus.HOUSED;

  // 1) حفظ الفحص بدون المضبوطات
  await updateInmate(selectedInmateForInspection, {
    ...inspectionForm,
    belongings: undefined,    // مهم جداً: منع تخزين المضبوطات داخل كائن النزيل
    status: newStatus,
  });

  // 2) حفظ المضبوطات في جدول مستقل
  if (inspectionForm.belongings && inspectionForm.belongings.length > 0) {
    for (const item of inspectionForm.belongings) {
      await BelongingsRepository.add(
        selectedInmateForInspection, // رقم النزيل
        item.type,                   // نوع المضبوطة
        item.data                    // تفاصيل المضبوطة
      );
    }
  }

  // 3) تسكين النزيل إن اختاروا عنبر
  if (inspectionWardId) {
    await assignWard(selectedInmateForInspection, inspectionWardId);
  }

  // 4) تصفير النموذج
  setInspectionForm({
    isPhysicallyInspected: "No",
    physicalNotes: "",
    belongings: [],
    securityIntel: "",
    documents: [],
  });

  setNewItemType("");
  setNewItemData({});
  setInspectionWardId("");
  setSelectedInmateForInspection(null);
};

    setInspectionForm({
      isPhysicallyInspected: "No" as any,
      physicalNotes: "",
      belongings: [],
      securityIntel: "",
      documents: [],
    });
    setNewItemType("");
    setNewItemData({});
    setInspectionWardId("");

    // الذهاب للتسكين
    setCurrentView("HOUSING");
  };

  // تسكين من شاشة التسكين
  const handleAssignWardFromHousing = async () => {
    if (!selectedInmateForHousing || !selectedWardId) {
      alert("اختر النزيل والعنبر أولاً");
      return;
    }

    const ward = wards.find((w) => w.id === selectedWardId);
    if (ward && ward.currentCount >= ward.capacity) {
      const ok = window.confirm(
        "هذا العنبر ممتلئ! هل تريد التسكين فوق السعة؟"
      );
      if (!ok) return;
    }

    await assignWard(selectedInmateForHousing, selectedWardId);
    await updateInmateStatus(
      selectedInmateForHousing,
      InmateStatus.DETAINED
    );

    alert("تم تسكين النزيل بنجاح!");
    setSelectedInmateForHousing(null);
    setSelectedWardId("");
  };

  // =======================
  //        VIEWS
  // =======================

  const renderWardSetup = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Building className="text-primary-600" /> تهيئة العنابر الجديدة
        </h3>
        <form onSubmit={handleAddWard} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">
              اسم العنبر / الجناح
            </label>
            <input
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
              placeholder="مثال: عنبر 5 (أحداث)"
              value={wardForm.name}
                setEditBelongingData({
    ...editBelongingData,
    weaponNumber: e.target.value,
  })
   }onChange={(e) =>
                setWardForm({ ...wardForm, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">
                السعة الاستيعابية
              </label>
              <input
                type="number"
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                value={wardForm.capacity}
                onChange={(e) =>
                  setWardForm({
                    ...wardForm,
                    capacity: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">
                المشرف المسؤول
              </label>
              <input
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                placeholder="الرقيب..."
                value={wardForm.supervisor}
                onChange={(e) =>
                  setWardForm({
                    ...wardForm,
                    supervisor: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold mt-4 hover:bg-slate-800 transition-colors shadow-lg"
          >
            <Save size={18} className="inline ml-2" /> حفظ العنبر في النظام
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Layout className="text-emerald-600" /> سجل العنابر الحالي
        </h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {wards.map((ward) => (
            <div
              key={ward.id}
              className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-bold text-slate-800">{ward.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  المشرف: {ward.supervisor}
                </p>
              </div>
              <div className="text-center bg-slate-50 p-2 rounded-xl">
                <span className="block text-lg font-extrabold text-primary-600">
                  {ward.capacity}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  سعة
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
/* ===============================
      شاشة تسجيل بيانات النزيل
      (نفس التصميم الأصلي كامل + إضافة مكان القبض + صور الوثيقة)
=============================== */
const renderNewInmate = () => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-5xl mx-auto animate-fadeIn mb-20">
    <div className="border-b border-slate-100 pb-6 mb-8 flex justify-between items-end">
      <div>
        <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
          <div className="bg-primary-100 p-3 rounded-2xl text-primary-600">
            <UserPlus size={32} />
          </div>
          استمارة تسجيل نزيل
        </h3>
        <p className="text-slate-500 mt-2 mr-16">
          يرجى اختيار نوع النزيل بدقة لتعبئة البيانات المطلوبة
        </p>
      </div>

      {/* صورة النزيل */}
      <div className="flex flex-col items-center">
        <div
          className="relative group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-primary-500 transition-colors">
            {inmateImage ? (
              <img
                src={inmateImage}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera
                className="text-slate-400 group-hover:text-primary-500"
                size={32}
              />
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-1.5 rounded-full shadow-md">
            <Plus size={14} />
          </div>
        </div>
        <span className="text-xs text-slate-500 mt-2 font-bold">
          صورة النزيل
        </span>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>
    </div>

    <form onSubmit={handleIntakeSubmit} className="space-y-8">
      {/* اختيار نوع النزيل */}
      <div className="grid grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setIntakeForm({ ...intakeForm, type: "SUSPECT" })}
          className={`p-4 rounded-2xl border-2 font-bold flex flex-col items-center gap-2 transition-all ${
            intakeForm.type === "SUSPECT"
              ? "border-primary-600 bg-primary-50 text-primary-700"
              : "border-slate-100 bg-white text-slate-400 hover:bg-slate-50"
          }`}
        >
          <HelpCircle size={24} />
          مشتبه به
        </button>

        <button
          type="button"
          onClick={() => setIntakeForm({ ...intakeForm, type: "POW" })}
          className={`p-4 rounded-2xl border-2 font-bold flex flex-col items-center gap-2 transition-all ${
            intakeForm.type === "POW"
              ? "border-red-600 bg-red-50 text-red-700"
              : "border-slate-100 bg-white text-slate-400 hover:bg-slate-50"
          }`}
        >
          <AlertOctagon size={24} />
          أسير حرب
        </button>

        <button
          type="button"
          onClick={() => setIntakeForm({ ...intakeForm, type: "MILITARY" })}
          className={`p-4 rounded-2xl border-2 font-bold flex flex-col items-center gap-2 transition-all ${
            intakeForm.type === "MILITARY"
              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
              : "border-slate-100 bg-white text-slate-400 hover:bg-slate-50"
          }`}
        >
          <Shield size={24} />
          عسكري (مخالف)
        </button>
      </div>

      {/* ===============================  
          البيانات الشخصية والعنوان  
      =============================== */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-700 border-r-4 border-primary-600 pr-3">
          البيانات الشخصية والعنوان
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* الاسم */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-bold text-slate-600 mb-2">
              الاسم واللقب
            </label>
            <input
              required
              type="text"
              value={intakeForm.fullName || ""}
              onChange={(e) =>
                setIntakeForm({ ...intakeForm, fullName: e.target.value })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          {/* نوع الوثيقة */}
          {intakeForm.type !== "MILITARY" && (
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">
                نوع الوثيقة
              </label>
              <select
                value={intakeForm.documentType}
                onChange={(e) =>
                  setIntakeForm({
                    ...intakeForm,
                    documentType: e.target.value as any,
                  })
                }
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              >
                <option value="ID">بطاقة شخصية</option>
                <option value="Passport">جواز سفر</option>
                <option value="None">لا يوجد</option>
              </select>
            </div>
          )}

          {/* رقم الوثيقة */}
          {intakeForm.documentType !== "None" && (
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">
                {intakeForm.type === "MILITARY" ? "الرقم العسكري" : "رقم الوثيقة"}
              </label>
              <input
                required
                type="text"
                value={intakeForm.nationalId || ""}
                onChange={(e) =>
                  setIntakeForm({ ...intakeForm, nationalId: e.target.value })
                }
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          )}

          {/* تاريخ الدخول */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">
              تاريخ الدخول
            </label>
            <input
              type="date"
              value={intakeForm.entryDate}
              onChange={(e) =>
                setIntakeForm({ ...intakeForm, entryDate: e.target.value })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          {/* وقت الدخول */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">
              وقت الدخول
            </label>
            <input
              type="time"
              value={intakeForm.entryTime}
              onChange={(e) =>
                setIntakeForm({ ...intakeForm, entryTime: e.target.value })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          {/* المحافظة */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">
              المحافظة
            </label>
            <input
              type="text"
              value={intakeForm.governorate || ""}
              onChange={(e) =>
                setIntakeForm({ ...intakeForm, governorate: e.target.value })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          {/* القرية */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">
              القرية / الحي
            </label>
            <input
              type="text"
              value={intakeForm.village || ""}
              onChange={(e) =>
                setIntakeForm({ ...intakeForm, village: e.target.value })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          {/* مكان السكن */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">
              مكان السكن الحالي
            </label>
            <input
              type="text"
              value={intakeForm.residence || ""}
              onChange={(e) =>
                setIntakeForm({ ...intakeForm, residence: e.target.value })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* ===============================  
         مكان القبض / الأسر  
      =============================== */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-700 border-r-4 border-primary-600 pr-3">
          بيانات مكان الضبط / الأسر
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-600 mb-2">
              {intakeForm.type === "POW" ? "مكان الأسر" : "مكان القبض"}
            </label>
            <input
              type="text"
              value={intakeForm.capturePlace || ""}
              onChange={(e) =>
                setIntakeForm({
                  ...intakeForm,
                  capturePlace: e.target.value,
                })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* ===============================  
         صور الوثيقة  
      =============================== */}
      {intakeForm.documentType === "ID" && (
        <div className="space-y-4">
          <h4 className="font-bold text-slate-700 border-r-4 border-primary-600 pr-3">
            صور البطاقة الشخصية
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">
                صورة البطاقة (الوجه الأمامي)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">
                صورة البطاقة (الوجه الخلفي)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {intakeForm.documentType === "Passport" && (
        <div className="space-y-4">
          <h4 className="font-bold text-slate-700 border-r-4 border-primary-600 pr-3">
            صورة جواز السفر
          </h4>

          <label className="block text-sm font-bold text-slate-600 mb-2">
            صورة صفحة البيانات في الجواز
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
          />
        </div>
      )}

      {/* ===============================  
         الحالة الاجتماعية  
      =============================== */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-700 border-r-4 border-amber-500 pr-3">
          الحالة الاجتماعية والتعليمية
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* الحالة الاجتماعية */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">
              الحالة الاجتماعية
            </label>
            <select
              value={intakeForm.maritalStatus}
              onChange={(e) =>
                setIntakeForm({
                  ...intakeForm,
                  maritalStatus: e.target.value as any,
                })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            >
              <option value="Single">عازب</option>
              <option value="Married">متزوج</option>
            </select>
          </div>

          {/* أبناء */}
          {intakeForm.maritalStatus === "Married" && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">
                  عدد الأولاد (ذكور)
                </label>
                <input
                  type="number"
                  min={0}
                  value={intakeForm.childrenBoys ?? ""}
                  onChange={(e) =>
                    setIntakeForm({
                      ...intakeForm,
                      childrenBoys: Number(e.target.value),
                    })
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">
                  عدد البنات (إناث)
                </label>
                <input
                  type="number"
                  min={0}
                  value={intakeForm.childrenGirls ?? ""}
                  onChange={(e) =>
                    setIntakeForm({
                      ...intakeForm,
                      childrenGirls: Number(e.target.value),
                    })
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">
                  المجموع
                </label>
                <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold">
                  {(intakeForm.childrenBoys || 0) +
                    (intakeForm.childrenGirls || 0)}
                </div>
              </div>
            </>
          )}

          {/* التعليم */}
          <div className="lg:col-start-1">
            <label className="block text-sm font-bold text-slate-600 mb-2">
              المستوى التعليمي
            </label>
            <select
              value={intakeForm.educationLevel}
              onChange={(e) =>
                setIntakeForm({
                  ...intakeForm,
                  educationLevel: e.target.value as any,
                })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            >
              <option value="University">جامعي</option>
              <option value="HighSchool">ثانوي</option>
              <option value="Illiterate">أمّي</option>
            </select>
          </div>

          {intakeForm.educationLevel === "University" && (
            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-slate-600 mb-2">
                التخصص
              </label>
              <input
                type="text"
                value={intakeForm.specialization}
                onChange={(e) =>
                  setIntakeForm({
                    ...intakeForm,
                    specialization: e.target.value,
                  })
                }
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900"
                placeholder="مثال: هندسة، طب..."
              />
            </div>
          )}
        </div>
      </div>

      {/* ===============================  
         حقول حسب نوع النزيل  
      =============================== */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        {/* MILITARY */}
        {intakeForm.type === "MILITARY" && (
          <div className="space-y-4">
            <h4 className="font-bold text-emerald-700 flex items-center gap-2">
              <Shield size={18} /> البيانات العسكرية
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">
                  الوحدة العسكرية
                </label>
                <input
                  type="text"
                  value={intakeForm.unit}
                    setEditBelongingData({
    ...editBelongingData,
    weaponNumber: e.target.value,
  })
   }onChange={(e) =>
                    setIntakeForm({ ...intakeForm, unit: e.target.value })
                  }
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* POW */}
        {intakeForm.type === "POW" && (
          <div className="space-y-4">
            <h4 className="font-bold text-red-700 flex items-center gap-2">
              <AlertOctagon size={18} /> بيانات الأسر
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">
                  الجبهة المشارك فيها
                </label>
                <input
                  type="text"
                  value={intakeForm.front}
                  onChange={(e) =>
                    setIntakeForm({ ...intakeForm, front: e.target.value })
                  }
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">
                  مكان الأسر
                </label>
                <input
                  type="text"
                  value={intakeForm.capturePlace || ""}
                  onChange={(e) =>
                    setIntakeForm({
                      ...intakeForm,
                      capturePlace: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUSPECT */}
        {intakeForm.type === "SUSPECT" && (
          <div className="space-y-4">
            <h4 className="font-bold text-primary-700 flex items-center gap-2">
              <HelpCircle size={18} /> بيانات العمل (للمشتبه به)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">
                  طبيعة العمل
                </label>
                <select
                  value={intakeForm.workStatus}
                  onChange={(e) =>
                    setIntakeForm({
                      ...intakeForm,
                      workStatus: e.target.value as any,
                    })
                  }
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900"
                >
                  <option value="Unemployed">لا يعمل</option>
                  <option value="Military">عسكري (سابق/حالي)</option>
                  <option value="Civilian">موظف مدني</option>
                </select>
              </div>

              {intakeForm.workStatus !== "Unemployed" && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">
                      المسمى الوظيفي
                    </label>
                    <input
                      type="text"
                      value={intakeForm.jobTitle}
                      onChange={(e) =>
                        setIntakeForm({
                          ...intakeForm,
                          jobTitle: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">
                      جهة العمل
                    </label>
                    <input
                      type="text"
                      value={intakeForm.employer}
                      onChange={(e) =>
                        setIntakeForm({
                          ...intakeForm,
                          employer: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===============================  
         بيانات التهمة  
      =============================== */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-700 border-r-4 border-slate-400 pr-3">
          بيانات التهمة والإحالة
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">
              التهمة المنسوبة
            </label>
            <input
              required
              type="text"
              value={intakeForm.primaryCharge}
              onChange={(e) =>
                setIntakeForm({
                  ...intakeForm,
                  primaryCharge: e.target.value,
                })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">
              نوع التهمة
            </label>
            <select
              value={intakeForm.chargeType}
              onChange={(e) =>
                setIntakeForm({
                  ...intakeForm,
                  chargeType: e.target.value as any,
                })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            >
              <option value="Major">جسمية</option>
              <option value="Regular">عادية</option>
              <option value="Minor">بسيطة</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">
              الجهة المحيلة
            </label>
            <select
              value={intakeForm.referringAuthority}
              onChange={(e) =>
                setIntakeForm({
                  ...intakeForm,
                  referringAuthority: e.target.value,
                })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            >
              <option>الشرطة العسكرية</option>
              <option>مكافحة المخدرات</option>
              <option>النيابة العامة</option>
              <option>أمن الدولة</option>
              <option>الاستخبارات</option>
            </select>
          </div>
        </div>
      </div>

      {/* زر الحفظ */}
      <div className="pt-6 border-t border-slate-100">
        <button
          type="submit"
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
        >
          <Save size={20} />
          حفظ بيانات النزيل وإحالة للفحص
        </button>
      </div>
    </form>
  </div>
);

/* ===============================
        شاشة الفحص
  =============================== */
const renderInspection = () => {
  const pending = inmates.filter(
    (i) => i.status === InmateStatus.PROCESSING
  );

  const typeLabels: any = {
    PHONE: "جوال",
    WEAPON: "سلاح",
    MONEY: "مبالغ مالية",
    DOCUMENT: "وثيقة",
    OTHER: "أخرى",
  };

  const fieldLabels: any = {
    phoneType: "نوع الجوال",
    condition: "الحالة",
    weaponType: "نوع السلاح",
    weaponNumber: "رقم السلاح",
    magazines: "عدد المخازن",
    ammo: "الذخيرة بالمخازن",
    currency: "العملة",
    amount: "المبلغ",
    docType: "نوع الوثيقة",
    name: "اسم المضبوطة",
    notes: "ملاحظات",
  };

  return (
    <>
      <div className="space-y-6 animate-fadeIn">

        {/* قائمة انتظار الفحص */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
          <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
            <ClipboardList size={18} /> النزلاء بانتظار الفحص
          </h3>

          {pending.length === 0 ? (
            <p className="text-slate-500">لا يوجد نزلاء بانتاطر الفحص.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((i) => (
                <div
                  key={i.id}
                  onClick={() => setSelectedInmateForInspection(i.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedInmateForInspection === i.id
                      ? "border-primary-600 bg-primary-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="font-bold text-slate-800">{i.fullName}</div>
                  <div className="text-xs text-slate-500">{i.referringAuthority}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* نموذج الفحص */}
        {selectedInmateForInspection && (
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
            <h3 className="text-xl font-bold mb-4 flex gap-2 text-slate-800">
              <Scan size={18} /> إجراء الفحص
            </h3>

            <div className="space-y-4">

              {/* التفتيش الجسدي */}
              <div>
                <label className="font-bold mb-1 block">هل تم التفتيش الجسدي؟</label>
                <select
                  value={inspectionForm.isPhysicallyInspected}
                  onChange={(e) =>
                    setInspectionForm({
                      ...inspectionForm,
                      isPhysicallyInspected: e.target.value as any,
                    })
                  }
                  className="border p-2 rounded-xl w-full"
                >
                  <option value="No">لم يتم</option>
                  <option value="Yes">تم التفتيش</option>
                </select>
              </div>

              {/* ملاحظات التفتيش */}
              <div>
                <label className="font-bold mb-1 block">ملاحظات التفتيش الجسدي</label>
                <textarea
                  value={inspectionForm.physicalNotes}
                  onChange={(e) =>
                    setInspectionForm({
                      ...inspectionForm,
                      physicalNotes: e.target.value,
                    })
                  }
                  className="border p-3 rounded-xl w-full"
                />
              </div>

              {/* اختيار العنبر */}
              <div>
                <label className="font-bold mb-2 block">اختيار العنبر (اختياري)</label>
                <select
                  value={inspectionWardId}
                  onChange={(e) => setInspectionWardId(e.target.value)}
                  className="border p-2 rounded-xl w-full"
                >
                  <option value="">إرسال لقائمة انتظار التسكين</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} — سعة {w.capacity}
                    </option>
                  ))}
                </select>
              </div>

              {/* =====================
                    المضبوطات
                  ===================== */}
              <div className="bg-white p-4 rounded-2xl border border-slate-300 mt-6">
                <h3 className="text-lg font-bold text-slate-700 mb-3">المضبوطات</h3>

                {/* نوع المضبوطة */}
                <label className="font-bold mb-1 block">نوع المضبوطة</label>
                <select
                  value={newItemType}
                  onChange={(e) => {
                    setNewItemType(e.target.value);
                    setNewItemData({});
                  }}
                  className="border p-2 rounded-xl w-full mb-4"
                >
                  <option value="">اختر...</option>
                  <option value="PHONE">جوال</option>
                  <option value="WEAPON">سلاح</option>
                  <option value="MONEY">مبالغ مالية</option>
                  <option value="DOCUMENT">وثيقة</option>
                  <option value="OTHER">أخرى</option>
                </select>

                {/* =====================
                    حقول المضبوطات حسب النوع
                ===================== */}

                {newItemType === "PHONE" && (
                  <div className="space-y-3">
                    <input
                      placeholder="نوع الجوال"
                      className="border p-2 rounded-xl w-full"
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, phoneType: e.target.value })
                      }
                    />
                    <select
                      className="border p-2 rounded-xl w-full"
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, condition: e.target.value })
                      }
                    >
                      <option value="">الحالة</option>
                      <option value="سليم">سليم</option>
                      <option value="مكسور">مكسور</option>
                      <option value="لا يعمل">لا يعمل</option>
                    </select>
                    <textarea
                      placeholder="ملاحظات"
                      className="border p-2 rounded-xl w-full"
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, notes: e.target.value })
                      }
                    />
                  </div>
                )}

                {newItemType === "WEAPON" && (
                  <div className="space-y-3">
                    <input
                      placeholder="نوع السلاح"
                      className="border p-2 rounded-xl w-full"
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, weaponType: e.target.value })
                      }
                    />
                    <input
                      placeholder="رقم السلاح"
                      className="border p-2 rounded-xl w-full"
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, weaponNumber: e.target.value })
                      }
                    />
                    <input
                      placeholder="عدد المخازن"
                      type="number"
                      className="border p-2 rounded-xl w-full"
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, magazines: e.target.value })
                      }
                    />
                    <input
                      placeholder="الذخيرة بالمخازن"
                      type="number"
                      className="border p-2 rounded-xl w-full"
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, ammo: e.target.value })
                      }
                    />
                    <textarea
                      placeholder="ملاحظات"
                      className="border p-2 rounded-xl w-full"
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, notes: e.target.value })
                      }
                    />
                  </div>
                )}

                {newItemType === "MONEY" && (
                  <div className="space-y-3">
                    <input
                      placeholder="العملة"
                      className="border p-2 rounded-xl w-full"
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, currency: e.target.value })
                      }
                    />
                    <input
                      placeholder="المبلغ"
                      type="number"
                      className="border p-2 rounded-xl w-full"
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, amount: e.target.value })
                      }
                    />
                    <textarea
                      placeholder="ملاحظات"
                      className="border p-2 rounded-xl w-full"
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, notes: e.target.value })
                      }
                    />
                  </div>
                )}

                {newItemType === "DOCUMENT" && (
                  <div className="space-y-3">
                    <input
                      placeholder="نوع الوثيقة"
                      className="border p-2 rounded-xl w-full"
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, docType: e.target.value })
                      }
                    />
                    <textarea
                      placeholder="ملاحظات"
                      className="border p-2 rounded-xl w-full"
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, notes: e.target.value })
                      }
                    />
                  </div>
                )}

                {newItemType === "OTHER" && (
                  <div className="space-y-3">
                    <input
                      placeholder="اسم المضبوطة"
                      className="border p-2 rounded-xl w-full"
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, name: e.target.value })
                      }
                    />
                    <textarea
                      placeholder="ملاحظات"
                      className="border p-2 rounded-xl w-full"
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, notes: e.target.value })
                      }
                    />
                  </div>
                )}

                {/* زر الإضافة */}
                <button
                  type="button"
                  onClick={() => {
                    if (!newItemType) return alert("اختر نوع المضبوطة");

                    const item = {
                      id: Math.random().toString(36).substring(2, 9),
                      type: newItemType,
                      data: newItemData,
                    };

                    setInspectionForm({
                      ...inspectionForm,
                      belongings: [...(inspectionForm.belongings || []), item],
                    });

                    setNewItemType("");
                    setNewItemData({});
                  }}
                  className="w-full mt-4 py-2 rounded-xl bg-primary-600 text-white font-bold"
                >
                  إضافة المضبوطة
                </button>

                {/* عرض المضبوطات */}
                {(inspectionForm.belongings || []).length > 0 &&
                  inspectionForm.belongings!.map((item: any, index) => (
                    <div key={item.id} className="p-4 mt-4 bg-slate-50 border rounded-xl">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-bold text-primary-700 text-lg">
                            {typeLabels[item.type]}
                          </div>

                          <div className="text-sm text-slate-600 space-y-1">
                            {Object.entries(item.data).map(([k, v]) => (
                              <div key={k}>
                                <strong>{fieldLabels[k]}:</strong> {v as any}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => {
                              setEditingBelongingIndex(index);
                              setEditBelongingType(item.type);
                              setEditBelongingData({ ...item.data });
                            }}
                            className="text-blue-600 font-bold"
                          >
                            تعديل
                          </button>

                          <button
                            onClick={() => {
                              setInspectionForm({
                                ...inspectionForm,
                                belongings: inspectionForm.belongings!.filter(
                                  (_: any, i: number) => i !== index
                                ),
                              });
                            }}
                            className="text-red-600 font-bold"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* زر اعتماد الفحص */}
              <button
                onClick={handleInspectionSubmit}
                className="w-full py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-md mt-6"
              >
                اعتماد الفحص
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =============================
            نافذة تعديل المضبوطات
      ============================== */}
      {editingBelongingIndex !== null && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                تعديل المضبوطة — {typeLabels[editBelongingType]}
              </h3>

              <button
                onClick={() => {
                  setEditingBelongingIndex(null);
                  setEditBelongingType("");
                  setEditBelongingData({});
                }}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              
              {/* PHONE */}
              {editBelongingType === "PHONE" && (
                <div className="space-y-3">
                  <input
                    placeholder="نوع الجوال"
                    className="border p-2 rounded-xl w-full"
                    value={editBelongingData.phoneType || ""}
                    onChange={(e) =>
                      setEditBelongingData({
                        ...editBelongingData,
                        phoneType: e.target.value,
                      })
                    }
                  />
                  <select
                    className="border p-2 rounded-xl w-full"
                    value={editBelongingData.condition || ""}
                    onChange={(e) =>
                      setEditBelongingData({
                        ...editBelongingData,
                        condition: e.target.value,
                      })
                    }
                  >
                    <option value="">اختر الحالة</option>
                    <option value="سليم">سليم</option>
                    <option value="مكسور">مكسور</option>
                    <option value="لا يعمل">لا يعمل</option>
                  </select>
                  <textarea
                    placeholder="ملاحظات"
                    className="border p-2 rounded-xl w-full"
                    value={editBelongingData.notes || ""}
                    onChange={(e) =>
                      setEditBelongingData({
                        ...editBelongingData,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              {/* WEAPON */}
              {editBelongingType === "WEAPON" && (
                <div className="space-y-3">
                  <input
                    placeholder="نوع السلاح"
                    className="border p-2 rounded-xl w-full"
                    value={editBelongingData.weaponType || ""}
                    onChange={(e) =>
                      setEditBelongingData({
                        ...editBelongingData,
                        weaponType: e.target.value,
                      })
                    }
                  />
                  <input
                    placeholder="رقم السلاح"
                    className="border p-2 rounded-xl w-full"
                    value={editBelongingData.weaponNumber || ""}
                    onChange={(e) =>
                      setEditBelongingData({
                        ...editBelongingData,
                        weaponNumber: e.target.value,
                      })
                    }
                  />
                  <input
                    placeholder="عدد المخازن"
                    type="number"
                    className="border p-2 rounded-xl w-full"
                    value={editBelongingData.magazines || ""}
                    onChange={(e) =>
                      setEditBelongingData({
                        ...editBelongingData,
                        magazines: e.target.value,
                      })
                    }
                  />
                  <input
                    placeholder="الذخيرة"
                    type="number"
                    className="border p-2 rounded-xl w-full"
                    value={editBelongingData.ammo || ""}
                    onChange={(e) =>
                      setEditBelongingData({
                        ...editBelongingData,
                        ammo: e.target.value,
                      })
                    }
                  />
                  <textarea
                    placeholder="ملاحظات"
                    className="border p-2 rounded-xl w-full"
                    value={editBelongingData.notes || ""}
                    onChange={(e) =>
                      setEditBelongingData({
                        ...editBelongingData,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              {/* MONEY */}
              {editBelongingType === "MONEY" && (
                <div className="space-y-3">
                  <input
                    placeholder="العملة"
                    className="border p-2 rounded-xl w-full"
                    value={editBelongingData.currency || ""}
                    onChange={(e) =>
                      setEditBelongingData({
                        ...editBelongingData,
                        currency: e.target.value,
                      })
                    }
                  />
                  <input
                    placeholder="المبلغ"
                    type="number"
                    className="border p-2 rounded-xl w-full"
                    value={editBelongingData.amount || ""}
                    onChange={(e) =>
                      setEditBelongingData({
                        ...editBelongingData,
                        amount: e.target.value,
                      })
                    }
                  />
                  <textarea
                    placeholder="ملاحظات"
                    className="border p-2 rounded-xl w-full"
                    value={editBelongingData.notes || ""}
                    onChange={(e) =>
                      setEditBelongingData({
                        ...editBelongingData,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              {/* DOCUMENT */}
              {editBelongingType === "DOCUMENT" && (
                <div className="space-y-3">
                  <input
                    placeholder="نوع الوثيقة"
                    className="border p-2 rounded-xl w-full"
                    value={editBelongingData.docType || ""}
                    onChange={(e) =>
                      setEditBelongingData({
                        ...editBelongingData,
                        docType: e.target.value,
                      })
                    }
                  />
                  <textarea
                    placeholder="ملاحظات"
                    className="border p-2 rounded-xl w-full"
                    value={editBelongingData.notes || ""}
                    onChange={(e) =>
                      setEditBelongingData({
                        ...editBelongingData,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              {/* OTHER */}
              {editBelongingType === "OTHER" && (
                <div className="space-y-3">
                  <input
                    placeholder="اسم المضبوطة"
                    className="border p-2 rounded-xl w-full"
                    value={editBelongingData.name || ""}
                    onChange={(e) =>
                      setEditBelongingData({
                        ...editBelongingData,
                        name: e.target.value,
                      })
                    }
                  />
                  <textarea
                    placeholder="ملاحظات"
                    className="border p-2 rounded-xl w-full"
                    value={editBelongingData.notes || ""}
                    onChange={(e) =>
                      setEditBelongingData({
                        ...editBelongingData,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>

            {/* أزرار الحفظ */}
            <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  setEditingBelongingIndex(null);
                  setEditBelongingType("");
                  setEditBelongingData({});
                }}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
              >
                إلغاء
              </button>

              <button
                onClick={() => {
                  const updated = inspectionForm.belongings!.map(
                    (bel, idx) =>
                      idx === editingBelongingIndex
                        ? { ...bel, data: editBelongingData }
                        : bel
                  );

                  setInspectionForm({
                    ...inspectionForm,
                    belongings: updated,
                  });

                  setEditingBelongingIndex(null);
                  setEditBelongingType("");
                  setEditBelongingData({});
                }}
                className="flex-1 py-2 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700"
              >
                حفظ التعديل
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ===============================
        شاشة التسكين
  =============================== */
const renderHousing = () => {
  const ready = inmates.filter(
    (i) => i.status === InmateStatus.READY_FOR_HOUSING
  );

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* قائمة انتظار التسكين */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-200">
        <h3 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
          <FileBadge size={18} /> قائمة انتظار التسكين
        </h3>

        {ready.length === 0 ? (
          <p className="text-slate-500 text-sm">لا يوجد نزلاء بانتظار التسكين.</p>
        ) : (
          <div className="space-y-3">
            {ready.map((i) => (
              <div
                key={i.id}
                onClick={() => setSelectedInmateForHousing(i.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  selectedInmateForHousing === i.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="font-bold text-slate-800">{i.fullName}</div>
                <div className="text-sm text-slate-500">
                  {i.status === InmateStatus.READY_FOR_HOUSING
                    ? "جاهز للتسكين – تم الفحص"
                    : "بانتظار استكمال التسكين"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* اختيار العنبر */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
          <Building size={18} /> اختيار العنبر
        </h3>

        <select
          value={selectedWardId}
          onChange={(e) => setSelectedWardId(e.target.value)}
          className="w-full border border-slate-300 rounded-2xl px-4 py-2 text-sm mb-4"
        >
          <option value="">اختر العنبر...</option>
          {wards.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} — سعة {w.capacity}
            </option>
          ))}
        </select>

        <button
          onClick={handleAssignWardFromHousing}
          disabled={!selectedInmateForHousing || !selectedWardId}
          className={`w-full px-4 py-3 rounded-2xl text-white font-bold shadow ${
            selectedInmateForHousing && selectedWardId
              ? "bg-primary-600 hover:bg-primary-700"
              : "bg-slate-300 cursor-not-allowed"
          }`}
        >
          تسكين النزيل
        </button>
      </div>
    </div>
  );
};

/* ===============================
        شاشة الحركة
  =============================== */
const renderMovements = () => (
  <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 animate-fadeIn">
    <h3 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
      <ArrowLeft size={20} /> حركة النزلاء
    </h3>
    <MovementsManager onShowProfile={onShowProfile} />
  </div>
);

/* ===============================
        شاشة الزيارات
  =============================== */
const renderVisits = () => (
  <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 animate-fadeIn">
    <h3 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
      <FileBadge size={20} /> الزيارات
    </h3>
    <VisitManager />
  </div>
);

/* ===============================
        شاشة بيانات النزلاء
  =============================== */
const renderInmateData = () => (
  <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 animate-fadeIn">
    <h3 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
      <FileBadge size={20} /> بيانات النزلاء
    </h3>
    <InmateManager onShowProfile={onShowProfile} />
  </div>
);

/* ===============================
        التبويبات الرئيسية
  =============================== */
return (
  <div className="space-y-6">
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200">
      {[
        { id: "NEW_INMATE", label: "تسجيل نزيل", icon: UserPlus },
        { id: "INSPECTION", label: "الفحص والتفتيش", icon: Scan },
        { id: "HOUSING", label: "التسكين", icon: Building },
        { id: "INMATE_DATA", label: "سجل بيانات النزلاء", icon: FileBadge },
        { id: "VISITS", label: "الزيارات", icon: FileBadge },
        { id: "WARD_SETUP", label: "تهيئة العنابر", icon: Layout },
        { id: "MOVEMENTS", label: "الحركة", icon: ArrowLeft },
      ].map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setCurrentView(tab.id)}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 ${
            currentView === tab.id
              ? "border-primary-600 text-primary-700 bg-primary-50/50"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          <tab.icon size={18} />
          {tab.label}
        </button>
      ))}
    </div>

    {/* المحتوى */}
    <div className="animate-fadeIn">
      {currentView === "NEW_INMATE" && renderNewInmate()}
      {currentView === "INSPECTION" && renderInspection()}
      {currentView === "HOUSING" && renderHousing()}
      {currentView === "INMATE_DATA" && renderInmateData()}
      {currentView === "VISITS" && renderVisits()}
      {currentView === "WARD_SETUP" && renderWardSetup()}
      {currentView === "MOVEMENTS" && renderMovements()}
    </div>
  </div>
);

};

export default PrisonAdministration;
