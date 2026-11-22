import React from 'react';
import { 
  UserPlus, 
  Search, 
  FileCheck2, 
  DownloadCloud, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { getSectionTheme, getOverlayGradient } from '../utils/themeUtils';

export default function QuickServicesSection({ settings, onOpenRegister, onCheckMemberClick }) {
  const theme = getSectionTheme(settings, 'services');
  const bgOpacity = (theme.opacity ?? 20) / 100;
  const overlayClass = getOverlayGradient(theme.overlayType, 'ocean-light');

  const services = [
    {
      icon: <UserPlus className="w-7 h-7 text-sky-700" />,
      title: "สมัครสมาชิกสมาคมฯ",
      description: "ร่วมเป็นส่วนหนึ่งของเครือข่ายนักวิทยุสมัครเล่นสมิหลา สมาชิกสามัญและสมาชิกตลอดชีพ พร้อมรับสิทธิประโยชน์มากมาย",
      actionText: "ลงทะเบียนออนไลน์",
      action: onOpenRegister,
      badge: "เปิดรับสมัครตลอดปี"
    },
    {
      icon: <Search className="w-7 h-7 text-sky-700" />,
      title: "ตรวจสอบสถานะสมาชิก & Callsign",
      description: "ระบบค้นหาและตรวจสอบสถานะสมาชิกสมาคมฯ สัญญาณเรียกขาน และความถูกต้องของใบอนุญาต กสทช.",
      actionText: "ตรวจสอบสถานะ",
      action: onCheckMemberClick,
      badge: "ระบบออนไลน์"
    },
    {
      icon: <FileCheck2 className="w-7 h-7 text-sky-700" />,
      title: "บริการงานทะเบียน กสทช.",
      description: "ศูนย์ประสานงานยื่นคำขอรับใบอนุญาตตั้งสถานี มีใช้ นำเข้า พกพาวิทยุสื่อสาร และต่ออายุบัตรพนักงานฯ",
      actionText: "ดูขั้นตอนการยื่น",
      action: () => alert("ศูนย์ประสานงาน กสทช. ของสมาคมฯ เปิดให้บริการวันจันทร์-ศุกร์ เวลา 09.00 - 16.30 น."),
      badge: "บริการให้คำปรึกษา"
    },
    {
      icon: <DownloadCloud className="w-7 h-7 text-sky-700" />,
      title: "ดาวน์โหลดเอกสาร & แบบฟอร์ม",
      description: "แบบคำขอสมัครสมาชิก, หนังสือมอบอำนาจ, ข้อสอบจำลอง กสทช. ขั้นต้น และระเบียบข้อบังคับสมาคมฯ",
      actionText: "ศูนย์ดาวน์โหลด",
      action: () => alert("เปิดดาวน์โหลดแบบฟอร์ม PDF สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา"),
      badge: "ฟรีสำหรับสมาชิก"
    }
  ];

  return (
    <section id="services" className="py-12 sm:py-20 bg-slate-100 relative overflow-hidden min-h-[calc(100vh-80px)]">
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-sky-700 font-bold text-xs uppercase tracking-wider">
            Online Member Services
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            บริการสำหรับสมาชิกและผู้สนใจ
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            ความสะดวก รวดเร็ว โปร่งใส เพื่อส่งเสริมกิจการวิทยุสมัครเล่นจังหวัดสงขลา
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-sky-50 flex items-center justify-center group-hover:bg-sky-700 group-hover:text-white transition duration-300">
                    {srv.icon}
                  </div>
                  <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                    {srv.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition">
                  {srv.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-light">
                  {srv.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={srv.action}
                  className="w-full inline-flex items-center justify-between text-xs font-semibold text-sky-700 group-hover:text-sky-900 cursor-pointer"
                >
                  <span>{srv.actionText}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Songkhla Ham Radio Pride Banner */}
        <div className="mt-12 bg-white rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block text-sm">
                สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา จดทะเบียนถูกต้องตามกฎหมาย
              </span>
              <span className="text-slate-500">
                ได้รับอนุญาตจากสำนักงาน กสทช. ในการประสานงานและบริหารจัดการสถานีทวนสัญญาณ HS9AS
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" /> รับรองโดย กสทช.
          </div>
        </div>

      </div>
    </section>
  );
}
