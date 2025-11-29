
import React, { useState } from 'react';
import { ArrowRightLeft, Clock, MapPin, CheckCircle, Clock3, Plus, X, Save } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { MovementType, Movement } from '../types';

interface MovementsManagerProps {
  onShowProfile?: (id: string) => void;
}

const MovementsManager: React.FC<MovementsManagerProps> = ({ onShowProfile }) => {
  const { movements, inmates, addMovement, updateMovement } = useSecurity();
  const [filterType, setFilterType] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    inmateId: inmates.length > 0 ? inmates[0].id : '',
    type: MovementType.COURT,
    destination: '',
  });

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const inmate = inmates.find(i => i.id === formData.inmateId);
    if (!inmate) return;

    const newMove: Movement = {
      id: `m${Date.now()}`,
      inmateId: inmate.id,
      inmateName: inmate.fullName,
      type: formData.type,
      destination: formData.destination,
      checkOutTime: new Date().toISOString(),
      officerName: 'الضابط المناوب',
      isCompleted: false
    };

    addMovement(newMove);
    setIsModalOpen(false);
    setFormData({ inmateId: inmates.length > 0 ? inmates[0].id : '', type: MovementType.COURT, destination: '' });
  };

  const handleCompleteMovement = (movement: Movement) => {
     const updatedMove = {
         ...movement,
         isCompleted: true,
         checkInTime: new Date().toISOString()
     };
     updateMovement(updatedMove);
  };

  const filteredMovements = movements.filter(m => 
    filterType === 'All' || m.type === filterType
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">حركة النزلاء</h2>
          <p className="text-slate-500">سجل الدخول والخروج والتحويلات الخارجية</p>
        </div>
        <button 
           onClick={() => setIsModalOpen(true)}
           className="flex items-center gap-2 bg-amber-600 text-white px-4 py-3 rounded-xl hover:bg-amber-700 shadow-lg shadow-amber-500/20 active:scale-95 transition-transform font-bold"
        >
          <ArrowRightLeft size={20} />
          <span>تسجيل خروج</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', ...Object.values(MovementType)].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border ${
              filterType === type 
                ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            {type === 'All' ? 'الكل' : type}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredMovements.map((move) => (
            <div key={move.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-4 items-center group">
              {/* Status Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${move.isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600 animate-pulse'}`}>
                {move.isCompleted ? <CheckCircle size={28} /> : <Clock3 size={28} />}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-right cursor-pointer w-full" onClick={() => onShowProfile && onShowProfile(move.inmateId)}>
                <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary-600 transition-colors">
                  {move.inmateName}
                </h3>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {move.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={16} className="text-slate-400" />
                    {move.destination}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={16} className="text-slate-400" />
                    خروج: {new Date(move.checkOutTime).toLocaleTimeString('ar-SA', {hour: '2-digit', minute:'2-digit', day: 'numeric', month: 'numeric'})}
                  </span>
                </div>
              </div>

              {/* Action/Officer */}
              <div className="text-center md:text-left w-full md:w-auto mt-2 md:mt-0">
                 {!move.isCompleted ? (
                   <button 
                     onClick={() => handleCompleteMovement(move)}
                     className="bg-emerald-500 text-white text-sm px-6 py-2.5 rounded-xl hover:bg-emerald-600 font-bold w-full shadow-emerald-500/20 shadow-md transition-all active:scale-95"
                   >
                     تسجيل عودة
                   </button>
                 ) : (
                   <div className="text-center">
                     <span className="block text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mb-1">
                       تمت العودة
                     </span>
                     <span className="text-[10px] text-slate-400 font-mono">
                        {move.checkInTime && new Date(move.checkInTime).toLocaleTimeString('ar-SA', {hour: '2-digit', minute:'2-digit'})}
                     </span>
                   </div>
                 )}
              </div>
            </div>
          ))}
          {filteredMovements.length === 0 && (
            <div className="p-16 text-center text-slate-400">
              <Clock size={56} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold">لا توجد حركات مسجلة</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-800">تسجيل حركة خروج</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-slate-400 hover:text-red-500 transition-colors" /></button>
            </div>
            <form onSubmit={handleAddMovement} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">النزيل</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-500" value={formData.inmateId} onChange={e => setFormData({...formData, inmateId: e.target.value})}>
                   {inmates.map(i => <option key={i.id} value={i.id}>{i.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">نوع الحركة</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-500" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as MovementType})}>
                   {Object.values(MovementType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">الوجهة</label>
                <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} placeholder="مثال: المحكمة الكبرى" />
              </div>
              <button type="submit" className="w-full bg-amber-600 text-white py-3.5 rounded-xl font-bold mt-2 flex justify-center gap-2 shadow-xl shadow-amber-600/20 active:scale-95 transition-transform">
                 <Save size={20} /> تسجيل خروج
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovementsManager;
