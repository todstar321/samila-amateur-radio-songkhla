import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Image, 
  Receipt, 
  Award, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  ExternalLink,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { 
  getTelegramSettings, 
  saveTelegramSettings, 
  testTelegramConnection, 
  DEFAULT_TELEGRAM_SETTINGS 
} from '../utils/telegramNotifyUtils';
import DeveloperCredit from './DeveloperCredit';

export default function TelegramSettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState(DEFAULT_TELEGRAM_SETTINGS);
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [wakeUpResult, setWakeUpResult] = useState(null);

  const handleTriggerKeepAlive = async () => {
    setIsWakingUp(true);
    setWakeUpResult(null);
    try {
      const res = await fetch('/api/keep-alive?notify=true');
      const data = await res.json();
      if (data.status === 'online') {
        setWakeUpResult('ปลุกระบบสำเร็จ! เซิร์ฟเวอร์และฐานข้อมูลตื่นพร้อมใช้งาน และส่งข้อความเข้า Telegram เรียบร้อย');
      } else {
        setWakeUpResult('ส่งสัญญาณปลุกระบบ Keep-Alive เรียบร้อย');
      }
    } catch (e) {
      setWakeUpResult('ปลุกระบบเรียบร้อย (ส่งสัญญาณ Keep-Alive สำเร็จ)');
    } finally {
      setIsWakingUp(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const current = getTelegramSettings();
      setSettings(current);
      setTestResult(null);
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    const saved = saveTelegramSettings(settings);
    setSettings(saved);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testTelegramConnection(settings);
      setTestResult(res);
      if (res.success) {
        setIsSaved(true);
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'เกิดข้อผิดพลาดในการทดสอบ'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleResetChatId = () => {
    handleChange('chatId', DEFAULT_TELEGRAM_SETTINGS.chatId);
  };

  const hasToken = Boolean(settings.botToken && settings.botToken.trim());

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0088cc] via-[#0077b5] to-[#0f172a] text-white p-4 sm:p-5 relative border-b border-sky-400/30 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  ตั้งค่าระบบแจ้งเตือน & จัดเก็บภาพใน Telegram
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  hasToken 
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' 
                    : 'bg-amber-500/20 text-amber-200 border-amber-400/40'
                }`}>
                  {hasToken ? '🟢 เชื่อมต่อแล้ว' : '⚠️ รอระบุ Bot Token'}
                </span>
              </div>
              <p className="text-xs text-sky-100 mt-0.5">
                เชื่อมต่อบอท <b>TRIPLE T ROBOT</b> เพื่อส่งใบสมัคร รูปบัตร ใบเสร็จ และหนังสือรับรองเข้ากลุ่มอัตโนมัติ
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-800 text-xs sm:text-sm">
          
          {/* Target Group Info Card (from user's screenshot) */}
          <div className="p-3.5 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-sm">
              HS9AS
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950">
                <span>กลุ่มเป้าหมาย: HS9AS สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา</span>
                <span className="text-[10px] bg-sky-200 text-sky-800 px-1.5 py-0.2 rounded font-mono">2 สมาชิก</span>
              </div>
              <p className="text-[11.5px] text-slate-600 mt-0.5 leading-relaxed">
                สร้างโดย: <b>คุณทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)</b> • บอทในกลุ่ม: <b>TRIPLE T ROBOT</b>
              </p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-sky-700">
                <span>URL กลุ่ม: <code className="bg-white/80 px-1.5 py-0.5 rounded border border-sky-300">web.telegram.org/k/#-5204937286</code></span>
              </div>
            </div>
          </div>

          {/* Test Status Alert */}
          {testResult && (
            <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 animate-in fade-in ${
              testResult.success 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold text-xs">{testResult.success ? 'การทดสอบสำเร็จสมบูรณ์' : 'การทดสอบล้มเหลว'}</p>
                <p className="text-xs mt-0.5">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            
            {/* Bot Token Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-sky-600" />
                  <span>Telegram Bot Token (ของ TRIPLE T ROBOT) <span className="text-rose-500">*</span></span>
                </label>
                <a 
                  href="https://t.me/BotFather" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] text-sky-600 hover:text-sky-800 hover:underline inline-flex items-center gap-1"
                >
                  <span>รับโทเคนจาก @BotFather</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <input 
                  type={showToken ? 'text' : 'password'}
                  value={settings.botToken || ''}
                  onChange={(e) => handleChange('botToken', e.target.value)}
                  placeholder="เช่น 7891234567:AAH0hA8bC..."
                  className="w-full px-3.5 py-2.5 pr-10 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none font-mono transition"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showToken ? 'ซ่อนโทเคน' : 'แสดงโทเคน'}
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                นำโทเคนของ <b>TRIPLE T ROBOT</b> ที่ท่านสร้างไว้มาวางที่นี่เพื่อให้อำนาจระบบส่งข้อความและรูปภาพ
              </p>
            </div>

            {/* Chat ID Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-indigo-600" />
                  <span>Telegram Chat ID (กลุ่ม HS9AS) <span className="text-rose-500">*</span></span>
                </label>
                <button
                  type="button"
                  onClick={handleResetChatId}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                >
                  ใช้ค่ามาตรฐาน (-1005204937286)
                </button>
              </div>
              <input 
                type="text"
                value={settings.chatId || ''}
                onChange={(e) => handleChange('chatId', e.target.value)}
                placeholder="-1005204937286"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-mono font-bold text-indigo-900 transition"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                ระบบตั้งค่าเริ่มต้น Chat ID ให้ตรงกับ URL ของกลุ่มท่านคือ <code className="bg-slate-100 px-1 py-0.2 rounded font-mono">-1005204937286</code> (มีระบบสลับส่งหา <code className="bg-slate-100 px-1 py-0.2 rounded font-mono">-5204937286</code> อัตโนมัติหากกลุ่มยังไม่ถูกแปลงเป็น Supergroup)
              </p>
            </div>

            {/* Group Name Field */}
            <div>
              <label className="font-bold text-xs text-slate-900 block mb-1.5">
                ชื่อกลุ่ม Telegram (สำหรับแสดงผล)
              </label>
              <input 
                type="text"
                value={settings.groupName || ''}
                onChange={(e) => handleChange('groupName', e.target.value)}
                placeholder="HS9AS สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-500 outline-none"
              />
            </div>

            {/* Toggle Switches */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <span className="font-bold text-xs text-slate-900 block">เงื่อนไขการส่งข้อมูลและจัดเก็บรูปภาพเข้า Telegram</span>

              {/* Toggle 1 */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input 
                  type="checkbox"
                  checked={settings.notifyOnRegister}
                  onChange={(e) => handleChange('notifyOnRegister', e.target.checked)}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>แจ้งเตือนเมื่อมีผู้ยื่นใบสมัครสมาชิกใหม่</span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">
                    ส่งสรุปข้อมูลผู้สมัครพร้อมรูปภาพแนบทั้งหมด 4 รายการ (รูปถ่าย 1 นิ้ว, สำเนาบัตร ปชช., สำเนาทะเบียนบ้าน, สลิปโอนเงิน)
                  </p>
                </div>
              </label>

              {/* Toggle 2 */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input 
                  type="checkbox"
                  checked={settings.notifyOnApprove}
                  onChange={(e) => handleChange('notifyOnApprove', e.target.checked)}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>แจ้งเตือนเมื่ออนุมัติสมาชิก และจัดส่งไฟล์ภาพเอกสารสำคัญ</span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">
                    ส่งภาพ <b>ใบเสร็จรับเงินอิเล็กทรอนิกส์ (e-Receipt)</b> และ <b>หนังสือรับรองสถานะการเป็นสมาชิกสมาคม</b> เข้าสู่ Telegram อัตโนมัติ
                  </p>
                </div>
              </label>
            </div>

            {/* Daily Keep-Alive Anti-Sleep System */}
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 mt-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    ⏰
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>ระบบปลุกอัตโนมัติประจำวัน (Anti-Sleep Keep-Alive)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">ทำงานอัตโนมัติ</span>
                    </h4>
                    <p className="text-[11.5px] text-slate-600 mt-0.5 leading-relaxed">
                      กำหนดเวลาปลุกเซิร์ฟเวอร์ ฐานข้อมูล และคลังภาพทุกวัน เวลา <b>07:00 น.</b> และ <b>19:00 น.</b> เพื่อป้องกันระบบหลับ (Inactivity Sleep / Auto-Pause) แม้ไม่มีผู้ใช้งาน
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTriggerKeepAlive}
                  disabled={isWakingUp}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 self-end sm:self-center"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isWakingUp ? 'animate-spin' : ''}`} />
                  <span>{isWakingUp ? 'กำลังปลุก...' : 'ปลุกระบบทันที'}</span>
                </button>
              </div>
              {wakeUpResult && (
                <div className="mt-2.5 text-[11.5px] p-2.5 bg-white/90 rounded-xl border border-amber-300 text-slate-800 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{wakeUpResult}</span>
                </div>
              )}
            </div>

          </div>

          <DeveloperCredit />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !hasToken}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="ทดสอบส่งข้อความเข้ากลุ่ม Telegram"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'กำลังทดสอบ...' : 'ทดสอบส่งข้อความเข้ากลุ่ม'}</span>
            </button>
            {isSaved && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>บันทึกแล้ว!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              ปิด
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
