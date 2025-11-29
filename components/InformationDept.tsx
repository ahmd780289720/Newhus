
import React from 'react';
import { 
  Database, 
  Search, 
  FileText, 
  Globe, 
  Network
} from 'lucide-react';

interface InformationDeptProps {
  initialTab?: string;
}

const InformationDept: React.FC<InformationDeptProps> = ({ initialTab }) => {
  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">إدارة المعلومات</h2>
          <p className="text-slate-500">استخلاص المعلومات، التحليل، والمصادر الخارجية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="text-primary-600" /> تحليل محاضر التحقيق
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            مراجعة محاضر التحقيق الواردة واستخلاص المعلومات الهامة منها لقاعدة البيانات.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-slate-400 text-sm">لا توجد محاضر جديدة للتحليل</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Globe className="text-primary-600" /> المصادر الخارجية
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            تسجيل وتتبع المعلومات الواردة من المصادر السرية والجهات الخارجية.
          </p>
          <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 font-bold transition-colors">
            + تسجيل معلومة جديدة
          </button>
        </div>
      </div>
    </div>
  );
};

export default InformationDept;
