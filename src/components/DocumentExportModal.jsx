import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Printer, 
  Image as ImageIcon, 
  MessageCircle, 
  Sparkles, 
  Smartphone,
  ExternalLink,
  Eye,
  CheckCircle2,
  RefreshCw,
  Monitor,
  AlertCircle
} from 'lucide-react';

/**
 * Synchronously converts a Base64 Data URL to a standard W3C File object in ~2ms.
 * Vital for iOS Safari & Android Chrome: preserves transient user activation (gesture),
 * allowing navigator.share({ files: [file] }) to trigger native OS share sheet with ZERO rejection.
 */
function dataUrlToFile(dataUrl, filename) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return null;
  }
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (e) {
    console.error('Failed to convert dataUrl to File:', e);
    return null;
  }
}

export default function DocumentExportModal({
  isOpen,
  onClose,
  imageUri,
  isGenerating,
  docTitle = 'เอกสารสมาคมวิทยุสมัครเล่นสมิหลา',
  docDate = '16 พ.ย. 2569',
  memberName = 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)',
  memberCallsign = 'E26ECG',
  fileName,
  onDirectPrint,
  onRetry
}) {
  const [copiedToast, setCopiedToast] = useState(false);
  const [copiedImageToast, setCopiedImageToast] = useState(false);
  const [downloadToast, setDownloadToast] = useState(false);
  const [desktopShareBanner, setDesktopShareBanner] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen) return null;

  const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Exact LINE message format requested by user:
  // วันที่ "......"
  // คุณ "......"
  // นามเรียกขาน "......"
  // เอกสาร "......"
  const shareText = `วันที่ "${docDate || '16 พ.ย. 2569'}"
คุณ "${memberName || '-'}"
นามเรียกขาน "${memberCallsign || '-'}"
เอกสาร "${docTitle}"`;

  const defaultFileName = fileName || `${docTitle.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '_')}_${memberCallsign || 'HS9AS'}_${Date.now()}.png`;

  // Direct download image
  const handleDownloadImage = () => {
    if (!imageUri) return;
    try {
      const link = document.createElement('a');
      link.href = imageUri;
      link.download = defaultFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadToast(true);
      setTimeout(() => setDownloadToast(false), 3500);
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  // Copy high-resolution PNG image directly to clipboard (for pasting in LINE Desktop, Word, Chat)
  const handleCopyImageToClipboard = async () => {
    if (!imageUri) return;
    try {
      const res = await fetch(imageUri);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setCopiedImageToast(true);
      setTimeout(() => setCopiedImageToast(false), 4500);
    } catch (e) {
      console.warn('Direct image clipboard copy failed or not supported by browser, falling back to copy text:', e);
      handleCopyText();
    }
  };

  // Copy LINE caption text to clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  // Launch LINE Desktop Application Protocol
  const handleLaunchLineApp = () => {
    try {
      window.location.href = 'line://';
    } catch (e) {
      console.warn('Cannot launch LINE desktop protocol directly:', e);
    }
  };

  // Fallback LINE Sharing Method (Open LINE Target Picker + Copy Image/Text + Download)
  const fallbackLineShare = () => {
    // 1. Copy image to clipboard for instant Ctrl+V pasting in LINE
    handleCopyImageToClipboard();
    // 2. Also download image to downloads folder
    handleDownloadImage();
    // 3. Copy formatted caption text
    handleCopyText();
    // 4. Show desktop helpful guide banner
    setDesktopShareBanner(true);
    // 5. Open LINE share selector window (allows choosing which group or friend to send to!)
    const lineShareUrl = `https://line.me/R/share?text=${encodeURIComponent(shareText)}`;
    window.open(lineShareUrl, '_blank', 'noopener,noreferrer');
  };

  // Primary Share to LINE Handler (Native File + Text share on Mobile/Mac, or Universal LINE Share on PC)
  const handleShareToLine = () => {
    if (!imageUri) return;

    // Convert synchronously in ~2ms (zero async delay, keeps user gesture token active!)
    const file = dataUrlToFile(imageUri, defaultFileName);

    // If native share with file is supported (iOS Safari 15+, Android Chrome 75+, macOS Safari)
    if (navigator.share && file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        title: docTitle,
        text: shareText,
        files: [file]
      }).catch((err) => {
        if (err.name === 'AbortError') return; // User simply closed the share sheet
        console.warn('Native share dismissed or failed, falling back to LINE share picker:', err);
        fallbackLineShare();
      });
      return;
    }

    // Fallback: Open LINE share picker + Copy image & text + Download
    fallbackLineShare();
  };

  // Clean Print of just the image
  const handleCleanPrint = () => {
    if (onDirectPrint) {
      onDirectPrint();
      return;
    }
    if (!imageUri) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${docTitle}</title>
            <style>
              @page { size: auto; margin: 0; }
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: #fff; }
              img { max-width: 100%; height: auto; display: block; }
            </style>
          </head>
          <body>
            <img src="${imageUri}" onload="setTimeout(() => { window.print(); window.close(); }, 300);" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Container */}
      <div 
        className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-sky-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base tracking-tight text-white">
                  สร้างภาพเอกสารสำเร็จ & ส่งออก
                </h3>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  {imageUri ? 'พร้อมใช้งาน' : (isGenerating ? 'กำลังสร้างภาพ...' : 'รอโหลดภาพ')}
                </span>
              </div>
              <p className="text-xs text-sky-200/80 mt-0.5 font-medium">
                {docTitle} • {memberName} ({memberCallsign || '-'})
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          
          {/* Notification Alerts */}
          {copiedImageToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in duration-200 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>คัดลอกรูปภาพเอกสารเข้าคลิปบอร์ดแล้ว! สามารถสลับไปที่โปรแกรม LINE บนคอมพิวเตอร์ แล้วกด <strong>วาง (Ctrl+V หรือ Cmd+V)</strong> เพื่อส่งภาพได้ทันที</span>
            </div>
          )}

          {copiedToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>คัดลอกข้อความนำสำหรับแชร์ไปยัง LINE เรียบร้อยแล้ว! สามารถนำไปวาง (Paste) ส่งได้ทันที</span>
            </div>
          )}

          {downloadToast && (
            <div className="p-3 bg-sky-50 border border-sky-300 rounded-2xl text-sky-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
              <span>ดาวน์โหลดภาพเอกสารลงในเครื่อง / คลังภาพเรียบร้อยแล้ว!</span>
            </div>
          )}

          {/* Action Hub Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Card 1: Save Image to Device / Gallery */}
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isGenerating || !imageUri}
              className="group p-4 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl shadow-md hover:shadow-lg transition flex items-center gap-3.5 text-left cursor-pointer disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base flex items-center gap-1.5">
                  <span>บันทึกภาพเข้าคลังภาพ</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-normal">โทรศัพท์/คอมฯ</span>
                </div>
                <p className="text-xs text-emerald-100 mt-0.5 leading-snug">
                  บันทึกไฟล์ภาพ .PNG ความละเอียดสูง เข้าแกลเลอรีรูปภาพในโทรศัพท์ทันที
                </p>
              </div>
            </button>

            {/* Card 2: Share to LINE */}
            <button
              type="button"
              onClick={handleShareToLine}
              disabled={isGenerating || !imageUri}
              className="group p-4 bg-gradient-to-br from-[#06c755] to-[#05b34c] hover:from-[#05d65c] hover:to-[#04a043] text-white rounded-2xl shadow-md hover:shadow-lg transition flex items-center gap-3.5 text-left cursor-pointer disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base flex items-center gap-1.5">
                  <span>แชร์ไปยัง LINE (เลือกกลุ่ม / เพื่อน)</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    {isMobile ? 'ส่งข้อความ + รูปภาพ' : 'เปิดเลือกกลุ่ม LINE'}
                  </span>
                </div>
                <p className="text-xs text-emerald-100 mt-0.5 leading-snug">
                  {isMobile 
                    ? 'เปิดระบบแชร์ส่งรูปภาพพร้อมข้อความนำเข้ากลุ่ม LINE หรือแชทเดี่ยวโดยตรงทันที'
                    : 'เปิดหน้าต่างเลือกกลุ่ม LINE พร้อมคัดลอกรูปภาพและดาวน์โหลดไฟล์ภาพให้ทันที'}
                </p>
              </div>
            </button>

          </div>

          {/* Dedicated Desktop Confirmation & Quick Guidance Banner */}
          {!isMobile && desktopShareBanner && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-2xl border-2 border-emerald-400 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-2 flex-1">
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                      <span>คัดลอกรูปภาพเอกสาร & ดาวน์โหลดไฟล์ภาพเรียบร้อยแล้ว!</span>
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      💡 <strong>วิธีส่งใน LINE บนคอมพิวเตอร์:</strong> สลับไปที่หน้าต่างแชท LINE ที่เปิดอยู่ แล้วกดปุ่ม <strong>วาง (Ctrl+V หรือ Cmd+V)</strong> เพื่อส่งภาพได้ทันที หรือสามารถลากไฟล์ภาพที่ดาวน์โหลดไปปล่อยในช่องแชทได้เช่นกัน
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <button
                      type="button"
                      onClick={handleCopyImageToClipboard}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedImageToast ? 'คัดลอกรูปภาพแล้ว!' : 'คัดลอกรูปภาพอีกครั้ง'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyText}
                      className="px-3.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{copiedToast ? 'คัดลอกข้อความแล้ว!' : 'คัดลอกข้อความนำ'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLaunchLineApp}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      title="เรียกเปิดโปรแกรม LINE บนคอมพิวเตอร์"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      <span>เปิดโปรแกรม LINE</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dedicated Desktop Helper: Copy Image for Ctrl+V in Desktop LINE */}
          {!isMobile && !desktopShareBanner && (
            <div className="p-3.5 bg-gradient-to-r from-sky-50 via-indigo-50 to-emerald-50 rounded-2xl border border-sky-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm text-slate-800 block">
                    แนะนำสำหรับผู้ใช้คอมพิวเตอร์ (PC / Mac)
                  </span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    กดปุ่มนี้เพื่อก๊อปปี้รูปภาพ แล้วสลับไปที่หน้าต่าง LINE ในคอมฯ กด <strong>Ctrl+V (หรือ Cmd+V)</strong> วางภาพส่งได้ทันที!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyImageToClipboard}
                disabled={isGenerating || !imageUri}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedImageToast ? 'คัดลอกภาพแล้ว!' : 'คัดลอกภาพ (Copy Image)'}</span>
              </button>
            </div>
          )}

          {/* Quick Sub-Actions Bar: Mobile Native Share & Clean Print & Refresh */}
          <div className="flex items-center gap-2 flex-wrap">
            {isMobile && (
              <button
                type="button"
                onClick={handleNativeShare}
                disabled={isGenerating || !imageUri || isSharing}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>แชร์ภาพ + ข้อความ (ระบบแชร์มือถือ)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCleanPrint}
              disabled={isGenerating || !imageUri}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>สั่งพิมพ์ผ่านเครื่องพิมพ์ (Print)</span>
            </button>

            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
                title="เรนเดอร์สร้างภาพเอกสารใหม่อีกครั้ง"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
                <span>{isGenerating ? 'กำลังสร้าง...' : 'สร้างภาพใหม่'}</span>
              </button>
            )}
          </div>

          {/* Pre-formatted LINE Text Message Preview Box */}
          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 text-xs sm:text-sm flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-[#06c755]" />
                <span>ข้อความนำสำหรับแชร์ (LINE Caption Text)</span>
              </span>
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToast ? 'คัดลอกแล้ว!' : 'คัดลอกข้อความ'}</span>
              </button>
            </div>

            {/* Pre-formatted lines box */}
            <div className="p-3 bg-white rounded-xl border border-emerald-200 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line select-all shadow-inner">
              {shareText}
            </div>

            <p className="text-[11px] text-slate-500 italic">
              💡 ข้อความนี้จะถูกส่งไปยัง LINE อัตโนมัติ หรือท่านสามารถกดปุ่ม "คัดลอกข้อความ" เพื่อนำไปวางพร้อมกับรูปภาพได้ทันที
            </p>
          </div>

          {/* Document Image Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sky-600" />
                <span>ภาพตัวอย่างเอกสารความละเอียดสูง (Preview)</span>
              </span>
              <div className="flex items-center gap-2">
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    disabled={isGenerating}
                    className="text-xs text-sky-700 hover:text-sky-900 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>สร้างใหม่</span>
                  </button>
                )}
                <span className="text-[11px] text-slate-500">
                  ขนาดจริงคมชัดระดับ A4
                </span>
              </div>
            </div>

            <div className="relative border-2 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-md flex justify-center p-2 sm:p-4 min-h-[260px] items-center">
              {isGenerating ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-slate-700">กำลังเรนเดอร์ภาพเอกสารความละเอียดสูง (2x Retina)...</p>
                  <p className="text-[11px] text-slate-400">กำลังโหลดภาพแม่แบบและจัดวางองค์ประกอบให้คมชัดระดับพิมพ์</p>
                </div>
              ) : imageUri ? (
                <div className="relative group max-w-full">
                  <img
                    src={imageUri}
                    alt={docTitle}
                    crossOrigin="anonymous"
                    className="max-h-[60vh] w-auto object-contain rounded-lg shadow-sm border border-slate-200 mx-auto"
                  />
                  {/* Floating Hint for Mobile Users */}
                  <div className="mt-2 text-center">
                    <span className="inline-block text-[11px] text-slate-500 bg-white/90 px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                      📱 แนะนำ: บนมือถือท่านสามารถแตะที่รูปภาพค้างไว้ (Long Press) แล้วเลือก "บันทึกภาพ" (Save Image) เข้าคลังภาพได้โดยตรง
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500 text-center px-4">
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">ไม่สามารถโหลดภาพเอกสารได้ในรอบนี้</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">อาจเกิดจากภาพพื้นหลังกำลังโหลดอยู่ หรือเบราว์เซอร์ยังประมวลผลไม่เสร็จ</p>
                  </div>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer mt-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>ลองสร้างภาพใหม่อีกครั้ง (Retry)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span>สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา (HS9AS)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>

    </div>
  );
}
