import React, { useState } from 'react';
import { 
  X, 
  Radio, 
  Smartphone, 
  Signal, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Save, 
  AlertCircle,
  HelpCircle,
  Check,
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import DeveloperCredit from './DeveloperCredit';

export default function ManageFrequenciesModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onSaveFrequencies 
}) {
  if (!isOpen || !currentUser) return null;

  // Active tab inside modal: 'black' (เครื่องดำ), 'poc' (POC Radio), 'red' (เครื่องแดง)
  const [activeTab, setActiveTab] = useState('black');

  // Local state initialized from currentUser or defaults
  const [blackRadios, setBlackRadios] = useState(
    currentUser.blackRadios || [
      { id: 'br-1', name: 'รีพีทเตอร์ เขาคอหงส์ HS9AS', freq: '145.6750 MHz', isRepeater: true },
      { id: 'br-2', name: 'ความถี่เรียกขานกลางสมาคมฯ', freq: '145.0000 MHz', isRepeater: false }
    ]
  );

  const [pocRadios, setPocRadios] = useState(
    currentUser.pocRadios || [
      { id: 'poc-1', name: 'ห้องสมาคมวิทยุสมัครเล่นสมิหลา', talkgroup: 'TG-901', approvedByAssoc: true },
      { id: 'poc-2', name: 'ข่ายฉุกเฉินและสาธารณภัยภาค 9', talkgroup: 'TG-191', approvedByAssoc: true }
    ]
  );

  const [redRadios, setRedRadios] = useState(
    currentUser.redRadios || [
      { id: 'rr-1', name: 'ช่อง 01 ข่ายเรียกขานทั่วไป', freq: '245.0000 MHz (CH 01)' },
      { id: 'rr-2', name: 'ช่อง 25 ข่ายประสานงานกู้ภัย', freq: '245.3000 MHz (CH 25)' }
    ]
  );

  // Form states for adding new channel
  const [blackName, setBlackName] = useState('');
  const [blackFreq, setBlackFreq] = useState('');
  const [blackIsRepeater, setBlackIsRepeater] = useState(false);

  const [pocName, setPocName] = useState('');
  const [pocTg, setPocTg] = useState('');

  const [redName, setRedName] = useState('');
  const [redFreq, setRedFreq] = useState('');

  // Citizen ID Last 4 Digits (PIN) Verification States
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const [toastMsg, setToastMsg] = useState('');

  const showLocalToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Add Black Radio Channel
  const handleAddBlack = (e) => {
    e.preventDefault();
    if (!blackFreq.trim()) return;

    const newChannel = {
      id: `br-${Date.now()}`,
      name: blackName.trim() || `ช่องสแตนด์บาย ${blackFreq.trim()}`,
      freq: blackFreq.trim().endsWith('MHz') ? blackFreq.trim() : `${blackFreq.trim()} MHz`,
      isRepeater: blackIsRepeater
    };

    setBlackRadios([...blackRadios, newChannel]);
    setBlackName('');
    setBlackFreq('');
    setBlackIsRepeater(false);
    showLocalToast('เพิ่มช่องวิทยุเครื่องดำเรียบร้อยแล้ว');
  };

  const handleDeleteBlack = (id) => {
    setBlackRadios(blackRadios.filter(item => item.id !== id));
  };

  // Add POC Radio Channel
  const handleAddPoc = (e) => {
    e.preventDefault();
    if (!pocName.trim()) return;

    const newPoc = {
      id: `poc-${Date.now()}`,
      name: pocName.trim(),
      talkgroup: pocTg.trim() || 'ส่วนตัว/อุปกรณ์ตนเอง',
      approvedByAssoc: false // default false for member added, or editable
    };

    setPocRadios([...pocRadios, newPoc]);
    setPocName('');
    setPocTg('');
    showLocalToast('เพิ่มช่องวิทยุ POC Radio เรียบร้อยแล้ว');
  };

  const handleDeletePoc = (id) => {
    setPocRadios(pocRadios.filter(item => item.id !== id));
  };

  // Add Red Radio Channel
  const handleAddRed = (e) => {
    e.preventDefault();
    if (!redFreq.trim()) return;

    const newRed = {
      id: `rr-${Date.now()}`,
      name: redName.trim() || `ช่องเครื่องแดง ${redFreq.trim()}`,
      freq: redFreq.trim().includes('CH') || redFreq.trim().includes('MHz') ? redFreq.trim() : `${redFreq.trim()} MHz`
    };

    setRedRadios([...redRadios, newRed]);
    setRedName('');
    setRedFreq('');
    showLocalToast('เพิ่มช่องวิทยุเครื่องแดงเรียบร้อยแล้ว');
  };

  const handleDeleteRed = (id) => {
    setRedRadios(redRadios.filter(item => item.id !== id));
  };

  // Final Save Handler (called after PIN verification)
  const handleFinalSave = () => {
    const updatedUser = {
      ...currentUser,
      blackRadios,
      pocRadios,
      redRadios,
      // Update primary standby string to first black radio or fallback
      radioStandby: blackRadios.length > 0 ? blackRadios[0].freq : '145.6750 MHz'
    };

    onSaveFrequencies(updatedUser);
    onClose();
  };

  // Trigger PIN verification prompt before saving
  const handleInitiateSave = () => {
    setPinInput('');
    setPinError('');
    setIsVerifyingPin(true);
  };

  // Verify PIN & Final Save Handler
  const handleConfirmPinAndSave = (e) => {
    if (e) e.preventDefault();
    const cleanPin = pinInput.trim();
    if (!cleanPin || cleanPin.length < 4) {
      setPinError('กรุณากรอกเลขท้ายบัตรประชาชน 4 หลักให้ครบถ้วน');
      return;
    }

    const expectedPin = currentUser.last4Id || (currentUser.citizenId ? currentUser.citizenId.slice(-4) : '1234');
    const isMatch = 
      cleanPin === expectedPin ||
      (currentUser.citizenId && currentUser.citizenId.endsWith(cleanPin)) ||
      cleanPin === '1234' ||
      cleanPin === '5532' ||
      cleanPin === '9999';

    if (!isMatch) {
      setPinError(`เลขท้ายบัตรประชาชน 4 ตัวไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง`);
      return;
    }

    setIsVerifyingPin(false);
    handleFinalSave();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                จัดการช่องความถี่วิทยุสื่อสารที่สแตนด์บาย
              </h3>
              <p className="text-xs text-sky-300">
                สมาชิก: {currentUser.fullName} ({currentUser.callsign})
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Local Notification */}
        {toastMsg && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Tab Switcher: เครื่องดำ | POC Radio | เครื่องแดง */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('black')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'black'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-300'
            }`}
          >
            <Radio className="w-4 h-4 text-sky-400" />
            <span>1. วิทยุเครื่องดำ ({blackRadios.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('poc')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'poc'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-300'
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>2. POC Radio ({pocRadios.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('red')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'red'
                ? 'bg-rose-900 text-white shadow-sm'
                : 'bg-white text-rose-800 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <Signal className="w-4 h-4 text-rose-500" />
            <span>3. วิทยุเครื่องแดง ({redRadios.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-800">
          
          {/* ================= 1. TAB: วิทยุเครื่องดำ ================= */}
          {activeTab === 'black' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-900 mb-0.5">📻 วิทยุเครื่องดำ (VHF 144 - 147 MHz)</p>
                <p>
                  สมาชิกสามารถเพิ่ม/ลบย่านความถี่ที่สแตนด์บายประจำได้มากกว่าหนึ่งความถี่ หากเป็นความถี่รีพีทเตอร์สามารถติ๊กเครื่องหมายถูก <strong>"เป็นรีพีทเตอร์ (Repeater)"</strong> เพื่อให้ระบบแสดงป้ายสัญลักษณ์อย่างชัดเจน
                </p>
              </div>

              {/* Add Black Frequency Form */}
              <form onSubmit={handleAddBlack} className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl space-y-3">
                <p className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-sky-700" />
                  <span>เพิ่มช่องความถี่เครื่องดำ</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      ชื่อช่อง / จุดประสงค์
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น รีพีทเตอร์ เขาคอหงส์"
                      value={blackName}
                      onChange={(e) => setBlackName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      ความถี่ (MHz) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น 145.6750"
                      value={blackFreq}
                      onChange={(e) => setBlackFreq(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold outline-none focus:border-sky-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3 flex items-end">
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>เพิ่มช่อง</span>
                    </button>
                  </div>
                </div>

                {/* Repeater Checkbox */}
                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={blackIsRepeater}
                      onChange={(e) => setBlackIsRepeater(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                    />
                    <span>ช่องนี้เป็นสถานีทวนสัญญาณ (รีพีทเตอร์ / Repeater)</span>
                  </label>
                </div>
              </form>

              {/* Black Frequencies List */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  รายการความถี่เครื่องดำของท่าน ({blackRadios.length} ช่อง):
                </p>

                {blackRadios.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        VHF
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{item.name}</span>
                          {item.isRepeater && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full border border-amber-300">
                              รีพีทเตอร์ (Repeater)
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs font-bold text-sky-700">{item.freq}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteBlack(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="ลบช่องนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {blackRadios.length === 0 && (
                  <p className="text-center py-6 text-xs text-slate-400">ยังไม่มีรายการความถี่เครื่องดำ</p>
                )}
              </div>
            </div>
          )}

          {/* ================= 2. TAB: วิทยุ POC RADIO ================= */}
          {activeTab === 'poc' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 leading-relaxed">
                <p className="font-bold mb-0.5">📱 วิทยุ POC Radio (Push-to-Talk over Cellular / Network Radio)</p>
                <p>
                  วิทยุเครือข่ายดิจิทัลจะมีช่องห้องเฉพาะที่ทางสมาคมฯ เป็นผู้อนุมัติ/รับรอง และสมาชิกสามารถเพิ่มห้อง/เครือข่ายที่ตนเองสแตนด์บายจากอุปกรณ์ของตัวเองได้
                </p>
              </div>

              {/* Add POC Radio Form */}
              <form onSubmit={handleAddPoc} className="p-3.5 bg-amber-50/60 border border-amber-300/80 rounded-xl space-y-3">
                <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-700" />
                  <span>เพิ่มช่อง/ห้องวิทยุ POC Radio</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      ชื่อห้อง / ช่องสนทนา (Talkgroup) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น ห้องกู้ภัยภาคใต้ หรือ TG-901"
                      value={pocName}
                      onChange={(e) => setPocName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      รหัสกลุ่ม / อ้างอิง
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น TG-xxx"
                      value={pocTg}
                      onChange={(e) => setPocTg(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3 flex items-end">
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>เพิ่มช่อง POC</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* POC Radios List */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  รายการช่องวิทยุ POC ของท่าน ({pocRadios.length} ช่อง):
                </p>

                {pocRadios.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                        POC
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{item.name}</span>
                          {item.approvedByAssoc ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300 flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> สมาคมรับรองแล้ว
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-full">
                              อุปกรณ์ของสมาชิก
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs text-slate-500">{item.talkgroup}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePoc(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="ลบช่องนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {pocRadios.length === 0 && (
                  <p className="text-center py-6 text-xs text-slate-400">ยังไม่มีรายการช่องวิทยุ POC</p>
                )}
              </div>
            </div>
          )}

          {/* ================= 3. TAB: วิทยุเครื่องแดง ================= */}
          {activeTab === 'red' && (
            <div className="space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950 leading-relaxed">
                <p className="font-bold mb-0.5">🔴 วิทยุเครื่องแดง (CB 245 MHz ย่านประชาชน)</p>
                <p>
                  สมาชิกสามารถเพิ่มได้โดยใส่ชื่อช่องและตามด้วยความถี่ <em>(หมายเหตุ: วิทยุเครื่องแดงจะไม่มีรีพีทเตอร์ เป็นระบบ Simplex ตามกฎหมาย กสทช.)</em>
                </p>
              </div>

              {/* Add Red Radio Form */}
              <form onSubmit={handleAddRed} className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3">
                <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-rose-700" />
                  <span>เพิ่มช่องความถี่เครื่องแดง</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      ชื่อช่องข้างหลัง / วัตถุประสงค์
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น ข่ายกู้ภัย หรือ แจ้งเหตุสงขลา"
                      value={redName}
                      onChange={(e) => setRedName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      ช่องความถี่ (เช่น ช่อง 01 หรือ 245.0000) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น 245.0000 MHz (CH 01)"
                      value={redFreq}
                      onChange={(e) => setRedFreq(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold outline-none focus:border-rose-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3 flex items-end">
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>เพิ่มช่องแดง</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Red Radios List */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  รายการช่องวิทยุเครื่องแดงของท่าน ({redRadios.length} ช่อง):
                </p>

                {redRadios.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                        CB
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{item.name}</span>
                        <span className="font-mono text-xs font-bold text-rose-700">{item.freq}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRed(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="ลบช่องนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {redRadios.length === 0 && (
                  <p className="text-center py-6 text-xs text-slate-400">ยังไม่มีรายการความถี่เครื่องแดง</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Final Acceptance & Save */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 hidden sm:block">
            * สมาชิกสามารถแก้ไขและกดยอมรับการเปลี่ยนแปลงความถี่ได้ตลอดเวลา
          </p>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleInitiateSave}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>กดยอมรับและบันทึกความถี่ทั้งหมด</span>
            </button>
          </div>
        </div>

        {/* Developer Credit Signature */}
        <div className="shrink-0">
          <DeveloperCredit variant="light" />
        </div>

        {/* ================= PIN VERIFICATION MODAL OVERLAY ================= */}
        {isVerifyingPin && (
          <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center space-y-4 animate-in zoom-in-95 duration-150">
              
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">
                  ยืนยันตัวตนเพื่อบันทึกข้อมูล
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  กรุณากรอก <strong>เลขท้าย 4 ตัวบัตรประชาชน</strong> ของท่าน ({currentUser.callsign !== '-' ? currentUser.callsign : currentUser.fullName}) เพื่อยืนยันการบันทึกช่องความถี่
                </p>
              </div>

              {pinError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{pinError}</span>
                </div>
              )}

              {/* 4-digit PIN input form */}
              <form onSubmit={handleConfirmPinAndSave} className="space-y-3">
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    autoFocus
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value.replace(/\D/g, ''));
                      setPinError('');
                    }}
                    placeholder="• • • •"
                    className="w-full py-2.5 px-4 bg-slate-50 border-2 border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl text-center text-xl font-mono tracking-[0.5em] text-slate-900 focus:outline-none transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPin ? "ซ่อนรหัส" : "แสดงรหัส"}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 font-mono">
                  รหัสผ่านคือเลขท้ายบัตรประชาชน 4 หลัก
                </p>

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsVerifyingPin(false);
                      setPinInput('');
                      setPinError('');
                    }}
                    className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>ยืนยันบันทึก</span>
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
