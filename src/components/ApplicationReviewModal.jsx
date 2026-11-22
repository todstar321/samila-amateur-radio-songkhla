import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  CheckCircle, 
  FileText, 
  ShieldCheck, 
  CreditCard, 
  Home, 
  Receipt, 
  Eye, 
  UserCheck, 
  AlertCircle,
  Sparkles,
  Layers,
  Cloud,
  Trash2
} from 'lucide-react';
import { 
  generateApplicationFormSvg, 
  generateCitizenIdCardSvg, 
  generateHouseRegistrationSvg, 
  generateBankSlipSvg 
} from '../utils/documentSvgGenerators';
import DeveloperCredit from './DeveloperCredit';
import DocumentExportModal from './DocumentExportModal';
import { captureElementToDataUrl } from '../utils/documentExportUtils';
import { getCloudinarySettings, deleteMemberImagesFromCloudinary } from '../utils/cloudinaryUtils';

export default function ApplicationReviewModal({ 
  isOpen, 
  onClose, 
  member, 
  onApproveMember, 
  onUpdateMember,
  currentUser, 
  onOpenReceipt 
}) {
  const [activeTab, setActiveTab] = useState('form'); // 'form', 'idcard', 'house', 'slip', 'all'
  const [currentMember, setCurrentMember] = useState(member);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvedToast, setApprovedToast] = useState(false);
  const [isDeletingCloudinary, setIsDeletingCloudinary] = useState(false);
  const [cloudinaryClearedNotice, setCloudinaryClearedNotice] = useState(false);

  const printRef = useRef(null);

  // Sync currentMember when member prop changes
  React.useEffect(() => {
    if (member) setCurrentMember(member);
  }, [member]);

  if (!isOpen || !currentMember) return null;

  // Generate SVG strings for each document using currentMember
  const appFormSvg = generateApplicationFormSvg(currentMember);
  const citizenIdSvg = generateCitizenIdCardSvg(currentMember);
  const houseRegSvg = generateHouseRegistrationSvg(currentMember);
  const bankSlipSvg = generateBankSlipSvg(currentMember);

  // Helper to convert SVG to PNG and trigger download
  const downloadSvgAsPng = (svgString, filename, width = 1200, height = 1700) => {
    return new Promise((resolve) => {
      try {
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);
        const image = new Image();

        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          // White background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(image, 0, 0, width, height);

          const pngDataUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngDataUrl;
          downloadLink.download = filename;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(blobURL);
          resolve(true);
        };

        image.onerror = () => {
          // Fallback: direct SVG download
          const downloadLink = document.createElement('a');
          downloadLink.href = blobURL;
          downloadLink.download = filename.replace('.png', '.svg');
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          resolve(true);
        };

        image.src = blobURL;
      } catch (err) {
        console.error('Error generating document image:', err);
        resolve(false);
      }
    });
  };

  // Batch download all 4 files sequentially
  const handleDownloadAllDocuments = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    const safeName = (member.fullName || 'ผู้สมัคร').replace(/[\s/\\:*?"<>|]/g, '_');

    // 1. Download Application Form
    await downloadSvgAsPng(appFormSvg, `01_ใบสมัครสมาชิก_${safeName}.png`, 1200, 1695);
    await new Promise((r) => setTimeout(r, 350));

    // 2. Download Citizen ID Card
    await downloadSvgAsPng(citizenIdSvg, `02_สำเนาบัตรประชาชน_${safeName}.png`, 1200, 750);
    await new Promise((r) => setTimeout(r, 350));

    // 3. Download House Registration
    await downloadSvgAsPng(houseRegSvg, `03_สำเนาทะเบียนบ้าน_${safeName}.png`, 1200, 975);
    await new Promise((r) => setTimeout(r, 350));

    // 4. Download Bank Slip
    await downloadSvgAsPng(bankSlipSvg, `04_สลิปโอนเงินธนาคาร_${safeName}.png`, 900, 1275);

    setIsDownloading(false);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 5000);

    // Auto-Delete from Cloudinary to free storage as requested by user
    const cSettings = getCloudinarySettings();
    if (cSettings.autoDeleteOnDownload) {
      deleteMemberImagesFromCloudinary(currentMember).then(() => {
        setCloudinaryClearedNotice(true);
        const updated = {
          ...currentMember,
          downloadedAt: new Date().toISOString(),
          cloudinaryCleared: true,
          cloudinaryClearedAt: new Date().toISOString()
        };
        setCurrentMember(updated);
        if (onUpdateMember) {
          onUpdateMember(updated);
        }
      }).catch(e => {
        console.warn('Cloudinary auto-purge error:', e);
      });
    }
  };

  // Manual Delete from Cloudinary
  const handleManualDeleteCloudinary = async () => {
    if (!window.confirm(`ต้องการลบภาพเอกสารของ ${currentMember.fullName} ออกจาก Cloudinary เพื่อประหยัดพื้นที่ใช่หรือไม่?`)) return;
    setIsDeletingCloudinary(true);
    try {
      await deleteMemberImagesFromCloudinary(currentMember);
      const updated = {
        ...currentMember,
        downloadedAt: currentMember.downloadedAt || new Date().toISOString(),
        cloudinaryCleared: true,
        cloudinaryClearedAt: new Date().toISOString(),
        idCardSlip: null,
        houseSlip: null,
        transferSlip: null
      };
      setCurrentMember(updated);
      if (onUpdateMember) onUpdateMember(updated);
      setCloudinaryClearedNotice(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingCloudinary(false);
    }
  };

  // Handle Approve Member with Full Audit Trail
  const handleApprove = () => {
    setIsApproving(true);
    const auditData = {
      approvedByAdminName: currentUser?.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)',
      approvedByCallsign: currentUser?.callsign && currentUser.callsign !== '-' ? currentUser.callsign : 'E26ECG',
      approvedAt: new Date().toLocaleDateString('th-TH') + ' เวลา ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
    };

    setTimeout(() => {
      if (onApproveMember) {
        onApproveMember(currentMember.id, auditData);
      }
      setCurrentMember(prev => ({
        ...prev,
        status: 'อนุมัติแล้ว',
        memberStatus: 'ปกติ (Active)',
        ...auditData
      }));
      setIsApproving(false);
      setApprovedToast(true);
      setTimeout(() => {
        setApprovedToast(false);
      }, 3500);
    }, 600);
  };

  // Handle Export & Share
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportedImageUri, setExportedImageUri] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

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
      console.error('Failed to capture application form:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const safeName = (member.fullName || 'ผู้สมัคร').replace(/[\s/\\:*?"<>|]/g, '_');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:fixed print:inset-0">
      
      {/* Container */}
      <div 
        className="relative bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Header */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 sm:py-4 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Title & Applicant Quick Info */}
            <div className="flex items-center gap-3">
              <img 
                src={currentMember.avatar || "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80"}
                alt="applicant" 
                className="w-11 h-11 rounded-xl object-cover border-2 border-amber-400 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-white truncate">
                    {currentMember.fullName}
                  </h3>
                  {currentMember.status === 'รอตรวจสอบ' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                      รออนุมัติการสมัคร
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                      อนุมัติแล้ว
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>เลขบัตร: <strong className="font-mono text-slate-200">{currentMember.citizenId || '1900400998876'}</strong></span>
                  <span>•</span>
                  <span>ประเภท: <strong className="text-sky-300">{currentMember.memberType}</strong></span>
                </p>
              </div>
            </div>

            {/* Actions: Batch Download & Close */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              
              {/* Batch Download Button */}
              <button
                type="button"
                onClick={handleDownloadAllDocuments}
                disabled={isDownloading}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
                title="บันทึกไฟล์ภาพเอกสารทั้งหมด (ใบสมัคร, บัตรประชาชน, ทะเบียนบ้าน, สลิปโอนเงิน) ลงในเครื่องของคุณ"
              >
                <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                <span>{isDownloading ? 'กำลังบันทึกลงเครื่อง...' : '📥 บันทึกรูปภาพทั้งหมดลงเครื่อง (4 ไฟล์)'}</span>
              </button>

              {/* Print / Export Button */}
              <button
                type="button"
                onClick={handlePrint}
                disabled={isExporting}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
                title="พิมพ์ หรือ บันทึกภาพเข้าคลังภาพ / แชร์ไปยัง LINE"
              >
                <Printer className="w-4 h-4" />
                <span>{isExporting ? 'กำลังสร้างภาพ...' : 'พิมพ์ / บันทึกภาพ / แชร์ LINE'}</span>
              </button>

              {/* Approve Button (if pending) */}
              {currentMember.status === 'รอตรวจสอบ' ? (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isApproving ? 'กำลังอนุมัติ...' : 'อนุมัติการสมัคร'}</span>
                </button>
              ) : (
                <div className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-[11px] text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>อนุมัติแล้วโดย: {currentMember.approvedByAdminName || 'แอดมิน'}</span>
                </div>
              )}

              {/* Cloudinary Purge Button */}
              {currentMember.cloudinaryCleared ? (
                <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-cyan-950/70 border border-cyan-500/40 rounded-xl text-[11px] text-cyan-300 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ล้างรูปใน Cloudinary แล้ว</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleManualDeleteCloudinary}
                  disabled={isDeletingCloudinary}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-950/70 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-rose-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                  title="ลบสำเนาภาพออกจาก Cloudinary ทันทีเพื่อประหยัดพื้นที่จัดเก็บ"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isDeletingCloudinary ? 'กำลังลบ...' : 'ลบรูปจาก Cloudinary'}</span>
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Download & Approval Notifications */}
          {downloadSuccess && (
            <div className="mt-2.5 p-2.5 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                <strong>บันทึกสำเร็จ!</strong> ดาวน์โหลดไฟล์ภาพเอกสารทั้ง 4 ไฟล์ (ใบสมัคร, บัตรประชาชน, ทะเบียนบ้าน, สลิปโอนเงิน) ลงในเครื่องเรียบร้อยแล้ว
              </span>
            </div>
          )}

          {/* Cloudinary Purge Notice */}
          {cloudinaryClearedNotice && (
            <div className="mt-2.5 p-2.5 bg-cyan-950/80 border border-cyan-500/60 rounded-xl text-cyan-200 text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>
                  <strong>ลบรูปจาก Cloudinary สำเร็จ!</strong> ระบบได้ล้างสำเนาภาพออกจาก console.cloudinary.com เรียบร้อยแล้ว เพื่อประหยัดพื้นที่จัดเก็บ
                </span>
              </div>
              <button 
                onClick={() => setCloudinaryClearedNotice(false)} 
                className="text-cyan-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {approvedToast && (
            <div className="mt-2.5 p-2.5 bg-sky-950/80 border border-sky-400/60 rounded-xl text-sky-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
              <span>
                <strong>อนุมัติสมาชิกเรียบร้อยแล้ว!</strong> สมาชิกท่านนี้เปิดใช้งานสถานะปกติ พร้อมจัดส่งใบเสร็จรับเงิน & หนังสือรับรองสมาชิกเข้า Telegram อัตโนมัติ
              </span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'form' 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. ใบสมัครสมาชิกสมาคม (ต้นฉบับ)</span>
            </button>

            <button
              onClick={() => setActiveTab('idcard')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'idcard' 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>2. สำเนาบัตรประชาชน</span>
            </button>

            <button
              onClick={() => setActiveTab('house')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'house' 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>3. สำเนาทะเบียนบ้าน</span>
            </button>

            <button
              onClick={() => setActiveTab('slip')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'slip' 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>4. สลิปโอนเงินค่าบำรุงสมาชิก</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'all' 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ดูเอกสารทั้งหมดพร้อมกัน (4 เอกสาร)</span>
            </button>
          </div>

        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 bg-slate-100 p-3 sm:p-6 print:p-0 print:bg-white">

          {/* TAB 1: FORM VIEW (Replicating Image 2 pixel-perfect) */}
          {activeTab === 'form' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              
              {/* Individual Download Bar for this document */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between print:hidden">
                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span><strong>เอกสารที่ 1:</strong> ใบสมัครสมาชิกสมาคมวิทยุสมัครเล่นสมิหลา จังหวัดสงขลา (แบบฟอร์มทางการ)</span>
                </div>
                <button
                  type="button"
                  onClick={() => downloadSvgAsPng(appFormSvg, `ใบสมัครสมาชิก_${safeName}.png`, 1200, 1695)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>บันทึกภาพใบสมัครนี้</span>
                </button>
              </div>

              {/* Form Render Container (A4 Ratio) */}
              <div 
                ref={printRef}
                className="bg-white rounded-xl shadow-md border border-slate-300 p-4 sm:p-8 overflow-hidden print:shadow-none print:border-none print:p-0"
              >
                <div 
                  className="w-full flex justify-center"
                  dangerouslySetInnerHTML={{ __html: appFormSvg }}
                />
              </div>

            </div>
          )}

          {/* TAB 2: CITIZEN ID CARD VIEW */}
          {activeTab === 'idcard' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span><strong>เอกสารที่ 2:</strong> สำเนาบัตรประจำตัวประชาชน พร้อมลายเซ็นและคำรับรองถูกต้อง</span>
                </div>
                <button
                  type="button"
                  onClick={() => downloadSvgAsPng(citizenIdSvg, `สำเนาบัตรประชาชน_${safeName}.png`, 1200, 750)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>บันทึกภาพบัตรประชาชน</span>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-300 p-4 sm:p-8 flex justify-center">
                <div 
                  className="w-full max-w-2xl"
                  dangerouslySetInnerHTML={{ __html: citizenIdSvg }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: HOUSE REGISTRATION VIEW */}
          {activeTab === 'house' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span><strong>เอกสารที่ 3:</strong> สำเนาทะเบียนบ้าน (ท.ร.14) ระบุที่อยู่ภูมิลำเนาใน จ.สงขลา</span>
                </div>
                <button
                  type="button"
                  onClick={() => downloadSvgAsPng(houseRegSvg, `สำเนาทะเบียนบ้าน_${safeName}.png`, 1200, 975)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>บันทึกภาพทะเบียนบ้าน</span>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-300 p-4 sm:p-8 flex justify-center">
                <div 
                  className="w-full max-w-2xl"
                  dangerouslySetInnerHTML={{ __html: houseRegSvg }}
                />
              </div>
            </div>
          )}

          {/* TAB 4: BANK SLIP VIEW */}
          {activeTab === 'slip' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span><strong>เอกสารที่ 4:</strong> หลักฐานการโอนเงิน ธนาคารกรุงไทย (เลขที่ 9013394310 จำนวน 600.00 บาท)</span>
                </div>
                <button
                  type="button"
                  onClick={() => downloadSvgAsPng(bankSlipSvg, `สลิปโอนเงิน_${safeName}.png`, 900, 1275)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>บันทึกภาพสลิปโอนเงิน</span>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-300 p-4 sm:p-8 flex justify-center">
                <div 
                  className="w-full max-w-md"
                  dangerouslySetInnerHTML={{ __html: bankSlipSvg }}
                />
              </div>
            </div>
          )}

          {/* TAB 5: ALL-IN-ONE GRID VIEW */}
          {activeTab === 'all' && (
            <div className="space-y-6">
              
              {/* Batch Action Banner */}
              <div className="bg-gradient-to-r from-sky-900 to-indigo-900 text-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm">แฟ้มเอกสารการสมัครทั้งหมด (4 รายการ)</h4>
                  <p className="text-xs text-sky-200 mt-0.5">
                    ตรวจสอบหลักฐานครบถ้วน สามารถกดบันทึกทั้งหมดลงเครื่อง หรือดาวน์โหลดแยกแต่ละไฟล์ได้
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadAllDocuments}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>บันทึกภาพทั้ง 4 ไฟล์ลงเครื่องพร้อมกัน</span>
                </button>
              </div>

              {/* 2x2 Responsive Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* 1. ใบสมัคร */}
                <div className="bg-white rounded-xl p-4 border border-slate-300 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-xs text-slate-800">1. ใบสมัครสมาชิกสมาคม (ต้นฉบับ)</span>
                    <button
                      type="button"
                      onClick={() => downloadSvgAsPng(appFormSvg, `ใบสมัครสมาชิก_${safeName}.png`, 1200, 1695)}
                      className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> ดาวน์โหลด
                    </button>
                  </div>
                  <div 
                    className="overflow-hidden rounded border border-slate-100 max-h-[420px] overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: appFormSvg }}
                  />
                </div>

                {/* 2. บัตรประชาชน */}
                <div className="bg-white rounded-xl p-4 border border-slate-300 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-xs text-slate-800">2. สำเนาบัตรประจำตัวประชาชน</span>
                    <button
                      type="button"
                      onClick={() => downloadSvgAsPng(citizenIdSvg, `สำเนาบัตรประชาชน_${safeName}.png`, 1200, 750)}
                      className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> ดาวน์โหลด
                    </button>
                  </div>
                  <div 
                    className="overflow-hidden rounded border border-slate-100"
                    dangerouslySetInnerHTML={{ __html: citizenIdSvg }}
                  />
                </div>

                {/* 3. สำเนาทะเบียนบ้าน */}
                <div className="bg-white rounded-xl p-4 border border-slate-300 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-xs text-slate-800">3. สำเนาทะเบียนบ้าน (ท.ร.14)</span>
                    <button
                      type="button"
                      onClick={() => downloadSvgAsPng(houseRegSvg, `สำเนาทะเบียนบ้าน_${safeName}.png`, 1200, 975)}
                      className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> ดาวน์โหลด
                    </button>
                  </div>
                  <div 
                    className="overflow-hidden rounded border border-slate-100"
                    dangerouslySetInnerHTML={{ __html: houseRegSvg }}
                  />
                </div>

                {/* 4. สลิปโอนเงิน */}
                <div className="bg-white rounded-xl p-4 border border-slate-300 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-xs text-slate-800">4. สลิปโอนเงิน ธ.กรุงไทย</span>
                    <button
                      type="button"
                      onClick={() => downloadSvgAsPng(bankSlipSvg, `สลิปโอนเงิน_${safeName}.png`, 900, 1275)}
                      className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> ดาวน์โหลด
                    </button>
                  </div>
                  <div 
                    className="overflow-hidden rounded border border-slate-100 max-h-[420px] overflow-y-auto flex justify-center"
                    dangerouslySetInnerHTML={{ __html: bankSlipSvg }}
                  />
                </div>

              </div>

            </div>
          )}

          {/* Developer credit at bottom of modal */}
          <div className="mt-8 pt-4 border-t border-slate-200">
            <DeveloperCredit />
          </div>

        </div>

        {/* Modal Bottom Sticky Footer */}
        <div className="bg-white border-t border-slate-200 p-3 sm:px-6 sm:py-3.5 flex items-center justify-between gap-3 print:hidden shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block">
            สถานะ: <span className="font-semibold text-slate-800">{currentMember.status}</span> 
            {currentMember.approvedByAdminName ? (
              <span className="text-emerald-700 font-medium ml-2">
                • อนุมัติโดย: <strong>{currentMember.approvedByAdminName} ({currentMember.approvedByCallsign})</strong> เมื่อ {currentMember.approvedAt}
              </span>
            ) : (
              <span> • ยื่นเมื่อ {currentMember.registeredDate || '19 พ.ย. 2569'}</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDownloadAllDocuments}
              disabled={isDownloading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>บันทึกภาพทั้งหมด</span>
            </button>

            {onOpenReceipt && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReceipt(currentMember);
                }}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
                title="ออกใบเสร็จรับเงินให้ผู้สมัครท่านนี้ทันที"
              >
                <Receipt className="w-4 h-4 text-emerald-200" />
                <span>ออกใบเสร็จ</span>
              </button>
            )}

            {currentMember.status === 'รอตรวจสอบ' && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isApproving}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>อนุมัติการสมัครสมาชิก</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>

      </div>

      {/* Document Export & Share to LINE Modal */}
      <DocumentExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        imageUri={exportedImageUri}
        isGenerating={isExporting}
        docTitle="ใบสมัครสมาชิก (Application Form)"
        docDate={currentMember.registeredDate || '16 พ.ย. 2569'}
        memberName={currentMember.fullName || 'ผู้สมัครสมาชิก'}
        memberCallsign={currentMember.callsign && currentMember.callsign !== '-' ? currentMember.callsign : 'รอรับการจัดสรร'}
        fileName={`Application_${safeName}_${Date.now()}.png`}
        onDirectPrint={() => window.print()}
        onRetry={handlePrint}
      />

    </div>
  );
}
