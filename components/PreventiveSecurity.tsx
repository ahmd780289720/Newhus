
import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  FileText, 
  Briefcase, 
  Scan, 
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Save
} from 'lucide-react';
import { Inmate, InmateStatus, InspectionRecord } from '../types';
import { useSecurity } from '../context/SecurityContext';

interface PreventiveSecurityProps {
  onShowProfile?: (id: string) => void;
}

const PreventiveSecurity: React.FC<PreventiveSecurityProps> = ({ onShowProfile }) => {
  const { inmates, addInmate, addInspection } = useSecurity();
  const [activeTab, setActiveTab] = useState<'INTAKE' | 'INSPECTION'>('INTAKE');
  
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedInmateId, setSelectedInmateId] = useState<string | null>(null);

  const [intakeForm, setIntakeForm] = useState({
    fullName: '',
    nationalId: '',
    referringAuthority: 'الشرطة العسكرية',
    primaryCharge: '',
  });

  const [inspectionForm, setInspectionForm] = useState<Partial<InspectionRecord>>({
    isPhysicallyInspected: 'No',
    physicalNotes: '',
    belongings: [],
    securityIntel: ''
  });

  const [newItem, setNewItem] = useState({ item: '', type: '' });

  const pendingInmates = inmates.filter(i => i.status === InmateStatus.PROCESSING);

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInmate: Inmate = {
      id: Math.random().toString(36).substr(2, 9),
      ...intakeForm,
      entryDate: new Date().toISOString().split('T')[0],
      photoUrl: 'https://via.placeholder.com/150',
      status: InmateStatus.PROCESSING
    };
    addInmate(newInmate);
    alert('تم استلام النزيل بنجاح وإحالته لقائمة الانتظار للفحص');
    setIntakeForm({ fullName: '', nationalId: '', referringAuthority: 'الشرطة العسكرية', primaryCharge: '' });
    setActiveTab('INSPECTION'); 
  };

  const handleInspectionSubmit = () => {
    if (!selectedInmateId) return;
    
    const record: InspectionRecord = {
      id: Math.random().toString(36).substr(2, 9),
      inmateId: selectedInmateId,
      officerName: 'الضابط المناوب',
      date: new Date().toISOString().split('T')[0],
      isPhysicallyInspected: inspectionForm.isPhysicallyInspected as any || 'No',
      physicalNotes: inspectionForm.physicalNotes || '',
      isBelongingsInspected: 'Yes',
      belongings: inspectionForm.belongings || [],
      isDocsInspected: 'Yes',
      documents: [],
      initialIntel: 'وارد من الجهة الأمنية',
      securityIntel: inspectionForm.securityIntel || '',
    };

    addInspection(record);
    alert('تم اعتماد الفحص وترحيل النزيل لقائمة "بانتظار التسكين" في إدارة السجن');
    setSelectedInmateId(null);
    setWizardStep(1);
  };

  const handleAddBelonging = () => {
    if(newItem.item) {
       const item = { item: newItem.item, type: newItem.type, notes: '' };
       setInspectionForm({...inspectionForm, belongings: [...(inspectionForm.belongings || []), item]});
       setNewItem({ item: '', type: '' });
    }
  };

  const renderIntake = () => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-fadeIn">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <UserPlus className="text-primary-600" />
        تسجيل دخول نزيل جديد
      </h3>
      <form onSubmit={handleIntakeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-600">الاسم الرباعي</label>
          <input required type="text" value={intakeForm.fullName} onChange={e => setIntakeForm({...intakeForm, fullName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-600">رقم الهوية / الإقامة</label>
          <input required type="text" value={intakeForm.nationalId} onChange={e => setIntakeForm({...intakeForm, nationalId: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-600">الجهة المحيلة</label>
          <select value={intakeForm.referringAuthority} onChange={e => setIntakeForm({...intakeForm, referringAuthority: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900">
            <option>الشرطة العسكرية</option>
            <option>مكافحة المخدرات</option>
            <option>النيابة العامة</option>
            <option>أمن الدولة</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-600">التهمة الأولية</label>
          <input required type="text" value={intakeForm.primaryCharge} onChange={e => setIntakeForm({...intakeForm, primaryCharge: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900" />
        </div>
        <div className="md:col-span-2 pt-4">
           <button type="submit" className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-colors">
             حفظ البيانات وإحالة للفحص الأمني
           </button>
        </div>
      </form>
    </div>
  );

  const renderInspectionWizard = () => {
    if (!selectedInmateId) {
       return (
         <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
           <Scan size={48} className="mx-auto mb-4 text-slate-300" />
           <h3 className="text-lg font-bold text-slate-600">اختر نزيلاً من القائمة لبدء الفحص</h3>
           <p className="text-slate-400">النزلاء في القائمة الجانبية هم بانتظار استكمال الإجراءات</p>
         </div>
       );
    }

    const inmate = inmates.find(i => i.id === selectedInmateId);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn h-full flex flex-col">
         <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-slate-800">إجراءات الفحص والضبط</h3>
              <p className="text-sm text-slate-500">النزيل: {inmate?.fullName}</p>
            </div>
            <div className="flex items-center gap-2">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${wizardStep >= 1 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
               <div className="w-8 h-1 bg-slate-200"></div>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${wizardStep >= 2 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
               <div className="w-8 h-1 bg-slate-200"></div>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${wizardStep >= 3 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
            </div>
         </div>

         <div className="p-6 flex-1 overflow-y-auto">
            {wizardStep === 1 && (
              <div className="space-y-4">
                 <h4 className="font-bold text-slate-700 flex items-center gap-2"><Scan size={18} /> الفحص الجسدي</h4>
                 <select 
                   value={inspectionForm.isPhysicallyInspected}
                   onChange={e => setInspectionForm({...inspectionForm, isPhysicallyInspected: e.target.value as any})}
                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                 >
                   <option value="No">لم يتم الفحص بعد</option>
                   <option value="Yes">تم الفحص</option>
                   <option value="Partial">فحص جزئي (لأسباب طبية)</option>
                 </select>
                 <textarea 
                   placeholder="سجل أي ملاحظات: وشوم، جروح، عمليات، علامات فارقة..."
                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-32 text-slate-900"
                   value={inspectionForm.physicalNotes}
                   onChange={e => setInspectionForm({...inspectionForm, physicalNotes: e.target.value})}
                 />
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4">
                 <h4 className="font-bold text-slate-700 flex items-center gap-2"><Briefcase size={18} /> المضبوطات والأمانات</h4>
                 <div className="bg-amber-50 p-3 rounded-lg text-amber-800 text-sm mb-2">
                   قم بإضافة كل غرض على حدة مع تحديد نوعه وحالته.
                 </div>
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     placeholder="الصنف (مثال: جوال)" 
                     className="flex-1 p-2 border rounded-lg text-slate-900"
                     value={newItem.item}
                     onChange={e => setNewItem({...newItem, item: e.target.value})}
                   />
                   <input 
                     type="text" 
                     placeholder="الوصف (مثال: آيفون 13)" 
                     className="flex-1 p-2 border rounded-lg text-slate-900"
                     value={newItem.type}
                     onChange={e => setNewItem({...newItem, type: e.target.value})}
                   />
                   <button 
                     onClick={handleAddBelonging}
                     className="bg-primary-600 text-white px-4 rounded-lg font-bold"
                   >
                     +
                   </button>
                 </div>
                 <div className="space-y-2 mt-4">
                    {inspectionForm.belongings?.map((b, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                         <span>{b.item} - {b.type}</span>
                         <span className="text-xs bg-white border px-2 py-1 rounded">تم التفتيش</span>
                      </div>
                    ))}
                    {(!inspectionForm.belongings || inspectionForm.belongings.length === 0) && (
                      <p className="text-center text-slate-400 py-4">لا توجد مضبوطات مسجلة</p>
                    )}
                 </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4">
                 <h4 className="font-bold text-slate-700 flex items-center gap-2"><FileText size={18} /> التحريات الأولية والقرار</h4>
                 <textarea 
                   placeholder="المعلومات الأولية المستخلصة من النزيل أثناء التفتيش (اختياري)..."
                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-32 text-slate-900"
                   value={inspectionForm.securityIntel}
                   onChange={e => setInspectionForm({...inspectionForm, securityIntel: e.target.value})}
                 />
                 <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                    <p className="font-bold text-emerald-800 mb-2">هل أنت متأكد من اكتمال الإجراءات؟</p>
                    <p className="text-sm text-emerald-600">عند الاعتماد، سيتم تحويل النزيل إلى "إدارة السجن" للتسكين فوراً.</p>
                 </div>
              </div>
            )}
         </div>

         <div className="p-4 border-t border-slate-100 flex justify-between bg-white">
            <button 
              disabled={wizardStep === 1}
              onClick={() => setWizardStep(prev => prev - 1)}
              className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 rounded-lg"
            >
              السابق
            </button>
            {wizardStep < 3 ? (
              <button 
                onClick={() => setWizardStep(prev => prev + 1)}
                className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 flex items-center gap-2"
              >
                التالي <ArrowLeft size={16} className="rotate-180" />
              </button>
            ) : (
              <button 
                onClick={handleInspectionSubmit}
                className="px-8 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle size={18} /> اعتماد وترحيل
              </button>
            )}
         </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex gap-4 border-b border-slate-200 shrink-0">
        <button 
          onClick={() => setActiveTab('INTAKE')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'INTAKE' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'}`}
        >
          الاستلام (Intake)
        </button>
        <button 
          onClick={() => setActiveTab('INSPECTION')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'INSPECTION' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'}`}
        >
          الفحص والضبط (Inspection)
        </button>
      </div>

      {activeTab === 'INTAKE' && renderIntake()}
      
      {activeTab === 'INSPECTION' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden min-h-[500px]">
           <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                 <h4 className="font-bold text-slate-700">قائمة الانتظار ({pendingInmates.length})</h4>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                 {pendingInmates.map(inmate => (
                   <div 
                     key={inmate.id} 
                     onClick={() => { setSelectedInmateId(inmate.id); setWizardStep(1); }}
                     className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedInmateId === inmate.id ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                   >
                     <p className="font-bold text-slate-800 text-sm">{inmate.fullName}</p>
                     <p className="text-xs text-slate-500">{inmate.referringAuthority}</p>
                   </div>
                 ))}
                 {pendingInmates.length === 0 && (
                   <div className="text-center p-8 text-slate-400 text-sm">
                     لا يوجد نزلاء بانتظار الفحص
                   </div>
                 )}
              </div>
           </div>

           <div className="lg:col-span-2 h-full">
              {renderInspectionWizard()}
           </div>
        </div>
      )}
    </div>
  );
};

export default PreventiveSecurity;
