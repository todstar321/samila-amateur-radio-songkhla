import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Receipt, 
  CheckCircle2, 
  ShieldCheck, 
  FileCheck, 
  QrCode, 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  Award,
  Sparkles
} from 'lucide-react';
import AssociationLogo from './AssociationLogo';
import DeveloperCredit from './DeveloperCredit';
import DocumentExportModal from './DocumentExportModal';
import { RECEIPT_TIERS, DEFAULT_RECEIPT_TIER_POSITIONS } from './DocumentStudio';
import { thaiBahtText } from '../utils/thaiBahtText';
import { getSavedOfficers } from '../data/defaultSignatures';
import { DEFAULT_RECEIPT_TEMPLATE_BASE64 } from '../assets/defaultTemplates';
import { getCurrentReceiptInfo } from '../utils/sequenceNumberUtils';
import { fetchCentralLayoutSettings } from '../utils/layoutSyncUtils';
import { generateReceiptSvg, getActiveTemplateBg } from '../utils/documentSvgGenerators';
import { svgToPngBlob, ensureDataUrl } from '../utils/telegramNotifyUtils';

// Default positions matching the real scanned physical receipt
const DEFAULT_RECEIPT_POSITIONS = {
  bookNo: { id: 'bookNo', label: 'เล่มที่', x: 15.0, y: 4.8, fontSize: 16, color: '#dc2626', bold: true },
  receiptNo: { id: 'receiptNo', label: 'เลขที่ใบเสร็จ', x: 82.5, y: 6.2, fontSize: 18, color: '#dc2626', bold: true },
  
  // Grouped Date (Day / Month / Year on exact same baseline)
  receiptDateGroup: { 
    id: 'receiptDateGroup', 
    type: 'dateGroup', 
    label: 'วันที่ออกใบเสร็จ (วัน/เดือน/พ.ศ. แถวเดียวกัน)', 
    x: 52.8, 
    y: 24.2, 
    monthOffsetPx: 105, 
    yearOffsetPx: 235, 
    fontSize: 15, 
    color: '#0f172a', 
    bold: true 
  },
  
  // Legacy separate date fields (fallback)
  dateDay: { id: 'dateDay', label: 'วันที่ (ตัวเลข)', x: 52.8, y: 24.2, fontSize: 15, color: '#0f172a', bold: true, hidden: true },
  dateMonth: { id: 'dateMonth', label: 'เดือน (พ.ย.)', x: 67.5, y: 24.2, fontSize: 15, color: '#0f172a', bold: true, hidden: true },
  dateYear: { id: 'dateYear', label: 'พ.ศ. (2569)', x: 84.8, y: 24.2, fontSize: 15, color: '#0f172a', bold: true, hidden: true },
  payerName: { id: 'payerName', label: 'ได้รับเงินจาก (ชื่อ-สกุล)', x: 21.0, y: 31.0, fontSize: 15, color: '#0f172a', bold: true },
  memberId: { id: 'memberId', label: 'หมายเลขสมาชิก', x: 79.5, y: 31.0, fontSize: 15, color: '#0f172a', bold: true },
  address: { id: 'address', label: 'ที่อยู่ผู้ชำระ', x: 10.0, y: 35.2, fontSize: 13.5, color: '#1e293b', bold: false },
  phone: { id: 'phone', label: 'โทรศัพท์', x: 70.5, y: 35.2, fontSize: 13.5, color: '#1e293b', bold: true },
  memberFeeCheck: { id: 'memberFeeCheck', label: 'ติ๊ก ค่าบำรุงสมาชิก', x: 6.8, y: 52.0, fontSize: 16, color: '#0f172a', bold: true },
  memberFeeTypeCheck: { id: 'memberFeeTypeCheck', label: 'ติ๊ก ประเภทสมาชิก (เช่น สามัญ 5 ปี)', x: 9.5, y: 64.5, fontSize: 16, color: '#0f172a', bold: true },
  memberFeeAmount: { id: 'memberFeeAmount', label: 'ยอดเงินค่าบำรุง (เช่น 500)', x: 83.0, y: 64.5, fontSize: 15, color: '#0f172a', bold: true },
  slashMark: { id: 'slashMark', label: 'ขีดเฉียงในช่องยอดเงิน', x: 84.0, y: 54.0, fontSize: 24, color: '#0f172a', bold: false },
  totalAmountNumber: { id: 'totalAmountNumber', label: 'รวมเป็นเงินทั้งสิ้น (ตัวเลข)', x: 79.5, y: 79.2, fontSize: 20, color: '#0f172a', bold: true },
  totalAmountText: { id: 'totalAmountText', label: 'รวมเป็นเงินทั้งสิ้น (ตัวอักษรไทย)', x: 26.0, y: 81.0, fontSize: 15, color: '#0f172a', bold: true },
  signature: { id: 'signature', label: 'ลายเซ็นผู้รับเงิน', x: 63.5, y: 88.0, fontSize: 16, color: '#1d4ed8', bold: true },
  signerPosition: { id: 'signerPosition', label: 'ตำแหน่งผู้รับเงิน (เช่น เลขาธิการ)', x: 60.0, y: 92.5, fontSize: 14, color: '#0f172a', bold: true },
};

