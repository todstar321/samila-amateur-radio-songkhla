import React, { useState } from 'react';
import { Radio, Check, X, Bell, AlertCircle, ArrowRight } from 'lucide-react';
import DeveloperCredit from './DeveloperCredit';

export default function CallsignPromptModal({ isOpen, onClose, member, onSaveCallsign }) {
  const [newCallsign, setNewCallsign] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !member) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const clean = newCallsign.trim().toUpperCase();
    if (!clean || clean.length < 4) {
      setError('กรุณากรอกสัญญาณเรียกขานที่ถูกต้อง เช่น HS9xxx หรือ E26xxx');
      return;
    }
    onSaveCallsign(clean);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Radio className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-950 leading-tight">
                แจ้งเตือนอัปเดตนามเรียกขาน
              </h3>
              <p className="text-xs text-amber-950/80 font-medium">
                สำนักงาน กสทช. / สมาคมวิทยุสมัครเล่นสมิหลา
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-amber-950 hover:bg-black/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <p className="font-semibold mb-1 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-700 shrink-0" />
              ยินดีต้อนรับ {member.fullName}!
            </p>
            <p>
              ท่านได้สมัครสมาชิกไว้ก่อนได้รับสัญญาณเรียกขาน หากท่านได้รับ <strong>สัญญาณเรียกขานสากล (Callsign)</strong> จาก กสทช. เรียบร้อยแล้ว กรุณากรอกเพื่ออัปเดตทะเบียนสมาชิกและหนังสือรับรองอัตโนมัติ
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              สัญญาณเรียกขานใหม่ที่ได้รับจาก กสทช. <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newCallsign}
              onChange={(e) => {
                setNewCallsign(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="เช่น E26ECG หรือ HS9XYZ"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              autoFocus
            />
          </div>

          <div className="pt-2 flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              ไว้ภายหลัง (ยังไม่ได้รับ)
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer flex items-center gap-1.5"
            >
              <span>บันทึกสัญญาณเรียกขาน</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <DeveloperCredit variant="light" />
      </div>
    </div>
  );
}
