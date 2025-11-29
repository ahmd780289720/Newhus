
import React, { useState, useRef } from 'react';
import { Shield, Mail, MoreVertical, Plus, Edit, Trash, X, Download, Lock, AlertTriangle, Camera } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { UserRole, User, Department } from '../types';

const UserManager: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useSecurity();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({ 
    id: '',
    name: '', 
    role: UserRole.OFFICER, 
    department: Department.PRISON_ADMIN,
    password: ''
  });
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-purple-100 text-purple-700 border-purple-200';
      case UserRole.OFFICER: return 'bg-blue-100 text-blue-700 border-blue-200';
      case UserRole.SECRETARY: return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({ id: '', name: '', role: UserRole.OFFICER, department: Department.PRISON_ADMIN, password: '' });
    setUserAvatar(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setIsEditMode(true);
    setFormData({ 
      id: user.id,
      name: user.name, 
      role: user.role, 
      department: user.department, 
      password: user.password || '' 
    });
    setUserAvatar(user.avatar || null);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setUserAvatar(imageUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const avatarUrl = userAvatar || 'https://via.placeholder.com/100';

    if (isEditMode) {
      const updatedUser: User = {
        id: formData.id,
        name: formData.name,
        role: formData.role,
        department: formData.department,
        password: formData.password,
        avatar: avatarUrl
      };
      updateUser(updatedUser);
    } else {
      const newUser: User = {
        id: `u${Date.now()}`,
        name: formData.name,
        role: formData.role,
        department: formData.department,
        password: formData.password,
        avatar: avatarUrl
      };
      addUser(newUser);
    }
    setIsModalOpen(false);
  };

  const handleExport = () => {
    const headers = ["الاسم", "الصلاحية", "الرقم التعريفي", "الإدارة"];
    const rows = users.map(u => [u.name, u.role, u.id, u.department]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "users.csv";
    link.click();
  };

  const handleDeleteClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation(); 
    e.preventDefault();
    if (currentUser?.id === userId) {
      alert('لا يمكنك حذف حسابك الحالي!');
      return;
    }
    setDeleteTargetId(userId);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteUser(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">إدارة المستخدمين</h2>
          <p className="text-slate-500">صلاحيات الوصول وحسابات الموظفين</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50">
            <Download size={18} /> <span>تصدير</span>
          </button>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-500/20"
          >
            <Plus size={18} />
            <span>مستخدم جديد</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-primary-200 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover" />
              <button className="text-slate-300 hover:text-slate-600 p-1">
                <MoreVertical size={20} />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1">{user.name}</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getRoleColor(user.role)}`}>
              {user.role}
            </span>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <Shield size={16} />
                <span>القسم: {user.department}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <Mail size={16} />
                <span>{user.id}@security.gov</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
              <button 
                type="button"
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
                onClick={() => handleOpenEdit(user)}
              >
                <Edit size={14} className="pointer-events-none" /> تعديل
              </button>
              <button 
                type="button"
                onClick={(e) => handleDeleteClick(e, user.id)}
                className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                  currentUser?.id === user.id 
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                  : 'bg-red-50 text-red-500 hover:bg-red-100'
                }`}
                disabled={currentUser?.id === user.id}
                title={currentUser?.id === user.id ? "لا يمكن حذف الحساب الحالي" : "حذف المستخدم"}
              >
                <Trash size={16} className="pointer-events-none" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fadeIn overflow-hidden">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg">{isEditMode ? 'تعديل المستخدم' : 'مستخدم جديد'}</h3>
               <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div className="flex justify-center mb-4">
                 <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-primary-500 transition-colors">
                      {userAvatar ? (
                        <img src={userAvatar} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="text-slate-400" size={24} />
                      )}
                   </div>
                   {userAvatar && (
                     <button 
                       type="button"
                       onClick={(e) => { e.stopPropagation(); setUserAvatar(null); }}
                       className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-sm"
                     >
                       <X size={12} />
                     </button>
                   )}
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              <div>
                <label className="block text-sm text-slate-500 mb-1">اسم الموظف (للدخول)</label>
                <input required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">كلمة المرور</label>
                <div className="relative">
                  <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 pl-8" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  <Lock size={14} className="absolute left-2 top-3 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">القسم</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value as Department})}>
                   {Object.values(Department).map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">الصلاحية</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                   {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold mt-4">حفظ المستخدم</button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">حذف المستخدم؟</h3>
            <p className="text-slate-500 text-sm mb-6">
              هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء وسيتم فقدان صلاحيات الدخول الخاصة به.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
              >
                نعم، حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
