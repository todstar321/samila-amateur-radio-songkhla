import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  X, 
  Save, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { VALID_ADMIN_PINS } from '../utils/layoutSyncUtils';

export default function AdminPinConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  docTypeName = 'เอกสาร',
  currentUser,
  requiredPin = null,
  customTitle = null,
  customSubtitle = null,
  ownerOnly = false,
  noticeText = null
}) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setIsSubmitting(false);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentAdminName = currentUser?.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)';
  const currentAdminCallsign = currentUser?.callsign || 'E26ECG';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPin = pin.trim();

    if (!cleanPin) {
      setErrorMsg('กรุณากรอกรหัสแอดมิน (เลขท้ายบัตรประชาชน 4 ตัว)');
      return;
    }

    // If ownerOnly or requiredPin is specified, strictly check against that pin (e.g. 5532)
    if (requiredPin || ownerOnly) {
      const targetPin = requiredPin || '5532';
      if (cleanPin !== targetPin) {
        setErrorMsg('ขออภัย! สิทธิ์นี้สงวนเฉพาะเจ้าของแอปพลิเคชัน (ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ • E26ECG) รหัส PIN: 5532 เท่านั้น');
        return;
      }
    } else if (!VALID_ADMIN_PINS.includes(cleanPin)) {
      setErrorMsg('รหัสผ่านไม่ถูกต้อง! กรุณาระบุเลขท้าย 4 ตัวของบัตรประชาชนแอดมิน');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await onConfirm(cleanPin);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-blue-900 px-6 py-5 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${
              ownerOnly
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                : 'bg-sky-500/20 border-sky-400/30 text-sky-400'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>{customTitle || 'ยืนยันรหัสผ่านแอดมิน'}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  ownerOnly
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-mono'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {ownerOnly ? '👑 สิทธิ์เจ้าของแอป' : 'ซิงค์ทุกอุปกรณ์'}
                </span>
              </h2>
              <p className="text-xs text-sky-200/80 mt-0.5">
                {customSubtitle || `บันทึกพิกัดตำแหน่งของ "${docTypeName}" เข้าสู่ระบบกลาง`}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Notice Banner */}
          <div className={`p-3 border rounded-xl text-xs space-y-2 ${
            ownerOnly 
              ? 'bg-amber-50/90 border-amber-200 text-amber-950'
              : 'bg-sky-50 border border-sky-200 text-sky-900'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className={`w-4 h-4 shrink-0 ${ownerOnly ? 'text-amber-600' : 'text-sky-600'}`} />
              <span>{noticeText || 'การบันทึกนี้จะมีผลทันทีต่อทุกแพลตฟอร์ม'}</span>
            </div>
            {ownerOnly ? (
              <p className="text-[11.5px] text-amber-900 leading-relaxed">
                การแก้ไขภาพพื้นหลังและตราสัญลักษณ์สมาคมฯ ถือเป็นอัตลักษณ์หลัก สงวนสิทธิ์เฉพาะ <strong>เจ้าของแอปพลิเคชัน (ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ • E26ECG)</strong> เท่านั้นที่สามารถบันทึกได้
              </p>
            ) : (
              <>
                <div className="flex items-center justify-around py-1 text-slate-700 bg-white/80 rounded-lg border border-sky-100">
                  <div className="flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">คอมพิวเตอร์ (PC)</span>
                  </div>
                  <span className="text-slate-400">↔</span>
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">มือถือ (iPhone/Android)</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  พิกัดล่าสุดที่ท่านได้ปรับแต่งบนคอมพิวเตอร์จะถูกตั้งเป็น <strong>มาตรฐานกลางเดียวกัน</strong> ทันที เมื่อเปิดใช้งานผ่านมือถือหรืออุปกรณ์อื่น พิกัดจะตรงกัน 100%
                </p>
              </>
            )}
          </div>

          {/* Admin Identity Card */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                {currentAdminCallsign.slice(0, 3)}
              </div>
              <div>
                <div className="font-bold text-slate-800">{currentAdminName}</div>
                <div className="text-[11px] text-slate-500 font-mono">Callsign: {currentAdminCallsign}</div>
              </div>
            </div>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
              ผู้มีสิทธิ์บันทึก
            </span>
          </div>

          {/* 4-Digit Citizen ID PIN Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-sky-600" />
              <span>รหัสยืนยันตัวตนแอดมิน (เลขท้ายบัตรประชาชน 4 ตัว)</span>
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="password"
                maxLength={4}
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(val);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="กรอกตัวเลข 4 หลัก (เช่น 5532)"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono py-2.5 px-4 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:bg-white focus:outline-none transition shadow-2xs font-bold text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
              <span>* รหัสผ่านเริ่มต้น ผอ.โต๊ด (E26ECG): <strong className="text-sky-700">5532</strong></span>
              <span className="text-[10px] text-slate-400">4 ตัวเลขท้าย</span>
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting || pin.length < 4}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังบันทึกลงระบบกลาง...' : 'ยืนยันและบันทึกสู่ทุกอุปกรณ์'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
