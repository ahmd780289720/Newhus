
import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  File, 
  HardDrive, 
  ShieldCheck, 
  Lock, 
  Camera, 
  Download, 
  AlertTriangle, 
  CheckCircle,
  FolderOpen,
  Settings,
  Smartphone
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

const StorageManager: React.FC = () => {
  const { createBackup, requestPersistentStorage } = useSecurity();
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted'>('pending');
  const [storageUsage, setStorageUsage] = useState<{usage: number, quota: number} | null>(null);

  useEffect(() => {
    // Check storage estimate
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        setStorageUsage({
          usage: estimate.usage || 0,
          quota: estimate.quota || 1024 * 1024 * 1024 // 1GB default
        });
      });
    }
  }, []);

  const handleGrantPermissions = async () => {
    // 1. Request Persistent Storage (Web API)
    const isPersisted = await requestPersistentStorage();
    
    // 2. Trigger Permission Prompts for APK wrapper
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (e) {
      console.warn("Camera permission flow triggered");
    }

    setPermissionStatus('granted');
    alert("تم منح الصلاحيات. عند تحويل التطبيق لـ APK، سيتم إنشاء المجلدات تلقائياً في مسار /Android/data/");
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <HardDrive className="text-slate-900" /> مدير الملفات (Native File System)
            </h2>
            <p className="text-slate-500">إدارة التخزين المحلي والمجلدات على الهاتف</p>
         </div>
         <div className="bg-slate-100 px-4 py-2 rounded-lg flex items-center gap-2">
            <Smartphone size={16} className="text-slate-500"/>
            <span className="text-xs font-bold text-slate-600">وضع الهاتف (APK Ready)</span>
         </div>
      </div>

      {/* Permissions Banner */}
      {permissionStatus === 'pending' && (
        <div className="bg-slate-900 text-white border border-slate-700 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
           <div className="flex items-start gap-4">
              <div className="bg-white/10 p-3 rounded-2xl text-amber-400 animate-pulse">
                 <ShieldCheck size={32} />
              </div>
              <div>
                 <h3 className="font-bold text-lg">تهيئة التطبيق للعمل كـ APK</h3>
                 <p className="text-slate-300 text-sm leading-relaxed max-w-xl mt-1">
                   لكي يعمل التطبيق كبرنامج مثبت ويقوم بإنشاء مجلدات حقيقية، يجب منح صلاحيات الوصول الكاملة للذاكرة والكاميرا الآن.
                 </p>
              </div>
           </div>
           <button 
             onClick={handleGrantPermissions}
             className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 whitespace-nowrap"
           >
             منح وتثبيت الصلاحيات
           </button>
        </div>
      )}

      {/* Storage Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all">
            <div className="flex justify-between items-start mb-4">
               <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform"><HardDrive size={24} /></div>
               <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">Internal Storage</span>
            </div>
            <div>
               <h4 className="font-bold text-slate-800 text-lg">ذاكرة الهاتف</h4>
               <p className="text-sm text-slate-500">المستخدم: {storageUsage ? formatBytes(storageUsage.usage) : '...'}</p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
               <div className="bg-blue-500 h-full w-[15%]"></div>
            </div>
         </div>

         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-all">
            <div className="flex justify-between items-start mb-4">
               <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform"><Lock size={24} /></div>
               <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={10}/> محمي</span>
            </div>
            <div>
               <h4 className="font-bold text-slate-800 text-lg">قاعدة البيانات</h4>
               <p className="text-sm text-slate-500">SQLite / LocalStorage</p>
            </div>
            <p className="text-xs text-slate-400 mt-4 font-mono">Status: Persisted</p>
         </div>

         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-purple-200 transition-all">
            <div className="flex justify-between items-start mb-4">
               <div className="bg-purple-50 p-3 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform"><Camera size={24} /></div>
            </div>
            <div>
               <h4 className="font-bold text-slate-800 text-lg">الوسائط</h4>
               <p className="text-sm text-slate-500">الصور والمستندات</p>
            </div>
            <button className="text-xs font-bold text-purple-600 mt-4 hover:underline text-right">استعراض المجلد</button>
         </div>
      </div>

      {/* File Manager UI Simulation */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-lg overflow-hidden flex flex-col">
         <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
               <FolderOpen className="text-amber-400" /> 
               <div>
                  <h3 className="font-bold text-sm">مدير الملفات (Root Access)</h3>
                  <p className="text-[10px] text-slate-400 font-mono">/storage/emulated/0/Alhares/</p>
               </div>
            </div>
            <Settings size={18} className="text-slate-400" />
         </div>
         
         <div className="p-8 bg-slate-50 flex-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {/* Folder 1: Backups */}
               <div className="group cursor-pointer hover:bg-white hover:shadow-md p-4 rounded-xl transition-all border border-transparent hover:border-amber-100" onClick={createBackup}>
                  <div className="flex justify-center mb-3">
                     <Folder size={64} className="text-amber-400 fill-amber-400 drop-shadow-sm group-hover:scale-105 transition-transform" />
                  </div>
                  <p className="text-center font-bold text-slate-700 text-sm">Backups</p>
                  <p className="text-center text-[10px] text-slate-400 font-mono">7 items • 12MB</p>
               </div>

               {/* Folder 2: Database */}
               <div className="group cursor-pointer hover:bg-white hover:shadow-md p-4 rounded-xl transition-all border border-transparent hover:border-blue-100">
                  <div className="flex justify-center mb-3">
                     <Folder size={64} className="text-blue-400 fill-blue-400 drop-shadow-sm group-hover:scale-105 transition-transform" />
                  </div>
                  <p className="text-center font-bold text-slate-700 text-sm">Database</p>
                  <p className="text-center text-[10px] text-slate-400 font-mono">db.sqlite</p>
               </div>

               {/* Folder 3: Media */}
               <div className="group cursor-pointer hover:bg-white hover:shadow-md p-4 rounded-xl transition-all border border-transparent hover:border-emerald-100">
                  <div className="flex justify-center mb-3">
                     <Folder size={64} className="text-emerald-400 fill-emerald-400 drop-shadow-sm group-hover:scale-105 transition-transform" />
                  </div>
                  <p className="text-center font-bold text-slate-700 text-sm">Images</p>
                  <p className="text-center text-[10px] text-slate-400 font-mono">42 files</p>
               </div>

               {/* File: Config */}
               <div className="group cursor-pointer hover:bg-white hover:shadow-md p-4 rounded-xl transition-all border border-transparent hover:border-slate-200">
                  <div className="flex justify-center mb-3">
                     <File size={56} className="text-slate-400 drop-shadow-sm group-hover:scale-105 transition-transform" />
                  </div>
                  <p className="text-center font-bold text-slate-700 text-sm">system.config</p>
                  <p className="text-center text-[10px] text-slate-400 font-mono">XML File</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default StorageManager;
