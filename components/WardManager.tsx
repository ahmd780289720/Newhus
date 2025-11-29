
import React, { useState } from 'react';
import { Plus, Users, Layout, MoreHorizontal, X, Save } from 'lucide-react';
import { MOCK_WARDS } from '../constants';
import { Ward, ViewState } from '../types';

interface WardManagerProps {
  onNavigate: (view: ViewState) => void;
  onFilterByWard?: (wardId: string) => void;
}

const WardManager: React.FC<WardManagerProps> = ({ onNavigate, onFilterByWard }) => {
  const [wards, setWards] = useState<Ward[]>(MOCK_WARDS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', capacity: 20, supervisor: '' });

  const handleAddWard = (e: React.FormEvent) => {
    e.preventDefault();
    const newWard: Ward = {
      id: `W${wards.length + 1}`,
      name: formData.name,
      capacity: Number(formData.capacity),
      currentCount: 0,
      supervisor: formData.supervisor
    };
    setWards([...wards, newWard]);
    setIsModalOpen(false);
    setFormData({ name: '', capacity: 20, supervisor: '' });
  };

  const handleViewInmates = (wardId: string) => {
    if (onFilterByWard) {
      onFilterByWard(wardId);
    } else {
      // Corrected from 'INMATES' to 'PRISON_ADMIN' as INMATES is not a valid ViewState
      onNavigate('PRISON_ADMIN');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">العنابر والأجنحة</h2>
          <p className="text-slate-500">مراقبة السعة الاستيعابية وتوزيع النزلاء</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-500/20"
        >
          <Plus size={18} />
          <span>إضافة عنبر</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wards.map((ward) => {
          const percentage = Math.round((ward.currentCount / ward.capacity) * 100);
          let progressColor = 'bg-emerald-500';
          if (percentage > 80) progressColor = 'bg-amber-500';
          if (percentage >= 100) progressColor = 'bg-red-500';

          return (
            <div key={ward.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-primary-200 transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-primary-50 transition-colors">
                  <Layout size={24} className="text-slate-400 group-hover:text-primary-600" />
                </div>
                <button className="text-slate-300 hover:text-slate-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-1">{ward.name}</h3>
              <p className="text-sm text-slate-500 mb-6">مشرف: {ward.supervisor}</p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Users size={14} />
                    {ward.currentCount} نزيل
                  </span>
                  <span className="text-slate-400">سعة {ward.capacity}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${progressColor} transition-all duration-1000`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold ${percentage >= 100 ? 'text-red-500' : 'text-slate-400'}`}>
                    {percentage}% ممتلئ
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
                <button 
                  onClick={() => handleViewInmates(ward.id)}
                  className="flex-1 text-sm bg-slate-50 text-slate-600 py-2 rounded-lg hover:bg-slate-100 font-medium transition-colors"
                >
                  قائمة النزلاء
                </button>
                <button 
                  onClick={() => alert('ميزة النقل السريع قادمة قريباً')}
                  className="flex-1 text-sm bg-primary-50 text-primary-600 py-2 rounded-lg hover:bg-primary-100 font-medium transition-colors"
                >
                  نقل إلى هنا
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">إضافة عنبر جديد</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddWard} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1">اسم العنبر</label>
                <input required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm text-slate-500 mb-1">السعة</label>
                    <input type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} />
                 </div>
                 <div>
                    <label className="block text-sm text-slate-500 mb-1">المشرف</label>
                    <input required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2" value={formData.supervisor} onChange={e => setFormData({...formData, supervisor: e.target.value})} />
                 </div>
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold mt-4 flex justify-center gap-2">
                 <Save size={18} /> حفظ
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardManager;
