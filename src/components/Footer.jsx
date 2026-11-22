import React from 'react';
import AssociationLogo from './AssociationLogo';
import DeveloperCredit from './DeveloperCredit';
import { 
  Radio, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  ShieldCheck, 
  Heart
} from 'lucide-react';
import { getSectionTheme, getOverlayGradient } from '../utils/themeUtils';

export default function Footer({ settings, onOpenLogin, onOpenRegister }) {
  const theme = getSectionTheme(settings, 'contact');
  const bgOpacity = (theme.opacity ?? 45) / 100;
  const overlayClass = getOverlayGradient(theme.overlayType, 'ocean-footer');

  return (
    <footer id="contact" className="relative bg-gradient-to-b from-[#012440] via-[#011a2f] to-[#011220] text-slate-300 border-t-4 border-cyan-400 overflow-hidden">
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

      {/* Decorative Wave Divider at Top of Footer */}
      <div className="relative w-full overflow-hidden leading-none z-10 pointer-events-none -mt-[1px]">
        <svg className="relative block w-full h-3 sm:h-5 text-cyan-400" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,40 L1200,0 L0,0 Z" fill="#00b4d8" opacity="0.3" />
        </svg>
      </div>

      {/* Top Footer Banner */}
      <div className="relative z-10 border-b border-cyan-500/30 bg-gradient-to-r from-[#013554]/90 via-[#01497c]/90 to-[#012a4a]/90 py-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <AssociationLogo customUrl={settings.customLogoUrl} className="w-16 h-16 shrink-0 shadow-lg ring-2 ring-cyan-400/40 rounded-full" />
            <div>
              <h3 className="text-white font-bold text-lg leading-snug drop-shadow-sm">
                {settings.associationNameTh}
              </h3>
              <p className="text-xs text-cyan-300 font-mono">
                CALLSIGN: {settings.officialCallsign} • SAMILA AMATEUR RADIO ASSOCIATION SONGKHLA
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenRegister}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-bold text-xs sm:text-sm transition shadow-md hover:shadow-amber-400/30"
            >
              สมัครสมาชิกสมาคมฯ
            </button>
            <button
              onClick={onOpenLogin}
              className="px-5 py-2.5 rounded-xl bg-[#012440]/90 hover:bg-[#013259] text-cyan-100 font-medium text-xs sm:text-sm border border-cyan-400/50 transition shadow-sm hover:border-cyan-300"
            >
              เข้าสู่ระบบสมาชิก
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          
          {/* Col 1: About */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              เกี่ยวกับสมาคมฯ
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา เป็นองค์กรรวมกลุ่มของนักวิทยุสมัครเล่นในพื้นที่จังหวัดสงขลา ดำเนินกิจกรรมเพื่อพัฒนาทักษะการติดต่อสื่อสาร และเป็นข่ายสื่อสารสำรองสนับสนุนหน่วยงานราชการยามเกิดภัยพิบัติ
            </p>
            <div className="pt-2 text-xs text-sky-400 space-y-1">
              <p>📡 <strong>ความถี่เรียกขาน:</strong> {settings.radioFrequencyCalling}</p>
              <p>🏔️ <strong>Repeater:</strong> 145.6750 MHz (Dup -600k)</p>
            </div>
          </div>

          {/* Col 2: Contact */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              ที่ตั้งและช่องทางติดต่อ
            </h4>
            <ul className="space-y-3 text-xs text-slate-300 font-light">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{settings.contactPhone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{settings.contactEmail}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-mono text-amber-300">Net Control: ทุกวันพุธ 19.30 น.</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Emergency Network Partners */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              เครือข่ายความร่วมมือ
            </h4>
            <p className="text-xs text-slate-400 font-light">
              ประสานการปฏิบัติร่วมกับ:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <span>สำนักงาน กสทช. ภาค 4 (สงขลา)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ปภ. จังหวัดสงขลา (ศูนย์เตือนภัย)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>มูลนิธิมิตรภาพสามัคคี (ท่งเซียเซี่ยงตึ๊ง)</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-[#040f1d] py-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © 2568 {settings.associationNameTh} ({settings.officialCallsign}). สงวนลิขสิทธิ์ทั้งหมด
          </p>
          <p className="flex items-center gap-1 text-[11px]">
            <span>ออกแบบสำหรับกิจการวิทยุสมัครเล่นจังหวัดสงขลา</span>
          </p>
        </div>
      </div>
      {/* Developer Credit Signature Bar */}
      <DeveloperCredit variant="dark" />
    </footer>
  );
}
