import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Calendar, 
  HardDrive, 
  Layers, 
  FileCheck, 
  AlertTriangle,
  Clock,
  Check
} from 'lucide-react';
import { 
  getCloudinarySettings, 
  saveCloudinarySettings, 
  testCloudinaryConnection, 
  purgeOldMemberImages,
  deleteMemberImagesFromCloudinary,
  DEFAULT_CLOUDINARY_SETTINGS 
} from '../utils/cloudinaryUtils';
import DeveloperCredit from './DeveloperCredit';
import AdminPinConfirmModal from './AdminPinConfirmModal';

export default function CloudinaryStorageManager({ membersList = [], onUpdateMembersList, currentUser, showToast }) {
  const [settings, setSettings] = useState(DEFAULT_CLOUDINARY_SETTINGS);
  const [showSecret, setShowSecret] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Purge Options State
  const [purgeOption, setPurgeOption] = useState('downloaded'); // 'downloaded', '3m', '6m', '12m', 'rejected'
  const [isPurging, setIsPurging] = useState(false);
  const [purgeResult, setPurgeResult] = useState(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  useEffect(() => {
    setSettings(getCloudinarySettings());
  }, []);

  const handleChange = (field, val) => {
    setSettings(prev => ({ ...prev, [field]: val }));
    setIsSaved(false);
  };

  const handleSave = () => {
    const saved = saveCloudinarySettings(settings);
    setSettings(saved);
    setIsSaved(true);
    if (showToast) showToast('บันทึกการตั้งค่า Cloudinary เรียบร้อยแล้ว');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testCloudinaryConnection(settings);
      setTestResult(res);
      if (res.success) {
        setIsSaved(true);
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    } finally {
      setIsTesting(false);
    }
  };

  // Metrics Calculations
  const now = Date.now();
  const msInDay = 24 * 60 * 60 * 1000;

  const totalMembers = membersList.length;
  const downloadedMembers = membersList.filter(m => m.downloadedAt || m.status === 'อนุมัติแล้ว');
  const purgedMembers = membersList.filter(m => m.cloudinaryCleared);

  // Time calculations
  const olderThan3Months = membersList.filter(m => {
    const d = Date.parse(m.registeredDate || m.approvedAt || '') || now;
    return (now - d) >= (90 * msInDay);
  });
  const olderThan6Months = membersList.filter(m => {
    const d = Date.parse(m.registeredDate || m.approvedAt || '') || now;
    return (now - d) >= (180 * msInDay);
  });
  const olderThan1Year = membersList.filter(m => {
    const d = Date.parse(m.registeredDate || m.approvedAt || '') || now;
    return (now - d) >= (365 * msInDay);
  });

  // Calculate target items for currently selected purge option
  const getSelectedTargetMembers = () => {
    switch (purgeOption) {
      case 'downloaded':
        return membersList.filter(m => (m.downloadedAt || m.status === 'อนุมัติแล้ว') && !m.cloudinaryCleared);
      case '3m':
        return olderThan3Months.filter(m => !m.cloudinaryCleared);
      case '6m':
        return olderThan6Months.filter(m => !m.cloudinaryCleared);
      case '12m':
        return olderThan1Year.filter(m => !m.cloudinaryCleared);
      case 'rejected':
        return membersList.filter(m => (m.status === 'ไม่อนุมัติ' || m.status === 'ยกเลิก') && !m.cloudinaryCleared);
      default:
        return [];
    }
  };

  const targetMembers = getSelectedTargetMembers();
  const targetImagesCount = targetMembers.reduce((acc, m) => {
    return acc + (m.idCardSlip ? 1 : 0) + (m.houseSlip ? 1 : 0) + (m.transferSlip ? 1 : 0);
  }, 0);
  const estimatedMb = (targetImagesCount * 0.8).toFixed(1); // average ~800KB per high-res slip

  // Trigger Purge Action after PIN confirmed
  const handleExecutePurge = async () => {
    setIsPurging(true);
    setPurgeResult(null);

    let periodMonths = 0;
    let onlyDownloaded = false;
    let purgeRejected = false;

    if (purgeOption === 'downloaded') onlyDownloaded = true;
    else if (purgeOption === '3m') periodMonths = 3;
    else if (purgeOption === '6m') periodMonths = 6;
    else if (purgeOption === '12m') periodMonths = 12;
    else if (purgeOption === 'rejected') purgeRejected = true;

    try {
      const res = await purgeOldMemberImages(membersList, {
        periodMonths,
        onlyDownloaded,
        purgeRejected
      });

      if (onUpdateMembersList && res.updatedMembersList) {
        onUpdateMembersList(res.updatedMembersList);
      }

      setPurgeResult({
        success: true,
        message: `ล้างภาพสำเร็จ ${res.freedImagesCount} ภาพ (จากสมาชิก ${res.purgedMembersCount} ท่าน) ประหยัดพื้นที่จัดเก็บแล้ว`
      });

      if (showToast) {
        showToast(`ล้างข้อมูลใน Cloudinary สำเร็จ ${res.freedImagesCount} ภาพ`);
      }
    } catch (err) {
      setPurgeResult({
        success: false,
        message: err.message || 'เกิดข้อผิดพลาดในการล้างข้อมูล'
      });
    } finally {
      setIsPurging(false);
    }
  };

  // Direct single member purge
  const handlePurgeSingleMember = async (member) => {
    if (!window.confirm(`ต้องการลบภาพเอกสารของ ${member.fullName} ออกจาก Cloudinary เพื่อประหยัดพื้นที่ใช่หรือไม่?`)) {
      return;
    }
    await deleteMemberImagesFromCloudinary(member);
    const updated = membersList.map(m => {
      if (m.id === member.id) {
        return {
          ...m,
          cloudinaryCleared: true,
          cloudinaryClearedAt: new Date().toISOString(),
          idCardSlip: null,
          houseSlip: null,
          transferSlip: null
        };
      }
      return m;
    });
    if (onUpdateMembersList) onUpdateMembersList(updated);
    if (showToast) showToast(`ลบภาพของ ${member.fullName} ออกจาก Cloudinary เรียบร้อยแล้ว`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cloud className="w-6 h-6 text-cyan-600" />
            <span>ระบบคลังภาพ & ล้างพื้นที่จัดเก็บ Cloudinary</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            เชื่อมต่อ console.cloudinary.com เพื่อจัดเก็บรูปภาพ ลบภาพอัตโนมัติเมื่อดาวน์โหลด และล้างข้อมูลย้อนหลังตามระยะเวลา
          </p>
        </div>

        <a
          href="https://console.cloudinary.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition cursor-pointer shrink-0"
        >
          <span>ไปยัง Console Cloudinary</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>สมาชิกทั้งหมด</span>
            <HardDrive className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">{totalMembers}</p>
          <p className="text-[11px] text-slate-500 mt-1">บันทึกในฐานข้อมูลระบบ</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>ดาวน์โหลดแล้ว</span>
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono">{downloadedMembers.length}</p>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">เก็บในเครื่องแอดมินแล้ว</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>ล้างรูปใน Cloudinary แล้ว</span>
            <Trash2 className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-sky-600 font-mono">{purgedMembers.length}</p>
          <p className="text-[11px] text-sky-700 mt-1 font-medium">ประหยัดพื้นที่คลาวด์แล้ว</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>เกิน 3-6 เดือน / 1 ปี</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 font-mono">{olderThan3Months.length}</p>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">พร้อมล้างตามระเบียบ</p>
        </div>

      </div>

      {/* Test / Operation Status Alert */}
      {testResult && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in ${
          testResult.success 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
            : 'bg-rose-50 border-rose-300 text-rose-800'
        }`}>
          {testResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold text-xs sm:text-sm">{testResult.success ? 'เชื่อมต่อสำเร็จ' : 'การเชื่อมต่อล้มเหลว'}</p>
            <p className="text-xs mt-0.5">{testResult.message}</p>
          </div>
        </div>
      )}

      {purgeResult && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in ${
          purgeResult.success 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
            : 'bg-rose-50 border-rose-300 text-rose-800'
        }`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-xs sm:text-sm">การล้างพื้นที่จัดเก็บเสร็จสมบูรณ์</p>
            <p className="text-xs mt-0.5">{purgeResult.message}</p>
          </div>
        </div>
      )}

      {/* Grid: Settings on Left, Retention Purge Tool on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= LEFT: CLOUDINARY CONFIGURATION ================= */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-cyan-600" />
              <span>การตั้งค่า Cloudinary Credentials</span>
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              Vercel + Cloudinary
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Cloud Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Cloud Name (ชื่อคลาวด์) <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text"
                value={settings.cloudName || ''}
                onChange={(e) => handleChange('cloudName', e.target.value)}
                placeholder="เช่น samila-radio"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-cyan-500 outline-none font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-0.5">ระบุ Cloud Name จาก Dashboard บน console.cloudinary.com</p>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                API Key
              </label>
              <input 
                type="text"
                value={settings.apiKey || ''}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="เช่น 123456789012345"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-cyan-500 outline-none font-mono"
              />
            </div>

            {/* API Secret */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                API Secret (สำหรับสั่งลบภาพ)
              </label>
              <div className="relative">
                <input 
                  type={showSecret ? 'text' : 'password'}
                  value={settings.apiSecret || ''}
                  onChange={(e) => handleChange('apiSecret', e.target.value)}
                  placeholder="เช่น AbCdEf123456..."
                  className="w-full px-3.5 py-2 pr-10 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-cyan-500 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">ใช้สร้าง Digital Signature (SHA-1) เพื่อสั่งลบภาพผ่าน API อย่างปลอดภัย</p>
            </div>

            {/* Target Folder */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                โฟลเดอร์จัดเก็บภาพใน Cloudinary
              </label>
              <input 
                type="text"
                value={settings.folder || ''}
                onChange={(e) => handleChange('folder', e.target.value)}
                placeholder="samila_applications"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-cyan-500 outline-none font-mono"
              />
            </div>

            {/* Auto Delete Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-start gap-3 p-3 bg-cyan-50/60 border border-cyan-200 rounded-xl cursor-pointer hover:bg-cyan-50 transition">
                <input 
                  type="checkbox"
                  checked={settings.autoDeleteOnDownload}
                  onChange={(e) => handleChange('autoDeleteOnDownload', e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs text-cyan-950 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-cyan-700" />
                    <span>ลบรูปจาก Cloudinary อัตโนมัติเมื่อแอดมินดาวน์โหลด</span>
                  </span>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    เมื่อท่านหรือแอดมินกด <b>"บันทึกรูปภาพทั้งหมดลงเครื่อง"</b> ระบบจะลบสำเนาภาพออกจาก Cloudinary ทันทีเพื่อรักษาพื้นที่จัดเก็บ
                  </p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting || !settings.cloudName}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                {isSaved ? '✓ บันทึกแล้ว' : 'บันทึกการตั้งค่า'}
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: TIME-BASED RETENTION PURGE TOOL ================= */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>ระบบล้างข้อมูลและภาพถ่ายย้อนหลัง (Retention Purge)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                เลือกเงื่อนไขเพื่อล้างไฟล์รูปบัตร สลิป และเอกสารที่ไม่จำเป็นออกจาก Cloudinary เพื่อประหยัดพื้นที่
              </p>
            </div>
          </div>

          {/* Purge Options Radio Cards */}
          <div className="space-y-2.5">
            
            {/* Option 1: Only Downloaded */}
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
              purgeOption === 'downloaded' 
                ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-200' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
            }`}>
              <input 
                type="radio"
                name="purgeOpt"
                value="downloaded"
                checked={purgeOption === 'downloaded'}
                onChange={() => setPurgeOption('downloaded')}
                className="mt-0.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">
                    1. ล้างเฉพาะเอกสารที่แอดมินดาวน์โหลดลงเครื่องแล้ว (แนะนำ - ปลอดภัยที่สุด)
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                    ปลอดภัย 100%
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-600 mt-0.5">
                  ลบเฉพาะภาพของผู้สมัครที่แอดมินได้กดบันทึกเอกสาร 4 รายการลงในเครื่องคอมพิวเตอร์เรียบร้อยแล้ว
                </p>
              </div>
            </label>

            {/* Option 2: 3 Months */}
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
              purgeOption === '3m' 
                ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-200' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
            }`}>
              <input 
                type="radio"
                name="purgeOpt"
                value="3m"
                checked={purgeOption === '3m'}
                onChange={() => setPurgeOption('3m')}
                className="mt-0.5 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">
                    2. ล้างข้อมูลย้อนหลังเกิน 3 เดือน (มากกว่า 90 วัน)
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full font-semibold">
                    ย้อนหลัง 3 เดือน
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-600 mt-0.5">
                  ลบภาพเอกสารของผู้สมัครที่ยื่นมานานกว่า 3 เดือน เพื่อคืนพื้นที่จัดเก็บใน Cloudinary
                </p>
              </div>
            </label>

            {/* Option 3: 6 Months */}
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
              purgeOption === '6m' 
                ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-200' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
            }`}>
              <input 
                type="radio"
                name="purgeOpt"
                value="6m"
                checked={purgeOption === '6m'}
                onChange={() => setPurgeOption('6m')}
                className="mt-0.5 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">
                    3. ล้างข้อมูลย้อนหลังเกิน 6 เดือน (มากกว่า 180 วัน)
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full font-semibold">
                    ย้อนหลัง 6 เดือน
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-600 mt-0.5">
                  ลบภาพเอกสารเก่าที่ผ่านการอนุมัติและหมดอายุความจำเป็นเกินครึ่งปี
                </p>
              </div>
            </label>

            {/* Option 4: 1 Year */}
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
              purgeOption === '12m' 
                ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-200' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
            }`}>
              <input 
                type="radio"
                name="purgeOpt"
                value="12m"
                checked={purgeOption === '12m'}
                onChange={() => setPurgeOption('12m')}
                className="mt-0.5 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">
                    4. ล้างข้อมูลย้อนหลังเกิน 1 ปี (มากกว่า 365 วัน)
                  </span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.2 rounded-full font-semibold">
                    ย้อนหลัง 1 ปี
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-600 mt-0.5">
                  ลบภาพเอกสารประจำปีเก่าทั้งหมดเพื่อล้างพื้นที่ครั้งใหญ่ (Annual Storage Purge)
                </p>
              </div>
            </label>

            {/* Option 5: Rejected */}
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
              purgeOption === 'rejected' 
                ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-200' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
            }`}>
              <input 
                type="radio"
                name="purgeOpt"
                value="rejected"
                checked={purgeOption === 'rejected'}
                onChange={() => setPurgeOption('rejected')}
                className="mt-0.5 text-slate-600 focus:ring-slate-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">
                    5. ล้างเฉพาะรูปภาพใบสมัครที่ไม่อนุมัติ หรือยกเลิก
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.2 rounded-full font-semibold">
                    ยกเลิก / ปฏิเสธ
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-600 mt-0.5">
                  ลบรูปภาพและหลักฐานทั้งหมดของรายการที่ถูกปฏิเสธหรือไม่ผ่านการตรวจสอบ
                </p>
              </div>
            </label>

          </div>

          {/* Purge Summary Box */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">สมาชิกที่ตรงกับเงื่อนไข:</span>
                <span className="font-mono font-bold text-amber-300 text-sm">{targetMembers.length} ท่าน</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                <span>จำนวนรูปภาพที่จะถูกล้าง:</span>
                <span className="font-mono font-bold text-cyan-300">{targetImagesCount} ภาพ</span>
                <span>(คืนพื้นที่ ~{estimatedMb} MB)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPinModalOpen(true)}
              disabled={isPurging || targetMembers.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isPurging ? 'กำลังล้างพื้นที่...' : 'เริ่มล้างข้อมูลจาก Cloudinary'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* ================= MEMBERS CLOUDINARY STATUS TABLE ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              สถานะการจัดเก็บรูปภาพของสมาชิกในระบบ
            </h3>
            <p className="text-[11px] text-slate-500">
              แสดงสถานะการเก็บภาพใน Cloudinary พร้อมปุ่มล้างภาพรายบุคคล
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {membersList.length} รายชื่อ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">ผู้สมัคร / สมาชิก</th>
                <th className="px-4 py-3">Callsign</th>
                <th className="px-4 py-3">วันที่ยื่น / อนุมัติ</th>
                <th className="px-4 py-3">สถานะภาพใน Cloudinary</th>
                <th className="px-4 py-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {membersList.map((m) => {
                const isCleared = m.cloudinaryCleared;
                const isDownloaded = Boolean(m.downloadedAt);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {m.fullName}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-sky-700">
                      {m.callsign && m.callsign !== '-' ? m.callsign : 'รอรับ Callsign'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {m.approvedAt || m.registeredDate || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {isCleared ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <Check className="w-3 h-3 text-slate-500" />
                          <span>ล้างภาพแล้ว (ประหยัดพื้นที่)</span>
                        </span>
                      ) : isDownloaded ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <FileCheck className="w-3 h-3 text-emerald-600" />
                          <span>ดาวน์โหลดแล้ว (พร้อมล้าง)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                          <Cloud className="w-3 h-3 text-cyan-600" />
                          <span>เก็บภาพในคลาวด์</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!isCleared ? (
                        <button
                          type="button"
                          onClick={() => handlePurgeSingleMember(m)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          ลบภาพท่านนี้
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DeveloperCredit />

      {/* Admin PIN Confirmation Modal (ป้องกันการกดลบพลาด) */}
      <AdminPinConfirmModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onConfirm={handleExecutePurge}
        requiredPin="5532"
        ownerOnly={true}
        customTitle="ยืนยันการล้างข้อมูลจาก Cloudinary"
        customSubtitle={`ล้างรูปภาพตามเงื่อนไขที่เลือก (${targetMembers.length} ท่าน • ~${targetImagesCount} ภาพ)`}
        noticeText="การดำเนินการนี้จะลบไฟล์ภาพออกจาก Cloudinary ถาวรเพื่อประหยัดพื้นที่ กรุณาระบุ PIN ผู้ดูแลระบบ (5532)"
      />

    </div>
  );
}
