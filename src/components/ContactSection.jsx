import React from 'react';
import AssociationLogo from './AssociationLogo';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Radio, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  MessageSquare,
  Users,
  Award,
  Globe
} from 'lucide-react';
import { getSectionTheme, getOverlayGradient } from '../utils/themeUtils';

export default function ContactSection({ settings, onOpenLogin, onOpenRegister }) {
  const theme = getSectionTheme(settings, 'contact');
  const bgOpacity = (theme.opacity ?? 45) / 100;
  const overlayClass = getOverlayGradient(theme.overlayType, 'ocean-light');

  return (
    <section id="contact-page" className="py-10 sm:py-16 bg-[#011e38] relative overflow-hidden min-h-[calc(100vh-80px)] flex flex-col justify-between">
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
      <div className="absolute inset-0 bg-gradient-to-b from-[#012038]/90 via-[#012a4a]/92 to-[#011424]/95 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full flex-grow">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-cyan-200 text-xs font-bold mb-3 shadow-sm">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>ศูนย์ควบคุมข่ายประสานงาน • HS9AS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-md tracking-tight">
            ติดต่อสมาคมวิทยุสมัครเล่นสมิหลา
          </h2>
          <p className="text-cyan-200/90 text-xs sm:text-base mt-2 drop-shadow-sm font-medium">
            ศูนย์ประสานงานนักวิทยุสมัครเล่นจังหวัดสงขลา และข่ายสื่อสารสำรองสนับสนุนการแพทย์ฉุกเฉินและสาธารณภัย
          </p>
        </div>

        {/* Contact Cards Grid (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: สำนักงานสมาคม */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-md hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-800 mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              ที่ตั้งสำนักงานสมาคม
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
              {settings.address || 'เลขที่ 5 ซอย 5 ถ.รามวิถี ต.บ่อยาง อ.เมืองสงขลา จ.สงขลา 90000'}
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-sky-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>วันจันทร์ - ศุกร์ 09:00 - 16:30 น.</span>
              </span>
            </div>
          </div>

          {/* Card 2: ช่องทางวิทยุสื่อสาร & ความถี่ */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-md hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-800 mb-4">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              ความถี่สแตนด์บาย & รีพีทเตอร์
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700">
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium">ความถี่เรียกขาน:</span>
                <strong className="font-mono text-cyan-800">{settings.radioFrequencyCalling || '145.000 MHz'}</strong>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium">Repeater เขาคอหงส์:</span>
                <strong className="font-mono text-sky-800">145.6750 MHz (Dup -600k)</strong>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium">Net Control:</span>
                <strong className="text-amber-700 text-xs">ทุกวันพุธ 19.30 น.</strong>
              </div>
            </div>
          </div>

          {/* Card 3: ฝ่ายทะเบียน & ติดต่อด่วน */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-md hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 mb-4">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              ติดต่อฝ่ายทะเบียน & แอดมิน
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700">
              <div>
                <span className="text-slate-500 block text-[11px]">โทรศัพท์ประสานงานหลัก:</span>
                <a href="tel:093-792-5665" className="font-bold text-emerald-800 hover:text-emerald-900 text-sm flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>093-792-5665 (ผอ.โต๊ด)</span>
                </a>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">อีเมลติดต่อ:</span>
                <a href={`mailto:${settings.contactEmail || settings.email || 'samila.radio@gmail.com'}`} className="text-slate-700 hover:text-sky-700 flex items-center gap-1.5 mt-0.5 font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{settings.contactEmail || settings.email || 'samila.radio@gmail.com'}</span>
                </a>
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="flex-1 py-1.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 text-slate-950 font-bold rounded-xl text-xs shadow-xs cursor-pointer text-center"
                >
                  สมัครสมาชิก
                </button>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs shadow-xs cursor-pointer text-center"
                >
                  เข้าสู่ระบบ
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Network Partners & Collaboration Box */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
            <div>
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>เครือข่ายความร่วมมือและองค์กรพันธมิตร</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                ประสานงานร่วมกันเพื่อความปลอดภัยในชีวิตและทรัพย์สินของพี่น้องประชาชนในพื้นที่สงขลา
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-xs text-slate-200">สำนักงาน กสทช. ภาค 4 (สงขลา)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-slate-200">ปภ. จังหวัดสงขลา (ศูนย์เตือนภัย)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-200">มูลนิธิมิตรภาพสามัคคี (ท่งเซียเซี่ยงตึ๊ง)</span>
            </div>
          </div>
        </div>

        {/* Association Executive Highlight */}
        <div className="bg-gradient-to-r from-[#012038] via-[#013a63] to-[#012644] text-white rounded-2xl p-6 sm:p-7 border border-cyan-400/40 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4 text-center md:text-left">
            <AssociationLogo customUrl={settings.customLogoUrl} className="w-16 h-16 shrink-0 rounded-full ring-2 ring-cyan-300 shadow-md" />
            <div>
              <h4 className="text-lg font-bold text-white">
                {settings.associationNameTh}
              </h4>
              <p className="text-xs text-cyan-300 font-mono mt-0.5">
                SAMILA AMATEUR RADIO ASSOCIATION SONGKHLA • HS9AS
              </p>
              <p className="text-xs text-slate-300 font-light mt-1">
                มิตรภาพไร้พรมแดน สื่อสารเพื่อสาธารณประโยชน์ ข่ายสำรองฉุกเฉินยามภัยพิบัติ
              </p>
            </div>
          </div>

          <div className="text-center md:text-right shrink-0">
            <span className="text-[11px] text-cyan-200 block font-light">ฝ่ายพัฒนาระบบและนายทะเบียน:</span>
            <span className="text-sm font-bold text-amber-300 block">ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด) • E26ECG</span>
            <span className="text-xs font-mono text-cyan-400 block mt-0.5">โทร: 093-792-5665</span>
          </div>
        </div>

      </div>

      {/* Bottom Copyright & Developer Credit Section strictly inside Contact */}
      <div className="relative z-10 w-full mt-auto">
        <div className="bg-[#020d18] py-4 border-t border-slate-800 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2568 {settings.associationNameTh} ({settings.officialCallsign}). สงวนลิขสิทธิ์ทั้งหมด</p>
            <p className="text-[11px] text-slate-400">ออกแบบสำหรับกิจการวิทยุสมัครเล่นจังหวัดสงขลา</p>
          </div>
        </div>
      </div>
    </section>
  );
}
