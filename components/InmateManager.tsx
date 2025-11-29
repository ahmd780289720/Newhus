
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download,
  ArrowRight,
  Edit,
  Trash2,
  Save,
  X,
  Shield,
  AlertOctagon,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { Inmate, InmateStatus, InmateType } from '../types';
import { useSecurity } from '../context/SecurityContext';

interface InmateManagerProps {
  onShowProfile?: (id: string) => void;
}

const InmateManager: React.FC<InmateManagerProps> = ({ onShowProfile }) => {
  const { inmates, deleteInmate, updateInmate, wards } = useSecurity();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<InmateType | 'ALL'>('ALL');
  
  // Edit State
  const [editingInmate, setEditingInmate] = useState<Inmate | null>(null);
  
  const filteredInmates = inmates.filter(inmate => {
    const matchesSearch = inmate.fullName.includes(searchTerm) || 
                          inmate.nationalId.includes(searchTerm);
    const matchesType = activeTypeFilter === 'ALL' || inmate.type === activeTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: InmateStatus) => {
    switch(status) {
      case InmateStatus.DETAINED: return 'bg-emerald-100 text-emerald-700';
      case InmateStatus.PROCESSING: return 'bg-blue-100 text-blue-700';
      case InmateStatus.READY_FOR_HOUSING: return 'bg-amber-100 text-amber-700';
      case InmateStatus.RELEASED: return 'bg-slate-100 text-slate-600';
      case InmateStatus.TRANSFERRED: return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getTypeIcon = (type: InmateType) => {
      switch(type) {
          case 'MILITARY': return <Shield size={16} className="text-emerald-600" />;
          case 'POW': return <AlertOctagon size={16} className="text-red-600" />;
          case 'SUSPECT': return <HelpCircle size={16} className="text-primary-600" />;
          default: return <HelpCircle size={16} />;
      }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(window.confirm('هل أنت متأكد من حذف هذا النزيل وسجله بالكامل؟ لا يمكن التراجع.')) {
          deleteInmate(id);
      }
  };

  const handleEditClick = (e: React.MouseEvent, inmate: Inmate) => {
      e.stopPropagation();
      setEditingInmate({...inmate});
  };

  const handleSaveEdit = (e: React.FormEvent) => {
      e.preventDefault();
      if(editingInmate) {
          updateInmate(editingInmate);
          setEditingInmate(null);
          alert('تم تحديث البيانات بنجاح');
      }
  };

  return (
    <div className="space-y-4 pb-24 relative">
      {/* Header */}
      <div className="flex flex-col gap-4 sticky top-0 bg-[#f8fafc] z-20 pb-2 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">سجل بيانات النزلاء</h2>
            <p className="text-slate-500 text-xs">إدارة وتعديل البيانات - {filteredInmates.length} ملف</p>
          </div>
        </div>

        {/* Type Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
                {id: 'ALL', label: 'الكل', icon: null},
                {id: 'MILITARY', label: 'عسكريين', icon: Shield},
                {id: 'POW', label: 'أسرى حرب', icon: AlertOctagon},
                {id: 'SUSPECT', label: 'مشتبهين', icon: HelpCircle},
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTypeFilter(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                        activeTypeFilter === tab.id 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {tab.icon && <tab.icon size={16} />}
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="بحث بالاسم أو الرقم..." 
              className="w-full pl-4 pr-10 py-3 bg-white border-none shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Inmate List */}
      <div className="space-y-3">
        {filteredInmates.map((inmate) => {
            const wardName = wards.find(w => w.id === inmate.wardId)?.name || 'غير محدد';
            return (
                <div 
                    key={inmate.id} 
                    onClick={() => onShowProfile && onShowProfile(inmate.id)}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative group active:scale-[0.99] transition-all cursor-pointer"
                >
                    <div className="flex items-start gap-4">
                        <img src={inmate.photoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm" />
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-slate-800 text-lg truncate mb-1">{inmate.fullName}</h3>
                                {getTypeIcon(inmate.type || 'SUSPECT')}
                            </div>
                            
                            <p className="text-xs text-slate-400 font-mono font-bold mb-2">{inmate.nationalId}</p>
                            
                            <div className="flex flex-wrap gap-2">
                                <span className={`text-[10px] px-2 py-1 rounded font-bold ${getStatusColor(inmate.status)}`}>
                                {inmate.status}
                                </span>
                                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200 font-medium">
                                {wardName}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end gap-3">
                        <button 
                            onClick={(e) => handleEditClick(e, inmate)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100"
                        >
                            <Edit size={14} /> تعديل
                        </button>
                        <button 
                            onClick={(e) => handleDelete(e, inmate.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100"
                        >
                            <Trash2 size={14} /> حذف
                        </button>
                    </div>
                </div>
            );
        })}
        
        {filteredInmates.length === 0 && (
            <div className="text-center py-10 text-slate-400">
                <p>لا توجد بيانات مطابقة</p>
            </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingInmate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fadeIn overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-slate-800">تعديل بيانات النزيل</h3>
                      <button onClick={() => setEditingInmate(null)}><X className="text-slate-400 hover:text-red-500" /></button>
                  </div>
                  <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">الاسم الكامل</label>
                          <input required type="text" value={editingInmate.fullName} onChange={e => setEditingInmate({...editingInmate, fullName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">رقم الهوية</label>
                            <input required type="text" value={editingInmate.nationalId} onChange={e => setEditingInmate({...editingInmate, nationalId: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">رقم القضية</label>
                            <input type="text" value={editingInmate.caseNumber || ''} onChange={e => setEditingInmate({...editingInmate, caseNumber: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                         </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">التهمة</label>
                          <input type="text" value={editingInmate.primaryCharge} onChange={e => setEditingInmate({...editingInmate, primaryCharge: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">العنبر</label>
                          <select value={editingInmate.wardId || ''} onChange={e => setEditingInmate({...editingInmate, wardId: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
                             <option value="">غير مسكن</option>
                             {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                          </select>
                      </div>
                      <div className="pt-4 flex justify-end gap-3">
                          <button type="button" onClick={() => setEditingInmate(null)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">إلغاء</button>
                          <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 flex items-center gap-2">
                             <Save size={16} /> حفظ التغييرات
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default InmateManager;
