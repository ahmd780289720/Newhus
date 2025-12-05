import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  Plus,
  Save,
  X,
  Trash2,
  Filter,
  Info,
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { Visit, VisitStatus } from '../types';

const VisitManager: React.FC = () => {
  const { inmates, visits, addVisit, updateVisit, deleteVisit } = useSecurity();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterInmateId, setFilterInmateId] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [formData, setFormData] = useState({
    inmateId: '',
    visitorName: '',
    visitorIdNumber: '',
    relation: '',
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: '10:00',
    durationMinutes: 30,
    status: 'SCHEDULED' as VisitStatus,
    notes: '',
  });

  // ✅ أول ما تفتح الشاشة، لو في نزلاء، اختَر أول واحد تلقائيًا
  useEffect(() => {
    if (!formData.inmateId && inmates.length > 0) {
      setFormData((prev) => ({ ...prev, inmateId: inmates[0].id }));
    }
  }, [inmates]);

  const resetForm = () => {
    setFormData({
      inmateId: inmates.length > 0 ? inmates[0].id : '',
      visitorName: '',
      visitorIdNumber: '',
      relation: '',
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: '10:00',
      durationMinutes: 30,
      status: 'SCHEDULED',
      notes: '',
    });
  };

  const handleCreateVisit = () => {
    const inmate = inmates.find((i) => i.id === formData.inmateId);
    if (!inmate) {
      alert('يجب اختيار نزيل أولاً');
      return;
    }
    if (!formData.visitorName.trim()) {
      alert('أدخل اسم الزائر');
      return;
    }

    const newVisit: Visit = {
      id: Date.now().toString(),
      inmateId: inmate.id,
      inmateName: inmate.fullName, // ✅ إصلاح الاسم هنا
      visitorName: formData.visitorName.trim(),
      visitorIdNumber: formData.visitorIdNumber.trim() || undefined,
      relation: formData.relation.trim() || undefined,
      visitDate: formData.visitDate,
      visitTime: formData.visitTime,
      durationMinutes: Number(formData.durationMinutes) || undefined,
      status: formData.status,
      notes: formData.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    addVisit(newVisit);
    resetForm();
    setIsModalOpen(false);
  };

  const handleStatusChange = (visit: Visit, status: VisitStatus) => {
    updateVisit({ ...visit, status });
  };

  const handleDeleteVisit = (visit: Visit) => {
    if (
      window.confirm(
        `هل أنت متأكد من حذف زيارة الزائر (${visit.visitorName}) للنزيل (${visit.inmateName})؟`,
      )
    ) {
      deleteVisit(visit.id);
    }
  };

  const filteredVisits = useMemo(() => {
    return visits
      .filter((v) =>
        filterInmateId === 'ALL' ? true : v.inmateId === filterInmateId,
      )
      .filter((v) =>
        filterStatus === 'ALL' ? true : v.status === filterStatus,
      )
      .sort((a, b) => {
        const aKey = `${a.visitDate} ${a.visitTime}`;
        const bKey = `${b.visitDate} ${b.visitTime}`;
        return aKey < bKey ? 1 : -1;
      });
  }, [visits, filterInmateId, filterStatus]);

  const getStatusBadgeClasses = (status: VisitStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'NO_SHOW':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* العنوان + زر إضافة */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">إدارة الزيارات</h2>
          <p className="text-slate-500 text-sm">
            تسجيل وتنظيم زيارات النزلاء داخل إدارة السجن
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow hover:bg-emerald-700"
        >
          <Plus size={18} />
          تسجيل زيارة جديدة
        </button>
      </div>

      {/* فلاتر سريعة */}
      <div className="grid md:grid-cols-3 gap-3 bg-white rounded-3xl border border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterInmateId}
            onChange={(e) => setFilterInmateId(e.target.value)}
            className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">كل النزلاء</option>
            {inmates.map((i) => (
              <option key={i.id} value={i.id}>
                {i.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">كل الحالات</option>
            <option value="SCHEDULED">مجدولة</option>
            <option value="COMPLETED">مكتملة</option>
            <option value="CANCELLED">ملغاة</option>
            <option value="NO_SHOW">لم يحضر</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 justify-end">
          <Users size={16} />
          <span>إجمالي الزيارات: {filteredVisits.length}</span>
        </div>
      </div>

      {/* بطاقات الزيارات بدل الجدول */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4">
        {filteredVisits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <Info size={32} className="mb-3" />
            <p className="text-sm">
              لا توجد زيارات مسجلة وفقًا للفلاتر الحالية.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredVisits.map((v) => (
              <div
                key={v.id}
                className="border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all bg-slate-50/80 flex flex-col justify-between"
              >
                {/* أعلى البطاقة: النزيل + الحالة */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-xs text-slate-400">النزيل</p>
                    <p className="font-bold text-slate-800">
                      {v.inmateName || 'غير محدد'}
                    </p>
                  </div>
                  <span
                    className={
                      'px-2 py-1 text-[11px] font-bold rounded-full border ' +
                      getStatusBadgeClasses(v.status)
                    }
                  >
                    {v.status === 'SCHEDULED'
                      ? 'مجدولة'
                      : v.status === 'COMPLETED'
                      ? 'مكتملة'
                      : v.status === 'CANCELLED'
                      ? 'ملغاة'
                      : 'لم يحضر'}
                  </span>
                </div>

                {/* بيانات الزيارة */}
                <div className="space-y-1 text-sm mb-3">
                  <div>
                    <span className="text-slate-500 text-xs">الزائر:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {v.visitorName}
                    </span>
                    {v.relation && (
                      <span className="text-xs text-slate-500">
                        {' '}
                        ({v.relation})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{v.visitDate}</span>
                    <span className="mx-1">•</span>
                    <Clock size={14} className="text-slate-400" />
                    <span>{v.visitTime}</span>
                    {v.durationMinutes && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{v.durationMinutes} دقيقة</span>
                      </>
                    )}
                  </div>

                  {v.notes && (
                    <p className="text-xs text-slate-500 mt-1">
                      ملاحظات: {v.notes}
                    </p>
                  )}
                </div>

                {/* أزرار الإجراء */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex gap-2">
                    {v.status !== 'COMPLETED' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(v, 'COMPLETED')}
                        className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      >
                        تعليم كمكتملة
                      </button>
                    )}
                    {v.status !== 'CANCELLED' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(v, 'CANCELLED')}
                        className="px-3 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100"
                      >
                        إلغاء
                      </button>
                    )}
                    {v.status !== 'NO_SHOW' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(v, 'NO_SHOW')}
                        className="px-3 py-1 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100"
                      >
                        لم يحضر
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteVisit(v)}
                    className="p-1.5 rounded-full hover:bg-rose-50 text-rose-500"
                    title="حذف الزيارة"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مودال تسجيل زيارة جديدة */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                تسجيل زيارة جديدة
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* اختيار النزيل */}
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">
                  النزيل
                </label>
                <select
                  value={formData.inmateId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      inmateId: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">اختر النزيل...</option>
                  {inmates.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* بيانات الزائر */}
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">
                    اسم الزائر
                  </label>
                  <input
                    type="text"
                    value={formData.visitorName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        visitorName: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">
                    رقم هوية الزائر (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.visitorIdNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        visitorIdNumber: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">
                  صلة القرابة / العلاقة (اختياري)
                </label>
                <input
                  type="text"
                  value={formData.relation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      relation: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm"
                  placeholder="أب، أم، أخ، محامي..."
                />
              </div>

              {/* التاريخ والوقت */}
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">
                    تاريخ الزيارة
                  </label>
                  <input
                    type="date"
                    value={formData.visitDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        visitDate: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">
                    وقت الزيارة
                  </label>
                  <input
                    type="time"
                    value={formData.visitTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        visitTime: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">
                    المدة (بالدقائق)
                  </label>
                  <input
                    type="number"
                    min={5}
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        durationMinutes: Number(e.target.value),
                      }))
                    }
                    className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* الحالة */}
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">
                  حالة الزيارة
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as VisitStatus,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm"
                >
                  <option value="SCHEDULED">مجدولة</option>
                  <option value="COMPLETED">مكتملة</option>
                  <option value="CANCELLED">ملغاة</option>
                  <option value="NO_SHOW">لم يحضر</option>
                </select>
              </div>

              {/* ملاحظات */}
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-2xl text-sm font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleCreateVisit}
                  className="px-4 py-2 rounded-2xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2"
                >
                  <Save size={16} />
                  حفظ الزيارة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitManager;	

