
import React, { useState } from 'react';
import { Shield, Lock, ChevronLeft, User, UserCheck, HelpCircle, AlertCircle } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

const LoginScreen: React.FC = () => {
  const { login } = useSecurity();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = login(name, password);
    if (!success) {
      setError('بيانات الدخول غير صحيحة. يرجى التأكد من الاسم وكلمة المرور.');
    }
  };

  const handleDemoLogin = (username: string) => {
    setName(username);
    setPassword('123');
    setError('');
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    if (pass.length < 4) return 1; // Weak
    if (pass.length < 8) return 2; // Medium
    return 3; // Strong
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-slideUp">
        <div className="bg-primary-600 p-8 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
           <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
             <Shield size={40} className="text-white" />
           </div>
           <h1 className="text-2xl font-bold text-white">نظام الحارس الأمني</h1>
           <p className="text-primary-100 text-sm mt-1">منصة إدارة الشعبة المتكاملة</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
           {error && (
             <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100 flex items-center justify-center gap-2">
               <AlertCircle size={16} /> {error}
             </div>
           )}

           <div className="space-y-2">
             <label className="text-sm font-bold text-slate-700">اسم المستخدم</label>
             <div className="relative">
               <input 
                 required 
                 type="text" 
                 className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 pl-10 text-slate-900 font-bold placeholder:font-normal placeholder:text-slate-400" 
                 placeholder="ادخل اسم المستخدم..."
                 value={name}
                 onChange={e => setName(e.target.value)}
               />
               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-sm font-bold text-slate-700">كلمة المرور</label>
             <div className="relative">
               <input 
                 required 
                 type="password" 
                 className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 pl-10 text-slate-900 font-bold placeholder:font-normal placeholder:text-slate-400" 
                 placeholder="••••••••"
                 value={password}
                 onChange={e => setPassword(e.target.value)}
               />
               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             </div>
             
             {/* Password Strength Indicator */}
             {password && (
               <div className="flex gap-1 mt-2">
                 <div className={`h-1.5 rounded-full flex-1 transition-colors ${strength >= 1 ? 'bg-red-500' : 'bg-slate-100'}`}></div>
                 <div className={`h-1.5 rounded-full flex-1 transition-colors ${strength >= 2 ? 'bg-amber-500' : 'bg-slate-100'}`}></div>
                 <div className={`h-1.5 rounded-full flex-1 transition-colors ${strength >= 3 ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
               </div>
             )}
             {password && (
                <p className={`text-xs text-right ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {strength === 1 ? 'كلمة مرور ضعيفة' : strength === 2 ? 'متوسطة' : 'قوية'}
                </p>
             )}
           </div>

           <div className="flex justify-end">
             <button type="button" onClick={() => alert('يرجى مراجعة مسؤول النظام لاستعادة كلمة المرور')} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
               <HelpCircle size={14} /> نسيت كلمة المرور؟
             </button>
           </div>

           <button 
             type="submit" 
             className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-4"
           >
             تسجيل الدخول للنظام
           </button>
        </form>
        
        {/* Quick Demo Login */}
        <div className="px-8 pb-8">
           <div className="text-center text-xs text-slate-400 mb-3 relative">
             <span className="bg-white px-2 relative z-10">دخول سريع (ملء البيانات)</span>
             <div className="absolute inset-0 top-1/2 border-t border-slate-100 -z-0"></div>
           </div>
           <div className="grid grid-cols-2 gap-3">
             <button onClick={() => handleDemoLogin('admin')} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center gap-1 border border-slate-200 transition-colors">
               <UserCheck size={14} className="text-primary-600" /> Admin
             </button>
             <button onClick={() => handleDemoLogin('العقيد/ خالد القحطاني')} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center gap-1 border border-slate-200 transition-colors">
               <Shield size={14} className="text-purple-600" /> مدير الشعبة
             </button>
             <button onClick={() => handleDemoLogin('النقيب/ فهد العتيبي')} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center gap-1 border border-slate-200 transition-colors">
               <Lock size={14} className="text-emerald-600" /> ضابط السجن
             </button>
             <button onClick={() => handleDemoLogin('الملازم/ سعد المالكي')} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center gap-1 border border-slate-200 transition-colors">
               <User size={14} className="text-amber-600" /> محقق
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
