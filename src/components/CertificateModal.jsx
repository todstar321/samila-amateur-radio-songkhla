import React, { useState, useRef, useEffect } from 'react';
import { X, Printer, Download, Award, FileCheck, CheckCircle2 } from 'lucide-react';
import DocumentExportModal from './DocumentExportModal';
import { captureElementToDataUrl } from '../utils/documentExportUtils';
import { generateCertificateSvg, getActiveTemplateBg } from '../utils/documentSvgGenerators';
import { DEFAULT_CERT_TEMPLATE_BASE64 } from '../assets/defaultTemplates';
import savedLayoutSettings from '../data/savedLayoutSettings.json' with { type: 'json' };

export default function CertificateModal({ isOpen, onClose, member, settings }) {
  const printRef = useRef(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportedImageUri, setExportedImageUri] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load Certificate Layout & Background from localStorage / savedLayoutSettings
  const [positions, setPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_certificate_layout_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return savedLayoutSettings?.certificate || {};
  });

  const [bgTemplate, setBgTemplate] = useState(() => {
    return getActiveTemplateBg('certificate', DEFAULT_CERT_TEMPLATE_BASE64);
  });

  useEffect(() => {
    if (!isOpen) return;
    try {
      const savedPos = localStorage.getItem('samila_certificate_layout_v2');
      if (savedPos) setPositions(JSON.parse(savedPos));
      const savedBgs = localStorage.getItem('samila_doc_template_backgrounds_v1');
      if (savedBgs) {
        const parsed = JSON.parse(savedBgs);
        if (parsed.certificate && parsed.certificate.startsWith('data:image')) {
          setBgTemplate(parsed.certificate);
        }
      }
    } catch (e) {}
  }, [isOpen]);

  if (!isOpen || !member) return null;

  const activeMember = {
    ...member,
    memberId: member.memberId || '30001'
  };

  // Generate crisp SVG based on Document Studio layout coordinates & background
  const certSvg = generateCertificateSvg(activeMember, {
    positions,
    templateBackground: bgTemplate
  });

  const safeName = (activeMember.fullName || 'สมาชิก').replace(/[\s/\\:*?"<>|]/g, '_');
  const filename = `03_หนังสือรับรองสถานะสมาชิก_${safeName}_${activeMember.callsign || activeMember.memberId}.png`;

  // Direct PNG Download
  const handleDownloadPng = () => {
    setIsDownloading(true);
    try {
      const svgBlob = new Blob([certSvg], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 1552;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1200, 1552);
        ctx.drawImage(image, 0, 0, 1200, 1552);

        const pngDataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngDataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobURL);
        setIsDownloading(false);
      };

      image.onerror = () => {
        const link = document.createElement('a');
        link.href = blobURL;
        link.download = filename.replace('.png', '.svg');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsDownloading(false);
      };

      image.src = blobURL;
    } catch (err) {
      console.error('Failed to download certificate image:', err);
      setIsDownloading(false);
    }
  };

  // Export to Print or Share via LINE
  const handlePrint = async () => {
    if (!printRef.current) {
      window.print();
      return;
    }
    setIsExporting(true);
    setExportModalOpen(true);
    setExportedImageUri(null);

    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const dataUri = await captureElementToDataUrl(printRef.current, { scale: 2 });
      setExportedImageUri(dataUri);
    } catch (err) {
      console.error('Failed to capture certificate:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 pt-[max(calc(env(safe-area-inset-top,0px)+12px),24px)] pb-4 print:p-0 print:bg-white print:fixed print:inset-0">
      
      {/* Container */}
      <div 
        className="relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:rounded-none animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-amber-400/20 border border-amber-400/50 rounded-xl text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white truncate">
                  หนังสือรับรองสถานะการเป็นสมาชิก (แบบฟอร์มทางการ)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  รหัส #{activeMember.memberId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                ผู้รับรอง: <strong>{activeMember.fullName}</strong> {activeMember.callsign && activeMember.callsign !== '-' ? `(${activeMember.callsign})` : ''} • {activeMember.memberType || 'สมาชิกสามัญ'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isDownloading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
              title="ดาวน์โหลดไฟล์ภาพหนังสือรับรอง PNG ความละเอียดสูง"
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'กำลังสร้างภาพ...' : '📥 บันทึกรูปภาพ (PNG)'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={isExporting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow transition cursor-pointer disabled:opacity-50"
              title="พิมพ์เอกสาร หรือ แชร์ไปยัง LINE"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>{isExporting ? 'กำลังสร้าง...' : 'พิมพ์ / แชร์ LINE'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Paper Body (Render SVG from Document Studio) */}
        <div className="overflow-y-auto flex-1 bg-slate-100 p-3 sm:p-6 print:p-0 print:bg-white flex justify-center">
          <div 
            ref={printRef}
            className="bg-white rounded-xl shadow-lg border border-slate-300 p-2 sm:p-6 max-w-3xl w-full flex justify-center print:shadow-none print:border-none print:p-0"
          >
            <div 
              className="w-full flex justify-center"
              dangerouslySetInnerHTML={{ __html: certSvg }}
            />
          </div>
        </div>

      </div>

      {/* Export & Sharing Modal */}
      {exportModalOpen && (
        <DocumentExportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          imageDataUrl={exportedImageUri}
          defaultFileName={filename}
          documentTitle={`หนังสือรับรองสถานะสมาชิก_${activeMember.fullName}`}
          isGenerating={isExporting}
        />
      )}

    </div>
  );
}
