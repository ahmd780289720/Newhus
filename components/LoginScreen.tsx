import React, { useState, useEffect } from "react";
import { Lock, User, HelpCircle } from "lucide-react";
import { useSecurity } from "../context/SecurityContext";
import logo from "../src/assets/logo.png";
import "../src/index.css";
const LoginScreen: React.FC = () => {
  const { login } = useSecurity();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("saved_name");
    const savedPass = localStorage.getItem("saved_pass");

    if (savedName && savedPass) {
      setName(savedName);
      setPassword(savedPass);
      setRemember(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (remember) {
      localStorage.setItem("saved_name", name);
      localStorage.setItem("saved_pass", password);
    } else {
      localStorage.removeItem("saved_name");
      localStorage.removeItem("saved_pass");
    }

    const success = login(name, password);
    if (!success) {
      setError("بيانات الدخول غير صحيحة.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-slideUp">

        {/* 🔵 القسم الأزرق — رجّعته بالحجم الكبير */}
        <div className="relative bg-sky-500 p-20 text-center overflow-hidden">
          <img
            src={logo}
            alt="شعار اليمن"
            className="absolute inset-0 w-full h-full object-contain opacity-25 pointer-events-none select-none"
          />
        </div>

        {/* العنوان — ما لمسته */}
        <div className="px-8 pt-6">
          <h1 className="title-kacst text-black text-2xl font-bold text-center">
            شعبة استخبارات المنطقة السادسة
          </h1>
        </div>

        {/* نموذج تسجيل الدخول */}
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">اسم المستخدم</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ادخل اسم المستخدم..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl pl-10 text-slate-900 font-bold placeholder:text-slate-400"
              />
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">كلمة المرور</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl pl-10 text-slate-900 font-bold placeholder:text-slate-400"
              />
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 text-slate-700 font-bold">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              تذكر بيانات الدخول
            </label>

            <a className="text-sky-600 font-bold flex items-center gap-1 text-sm">
              نسيت كلمة المرور؟
              <HelpCircle size={16} />
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition"
          >
            تسجيل الدخول
          </button>
        </form>

        <p className="text-center text-slate-600 pb-6 font-bold">
          نظام الحارس الأمني - دخول المستخدمين
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
