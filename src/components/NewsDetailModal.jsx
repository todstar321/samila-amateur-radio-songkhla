import React from 'react';
import { X, Calendar, User, Tag, Share2, Printer } from 'lucide-react';
import DeveloperCredit from './DeveloperCredit';

export default function NewsDetailModal({ article, onClose }) {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-sky-100 text-sky-800 border border-sky-200">
              {article.category}
            </span>
            {article.isPinned && (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-rose-100 text-rose-700">
                📌 ปักหมุด
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5 max-h-[80vh] overflow-y-auto">
          {article.imageUrl && (
            <div className="rounded-xl overflow-hidden shadow-inner max-h-64 w-full bg-slate-100">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {article.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-b border-slate-100 pb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-600" />
              {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-sky-600" />
              {article.author}
            </span>
            <span className="text-slate-400">เวลาอ่านประมาณ {article.readTime || '3 นาที'}</span>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-light">
            {article.content || article.excerpt}
          </div>

          {/* Official Sign-off Box */}
          <div className="mt-8 p-4 bg-sky-50/60 rounded-xl border border-sky-100 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-sky-900">
              สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา (HS9AS)
            </p>
            <p>สอบถามข้อมูลเพิ่มเติมได้ที่ความถี่ 145.000 MHz หรือสำนักงานสมาคมฯ โทร. 074-xxx-xxx</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> พิมพ์ประกาศ
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-sm transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

        {/* Developer Credit Signature Bar */}
        <DeveloperCredit variant="light" />
      </div>
    </div>
  );
}
