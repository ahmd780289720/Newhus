import React, { useState } from "react";
import { useSecurity } from "../context/SecurityContext";

const EditInmateForm = ({ inmate, onClose }) => {
  const { updateInmate } = useSecurity();

  const [formData, setFormData] = useState({
    fullName: inmate.fullName,
    nationalId: inmate.nationalId,
    type: inmate.type,
    birthDate: inmate.birthDate,
    arrestLocation: inmate.arrestLocation || "",
    entryDate: inmate.entryDate,
    primaryCharge: inmate.primaryCharge,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await updateInmate(inmate.id, formData);
    onClose();
  };

  return (
    <div className="p-6 rounded-2xl bg-white shadow-lg animate-fadeIn space-y-4 mt-4">

      <h2 className="text-xl font-bold text-slate-800 text-center">
        تعديل بيانات النزيل
      </h2>

      <div className="space-y-3">
        
        <label className="text-sm font-bold">الاسم الكامل</label>
        <input
          className="w-full p-2 rounded-xl border border-slate-300"
          value={formData.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
        />

        <label className="text-sm font-bold">رقم الهوية</label>
        <input
          className="w-full p-2 rounded-xl border border-slate-300"
          value={formData.nationalId}
          onChange={(e) => handleChange("nationalId", e.target.value)}
        />

        <label className="text-sm font-bold">نوع النزيل</label>
        <select
          className="w-full p-2 rounded-xl border border-slate-300"
          value={formData.type}
          onChange={(e) => handleChange("type", e.target.value)}
        >
          <option value="SUSPECT">مشتبه</option>
          <option value="POW">أسير</option>
          <option value="MILITARY">عسكري مخالف</option>
        </select>

        <label className="text-sm font-bold">مكان القبض</label>
        <input
          className="w-full p-2 rounded-xl border border-slate-300"
          value={formData.arrestLocation}
          onChange={(e) => handleChange("arrestLocation", e.target.value)}
        />

        <label className="text-sm font-bold">التهمة الأساسية</label>
        <input
          className="w-full p-2 rounded-xl border border-slate-300"
          value={formData.primaryCharge}
          onChange={(e) => handleChange("primaryCharge", e.target.value)}
        />

      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSave}
          className="flex-1 bg-primary-600 text-white py-2 rounded-xl font-bold"
        >
          حفظ التعديلات
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-xl font-bold"
        >
          إلغاء
        </button>
      </div>

    </div>
  );
};

export default EditInmateForm;
