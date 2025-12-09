import { useToast } from "../src/context/ToastContext";
import React, { useRef, useState } from 'react';
import { 
  Mail, Users, HardDrive, Trash2, Download, Upload, Activity, Search, ShieldCheck, AlertTriangle, X, CheckCircle
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

interface MainBranchProps {
  initialTab?: string;
}

const MainBranch: React.FC<MainBranchProps> = ({ initialTab }) => {
const { showToast } = useToast();
  const { resetSystem, inmates, cases, createBackup, parseBackupFile, restoreData, auditLogs } = useSecurity();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'LOGS' | 'CASE_TRACKING'>((initialTab as any) || 'DASHBOARD');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Restore State
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const data = await parseBackupFile(e.target.files[0]);
        setPreviewData(data);
        setIsRestoreModalOpen(true);
      } catch (err: any) {
        alert(err);
      }
      // Reset input
      e.target.value = '';
    }
  };

  const confirmRestore = () => {
    if (previewData) {
      restoreData(previewData);
      setPreviewData(null);
      setIsRestoreModalOpen(false);
      alert('تمت استعادة البيانات بنجاح!');
    }
  };

  const handleResetSystem = () => {
    if (window.confirm('تحذير شديد: سيتم حذف جميع البيانات المخزنة في النظام بشكل نهائي! \n\nهل أنت متأكد من رغبتك في تصفير النظام؟')) {
       resetSystem();
    }
  };

  // Case Tracking Logic
  const getInmateStatus = (inmateId: string) => {
    const inmateCase = cases.find(c => c.inmateId === inmateId && c.status === 'Open');
    const inmate = inmates.find(i => i.id === inmateId);
    
    return {
      hasActiveCase: !!inmateCase,
      caseTitle: inmateCase?.caseTitle || '-',
      status: inmate?.status || 'Unknown',
      ward: inmate?.wardId || 'Non-Ward'
    };
  };

  const renderCaseTracking = () => {
    const filteredInmates = inmates.filter(i => i.fullName.includes(searchQuery) || i.nationalId.includes(searchQuery));

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
           <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <Activity size={20} className="text-primary-600" /> تتبع حالة النزلاء (Live Tracking)
           </h3>
           <div className="relative w-full md:w-64">
             <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="بحث عن نزيل..." 
               className="w-full pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-primary-500"
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
             <thead className="bg-slate-100 text-slate-600 font-bold">
               <tr>
                 <th className="p-4">اسم النزيل</th>
                 <th className="p-4">رقم الهوية</th>
                 <th className="p-4">الحالة الحالية</th>
                 <th className="p-4">مكان التواجد</th>
                 <th className="p-4">القضية النشطة</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {filteredInmates.map(inmate => {
                 const info = getInmateStatus(inmate.id);
                 return (
                   <tr key={inmate.id} className="hover:bg-slate-50 transition-colors">
                     <td className="p-4 font-bold text-slate-800">{inmate.fullName}</td>
                     <td className="p-4 font-mono text-slate-500">{inmate.nationalId}</td>
                     <td className="p-4">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                         inmate.status.includes('نزيل') ? 'bg-emerald-100 text-emerald-700' : 
                         inmate.status.includes('تحقيق') ? 'bg-amber-100 text-amber-700' :
                         'bg-slate-100 text-slate-600'
                       }`}>
                         {inmate.status}
                       </span>
                     </td>
                     <td className="p-4 text-slate-600">{info.ward}</td>
                     <td className="p-4">
                       {info.hasActiveCase ? (
                         <span className="text-primary-600 font-bold">{info.caseTitle}</span>
                       ) : (
                         <span className="text-slate-400">-</span>
                       )}
                     </td>
                   </tr>
                 );
               })}
               {filteredInmates.length === 0 && (
                 <tr><td colSpan={5} className="p-8 text-center text-slate-400">لا توجد نتائج مطابقة</td></tr>
               )}
             </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderLogs = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
         <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Activity size={18} /> سجل العمليات والتدقيق (Audit Logs)
         </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
           <thead className="bg-slate-50 text-slate-500">
             <tr>
               <th className="p-3">المستخدم</th>
               <th className="p-3">العملية</th>
               <th className="p-3">التفاصيل</th>
               <th className="p-3">التوقيت</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {auditLogs.map(log => (
               <tr key={log.id} className="hover:bg-slate-50">
                 <td className="p-3 font-medium text-slate-700">{log.userName}</td>
                 <td className="p-3">
                   <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                     log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600' :
                     log.action === 'DELETE' ? 'bg-red-50 text-red-600' :
                     log.action === 'UPDATE' ? 'bg-blue-50 text-blue-600' :
                     'bg-slate-100 text-slate-600'
                   }`}>
                     {log.action}
                   </span>
                 </td>
                 <td className="p-3 text-slate-600">{log.target}</td>
                 <td className="p-3 text-slate-400 font-mono text-xs" dir="ltr">
                   {new Date(log.timestamp).toLocaleString('en-US')}
                 </td>
               </tr>
             ))}
             {auditLogs.length === 0 && (
               <tr><td colSpan={4} className="p-6 text-center text-slate-400">لا توجد عمليات مسجلة بعد</td></tr>
             )}
           </tbody>
        </table>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><HardDrive size={24} /></div>
             <h3 className="font-bold text-slate-800">النسخ الاحتياطي وقاعدة البيانات</h3>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
               <span className="text-sm text-slate-600">إجمالي النزلاء</span>
               <span className="font-bold text-slate-800">{inmates.length}</span>
             </div>
             
             <div className="grid grid-cols-2 gap-3 mt-4">
                <button 
                  onClick={createBackup}
                  className="bg-emerald-50 text-emerald-700 py-3 rounded-xl font-bold hover:bg-emerald-100 flex flex-col items-center justify-center gap-1 border border-emerald-100"
                >
                  <Download size={20} /> تصدير مشفر
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-50 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-100 flex flex-col items-center justify-center gap-1 border border-blue-100"
                >
                  <Upload size={20} /> استعادة
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".guard,.json" />
             </div>

             <div className="mt-4 pt-4 border-t border-slate-100">
               <button 
                 onClick={handleResetSystem}
                 className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 flex items-center justify-center gap-2 transition-colors border border-red-100"
               >
                 <Trash2 size={18} /> تصفير النظام (Format)
               </button>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Mail size={24} /></div>
             <h3 className="font-bold text-slate-800">المذكرات المركزية</h3>
          </div>
          <div className="space-y-3">
             <div className="p-3 bg-slate-50 rounded-lg border-r-4 border-emerald-500">
               <p className="text-xs text-slate-400 mb-1">وارد - القيادة العليا</p>
               <p className="font-bold text-slate-700 text-sm">تعميم بخصوص الإجراءات الجديدة</p>
             </div>
             <div className="p-3 bg-slate-50 rounded-lg border-r-4 border-blue-500">
               <p className="text-xs text-slate-400 mb-1">صادر - إدارة السجن</p>
               <p className="font-bold text-slate-700 text-sm">طلب رفع تقارير السعة</p>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><Users size={24} /></div>
             <h3 className="font-bold text-slate-800">شؤون الموظفين</h3>
          </div>
          <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800">
            إدارة الموارد البشرية والتقييم
          </button>
        </div>
      </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">إدارة الشعبة العامة</h2>
          <p className="text-slate-500">لوحة التحكم المركزية، سجلات المراقبة، والنسخ الاحتياطي</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
         <button 
           onClick={() => setActiveTab('DASHBOARD')}
           className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'DASHBOARD' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'}`}
         >
           لوحة التحكم
         </button>
         <button 
           onClick={() => setActiveTab('CASE_TRACKING')}
           className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'CASE_TRACKING' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'}`}
         >
           تتبع الحالات
         </button>
         <button 
           onClick={() => setActiveTab('LOGS')}
           className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'LOGS' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'}`}
         >
           سجل المراقبة
         </button>
      </div>

      {activeTab === 'DASHBOARD' && renderDashboard()}
      {activeTab === 'CASE_TRACKING' && renderCaseTracking()}
      {activeTab === 'LOGS' && renderLogs()}

      {/* Restore Preview Modal */}
      {isRestoreModalOpen && previewData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-slideUp overflow-hidden">
             <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                 <ShieldCheck className="text-emerald-600" /> معاينة النسخة الاحتياطية
               </h3>
               <button onClick={() => setIsRestoreModalOpen(false)}><X className="text-slate-400" /></button>
             </div>
             
             <div className="p-6 space-y-4">
               <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                 <p className="text-blue-800 text-sm font-bold mb-1">تاريخ النسخة:</p>
                 <p className="text-blue-600 text-xs font-mono">{new Date(previewData.timestamp).toLocaleString('ar-SA')}</p>
                 <p className="text-blue-800 text-sm font-bold mt-2">إصدار النظام:</p>
                 <p className="text-blue-600 text-xs font-mono">{previewData.version || 'غير محدد'}</p>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 border border-slate-100 rounded-lg text-center">
                    <p className="text-xs text-slate-500">النزلاء</p>
                    <p className="font-bold text-lg text-slate-800">{previewData.inmates?.length || 0}</p>
                 </div>
                 <div className="p-3 border border-slate-100 rounded-lg text-center">
                    <p className="text-xs text-slate-500">القضايا</p>
                    <p className="font-bold text-lg text-slate-800">{previewData.cases?.length || 0}</p>
                 </div>
                 <div className="p-3 border border-slate-100 rounded-lg text-center">
                    <p className="text-xs text-slate-500">المحاضر</p>
                    <p className="font-bold text-lg text-slate-800">{previewData.minutes?.length || 0}</p>
                 </div>
                 <div className="p-3 border border-slate-100 rounded-lg text-center">
                    <p className="text-xs text-slate-500">العنابر</p>
                    <p className="font-bold text-lg text-slate-800">{previewData.wards?.length || 0}</p>
                 </div>
               </div>

               <div className="bg-amber-50 p-3 rounded-lg flex gap-2 items-start text-xs text-amber-800">
                  <AlertTriangle size={16} className="shrink-0" />
                  <p>تنبيه: استعادة هذه النسخة سيقوم بدمج البيانات مع السجلات الحالية أو استبدالها في حالة التعارض.</p>
               </div>
             </div>

             <div className="p-4 border-t border-slate-100 flex gap-3">
               <button 
                 onClick={() => setIsRestoreModalOpen(false)}
                 className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
               >
                 إلغاء
               </button>
               <button 
                 onClick={confirmRestore}
                 className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"
               >
                 <CheckCircle size={18} /> تأكيد الاستعادة
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainBranch;
