import React, { useState } from 'react';
import { X, Lock, User, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import AssociationLogo from './AssociationLogo';
import DeveloperCredit from './DeveloperCredit';
import { demoAccounts } from '../data/mockData';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, onOpenRegister, settings }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanInput = username.trim();
    const cleanPass = password.trim();

    if (!cleanInput || !cleanPass) {
      setErrorMsg('กรุณากรอกสัญญาณเรียกขาน หรือ เบอร์โทรศัพท์ และรหัสผ่าน');
      return;
    }

    // Check against demo accounts or accept valid mock
    const found = demoAccounts.find(
      (acc) =>
        acc.callsign.toUpperCase() === cleanInput.toUpperCase() ||
        acc.username.toLowerCase() === cleanInput.toLowerCase() ||
        acc.phone.replace(/\D/g, '') === cleanInput.replace(/\D/g, '') ||
        acc.citizenId.replace(/\D/g, '') === cleanInput.replace(/\D/g, '')
    );

    if (found) {
      if (
        found.last4Id === cleanPass || 
        cleanPass === '1234' || 
        cleanPass === '5532' || 
        cleanPass === '9999' ||
        found.citizenId.endsWith(cleanPass)
      ) {
        onLoginSuccess(found);
        onClose();
        return;
      } else {
        setErrorMsg(`รหัสผ่านเลขท้ายบัตรไม่ถูกต้อง (สำหรับ ${found.callsign} ลองเลข ${found.last4Id})`);
        return;
      }
    }

    // Allow mock fallback login
    if (cleanPass.length === 4) {
      const isCallsign = /^[A-Z0-9]{4,8}$/i.test(cleanInput);
      const customUser = {
        username: cleanInput.toLowerCase(),
        callsign: isCallsign ? cleanInput.toUpperCase() : '-',
        fullName: isCallsign ? `สมาชิก ${cleanInput.toUpperCase()}` : `สมาชิกเบอร์ ${cleanInput}`,
        memberId: `369${Math.floor(100 + Math.random() * 900)}`,
        memberType: 'สมาชิกสามัญ 5 ปี',
        startDate: '16 พ.ย. 2569',
        endDate: '15 พ.ย. 2574',
        registeredAddress: 'อ.เมืองสงขลา จ.สงขลา 90000',
        phone: cleanInput,
        deNetworkCode: null,
        role: 'member',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        joinDate: '19 พ.ย. 2569',
      };
      onLoginSuccess(customUser);
      onClose();
    } else {
      setErrorMsg('รหัสผ่านเริ่มต้นคือเลขท้ายบัตรประชาชน 4 หลัก');
    }
  };

  const handleQuickLogin = (account) => {
    onLoginSuccess(account);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 pt-[max(calc(env(safe-area-inset-top,0px)+12px),24px)] pb-4">
      <div 
        className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Brand Banner */}
        <div className="bg-gradient-to-r from-[#071d33] via-[#0c2c4d] to-[#071d33] text-white p-5 sm:p-6 relative border-b border-sky-900/50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <AssociationLogo customUrl={settings?.customLogoUrl} className="w-11 h-11 rounded-full shadow-sm" />
            <div>
              <h3 className="font-bold text-base text-white">เข้าสู่ระบบสมาชิก</h3>
              <p className="text-xs text-sky-200">สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สัญญาณเรียกขาน (Callsign) หรือ เบอร์โทรศัพท์
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น E26ECG หรือ HS9ADM หรือ เบอร์โทร"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  รหัสผ่าน (เลขบัตรประชาชนสี่ตัวท้าย)
                </label>
                <span className="text-[10px] text-sky-700 font-mono">4 หลัก</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  maxLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกตัวเลข 4 หลัก เช่น 1234"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="rounded text-sky-600 focus:ring-sky-500" defaultChecked />
                <span>จำการเข้าสู่ระบบ</span>
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("ระบบลืมรหัสผ่าน:\nรหัสผ่านเริ่มต้นของท่านคือเลข 4 ตัวท้ายของบัตรประจำตัวประชาชน\nหากมีข้อสงสัยกรุณาติดต่อฝ่ายนายทะเบียน โทร 093-792-5665"); }} className="text-sky-600 hover:underline">
                ลืมรหัสผ่าน?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-700 to-sky-800 hover:from-sky-800 hover:to-sky-900 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm cursor-pointer mt-2"
            >
              เข้าสู่ระบบ
            </button>
          </form>

          {/* Quick Demo Login Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              คลิกเพื่อทดสอบเข้าสู่ระบบทันที:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin(demoAccounts[0])}
                className="p-2 bg-amber-50/80 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-800">E26ECG</span>
                  <span className="text-[10px] text-slate-500 font-mono">5532</span>
                </div>
                <p className="text-[10px] text-slate-700 truncate font-medium">ผอ.โต๊ด (แอดมิน)</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(demoAccounts[1])}
                className="p-2 bg-sky-50/80 hover:bg-sky-100 border border-sky-200 rounded-xl text-left transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sky-800">HS9ADM</span>
                  <span className="text-[10px] text-slate-500 font-mono">9999</span>
                </div>
                <p className="text-[10px] text-slate-700 truncate font-medium">แอดมินสมาคมฯ</p>
              </button>
            </div>
          </div>

          {/* Link to Register */}
          <div className="mt-5 text-center text-xs text-slate-600">
            ยังไม่ได้เป็นสมาชิกสมาคมฯ?{' '}
            <button
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="font-bold text-sky-700 hover:underline cursor-pointer"
            >
              สมัครสมาชิกที่นี่
            </button>
          </div>
        </div>

        {/* Developer Credit Signature Bar */}
        <DeveloperCredit variant="light" />
      </div>
    </div>
  );
}
