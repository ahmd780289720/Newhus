
import React, { useState } from 'react';
import { 
  X, MapPin, Calendar, FileText, Activity, ShieldAlert, Clock, CheckCircle, User, AlertTriangle, ThumbsUp, MessageSquare, Printer, Download
} from 'lucide-react';
import { MOCK_INMATES, MOCK_MOVEMENTS, MOCK_REPORTS, MOCK_WARDS } from '../constants';
import { InmateStatus, BehaviorType } from '../types';

interface InmateProfileModalProps {
  inmateId: string;
  onClose: () => void;
}

const InmateProfileModal: React.FC<InmateProfileModalProps> = ({ inmateId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'INFO' | 'MOVEMENTS' | 'REPORTS'>('INFO');
  
  const inmate = MOCK_INMATES.find(i => i.id === inmateId);
  const movements = MOCK_MOVEMENTS.filter(m => m.inmateId === inmateId);
  const reports = MOCK_REPORTS.filter(r => r.inmateId === inmateId);
  const ward = MOCK_WARDS.find(w => w.id === inmate?.wardId);

  if (!inmate) return null;

  const getStatusColor = (status: InmateStatus) => {
    switch(status) {
      case InmateStatus.DETAINED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case InmateStatus.RELEASED: return 'bg-slate-100 text-slate-700 border-slate-200';
      case InmateStatus.TRANSFERRED: return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>ملف النزيل: ${inmate.fullName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Tajawal', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: #fff; color: #000; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .box { border: 1px solid #000; padding: 20px; margin-bottom: 20px; border-radius: 8px; background: #fff; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: right; font-size: 14px; color: #000; }
            th { background-color: #f0f0f0; font-weight: bold; }
            h2, h3 { margin: 0; margin-bottom: 10px; color: #000; }
            @media print {
              .no-print { display: none; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>وزارة الدفاع</h2>
            <h3>إدارة الشعبة - ملف نزيل شامل</h3>
          </div>
          
          <div class="box">
             <div style="display: flex; gap: 20px; align-items: center;">
               <img src="${inmate.photoUrl}" style="width: 100px; height: 100px; border: 1px solid #000; border-radius: 10px; object-fit: cover;" />
               <div style="flex:1;">
                 <h2>${inmate.fullName}</h2>
                 <div class="grid">
                   <div><strong>رقم الهوية:</strong> ${inmate.nationalId}</div>
                   <div><strong>العنبر:</strong> ${ward?.name || 'غير محدد'}</div>
                   <div><strong>رقم القضية:</strong> ${inmate.caseNumber}</div>
                   <div><strong>الحالة:</strong> ${inmate.status}</div>
                 </div>
               </div>
             </div>
          </div>

          <div class="box">
            <h3>البيانات الجنائية</h3>
            <div class="grid">
               <div><strong>التهمة:</strong> ${inmate.primaryCharge}</div>
               <div><strong>الجهة المحيلة:</strong> ${inmate.referringAuthority}</div>
               <div><strong>تاريخ الدخول:</strong> ${inmate.entryDate}</div>
               <div><strong>الحكم:</strong> ${inmate.sentencePlan}</div>
            </div>
          </div>

          <div class="box">
            <h3>آخر التحركات</h3>
            <table>
              <thead><tr><th>النوع</th><th>الوجهة</th><th>التاريخ</th></tr></thead>
              <tbody>
                ${movements.slice(0, 10).map(m => `<tr><td>${m.type}</td><td>${m.destination}</td><td>${new Date(m.checkOutTime).toLocaleDateString('ar-SA')}</td></tr>`).join('')}
                ${movements.length === 0 ? '<tr><td colspan="3" style="text-align:center">لا يوجد</td></tr>' : ''}
              </tbody>
            </table>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 30px;">
             <button onclick="window.print()" style="padding: 15px 30px; background: #000; color: white; border: none; font-size: 16px; cursor: pointer; border-radius: 8px;">طباعة الملف / حفظ PDF</button>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col md:flex-row border border-white/20">
        
        {/* Left Sidebar (Sticky Profile Summary) */}
        <div className="w-full md:w-80 bg-slate-50 border-l border-slate-200 flex flex-col shrink-0 relative">
          
          <div className="p-8 flex-1 overflow-y-auto">
             <div className="flex flex-col items-center text-center">
                <div className="relative mb-6 group">
                  <div className="absolute inset-0 bg-primary-500 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <img 
                    src={inmate.photoUrl} 
                    alt={inmate.fullName} 
                    className="relative w-40 h-40 rounded-[2rem] object-cover border-[6px] border-white shadow-xl"
                  />
                  <div className={`absolute -bottom-3 right-4 p-2.5 rounded-2xl border-4 border-white shadow-sm ${getStatusColor(inmate.status).replace('text-', 'bg-').split(' ')[0]}`}>
                     <Activity size={20} className="text-white" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-extrabold text-slate-800 leading-tight mb-2">{inmate.fullName}</h2>
                <span className="bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-mono font-bold mb-8">
                  {inmate.nationalId}
                </span>

                <div className="w-full space-y-4">
                  <div className="bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><MapPin size={22} /></div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">مقر التواجد</p>
                      <p className="text-sm font-bold text-slate-800">{ward?.name || 'غير محدد'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="bg-purple-50 p-3 rounded-2xl text-purple-600"><FileText size={22} /></div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">رقم القضية</p>
                      <p className="text-sm font-bold text-slate-800 font-mono">{inmate.caseNumber}</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="bg-amber-50 p-3 rounded-2xl text-amber-600"><Calendar size={22} /></div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">مدة الحكم</p>
                      <p className="text-sm font-bold text-slate-800">{inmate.sentencePlan}</p>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Sticky Download Button */}
          <div className="p-6 border-t border-slate-200 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <button 
              onClick={handlePrint}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
            >
              <Printer size={20} /> طباعة الملف (PDF)
            </button>
          </div>
        </div>

        {/* Right Content (Tabs) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          {/* Header */}
          <div className="h-24 border-b border-slate-100 flex items-center justify-between px-8 shrink-0 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex gap-2 h-full items-end pb-4">
              {[
                {id: 'INFO', label: 'المعلومات الشخصية'},
                {id: 'MOVEMENTS', label: 'سجل التحركات'},
                {id: 'REPORTS', label: 'السجل السلوكي'}
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-red-50 rounded-2xl text-slate-400 hover:text-red-500 transition-colors border border-slate-100">
              <X size={24} />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
            
            {/* TAB: INFO */}
            {activeTab === 'INFO' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                    <div className="p-3 bg-primary-50 rounded-xl"><User size={24} className="text-primary-600" /></div>
                    البيانات الأساسية والقضائية
                  </h3>
                  <div className="grid grid-cols-2 gap-y-8 gap-x-10">
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">تاريخ الدخول</p>
                      <p className="text-lg font-bold text-slate-800">{inmate.entryDate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">الجهة المحيلة</p>
                      <p className="text-lg font-bold text-slate-800">{inmate.referringAuthority}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">التهمة المنسوبة</p>
                      <p className="text-lg font-bold text-slate-800">{inmate.primaryCharge}</p>
                    </div>
                    <div className="col-span-2">
                       <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">ملاحظات طبية</p>
                       <div className="flex gap-4 items-start p-5 rounded-2xl bg-rose-50 border border-rose-100">
                         <Activity className="text-rose-500 shrink-0 mt-0.5" size={20} />
                         <p className="text-sm font-medium text-rose-800 leading-relaxed">
                           {inmate.medicalNotes || 'لا توجد ملاحظات طبية مسجلة'}
                         </p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MOVEMENTS */}
            {activeTab === 'MOVEMENTS' && (
              <div className="space-y-6 animate-fadeIn">
                {movements.length > 0 ? (
                  <div className="relative border-r-2 border-slate-200 mr-4 space-y-8 py-2">
                    {movements.map((move, idx) => (
                      <div key={move.id} className="relative pr-8">
                        <div className={`absolute -right-[11px] top-6 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 ${move.isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-slate-800 text-lg group-hover:text-primary-600 transition-colors">{move.type}</span>
                            <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${move.isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                              {move.isCompleted ? 'مكتملة' : 'جارية'}
                            </span>
                          </div>
                          <p className="text-slate-600 font-medium mb-4 flex items-center gap-2"><MapPin size={18} /> {move.destination}</p>
                          <div className="flex flex-wrap gap-5 text-xs font-bold text-slate-400 border-t border-slate-50 pt-4">
                            <p className="flex items-center gap-2"><Clock size={16}/> خروج: <span className="text-slate-600">{new Date(move.checkOutTime).toLocaleString('ar-SA')}</span></p>
                            {move.checkInTime && <p className="flex items-center gap-2 text-emerald-600"><CheckCircle size={16}/> عودة: {new Date(move.checkInTime).toLocaleString('ar-SA')}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                    <Activity size={56} className="text-slate-200 mb-6" />
                    <p className="text-slate-400 font-bold text-lg">لا توجد تحركات مسجلة</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: REPORTS */}
            {activeTab === 'REPORTS' && (
              <div className="space-y-4 animate-fadeIn">
                {reports.length > 0 ? reports.map(report => (
                  <div key={report.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex gap-6 hover:border-primary-100 transition-colors">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                       report.type === BehaviorType.VIOLATION ? 'bg-red-50 text-red-500' : 
                       report.type === BehaviorType.REWARD ? 'bg-emerald-50 text-emerald-500' :
                       'bg-blue-50 text-blue-500'
                    }`}>
                      {report.type === BehaviorType.VIOLATION ? <AlertTriangle size={28} /> : 
                       report.type === BehaviorType.REWARD ? <ThumbsUp size={28} /> :
                       <MessageSquare size={28} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800 text-lg">{report.type}</h4>
                        <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded-lg">{report.date}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-medium">{report.description}</p>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                        <ShieldAlert size={14} className="text-slate-300"/>
                        <p className="text-xs text-slate-400 font-bold">المبلغ: {report.reportingOfficer}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                    <ShieldAlert size={56} className="text-slate-200 mb-6" />
                    <p className="text-slate-400 font-bold text-lg">سجل نظيف! لا توجد تقارير</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default InmateProfileModal;
