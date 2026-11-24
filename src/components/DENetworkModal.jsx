import React, { useState } from 'react';
import { 
  Radio, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  Info, 
  Send, 
  Cpu, 
  Check, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  UserCheck,
  Smartphone,
  Store,
  Hash
} from 'lucide-react';
import DeveloperCredit from './DeveloperCredit';

export default function DENetworkModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onSubmitDeRequest,
  deQuestions = [],
  deRequests = []
}) {
  // 1. "รหัสเครือข่าย DE คืออะไร?" ต้องย่อไว้เสมอเมื่อเปิดขึ้นมา (Default collapsed)
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  // Form states for applicants
  const [imei, setImei] = useState(currentUser?.deImei || '');
  const [callsign, setCallsign] = useState(currentUser?.callsign || '');
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [province, setProvince] = useState('สงขลา');
  
  // Dynamic question answers state
  const [customAnswers, setCustomAnswers] = useState({});

  const [copied, setCopied] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Find existing request record if available
  const existingReq = deRequests.find(r => 
    (currentUser?.deImei && r.imei === currentUser.deImei) ||
    (currentUser?.callsign && currentUser.callsign !== '-' && r.callsign === currentUser.callsign)
  );

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomAnswerChange = (questionId, value) => {
    setCustomAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imei.trim()) {
      setError('กรุณากรอกหมายเลขประจำเครื่อง IMEI (เครื่อง Spender)');
      return;
    }

    // Check required custom questions
    const activeQuestions = deQuestions.filter(q => q.active !== false);
    for (const q of activeQuestions) {
      if (q.required && (!customAnswers[q.id] || !customAnswers[q.id].trim())) {
        setError(`กรุณากรอกข้อมูล: ${q.label}`);
        return;
      }
    }

    // Package question snapshots to preserve historical answers even if questions are edited later
    const questionSnapshots = activeQuestions.map(q => ({
      id: q.id,
      label: q.label,
      value: customAnswers[q.id] || ''
    }));

    const newRequest = {
      id: `de-req-${Date.now()}`,
      callsign: callsign || currentUser?.callsign || '-',
      fullName: fullName || currentUser?.fullName || '',
      imei: imei.trim(),
      deviceModel: customAnswers['deviceModel'] || '',
      purchaseShop: customAnswers['purchaseShop'] || '',
      serialNumber: customAnswers['serialNumber'] || '',
      phone: phone || currentUser?.phone || '',
      email: email || currentUser?.email || '',
      qthProvince: province,
      assignedDeCode: '',
      status: 'รอตรวจสอบ',
      requestedDate: new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      questionSnapshots: questionSnapshots
    };

    if (onSubmitDeRequest) {
      onSubmitDeRequest(newRequest);
    }
    setIsSubmitted(true);
  };

  // Determine approval details for approved members
  const approvedDate = currentUser?.deApprovedDate || existingReq?.approvedDate || '16 พ.ย. 2569 เวลา 10:30 น.';
  const approvedBy = currentUser?.deApprovedBy || existingReq?.approvedBy || 'HS9ADM นายเกียรติศักดิ์ สมิหลาเวหา (แอดมินสมาคมฯ)';
  const deviceModel = currentUser?.deDeviceModel || existingReq?.deviceModel || 'Spender Network Radio TC-751G';
  const purchaseShop = currentUser?.dePurchaseShop || existingReq?.purchaseShop || 'ร้านสงขลาคอมมิวนิเคชั่น แอนด์ เรดิโอ (ตัวแทนจำหน่าย Spender)';
  const serialNumber = currentUser?.deSerialNumber || existingReq?.serialNumber || 'SN-8823901';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 pt-[max(calc(env(safe-area-inset-top,0px)+12px),24px)] pb-4">
      <div 
        className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                เครือข่ายสื่อสาร DE (Digital Emergency)
              </h3>
              <p className="text-[11px] text-sky-300">
                ระบบเครือข่ายวิทยุดิจิทัล สมาคมวิทยุสมัครเล่นสมิหลา (Spender Network)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* 1. Accordion: "รหัสเครือข่าย DE คืออะไร?" (ย่อไว้เสมอเมื่อเปิดขึ้นมา) */}
          <div className="border border-sky-200 rounded-xl overflow-hidden bg-sky-50/70 transition-all">
            <button
              type="button"
              onClick={() => setIsExplanationOpen(!isExplanationOpen)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-sky-100/60 transition cursor-pointer text-xs font-bold text-sky-950"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-700 shrink-0" />
                <span>รหัสเครือข่าย DE คืออะไร?</span>
                <span className="text-[10px] font-normal text-sky-700 hidden sm:inline">(คลิกเพื่อขยายอ่านรายละเอียด)</span>
              </div>
              <div className="text-sky-700 flex items-center gap-1 text-[11px]">
                <span>{isExplanationOpen ? 'ย่อคำอธิบาย' : 'ดูรายละเอียด'}</span>
                {isExplanationOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isExplanationOpen && (
              <div className="px-4 pb-4 pt-1 text-xs text-slate-700 leading-relaxed border-t border-sky-100 space-y-2 animate-in fade-in duration-150">
                <p>
                  <strong>เครือข่าย DE (Digital Emergency Network)</strong> เป็นโครงข่ายวิทยุสื่อสารดิจิทัลเฉพาะ (เช่น วิทยุ Spender Network Radio / DMR POC) ที่เชื่อมโยงสมาชิกเข้ากับระบบเซิร์ฟเวอร์ส่วนกลางสำหรับภารกิจกู้ภัย ประสานงานฉุกเฉิน และช่วยเหลือสาธารณภัย
                </p>
                <p className="text-slate-600 bg-white/70 p-2 rounded-lg border border-sky-100">
                  ⚡ <em>หมายเหตุ: สมาชิกไม่ได้มีรหัสนี้ทุกคน</em> เนื่องจากต้องเป็นผู้มีเครื่องวิทยุดิจิทัลที่รองรับ และยื่นข้อมูลหมายเลขเครื่อง (IMEI) พร้อมข้อมูลการซื้อเครื่องเพื่อประสานเปิดระบบกับทาง Spender และสมาคมฯ
                </p>
              </div>
            )}
          </div>

          {/* 2. CASE 1: สมาชิกได้รับรหัส DE เรียบร้อยแล้ว (แสดงข้อมูลการอนุมัติและรายละเอียดที่ส่งขอ) */}
          {currentUser?.deNetworkCode ? (
            <div className="space-y-3">
              
              {/* DE Code Card */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-xl border border-emerald-300 text-xs space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-900 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    สถานะ: ได้รับรหัสเครือข่าย DE เรียบร้อยแล้ว
                  </span>
                  <span className="bg-emerald-600 text-white font-mono font-bold px-2 py-0.5 rounded text-[11px] shadow-2xs">
                    Active (เปิดใช้งาน)
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between shadow-2xs">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">รหัสเครือข่าย DE ของคุณ</p>
                    <p className="text-2xl font-bold font-mono text-emerald-800 tracking-wider">
                      {currentUser.deNetworkCode}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyCode(currentUser.deNetworkCode)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกรหัส'}</span>
                  </button>
                </div>
              </div>

              {/* Approval Info Block (ข้อมูลการอนุมัติ) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <UserCheck className="w-4 h-4 text-sky-600" />
                  <span>ข้อมูลการอนุมัติเข้าร่วมเครือข่าย</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">วันที่และเวลาอนุมัติ:</span>
                    <strong className="text-slate-800 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {approvedDate}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ผู้อนุมัติ (แอดมินสมาคมฯ):</span>
                    <strong className="text-slate-800 font-medium">{approvedBy}</strong>
                  </div>
                </div>
              </div>

              {/* Submitted Request Details (รายละเอียดเครื่องที่แจ้งเปิดระบบ) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  <span>รายละเอียดเครื่องวิทยุสื่อสารที่ยื่นขอ (Spender System)</span>
                </h4>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">หมายเลขประจำเครื่อง IMEI:</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {currentUser?.deImei || existingReq?.imei || '867543029182745'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">ยี่ห้อและรุ่นเครื่อง:</span>
                    <span className="font-medium text-slate-900">{deviceModel}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">ข้อมูลเปิดระบบ - ซื้อจากร้าน:</span>
                    <span className="font-medium text-slate-900">{purchaseShop}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">หมายเลข Serial Number (S/N):</span>
                    <span className="font-mono text-slate-800">{serialNumber}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">เบอร์โทรศัพท์ที่ติดต่อ:</span>
                    <span className="font-mono text-slate-800">{currentUser?.phone || existingReq?.phone || '093-792-5665'}</span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">อีเมลรับแจ้ง:</span>
                    <span className="text-slate-800">{currentUser?.email || existingReq?.email || 'theepchalit@email.com'}</span>
                  </div>

                  {/* Display previous question snapshots if any */}
                  {existingReq?.questionSnapshots?.map((qs, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-t border-slate-100">
                      <span className="text-slate-500">{qs.label}:</span>
                      <span className="font-medium text-slate-900">{qs.value || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : isSubmitted ? (
            /* CASE 2: ยื่นคำขอสำเร็จ */
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2.5">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">ยื่นคำขอรหัสเครือข่าย DE สำเร็จ</h4>
              <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
                ข้อมูลการยื่นขอเปิดระบบเครื่อง Spender ของท่านส่งถึงฝ่ายเทคนิคสมาคมฯ เรียบร้อยแล้ว กำลังดำเนินการบันทึกข้อมูลและจะออกรหัส DE ประจำตัวให้ท่านโดยเร็ว
              </p>
              <button
                onClick={onClose}
                className="mt-3 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          ) : (
            /* CASE 3: แบบฟอร์มยื่นคำขอรหัส DE (พร้อมชุดคำถามที่ทาง Spender ขอมา และคำถามที่แอดมินตั้งค่า) */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-sky-600" />
                  <span>แบบฟอร์มยื่นขอรหัสเครือข่าย DE (สำหรับเครื่อง Spender Network / POC)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  กรอกข้อมูลเครื่องเพื่อประสานงานเปิดระบบและออกรหัส DE ประจำสถานี
                </p>
              </div>

              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Primary IMEI Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หมายเลขประจำเครื่อง IMEI (เครื่อง Spender) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={18}
                  placeholder="เช่น 867543029182745 (ดูหลังเครื่องหรือเมนูเครื่อง)"
                  value={imei}
                  onChange={(e) => {
                    setImei(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 transition"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  * ดูหมายเลข IMEI ได้จากสติกเกอร์ใต้แบตเตอรี่ หรือในเมนูตั้งค่าตัวเครื่อง
                </p>
              </div>

              {/* Dynamic Active Questions (คำถามที่ Spender ขอมา และชุดคำถามที่แอดมินกำหนด) */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <p className="text-[11px] font-bold text-sky-900 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-sky-700" />
                  <span>ข้อมูลแจ้งเปิดระบบใช้งานเครื่อง (ข้อมูลที่ทาง Spender ขอ)</span>
                </p>

                {deQuestions.filter(q => q.active !== false).map((q) => (
                  <div key={q.id}>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {q.label} {q.required && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={customAnswers[q.id] || ''}
                      onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                      placeholder={q.placeholder || ''}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 transition"
                      required={q.required}
                    />
                  </div>
                ))}
              </div>

              {/* Applicant Personal Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สัญญาณเรียกขาน (Callsign)
                  </label>
                  <input
                    type="text"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                    placeholder="เช่น E26ECG หรือ -"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล ผู้ขอ
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ชื่อและนามสกุล"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="093-xxx-xxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    จังหวัดที่ประจำสถานี (QTH)
                  </label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="เช่น สงขลา, หาดใหญ่"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อีเมล (สำหรับรับแจ้งรหัส DE)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ยื่นคำขอรหัสเครือข่าย DE</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Developer Credit Signature Footer (Single Line strictly) */}
        <div className="shrink-0">
          <DeveloperCredit variant="light" />
        </div>
      </div>
    </div>
  );
}
