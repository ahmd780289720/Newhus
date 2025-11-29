import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Terminal, Home, Trash2 } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    // Attempt to clear potentially corrupted data keys first
    // const keys = [
    //   'sec_sys_inmates', 'sec_sys_cases', 'sec_sys_minutes', 
    //   'sec_sys_wards', 'sec_sys_inspections'
    // ];
    // We don't clear everything to try and save user session if possible, 
    // but if it's a hard crash, user can choose the full reset.
    window.location.reload();
  };

  private handleHardReset = () => {
    if(window.confirm('هل أنت متأكد؟ سيتم حذف جميع البيانات المخزنة محلياً وإعادة التطبيق لحالة البداية.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans text-right" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-700">
            <div className="bg-red-600 p-8 flex items-start gap-6 text-white">
              <div className="bg-white/20 p-3 rounded-2xl">
                <AlertTriangle size={40} />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">توقف النظام عن العمل</h1>
                <p className="text-red-100 text-sm leading-relaxed opacity-90">
                  واجه التطبيق خطأ غير متوقع في البيانات (Data Corruption) أو في البرمجية.
                  تم إيقاف الواجهة لحماية السجلات المتبقية.
                </p>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                 <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
                   <Terminal size={16} className="text-slate-400" /> التشخيص التقني
                 </h3>
                 <div className="bg-slate-900 text-green-400 p-4 rounded-xl overflow-x-auto text-left shadow-inner" dir="ltr">
                   <code className="text-xs font-mono">
                     {this.state.error && this.state.error.toString()}
                   </code>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={this.handleReset}
                  className="group bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary-500/20"
                >
                  <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" /> 
                  <span>محاولة التشغيل مجدداً</span>
                </button>
                
                <button 
                  onClick={this.handleHardReset}
                  className="group bg-white text-red-600 border-2 border-red-100 py-4 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 flex items-center justify-center gap-3 transition-all"
                >
                  <Trash2 size={20} /> 
                  <span>تصفير وإصلاح شامل (Format)</span>
                </button>
              </div>

              <div className="text-center">
                 <button onClick={() => window.location.href = '/'} className="text-slate-400 hover:text-slate-600 text-sm font-bold flex items-center justify-center gap-2 mx-auto">
                    <Home size={14} /> العودة للصفحة الرئيسية
                 </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;