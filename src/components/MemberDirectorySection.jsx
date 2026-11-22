import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  MessageSquare, 
  Radio, 
  Cpu, 
  Table, 
  Grid, 
  Download, 
  Filter, 
  ShieldCheck, 
  MapPin, 
  UserCheck, 
  ChevronRight, 
  ExternalLink,
  SlidersHorizontal,
  Eye,
  CheckCircle2,
  Sparkles,
  ZoomIn,
  ShieldAlert,
  Lock,
  Receipt
} from 'lucide-react';
import { getSectionTheme, getOverlayGradient } from '../utils/themeUtils';
import FullPhotoZoomModal from './FullPhotoZoomModal';

export default function MemberDirectorySection({ 
  settings, 
  membersList = [], 
  currentUser, 
  onChatWithMember,
  onOpenDeModal,
  onOpenLogin,
  onOpenProfile,
  onOpenReceipt,
  onSelectTab
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ทั้งหมด');
  const [viewMode, setViewMode] = useState('sheet'); // 'sheet' (Google Sheets Table) or 'cards' (Photo Cards)
  const [previewPhotoMember, setPreviewPhotoMember] = useState(null);
  const [zoomMember, setZoomMember] = useState(null);

  // ตรวจสอบสิทธิ์การเป็นสมาชิกที่ได้รับการอนุมัติแล้ว (Admin, SuperAdmin หรือ status === 'อนุมัติแล้ว')
  const isApproved = currentUser && (
    currentUser.role === 'admin' || 
    currentUser.isSuperAdmin || 
    currentUser.status === 'อนุมัติแล้ว'
  );

  const theme = getSectionTheme(settings, 'directory');
  const bgOpacity = (theme.opacity ?? 20) / 100;
  const overlayClass = getOverlayGradient(theme.overlayType, 'ocean-light');

  // Filter Categories
  const filterOptions = [
    { id: 'ทั้งหมด', label: 'ทั้งหมด' },
    { id: 'มีรหัส DE', label: 'เครือข่าย DE' },
    { id: 'ย่าน 145 MHz', label: 'วิทยุเครื่องดำ 145 MHz' },
    { id: 'ย่าน 245 MHz', label: 'วิทยุเครื่องแดง 245 MHz' },
    { id: 'POC Radio', label: 'วิทยุ POC Radio' },
    { id: 'หาดใหญ่', label: 'อ.หาดใหญ่' },
    { id: 'เมืองสงขลา', label: 'อ.เมืองสงขลา' },
  ];

  // Filtering Logic
  const filteredMembers = membersList.filter(member => {
    // Exclude unapproved members from public ham directory
    if (member.status === 'รอตรวจสอบ' || member.status === 'รออนุมัติ') return false;

    // Search query matching callsign, fullName, nickname, phone, deNetworkCode, district, frequency
    const q = searchTerm.toLowerCase().trim();
    const matchSearch = !q || 
      (member.callsign && member.callsign.toLowerCase().includes(q)) ||
      (member.fullName && member.fullName.toLowerCase().includes(q)) ||
      (member.nickname && member.nickname.toLowerCase().includes(q)) ||
      (member.phone && member.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))) ||
      (member.deNetworkCode && member.deNetworkCode.toLowerCase().includes(q)) ||
      (member.district && member.district.toLowerCase().includes(q)) ||
      (member.registeredAddress && member.registeredAddress.toLowerCase().includes(q)) ||
      (member.radioStandby && member.radioStandby.toLowerCase().includes(q));

    if (!matchSearch) return false;

    // Filter pill matching
    if (selectedFilter === 'ทั้งหมด') return true;
    if (selectedFilter === 'มีรหัส DE') return !!member.deNetworkCode;
    if (selectedFilter === 'ย่าน 145 MHz') return (member.blackRadios && member.blackRadios.length > 0) || member.radioStandby?.includes('145');
    if (selectedFilter === 'ย่าน 245 MHz') return member.redRadios && member.redRadios.length > 0;
    if (selectedFilter === 'POC Radio') return member.pocRadios && member.pocRadios.length > 0;
    if (selectedFilter === 'หาดใหญ่') return member.district?.includes('หาดใหญ่') || member.registeredAddress?.includes('หาดใหญ่');
    if (selectedFilter === 'เมืองสงขลา') return member.district?.includes('เมือง') || member.registeredAddress?.includes('เมือง');

    return true;
  });

  // Export to CSV (Google Sheets Export)
  const handleExportCSV = () => {
    if (!isApproved) {
      alert('🔒 จำกัดสิทธิ์: เฉพาะสมาชิกที่ได้รับการอนุมัติแล้วเท่านั้นที่สามารถส่งออกข้อมูลทำเนียบเพื่อนสมาชิกได้');
      return;
    }
    const headers = ["ลำดับ", "นามเรียกขาน", "รหัส DE", "ชื่อ-นามสกุล", "ชื่อเล่น", "เบอร์โทรศัพท์", "ย่านความถี่", "พื้นที่ QTH", "ประเภทสมาชิก"];
    const rows = filteredMembers.map((m, idx) => [
      idx + 1,
      m.callsign || '-',
      m.deNetworkCode || '-',
      `"${m.fullName || ''}"`,
      `"${m.nickname || ''}"`,
      `"${m.phone || ''}"`,
      `"${m.radioStandby || ''}"`,
      `"${m.district || ''}"`,
      `"${m.memberType || ''}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ทำเนียบสมาชิกวิทยุสมัครเล่นสมิหลา_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="directory" className="py-16 sm:py-24 bg-slate-50 relative overflow-hidden">
      {/* Dynamic Background Image with Opacity */}
      {theme.bgUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 pointer-events-none"
          style={{ 
            backgroundImage: `url('${theme.bgUrl}')`,
            opacity: bgOpacity,
          }}
        />
      )}
      {/* Oceanic Overlay Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${overlayClass} pointer-events-none`} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-cyan-500/30 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-cyan-800 text-xs font-bold tracking-wider uppercase mb-1.5 bg-cyan-100/70 border border-cyan-300 px-3 py-1 rounded-full">
              <Users className="w-4 h-4 text-cyan-700" />
              <span>Amateur Radio Member Directory & Friend Finder</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ค้นหาเพื่อนสมาชิก & ทำเนียบนักวิทยุสมัครเล่น
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              จำหน้าได้แต่ลืมคอนไซน์ หรือจำนามเรียกขานได้แต่จำหน้าตาไม่ได้ ค้นหาเพื่อนสมาชิกสมิหลา ดูรูป นามเรียกขาน รหัส DE ย่านความถี่ โทรออกได้ทันที พร้อมปุ่มแชตทักหา
            </p>
          </div>

          {/* Quick Stats & View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#012a4a] to-[#01497c] text-white text-xs font-mono font-bold shadow-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>สมาชิกออนไลน์: {filteredMembers.length} สถานี</span>
            </span>

            {/* View Mode Switcher */}
            <div className="bg-white p-1 rounded-xl border border-slate-300 shadow-2xs flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('sheet')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'sheet'
                    ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="มุมมองตารางสไตล์ Google Sheets ตรึง 2 คอลัมน์ซ้าย"
              >
                <Table className="w-3.5 h-3.5" />
                <span>Google Sheets</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="มุมมองทำเนียบการ์ดรูปภาพ เห็นหน้าตาชัดเจน"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>ทำเนียบภาพถ่าย</span>
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="ส่งออกรายชื่อเป็นไฟล์ Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">ส่งออก CSV</span>
            </button>
          </div>
        </div>

        {/* Wrapper สำหรับจัดการการเบลอและการล็อคสิทธิ์เข้าถึง (กรณีสถานะยังไม่อนุมัติ เช่น รอ Callsign นาย ทดสอบ ระบบ) */}
        <div className="relative min-h-[580px] rounded-3xl overflow-hidden">
          
          {/* เนื้อหาทำเนียบสมาชิก (จะถูกเบลอทึบ 100% และห้ามคลิก หากยังไม่ได้รับการอนุมัติ) */}
          <div className={!isApproved ? "filter blur-[9px] select-none pointer-events-none opacity-25 user-select-none space-y-6" : "space-y-6"}>
            
            {/* Search Bar & Filter Options */}
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-cyan-200/80 shadow-md space-y-3">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-cyan-600">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาด้วย นามเรียกขาน (เช่น E26ECG, HS9xxx), รหัส DE, ชื่อจริง, ชื่อเล่น (ผอ.โต๊ด), เบอร์โทรศัพท์, ย่านความถี่ หรือ อำเภอ..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
                  disabled={!isApproved}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
                  <Filter className="w-3 h-3 text-slate-400" />
                  <span>กรองข้อมูล:</span>
                </span>
                {filterOptions.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer shrink-0 border ${
                      selectedFilter === f.id
                        ? 'bg-[#012a4a] text-cyan-200 border-cyan-400 font-bold shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

        {/* Notice for Google Sheets view */}
        {viewMode === 'sheet' && (
          <div className="text-right text-[11px] text-slate-500 flex items-center justify-end gap-1 font-mono">
            <span>💡 ตาราง Google Sheets: ตรึง 2 คอลัมน์ซ้าย (รูป & Callsign) สามารถเลื่อนซ้าย-ขวาเพื่อดูข้อมูลได้</span>
          </div>
        )}

        {/* ================= VIEW 1: GOOGLE SHEETS STYLE DATA GRID (PINNED 2 COLUMNS) ================= */}
        {viewMode === 'sheet' ? (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-cyan-200 shadow-xl overflow-hidden">
            <div className="overflow-x-auto relative">
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[1600px]">
                <thead>
                  <tr className="bg-gradient-to-r from-[#012a4a] via-[#01497c] to-[#013a63] text-white border-b-2 border-cyan-400">
                    
                    {/* PINNED COLUMN 1: รูปสมาชิก (Avatar) */}
                    <th className="py-3 px-2 sticky left-0 z-30 bg-[#012a4a] font-bold w-[68px] min-w-[68px] max-w-[68px] text-center border-r border-cyan-500/30 shadow-[2px_0_5px_rgba(0,0,0,0.1)] whitespace-nowrap">
                      รูปสมาชิก
                    </th>

                    {/* PINNED COLUMN 2: นามเรียกขาน (Callsign) */}
                    <th className="py-3 px-3.5 sticky left-[68px] z-30 bg-[#012a4a] font-bold w-[140px] min-w-[140px] max-w-[140px] border-r-2 border-cyan-400 shadow-[4px_0_8px_rgba(0,0,0,0.15)] whitespace-nowrap">
                      นามเรียกขาน
                    </th>

                    {/* SCROLLABLE COLUMNS - WIDE AND SINGLE LINE */}
                    <th className="py-3 px-3.5 font-bold min-w-[130px] whitespace-nowrap">รหัสเครือข่าย DE</th>
                    <th className="py-3 px-3.5 font-bold min-w-[300px] whitespace-nowrap">ชื่อ - นามสกุล</th>
                    <th className="py-3 px-3.5 font-bold min-w-[110px] whitespace-nowrap">ชื่อเล่น</th>
                    <th className="py-3 px-3.5 font-bold min-w-[250px] whitespace-nowrap">ย่านความถี่สแตนด์บาย</th>
                    <th className="py-3 px-3.5 font-bold min-w-[160px] whitespace-nowrap">เบอร์โทรศัพท์ (กดโทรได้)</th>
                    <th className="py-3 px-3.5 font-bold min-w-[130px] whitespace-nowrap">พื้นที่ / QTH</th>
                    <th className="py-3 px-3.5 font-bold min-w-[170px] whitespace-nowrap">สถานะภาพ</th>
                    <th className="py-3 px-3.5 font-bold min-w-[160px] text-center whitespace-nowrap">ติดต่อด่วน</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-500">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-sm">ไม่พบข้อมูลเพื่อนสมาชิกที่ตรงกับคำค้นหา "{searchTerm}"</p>
                        <p className="text-xs text-slate-400 mt-0.5">ลองค้นหาด้วยชื่อ นามเรียกขาน หรือเลือกหมวดหมู่อื่น</p>
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member, index) => {
                      const isEven = index % 2 === 0;
                      const displayAvatar = isApproved 
                        ? (member.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80")
                        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=10&q=10";
                      const displayCallsign = isApproved ? member.callsign : "HS9••••";
                      const displayFullName = isApproved ? member.fullName : "สมาชิกลับ (เบลอข้อมูล)";
                      const displayNickname = isApproved ? member.nickname : "••••";
                      const displayDe = isApproved ? member.deNetworkCode : (member.deNetworkCode ? "DE-•••" : null);
                      const displayPhone = isApproved ? member.phone : "08x-xxx-xxxx";
                      const displayFreq = isApproved ? (member.radioStandby || '145.6750 MHz') : "145.xxx MHz";
                      const displayDistrict = isApproved ? (member.district || 'จ.สงขลา') : "จ.สงขลา";
                      const displayMemberType = isApproved ? (member.memberType || 'สมาชิก') : "สมาชิกสมาคม";

                      return (
                        <tr 
                          key={member.id} 
                          className={`hover:bg-cyan-50/70 transition-colors group ${
                            isEven ? 'bg-white' : 'bg-slate-50/60'
                          }`}
                        >
                          {/* PINNED COLUMN 1: รูปสมาชิก (Sticky Left 0) */}
                          <td className={`py-2.5 px-2 sticky left-0 z-20 text-center w-[68px] min-w-[68px] max-w-[68px] border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.05)] whitespace-nowrap ${
                            isEven ? 'bg-white group-hover:bg-cyan-50/90' : 'bg-slate-50 group-hover:bg-cyan-50/90'
                          }`}>
                            <div 
                              onClick={() => isApproved && setZoomMember(member)}
                              className={`relative inline-block ${isApproved ? 'cursor-pointer group/avatar' : 'cursor-not-allowed'}`}
                              title={isApproved ? "คลิกเพื่อดูรูปภาพขนาดใหญ่เต็มจอและซูมภาพ" : "สงวนสิทธิ์เฉพาะสมาชิกที่ได้รับอนุมัติ"}
                            >
                              <img 
                                src={displayAvatar} 
                                alt={displayFullName} 
                                className={`w-11 h-11 rounded-xl object-cover border-2 border-cyan-400/60 shadow-xs ${
                                  !isApproved ? 'blur-xs opacity-50 grayscale' : 'group-hover/avatar:border-cyan-500 group-hover/avatar:scale-105 transition-transform'
                                }`}
                              />
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                            </div>
                          </td>

                          {/* PINNED COLUMN 2: นามเรียกขาน (Sticky Left 68px) */}
                          <td className={`py-2.5 px-3.5 sticky left-[68px] z-20 border-r-2 border-cyan-400/60 shadow-[4px_0_8px_rgba(0,0,0,0.08)] w-[140px] min-w-[140px] max-w-[140px] whitespace-nowrap ${
                            isEven ? 'bg-white group-hover:bg-cyan-50/90' : 'bg-slate-50 group-hover:bg-cyan-50/90'
                          }`}>
                            <div className="flex flex-col whitespace-nowrap">
                              {member.callsign !== '-' ? (
                                <span className={`font-mono font-bold text-sm tracking-wider whitespace-nowrap ${
                                  !isApproved ? 'blur-xs text-slate-500 select-none' : 'text-slate-900 group-hover:text-cyan-800'
                                }`}>
                                  {displayCallsign}
                                </span>
                              ) : (
                                <span className="font-mono font-extrabold text-xs text-red-700 bg-yellow-300 px-2 py-0.5 rounded-md border border-yellow-500 shadow-2xs whitespace-nowrap inline-flex items-center gap-1 animate-pulse">
                                  รอ Callsign
                                </span>
                              )}
                              {member.role === 'admin' && (
                                <span className="text-[9.5px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded w-fit mt-0.5 whitespace-nowrap shrink-0">
                                  {member.isSuperAdmin ? 'แอดมินหลัก' : 'แอดมิน'}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 3. รหัสเครือข่าย DE */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap min-w-[130px]">
                            {displayDe ? (
                              <button
                                type="button"
                                onClick={() => isApproved && onOpenDeModal && onOpenDeModal()}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono font-bold text-xs whitespace-nowrap shrink-0 flex-nowrap ${
                                  !isApproved ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed blur-xs' : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 transition cursor-pointer'
                                }`}
                                title={isApproved ? "คลิกเพื่อดูรายละเอียดเครือข่าย DE" : "สงวนสิทธิ์เฉพาะสมาชิกที่ได้รับอนุมัติ"}
                              >
                                <Cpu className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                <span className="whitespace-nowrap">{displayDe}</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 font-mono whitespace-nowrap">-</span>
                            )}
                          </td>

                          {/* 4. ชื่อ - นามสกุล */}
                          <td 
                            onClick={() => isApproved && (onOpenProfile ? onOpenProfile(member) : setZoomMember(member))}
                            className={`py-2.5 px-3.5 font-semibold whitespace-nowrap min-w-[300px] ${
                              !isApproved ? 'text-slate-500 blur-xs select-none cursor-not-allowed' : 'text-slate-800 cursor-pointer hover:text-cyan-700 transition'
                            }`}
                            title={isApproved ? "คลิกเพื่อดูโปรไฟล์เพื่อนสมาชิก" : "สงวนสิทธิ์เฉพาะสมาชิกที่ได้รับอนุมัติ"}
                          >
                            <span className="whitespace-nowrap">{displayFullName}</span>
                          </td>

                          {/* 5. ชื่อเล่น */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap min-w-[110px]">
                            {displayNickname ? (
                              <span className={`inline-block px-3 py-0.5 rounded-full font-semibold text-xs border whitespace-nowrap ${
                                !isApproved ? 'bg-slate-100 text-slate-400 border-slate-200 blur-xs' : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                {displayNickname}
                              </span>
                            ) : (
                              <span className="text-slate-400 whitespace-nowrap">-</span>
                            )}
                          </td>

                          {/* 6. ย่านความถี่สแตนด์บาย */}
                          <td className="py-2.5 px-3.5">
                            <div className={`flex flex-col gap-1 max-w-[240px] ${!isApproved ? 'blur-xs select-none' : ''}`}>
                              {/* ความถี่หลัก VHF */}
                              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-800 font-bold whitespace-nowrap">
                                <span className="w-2 h-2 rounded-full bg-cyan-600 shrink-0"></span>
                                <span>{displayFreq}</span>
                                {member.blackRadios?.[0]?.isRepeater && isApproved && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-sans shrink-0">
                                    รีพีทเตอร์
                                  </span>
                                )}
                              </div>
                              {/* POC หรือ CB เพิ่มเติม */}
                              {isApproved && (
                                <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500 font-mono whitespace-nowrap">
                                  {member.pocRadios && member.pocRadios.length > 0 && (
                                    <span className="px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                                      POC: {member.pocRadios[0].talkgroup}
                                    </span>
                                  )}
                                  {member.redRadios && member.redRadios.length > 0 && (
                                    <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                                      CB: {member.redRadios[0].freq.split(' ')[0]}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 7. เบอร์โทรศัพท์ (กดโทรออกได้เลย เฉพาะสมาชิกที่ได้รับอนุมัติ) */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            {isApproved && member.phone ? (
                              <a
                                href={`tel:${member.phone.replace(/\D/g, '')}`}
                                className="inline-flex items-center gap-1.5 text-cyan-800 hover:text-cyan-900 font-mono font-bold hover:underline transition group/tel whitespace-nowrap"
                                title="คลิกเพื่อโทรออกทันที"
                              >
                                <span className="p-1 rounded-md bg-cyan-100 text-cyan-700 group-hover/tel:bg-cyan-600 group-hover/tel:text-white transition shrink-0">
                                  <Phone className="w-3 h-3" />
                                </span>
                                <span>{member.phone}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 font-mono whitespace-nowrap blur-xs select-none">
                                {displayPhone}
                              </span>
                            )}
                          </td>

                          {/* 8. พื้นที่ / QTH */}
                          <td className="py-2.5 px-3.5 text-slate-600 flex items-center gap-1 whitespace-nowrap">
                            <MapPin className="w-3 h-3 text-cyan-600 shrink-0" />
                            <span className={!isApproved ? 'blur-xs select-none' : ''}>{displayDistrict}</span>
                          </td>

                          {/* 9. สถานะภาพ */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            {member.expiryAlert === 'expiring-1m' && isApproved ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-yellow-300 text-red-700 border border-yellow-500 shadow-2xs whitespace-nowrap animate-pulse">
                                ⚠️ รอต่ออายุ (หมดอายุใน 1 เดือน)
                              </span>
                            ) : member.expiryAlert === 'expiring-6m' && isApproved ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
                                ⏳ หมดอายุใน 6 เดือน
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                                member.memberType?.includes('ตลอดชีพ') && isApproved
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                <span>{displayMemberType}</span>
                              </span>
                            )}
                          </td>

                          {/* 10. ติดต่อด่วน (โทร + แชตทักหา) */}
                          <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* ปุ่มโทรออก */}
                              {isApproved && member.phone ? (
                                <a
                                  href={`tel:${member.phone.replace(/\D/g, '')}`}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 transition cursor-pointer"
                                  title={`โทรหา ${member.callsign} (${member.phone})`}
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              ) : null}

                              {/* ปุ่มแชตทักหา */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isApproved) return;
                                  if (!currentUser && onOpenLogin) {
                                    onOpenLogin();
                                    return;
                                  }
                                  onChatWithMember(member);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1 ${
                                  !isApproved 
                                    ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed blur-xs'
                                    : 'bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 text-white cursor-pointer'
                                }`}
                                title={isApproved ? `ส่งข้อความแชตทักหา ${member.callsign}` : "สงวนสิทธิ์เฉพาะสมาชิกที่ได้รับอนุมัติ"}
                                disabled={!isApproved}
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>แชต</span>
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span className="font-mono">แสดง {filteredMembers.length} รายการ จากสมาชิกทั้งหมด {membersList.length} สถานี</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>ข้อมูลอัปเดตแบบเรียลไทม์ตามฐานข้อมูลสมาคมวิทยุสมัครเล่นสมิหลา</span>
              </div>
            </div>
          </div>
        ) : (
          /* ================= VIEW 2: PHOTO CARDS GRID (เห็นหน้าตาชัดเจน) ================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredMembers.map((member) => {
              const displayAvatar = isApproved 
                ? (member.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80")
                : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=20&q=10";
              const displayCallsign = isApproved ? member.callsign : "HS9••••";
              const displayFullName = isApproved ? member.fullName : "สมาชิกลับ (เบลอข้อมูล)";
              const displayNickname = isApproved ? member.nickname : "••••";
              const displayDe = isApproved ? member.deNetworkCode : (member.deNetworkCode ? "DE-•••" : null);
              const displayPhone = isApproved ? member.phone : "08x-xxx-xxxx";
              const displayFreq = isApproved ? (member.radioStandby || '145.6750 MHz') : "145.xxx MHz";
              const displayDistrict = isApproved ? (member.district || 'จ.สงขลา') : "จ.สงขลา";
              const displayMemberType = isApproved ? (member.memberType || 'สมาชิก') : "สมาชิกสมาคม";

              return (
                <div 
                  key={member.id}
                  className="bg-white/95 backdrop-blur-md rounded-2xl border border-cyan-200/80 shadow-sm hover:shadow-xl hover:border-cyan-400 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Photo Banner */}
                    <div 
                      onClick={() => isApproved && setZoomMember(member)}
                      className={`relative h-44 bg-gradient-to-b from-[#012a4a] to-[#01497c] overflow-hidden ${
                        isApproved ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                      title={isApproved ? "คลิกเพื่อดูรูปภาพขนาดใหญ่และซูมภาพ" : "สงวนสิทธิ์เฉพาะสมาชิกที่ได้รับอนุมัติ"}
                    >
                      <img 
                        src={displayAvatar}
                        alt={displayFullName}
                        className={`w-full h-full object-cover ${
                          !isApproved ? 'blur-xs opacity-50 grayscale' : 'group-hover:scale-105 transition-transform duration-500'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        {member.callsign !== '-' ? (
                          <span className={`font-mono font-bold text-xs bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg border shadow ${
                            !isApproved ? 'text-slate-400 border-slate-700 blur-xs select-none' : 'text-amber-300 border-amber-400/40'
                          }`}>
                            {displayCallsign}
                          </span>
                        ) : (
                          <span className="font-mono font-extrabold text-xs text-red-700 bg-yellow-300 px-2.5 py-0.5 rounded-lg border border-yellow-500 shadow animate-pulse">
                            รอ Callsign
                          </span>
                        )}
                        {displayDe && (
                          <span className="text-[10px] font-mono font-bold bg-cyan-900/80 backdrop-blur-md text-cyan-200 px-2 py-0.5 rounded-lg border border-cyan-400/50 flex items-center gap-1 shadow">
                            <Cpu className="w-3 h-3 text-cyan-300" />
                            <span>{displayDe}</span>
                          </span>
                        )}
                      </div>

                      {/* Nickname pill */}
                      {displayNickname && (
                        <div className="absolute bottom-2.5 left-2.5">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-xs shadow-md ${
                            !isApproved ? 'bg-slate-700 text-slate-300 blur-xs' : 'bg-cyan-500/90 text-white'
                          }`}>
                            {displayNickname}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-2">
                      <h3 className={`font-bold text-sm line-clamp-1 transition ${
                        !isApproved ? 'text-slate-500 blur-xs select-none' : 'text-slate-900 group-hover:text-cyan-800'
                      }`}>
                        {displayFullName}
                      </h3>

                      <p className={`text-xs text-slate-500 flex items-center gap-1 font-mono ${!isApproved ? 'blur-xs select-none' : ''}`}>
                        <MapPin className="w-3 h-3 text-cyan-600 shrink-0" />
                        <span>{displayDistrict} • {displayMemberType}</span>
                      </p>

                      <div className="pt-1.5 pb-1 border-t border-slate-100 space-y-1">
                        <div className={`flex items-center justify-between text-xs font-mono ${!isApproved ? 'blur-xs select-none' : ''}`}>
                          <span className="text-slate-400">ความถี่หลัก:</span>
                          <span className="font-bold text-slate-800">{displayFreq}</span>
                        </div>
                        <div className={`flex items-center justify-between text-xs font-mono ${!isApproved ? 'blur-xs select-none' : ''}`}>
                          <span className="text-slate-400">โทรศัพท์:</span>
                          {isApproved && member.phone ? (
                            <a href={`tel:${member.phone.replace(/\D/g, '')}`} className="font-bold text-cyan-700 hover:underline">
                              {member.phone}
                            </a>
                          ) : (
                            <span className="font-bold text-slate-400">{displayPhone}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                    {isApproved && member.phone ? (
                      <a
                        href={`tel:${member.phone.replace(/\D/g, '')}`}
                        className="w-1/2 py-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 hover:border-emerald-500 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>โทรออก</span>
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => {
                        if (!isApproved) return;
                        if (!currentUser && onOpenLogin) {
                          onOpenLogin();
                          return;
                        }
                        onChatWithMember(member);
                      }}
                      className={`${isApproved && member.phone ? 'w-1/2' : 'w-full'} py-2 rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1 ${
                        !isApproved
                          ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed blur-xs'
                          : 'bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 text-white cursor-pointer'
                      }`}
                      disabled={!isApproved}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>แชตทักหา</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

          </div>

          {/* Locked Notice & Status Overlay Card (เฉพาะเมื่อสถานะยังไม่ได้รับการอนุมัติ เช่น รอ Callsign นาย ทดสอบ ระบบ) */}
          {!isApproved && (
            <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-[6px]">
              <div className="relative max-w-xl w-full bg-gradient-to-b from-[#012038] via-[#012a4a] to-[#011424] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400/80 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-400/30 border-2 border-amber-400/60 flex items-center justify-center mx-auto text-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.35)]">
                  <ShieldAlert className="w-9 h-9 text-amber-400" />
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-bold tracking-wide uppercase mb-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>สิทธิ์เฉพาะสมาชิกที่ได้รับอนุมัติแล้วเท่านั้น</span>
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    ข้อมูลสมาชิกทั้งหมดถูกเบลอ & ปิดกั้น
                  </h3>
                  <p className="text-xs sm:text-sm text-cyan-200/90 mt-1 font-light leading-relaxed">
                    ระบบรักษาความปลอดภัยและความเป็นส่วนตัวของเพื่อนสมาชิกสมาคมวิทยุสมัครเล่นสมิหลา
                  </p>
                </div>

                {/* User Current Status Box */}
                <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-cyan-500/40 text-left space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                    <span className="text-slate-400">ชื่อผู้เข้าใช้งาน:</span>
                    <span className="font-bold text-white truncate max-w-[220px]">{currentUser?.fullName || 'ผู้สมัครสมาชิก'}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                    <span className="text-slate-400">สถานะสมาชิกปัจจุบัน:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-yellow-300 text-red-700 font-extrabold text-[11px] border border-yellow-500 animate-pulse">
                      {currentUser?.status || 'รอตรวจสอบ'} ({currentUser?.callsign !== '-' ? currentUser?.callsign : 'รอ Callsign'})
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                    <span className="text-slate-400">รหัสสมาชิก (ชั่วคราว):</span>
                    <span className="font-mono text-cyan-300 font-bold">{currentUser?.memberId || '-'}</span>
                  </div>
                  <p className="text-[11.5px] text-slate-300 leading-relaxed pt-1">
                    ⚠️ ขณะนี้ใบสมัครของคุณอยู่ระหว่างขั้นตอนการตรวจสอบเอกสารและอนุมัติรับรองโดยนายทะเบียนและคณะกรรมการสมาคมฯ 
                    ในระหว่างนี้ข้อมูลรายชื่อ เบอร์โทรศัพท์ และภาพถ่ายเพื่อนสมาชิกทั้งหมดจะถูกปิดกั้นและเบลอไว้ เพื่อรักษาความเป็นส่วนตัวจนกว่าสถานะของคุณจะได้รับการอนุมัติอย่างเป็นทางการ
                  </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  {onOpenReceipt && (
                    <button
                      type="button"
                      onClick={onOpenReceipt}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Receipt className="w-4 h-4 text-emerald-200" />
                      <span>ดูใบเสร็จรับเงิน (e-Receipt)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectTab && onSelectTab('contact')}
                    className="flex-1 py-3 px-4 bg-sky-900/80 hover:bg-sky-800 text-cyan-200 border border-cyan-400/50 font-bold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-cyan-300" />
                    <span>ติดต่อฝ่ายทะเบียนสมาคม</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ================= PHOTO & PROFILE PREVIEW MODAL ================= */}
      {previewPhotoMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div 
            className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-cyan-400 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 bg-slate-900 overflow-hidden">
              <img 
                src={previewPhotoMember.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
                alt={previewPhotoMember.fullName}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPreviewPhotoMember(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="font-mono font-bold text-base bg-black/70 text-amber-300 px-3 py-1 rounded-xl border border-amber-400/50">
                  {previewPhotoMember.callsign}
                </span>
                {previewPhotoMember.nickname && (
                  <span className="px-3 py-1 rounded-full bg-cyan-600 text-white font-bold text-xs shadow">
                    ชื่อเล่น: {previewPhotoMember.nickname}
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{previewPhotoMember.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  เลขสมาชิก: {previewPhotoMember.memberId} • {previewPhotoMember.memberType}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">เครือข่าย DE:</span>
                  <span className="font-bold text-cyan-700">{previewPhotoMember.deNetworkCode || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ความถี่สแตนด์บาย:</span>
                  <span className="font-bold text-slate-800">{previewPhotoMember.radioStandby}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">พื้นที่ QTH:</span>
                  <span className="text-slate-700">{previewPhotoMember.district || 'จ.สงขลา'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">เบอร์โทรศัพท์:</span>
                  <a href={`tel:${previewPhotoMember.phone?.replace(/\D/g, '')}`} className="font-bold text-cyan-700 hover:underline">
                    {previewPhotoMember.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {previewPhotoMember.phone && (
                  <a
                    href={`tel:${previewPhotoMember.phone.replace(/\D/g, '')}`}
                    className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Phone className="w-4 h-4" />
                    <span>โทรออกทันที</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const target = previewPhotoMember;
                    setPreviewPhotoMember(null);
                    if (!currentUser && onOpenLogin) {
                      onOpenLogin();
                      return;
                    }
                    onChatWithMember(target);
                  }}
                  className={`${previewPhotoMember.phone ? 'w-1/2' : 'w-full'} py-2.5 bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>แชตทักหา</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Zoom Modal */}
      <FullPhotoZoomModal
        isOpen={Boolean(zoomMember)}
        onClose={() => setZoomMember(null)}
        member={zoomMember}
        onChatWithMember={onChatWithMember}
        onOpenLogin={onOpenLogin}
        currentUser={currentUser}
      />

    </section>
  );
}
