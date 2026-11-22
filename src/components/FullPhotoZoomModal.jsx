import React, { useState } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Phone, 
  MessageSquare, 
  Cpu, 
  Maximize2,
  Minimize2,
  ShieldCheck,
  Award
} from 'lucide-react';

/**
 * FullPhotoZoomModal
 * Full-resolution lightbox image viewer with zoom controls,
 * click-to-zoom toggle, and member profile quick actions.
 */
export default function FullPhotoZoomModal({ 
  isOpen, 
  onClose, 
  member, 
  onChatWithMember, 
  onOpenLogin, 
  currentUser 
}) {
  const [zoomScale, setZoomScale] = useState(1); // 1 = 100%, 1.5, 2, 2.5, 3

  if (!isOpen || !member) return null;

  const photoUrl = member.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=90";

  const handleZoomIn = () => setZoomScale(prev => Math.min(Number((prev + 0.5).toFixed(1)), 3));
  const handleZoomOut = () => setZoomScale(prev => Math.max(Number((prev - 0.5).toFixed(1)), 1));
  const handleResetZoom = () => setZoomScale(1);
  const handleToggleZoom = () => setZoomScale(prev => prev > 1 ? 1 : 2);

  return (
    <div 
      className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* ================= TOP CONTROLS BAR ================= */}
      <div 
        className="flex items-center justify-between text-white z-20 gap-2 flex-wrap"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Member Callsign & DE Code Badge */}
        <div className="flex items-center gap-2">
          {member.callsign && member.callsign !== '-' ? (
            <span className="font-mono font-bold text-sm sm:text-base text-amber-300 bg-white/10 px-3 py-1 rounded-xl border border-amber-400/50 shadow">
              {member.callsign}
            </span>
          ) : (
            <span className="font-mono font-extrabold text-xs sm:text-sm text-red-700 bg-yellow-300 px-3 py-1 rounded-xl border border-yellow-500 shadow">
              รอ Callsign
            </span>
          )}

          {member.deNetworkCode && (
            <span className="font-mono font-bold text-xs bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-xl border border-cyan-400/40 flex items-center gap-1 shadow">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>{member.deNetworkCode}</span>
            </span>
          )}

          {member.isSuperAdmin ? (
            <span className="text-[10px] bg-sky-500/30 text-sky-200 font-bold px-2 py-0.5 rounded-lg border border-sky-400/40">
              แอดมินหลัก
            </span>
          ) : member.role === 'admin' ? (
            <span className="text-[10px] bg-amber-500/30 text-amber-200 font-bold px-2 py-0.5 rounded-lg border border-amber-400/40">
              แอดมิน
            </span>
          ) : null}
        </div>

        {/* Zoom In/Out Toolbar */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-lg">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomScale <= 1}
            className="p-1.5 sm:px-2.5 rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition text-white cursor-pointer"
            title="ย่อขนาดรูปภาพ (ซูมออก)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="font-mono text-xs px-2 font-bold text-cyan-300 min-w-[50px] text-center">
            {Math.round(zoomScale * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomScale >= 3}
            className="p-1.5 sm:px-2.5 rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition text-white cursor-pointer"
            title="ขยายขนาดรูปภาพ (ซูมเข้า)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {zoomScale > 1 ? (
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 sm:px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1"
              title="รีเซ็ตขนาดปกติ 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">100%</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleToggleZoom}
              className="p-1.5 sm:px-2 rounded-lg hover:bg-white/20 text-cyan-300 text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1"
              title="แตะเพื่อซูม 200%"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ซูม 2x</span>
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-rose-600 text-white transition cursor-pointer shadow-md"
          title="ปิดหน้าต่างรูปภาพ (X)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ================= MAIN ZOOMABLE IMAGE AREA ================= */}
      <div 
        className="flex-1 flex items-center justify-center overflow-auto my-3 p-2 relative"
        onClick={onClose}
      >
        <div 
          className="relative transition-transform duration-200 cursor-pointer select-none"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleZoom();
          }}
          style={{ transform: `scale(${zoomScale})` }}
          title={zoomScale > 1 ? "คลิกเพื่อย่อกลับขนาดเดิม 100%" : "คลิกเพื่อขยายซูมรูปภาพ 200%"}
        >
          <img
            src={photoUrl}
            alt={member.fullName}
            className="max-h-[66vh] max-w-[88vw] object-contain rounded-2xl shadow-2xl border-2 border-white/30"
          />
          {zoomScale === 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5 opacity-80 hover:opacity-100 transition">
              <ZoomIn className="w-3.5 h-3.5 text-cyan-300" />
              <span>แตะเพื่อซูมภาพ</span>
            </div>
          )}
        </div>
      </div>

      {/* ================= BOTTOM MEMBER CAPTION & ACTIONS BAR ================= */}
      <div 
        className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white max-w-2xl mx-auto w-full z-20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={photoUrl}
            alt="avatar"
            className="w-12 h-12 rounded-xl object-cover border-2 border-cyan-400 shrink-0 shadow-xs"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm sm:text-base text-white truncate">
              {member.fullName}
              {member.nickname && (
                <span className="text-cyan-300 font-semibold ml-2">({member.nickname})</span>
              )}
            </h4>
            <p className="text-xs text-slate-300 font-mono mt-0.5 truncate">
              รหัสสมาชิก: #{member.memberId} • {member.memberType} • QTH: {member.district || 'จ.สงขลา'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {member.phone && (
            <a
              href={`tel:${member.phone.replace(/\D/g, '')}`}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow cursor-pointer whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>โทร {member.phone}</span>
            </a>
          )}
          {onChatWithMember && (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (!currentUser && onOpenLogin) {
                  onOpenLogin();
                  return;
                }
                onChatWithMember(member);
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow cursor-pointer whitespace-nowrap"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>แชตทักหา</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
