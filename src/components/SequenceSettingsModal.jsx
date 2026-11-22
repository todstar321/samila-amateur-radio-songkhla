import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Hash, 
  BookOpen, 
  Check, 
  RotateCcw, 
  X, 
  Sparkles, 
  ArrowRight,
  Info,
  Layers,
  ChevronRight,
  Save
} from 'lucide-react';
import { 
  getMemberSequenceConfig, 
  saveMemberSequenceConfig, 
  getReceiptSequenceConfig, 
  saveReceiptSequenceConfig, 
  formatBookNo, 
  formatReceiptNo,
  getCurrentReceiptInfo
} from '../utils/sequenceNumberUtils';

export default function SequenceSettingsModal({ isOpen, onClose, onSaveSuccess }) {
  if (!isOpen) return null;

  // Member Sequence State
  const [memberConfig, setMemberConfig] = useState(getMemberSequenceConfig());
  // Receipt Sequence State
  const [receiptConfig, setReceiptConfig] = useState(getReceiptSequenceConfig());
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'member' | 'receipt'
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setMemberConfig(getMemberSequenceConfig());
    setReceiptConfig(getReceiptSequenceConfig());
  }, [isOpen]);

  const handleSave = () => {
    saveMemberSequenceConfig(memberConfig);
    saveReceiptSequenceConfig(receiptConfig);
    setIsSaved(true);
    if (onSaveSuccess) onSaveSuccess();
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  // Calculations for Live Receipt Preview
  const pageInBook = ((receiptConfig.currentNo - 1) % receiptConfig.sheetsPerBook) + 1;
  const isRolloverNext = pageInBook >= receiptConfig.sheetsPerBook;
  const nextBookNum = isRolloverNext ? receiptConfig.currentBook + 1 : receiptConfig.currentBook;
  const nextReceiptNum = isRolloverNext ? 1 : receiptConfig.currentNo + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-sky-800 via-sky-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <Settings className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">ตั้งค่าระบบรันตัวเลขอัตโนมัติ (Sequence Settings)</h2>
              <p className="text-xs text-sky-200">
                กำหนดการรันเลขสมาชิก และระบบตัดเล่ม/เลขที่ใบเสร็จอัตโนมัติ
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* SECTION 1: Member ID Sequence */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-sky-700" />
                <h3 className="font-bold text-slate-800 text-sm">
                  1. ตั้งค่าเลขสมาชิกอัตโนมัติ (Member ID Auto-Runner)
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                ตัวอย่างถัดไป: #{String(memberConfig.currentNumber).padStart(memberConfig.paddingDigits, '0')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ลำดับเลขรันถัดไปที่จะออก (Next Member ID):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={memberConfig.currentNumber}
                    onChange={(e) => setMemberConfig(prev => ({ 
                      ...prev, 
                      currentNumber: Math.max(1, parseInt(e.target.value || '1', 10)) 
                    }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm text-sky-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-mono">
                    (เช่น 30001)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  จำนวนหลักในการเติมศูนย์ (Padding Digits):
                </label>
                <select
                  value={memberConfig.paddingDigits}
                  onChange={(e) => setMemberConfig(prev => ({ ...prev, paddingDigits: parseInt(e.target.value, 10) }))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                >
                  <option value={5}>5 หลัก (เช่น 30001)</option>
                  <option value={6}>6 หลัก (เช่น 030001)</option>
                  <option value={7}>7 หลัก (เช่น 0030001)</option>
                  <option value={8}>8 หลัก (เต็มกล่อง 8 ช่อง)</option>
                </select>
              </div>
            </div>

            {/* Quick Presets for Member ID */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-500 text-[11px]">ปุ่มลัดตั้งค่า:</span>
              <button
                type="button"
                onClick={() => setMemberConfig(prev => ({ ...prev, currentNumber: 30001, startNumber: 30001 }))}
                className="px-2 py-1 bg-white hover:bg-sky-50 border border-sky-300 text-sky-700 rounded-md font-mono text-[11px] font-bold transition cursor-pointer"
              >
                เริ่มที่ 30,001 (ค่าแนะนำ)
              </button>
              <button
                type="button"
                onClick={() => setMemberConfig(prev => ({ ...prev, currentNumber: 36901, startNumber: 36901 }))}
                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-md font-mono text-[11px] transition cursor-pointer"
              >
                เริ่มที่ 36,901
              </button>
              <button
                type="button"
                onClick={() => setMemberConfig(prev => ({ ...prev, currentNumber: 10001, startNumber: 10001 }))}
                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-md font-mono text-[11px] transition cursor-pointer"
              >
                เริ่มที่ 10,001
              </button>
            </div>

            {/* Explanatory Note */}
            <div className="flex items-start gap-2 p-2.5 bg-sky-50/70 border border-sky-200 rounded-lg text-xs text-sky-900 leading-relaxed">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong>ระบบรันต่อเนี่องไม่เสียระบบ:</strong> หากสมาชิกท่านใดต้องการใช้รหัสเฉพาะหรือเลขกระดาษเดิม (เช่น <code className="bg-white px-1 py-0.5 rounded font-bold text-sky-800">A0250</code>) ท่านสามารถพิมพ์แก้ในช่องรหัสสมาชิกได้ทันที โดยระบบจะบันทึกรหัส A0250 ให้ท่านนั้น และจะ<strong>คงลำดับเลขรันหลักไว้ต่อเนื่อง</strong>สำหรับสมาชิกลำดับถัดไปโดยอัตโนมัติ
              </div>
            </div>
          </div>

          {/* SECTION 2: Receipt Book & Number Sequence with Auto-Rollover */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  2. ตั้งค่าเล่มที่ & เลขที่ใบเสร็จ พร้อมระบบตัดเล่มอัตโนมัติ (Receipt Rollover)
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold">
                เล่ม {formatBookNo(receiptConfig.currentBook, receiptConfig.bookPadding)} / เลขที่ {formatReceiptNo(receiptConfig.currentNo, receiptConfig.noPadding)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เล่มที่ปัจจุบัน (Book No.):
                </label>
                <input
                  type="number"
                  min="1"
                  value={receiptConfig.currentBook}
                  onChange={(e) => setReceiptConfig(prev => ({ 
                    ...prev, 
                    currentBook: Math.max(1, parseInt(e.target.value || '1', 10)) 
                  }))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm text-red-700 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เลขที่ใบเสร็จในเล่มนี้:
                </label>
                <input
                  type="number"
                  min="1"
                  value={receiptConfig.currentNo}
                  onChange={(e) => setReceiptConfig(prev => ({ 
                    ...prev, 
                    currentNo: Math.max(1, parseInt(e.target.value || '1', 10)) 
                  }))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm text-red-700 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  จำนวนใบต่อเล่ม (Sheets/Book):
                </label>
                <input
                  type="number"
                  min="1"
                  value={receiptConfig.sheetsPerBook}
                  onChange={(e) => setReceiptConfig(prev => ({ 
                    ...prev, 
                    sheetsPerBook: Math.max(1, parseInt(e.target.value || '10', 10)) 
                  }))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Quick Presets for Sheets per Book */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-500 text-[11px]">เลือกจำนวนใบต่อเล่ม:</span>
              {[10, 15, 20, 25, 50].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setReceiptConfig(prev => ({ ...prev, sheetsPerBook: count }))}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold border transition cursor-pointer ${
                    receiptConfig.sheetsPerBook === count
                      ? 'bg-red-600 text-white border-red-700 shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  เล่มละ {count} ใบ
                </button>
              ))}
            </div>

            {/* Live Rollover Preview Card */}
            <div className="p-3 bg-linear-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-red-700">
                  <Layers className="w-4 h-4" />
                  จำลองการตัดเล่มอัตโนมัติ (Live Rollover Simulation)
                </span>
                <span className="font-mono text-red-600">
                  หน้าที่ {pageInBook} / {receiptConfig.sheetsPerBook} ใบ
                </span>
              </div>

              {/* Progress bar inside book */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-linear-to-r from-red-500 to-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (pageInBook / receiptConfig.sheetsPerBook) * 100)}%` }}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-600 gap-1 pt-1">
                <div>
                  ฉบับปัจจุบัน: <strong className="text-red-700 font-mono">เล่ม {formatBookNo(receiptConfig.currentBook, receiptConfig.bookPadding)} เลขที่ {formatReceiptNo(receiptConfig.currentNo, receiptConfig.noPadding)}</strong>
                </div>
                <div className="flex items-center gap-1 font-medium">
                  <span>เมื่อบันทึก:</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <strong className={isRolloverNext ? 'text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded' : 'text-slate-800'}>
                    {isRolloverNext 
                      ? `ตัดขึ้น เล่ม ${formatBookNo(nextBookNum, receiptConfig.bookPadding)} เลขที่ ${formatReceiptNo(nextReceiptNum, receiptConfig.noPadding)} (ครบ ${receiptConfig.sheetsPerBook} ใบ)`
                      : `เล่ม ${formatBookNo(nextBookNum, receiptConfig.bookPadding)} เลขที่ ${formatReceiptNo(nextReceiptNum, receiptConfig.noPadding)}`
                    }
                  </strong>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setMemberConfig(DEFAULT_MEMBER_CONFIG);
              setReceiptConfig(DEFAULT_RECEIPT_CONFIG);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่ามาตรฐาน</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4 text-green-300" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'บันทึกสำเร็จ!' : 'บันทึกการตั้งค่าเลขรัน'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
