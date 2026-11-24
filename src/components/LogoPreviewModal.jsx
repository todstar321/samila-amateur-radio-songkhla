import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import AssociationLogo from './AssociationLogo';

/**
 * LogoPreviewModal
 * Displays the association logo in high resolution with download and copy options.
 * Triggered whenever a user clicks on the association logo anywhere on the website.
 */
export default function LogoPreviewModal({ 
  isOpen, 
  onClose, 
  logoUrl, 
  settings 
}) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const currentLogo = logoUrl || settings?.customLogoUrl || '';
  const associationNameTh = settings?.associationNameTh || 'สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา';
  const associationNameEn = settings?.associationNameEn || 'SAMILA AMATEUR RADIO ASSOCIATION';
  const officialCallsign = settings?.officialCallsign || 'HS9AS';

  // Handle Download Logo as PNG
  const handleDownloadLogo = async () => {
    setIsDownloading(true);
    try {
      if (currentLogo && currentLogo.startsWith('http')) {
        // Fetch image as blob to force download
        const response = await fetch(currentLogo, { mode: 'cors' });
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `โลโก้_${officialCallsign}_${associationNameTh.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } else {
        // Official Vector SVG Emblem: convert to canvas and download high-res PNG
        const svgElement = document.getElementById('samila-modal-official-emblem');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const URL = window.URL || window.webkitURL || window;
          const blobURL = URL.createObjectURL(svgBlob);
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 800;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 800, 800);
            canvas.toBlob((pngBlob) => {
              const pngUrl = URL.createObjectURL(pngBlob);
              const link = document.createElement('a');
              link.href = pngUrl;
              link.download = `ตราสัญลักษณ์_${officialCallsign}_ทางการ.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(pngUrl);
            }, 'image/png');
          };
          img.src = blobURL;
        } else {
          window.open(currentLogo, '_blank');
        }
      }
    } catch (err) {
      console.warn('Direct blob download failed, falling back to open in tab:', err);
      if (currentLogo) {
        window.open(currentLogo, '_blank');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Copy Image Link
  const handleCopyLink = () => {
    if (currentLogo && currentLogo.startsWith('http')) {
      navigator.clipboard.writeText(currentLogo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[150] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 pt-[max(calc(env(safe-area-inset-top,0px)+16px),24px)] pb-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-b from-slate-900 via-[#071d33] to-[#011424] border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-white space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white leading-tight">
                ตราสัญลักษณ์สมาคมฯ
              </h3>
              <p className="text-[11px] text-sky-300 font-mono">
                {officialCallsign} • {associationNameEn}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="ปิดหน้าต่าง (X)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center: High-Resolution Pure Circular Logo (NO artificial borders) */}
        <div className="flex flex-col items-center justify-center py-2 space-y-3">
          <div className="relative group w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden shadow-2xl flex items-center justify-center bg-transparent">
            {currentLogo ? (
              <img
                src={currentLogo}
                alt="ตราสัญลักษณ์สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา"
                className="w-full h-full object-cover rounded-full select-none"
              />
            ) : (
              <div id="samila-modal-official-emblem" className="w-full h-full">
                <AssociationLogo 
                  className="w-full h-full rounded-full" 
                  clickable={false} 
                />
              </div>
            )}
          </div>

          <div className="text-center space-y-1">
            <h4 className="font-bold text-sm sm:text-base text-white">
              {associationNameTh}
            </h4>
            <span className="inline-block px-3 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 font-mono text-[11px] font-semibold">
              {currentLogo ? 'ตราสัญลักษณ์ภาพถ่าย (Custom Logo)' : 'Official Vector Emblem'}
            </span>
          </div>
        </div>

        {/* Mobile-Friendly Hint */}
        <div className="p-2.5 bg-slate-800/80 border border-slate-700/70 rounded-xl text-[11.5px] text-slate-300 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            บนสมาร์ตโฟน: สามารถแตะค้างที่รูปภาพเพื่อเลือก <strong>"บันทึกรูปภาพ"</strong> หรือ <strong>"แชร์"</strong> ได้ทันที
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleDownloadLogo}
            disabled={isDownloading}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'กำลังดาวน์โหลดรูปภาพ...' : '💾 ดาวน์โหลด / บันทึกรูปภาพลงเครื่อง'}</span>
          </button>

          {currentLogo && currentLogo.startsWith('http') && (
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2 text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">คัดลอกลิงก์สำเร็จ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>คัดลอกลิงก์ URL รูปภาพ</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs text-center transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
