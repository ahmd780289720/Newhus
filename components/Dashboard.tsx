
import React from 'react';
import { 
  Lock, 
  FileText, 
  Database,
  UserPlus,
  Activity,
  Shield,
  Star,
  Trash2,
  Plus
} from 'lucide-react';
import { ViewState, InmateStatus } from '../types';
import { useSecurity } from '../context/SecurityContext';

interface DashboardProps {
  onNavigate: (view: ViewState, sub?: string) => void;
  onShowProfile?: (id: string) => void;
}

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, bgClass, onClick }: any) => (
  <div 
    onClick={onClick}
    className="bg-white p-6 rounded-[2rem] shadow-sm border border-white hover:shadow-xl hover:shadow-slate-200/50 hover:scale-[1.02] transition-all cursor-pointer group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-4 rounded-2xl ${bgClass} group-hover:scale-110 transition-transform`}>
        <Icon className={colorClass.replace('text-', 'text-opacity-100 text-')} size={28} />
      </div>
      <span className={`text-3xl font-extrabold text-slate-800`}>{value}</span>
    </div>
    <div>
      <h3 className="font-bold text-slate-700 text-lg">{title}</h3>
      <p className="text-slate-400 text-xs mt-1 font-medium">{subtext}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { inmates, cases, inspections, favorites, removeFavorite } = useSecurity();

  const processingCount = inmates.filter(i => i.status === InmateStatus.PROCESSING).length;
  const detainedCount = inmates.filter(i => i.status === InmateStatus.DETAINED || i.status === InmateStatus.READY_FOR_HOUSING).length;
  const activeCases = cases.filter(c => c.status === 'Open').length;
  
  return (
    <div className="space-y-8">
      
      {/* Favorites Section */}
      <div className="animate-fadeIn">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Star className="text-amber-400 fill-amber-400" size={20} /> الوصول السريع (المفضلة)
          </h3>
          
          {favorites.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {favorites.map(fav => (
                  <div key={fav.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-primary-200 transition-all cursor-pointer" onClick={() => onNavigate(fav.view, fav.subView)}>
                    <span className="font-bold text-slate-700 text-sm truncate flex-1 text-right">
                        {fav.label}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFavorite(fav.id); }} 
                      className="text-slate-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                      title="إزالة من المفضلة"
                    >
                        <Trash2 size={14} />
                    </button>
                  </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-slate-400 bg-slate-50/50">
              <div className="bg-white p-3 rounded-full mb-2 shadow-sm">
                <Plus size={24} className="text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-500">قائمة المفضلة فارغة</p>
              <p className="text-xs mt-1">اضغط مطولاً على أي زر في القائمة الجانبية لإضافته هنا للوصول السريع</p>
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="إجراءات القبول" 
          value={processingCount}
          subtext="بانتظار التسجيل والتفتيش"
          icon={UserPlus}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
          onClick={() => onNavigate('PRISON_ADMIN', 'NEW_INMATE')}
        />
        <StatCard 
          title="تعداد النزلاء" 
          value={detainedCount}
          subtext="إجمالي المتواجدين بالعنابر"
          icon={Lock}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
          onClick={() => onNavigate('PRISON_ADMIN', 'HOUSING')}
        />
        <StatCard 
          title="القضايا النشطة" 
          value={activeCases}
          subtext="تحقيقات قيد الإجراء"
          icon={FileText}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
          onClick={() => onNavigate('INVESTIGATIONS', 'NEW_CASE')}
        />
        <StatCard 
          title="التقارير الأمنية" 
          value={inspections.length}
          subtext="سجل المعلومات المؤرشفة"
          icon={Database}
          colorClass="text-purple-600"
          bgClass="bg-purple-50"
          onClick={() => onNavigate('INFO_DEPT')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div className="flex items-center justify-between mb-8">
             <h3 className="font-extrabold text-2xl text-slate-800 flex items-center gap-3">
               <Activity className="text-slate-900" /> النشاط الميداني الحي
             </h3>
             <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full animate-pulse">بث مباشر</span>
           </div>
           <div className="space-y-4">
              {inmates.slice(0, 4).map((inmate, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-200">
                   <div className={`w-3 h-3 rounded-full shadow-sm ${inmate.status === InmateStatus.PROCESSING ? 'bg-blue-500 shadow-blue-500/50' : 'bg-emerald-500 shadow-emerald-500/50'}`}></div>
                   <div className="flex-1">
                     <p className="text-sm text-slate-800 font-bold">{inmate.fullName}</p>
                     <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-white px-2 rounded text-slate-500 border border-slate-100">{inmate.status}</span>
                     </div>
                   </div>
                   <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-xl border border-slate-100">{inmate.entryDate}</span>
                </div>
              ))}
              {inmates.length === 0 && (
                <p className="text-center text-slate-400 py-4 text-sm">لا توجد أنشطة مسجلة حديثاً</p>
              )}
           </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden flex flex-col justify-between">
           <div className="relative z-10">
             <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <Shield size={32} className="text-white" />
             </div>
             <h3 className="font-extrabold text-2xl mb-2 leading-tight">النظام الأمني<br/>المتكامل</h3>
             <p className="text-slate-300 text-sm font-medium leading-relaxed mt-4">
               تعمل جميع الإدارات بشكل متزامن لضمان تدفق البيانات بشكل آمن وسريع بين القطاعات.
             </p>
           </div>
           <button 
             onClick={() => onNavigate('REPORTS_CENTER')}
             className="relative z-10 mt-8 bg-white text-slate-900 w-full py-4 rounded-2xl font-bold hover:bg-slate-50 transition-colors shadow-lg"
           >
             عرض تقرير الحالة
           </button>
           
           {/* Abstract Decor */}
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"></div>
           <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
