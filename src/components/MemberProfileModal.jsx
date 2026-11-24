import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MessageSquare, 
  Radio, 
  Cpu, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Award, 
  User, 
  Receipt,
  FileText,
  Sparkles,
  ExternalLink,
  ZoomIn,
  Edit3
} from 'lucide-react';
import DeveloperCredit from './DeveloperCredit';
import FullPhotoZoomModal from './FullPhotoZoomModal';

export default function MemberProfileModal({ 
  isOpen, 
  onClose, 
  member, 
  onChatWithMember,
  currentUser,
  onOpenLogin,
  onOpenDeModal,
  onOpenReceipt,
  onOpenCertificate,
  onOpenEditProfile
}) {
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  if (!isOpen || !member) return null;

  return (
    <>
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 pt-[max(calc(env(safe-area-inset-top,0px)+12px),24px)] pb-4 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-cyan-400/80 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Image & Badges */}
        <div 
          onClick={() => setIsZoomModalOpen(true)}
          className="relative h-56 sm:h-64 bg-gradient-to-b from-[#012a4a] via-[#01497c] to-[#013a63] overflow-hidden cursor-pointer group/hero"
          title="แตะเพื่อดูรูปภาพขนาดเต็มและซูมรูปภาพ"
        >
          <img 
            src={member.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
            alt={member.fullName}
            className="w-full h-full object-cover object-center group-hover/hero:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20" />

          {/* Zoom hint badge */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomModalOpen(true);
            }}
            className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 hover:bg-cyan-600 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/30 flex items-center gap-1.5 transition cursor-pointer shadow-md z-10"
            title="คลิกเพื่อขยายดูรูปภาพขนาดเต็มและซูม"
          >
            <ZoomIn className="w-3.5 h-3.5 text-cyan-300" />
            <span>แตะเพื่อดูรูปเต็ม & ซูม</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black text-white transition cursor-pointer z-10"
            title="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Indicators */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white font-mono text-xs font-bold flex items-center gap-1 shadow">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{member.memberStatus || 'ปกติ (Active)'}</span>
            </span>
            {member.role === 'admin' && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs shadow flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{member.isSuperAdmin ? 'แอดมินหลัก' : 'แอดมิน'}</span>
              </span>
            )}
          </div>

          {/* Bottom Callout in Hero */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {member.callsign !== '-' ? (
                  <span className="font-mono font-bold text-xl sm:text-2xl text-amber-300 drop-shadow-md tracking-wider">
                    {member.callsign}
                  </span>
                ) : (
                  <span className="font-mono font-extrabold text-sm sm:text-base text-red-700 bg-yellow-300 px-3 py-1 rounded-xl border border-yellow-500 shadow-md animate-pulse">
                    รอ Callsign
                  </span>
                )}
                {member.nickname && (
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/90 text-white font-bold text-xs shadow-md">
                    {member.nickname}
                  </span>
                )}
                {member.deNetworkCode && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenDeModal) onOpenDeModal();
                    }}
                    className="px-2 py-0.5 rounded-md bg-cyan-900/90 border border-cyan-400/60 text-cyan-200 font-mono font-bold text-xs flex items-center gap-1 shadow hover:bg-cyan-800 transition cursor-pointer"
                    title="คลิกเพื่อดูข้อมูลเครือข่าย DE"
                  >
                    <Cpu className="w-3 h-3 text-cyan-300" />
                    <span>{member.deNetworkCode}</span>
                  </button>
                )}
              </div>
              <h3 className="text-white font-bold text-base sm:text-lg drop-shadow mt-0.5">
                {member.fullName}
              </h3>
            </div>
          </div>
        </div>

        {/* Profile Details Content */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50 text-slate-800 text-xs sm:text-sm">
          
          {/* Section 1: Member Basic Info */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-900 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Award className="w-3.5 h-3.5 text-cyan-600" />
              <span>ข้อมูลสถานะสมาชิกสมาคมฯ</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[11px]">รหัสสมาชิก:</span>
                <span className="font-bold text-slate-800">{member.memberId || '369113'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">ประเภทสมาชิก:</span>
                <span className="font-bold text-cyan-700">{member.memberType || 'สมาชิกสามัญ 5 ปี'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">วันเริ่มต้นสมาชิกภาพ:</span>
                <span className="text-slate-700">{member.startDate || '16-11-2569'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">วันสิ้นสุดสมาชิกภาพ:</span>
                <span className="text-slate-700">{member.endDate || '15-11-2574'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: 3-Radio Standby Frequencies */}
          <div className="p-3.5 bg-white rounded-xl border border-cyan-200 shadow-2xs space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-900 flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-600" />
                <span>ช่องความถี่สแตนด์บาย 3 อุปกรณ์</span>
              </div>
              <span className="text-[10px] text-cyan-700 font-mono font-normal">
                ความถี่หลัก: {member.radioStandby || '145.6750 MHz'}
              </span>
            </h4>

            {/* 1. วิทยุเครื่องดำ VHF */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-600" />
                  <span>วิทยุเครื่องดำ (VHF 144-147 MHz):</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 font-mono text-xs pl-3">
                {member.blackRadios && member.blackRadios.length > 0 ? (
                  member.blackRadios.map((br, idx) => (
                    <span 
                      key={idx} 
                      className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                        br.isRepeater 
                          ? 'bg-amber-50 text-amber-900 border-amber-300' 
                          : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                      }`}
                    >
                      {br.freq} {br.isRepeater ? '(รีพีทเตอร์ HS9AS)' : ''}
                    </span>
                  ))
                ) : (
                  <span className="px-2 py-0.5 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px] font-bold">
                    {member.radioStandby || '145.6750 MHz'}
                  </span>
                )}
              </div>
            </div>

            {/* 2. วิทยุ POC Radio */}
            {member.pocRadios && member.pocRadios.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-100">
                <span className="font-bold text-slate-700 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>วิทยุ POC Radio:</span>
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono text-xs pl-3">
                  {member.pocRadios.map((poc, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-[11px]">
                      {poc.talkgroup} • {poc.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 3. วิทยุเครื่องแดง CB 245 */}
            {member.redRadios && member.redRadios.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-100">
                <span className="font-bold text-slate-700 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>วิทยุเครื่องแดง (CB 245 MHz):</span>
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono text-xs pl-3">
                  {member.redRadios.map((rr, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-[11px]">
                      {rr.freq}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Contact & QTH Location */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-cyan-600" />
              <span>การติดต่อและพื้นที่พำนัก (QTH)</span>
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 shrink-0">พื้นที่ / อำเภอ:</span>
                <span className="font-bold text-slate-800 text-right">{member.district || 'จ.สงขลา'}</span>
              </div>
              {member.phone && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">เบอร์โทรศัพท์:</span>
                  <a 
                    href={`tel:${member.phone.replace(/\D/g, '')}`} 
                    className="font-bold font-mono text-cyan-700 hover:text-cyan-900 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{member.phone}</span>
                  </a>
                </div>
              )}
              {member.currentAddress && (
                <div className="flex items-start justify-between gap-2 pt-1">
                  <span className="text-slate-500 shrink-0">ที่อยู่ตามทะเบียน:</span>
                  <span className="text-slate-700 text-right max-w-xs">{member.currentAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Member Documents (Receipt & Certificate) */}
          <div className="p-3 bg-gradient-to-r from-sky-50 to-slate-50 rounded-xl border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <span className="text-xs font-bold text-sky-950 block">เอกสารประจำตัวสมาชิกสมาคม</span>
              <span className="text-[10.5px] text-slate-500 block">ใบเสร็จรับเงินอย่างเป็นทางการ & หนังสือรับรอง</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenReceipt) onOpenReceipt(member);
                }}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer transition"
                title="เปิดดูใบเสร็จรับเงินอย่างเป็นทางการ"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>ใบเสร็จ e-Receipt</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenCertificate) onOpenCertificate(member);
                }}
                className="px-2.5 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer transition"
                title="เปิดดูหนังสือรับรองสมาชิก"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>หนังสือรับรอง</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex flex-col gap-2">
          {currentUser && ((currentUser.id && currentUser.id === member.id) || (currentUser.citizenId && currentUser.citizenId === member.citizenId)) && onOpenEditProfile && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEditProfile();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>✏️ แก้ไขข้อมูลส่วนตัวของฉัน / เปลี่ยนรูปโปรไฟล์</span>
            </button>
          )}

          <div className="flex items-center gap-2 w-full">
            {member.phone && (
              <a
                href={`tel:${member.phone.replace(/\D/g, '')}`}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>โทรออกทันที</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                if (!currentUser && onOpenLogin) {
                  onOpenLogin();
                  return;
                }
                if (onChatWithMember) {
                  onChatWithMember(member);
                }
              }}
              className={`${member.phone ? 'flex-1' : 'w-full'} py-2.5 bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>เปิดแชตทักหา</span>
            </button>
          </div>
        </div>

        {/* Developer Credit Signature Line */}
        <DeveloperCredit variant="light" />
      </div>
    </div>

    {/* Full Photo Zoom Modal */}
    <FullPhotoZoomModal
      isOpen={isZoomModalOpen}
      onClose={() => setIsZoomModalOpen(false)}
      member={member}
      onChatWithMember={onChatWithMember}
      onOpenLogin={onOpenLogin}
      currentUser={currentUser}
    />
    </>
  );
}
