
import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  UserX, 
  CheckCircle, 
  X,
  Download,
  Save,
  RotateCcw,
  Edit,
  Trash2
} from 'lucide-react';
import { MOCK_WANTED } from '../constants';
import { WantedPerson } from '../types';
import { useSecurity } from '../context/SecurityContext';

const WantedManager: React.FC = () => {
  const { wantedPersons, addWantedPerson, updateWantedPerson, deleteWantedPerson, updateWantedStatus } = useSecurity();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedPerson, setSelectedPerson] = useState<WantedPerson | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<WantedPerson>>({
    fullName: '',
    nationalId: '',
    caseType: '',
    dangerLevel: 'Medium',
    address: '',
    status: 'At Large'
  });

  const filteredList = wantedPersons.filter(person => {
    const matchesSearch = person.fullName.includes(searchTerm) || person.nationalId.includes(searchTerm);
    const matchesFilter = filterStatus === 'All' || person.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getDangerColor = (level: string) => {
    switch(level) {
      case 'High': return 'text-red-600 bg-red-100 border-red-200';
      case 'Medium': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'Low': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'At Large') return <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100"><UserX size={12}/> طليق</span>;
    if (status === 'Captured') return <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100"><CheckCircle size={12}/> مقبوض عليه</span>;
    return <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">ملغى</span>;
  };

  const handleStatusChange = (e: React.MouseEvent, id: string, newStatus: WantedPerson['status']) => {
    e.stopPropagation();
    updateWantedStatus(id, newStatus);
  };

  const handleOpenAdd = () => {
      setIsEditMode(false);
      setFormData({ fullName: '', nationalId: '', caseType: '', dangerLevel: 'Medium', address: '', status: 'At Large' });
      setIsAddModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, person: WantedPerson) => {
      e.stopPropagation();
      setIsEditMode(true);
      setFormData({...person});
      setIsAddModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
          deleteWantedPerson(id);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && formData.id) {
        // Update
        updateWantedPerson(formData as WantedPerson);
    } else {
        // Create
        const newPerson: WantedPerson = {
            id: Math.random().toString(36).substr(2, 9),
            fullName: formData.fullName || '',
            nationalId: formData.nationalId || '',
            dob: '2000-01-01', 
            nationality: 'سعودي',
            address: formData.address || '',
            caseType: formData.caseType || '',
            dangerLevel: formData.dangerLevel as any,
            status: 'At Large',
            photoUrl: 'https://via.placeholder.com/150'
        };
        addWantedPerson(newPerson);
    }
    setIsAddModalOpen(false);
  };

  const handleExport = () => {
    const headers = ["الاسم", "رقم الهوية", "القضية", "الخطورة", "الحالة"];
    const rows = filteredList.map(i => [i.fullName, i.nationalId, i.caseType, i.dangerLevel, i.status]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "wanted_persons.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">قائمة المطلوبين</h2>
          <p className="text-slate-500">إدارة سجلات المطلوبين أمنياً وتحديث حالاتهم</p>
        </div>
        <div className="flex gap-2">
          <button 
             onClick={handleExport}
             className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50"
           >
             <Download size={18} />
             <span>تصدير</span>
           </button>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 shadow-lg shadow-rose-500/20"
          >
            <Plus size={18} />
            <span>إضافة مطلوب</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="بحث بالاسم أو الرقم الوطني..." 
            className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="bg-slate-50 border border-slate-200 text-slate-600 rounded-lg px-4 py-2 focus:outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">كل الحالات</option>
            <option value="At Large">طليق</option>
            <option value="Captured">مقبوض عليه</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((person) => (
          <div 
            key={person.id} 
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col group"
            onClick={() => setSelectedPerson(person)}
          >
            <div className="p-4 flex gap-4 flex-1">
              <div className="relative shrink-0">
                <img src={person.photoUrl} alt="" className="w-20 h-20 rounded-xl object-cover" />
                <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded text-[10px] font-bold border ${getDangerColor(person.dangerLevel)}`}>
                  {person.dangerLevel === 'High' ? 'خطير' : person.dangerLevel === 'Medium' ? 'متوسط' : 'منخفض'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-slate-800 line-clamp-1">{person.fullName}</h3>
                  {getStatusBadge(person.status)}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1">{person.nationalId}</p>
                <div className="mt-2">
                  <p className="text-xs text-slate-500">القضية:</p>
                  <p className="text-sm font-medium text-slate-700 line-clamp-1">{person.caseType}</p>
                </div>
              </div>
            </div>
            
            {/* Quick Actions Footer */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex justify-between items-center gap-2">
               <div className="flex items-center gap-2">
                 {person.status === 'At Large' ? (
                   <button
                       onClick={(e) => handleStatusChange(e, person.id, 'Captured')}
                       className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"
                       title="تسجيل قبض"
                   >
                       <CheckCircle size={14} />
                   </button>
                 ) : (
                    <button
                       onClick={(e) => handleStatusChange(e, person.id, 'At Large')}
                       className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200"
                       title="إعادة للبحث"
                    >
                       <RotateCcw size={14} />
                    </button>
                 )}
                 <div className="w-px h-4 bg-slate-300 mx-1"></div>
                 <button onClick={(e) => handleOpenEdit(e, person)} className="text-blue-500 hover:text-blue-700 p-1"><Edit size={14} /></button>
                 <button onClick={(e) => handleDelete(e, person.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={14} /></button>
               </div>
               
               <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                 {person.address.split(' - ')[0]}
               </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn overflow-hidden">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">{isEditMode ? 'تعديل بيانات مطلوب' : 'إضافة مطلوب أمني'}</h3>
              <button onClick={() => setIsAddModalOpen(false)}><X className="text-slate-400 hover:text-red-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div>
                  <label className="block text-sm text-slate-500 mb-1">الاسم الكامل</label>
                  <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-500 text-slate-900" />
               </div>
               <div>
                  <label className="block text-sm text-slate-500 mb-1">رقم الهوية</label>
                  <input required type="text" value={formData.nationalId} onChange={e => setFormData({...formData, nationalId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-500 text-slate-900" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm text-slate-500 mb-1">نوع القضية</label>
                    <input required type="text" value={formData.caseType} onChange={e => setFormData({...formData, caseType: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-500 text-slate-900" />
                 </div>
                 <div>
                    <label className="block text-sm text-slate-500 mb-1">درجة الخطورة</label>
                    <select value={formData.dangerLevel} onChange={e => setFormData({...formData, dangerLevel: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-500 text-slate-900">
                      <option value="Low">منخفضة</option>
                      <option value="Medium">متوسطة</option>
                      <option value="High">عالية جداً</option>
                    </select>
                 </div>
               </div>
               <div>
                  <label className="block text-sm text-slate-500 mb-1">عنوان السكن</label>
                  <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-500 text-slate-900" />
               </div>
               <div className="pt-4 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">إلغاء</button>
                <button type="submit" className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 flex items-center gap-2">
                  <Save size={18} /> حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="bg-slate-900 text-white p-6 relative">
              <button 
                onClick={() => setSelectedPerson(null)}
                className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex gap-4 items-center">
                <img src={selectedPerson.photoUrl} alt="" className="w-24 h-24 rounded-xl border-4 border-white/10" />
                <div>
                  <h2 className="text-xl font-bold">{selectedPerson.fullName}</h2>
                  <p className="text-slate-300 font-mono">{selectedPerson.nationalId}</p>
                  <div className={`mt-2 inline-block px-2 py-0.5 rounded text-xs font-bold border ${getDangerColor(selectedPerson.dangerLevel)}`}>
                    خطورة: {selectedPerson.dangerLevel}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">تاريخ الميلاد</p>
                  <p className="font-medium text-slate-800">{selectedPerson.dob}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">الجنسية</p>
                  <p className="font-medium text-slate-800">{selectedPerson.nationality}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">نوع القضية</p>
                <p className="font-bold text-slate-800 text-lg">{selectedPerson.caseType}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">العنوان المسجل</p>
                <p className="font-medium text-slate-800 flex items-center gap-2">
                  {selectedPerson.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WantedManager;
