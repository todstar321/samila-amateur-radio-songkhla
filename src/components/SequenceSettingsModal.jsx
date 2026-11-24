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
  Save,
  Lock,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Receipt
} from 'lucide-react';
import { 
  getMemberSequenceConfig, 
  saveMemberSequenceConfig, 
  getReceiptSequenceConfig, 
  saveReceiptSequenceConfig, 
  formatBookNo, 
  formatReceiptNo,
  DEFAULT_MEMBER_CONFIG,
  DEFAULT_RECEIPT_CONFIG
} from '../utils/sequenceNumberUtils';

export default function SequenceSettingsModal({ 
  isOpen, 
  onClose, 
  membersList = [], 
  currentUser,
  onSaveSuccess 
}) {
  if (!isOpen) return null;

  // Member Sequence State
  const [memberConfig, setMemberConfig] = useState(getMemberSequenceConfig());
  // Receipt Sequence State
  const [receiptConfig, setReceiptConfig] = useState(getReceiptSequenceConfig());
  const [isSaved, setIsSaved] = useState(false);

  // Admin PIN Verification State
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    setMemberConfig(getMemberSequenceConfig());
    setReceiptConfig(getReceiptSequenceConfig());
    setShowPinModal(false);
    setAdminPin('');
    setPinError('');
  }, [isOpen]);

  // Last 10 Registered Members
  const recent10Members = [...membersList]
    .filter(m => m.memberId && m.memberId !== '-')
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || a.approvedAt || a.registeredDate || 0).getTime();
      const timeB = new Date(b.createdAt || b.approvedAt || b.registeredDate || 0).getTime();
      if (timeA && timeB && timeA !== timeB) return timeB - timeA;
      const numA = parseInt(String(a.id || '').replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(String(b.id || '').replace(/\D/g, ''), 10) || 0;
      if (numA !== numB) return numB - numA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    })
    .slice(0, 10);

  // Last 5 Issued Receipts
  const recent5Receipts = [...membersList]
    .filter(m => m.receiptNo || m.bookNo || (m.status === 'อนุมัติแล้ว' && m.approvedAt))
    .sort((a, b) => {
      const timeA = new Date(a.approvedAt || a.createdAt || a.registeredDate || 0).getTime();
      const timeB = new Date(b.approvedAt || b.createdAt || b.registeredDate || 0).getTime();
      if (timeA && timeB && timeA !== timeB) return timeB - timeA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    })
    .slice(0, 5);

  // Calculations for Live Receipt Preview
  const pageInBook = ((receiptConfig.currentNo - 1) % receiptConfig.sheetsPerBook) + 1;
  const isRolloverNext = pageInBook >= receiptConfig.sheetsPerBook;
  const nextBookNum = isRolloverNext ? receiptConfig.currentBook + 1 : receiptConfig.currentBook;
  const nextReceiptNum = isRolloverNext ? 1 : receiptConfig.currentNo + 1;

  // Handle clicking "Save" -> opens PIN prompt
  const handleOpenPinConfirmation = () => {
    setPinError('');
    setAdminPin('');
    setShowPinModal(true);
  };

  // Verify PIN and save
  const handleVerifyAndSave = (e) => {
    if (e) e.preventDefault();
    const clean = adminPin.trim();

    // Check valid PINs: ผอ.โต๊ด (5532), universal admin keys, or currentUser last 4 digits
    const isValid = 
      clean === '5532' || 
      clean === '1234' || 
      clean === '9999' || 
      clean.toUpperCase() === 'HS9AS' ||
      (currentUser?.citizenId && currentUser.citizenId.endsWith(clean)) ||
      (currentUser?.last4Id && currentUser.last4Id === clean);

    if (!isValid) {
      setPinError('รหัสผ่านยืนยันไม่ถูกต้อง กรุณากรอกรหัส PIN 4 หลักท้าย (เช่น 5532)');
      return;
    }

    // Save configurations
    saveMemberSequenceConfig(memberConfig);
    saveReceiptSequenceConfig(receiptConfig);
    setIsSaved(true);
    setShowPinModal(false);

    if (onSaveSuccess) onSaveSuccess();
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-sky-800 via-sky-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <Settings className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">ตั้งค่าระบบรันตัวเลขอัตโนมัติ (Sequence Settings)</h2>
              <p className="text-xs text-sky-200">
                กำหนดการรันเลขสมาชิก และระบบตัดเล่ม/เลขที่ใบเสร็จอัตโนมัติ (ใส่ PIN แอดมินยืนยันก่อนบันทึก)
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* SECTION 1: Member ID Sequence */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-sky-700 shrink-0" />
                <h3 className="font-bold text-slate-800 text-sm">
                  1. ตั้งค่าเลขสมาชิกอัตโนมัติ (Member ID Auto-Runner)
                </h3>
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-bold self-start sm:self-auto border border-sky-300">
                เลขถัดไปที่จะออก: #{String(memberConfig.currentNumber).padStart(memberConfig.paddingDigits, '0')}
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
                onClick={() => setMemberConfig(prev => ({ ...prev, currentNumber: 31001, startNumber: 31001 }))}
                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-md font-mono text-[11px] transition cursor-pointer"
              >
                ข้ามไป 31,001
              </button>
              <button
                type="button"
                onClick={() => setMemberConfig(prev => ({ ...prev, currentNumber: 36901, startNumber: 36901 }))}
                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-md font-mono text-[11px] transition cursor-pointer"
              >
                ข้ามไป 36,901
              </button>
            </div>

            {/* LAST 10 MEMBERS LIST */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-sky-800">
                  <UserCheck className="w-4 h-4 text-sky-600" />
                  รายชื่อ 10 สมาชิกที่ได้รับรหัสล่าสุดในระบบ
                </span>
                <span className="text-[11px] font-mono text-slate-400">เรียงล่าสุด → อดีต</span>
              </div>

              {recent10Members.length === 0 ? (
                <p className="text-xs text-slate-400 py-2 text-center">ยังไม่มีข้อมูลสมาชิกที่ออกรหัส</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[11px]">
                        <th className="py-1.5 px-2 font-semibold">รหัสสมาชิก</th>
                        <th className="py-1.5 px-2 font-semibold">ชื่อ - นามสกุล</th>
                        <th className="py-1.5 px-2 font-semibold">นามเรียกขาน</th>
                        <th className="py-1.5 px-2 font-semibold">ประเภท</th>
                        <th className="py-1.5 px-2 font-semibold">วันที่</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recent10Members.map((m, idx) => (
                        <tr key={m.id || idx} className="hover:bg-sky-50/50">
                          <td className="py-1.5 px-2 font-mono font-bold text-sky-800 whitespace-nowrap">
                            #{m.memberId}
                          </td>
                          <td className="py-1.5 px-2 font-medium text-slate-800 whitespace-nowrap">
                            {m.fullName}
                          </td>
                          <td className="py-1.5 px-2 font-mono text-slate-600 whitespace-nowrap">
                            {m.callsign || '-'}
                          </td>
                          <td className="py-1.5 px-2 text-slate-500 whitespace-nowrap">
                            {m.memberType || 'สมาชิก'}
                          </td>
                          <td className="py-1.5 px-2 font-mono text-slate-400 text-[10.5px] whitespace-nowrap">
                            {m.registeredDate || m.approvedAt || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* SECTION 2: Receipt Book & Number Sequence with Auto-Rollover */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-red-600 shrink-0" />
                <h3 className="font-bold text-slate-800 text-sm">
                  2. ตั้งค่าเล่มที่ & เลขที่ใบเสร็จ พร้อมระบบตัดเล่มอัตโนมัติ (Receipt Rollover)
                </h3>
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-red-100 text-red-800 font-bold self-start sm:self-auto border border-red-300">
                ฉบับปัจจุบัน: เล่ม {formatBookNo(receiptConfig.currentBook, receiptConfig.bookPadding)} / เลขที่ {formatReceiptNo(receiptConfig.currentNo, receiptConfig.noPadding)}
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
            <div className="p-3.5 bg-linear-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-red-700">
                  <Layers className="w-4 h-4" />
                  จำลองการตัดเล่มอัตโนมัติ (Live Rollover Simulation)
                </span>
                <span className="font-mono text-red-600">
                  หน้าที่ {pageInBook} / {receiptConfig.sheetsPerBook} ใบในเล่ม
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
                  <span>เมื่อออกใบนี้แล้ว:</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <strong className={isRolloverNext ? 'text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300' : 'text-slate-800 font-bold'}>
                    {isRolloverNext 
                      ? `ตัดขึ้น เล่ม ${formatBookNo(nextBookNum, receiptConfig.bookPadding)} เลขที่ ${formatReceiptNo(nextReceiptNum, receiptConfig.noPadding)} (ครบเล่ม ${receiptConfig.sheetsPerBook} ใบ)`
                      : `เล่ม ${formatBookNo(nextBookNum, receiptConfig.bookPadding)} เลขที่ ${formatReceiptNo(nextReceiptNum, receiptConfig.noPadding)}`
                    }
                  </strong>
                </div>
              </div>
            </div>

            {/* LAST 5 RECEIPTS LIST */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-red-800">
                  <Receipt className="w-4 h-4 text-red-600" />
                  รายการ 5 ใบเสร็จรับเงินล่าสุดที่บันทึกในระบบ
                </span>
                <span className="text-[11px] font-mono text-slate-400">เรียงล่าสุด → อดีต</span>
              </div>

              {recent5Receipts.length === 0 ? (
                <p className="text-xs text-slate-400 py-2 text-center">ยังไม่มีประวัติการออกใบเสร็จ</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[11px]">
                        <th className="py-1.5 px-2 font-semibold">เล่มที่</th>
                        <th className="py-1.5 px-2 font-semibold">เลขที่</th>
                        <th className="py-1.5 px-2 font-semibold">ได้รับเงินจาก</th>
                        <th className="py-1.5 px-2 font-semibold">จำนวนเงิน</th>
                        <th className="py-1.5 px-2 font-semibold">วันที่</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recent5Receipts.map((m, idx) => (
                        <tr key={m.id || idx} className="hover:bg-red-50/50">
                          <td className="py-1.5 px-2 font-mono font-bold text-red-700 whitespace-nowrap">
                            เล่ม {m.bookNo || formatBookNo(receiptConfig.currentBook, 2)}
                          </td>
                          <td className="py-1.5 px-2 font-mono font-bold text-red-700 whitespace-nowrap">
                            เลขที่ {m.receiptNo || formatReceiptNo(receiptConfig.currentNo, 4)}
                          </td>
                          <td className="py-1.5 px-2 font-medium text-slate-800 whitespace-nowrap">
                            {m.fullName}
                          </td>
                          <td className="py-1.5 px-2 font-mono font-semibold text-emerald-700 whitespace-nowrap">
                            {m.memberType?.includes('ตลอดชีพ') ? '2,500.00' : (m.memberType?.includes('องค์กร') || m.memberType?.includes('กิตติมศักดิ์') ? '0.00' : '500.00')} ฿
                          </td>
                          <td className="py-1.5 px-2 font-mono text-slate-400 text-[10.5px] whitespace-nowrap">
                            {m.approvedAt || m.registeredDate || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
              onClick={handleOpenPinConfirmation}
              className="flex items-center gap-1.5 px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4 text-green-300" /> : <Lock className="w-4 h-4" />}
              <span>{isSaved ? 'บันทึกสำเร็จ!' : 'ยืนยันและบันทึกเลขรัน'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* ADMIN PIN VERIFICATION MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto text-amber-700 border border-amber-300 shadow-sm">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                ยืนยันรหัสผ่านแอดมิน
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                กรุณาระบุรหัส PIN แอดมิน (PIN 4 ตัวท้าย เช่น <strong>5532</strong>) เพื่อยืนยันการเปลี่ยนเลขรันของสมาคมฯ
              </p>
            </div>

            <form onSubmit={handleVerifyAndSave} className="space-y-3">
              <input
                type="password"
                maxLength={10}
                autoFocus
                placeholder="ระบุรหัส PIN 4 หลัก"
                value={adminPin}
                onChange={(e) => {
                  setAdminPin(e.target.value);
                  setPinError('');
                }}
                className="w-full text-center px-4 py-2.5 text-lg font-mono tracking-widest font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />

              {pinError && (
                <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                  ⚠️ {pinError}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white rounded-xl shadow transition cursor-pointer"
                >
                  ยืนยันบันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
