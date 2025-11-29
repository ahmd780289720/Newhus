
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Download, Filter, Users, Activity, AlertTriangle, UserX, Printer, Calendar, FileText, Gavel } from 'lucide-react';
import { ViewState, Department, InmateType } from '../types';
import { useSecurity } from '../context/SecurityContext';

interface ReportsManagerProps {
  onNavigate: (view: ViewState) => void;
}

const ReportsManager: React.FC<ReportsManagerProps> = ({ onNavigate }) => {
  const { currentUser, inmates, wantedPersons, movements, reports, cases, minutes } = useSecurity();
  const [reportType, setReportType] = useState<string>('');
  const [format, setFormat] = useState<'PDF' | 'Excel'>('PDF');
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterInmateType, setFilterInmateType] = useState<string>('All');

  // Define all available reports with their allowed departments
  const allReports = [
    { 
      id: 'Inmates', 
      label: 'سجل النزلاء الشامل', 
      icon: Users, 
      desc: 'بيانات النزلاء، القضايا، والحالة',
      allowedDepts: [Department.PRISON_ADMIN, Department.GENERAL_ADMIN]
    },
    { 
      id: 'Movements', 
      label: 'سجل التحركات والدوريات', 
      icon: Activity, 
      desc: 'الدخول، الخروج، والمحاكم',
      allowedDepts: [Department.PRISON_ADMIN, Department.GENERAL_ADMIN]
    },
    { 
      id: 'Behavior', 
      label: 'السلوك والانضباط', 
      icon: AlertTriangle, 
      desc: 'المخالفات والمكافآت',
      allowedDepts: [Department.PRISON_ADMIN, Department.GENERAL_ADMIN]
    },
    { 
      id: 'Cases', 
      label: 'سجل القضايا الجنائية', 
      icon: Gavel, 
      desc: 'القضايا النشطة والمغلقة',
      allowedDepts: [Department.INVESTIGATIONS, Department.GENERAL_ADMIN]
    },
    { 
      id: 'Minutes', 
      label: 'أرشيف محاضر التحقيق', 
      icon: FileText, 
      desc: 'سجل المحاضر والاستنتاجات',
      allowedDepts: [Department.INVESTIGATIONS, Department.GENERAL_ADMIN]
    },
    { 
      id: 'Wanted', 
      label: 'المطلوبين أمنياً', 
      icon: UserX, 
      desc: 'قوائم الترقب والقبض',
      allowedDepts: [Department.INFO_DEPT, Department.GENERAL_ADMIN]
    },
  ];

  // Filter options based on user department
  const reportOptions = allReports.filter(r => 
    currentUser && r.allowedDepts.includes(currentUser.department)
  );

  // Set default selection on load
  useEffect(() => {
    if (reportOptions.length > 0 && !reportType) {
      setReportType(reportOptions[0].id);
    }
  }, [currentUser, reportOptions]);

  // Helper: Get Headers based on report type
  const getHeaders = () => {
    switch (reportType) {
      case 'Inmates': return ['الاسم الكامل', 'النوع', 'رقم الهوية', 'رقم القضية', 'التهمة', 'العنبر', 'الحالة', 'تاريخ الدخول'];
      case 'Movements': return ['اسم النزيل', 'نوع الحركة', 'الوجهة', 'وقت الخروج', 'وقت العودة', 'المسؤول', 'الحالة'];
      case 'Behavior': return ['رقم النزيل', 'نوع التقرير', 'الوصف', 'الضابط المبلغ', 'التاريخ'];
      case 'Cases': return ['عنوان القضية', 'اسم المتهم', 'التهمة الأولية', 'تاريخ الفتح', 'الحالة'];
      case 'Minutes': return ['رقم القضية', 'اسم المتهم', 'المحقق', 'التهمة المؤكدة', 'القرار', 'التاريخ'];
      case 'Wanted': return ['الاسم', 'رقم الهوية', 'نوع القضية', 'درجة الخطورة', 'العنوان', 'الحالة'];
      default: return [];
    }
  };

  // Helper: Get Data Rows based on report type
  const getDataRows = () => {
    let data: any[] = [];
    switch (reportType) {
      case 'Inmates': 
        data = inmates
          .filter(i => filterInmateType === 'All' || i.type === filterInmateType)
          .map(i => [i.fullName, i.type, i.nationalId, i.caseNumber || '-', i.primaryCharge, i.wardId || '-', i.status, i.entryDate]);
        break;
      case 'Movements':
        data = movements.map(m => [
          m.inmateName, m.type, m.destination, 
          new Date(m.checkOutTime).toLocaleString('ar-SA'), 
          m.checkInTime ? new Date(m.checkInTime).toLocaleString('ar-SA') : '-', 
          m.officerName, m.isCompleted ? 'مكتملة' : 'جارية'
        ]);
        break;
      case 'Behavior':
        data = reports.map(r => [r.inmateId, r.type, r.description, r.reportingOfficer, r.date]);
        break;
      case 'Cases':
        data = cases.map(c => [
          c.caseTitle,
          inmates.find(i => i.id === c.inmateId)?.fullName || 'غير معروف',
          c.initialCharge,
          c.startDate,
          c.status === 'Open' ? 'مفتوحة' : 'مغلقة'
        ]);
        break;
      case 'Minutes':
        data = minutes.map(m => [
          m.caseId,
          inmates.find(i => i.id === m.inmateId)?.fullName || 'غير معروف',
          m.investigatorName,
          m.confirmedCharge || '-',
          m.isCaseClosed ? 'إغلاق القضية' : 'استمرار',
          m.date
        ]);
        break;
      case 'Wanted':
        data = wantedPersons.map(w => [w.fullName, w.nationalId, w.caseType, w.dangerLevel, w.address, w.status]);
        break;
    }
    return data;
  };

  const generateCSV = () => {
    try {
      const headers = getHeaders();
      const rows = getDataRows();
      const BOM = "\uFEFF"; 
      const csvContent = BOM + [
        headers.join(","), 
        ...rows.map(r => r.map((field: any) => `"${field}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert('حدث خطأ أثناء تصدير ملف Excel');
      console.error(e);
    }
  };

  const handlePrint = () => {
    const headers = getHeaders();
    const rows = getDataRows();
    const selectedOption = reportOptions.find(r => r.id === reportType);
    const title = selectedOption?.label || 'تقرير';
    const date = new Date().toLocaleDateString('ar-SA');
    const filterText = filterInmateType !== 'All' ? ` (تصنيف: ${filterInmateType === 'POW' ? 'أسير' : filterInmateType === 'MILITARY' ? 'عسكري' : 'مشتبه'})` : '';

    // Use a new window for robust printing on all devices
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة التقرير');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Tajawal', sans-serif; padding: 20px; color: #000; background: #fff; }
            h1 { text-align: center; margin-bottom: 10px; font-size: 24px; color: #000; }
            h2 { text-align: center; font-size: 18px; margin: 0; color: #000; }
            p { text-align: center; color: #333; margin-bottom: 30px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
            th, td { border: 1px solid #000; padding: 10px; text-align: right; color: #000; }
            th { background-color: #f0f0f0; font-weight: bold; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h2>وزارة الدفاع - إدارة الشعبة</h2>
          <h1>${title}${filterText}</h1>
          <p>تاريخ التقرير: ${date} | ${currentUser?.department}</p>
          ${startDate ? `<p>الفترة من: ${startDate} إلى ${endDate}</p>` : ''}
          
          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>
                  ${row.map((cell: any) => `<td>${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; text-align: center; font-size: 12px; border-top: 1px solid #000; padding-top: 10px;">
            تم استخراج هذا التقرير آلياً عبر نظام الحارس
          </div>

          <div class="no-print" style="text-align: center; margin-top: 20px;">
             <button onclick="window.print()" style="padding: 10px 20px; background: #000; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-family: 'Tajawal'; font-size: 16px;">طباعة / حفظ PDF</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleExport = () => {
    if (format === 'Excel') generateCSV();
    else handlePrint();
  };

  return (
    <div className="pb-24 animate-fadeIn max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pt-4">
        <button onClick={() => onNavigate('DASHBOARD')} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-600 hover:bg-slate-50 transition-all border border-slate-100 hover:border-slate-300">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">مركز التقارير</h2>
          <p className="text-slate-500 font-medium">تصدير البيانات والسجلات الرسمية - {currentUser?.department}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filter Panel (Left Column) */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Filter className="text-primary-600" /> خيارات التصفية
              </h3>
              
              <div className="space-y-4">
                {/* Inmate Type Filter - Only show for Inmates report */}
                {reportType === 'Inmates' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">نوع النزيل</label>
                    <select 
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none text-slate-700"
                      value={filterInmateType}
                      onChange={e => setFilterInmateType(e.target.value)}
                    >
                      <option value="All">الكل</option>
                      <option value="SUSPECT">مشتبه به</option>
                      <option value="POW">أسير حرب</option>
                      <option value="MILITARY">عسكري مخالف</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">نطاق التاريخ</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center gap-2">
                       <Calendar size={16} className="text-slate-400"/>
                       <input type="date" className="bg-transparent w-full text-sm outline-none text-slate-700" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center gap-2">
                       <Calendar size={16} className="text-slate-400"/>
                       <input type="date" className="bg-transparent w-full text-sm outline-none text-slate-700" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-2">الأعمدة المطلوبة</label>
                   <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar p-2 bg-slate-50 rounded-xl">
                      {getHeaders().map((h, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                          <input type="checkbox" defaultChecked className="accent-primary-600 w-4 h-4 rounded" />
                          {h}
                        </label>
                      ))}
                   </div>
                </div>
              </div>
           </div>
        </div>

        {/* Main Selection (Right Column) */}
        <div className="lg:col-span-8 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {reportOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setReportType(opt.id)}
                  className={`relative p-6 rounded-3xl border-2 text-right transition-all duration-200 group overflow-hidden ${
                    reportType === opt.id 
                    ? 'border-primary-500 bg-primary-50/50 ring-2 ring-primary-200 ring-offset-2' 
                    : 'border-slate-100 bg-white hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                    reportType === opt.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-50 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600'
                  }`}>
                    <opt.icon size={26} />
                  </div>
                  <h4 className={`font-bold text-lg mb-1 ${reportType === opt.id ? 'text-primary-800' : 'text-slate-800'}`}>{opt.label}</h4>
                  <p className="text-sm text-slate-500">{opt.desc}</p>
                </button>
              ))}
           </div>

           {/* Export Action */}
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex gap-4 w-full md:w-auto">
                 <button onClick={() => setFormat('PDF')} className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold border-2 transition-all ${format === 'PDF' ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-100 text-slate-400'}`}>PDF (طباعة)</button>
                 <button onClick={() => setFormat('Excel')} className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold border-2 transition-all ${format === 'Excel' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 text-slate-400'}`}>Excel</button>
              </div>
              <button 
                onClick={handleExport}
                className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Download size={22} /> {format === 'PDF' ? 'تصدير الملف' : 'تحميل Excel'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsManager;
