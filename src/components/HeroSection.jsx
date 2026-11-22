import React, { useState } from 'react';
import AssociationLogo from './AssociationLogo';
import { 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  UserPlus, 
  HelpCircle, 
  ShieldCheck, 
  FileText, 
  Receipt,
  Radio, 
  ExternalLink,
  ChevronRight,
  LogOut,
  Cpu,
  Edit3
} from 'lucide-react';
import { demoAccounts } from '../data/mockData';
import { getSectionTheme, getOverlayGradient } from '../utils/themeUtils';

export default function HeroSection({ 
  settings, 
  currentUser, 
  onLoginSuccess, 
  onLogout, 
  onOpenRegister, 
  onNavigateToAdmin,
  onOpenCertificate,
  onOpenReceipt,
  onOpenDeModal,
  onOpenManageFrequencies,
  onOpenCustomizer
}) {
  // Login Form States inside Hero
  const [callsignInput, setCallsignInput] = useState('');
  const [last4Input, setLast4Input] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Submit Login
  const handleHeroLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanInput = callsignInput.trim();
    const cleanLast4 = last4Input.trim();

    if (!cleanInput) {
      setLoginError('กรุณากรอกนามเรียกขาน หรือ เบอร์โทรศัพท์');
      return;
    }
    if (!cleanLast4 || cleanLast4.length < 4) {
      setLoginError('กรุณากรอกเลขท้ายบัตรประชาชน 4 ตัว (รหัสผ่าน)');
      return;
    }

    // Check against demo accounts by callsign, username, phone, or citizen ID
    const found = demoAccounts.find(
      (acc) =>
        acc.callsign.toUpperCase() === cleanInput.toUpperCase() ||
        acc.username.toLowerCase() === cleanInput.toLowerCase() ||
        acc.phone.replace(/\D/g, '') === cleanInput.replace(/\D/g, '') ||
        acc.citizenId.replace(/\D/g, '') === cleanInput.replace(/\D/g, '')
    );

    if (found) {
      if (
        found.last4Id === cleanLast4 || 
        cleanLast4 === '1234' || 
        cleanLast4 === '5532' || 
        cleanLast4 === '9999' ||
        found.citizenId.endsWith(cleanLast4)
      ) {
        onLoginSuccess(found);
        return;
      } else {
        setLoginError(`รหัสผ่านเลขท้ายบัตรไม่ถูกต้อง (สำหรับ ${found.callsign} ลองเลข ${found.last4Id})`);
        return;
      }
    }

    // Allow mock fallback login for quick testing
    if (cleanLast4.length === 4) {
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
    } else {
      setLoginError('เลขท้ายบัตรประชาชนต้องเป็นตัวเลข 4 หลัก');
    }
  };

  // Quick fill for testing
  const handleQuickFill = (account) => {
    setCallsignInput(account.callsign !== '-' ? account.callsign : account.phone);
    setLast4Input(account.last4Id);
    setLoginError('');
  };

  // Forgot password alert handler
  const handleForgotPassword = () => {
    alert(
      "ระบบลืมรหัสผ่าน:\n\n" +
      "เนื่องจากรหัสผ่านเริ่มต้นของท่านคือ 'เลขบัตรประชาชน 4 ตัวท้าย'\n" +
      "หากท่านไม่สามารถเข้าสู่ระบบได้ หรือมีการเปลี่ยนแปลงข้อมูลบัตรประชาชน\n" +
      "กรุณาติดต่อฝ่ายนายทะเบียน สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา\n" +
      "โทร: " + settings.contactPhone + "\n" +
      "หรือติดต่อประสานงานทางความถี่ " + settings.radioFrequencyCalling
    );
  };

  const heroTheme = getSectionTheme(settings, 'hero');
  const heroBgImage = heroTheme.bgUrl || settings.heroBgUrl || "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2000&q=80";
  const heroOpacity = Math.max((heroTheme.opacity ?? 85) / 100, 0.45);
  const overlayGradient = getOverlayGradient(heroTheme.overlayType);

  return (
    <section id="home" className="relative overflow-hidden bg-[#011424] min-h-[calc(100vh-80px)] flex items-center">
      {/* Dynamic Background Image with Admin-Configurable Opacity */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 transform scale-105 pointer-events-none"
        style={{ 
          backgroundImage: `url('${heroBgImage}')`,
          opacity: heroOpacity,
        }}
      />

      {/* Official Oceanic Wave Gradient Overlay (ฟ้าน้ำทะเลตัดน้ำเงิน มีเส้นสายคลื่น โปร่งแสงให้เห็นภาพฉากหลังชัดเจน) */}
      <div className={`absolute inset-0 bg-gradient-to-r ${overlayGradient} pointer-events-none`} />
      
      {/* Decorative Radio & Ocean Wave Grid Patterns */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Association Title & Tagline */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-2 sm:space-y-3">
            
            {/* Main Headline & Subtitle */}
            <div className="space-y-1 w-full">
              <h1 className="text-[clamp(15px,4.3vw,44px)] font-extrabold text-white tracking-tight leading-snug whitespace-nowrap">
                {settings.associationNameTh}
              </h1>
              <p className="text-sky-300 font-mono text-[clamp(8.5px,2.4vw,16px)] font-semibold tracking-normal sm:tracking-wider whitespace-nowrap leading-tight">
                SAMILA AMATEUR RADIO ASSOCIATION • CALLSIGN: {settings.officialCallsign}
              </p>
            </div>

            {/* Slogan / Motto */}
            <p className="text-slate-200 text-[clamp(8.5px,2.3vw,16px)] font-light leading-normal whitespace-nowrap">
              {settings.tagline}
            </p>

          </div>

          {/* Right Column: Member Box (Guest Login OR Logged-in Member Card) */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-[#012440]/92 backdrop-blur-xl rounded-2xl border-2 border-cyan-400/50 shadow-[0_15px_45px_rgba(0,180,216,0.25)] p-6 sm:p-7 relative overflow-hidden">
              
              {/* Decorative Glow */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-400/25 rounded-full blur-2xl pointer-events-none" />

              {!currentUser ? (
                /* ================= GUEST LOGIN FORM ================= */
                <>
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-sky-600/30 border border-sky-400/40 flex items-center justify-center text-sky-300">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">
                          เข้าสู่ระบบสมาชิก
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] text-sky-400 font-mono bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60">
                      HS9AS
                    </span>
                  </div>

                  {/* Error Alert */}
                  {loginError && (
                    <div className="mb-4 p-2.5 bg-rose-950/70 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* LOGIN FORM */}
                  <form onSubmit={handleHeroLogin} className="space-y-4">
                    {/* Callsign / Phone Input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        นามเรียกขาน หรือ เบอร์โทรศัพท์
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sky-400">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={callsignInput}
                          onChange={(e) => setCallsignInput(e.target.value)}
                          placeholder="เช่น E26ECG หรือ HS9xxx หรือ เบอร์โทร"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input (4-digit ID number) */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          เลขบัตรประชาชนสี่ตัวท้าย (พาสเวิร์ด)
                        </label>
                        <span className="text-[10px] text-sky-400 font-mono">4 หลัก</span>
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sky-400">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          maxLength={4}
                          value={last4Input}
                          onChange={(e) => setLast4Input(e.target.value.replace(/\D/g, ''))}
                          placeholder="กรอกตัวเลข 4 หลัก เช่น 1234"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-xs sm:text-sm font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* BUTTON ROW 1: เข้าสู่ระบบ (70%) + ลืมรหัส (30%) */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="submit"
                        className="w-[70%] py-2.5 sm:py-3 bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-sky-500/25 transition text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4 shrink-0" />
                        <span>เข้าสู่ระบบ</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="w-[30%] py-2.5 sm:py-3 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 font-medium rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-1 cursor-pointer"
                        title="คลิกเพื่อดูคำแนะนำการลืมรหัสผ่าน"
                      >
                        <HelpCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>ลืมรหัส</span>
                      </button>
                    </div>

                    {/* BUTTON ROW 2: สมัครสมาชิก (ความยาว 100% อยู่ใต้ปุ่ม เข้าสู่ระบบ และ ลืมรหัส) */}
                    <div>
                      <button
                        type="button"
                        onClick={onOpenRegister}
                        className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl shadow-md hover:shadow-lg transition text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 text-slate-950 shrink-0" />
                        <span>สมัครสมาชิก</span>
                      </button>
                    </div>
                  </form>

                  {/* Demo Quick-Fill Buttons for Testing */}
                  <div className="mt-5 pt-4 border-t border-slate-800">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2 text-center">
                      คลิกเพื่อทดสอบเข้าสู่ระบบทันที:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleQuickFill(demoAccounts[0])}
                        className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition cursor-pointer"
                        title="เข้าสู่ระบบ ผอ.โต๊ด (E26ECG)"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-amber-300">E26ECG</span>
                          <span className="text-[10px] text-slate-400 font-mono">5532</span>
                        </div>
                        <p className="text-[10px] text-slate-300 truncate">ผอ.โต๊ด (แอดมิน)</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickFill(demoAccounts[1])}
                        className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition cursor-pointer"
                        title="เข้าสู่ระบบ แอดมินหลัก HS9ADM"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-sky-300">HS9ADM</span>
                          <span className="text-[10px] text-slate-400 font-mono">9999</span>
                        </div>
                        <p className="text-[10px] text-slate-300 truncate">แอดมินสมาคมฯ</p>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* ================= LOGGED IN MEMBER CARD (MATCHING USER SPEC EXACTLY) ================= */
                <div className="space-y-4 text-left">
                  
                  {/* Status Banner */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>เข้าสู่ระบบเรียบร้อยแล้ว</span>
                    </span>
                    <span className="text-[10px] font-mono text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60">
                      HS9AS
                    </span>
                  </div>

                  {/* Top Profile Block: [รูปสมาชิก] | ข้อมูล */}
                  <div className="flex items-start gap-3.5">
                    
                    {/* รูปสมาชิก */}
                    <div className="relative shrink-0">
                      <img 
                        src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
                        alt="รูปสมาชิก" 
                        className="w-16 h-20 object-cover rounded-xl border-2 border-sky-400/50 shadow-md bg-slate-800"
                      />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" title="สถานะออนไลน์" />
                    </div>

                    {/* ข้อมูลสมาชิกด้านขวา */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-white leading-tight truncate">
                        {currentUser.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ ผอ.โต๊ด'}
                      </h3>

                      <p className="text-xs text-slate-300 font-mono">
                        นามเรียกขาน : <strong className="text-amber-300 font-bold">{currentUser.callsign || 'E26ECG'}</strong>
                      </p>

                      {/* เครือข่าย DE : ข้อความธรรมดาแต่คลิกได้ */}
                      <div className="pt-0.5">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={onOpenDeModal}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenDeModal(); }}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-sky-300 transition cursor-pointer group select-none"
                          title="คลิกเพื่อดูรายละเอียดเครือข่าย DE หรือยื่นขอรหัส"
                        >
                          <Cpu className="w-3.5 h-3.5 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <span>
                            เครือข่าย DE : {currentUser.deNetworkCode ? (
                              <strong className="font-mono text-emerald-400 group-hover:underline">{currentUser.deNetworkCode}</strong>
                            ) : (
                              <span className="text-amber-300 font-semibold group-hover:underline">รออนุมัติ / ยื่นขอรหัส DE</span>
                            )}
                          </span>
                          <span className="text-[11px] text-sky-400 group-hover:text-sky-300 underline decoration-dotted ml-0.5 cursor-pointer">(ดูข้อมูล)</span>
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Details Grid (สถานะ, วันเริ่ม-สิ้นสุด, สถานะภาพ, ความถี่) */}
                  <div className="space-y-2 text-xs pt-1">
                    
                    {/* สถานะประเภทสมาชิก */}
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">สถานะ :</span>
                      <span className="font-semibold text-white">
                        {currentUser.memberType || 'สมาชิกสามัญ 5 ปี'}
                      </span>
                    </div>

                    {/* วันเริ่ม - วันสิ้นสุด */}
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">วันเริ่ม :</span>
                        <span className="font-mono text-slate-200">{currentUser.startDate || '16 พ.ย. 2569'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">วันสิ้นสุด :</span>
                        <span className="font-mono text-slate-200">{currentUser.endDate || '15 พ.ย. 2574'}</span>
                      </div>
                    </div>

                    {/* สถานะสมาชิกภาพ */}
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">สถานะสมาชิกภาพ :</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{currentUser.memberStatus || 'ปกติ (Active)'}</span>
                      </span>
                    </div>

                    {/* ความถี่สแตนด์บาย 3 อุปกรณ์ (วิทยุเครื่องดำ, POC Radio, วิทยุเครื่องแดง) */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-sky-400" />
                          <span className="text-slate-300 font-semibold text-xs">ความถี่สแตนด์บาย 3 อุปกรณ์</span>
                        </div>
                        <button
                          type="button"
                          onClick={onOpenManageFrequencies}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-950/70 hover:bg-amber-900/80 px-2 py-0.5 rounded-lg border border-amber-700/60 transition cursor-pointer"
                          title="คลิกเพื่อจัดการและเพิ่ม/ลบความถี่สแตนด์บาย"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>จัดการความถี่</span>
                        </button>
                      </div>

                      <div className="space-y-1.5 text-[11px]">
                        {/* 1. วิทยุเครื่องดำ (VHF 144-147 MHz) */}
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-slate-400 border border-slate-600"></span>
                              <span>วิทยุเครื่องดำ (VHF) :</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {currentUser.blackRadios ? `${currentUser.blackRadios.length} ช่อง` : '1 ช่อง'}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {currentUser.blackRadios && currentUser.blackRadios.length > 0 ? (
                              currentUser.blackRadios.map((r, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[10px] border border-slate-700">
                                  <span>{r.freq}</span>
                                  {r.isRepeater && (
                                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-sans font-bold">
                                      รีพีทเตอร์
                                    </span>
                                  )}
                                </span>
                              ))
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[10px] border border-slate-700">
                                <span>{currentUser.radioStandby || '145.6750 MHz'}</span>
                                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-sans font-bold">
                                  รีพีทเตอร์
                                </span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 2. วิทยุ POC Radio (Network Radio) */}
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sky-200 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                              <span>วิทยุ POC Radio :</span>
                            </span>
                            <span className="text-[10px] text-sky-400 font-mono">
                              {currentUser.pocRadios ? `${currentUser.pocRadios.length} ช่อง` : '0 ช่อง'}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {currentUser.pocRadios && currentUser.pocRadios.length > 0 ? (
                              currentUser.pocRadios.map((r, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-950/70 text-sky-300 font-mono text-[10px] border border-sky-800/60">
                                  <span>{r.talkgroup || r.name}</span>
                                  {r.approvedByAssoc && (
                                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-sans font-semibold">
                                      สมาคมรับรอง
                                    </span>
                                  )}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 font-mono text-[10px]">- ยังไม่ได้เพิ่มห้อง POC -</span>
                            )}
                          </div>
                        </div>

                        {/* 3. วิทยุเครื่องแดง (CB 245 MHz) */}
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-rose-200 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                              <span>วิทยุเครื่องแดง (CB 245) :</span>
                            </span>
                            <span className="text-[10px] text-rose-400 font-mono">
                              {currentUser.redRadios ? `${currentUser.redRadios.length} ช่อง` : '0 ช่อง'}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {currentUser.redRadios && currentUser.redRadios.length > 0 ? (
                              currentUser.redRadios.map((r, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 font-mono text-[10px] border border-rose-900/50">
                                  <span>{r.freq}</span>
                                  <span className="text-[9px] bg-slate-800 text-slate-300 px-1 rounded font-sans">
                                    Simplex
                                  </span>
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 font-mono text-[10px]">- ยังไม่ได้เพิ่มช่องเครื่องแดง -</span>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* ACTION BUTTONS: เข้าหน้าแอดมิน, หนังสือรับรอง, ออกจากระบบ */}
                  <div className="pt-2 space-y-2">
                    
                    {/* แอดมิน Portal (เมื่อสมาชิกท่านนั้นเป็นแอดมิน) */}
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={onNavigateToAdmin}
                        className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-center text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>⚡ เข้าหน้าจัดการแอดมิน (Admin Portal)</span>
                      </button>
                    )}

                    {/* เอกสารสำคัญ: ใบเสร็จรับเงิน e-Receipt & หนังสือรับรองสมาชิก */}
                    <div className="flex gap-2">
                      <button
                        onClick={onOpenReceipt}
                        className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold rounded-xl text-center text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-500/50 shadow"
                        title="เปิดดูและดาวน์โหลดใบเสร็จรับเงินอิเล็กทรอนิกส์ (e-Receipt)"
                      >
                        <Receipt className="w-3.5 h-3.5 text-emerald-300" />
                        <span>ใบเสร็จรับเงิน (e-Receipt)</span>
                      </button>

                      {/* ดู/พิมพ์ หนังสือรับรองสมาชิก */}
                      <button
                        onClick={onOpenCertificate}
                        className="flex-1 py-2.5 px-3 bg-sky-700 hover:bg-sky-600 text-white font-medium rounded-xl text-center text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-sky-600 shadow"
                        title="เปิดดูหนังสือรับรองสถานะการเป็นสมาชิก"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>หนังสือรับรองสมาชิก</span>
                      </button>
                    </div>

                    {/* ออกจากระบบ */}
                    <div>
                      <button
                        onClick={onLogout}
                        className="w-full py-2 px-3 bg-slate-800/80 hover:bg-rose-950/80 text-rose-300 hover:text-rose-200 border border-slate-700/80 hover:border-rose-800/80 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>

                  </div>

                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Decorative Bottom Ocean Wave Curve Divider */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none z-20 pointer-events-none">
        <svg className="relative block w-full h-5 sm:h-8 text-[#012038]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C200,80 450,15 700,65 C950,115 1100,25 1200,55 L1200,120 L0,120 Z" fill="#f8fafc" opacity="1" />
        </svg>
      </div>
    </section>
  );
}
