
import React, { useState, useEffect } from 'react';
import { 
  Database, Lock, Save, RefreshCw, Trash2, X, Code, AlertTriangle, CheckCircle, ArrowRight 
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

const DeveloperConsole: React.FC = () => {
  const { 
    currentUser, 
    inmates, 
    cases, 
    minutes, 
    wards, 
    users, 
    inspections,
    wantedPersons,
    movements,
    reports,
    resetSystem,
    updateRawData 
  } = useSecurity();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<string>('inmates');
  const [jsonContent, setJsonContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const tabs = [
    { id: 'inmates', label: 'النزلاء (Inmates)', data: inmates },
    { id: 'cases', label: 'القضايا (Cases)', data: cases },
    { id: 'minutes', label: 'المحاضر (Minutes)', data: minutes },
    { id: 'wards', label: 'العنابر (Wards)', data: wards },
    { id: 'inspections', label: 'التفتيش (Inspections)', data: inspections },
    { id: 'users', label: 'المستخدمين (Users)', data: users },
    { id: 'wantedPersons', label: 'المطلوبين (Wanted)', data: wantedPersons },
    { id: 'movements', label: 'الحركات (Movements)', data: movements },
    { id: 'reports', label: 'التقارير (Reports)', data: reports },
  ];

  // Load data into textarea when tab changes
  useEffect(() => {
    const currentData = tabs.find(t => t.id === activeTab)?.data;
    setJsonContent(JSON.stringify(currentData || [], null, 2));
    setSaveStatus('idle');
  }, [activeTab, inmates, cases, minutes, wards, users, inspections, wantedPersons, movements, reports]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'dev123') {
      setIsAuthenticated(true);
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      
      // CRITICAL VALIDATION to prevent crashes
      if (!Array.isArray(parsed)) {
        throw new Error('يجب أن تكون البيانات مصفوفة [] حصراً. لا يمكن حفظ كائنات {} مفردة هنا.');
      }

      // Optional: Check if items have IDs to prevent key errors
      if (parsed.length > 0 && !parsed[0].id) {
         if(!window.confirm('تحذير: البيانات المدخلة لا تحتوي على حقل "id". هذا قد يسبب مشاكل في العرض. هل تريد المتابعة؟')) {
            return;
         }
      }

      updateRawData(activeTab, parsed);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e: any) {
      alert(`خطأ في البيانات: ${e.message}`);
      setSaveStatus('error');
    }
  };

  const handleClearTable = () => {
    if (window.confirm(`تحذير: هل أنت متأكد من حذف جميع سجلات جدول ${activeTab}؟`)) {
      updateRawData(activeTab, []);
      setJsonContent('[]');
      setSaveStatus('success');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-fadeIn">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border border-slate-200">
           <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-slate-900/20">
             <Code size={32} />
           </div>
           <h2 className="text-xl font-bold text-slate-800 mb-2">وحدة تحكم المطورين</h2>
           <p className="text-slate-500 text-sm mb-6">منطقة محظورة للوصول لقواعد البيانات الخام</p>
           
           <form onSubmit={handleLogin} className="space-y-4">
             <input 
               type="password" 
               placeholder="رمز الوصول..." 
               className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold tracking-widest outline-none focus:ring-2 focus:ring-slate-900"
               value={password}
               onChange={e => setPassword(e.target.value)}
             />
             <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
               دخول للنظام
             </button>
           </form>
           
           <button onClick={() => window.history.back()} className="mt-6 text-slate-400 hover:text-slate-600 text-sm font-bold flex items-center justify-center gap-2 w-full">
             <ArrowRight size={16} /> العودة للخلف
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-fadeIn h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Code className="text-slate-900" /> وحدة تحكم المطور (Developer Console)
          </h2>
          <p className="text-slate-500">الوصول المباشر لقواعد البيانات (Raw JSON Editing)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsAuthenticated(false)} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 flex items-center gap-2">
             خروج
          </button>
          <button onClick={() => window.location.reload()} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 flex items-center gap-2">
            <RefreshCw size={18} /> تحديث النظام
          </button>
          <button onClick={resetSystem} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100 flex items-center gap-2 border border-red-100">
            <Trash2 size={18} /> تصفير كامل
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-l border-slate-200 overflow-y-auto">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`w-full text-right p-4 text-sm font-bold border-b border-slate-100 hover:bg-slate-100 transition-colors flex justify-between items-center ${activeTab === tab.id ? 'bg-white border-r-4 border-r-slate-900 text-slate-900 shadow-sm' : 'text-slate-500'}`}
             >
               <span>{tab.label}</span>
               <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">{Array.isArray(tab.data) ? tab.data.length : 0}</span>
             </button>
           ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-h-[500px]">
           <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-700 font-mono text-sm">{activeTab}.json</h3>
              <div className="flex gap-2">
                 <button onClick={handleClearTable} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-colors">
                    حذف الجدول
                 </button>
              </div>
           </div>
           
           <div className="flex-1 relative group">
              <textarea 
                className="w-full h-full p-6 font-mono text-xs text-slate-700 bg-slate-50 outline-none resize-none leading-relaxed focus:bg-white transition-colors" 
                value={jsonContent}
                onChange={e => setJsonContent(e.target.value)}
                dir="ltr"
                spellCheck={false}
              />
              <div className="absolute top-2 right-4 text-[10px] text-slate-300 pointer-events-none group-hover:text-slate-400">JSON Editor</div>
           </div>

           <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                 {saveStatus === 'success' && <span className="text-emerald-600 text-sm font-bold flex items-center gap-1 animate-fadeIn"><CheckCircle size={16}/> تم الحفظ بنجاح</span>}
                 {saveStatus === 'error' && <span className="text-red-600 text-sm font-bold flex items-center gap-1 animate-fadeIn"><AlertTriangle size={16}/> خطأ في التنسيق</span>}
              </div>
              <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all">
                 <Save size={18} /> حفظ التعديلات
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperConsole;
