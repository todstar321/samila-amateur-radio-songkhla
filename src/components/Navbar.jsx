import React, { useState } from 'react';
import AssociationLogo from './AssociationLogo';
import { 
  Radio, 
  User, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  Settings, 
  ChevronDown, 
  FileText, 
  BellRing,
  Home,
  PhoneCall,
  Sliders,
  Award,
  Receipt,
  Cpu,
  Users,
  MessageSquare
} from 'lucide-react';

export default function Navbar({ 
  settings, 
  currentUser, 
  onOpenLogin, 
  onOpenRegister, 
  onLogout,
  onOpenCustomizer,
  onNavigateToAdmin,
  onOpenCertificate,
  onOpenReceipt,
  onOpenDeModal,
  onOpenInbox,
  unreadCount = 0,
  unreadNewsCount = 0,
  activeTab = 'home',
  onSelectTab
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleTabClick = (tabId) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-2xl">
      {/* TIER 1: Main Brand Bar (โทนฟ้าน้ำทะเลตัดน้ำเงิน มีลวดลายคลื่นและเส้นตัดชัดเจน - z-30 ให้เมนูลอยเหนือแถบนำทาง) */}
      <div className="bg-gradient-to-r from-[#012a4a] via-[#01497c] to-[#013a63] text-white border-b border-cyan-400/50 py-3 sm:py-3.5 px-4 sm:px-6 lg:px-8 relative z-30 shadow-[0_4px_25px_rgba(0,180,216,0.22)]">
        {/* Subtle Wave Sheen & Light Reflections (overflow-hidden เฉพาะเลเยอร์กราฟิกพื้นหลัง ไม่ตัด dropdown) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
          <div className="absolute -top-10 left-1/4 w-80 h-24 bg-cyan-400/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 right-1/4 w-72 h-20 bg-sky-300/15 rounded-full blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
          
          {/* Logo & Association Titles */}
          <div className="flex items-center min-w-0">
            <a href="#" className="flex items-center gap-2.5 sm:gap-3.5 group focus:outline-none min-w-0">
              <AssociationLogo customUrl={settings.customLogoUrl} className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 shadow-md ring-2 ring-cyan-400/30 rounded-full" />
              <div className="flex flex-col min-w-0">
                <span className="text-[clamp(11px,2.9vw,20px)] font-bold tracking-tight text-white group-hover:text-cyan-200 transition leading-tight whitespace-nowrap drop-shadow-sm">
                  {settings.associationNameTh}
                </span>
                <span className="text-[9.5px] sm:text-xs text-cyan-100/90 font-light tracking-wide truncate max-w-[200px] sm:max-w-md">
                  {settings.associationNameEn}
                </span>
              </div>
            </a>
          </div>

          {/* Member / Authentication Section (Desktop) */}
          <div className="hidden sm:flex items-center space-x-2.5 shrink-0">
            {!currentUser ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-cyan-100 bg-sky-900/80 hover:bg-sky-800 border border-cyan-400/50 rounded-xl shadow-sm transition cursor-pointer hover:shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                >
                  <LogIn className="w-4 h-4 text-cyan-300" />
                  <span>เข้าสู่ระบบ</span>
                </button>
                <button
                  onClick={onOpenRegister}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 rounded-xl shadow-md transition cursor-pointer hover:shadow-[0_0_15px_rgba(251,191,36,0.35)]"
                >
                  <User className="w-4 h-4 text-slate-950" />
                  <span>สมัครสมาชิก</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {currentUser.role === 'admin' && (
                  <button
                    onClick={onNavigateToAdmin}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
                    title="เข้าสู่หน้าจัดการระบบสำหรับแอดมิน"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>เข้าหน้าแอดมิน</span>
                  </button>
                )}

                {/* Inbox Messages Button */}
                <button
                  type="button"
                  onClick={onOpenInbox}
                  className="relative px-3 py-1.5 bg-[#012038]/90 hover:bg-[#012b4a] border border-cyan-400/50 hover:border-cyan-300 text-cyan-200 rounded-xl text-xs font-semibold shadow-md transition cursor-pointer flex items-center gap-1.5"
                  title="เปิดกล่องข้อความทักหาเพื่อนสมาชิก"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="hidden md:inline">ข้อความ</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold animate-pulse shadow">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 bg-[#012038]/90 hover:bg-[#012b4a]/90 border border-cyan-400/60 pl-2.5 pr-3 py-1.5 rounded-xl shadow-md transition cursor-pointer hover:border-cyan-300"
                  >
                    <img 
                      src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                      alt="avatar"
                      className="w-8 h-8 rounded-lg object-cover border border-cyan-400/70"
                    />
                    <div className="text-left hidden md:block max-w-[210px]">
                      {/* บรรทัดที่ 1: Callsign / รหัส DE (กรณีมี DE ให้ใส่ด้วย) */}
                      <div className="text-xs font-bold font-mono text-amber-300 flex items-center gap-1 leading-tight">
                        <span>{currentUser.callsign !== '-' ? currentUser.callsign : 'รอ Callsign'}</span>
                        {currentUser.deNetworkCode && (
                          <span className="text-cyan-300 font-semibold font-mono">/ {currentUser.deNetworkCode}</span>
                        )}
                      </div>
                      {/* บรรทัดที่ 2: ชื่อ-นามสกุล */}
                      <div className="text-xs font-medium text-slate-100 truncate leading-tight mt-0.5" title={currentUser.fullName}>
                        {currentUser.fullName}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-300 ml-0.5" />
                  </button>

                  {/* Dropdown Menu (Desktop) */}
                  {userDropdownOpen && (
                    <>
                      {/* Full-screen backdrop to handle click outside safely on all devices */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setUserDropdownOpen(false)} 
                      />
                      <div 
                        className="absolute right-0 mt-2 w-72 bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-cyan-400/50 py-2 z-50 divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150"
                      >
                        <div className="px-4 py-3 bg-gradient-to-br from-slate-900 to-sky-950/80 rounded-t-2xl">
                          <p className="text-[10px] text-cyan-300 font-semibold tracking-wide uppercase">ข้อมูลบัญชีผู้ใช้งาน</p>
                          <p className="text-sm font-bold text-white mt-0.5 truncate">{currentUser.fullName}</p>
                          <p className="text-xs font-mono text-amber-300 font-bold mt-0.5">
                            Callsign: {currentUser.callsign !== '-' ? currentUser.callsign : 'รอขอรับ (กสทช.)'}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs text-sky-300 font-mono">รหัสสมาชิก: {currentUser.memberId || '30001'}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {currentUser.status === 'อนุมัติแล้ว' ? 'อนุมัติแล้ว' : 'รอตรวจสอบ'}
                            </span>
                          </div>
                          {currentUser.deNetworkCode && (
                            <p className="text-[11px] font-mono text-cyan-300 mt-1">
                              เครือข่าย DE: <strong className="text-emerald-400">{currentUser.deNetworkCode}</strong>
                            </p>
                          )}
                        </div>

                        <div className="py-1">
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => {
                                setUserDropdownOpen(false);
                                onNavigateToAdmin();
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 flex items-center gap-2 cursor-pointer font-bold"
                            >
                              <Sliders className="w-4 h-4 text-amber-400" />
                              <span>หน้าจัดการระบบแอดมิน (Admin Portal)</span>
                            </button>
                          )}

                          {/* Open Receipt */}
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              if (onOpenReceipt) onOpenReceipt();
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-800 text-emerald-300 flex items-center gap-2 cursor-pointer font-medium"
                          >
                            <Receipt className="w-4 h-4 text-emerald-400" />
                            <span>ใบเสร็จรับเงินของฉัน (e-Receipt)</span>
                          </button>

                          {/* Open Certificate */}
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              if (onOpenCertificate) onOpenCertificate();
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                          >
                            <Award className="w-4 h-4 text-amber-400" />
                            <span>หนังสือรับรองสมาชิก</span>
                          </button>

                          {/* Open DE Network modal */}
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              if (onOpenDeModal) onOpenDeModal();
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                          >
                            <Cpu className="w-4 h-4 text-sky-400" />
                            <span>เครือข่าย DE: {currentUser.deNetworkCode || 'ยื่นขอรหัส'}</span>
                          </button>
                        </div>

                        <div className="py-1">
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onLogout();
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-rose-400" />
                            <span>ออกจากระบบ</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Buttons */}
          <div className="flex sm:hidden items-center space-x-2">
            {!currentUser ? (
              <button
                onClick={onOpenLogin}
                className="px-2.5 py-1 text-xs font-semibold bg-sky-800/90 text-sky-200 border border-sky-500/40 rounded-lg"
              >
                เข้าสู่ระบบ
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="px-2.5 py-1 bg-[#012038] hover:bg-[#012b4a] text-amber-300 font-mono font-bold text-xs rounded-lg border border-cyan-400/60 flex items-center gap-1.5 shadow-sm"
                >
                  <img 
                    src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                    alt="avatar"
                    className="w-5 h-5 rounded-md object-cover border border-cyan-400/70"
                  />
                  <span className="truncate max-w-[85px]">{currentUser.callsign !== '-' ? currentUser.callsign : 'รอ Callsign'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                </button>

                {/* Mobile Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setUserDropdownOpen(false)} 
                    />
                    <div 
                      className="absolute right-0 mt-2 w-64 bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-cyan-400/50 py-2 z-50 divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150"
                    >
                      <div className="px-4 py-3 bg-gradient-to-br from-slate-900 to-sky-950/80 rounded-t-2xl">
                        <p className="text-[10px] text-cyan-300 font-semibold tracking-wide uppercase">ข้อมูลผู้เข้าสู่ระบบ</p>
                        <p className="text-sm font-bold text-white mt-0.5 truncate">{currentUser.fullName}</p>
                        <p className="text-xs font-mono text-amber-300 font-bold mt-0.5">
                          Callsign: {currentUser.callsign !== '-' ? currentUser.callsign : 'รอขอรับ (กสทช.)'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-sky-300 font-mono">รหัสสมาชิก: {currentUser.memberId || '30001'}</span>
                        </div>
                      </div>

                      <div className="py-1">
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onNavigateToAdmin();
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 flex items-center gap-2 cursor-pointer font-bold"
                          >
                            <Sliders className="w-4 h-4 text-amber-400" />
                            <span>เข้าหน้าแอดมิน (Admin Portal)</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            if (onOpenReceipt) onOpenReceipt();
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-800 text-emerald-300 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Receipt className="w-4 h-4 text-emerald-400" />
                          <span>ใบเสร็จรับเงิน (e-Receipt)</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            if (onOpenCertificate) onOpenCertificate();
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                        >
                          <Award className="w-4 h-4 text-amber-400" />
                          <span>หนังสือรับรองสมาชิก</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            if (onOpenDeModal) onOpenDeModal();
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                        >
                          <Cpu className="w-4 h-4 text-sky-400" />
                          <span>เครือข่าย DE: {currentUser.deNetworkCode || 'ยื่นขอรหัส'}</span>
                        </button>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" />
                          <span>ออกจากระบบ</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800/80 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* TIER 2: Oceanic Clean Navigation Bar with Wave Bottom Effect (แสดงทั้งคอมและมือถือแบบแถบแนวยาวเลื่อนซ้าย-ขวาได้ - z-20 ให้อยู่ใต้ dropdown) */}
      <nav className="block bg-gradient-to-r from-[#012038] via-[#013a63] to-[#012644] text-white border-b border-cyan-400/40 relative z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 py-1.5 text-xs sm:text-sm font-medium overflow-x-auto no-scrollbar flex-nowrap">
            {/* 1. หน้าแรก */}
            <button 
              type="button"
              onClick={() => handleTabClick('home')} 
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold border border-cyan-300 shadow-[0_0_12px_rgba(0,180,216,0.6)] ring-2 ring-cyan-400/50'
                  : 'text-cyan-100/90 hover:text-cyan-200 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-400/30'
              }`}
            >
              <Home className={`w-3.5 h-3.5 ${activeTab === 'home' ? 'text-cyan-200' : 'text-cyan-300'}`} />
              <span>หน้าแรก</span>
            </button>
            <span className="text-cyan-800/80 shrink-0">•</span>

            {/* 2. ข่าวและประกาศ (พร้อมป้ายแจ้งเตือนตัวเลขข่าวใหม่ที่ยังไม่เปิดดู เพื่อกระตุ้นเฉพาะสมาชิก) */}
            <button 
              type="button"
              onClick={() => handleTabClick('news')} 
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold border border-cyan-300 shadow-[0_0_12px_rgba(0,180,216,0.6)] ring-2 ring-cyan-400/50'
                  : 'text-cyan-100/90 hover:text-cyan-200 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-400/30'
              }`}
            >
              <BellRing className={`w-3.5 h-3.5 ${activeTab === 'news' ? 'text-cyan-200' : 'text-cyan-300'}`} />
              <span>ข่าวและประกาศ</span>
              {unreadNewsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold animate-pulse shadow-md ring-1 ring-white/40">
                  {unreadNewsCount}
                </span>
              )}
            </button>
            <span className="text-cyan-800/80 shrink-0">•</span>

            {/* 3. สถานีทวนสัญญาณ & ความถี่ */}
            <button 
              type="button"
              onClick={() => handleTabClick('repeaters')} 
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'repeaters'
                  ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold border border-cyan-300 shadow-[0_0_12px_rgba(0,180,216,0.6)] ring-2 ring-cyan-400/50'
                  : 'text-cyan-100/90 hover:text-cyan-200 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-400/30'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${activeTab === 'repeaters' ? 'text-cyan-200' : 'text-cyan-300'}`} />
              <span>สถานีทวนสัญญาณ & ความถี่</span>
            </button>
            <span className="text-cyan-800/80 shrink-0">•</span>

            {/* 4. บริการสมาชิก */}
            <button 
              type="button"
              onClick={() => handleTabClick('services')} 
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold border border-cyan-300 shadow-[0_0_12px_rgba(0,180,216,0.6)] ring-2 ring-cyan-400/50'
                  : 'text-cyan-100/90 hover:text-cyan-200 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-400/30'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 ${activeTab === 'services' ? 'text-cyan-200' : 'text-cyan-300'}`} />
              <span>บริการสมาชิก</span>
            </button>
            <span className="text-cyan-800/80 shrink-0">•</span>

            {/* 5. ค้นหาเพื่อนสมาชิก: ย้ายมาอยู่หน้าปุ่ม "ติดต่อสมาคม" ตามความต้องการข้อ 2 (แสดงเฉพาะสมาชิกที่เข้าระบบแล้ว) */}
            {currentUser && (
              <>
                <button 
                  type="button"
                  onClick={() => handleTabClick('directory')} 
                  className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    activeTab === 'directory'
                      ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold border border-cyan-300 shadow-[0_0_12px_rgba(0,180,216,0.6)] ring-2 ring-cyan-400/50'
                      : 'text-cyan-100/90 hover:text-cyan-200 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-400/30'
                  }`}
                >
                  <Users className={`w-3.5 h-3.5 ${activeTab === 'directory' ? 'text-cyan-200' : 'text-cyan-300'}`} />
                  <span>ค้นหาเพื่อนสมาชิก</span>
                </button>
                <span className="text-cyan-800/80 shrink-0">•</span>
              </>
            )}

            {/* 6. ติดต่อสมาคม */}
            <button 
              type="button"
              onClick={() => handleTabClick('contact')} 
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold border border-cyan-300 shadow-[0_0_12px_rgba(0,180,216,0.6)] ring-2 ring-cyan-400/50'
                  : 'text-cyan-100/90 hover:text-cyan-200 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-400/30'
              }`}
            >
              <PhoneCall className={`w-3.5 h-3.5 ${activeTab === 'contact' ? 'text-cyan-200' : 'text-cyan-300'}`} />
              <span>ติดต่อสมาคม</span>
            </button>
          </div>
        </div>

        {/* Decorative Wave Edge Border (เส้นคลื่นผิวน้ำทะเลตัดกัน) */}
        <div className="w-full overflow-hidden leading-none pointer-events-none -mb-[1px]">
          <svg className="relative block w-full h-2 text-[#012038]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,40 L1200,0 L0,0 Z" fill="#013a63" opacity="0.9" />
            <path d="M0,25 C200,85 450,15 700,65 C950,115 1100,25 1200,55 L1200,0 L0,0 Z" fill="#00b4d8" opacity="0.45" />
          </svg>
        </div>
      </nav>

      {/* Mobile Drawer (สำหรับมือถือ: สลับหน้า และ จัดการข้อมูลบัญชี) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-cyan-500/40 bg-gradient-to-b from-[#012038] to-[#011424] px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in fade-in duration-150">
          
          {/* Mobile Main Tab Navigation Buttons */}
          <div className="pb-3 border-b border-cyan-500/25">
            <span className="text-[11px] font-semibold text-cyan-300 block mb-2">
              🧭 เลือกหน้าที่ต้องการเปิด (แสดงทีละหน้า):
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleTabClick('home')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition ${
                  activeTab === 'home'
                    ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold shadow-md ring-1 ring-cyan-300'
                    : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span>หน้าแรก</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('news')}
                className={`flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl text-left transition ${
                  activeTab === 'news'
                    ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold shadow-md ring-1 ring-cyan-300'
                    : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BellRing className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                  <span>ข่าว & ประกาศ</span>
                </div>
                {unreadNewsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold animate-pulse shadow-md">
                    {unreadNewsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('repeaters')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition ${
                  activeTab === 'repeaters'
                    ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold shadow-md ring-1 ring-cyan-300'
                    : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span>รีพีทเตอร์ & ความถี่</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('services')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition ${
                  activeTab === 'services'
                    ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold shadow-md ring-1 ring-cyan-300'
                    : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span>บริการสมาชิก</span>
              </button>

              {/* ค้นหาเพื่อนสมาชิก: ย้ายมาอยู่หน้าปุ่ม ติดต่อสมาคม */}
              {currentUser && (
                <button
                  type="button"
                  onClick={() => handleTabClick('directory')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition ${
                    activeTab === 'directory'
                      ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold shadow-md ring-1 ring-cyan-300'
                      : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800 border border-slate-700/60'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                  <span>ค้นหาเพื่อนสมาชิก</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleTabClick('contact')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition ${
                  activeTab === 'contact'
                    ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold shadow-md ring-1 ring-cyan-300'
                    : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span>ติดต่อสมาคม</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <User className="w-4 h-4 text-cyan-400" />
              <span>ข้อมูลบัญชีส่วนบุคคล (สมาชิก)</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400/80">HS9AS Member</span>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {!currentUser ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-sky-800/80 rounded-lg"
                >
                  <LogIn className="w-4 h-4" /> เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenRegister();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-slate-950 bg-amber-400 rounded-lg"
                >
                  <User className="w-4 h-4" /> สมัครสมาชิกใหม่
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-400">ผู้ใช้งานปัจจุบัน:</p>
                  <p className="text-sm font-bold font-mono text-amber-300">
                    {currentUser.callsign !== '-' ? currentUser.callsign : 'รอ Callsign'}
                    {currentUser.deNetworkCode ? ` / ${currentUser.deNetworkCode}` : ''}
                  </p>
                  <p className="text-xs font-medium text-white">{currentUser.fullName}</p>
                  <p className="text-xs text-sky-400">{currentUser.memberType}</p>
                </div>

                {/* Mobile Message Inbox Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenInbox) onOpenInbox();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-cyan-200 bg-cyan-950/80 border border-cyan-700/60 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-300" />
                    <span>กล่องข้อความทักหาเพื่อนสมาชิก</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold">
                      {unreadCount} ใหม่
                    </span>
                  )}
                </button>

                {/* Mobile Receipt Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenReceipt) onOpenReceipt();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-sm"
                >
                  <Receipt className="w-4 h-4 text-emerald-200" /> ใบเสร็จรับเงิน (e-Receipt)
                </button>

                {/* Mobile Certificate Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenCertificate) onOpenCertificate();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-sky-700 rounded-lg"
                >
                  <Award className="w-4 h-4 text-amber-400" /> หนังสือรับรองสมาชิก (Official)
                </button>

                {/* Mobile DE Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenDeModal) onOpenDeModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-sky-300 bg-sky-950 border border-sky-800 rounded-lg"
                >
                  <Cpu className="w-4 h-4" /> เครือข่าย DE: {currentUser.deNetworkCode || 'ยื่นขอรหัส'}
                </button>

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigateToAdmin();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 rounded-lg shadow cursor-pointer"
                  >
                    <Sliders className="w-4 h-4" /> เข้าหน้าจัดการแอดมิน (Admin Portal)
                  </button>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-400 bg-rose-950/40 rounded-lg"
                >
                  <LogOut className="w-4 h-4" /> ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
