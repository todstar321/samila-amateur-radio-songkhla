import React, { useState } from 'react';
import { Mail, Phone, X, Award, Shield, Check, ExternalLink } from 'lucide-react';

export default function DeveloperCredit({ variant = 'dark', className = '' }) {
  const isDark = variant === 'dark';
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [copied, setCopied] = useState('');

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <>
      <div 
        className={`py-1.5 px-2 text-center select-text cursor-text border-t transition-colors ${
          isDark 
            ? 'bg-[#030c17] text-slate-400 border-slate-800/80' 
            : 'bg-slate-50 text-slate-500 border-slate-200/90'
        } ${className}`}
      >
        {/* Single Line Strictly: whitespace-nowrap and same font size & color throughout */}
        <div className="w-full overflow-x-auto no-scrollbar flex items-center justify-center gap-1.5 text-[9.5px] sm:text-[11px] leading-tight font-normal whitespace-nowrap text-slate-400">
          <span>นักพัฒนาซอฟต์แวร์</span>
          
          {/* Clickable Name for Secret Developer Modal */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDevModalOpen(true);
            }}
            className="hover:underline transition cursor-pointer text-slate-400 hover:text-slate-200 font-normal inline-flex items-center gap-0.5"
            title="คลิกเพื่อดูข้อมูลผู้พัฒนาซอฟต์แวร์"
          >
            คุณทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)
          </button>

          <span>•</span>
          
          {/* Clickable Callsign & DE Code */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDevModalOpen(true);
            }}
            className="hover:underline transition cursor-pointer text-slate-400 hover:text-slate-200 font-normal font-mono"
            title="คลิกเพื่อดูข้อมูลผู้พัฒนาซอฟต์แวร์"
          >
            นามเรียกขาน : E26ECG / DE 246
          </button>

          <span>•</span>

          {/* Clickable Direct Call Link */}
          <a 
            href="tel:0937925665"
            onClick={(e) => e.stopPropagation()}
            className="hover:underline transition cursor-pointer text-slate-400 hover:text-slate-200 font-normal inline-flex items-center gap-0.5"
            title="คลิกเพื่อโทรออกทันที"
          >
            โทร 093-792-5665
          </a>
        </div>
      </div>

      {/* Secret / Easter Egg Developer Modal */}
      {isDevModalOpen && (
        <div 
          className="fixed inset-0 z-[999] overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-text cursor-default"
          onClick={() => setIsDevModalOpen(false)}
        >
          <div 
            className="relative bg-white text-slate-800 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">ผู้พัฒนาซอฟต์แวร์</h4>
                  <p className="text-[10px] text-sky-300">Software Developer Profile</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDevModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-5 space-y-4 text-xs">
              
              {/* Name & Title */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">ชื่อ-นามสกุลจริง</p>
                <p className="text-sm font-bold text-slate-900">
                  ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)
                </p>
                <p className="text-xs text-sky-700 font-mono font-semibold">
                  สัญญาณเรียกขาน: <strong className="text-amber-600 font-bold">E26ECG</strong> / เครือข่าย DE: <strong className="text-sky-600 font-bold">DE 246</strong>
                </p>
              </div>

              {/* Contact Items */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                
                {/* Email (Click to Open Mail App) */}
                <div className="p-3 bg-slate-50 hover:bg-sky-50 rounded-xl border border-slate-200 transition flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium">อีเมลติดต่อ</span>
                    <a 
                      href="mailto:Todstar321@Gmail.com" 
                      className="font-medium text-sky-800 hover:text-sky-900 hover:underline text-xs truncate block"
                      title="กดเพื่อส่งอีเมลทันที"
                    >
                      Todstar321@Gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy('Todstar321@Gmail.com', 'email')}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-slate-200 text-[10px] transition cursor-pointer"
                      title="คัดลอกอีเมล"
                    >
                      {copied === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : 'คัดลอก'}
                    </button>
                    <a 
                      href="mailto:Todstar321@Gmail.com"
                      className="p-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition"
                      title="เปิดแอปส่งอีเมล"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Phone (Click to Dial) */}
                <div className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 transition flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium">เบอร์โทรศัพท์</span>
                    <a 
                      href="tel:0937925665" 
                      className="font-mono font-bold text-slate-900 hover:text-emerald-700 hover:underline text-sm truncate block"
                      title="กดเพื่อโทรออกทันที"
                    >
                      093-792-5665
                    </a>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy('093-792-5665', 'phone')}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-slate-200 text-[10px] transition cursor-pointer"
                      title="คัดลอกเบอร์โทร"
                    >
                      {copied === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : 'คัดลอก'}
                    </button>
                    <a 
                      href="tel:0937925665"
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                      title="กดโทรออกทันที"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

              </div>

              {/* Direct Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href="mailto:Todstar321@Gmail.com"
                  className="py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white text-center rounded-xl font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>ส่งอีเมล</span>
                </a>
                <a
                  href="tel:0937925665"
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-center rounded-xl font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>โทรออก</span>
                </a>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setIsDevModalOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
