import React from 'react';
import { Radio, Antenna, MapPin, Info } from 'lucide-react';
import { repeaterList } from '../data/mockData';
import { getSectionTheme, getOverlayGradient } from '../utils/themeUtils';

export default function FrequencySection({ settings }) {
  const theme = getSectionTheme(settings, 'repeaters');
  const bgOpacity = (theme.opacity ?? 25) / 100;
  const overlayClass = getOverlayGradient(theme.overlayType, 'ocean-light');

  return (
    <section id="repeaters" className="py-8 sm:py-14 bg-white border-t border-cyan-100 relative overflow-hidden min-h-[calc(100vh-80px)]">
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

      <div className="relative max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 z-10">
        
        {/* Section Header (เพิ่มแบนเนอร์กระจกเพื่อให้อ่านข้อความชัดเจน ไม่กลืนกับพื้นหลัง) */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-cyan-900 border border-cyan-300 text-xs font-bold mb-2.5 shadow-xs">
            <Antenna className="w-3.5 h-3.5 text-cyan-600" />
            <span>Radio Frequencies & Infrastructure</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight drop-shadow-xs">
            สถานีทวนสัญญาณและข่ายความถี่วิทยุสื่อสาร
          </h2>
          <div className="mt-2.5">
            <p className="inline-block bg-white/90 backdrop-blur-md text-slate-800 text-xs sm:text-sm font-semibold px-4 py-2 rounded-2xl border border-cyan-200/90 shadow-sm leading-relaxed max-w-2xl">
              ข้อมูลความถี่วิทยุสื่อสารเพื่อการติดต่อ ประสานงาน และโครงข่ายสำรองฉุกเฉินในเขตจังหวัดสงขลาและพื้นที่ใกล้เคียง
            </p>
          </div>
        </div>

        {/* Frequencies Grid (ปรับขนาดการ์ดทั้งสามช่องให้กะทัดรัด เล็กลง ไม่ดูอึดอัดบนมือถือ) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 max-w-6xl mx-auto">
          {repeaterList.map((item, index) => (
            <div 
              key={index}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-cyan-200/80 hover:border-cyan-400 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Badge & Icon Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#013a63] to-[#0077b6] text-cyan-200 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Radio className="w-4.5 h-4.5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300/80 px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{item.status}</span>
                  </span>
                </div>

                {/* Title & Location */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-cyan-800 transition line-clamp-1 leading-snug mb-0.5">
                  {item.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1 mb-3 line-clamp-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>{item.location}</span>
                </p>

                {/* Technical Parameters (Compact Box) */}
                <div className="space-y-1.5 bg-slate-50/90 p-2.5 sm:p-3 rounded-xl border border-slate-200 mb-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[11px] sm:text-xs">ความถี่ส่งออก (TX):</span>
                    <span className="font-mono font-black text-cyan-900 text-xs sm:text-sm bg-cyan-100/70 px-2 py-0.5 rounded-md border border-cyan-300/60 shadow-2xs">
                      {item.tx}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] sm:text-xs">
                    <span className="text-slate-500">ช่วงความต่าง (Shift):</span>
                    <span className="font-mono text-slate-700 font-medium">{item.shift}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] sm:text-xs">
                    <span className="text-slate-500">โทนสัญญาณ (Tone):</span>
                    <span className="font-mono font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      {item.tone}
                    </span>
                  </div>
                </div>

                {/* Coverage */}
                <div className="text-[11px] sm:text-xs text-slate-600 leading-relaxed line-clamp-2">
                  <strong className="text-slate-800 font-semibold">พื้นที่ให้บริการ:</strong> {item.coverage}
                </div>
              </div>

              {/* Regulatory Tip */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[10.5px] text-slate-400">
                <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="truncate">ปฏิบัติตามระเบียบ กสทช. และขานนามเรียกขานทุกครั้ง</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
