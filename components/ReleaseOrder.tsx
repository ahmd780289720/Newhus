
import React, { useState } from 'react';
import { FileText, Printer, Search, UserCheck } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { Inmate } from '../types';

const ReleaseOrder: React.FC = () => {
  const { inmates } = useSecurity();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInmate, setSelectedInmate] = useState<Inmate | null>(null);
  const [signatoryName, setSignatoryName] = useState('عبدالباري الناصر');
  const [signatoryRank, setSignatoryRank] = useState('عقيد');

  const filteredInmates = inmates.filter(i => 
    i.fullName.includes(searchQuery) || i.nationalId.includes(searchQuery)
  );

  const handlePrint = () => {
    if (!selectedInmate) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const date = new Date().toLocaleDateString('ar-SA');

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>أمر إفراج: ${selectedInmate.fullName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Tajawal', sans-serif; padding: 40px; background: #fff; color: #000; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 50px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          h1 { font-size: 28px; margin-bottom: 10px; }
          h2 { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
          h3 { font-size: 18px; font-weight: normal; margin-bottom: 5px; }
          .content { line-height: 2.5; font-size: 18px; text-align: justify; margin-bottom: 60px; }
          .signature-section { float: left; text-align: center; margin-top: 50px; width: 250px; }
          .signature-line { margin-top: 60px; border-top: 1px solid #000; }
          .stamp-box { width: 120px; height: 120px; border: 2px dashed #ccc; margin: 20px auto; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 12px; border-radius: 50%; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>وزارة الدفاع</h2>
          <h3>إدارة الشعبة</h3>
          <h1>أمر إفراج</h1>
          <p>التاريخ: ${date}</p>
        </div>

        <div class="content">
          <p>
            إشارة إلى الأمر الإداري وتوجيهات الجهات المختصة،<br/>
            يتم بموجب هذه الوثيقة الإفراج عن النزيل/ <strong>${selectedInmate.fullName}</strong>،<br/>
            صاحب الهوية الوطنية رقم (<strong>${selectedInmate.nationalId}</strong>)،<br/>
            وذلك لانتهاء محكوميته / أو بناءً على أمر إطلاق السراح الصادر من الجهة القضائية المختصة.
          </p>
          <p>
            على جميع الجهات المعنية تسهيل خروجه مالم يكن مطلوباً لجهة أخرى.
          </p>
        </div>

        <div class="signature-section">
          <p><strong>${signatoryRank}</strong></p>
          <p>${signatoryName}</p>
          <div class="stamp-box">الختم الرسمي</div>
          <div class="signature-line">التوقيع</div>
        </div>

        <div style="clear: both;"></div>

        <div style="text-align: center; margin-top: 50px;">
          <button onclick="window.print()" style="padding: 15px 30px; font-size: 16px; background: #000; color: #fff; border: none; border-radius: 8px; cursor: pointer;">طباعة الأمر</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">أوامر الإفراج</h2>
          <p className="text-slate-500">إصدار وطباعة وثائق الإفراج الرسمية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Selection Panel */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Search size={20} className="text-primary-600" /> البحث عن نزيل
          </h3>
          <input 
            type="text" 
            placeholder="الاسم أو رقم الهوية..." 
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-primary-500"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredInmates.map(inmate => (
              <div 
                key={inmate.id} 
                onClick={() => setSelectedInmate(inmate)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedInmate?.id === inmate.id 
                  ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500' 
                  : 'bg-white border-slate-100 hover:border-slate-300'
                }`}
              >
                <p className="font-bold text-slate-800 text-sm">{inmate.fullName}</p>
                <p className="text-xs text-slate-500">{inmate.nationalId}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          {selectedInmate ? (
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-fadeIn">
               <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
                 <h2 className="text-2xl font-extrabold text-slate-800 mb-2">أمر إفراج</h2>
                 <p className="text-slate-500 text-sm">وزارة الدفاع - إدارة الشعبة</p>
               </div>

               <div className="space-y-6 text-lg leading-relaxed text-slate-700 text-justify">
                 <p>
                   يفرج عن المتهم / <span className="font-bold text-black border-b border-dotted border-slate-400 px-2">{selectedInmate.fullName}</span>
                 </p>
                 <p>
                   هوية رقم / <span className="font-bold text-black border-b border-dotted border-slate-400 px-2">{selectedInmate.nationalId}</span>
                 </p>
                 <p>
                   وذلك لانتهاء المحكومية أو صدور أمر قضائي بذلك.
                 </p>
               </div>

               <div className="mt-12 pt-8 border-t border-slate-100">
                 <h4 className="font-bold text-slate-800 mb-4 text-sm">بيانات التوقيع (للطباعة):</h4>
                 <div className="grid grid-cols-2 gap-4 mb-6">
                   <div>
                     <label className="block text-xs text-slate-500 mb-1">الرتبة</label>
                     <input type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" value={signatoryRank} onChange={e => setSignatoryRank(e.target.value)} />
                   </div>
                   <div>
                     <label className="block text-xs text-slate-500 mb-1">الاسم</label>
                     <input type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" value={signatoryName} onChange={e => setSignatoryName(e.target.value)} />
                   </div>
                 </div>

                 <div className="flex justify-end">
                   <div className="text-center w-48">
                      <p className="font-bold text-slate-800">{signatoryRank}</p>
                      <p className="text-slate-600 mb-8">{signatoryName}</p>
                      <div className="border-t border-slate-300 pt-2 text-sm text-slate-400">التوقيع</div>
                   </div>
                 </div>
               </div>

               <button 
                 onClick={handlePrint}
                 className="w-full mt-8 bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg"
               >
                 <Printer size={20} /> طباعة الأمر (PDF)
               </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 p-12">
              <UserCheck size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-bold">اختر نزيلاً لإنشاء أمر الإفراج</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReleaseOrder;
