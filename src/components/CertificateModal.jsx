import React, { useState, useRef } from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building2, User, Phone, MapPin, Calendar, Award } from 'lucide-react';
import AssociationLogo from './AssociationLogo';
import DeveloperCredit from './DeveloperCredit';
import DocumentExportModal from './DocumentExportModal';
import { captureElementToDataUrl } from '../utils/documentExportUtils';
import { getSavedOfficers } from '../data/defaultSignatures';
import { formatThaiBirthDate, formatThaiDateString } from './DocumentStudio';

export default function CertificateModal({ isOpen, onClose, member, settings }) {
  const printRef = useRef(null);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportedImageUri, setExportedImageUri] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !member) return null;

  const officers = getSavedOfficers();
  const president = officers.find(o => o.role === 'president' || o.isDefaultPresident) || officers[0];
  const presidentName = president?.name || settings?.presidentName || 'นายธานี รายศิริ';
  const presidentTitle = president?.title || settings?.presidentTitle || 'นายกสมาคม / ผู้มีอำนาจลงนามแทน';

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

  const todayThai = new Date().toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
  const timeThai = new Date().toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      
      {/* Container */}
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white px-4 sm:px-5 py-3 flex items-center justify-between gap-2 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            <span className="font-bold text-xs sm:text-sm truncate">หนังสือรับรองสถานะสมาชิก</span>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-lg shadow transition cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
              title="พิมพ์ หรือ บันทึกภาพเข้าคลังภาพ / แชร์ไปยัง LINE"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
              <span>{isExporting ? 'กำลังสร้างภาพ...' : 'พิมพ์ / บันทึกภาพ / แชร์ LINE'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Paper Body (A4 Ratio Standard) */}
        <div 
          ref={printRef} 
          className="p-8 sm:p-14 bg-white text-slate-900 font-sans overflow-y-auto flex-1 print:p-8 print:overflow-visible print:text-black relative"
          style={{ minHeight: '800px' }}
        >
          
          {/* Watermark Background Seal */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
            <div className="w-[450px] h-[450px] rounded-full border-8 border-slate-900 flex items-center justify-center p-8">
              <span className="text-8xl font-serif font-black tracking-widest text-slate-900 text-center">
                HS9AS
              </span>
            </div>
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-1 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif">
              หนังสือรับรองสถานะการเป็นสมาชิก
            </h1>
          </div>

          {/* Location & Date */}
          <div className="flex flex-col items-end text-xs sm:text-sm text-slate-800 space-y-1 mb-6">
            <div>
              <span className="text-slate-600">เขียนที่ </span>
              <span className="font-semibold underline decoration-dotted underline-offset-4">
                สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา
              </span>
            </div>
            <div>
              <span className="text-slate-600">วันที่ </span>
              <span className="font-semibold">{member.startDate || todayThai}</span>
              <span className="text-slate-600"> เวลา </span>
              <span className="font-semibold">15:14 น.</span>
            </div>
          </div>

          {/* Preamble Statement */}
          <p className="text-xs sm:text-sm leading-relaxed text-slate-800 mb-6 text-justify indent-8">
            <strong>สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา</strong> ขอรับรองว่ารายละเอียดของบุคคล ดังต่อไปนี้เป็นความจริงทุกประการ
          </p>

          {/* Details Table / Grid (Matching Image 2) */}
          <div className="border-t border-b border-slate-300 divide-y divide-slate-200 text-xs sm:text-sm mb-6">
            
            <div className="py-2.5 grid grid-cols-12 gap-2">
              <div className="col-span-5 sm:col-span-4 text-slate-600 font-medium">ชื่อ-สกุล</div>
              <div className="col-span-7 sm:col-span-8 font-bold text-slate-900">{member.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์'}</div>
            </div>

            <div className="py-2.5 grid grid-cols-12 gap-2">
              <div className="col-span-5 sm:col-span-4 text-slate-600 font-medium">สัญญาณเรียกขาน (ถ้ามี)</div>
              <div className="col-span-7 sm:col-span-8 font-mono font-bold text-sky-800">
                {member.callsign && member.callsign !== '-' ? member.callsign : '-'}
              </div>
            </div>

            <div className="py-2.5 grid grid-cols-12 gap-2">
              <div className="col-span-5 sm:col-span-4 text-slate-600 font-medium">เลขประจำตัวประชาชน</div>
              <div className="col-span-7 sm:col-span-8 font-mono font-semibold tracking-wider text-slate-900">
                {member.citizenId || '1969900105532'}
              </div>
            </div>

            <div className="py-2.5 grid grid-cols-12 gap-2">
              <div className="col-span-5 sm:col-span-4 text-slate-600 font-medium">วัน เดือน ปี เกิด</div>
              <div className="col-span-7 sm:col-span-8 text-slate-900">
                {formatThaiBirthDate(member.birthDate || (member.callsign === 'HS9ADM' ? '10/05/2528' : '16/09/2530'))}
              </div>
            </div>

            <div className="py-2.5 grid grid-cols-12 gap-2">
              <div className="col-span-5 sm:col-span-4 text-slate-600 font-medium">ที่อยู่ตามทะเบียนบ้าน</div>
              <div className="col-span-7 sm:col-span-8 text-slate-900 leading-relaxed">
                {member.registeredAddress || member.currentAddress || '66 ถนนเลียบคลองชลประทาน ต.ควนลัง อ.หาดใหญ่ จ.สงขลา 90110'}
              </div>
            </div>

            <div className="py-2.5 grid grid-cols-12 gap-2">
              <div className="col-span-5 sm:col-span-4 text-slate-600 font-medium">หมายเลขโทรศัพท์ที่ติดต่อได้</div>
              <div className="col-span-7 sm:col-span-8 font-mono text-slate-900">
                {member.phone || '093-792-5665'} (มือถือ)
              </div>
            </div>

            <div className="py-2.5 grid grid-cols-12 gap-2">
              <div className="col-span-5 sm:col-span-4 text-slate-600 font-medium">รหัสสมาชิก</div>
              <div className="col-span-7 sm:col-span-8 font-mono font-bold text-slate-900">
                {member.memberId || '369113'}
              </div>
            </div>

            <div className="py-2.5 grid grid-cols-12 gap-2">
              <div className="col-span-5 sm:col-span-4 text-slate-600 font-medium">ประเภทสมาชิก</div>
              <div className="col-span-7 sm:col-span-8 font-bold text-slate-900">
                {member.memberType || 'สมาชิกสามัญ 5 ปี'}
              </div>
            </div>

            <div className="py-2.5 grid grid-cols-12 gap-2">
              <div className="col-span-5 sm:col-span-4 text-slate-600 font-medium">วันเริ่มต้นการเป็นสมาชิก</div>
              <div className="col-span-7 sm:col-span-8 font-mono text-slate-900">
                {formatThaiDateString(member.startDate || '16-11-2569')}
              </div>
            </div>

            <div className="py-2.5 grid grid-cols-12 gap-2">
              <div className="col-span-5 sm:col-span-4 text-slate-600 font-medium">วันสิ้นสุดการเป็นสมาชิก</div>
              <div className="col-span-7 sm:col-span-8 font-mono text-slate-900 font-bold">
                {formatThaiDateString(member.endDate || '15-11-2574')}
              </div>
            </div>

          </div>

          {/* Certificate Conclusion */}
          <p className="text-xs sm:text-sm text-slate-800 mb-12">
            สมาคมฯ จึงออกหนังสือรับรองฉบับนี้ เพื่อเป็นหลักฐาน
          </p>

          {/* Signatures & Seal Section (Matching Image 2) */}
          <div className="mt-8 flex justify-end">
            <div className="text-center w-72 space-y-2 relative">
              <p className="text-xs sm:text-sm text-slate-700">ขอแสดงความนับถือ</p>

              {/* Seal & Signature Overlay Container */}
              <div className="h-28 flex items-center justify-center relative my-2">
                
                {/* Official Blue Stamp Impression */}
                <div className="absolute left-4 top-1 w-24 h-24 rounded-full border-2 border-blue-600/70 p-1 flex items-center justify-center text-center rotate-[-12deg] opacity-80 pointer-events-none select-none">
                  <div className="w-full h-full rounded-full border border-dashed border-blue-600/80 flex flex-col items-center justify-center p-1">
                    <span className="text-[7.5px] font-bold text-blue-700 leading-tight">สมาคมวิทยุสมัครเล่นสมิหลา</span>
                    <span className="text-[9px] font-black text-blue-800 font-mono my-0.5">HS9AS</span>
                    <span className="text-[6.5px] text-blue-600 leading-tight">จังหวัดสงขลา</span>
                  </div>
                </div>

                {/* Hand Signature Graphic / Simulated Thai Signature from Vault */}
                <div className="relative z-10 select-none flex items-center justify-center pt-2">
                  {president?.signatureImage ? (
                    <img src={president.signatureImage} alt="Signature" className="max-h-16 mix-blend-multiply inline-block" />
                  ) : president?.signatureSvg ? (
                    <div className="w-36 h-14 inline-block text-blue-950" dangerouslySetInnerHTML={{ __html: president.signatureSvg }} />
                  ) : (
                    <svg className="w-36 h-14 text-blue-950 inline-block" viewBox="0 0 200 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10,40 Q35,10 60,35 T110,25 Q140,5 170,30 T190,20" />
                      <path d="M40,48 Q70,55 120,45" />
                      <path d="M80,15 L95,45" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Signee Details */}
              <div className="space-y-0.5 text-xs text-slate-800">
                <p className="font-medium">ลงชื่อ ................................................................</p>
                <p className="font-bold text-slate-900 mt-1">({presidentName})</p>
                <p className="text-slate-600 text-[11px] leading-tight">
                  {presidentTitle}
                </p>
                <p className="text-[10px] text-slate-500">(ประทับตราสมาคม)</p>
              </div>

            </div>
          </div>

        </div>

        {/* Developer Signature on bottom */}
        <div className="print:hidden">
          <DeveloperCredit variant="light" />
        </div>

      </div>

      {/* Document Export & Share to LINE Modal */}
      <DocumentExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        imageUri={exportedImageUri}
        isGenerating={isExporting}
        docTitle="หนังสือรับรองสมาคม (Certificate)"
        docDate={member.startDate ? formatThaiDateString(member.startDate) : todayThai}
        memberName={member.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)'}
        memberCallsign={member.callsign && member.callsign !== '-' ? member.callsign : 'E26ECG'}
        fileName={`Certificate_${member.callsign || 'HS9AS'}_${Date.now()}.png`}
        onDirectPrint={() => window.print()}
        onRetry={handlePrint}
      />

    </div>
  );
}
