import { useToast } from "../src/context/ToastContext";
import React, { useState, useRef } from 'react';
import { 
  FileText, Scale, Plus, Gavel, AlertCircle, FileCheck, X, Camera, Upload, Paperclip, 
  Bold, Italic, Underline, AlignRight, AlignCenter, AlignLeft, Image as ImageIcon,
  LayoutGrid, Table as TableIcon, UserPen
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { Case, InvestigationMinute } from '../types';

interface InvestigationsProps {
  onShowProfile?: (id: string) => void;
  initialTab?: string;
}

const Investigations: React.FC<InvestigationsProps> = ({ onShowProfile, initialTab }) => {
  const { showToast } = useToast();
  const { cases, inmates, inspections, addCase, addMinute, minutes, currentUser } = useSecurity();
  const [activeTab, setActiveTab] = useState<'CASES' | 'MINUTES'>((initialTab === 'MINUTES' ? 'MINUTES' : 'CASES'));
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [newCaseForm, setNewCaseForm] = useState({ inmateId: '', title: '', initialCharge: '' });
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isMinuteModalOpen, setIsMinuteModalOpen] = useState(false);

  const [minuteContent, setMinuteContent] = useState('');
  const [minuteConclusion, setMinuteConclusion] = useState('');
  const [minuteCharge, setMinuteCharge] = useState('');
  const [minuteDecision, setMinuteDecision] = useState('استمرار التحقيق');
  
  const [minuteDate, setMinuteDate] = useState('');
  const [minuteTime, setMinuteTime] = useState('');
  const [minuteInvestigator, setMinuteInvestigator] = useState('');

  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentType, setAttachmentType] = useState<'PDF' | 'IMAGE' | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newCaseForm.inmateId) return;
    
    const newCase: Case = {
      id: Math.random().toString(36).substr(2, 9),
      inmateId: newCaseForm.inmateId,
      caseTitle: newCaseForm.title,
      initialCharge: newCaseForm.initialCharge,
      status: 'Open',
      startDate: new Date().toISOString().split('T')[0]
    };
    addCase(newCase);
    setIsNewCaseModalOpen(false);
    setNewCaseForm({ inmateId: '', title: '', initialCharge: '' });
  };

  const handleOpenMinute = (caseId: string) => {
    setSelectedCaseId(caseId);
    setMinuteContent('');
    setMinuteConclusion('');
    setMinuteCharge('');
    setMinuteDecision('استمرار التحقيق');
    setAttachment(null);
    setAttachmentType(undefined);
    
    const now = new Date();
    setMinuteDate(now.toISOString().split('T')[0]);
    setMinuteTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setMinuteInvestigator(currentUser?.name || 'المحقق المناوب');

    setIsMinuteModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'PDF' | 'IMAGE') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAttachment(base64String);
        setAttachmentType(type);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSaveMinute = () => {
    if (!selectedCaseId) return;
    const caseItem = cases.find(c => c.id === selectedCaseId);
    if (!caseItem) return;

    const newMinute: InvestigationMinute = {
      id: Math.random().toString(36).substr(2, 9),
      caseId: selectedCaseId,
      inmateId: caseItem.inmateId,
      date: minuteDate, 
      time: minuteTime, 
      investigatorName: minuteInvestigator, 
      content: minuteContent,
      conclusion: minuteConclusion,
      confirmedCharge: minuteCharge || caseItem.initialCharge,
      isCaseClosed: minuteDecision === 'إغلاق القضية (إحالة للنيابة)',
      securityCheckReviewed: true,
      attachment: attachment || undefined,
      attachmentType: attachmentType
    };

    addMinute(newMinute);
    alert('تم حفظ واعتماد المحضر بنجاح في السجل المحلي.');
    setIsMinuteModalOpen(false);
  };

  const renderMinuteModal = () => {
    const caseItem = cases.find(c => c.id === selectedCaseId);
    const inmate = inmates.find(i => i.id === caseItem?.inmateId);
    const securityReport = inspections.find(i => i.inmateId === inmate?.id);

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-0 sm:p-4 animate-fadeIn">
        <div className="bg-white rounded-[1.5rem] w-full max-w-6xl h-full sm:h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
          
          <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0 z-20">
            <div>
               <h3 className="font-bold text-lg sm:text-xl flex items-center gap-2">
                 <Gavel size={20} className="text-amber-400" />
                 محضر تحقيق جنائي
               </h3>
               <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium opacity-80">رقم الملف: {caseItem?.id}</p>
            </div>
            <button onClick={() => setIsMinuteModalOpen(false)} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 flex overflow-hidden bg-slate-100">
            <div className="w-72 bg-slate-50 border-l border-slate-200 overflow-y-auto p-4 shrink-0 hidden lg:block custom-scrollbar">
               <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                 <h4 className="font-bold text-amber-800 flex items-center gap-2 text-sm mb-2">
                   <AlertCircle size={14} /> تنبيه للمحقق
                 </h4>
                 <p className="text-xs text-amber-700 leading-relaxed font-medium">
                   يجب مراجعة المضبوطات وتقرير التفتيش الجسدي بدقة.
                 </p>
               </div>
               {securityReport ? (
                 <div className="space-y-4 text-sm animate-fadeIn">
                   <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                     <p className="font-bold text-slate-700 mb-1 text-[10px] uppercase tracking-wider text-primary-600">المضبوطات</p>
                     <ul className="space-y-1">
                       {securityReport.belongings.map((b, i) => (
                         <li key={i} className="text-slate-600 text-xs flex justify-between">
                           <span>• {b.item}</span>
                           <span className="text-slate-400 font-mono">({b.type})</span>
                         </li>
                       ))}
                       {securityReport.belongings.length === 0 && <li className="text-slate-400 text-xs italic">لا توجد مضبوطات</li>}
                     </ul>
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-slate-400 text-xs">لا يوجد تقرير أمني</p>
                 </div>
               )}
            </div>

            <div className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar pb-24">
               <div className="max-w-4xl mx-auto space-y-4">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                       <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">المتهم</label>
                       <p className="font-bold text-slate-800 text-sm">{inmate?.fullName}</p>
                    </div>
                    <div>
                       <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">رقم الهوية</label>
                       <p className="font-bold text-slate-800 text-sm font-mono">{inmate?.nationalId}</p>
                    </div>
                    <div>
                       <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">التاريخ</label>
                       <input type="date" className="bg-transparent font-bold text-slate-800 text-sm w-full outline-none" value={minuteDate} onChange={e => setMinuteDate(e.target.value)} />
                    </div>
                    <div>
                       <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">الوقت</label>
                       <input type="time" step="1" className="bg-transparent font-bold text-slate-800 text-sm w-full outline-none" value={minuteTime} onChange={e => setMinuteTime(e.target.value)} />
                    </div>
                 </div>

                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ring-1 ring-slate-100 flex flex-col h-[400px]">
                    <div className="bg-slate-50 border-b border-slate-200 px-2 py-2 flex items-center gap-1 shrink-0">
                       <button className="p-2 hover:bg-slate-200 rounded text-slate-600"><Bold size={16}/></button>
                       <button className="p-2 hover:bg-slate-200 rounded text-slate-600"><Italic size={16}/></button>
                       <button className="p-2 hover:bg-slate-200 rounded text-slate-600"><Underline size={16}/></button>
                       <div className="w-px h-6 bg-slate-300 mx-1"></div>
                       <button className="p-2 hover:bg-slate-200 rounded text-slate-600"><AlignRight size={16}/></button>
                       <button className="p-2 hover:bg-slate-200 rounded text-slate-600"><AlignCenter size={16}/></button>
                       <button className="p-2 hover:bg-slate-200 rounded text-slate-600"><AlignLeft size={16}/></button>
                    </div>
                    <textarea 
                      className="flex-1 w-full p-8 bg-white outline-none text-slate-800 font-medium leading-loose resize-none text-base focus:bg-slate-50/30 transition-colors custom-scrollbar" 
                      placeholder="س: .......................................&#10;ج: ......................................." 
                      value={minuteContent}
                      onChange={e => setMinuteContent(e.target.value)}
                      style={{ fontFamily: "'Tajawal', sans-serif" }}
                    />
                    <div className="bg-slate-50 border-t border-slate-200 p-3">
                       <div className="flex items-center gap-3">
                         <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={(e) => handleFileUpload(e, 'PDF')} />
                         <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => handleFileUpload(e, 'IMAGE')} />
                         <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors shadow-sm">
                           <Upload size={14} /> استيراد PDF
                         </button>
                         <button onClick={() => cameraInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors shadow-sm">
                           <Camera size={14} /> مسح ضوئي (صورة)
                         </button>
                       </div>
                       {attachment && (
                          <div className="mt-3 flex items-center gap-3 bg-white p-2 rounded-lg border border-emerald-100 shadow-sm w-fit animate-fadeIn">
                             <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${attachmentType === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                               {attachmentType === 'PDF' ? <FileText size={20} /> : <ImageIcon size={20} />}
                             </div>
                             <div>
                               <p className="text-xs font-bold text-slate-700">تم إرفاق الملف بنجاح</p>
                               <p className="text-[10px] text-slate-400 font-mono">نوع الملف: {attachmentType}</p>
                             </div>
                          </div>
                       )}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <label className="block font-bold text-slate-700 mb-2 text-xs">الاستنتاج / الملخص</label>
                      <textarea className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none resize-none text-slate-900" value={minuteConclusion} onChange={e => setMinuteConclusion(e.target.value)} />
                    </div>
                    <div className="space-y-3">
                       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <label className="block font-bold text-slate-700 mb-2 text-xs">التهمة الأكيدة</label>
                          <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={minuteCharge} onChange={e => setMinuteCharge(e.target.value)} />
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                         <label className="block font-bold text-slate-700 mb-2 text-xs">قرار المحقق</label>
                         <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm cursor-pointer" value={minuteDecision} onChange={e => setMinuteDecision(e.target.value)}>
                           <option>استمرار التحقيق (تمديد التوقيف)</option>
                           <option>إغلاق القضية (إحالة للنيابة)</option>
                           <option>حفظ القضية</option>
                         </select>
                      </div>
                    </div>
                 </div>

                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                       <UserPen size={20} />
                    </div>
                    <div className="flex-1">
                       <label className="block font-bold text-slate-700 mb-1 text-xs">اسم الضابط المحقق</label>
                       <input type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800" value={minuteInvestigator} onChange={e => setMinuteInvestigator(e.target.value)} />
                    </div>
                 </div>
               </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-white shrink-0 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] z-50 absolute bottom-0 w-full">
             <button onClick={() => setIsMinuteModalOpen(false)} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm">إلغاء</button>
             <button onClick={handleSaveMinute} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all text-sm">
               <FileCheck size={20} /> حفظ واعتماد المحضر
             </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMinuteList = () => {
    if (viewMode === 'TABLE') {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-600 font-bold">
              <tr>
                <th className="p-4">رقم المحضر</th>
                <th className="p-4">عنوان القضية</th>
                <th className="p-4">اسم المتهم</th>
                <th className="p-4">تاريخ المحضر</th>
                <th className="p-4">المحقق</th>
                <th className="p-4">المرفقات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {minutes.map(m => {
                const caseItem = cases.find(c => c.id === m.caseId);
                const inmateName = inmates.find(i => i.id === m.inmateId)?.fullName || 'غير معروف';
                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono text-slate-500">#{m.id}</td>
                    <td className="p-4 font-bold text-slate-800">{caseItem?.caseTitle}</td>
                    <td className="p-4 text-slate-700">{inmateName}</td>
                    <td className="p-4 text-slate-600">
                      {m.date} <span className="text-slate-400 text-xs">({m.time || '-'})</span>
                    </td>
                    <td className="p-4 text-slate-600">{m.investigatorName}</td>
                    <td className="p-4">
                      {m.attachment ? (
                        <span className="text-emerald-600 font-bold text-xs flex items-center gap-1"><Paperclip size={12}/> موجود</span>
                      ) : <span className="text-slate-300 text-xs">لا يوجد</span>}
                    </td>
                  </tr>
                );
              })}
              {minutes.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400">لا توجد سجلات</td></tr>}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
        {minutes.map(m => {
           const caseItem = cases.find(c => c.id === m.caseId);
           const inmateName = inmates.find(i => i.id === m.inmateId)?.fullName || 'غير معروف';
           return (
            <div key={m.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 group hover:border-primary-200 transition-all hover:shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-primary-50 transition-colors">
                  <FileText size={28} className="text-slate-400 group-hover:text-primary-600" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 block text-left">
                  {m.date} <br/> {m.time}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">محضر تحقيق</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">القضية: {caseItem?.caseTitle} <br/> المتهم: {inmateName}</p>
              
              <div className="flex items-center gap-2 mt-4">
                 <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{m.investigatorName}</span>
                 {m.attachment && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded flex items-center gap-1">
                       <Paperclip size={10} /> مرفق
                    </span>
                 )}
              </div>
            </div>
          );
        })}
        {minutes.length === 0 && (
           <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
             <FileText className="mx-auto text-slate-300 mb-4" size={48} />
             <p className="text-slate-400 font-bold">لا توجد محاضر محفوظة</p>
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-24 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">إدارة التحقيقات</h2>
          <p className="text-slate-500 mt-1 font-medium">متابعة القضايا، تحرير المحاضر، وإحالة للنيابة</p>
        </div>
        <button 
          onClick={() => setIsNewCaseModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 w-full md:w-auto justify-center"
        >
          <Plus size={20} /> فتح قضية جديدة
        </button>
      </div>

      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-8">
           <button 
             onClick={() => setActiveTab('CASES')}
             className={`pb-4 px-2 text-base font-bold border-b-[3px] transition-colors ${activeTab === 'CASES' ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           >
             سجل القضايا النشطة
           </button>
           <button 
             onClick={() => setActiveTab('MINUTES')}
             className={`pb-4 px-2 text-base font-bold border-b-[3px] transition-colors ${activeTab === 'MINUTES' ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           >
             أرشيف المحاضر
           </button>
        </div>
        
        <div className="flex gap-1 pb-2">
           <button onClick={() => setViewMode('GRID')} className={`p-2 rounded-lg ${viewMode === 'GRID' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-50'}`}><LayoutGrid size={20}/></button>
           <button onClick={() => setViewMode('TABLE')} className={`p-2 rounded-lg ${viewMode === 'TABLE' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-50'}`}><TableIcon size={20}/></button>
        </div>
      </div>

      {activeTab === 'CASES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {cases.map(c => {
             const inmateName = inmates.find(i => i.id === c.inmateId)?.fullName || 'غير معروف';
             return (
              <div key={c.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 group hover:border-primary-200 transition-all hover:shadow-lg cursor-pointer" onClick={() => handleOpenMinute(c.id)}>
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-primary-50 transition-colors">
                    <Scale size={28} className="text-slate-400 group-hover:text-primary-600" />
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${c.status === 'Open' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                    {c.status === 'Open' ? 'مستمرة' : 'مغلقة'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{c.caseTitle}</h3>
                <p className="text-sm text-slate-500 mb-6 font-medium">المتهم: {inmateName}</p>
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                  <span className="text-xs text-slate-400 font-bold">{c.startDate}</span>
                  <button className="text-primary-600 text-sm font-bold hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">فتح المحضر <Gavel size={18} /></button>
                </div>
              </div>
            );
          })}
          {cases.length === 0 && (
             <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
               <Scale className="mx-auto text-slate-300 mb-4" size={48} />
               <p className="text-slate-400 font-bold">لا توجد قضايا مسجلة</p>
             </div>
          )}
        </div>
      )}

      {activeTab === 'MINUTES' && renderMinuteList()}

      {isNewCaseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-[2rem] p-8 w-full max-w-xl animate-slideUp shadow-2xl">
              <h3 className="font-bold text-2xl mb-8 text-slate-800">فتح قضية جناية جديدة</h3>
              <form onSubmit={handleCreateCase} className="space-y-6">
                 <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">اختر النزيل (المتهم)</label>
                    <select className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 outline-none" value={newCaseForm.inmateId} onChange={e => setNewCaseForm({...newCaseForm, inmateId: e.target.value})} required>
                       <option value="">-- اختر من القائمة --</option>
                       {inmates.map(i => <option key={i.id} value={i.id}>{i.fullName} ({i.nationalId})</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">عنوان القضية</label>
                    <input required type="text" className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 outline-none" placeholder="مثال: سرقة مركبة" value={newCaseForm.title} onChange={e => setNewCaseForm({...newCaseForm, title: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">التهمة الأولية</label>
                    <input required type="text" className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 outline-none" placeholder="الوصف الجرمي..." value={newCaseForm.initialCharge} onChange={e => setNewCaseForm({...newCaseForm, initialCharge: e.target.value})} />
                 </div>
                 <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                    <button type="button" onClick={() => setIsNewCaseModalOpen(false)} className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50">إلغاء</button>
                    <button type="submit" className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20">إنشاء القضية</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {isMinuteModalOpen && renderMinuteModal()}
    </div>
  );
};

export default Investigations;