export default function MemberReceiptModal({ 
  isOpen, 
  onClose, 
  member, 
  currentUser 
}) {
  const printRef = useRef(null);
  const [receiptRecord, setReceiptRecord] = useState(null);
  const [officers, setOfficers] = useState(() => getSavedOfficers());
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportedImageUri, setExportedImageUri] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Positions loaded from Document Studio
  const [positions, setPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_receipt_layout_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_RECEIPT_POSITIONS;
  });

  // Per-tier tuned positions (lifetime, fiveYear, honorary, radioOrg)
  const [tierPositions, setTierPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_receipt_tier_positions_v1');
      if (saved) return { ...DEFAULT_RECEIPT_TIER_POSITIONS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_RECEIPT_TIER_POSITIONS;
  });

  // Background template loaded from Document Studio (Embedded Base64 for instant zero-latency loading)
  const [bgTemplate, setBgTemplate] = useState(() => {
    return getActiveTemplateBg('receipt', DEFAULT_RECEIPT_TEMPLATE_BASE64);
  });

  const activeMember = member || currentUser || {
    id: 'm1',
    fullName: 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)',
    callsign: 'E26ECG',
    memberId: '369113',
    memberType: 'สมาชิกสามัญ 5 ปี',
    currentAddress: '16/74 ม.7 ต.โคกเคียน อ.เมืองนราธิวาส จ.นราธิวาส',
    phone: '093-792-5665'
  };

  useEffect(() => {
    if (!isOpen) return;

    fetchCentralLayoutSettings().then(centralData => {
      if (!centralData) return;
      if (centralData.receipt) setPositions(prev => ({ ...prev, ...centralData.receipt }));
      if (centralData.receiptTierPositions) setTierPositions(prev => ({ ...prev, ...centralData.receiptTierPositions }));
      if (centralData.templateBackgrounds?.receipt) {
        const raw = centralData.templateBackgrounds.receipt;
        if (raw.startsWith('data:image')) {
          setBgTemplate(raw);
        } else {
          ensureDataUrl(raw).then(dUri => {
            if (dUri && dUri.startsWith('data:image')) setBgTemplate(dUri);
          }).catch(() => {});
        }
      }
    }).catch(() => {});

    // Load any updated template background from local storage as immediate cache
    try {
      const savedBg = localStorage.getItem('samila_doc_template_backgrounds_v1');
      if (savedBg) {
        const parsed = JSON.parse(savedBg);
        if (parsed.receipt && 
            parsed.receipt !== '/receipt-template-sample.jpg' && 
            !parsed.receipt.startsWith('data:image/png;base64,iVBORw0KGgo')) {
          setBgTemplate(parsed.receipt);
        } else {
          setBgTemplate(DEFAULT_RECEIPT_TEMPLATE_BASE64);
        }
      }
      const savedPos = localStorage.getItem('samila_receipt_layout_v2');
      if (savedPos) {
        setPositions(JSON.parse(savedPos));
      }
      const savedTierPos = localStorage.getItem('samila_receipt_tier_positions_v1');
      if (savedTierPos) {
        setTierPositions({ ...DEFAULT_RECEIPT_TIER_POSITIONS, ...JSON.parse(savedTierPos) });
      }
    } catch (e) {}
    
    // Look up in saved receipt records in localStorage
    try {
      const saved = localStorage.getItem('samila_receipt_records_v1');
      if (saved) {
        const records = JSON.parse(saved);
        const found = records.find(r => 
          (activeMember.memberId && r.memberId === activeMember.memberId) ||
          (activeMember.callsign && r.callsign === activeMember.callsign && r.callsign !== '-') ||
          (activeMember.fullName && r.payerName && r.payerName.includes(activeMember.fullName.split(' ')[0]))
        );
        if (found) {
          setReceiptRecord(found);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Default auto-generated official Receipt record matching physical book 03 / receipt 0111
    const mType = (activeMember.memberType || '').toLowerCase();
    let defaultTier = RECEIPT_TIERS.fiveYear;
    if (mType.includes('ตลอดชีพ')) defaultTier = RECEIPT_TIERS.lifetime;
    else if (mType.includes('กิตติมศักดิ์')) defaultTier = RECEIPT_TIERS.honorary;
    else if (mType.includes('องค์กร')) defaultTier = RECEIPT_TIERS.radioOrg;

    const seqInfo = getCurrentReceiptInfo();

    setReceiptRecord({
      id: `rec-${activeMember.memberId || 'default'}`,
      bookNo: seqInfo.bookNo,
      receiptNo: seqInfo.receiptNo,
      date: '16 พ.ย. 2569',
      payerName: activeMember.fullName || 'ว่าที่ ร.ต. ทีป์ชลิต ทองจันทร์',
      memberId: activeMember.memberId || '369113',
      callsign: activeMember.callsign && activeMember.callsign !== '-' ? activeMember.callsign : 'E26ECG',
      address: activeMember.currentAddress || activeMember.registeredAddress || '16/74 ม.7 ต.โคกเคียน อ.เมืองนราธิวาส จ.นราธิวาส 96000',
      phone: activeMember.phone || '093-792-5665',
      entryFee: 0,
      feeType: activeMember.memberType || defaultTier.label,
      amount: defaultTier.feeAmount,
      amountText: defaultTier.feeText,
      signerName: 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)',
      signerPosition: 'เลขาธิการ',
      issuedAt: '16/11/2569 14:30 น.'
    });
  }, [isOpen, activeMember]);

  if (!isOpen) return null;

  const handleDirectDownload = async () => {
    try {
      setIsExporting(true);
      const svg = generateReceiptSvg(activeMember, receiptRecord || {}, {
        positions,
        tierPositions,
        templateBackground: bgTemplate
      });
      const blob = await svgToPngBlob(svg, 1200, 1629);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Receipt_${receiptRecord?.callsign || 'HS9AS'}_${receiptRecord?.receiptNo || '0111'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Direct download failed:', e);
      handlePrint();
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async () => {
    setIsExporting(true);
    setExportModalOpen(true);
    setExportedImageUri(null);

    try {
      const svg = generateReceiptSvg(activeMember, receiptRecord || {}, {
        positions,
        tierPositions,
        templateBackground: bgTemplate
      });
      const blob = await svgToPngBlob(svg, 1200, 1629);
      if (blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setExportedImageUri(reader.result);
        };
        reader.readAsDataURL(blob);
      }
    } catch (err) {
      console.error('Failed to capture receipt:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const secretaryOfficer = officers.find(o => o.role === 'secretary' || o.isDefaultReceiptSigner) || officers[1] || officers[0];

  const resolveReceiptTier = () => {
    const rawType = (receiptRecord?.feeType || activeMember?.memberType || '').toLowerCase();
    if (rawType.includes('ตลอดชีพ') || receiptRecord?.amount === 2500) return RECEIPT_TIERS.lifetime;
    if (rawType.includes('กิตติมศักดิ์')) return RECEIPT_TIERS.honorary;
    if (rawType.includes('องค์กร')) return RECEIPT_TIERS.radioOrg;
    return RECEIPT_TIERS.fiveYear;
  };
  const activeReceiptTier = resolveReceiptTier();

  const getReceiptTierKey = () => {
    const rawType = (receiptRecord?.feeType || activeMember?.memberType || '').toLowerCase();
    if (rawType.includes('ตลอดชีพ') || receiptRecord?.amount === 2500) return 'lifetime';
    if (rawType.includes('กิตติมศักดิ์')) return 'honorary';
    if (rawType.includes('องค์กร')) return 'radioOrg';
    return 'fiveYear';
  };
  const activeTierKey = getReceiptTierKey();
  const tunedTierPos = tierPositions?.[activeTierKey] || DEFAULT_RECEIPT_TIER_POSITIONS[activeTierKey];

  const receiptSvg = generateReceiptSvg(activeMember, receiptRecord || {}, {
    positions,
    tierPositions,
    templateBackground: bgTemplate
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 pt-[max(calc(env(safe-area-inset-top,0px)+12px),24px)] pb-4 print:p-0 print:bg-white print:fixed print:inset-0 animate-in fade-in duration-200">
      
      {/* Container */}
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-sky-900/50 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">ใบเสร็จรับเงิน (Official Receipt)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                  เล่ม {receiptRecord?.bookNo || '03'} / เลขที่ {receiptRecord?.receiptNo || '0111'}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-300">
                สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา (HS9AS)
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDirectDownload}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-white text-xs font-semibold rounded-lg shadow transition cursor-pointer disabled:opacity-50"
              title="ดาวน์โหลดไฟล์ภาพใบเสร็จ .PNG ทันที"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isExporting ? 'กำลังสร้างภาพ...' : 'ดาวน์โหลดภาพ (PNG)'}</span>
              <span className="sm:hidden">{isExporting ? '...' : 'ดาวน์โหลด'}</span>
            </button>
            <button
              onClick={handlePrint}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-semibold rounded-lg shadow transition cursor-pointer disabled:opacity-50"
              title="พิมพ์ หรือ บันทึกภาพเข้าคลังภาพ / แชร์ไปยัง LINE"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isExporting ? 'กำลังสร้างภาพ...' : 'แชร์ LINE / พิมพ์'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= AUTHENTIC PHYSICAL RECEIPT BODY ================= */}
        <div 
          ref={printRef}
          className="p-4 sm:p-6 bg-slate-100/70 text-slate-900 font-sans overflow-y-auto flex-1 print:p-0 print:overflow-visible relative flex justify-center items-center"
        >
          <div 
            className="w-full max-w-[640px] bg-white rounded-xl shadow-xl border border-slate-300 overflow-hidden print:border-none print:shadow-none print:max-w-none flex justify-center"
            dangerouslySetInnerHTML={{ __html: receiptSvg }}
          />
        </div>

        {/* Action Buttons Bar (ชัดเจน ใช้งานง่ายทั้งมือถือและคอมพิวเตอร์) */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-center gap-2.5 print:hidden shrink-0">
          <button
            type="button"
            onClick={handleDirectDownload}
            disabled={isExporting}
            className="flex-1 min-w-[150px] py-2.5 px-4 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-sky-200" />
            <span>{isExporting ? 'กำลังบันทึกภาพ...' : 'ดาวน์โหลดภาพใบเสร็จ (PNG)'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={isExporting}
            className="flex-1 min-w-[150px] py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Printer className="w-4 h-4 text-emerald-200" />
            <span>พิมพ์ / แชร์เข้า LINE</span>
          </button>
        </div>

        {/* Bottom Note */}
        <div className="p-3 bg-white border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>ใบเสร็จรับเงินต้นฉบับจริง (Official Receipt Form) ตามระเบียบสมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">HS9AS • 0993000149408</span>
        </div>

        {/* Developer Credit Signature Line */}
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
        docTitle="ใบเสร็จรับเงิน (Official Receipt)"
        docDate={receiptRecord?.date || '16 พ.ย. 2569'}
        memberName={receiptRecord?.payerName || activeMember.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)'}
        memberCallsign={receiptRecord?.callsign || (activeMember.callsign && activeMember.callsign !== '-' ? activeMember.callsign : 'E26ECG')}
        fileName={`Receipt_${receiptRecord?.callsign || 'HS9AS'}_${receiptRecord?.receiptNo || '0111'}.png`}
        onDirectPrint={() => window.print()}
        onRetry={handlePrint}
      />

    </div>
  );
}
