import React, { useState } from "react";
import { ChevronLeft, Calendar, Filter, Printer } from "lucide-react";
import { useSecurity } from "../context/SecurityContext";

const ReportsCenter: React.FC<{ onNavigate: any }> = ({ onNavigate }) => {
  const { inmates } = useSecurity();

  const [reportType, setReportType] = useState("");
  const [detailType, setDetailType] = useState("SUMMARY"); // SUMMARY | DETAIL

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [fromInmate, setFromInmate] = useState("");
  const [toInmate, setToInmate] = useState("");

  return (
    <div className="pb-24 px-4 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center gap-4 pt-6 mb-6">
        <button
          onClick={() => onNavigate("DASHBOARD")}
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200"
        >
          <ChevronLeft size={24} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">التقارير</h1>
          <p className="text-sm text-slate-500">إنشاء وطباعة التقارير الرسمية</p>
        </div>
      </div>

      {/* Filters Box */}
      <div className="bg-white p-6 rounded-[2rem] border shadow-sm space-y-6">
        
        {/* Report Type */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2">
            نوع التقرير
          </label>

          <select
            className="w-full p-3 rounded-xl bg-slate-50 border text-slate-700"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="">اختر نوع التقرير</option>
            <option value="INMATES">سجل النزلاء</option>
            <option value="VISITS">الزيارات</option>
            <option value="MOVEMENTS">التحركات</option>
            <option value="CONFISCATIONS">المضبوطات</option>
            <option value="CASES">القضايا</option>
            <option value="MINUTES">محاضر التحقيق</option>
            <option value="FULL_LIFE">دورة حياة النزيل</option>
          </select>
        </div>

        {/* Summary / Detail */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2">
            نوع التفاصيل
          </label>

          <select
            className="w-full p-3 rounded-xl bg-slate-50 border text-slate-700"
            value={detailType}
            onChange={(e) => setDetailType(e.target.value)}
          >
            <option value="SUMMARY">إجمالي</option>
            <option value="DETAIL">تحليلي</option>
          </select>
        </div>

        {/* Inmate Range */}
        <div className="grid grid-cols-2 gap-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">
              من نزيل
            </label>

            <input
              className="w-full p-3 bg-slate-50 border rounded-xl"
              placeholder="اختر نزيل"
              value={fromInmate}
              readOnly
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">
              إلى نزيل
            </label>

            <input
              className="w-full p-3 bg-slate-50 border rounded-xl"
              placeholder="اختر نزيل"
              value={toInmate}
              readOnly
            />
          </div>

        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">
              من تاريخ
            </label>
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border">
              <Calendar size={18} className="text-slate-400" />
              <input
                type="date"
                className="bg-transparent w-full text-slate-700"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">
              إلى تاريخ
            </label>
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border">
              <Calendar size={18} className="text-slate-400" />
              <input
                type="date"
                className="bg-transparent w-full text-slate-700"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Print Button */}
      <div className="pt-10">
        <button
          className="w-full bg-blue-600 text-white rounded-[2rem] py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-lg"
        >
          <Printer size={22} /> طباعة
        </button>
      </div>

    </div>
  );
};

export default ReportsCenter;
