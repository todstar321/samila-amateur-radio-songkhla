import React, { useState, useEffect, useRef } from 'react';
import { 
  Receipt, 
  Printer, 
  Move, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Search, 
  Download, 
  Upload, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  DollarSign, 
  FileText, 
  Sliders, 
  Eye, 
  EyeOff, 
  History, 
  FileCheck, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Maximize2,
  Copy
} from 'lucide-react';
import { thaiBahtText } from '../utils/thaiBahtText';
import SequenceSettingsModal from './SequenceSettingsModal';
import { 
  getCurrentReceiptInfo, 
  advanceReceiptSequence, 
  saveReceiptSequenceConfig, 
  formatBookNo, 
  formatReceiptNo 
} from '../utils/sequenceNumberUtils';

// Initial default positions (percentages of canvas width & height)
const DEFAULT_POSITIONS = {
  bookNo: { id: 'bookNo', label: 'เล่มที่', x: 15.0, y: 4.8, fontSize: 16, color: '#dc2626', bold: true },
  receiptNo: { id: 'receiptNo', label: 'เลขที่ใบเสร็จ', x: 82.5, y: 6.2, fontSize: 18, color: '#dc2626', bold: true },
  dateDay: { id: 'dateDay', label: 'วันที่ (ตัวเลข)', x: 52.8, y: 24.2, fontSize: 15, color: '#0f172a', bold: true },
  dateMonth: { id: 'dateMonth', label: 'เดือน (พ.ย.)', x: 67.5, y: 24.2, fontSize: 15, color: '#0f172a', bold: true },
  dateYear: { id: 'dateYear', label: 'พ.ศ. (2569)', x: 84.8, y: 24.2, fontSize: 15, color: '#0f172a', bold: true },
  requestNo: { id: 'requestNo', label: 'เลขรับคำขอที่', x: 22.0, y: 27.5, fontSize: 13, color: '#1e293b', bold: false },
  payerName: { id: 'payerName', label: 'ได้รับเงินจาก (ชื่อ-สกุล)', x: 21.0, y: 31.0, fontSize: 15, color: '#0f172a', bold: true },
  memberId: { id: 'memberId', label: 'หมายเลขสมาชิก', x: 79.5, y: 31.0, fontSize: 15, color: '#0f172a', bold: true },
  address: { id: 'address', label: 'ที่อยู่ผู้ชำระ', x: 10.0, y: 35.2, fontSize: 13.5, color: '#1e293b', bold: false },
  phone: { id: 'phone', label: 'โทรศัพท์', x: 70.5, y: 35.2, fontSize: 13.5, color: '#1e293b', bold: true },
  
  entryFeeCheck: { id: 'entryFeeCheck', label: 'ติ๊ก ค่าแรกเข้า 100 บ.', x: 6.8, y: 48.0, fontSize: 16, color: '#0f172a', bold: true },
  entryFeeAmount: { id: 'entryFeeAmount', label: 'ยอดเงินค่าแรกเข้า (100)', x: 83.0, y: 48.0, fontSize: 15, color: '#0f172a', bold: true },
  
  memberFeeCheck: { id: 'memberFeeCheck', label: 'ติ๊ก ค่าบำรุงสมาชิก', x: 6.8, y: 52.0, fontSize: 16, color: '#0f172a', bold: true },
  memberFeeTypeCheck: { id: 'memberFeeTypeCheck', label: 'ติ๊ก ประเภทสมาชิก (เช่น สามัญ 5 ปี)', x: 9.5, y: 64.5, fontSize: 16, color: '#0f172a', bold: true },
  memberFeeAmount: { id: 'memberFeeAmount', label: 'ยอดเงินค่าบำรุง (เช่น 500)', x: 83.0, y: 64.5, fontSize: 15, color: '#0f172a', bold: true },
  
  slashMark: { id: 'slashMark', label: 'ขีดเฉียงในช่องยอดเงิน', x: 84.0, y: 54.0, fontSize: 24, color: '#0f172a', bold: false },
  
  totalAmountNumber: { id: 'totalAmountNumber', label: 'รวมเป็นเงินทั้งสิ้น (ตัวเลข)', x: 79.5, y: 79.2, fontSize: 20, color: '#0f172a', bold: true },
  totalAmountText: { id: 'totalAmountText', label: 'รวมเป็นเงินทั้งสิ้น (ตัวอักษรไทย)', x: 26.0, y: 81.0, fontSize: 15, color: '#0f172a', bold: true },
  
  signature: { id: 'signature', label: 'ลายเซ็นผู้รับเงิน', x: 63.5, y: 88.0, fontSize: 16, color: '#1d4ed8', bold: true },
  signerPosition: { id: 'signerPosition', label: 'ตำแหน่งผู้รับเงิน (เช่น เลขาธิการ)', x: 60.0, y: 92.5, fontSize: 14, color: '#0f172a', bold: true },
};

export default function ReceiptManager({ 
  membersList = [], 
  currentUser, 
  onClose,
  initialMember = null
}) {
  // Navigation sub-tabs: 'issue' (ออกใบเสร็จ), 'designer' (ปรับแต่งเลื่อนตำแหน่ง), 'history' (ประวัติใบเสร็จ)
  const [activeTab, setActiveTab] = useState('issue');
  const [toastMessage, setToastMessage] = useState('');

  // Auto-running Receipt Number Settings & Rollover
  const [isSequenceModalOpen, setIsSequenceModalOpen] = useState(false);
  const [receiptSeqInfo, setReceiptSeqInfo] = useState(() => getCurrentReceiptInfo());
  const [bookNo, setBookNo] = useState(() => receiptSeqInfo.bookNo);
  const [receiptNumber, setReceiptNumber] = useState(() => receiptSeqInfo.numericNo);
  const [autoIncrement, setAutoIncrement] = useState(true);

  useEffect(() => {
    const handleSeqUpdate = () => {
      const info = getCurrentReceiptInfo();
      setReceiptSeqInfo(info);
      setBookNo(info.bookNo);
      setReceiptNumber(info.numericNo);
    };
    window.addEventListener('samila_sequence_changed', handleSeqUpdate);
    return () => window.removeEventListener('samila_sequence_changed', handleSeqUpdate);
  }, []);

  // Form Data for Current Receipt
  const [selectedMemberId, setSelectedMemberId] = useState(initialMember?.id || '');
  const [payerName, setPayerName] = useState(initialMember?.fullName || 'ว่าที่ ร.ต. ทีป์ชลิต ทองจันทร์');
  const [memberId, setMemberId] = useState(initialMember?.memberId || '369113');
  const [callsign, setCallsign] = useState(initialMember?.callsign || 'E26ECG');
  const [address, setAddress] = useState(initialMember?.currentAddress || initialMember?.registeredAddress || '16/74 ม.7 ต.โคกเคียน อ.เมืองนราธิวาส จ.นราธิวาส');
  const [phone, setPhone] = useState(initialMember?.phone || '093-792-5665');
  const [requestNo, setRequestNo] = useState('');
  
  // Date Fields (Defaults to today in Buddhist Era)
  const now = new Date();
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const [dateDay, setDateDay] = useState(String(now.getDate()));
  const [dateMonth, setDateMonth] = useState(thaiMonths[now.getMonth()]);
  const [dateYear, setDateYear] = useState(String(now.getFullYear() + 543));

  // Fee items
  const [entryFeeChecked, setEntryFeeChecked] = useState(false);
  const [entryFeeAmount, setEntryFeeAmount] = useState(100);

  const [memberFeeChecked, setMemberFeeChecked] = useState(true);
  const [memberFeeType, setMemberFeeType] = useState('standard5y'); // 'honorary', 'lifetime', 'standard5y', 'org', 'other'
  const [memberFeeAmount, setMemberFeeAmount] = useState(500);

  const [signerName, setSignerName] = useState(currentUser?.fullName || 'คุณทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)');
  const [signerPosition, setSignerPosition] = useState('เลขาธิการ');

  // Interactive Layout & Drag-and-Drop Positions
  const [positions, setPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_receipt_layout_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_POSITIONS;
  });

  const [selectedFieldKey, setSelectedFieldKey] = useState('payerName');
  const [bgImage, setBgImage] = useState('/receipt-template-sample.jpg');
  const [bgOpacity, setBgOpacity] = useState(90); // 0 - 100
  const [printOnlyText, setPrintOnlyText] = useState(false); // If true, hides template image and prints text only on physical paper
  const [useGraphicTemplate, setUseGraphicTemplate] = useState(false);

  // Dragging state
  const canvasRef = useRef(null);
  const [draggingField, setDraggingField] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Receipt History Records
  const [receiptHistory, setReceiptHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_receipt_records_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'rec-sample-01',
        bookNo: '03',
        receiptNo: '0111',
        date: '16 พ.ย. 2569',
        payerName: 'ว่าที่ ร.ต. ทีป์ชลิต ทองจันทร์',
        memberId: '369113',
        callsign: 'E26ECG',
        amount: 500,
        amountText: 'ห้าร้อยบาทถ้วน',
        feeType: 'สมาชิกสามัญ 5 ปี',
        signerPosition: 'เลขาธิการ',
        issuedAt: '16/11/2569 14:30 น.'
      }
    ];
  });

  const [historySearch, setHistorySearch] = useState('');

  // Total amount calculations
  const totalAmount = (entryFeeChecked ? Number(entryFeeAmount || 0) : 0) + (memberFeeChecked ? Number(memberFeeAmount || 0) : 0);
  const totalAmountText = thaiBahtText(totalAmount);

  // Formatted 4-digit receipt number
  const formattedReceiptNo = String(receiptNumber).padStart(4, '0');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Sync member selection
  const handleSelectMember = (memId) => {
    setSelectedMemberId(memId);
    const target = membersList.find(m => m.id === memId);
    if (!target) return;

    setPayerName(target.fullName || '');
    setMemberId(target.memberId || '');
    setCallsign(target.callsign && target.callsign !== '-' ? target.callsign : '');
    setAddress(target.currentAddress || target.registeredAddress || target.district || 'จ.สงขลา');
    setPhone(target.phone || '');

    if (target.memberType?.includes('ตลอดชีพ')) {
      setMemberFeeType('lifetime');
      setMemberFeeAmount(2500);
    } else if (target.memberType?.includes('กิตติมศักดิ์')) {
      setMemberFeeType('honorary');
      setMemberFeeAmount(0);
    } else {
      setMemberFeeType('standard5y');
      setMemberFeeAmount(500);
    }
    showToast(`ดึงข้อมูลสมาชิก "${target.fullName}" เข้าสู่ใบเสร็จแล้ว`);
  };

  // Fee Type change handler
  const handleFeeTypeChange = (type) => {
    setMemberFeeType(type);
    if (type === 'standard5y') setMemberFeeAmount(500);
    else if (type === 'lifetime') setMemberFeeAmount(2500);
    else if (type === 'honorary' || type === 'org') setMemberFeeAmount(0);
    else setMemberFeeAmount(0);
  };

  // Save receipt & Auto-Increment
  const handleSaveAndIssueReceipt = () => {
    const newRecord = {
      id: `rec-${Date.now()}`,
      bookNo,
      receiptNo: formattedReceiptNo,
      date: `${dateDay} ${dateMonth} ${dateYear}`,
      payerName,
      memberId,
      callsign,
      address,
      phone,
      entryFee: entryFeeChecked ? entryFeeAmount : 0,
      memberFee: memberFeeChecked ? memberFeeAmount : 0,
      feeType: memberFeeType === 'standard5y' ? 'สามัญ 5 ปี' : memberFeeType === 'lifetime' ? 'สามัญตลอดชีพ' : memberFeeType === 'honorary' ? 'กิตติมศักดิ์' : 'ค่าบำรุงสมาชิก',
      amount: totalAmount,
      amountText: totalAmountText,
      signerPosition,
      signerName,
      issuedAt: new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
    };

    const updatedHistory = [newRecord, ...receiptHistory];
    setReceiptHistory(updatedHistory);
    localStorage.setItem('samila_receipt_records_v1', JSON.stringify(updatedHistory));

    // Auto Increment & Book Rollover
    if (autoIncrement) {
      const adv = advanceReceiptSequence();
      const updatedInfo = getCurrentReceiptInfo();
      setReceiptSeqInfo(updatedInfo);
      setBookNo(adv.nextBook);
      setReceiptNumber(parseInt(adv.nextNo, 10));

      if (adv.didRollover) {
        showToast(`บันทึกใบเสร็จเล่มที่ ${adv.issuedBook} เลขที่ ${adv.issuedNo} เรียบร้อย! ครบ ${adv.sheetsPerBook} ใบต่อเล่ม -> ตัดขึ้นเล่มที่ ${adv.nextBook} เลขที่ ${adv.nextNo} อัตโนมัติ`);
      } else {
        showToast(`บันทึกใบเสร็จเล่มที่ ${adv.issuedBook} เลขที่ ${adv.issuedNo} เรียบร้อยแล้ว! รันเลขถัดไปเป็น ${adv.nextNo} อัตโนมัติ`);
      }
    } else {
      showToast(`บันทึกใบเสร็จเล่มที่ ${bookNo} เลขที่ ${formattedReceiptNo} เรียบร้อยแล้ว`);
    }
  };

  // Direct Browser Print
  const handlePrintReceipt = (textOnly = false) => {
    setPrintOnlyText(textOnly);
    handleSaveAndIssueReceipt();
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Fine-tuning nudge coordinates
  const handleNudge = (deltaX, deltaY) => {
    if (!selectedFieldKey || !positions[selectedFieldKey]) return;
    setPositions(prev => {
      const current = prev[selectedFieldKey];
      const updated = {
        ...prev,
        [selectedFieldKey]: {
          ...current,
          x: Number((current.x + deltaX).toFixed(1)),
          y: Number((current.y + deltaY).toFixed(1))
        }
      };
      localStorage.setItem('samila_receipt_layout_v2', JSON.stringify(updated));
      return updated;
    });
  };

  // Change font size of selected field
  const handleChangeFontSize = (delta) => {
    if (!selectedFieldKey || !positions[selectedFieldKey]) return;
    setPositions(prev => {
      const current = prev[selectedFieldKey];
      const updated = {
        ...prev,
        [selectedFieldKey]: {
          ...current,
          fontSize: Math.max(8, (current.fontSize || 14) + delta)
        }
      };
      localStorage.setItem('samila_receipt_layout_v2', JSON.stringify(updated));
      return updated;
    });
  };

  // Reset positions to default
  const handleResetPositions = () => {
    if (window.confirm("คุณต้องการรีเซ็ตตำแหน่งข้อความทั้งหมดกลับเป็นค่าเริ่มต้นตามแบบฟอร์มจริงหรือไม่?")) {
      setPositions(DEFAULT_POSITIONS);
      localStorage.removeItem('samila_receipt_layout_v2');
      showToast("รีเซ็ตตำแหน่งข้อความเรียบร้อยแล้ว");
    }
  };

  // Upload Custom Image Template
  const handleUploadTemplate = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgImage(event.target.result);
        showToast("นำเข้ารูปแบบใบเสร็จตัวจริงเรียบร้อยแล้ว! สามารถเลื่อนตำแหน่งข้อความให้ตรงช่องได้ทันที");
      };
      reader.readAsDataURL(file);
    }
  };

  // Mouse / Touch Dragging Logic
  const handleMouseDown = (fieldKey, e) => {
    if (activeTab !== 'designer') return;
    e.stopPropagation();
    setSelectedFieldKey(fieldKey);
    setDraggingField(fieldKey);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const current = positions[fieldKey];
    
    // Calculate click offset relative to field center
    const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const clickYPercent = ((e.clientY - rect.top) / rect.height) * 100;
    setDragOffset({
      x: clickXPercent - current.x,
      y: clickYPercent - current.y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingField || activeTab !== 'designer') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const mouseXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseYPercent = ((e.clientY - rect.top) / rect.height) * 100;

    const newX = Math.max(1, Math.min(95, Number((mouseXPercent - dragOffset.x).toFixed(1))));
    const newY = Math.max(1, Math.min(98, Number((mouseYPercent - dragOffset.y).toFixed(1))));

    setPositions(prev => ({
      ...prev,
      [draggingField]: {
        ...prev[draggingField],
        x: newX,
        y: newY
      }
    }));
  };

  const handleMouseUp = () => {
    if (draggingField) {
      setDraggingField(null);
      localStorage.setItem('samila_receipt_layout_v2', JSON.stringify(positions));
    }
  };

  // Filtered History
  const filteredHistory = receiptHistory.filter(r => {
    const q = historySearch.toLowerCase();
    return (
      r.receiptNo.includes(q) ||
      r.bookNo.includes(q) ||
      r.payerName.toLowerCase().includes(q) ||
      (r.callsign && r.callsign.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 p-2 sm:p-5 flex flex-col font-sans" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[200] bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-cyan-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= HEADER & TAB BAR ================= */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Receipt className="w-5 h-5 text-emerald-600" />
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>ระบบใบเสร็จรับเงิน & ตัวออกแบบพิกัดพิมพ์</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-md border border-emerald-300">
                  Auto-Run #
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา • รันเลขที่อัตโนมัติ • เลื่อนพิกัดข้อความได้อิสระ • พิมพ์ทับกระดาษจริงได้ 100%
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('issue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'issue'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>ออกใบเสร็จ (Issue)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('designer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'designer'
                ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span>ปรับเลื่อนตำแหน่งข้อความ (Designer)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>ประวัติใบเสร็จ ({receiptHistory.length})</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
            >
              ✕ ปิด
            </button>
          )}
        </div>
      </div>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
        
        {/* ================= LEFT CONTROLS PANEL (COL 1-5) ================= */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* ----------------- SUB-TAB 1: ISSUE RECEIPT ----------------- */}
          {activeTab === 'issue' && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              
              {/* Auto-running Number Settings & Rollover */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-3.5 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>การรันเลขที่ใบเสร็จ & ระบบตัดเล่มอัตโนมัติ</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSequenceModalOpen(true)}
                      className="px-2 py-0.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[11px] font-bold shadow-2xs transition cursor-pointer"
                    >
                      ⚙️ ตั้งค่าตัดเล่ม
                    </button>
                    <label className="flex items-center gap-1 text-xs font-bold text-emerald-800 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoIncrement} 
                        onChange={(e) => setAutoIncrement(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" 
                      />
                      <span>รันเลขอัตโนมัติ</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">เล่มที่ (Book No.)</label>
                    <input 
                      type="text" 
                      value={bookNo} 
                      onChange={(e) => {
                        setBookNo(e.target.value);
                        saveReceiptSequenceConfig({ currentBook: parseInt(e.target.value || '1', 10) });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold text-red-600 shadow-2xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">เลขที่ใบเสร็จ (Receipt No.)</label>
                    <input 
                      type="number" 
                      value={receiptNumber} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setReceiptNumber(val);
                        saveReceiptSequenceConfig({ currentNo: val });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold text-red-600 shadow-2xs" 
                    />
                  </div>
                </div>
                <div className="text-[10px] text-emerald-800 leading-relaxed bg-white/70 p-2 rounded-lg border border-emerald-200">
                  <div>
                    ฉบับปัจจุบัน: <strong className="font-mono text-red-600">เล่มที่ {bookNo} เลขที่ {formattedReceiptNo}</strong>
                    <span className="ml-1 text-slate-500 font-mono">
                      (ใบที่ {((receiptNumber - 1) % receiptSeqInfo.sheetsPerBook) + 1} / {receiptSeqInfo.sheetsPerBook} ใบต่อเล่ม)
                    </span>
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    {((receiptNumber - 1) % receiptSeqInfo.sheetsPerBook) + 1 >= receiptSeqInfo.sheetsPerBook ? (
                      <span className="text-amber-700 font-bold">
                        ⚡ ฉบับถัดไปจะตัดขึ้นเล่มใหม่: เล่มที่ {formatBookNo(parseInt(bookNo || '1', 10) + 1, 2)} เลขที่ 0001 ทันที
                      </span>
                    ) : (
                      <span>
                        ฉบับถัดไป: เล่มที่ {bookNo} เลขที่ {String(receiptNumber + 1).padStart(4, '0')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 1-Click Select Member Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>เลือกเพื่อนสมาชิกจากฐานข้อมูล (ดึงข้อมูลอัตโนมัติ):</span>
                  <span className="text-[10px] text-cyan-700 font-mono">1-Click Fill</span>
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => handleSelectMember(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-cyan-500 transition"
                >
                  <option value="">-- พิมพ์กรอกเอง หรือเลือกสมาชิกในระบบ --</option>
                  {membersList.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.callsign && m.callsign !== '-' ? m.callsign : 'รอคอนไซน์'} • {m.fullName} (#{m.memberId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Member Details Input */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">ได้รับเงินจาก (ชื่อ - นามสกุล):</label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="เช่น ว่าที่ ร.ต. ทิพย์ชลิต ทองจันทร์"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">หมายเลขสมาชิก:</label>
                    <input
                      type="text"
                      value={memberId}
                      onChange={(e) => setMemberId(e.target.value)}
                      placeholder="เช่น 369113"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">สัญญาณเรียกขาน:</label>
                    <input
                      type="text"
                      value={callsign}
                      onChange={(e) => setCallsign(e.target.value)}
                      placeholder="เช่น E26ECG"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">ที่อยู่ผู้ชำระ:</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="เช่น 16/74 ม.7 ต.โคกเคียน อ.เมืองนราธิวาส จ.นราธิวาส"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">เบอร์โทรศัพท์:</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="093-792-5665"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">เลขรับคำขอที่ (ถ้ามี):</label>
                    <input
                      type="text"
                      value={requestNo}
                      onChange={(e) => setRequestNo(e.target.value)}
                      placeholder="เช่น 69-0112"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Date Inputs */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-xs font-bold text-slate-700 mb-1.5">วันที่ออกใบเสร็จ (พ.ศ.):</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">วัน</span>
                    <input 
                      type="text" 
                      value={dateDay} 
                      onChange={(e) => setDateDay(e.target.value)} 
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-center" 
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">เดือน</span>
                    <input 
                      type="text" 
                      value={dateMonth} 
                      onChange={(e) => setDateMonth(e.target.value)} 
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-center" 
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">พ.ศ.</span>
                    <input 
                      type="text" 
                      value={dateYear} 
                      onChange={(e) => setDateYear(e.target.value)} 
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-center" 
                    />
                  </div>
                </div>
              </div>

              {/* Fee Items Section */}
              <div className="space-y-2.5 pt-1">
                <span className="block text-xs font-bold text-slate-900 border-b border-slate-100 pb-1">
                  รายการชำระเงินตามใบเสร็จ:
                </span>

                {/* ค่าธรรมเนียมแรกเข้า */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input 
                      type="checkbox" 
                      checked={entryFeeChecked} 
                      onChange={(e) => setEntryFeeChecked(e.target.checked)}
                      className="rounded text-emerald-600 w-4 h-4" 
                    />
                    <span>ค่าธรรมเนียมแรกเข้า</span>
                  </label>
                  <div className="flex items-center gap-1 font-mono font-bold text-xs text-slate-900">
                    <span>100</span>
                    <span className="text-slate-400 font-sans text-[11px]">บาท</span>
                  </div>
                </div>

                {/* ค่าบำรุงสมาชิก */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900">
                      <input 
                        type="checkbox" 
                        checked={memberFeeChecked} 
                        onChange={(e) => setMemberFeeChecked(e.target.checked)}
                        className="rounded text-emerald-600 w-4 h-4" 
                      />
                      <span>ค่าบำรุงสมาชิก</span>
                    </label>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      {memberFeeAmount.toLocaleString()} บาท
                    </span>
                  </div>

                  {memberFeeChecked && (
                    <div className="pl-6 space-y-1.5 text-xs text-slate-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="feeType" 
                          checked={memberFeeType === 'standard5y'} 
                          onChange={() => handleFeeTypeChange('standard5y')} 
                          className="text-emerald-600"
                        />
                        <span>สามัญ 5 ปี (ชำระครั้งละ 500 บาท)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="feeType" 
                          checked={memberFeeType === 'lifetime'} 
                          onChange={() => handleFeeTypeChange('lifetime')} 
                          className="text-emerald-600"
                        />
                        <span>สามัญตลอดชีพ (ชำระครั้งเดียว 2,500 บาท)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="feeType" 
                          checked={memberFeeType === 'honorary'} 
                          onChange={() => handleFeeTypeChange('honorary')} 
                          className="text-emerald-600"
                        />
                        <span>กิตติมศักดิ์ (ไม่ต้องชำระค่าบำรุง)</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Total Summary */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl text-white space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-100">
                    <span>รวมเป็นเงินทั้งสิ้น:</span>
                    <span className="text-xl font-bold font-mono text-white">฿{totalAmount.toLocaleString()} บาท</span>
                  </div>
                  <div className="text-xs text-emerald-100 font-medium pt-0.5">
                    ({totalAmountText})
                  </div>
                </div>

                {/* Signer Info */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-0.5">ผู้ลงนามรับเงิน:</label>
                    <input 
                      type="text" 
                      value={signerName} 
                      onChange={(e) => setSignerName(e.target.value)} 
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-0.5">ตำแหน่ง:</label>
                    <input 
                      type="text" 
                      value={signerPosition} 
                      onChange={(e) => setSignerPosition(e.target.value)} 
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs" 
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrintReceipt(false)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>🖨️ สั่งพิมพ์ใบเสร็จเต็มใบ (บันทึก & รันเลขถัดไป)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePrintReceipt(true)}
                    className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded-xl text-xs shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
                    title="พิมพ์เฉพาะข้อความลงกระดาษจริงของสมาคมโดยไม่พิมพ์เส้นขอบและรูปภาพ"
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>📄 พิมพ์เฉพาะข้อความทับลงกระดาษจริง (Text-Only Mode)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAndIssueReceipt}
                    className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>บันทึกประวัติใบเสร็จ & รันเลขอัตโนมัติ (ยังไม่พิมพ์)</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ----------------- SUB-TAB 2: DESIGNER & POSITION MOVE ----------------- */}
          {activeTab === 'designer' && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cyan-200 shadow-xs space-y-4">
              
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Move className="w-4 h-4 text-cyan-600" />
                  <span>เครื่องมือปรับตำแหน่งข้อความ (Position Designer)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ท่านสามารถคลิกลากข้อความบนรูปภาพได้โดยตรง หรือใช้ปุ่มลูกศรเพื่อขยับตำแหน่งทีละนิดให้ตรงช่องกระดาษจริงเป๊ะ 100%
                </p>
              </div>

              {/* Upload Real Receipt Image */}
              <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-200 space-y-2">
                <span className="block text-xs font-bold text-cyan-900">
                  📷 นำเข้ารูปแบบใบเสร็จตัวจริง:
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  เมื่อท่านสแกนหรือถ่ายรูปใบเสร็จตัวจริง สามารถกดเลือกไฟล์ภาพเพื่อโยนรูปเข้ามาเป็นพื้นหลังอ้างอิงได้ทันที
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <label className="flex-1 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold cursor-pointer text-center shadow-xs transition flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>เลือกไฟล์รูปใบเสร็จจริง</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleUploadTemplate}
                      className="hidden" 
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setBgImage('/receipt-template-sample.jpg')}
                    className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition"
                    title="ใช้รูปถ่ายใบเสร็จจริงของสมาคมที่แนบมา"
                  >
                    ใช้รูปต้นแบบ
                  </button>
                </div>

                {/* Opacity slider */}
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>ความโปร่งแสงของรูปใบเสร็จพื้นหลัง:</span>
                    <span className="font-mono text-cyan-700">{bgOpacity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={bgOpacity} 
                    onChange={(e) => setBgOpacity(Number(e.target.value))}
                    className="w-full accent-cyan-600" 
                  />
                </div>
              </div>

              {/* Select Active Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เลือกข้อความที่ต้องการปรับพิกัดตำแหน่ง:
                </label>
                <select
                  value={selectedFieldKey}
                  onChange={(e) => setSelectedFieldKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-cyan-900 focus:bg-white focus:border-cyan-500"
                >
                  {Object.values(positions).map(field => (
                    <option key={field.id} value={field.id}>
                      {field.label} (X: {field.x}%, Y: {field.y}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Nudge Direction Buttons */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="block text-xs font-bold text-slate-800 text-center">
                  ปุ่มขยับตำแหน่งทีละนิด (Nudge Controls)
                </span>
                
                <div className="flex flex-col items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleNudge(0, -0.4)}
                    className="p-2.5 bg-white hover:bg-cyan-50 text-slate-800 border border-slate-300 hover:border-cyan-400 rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="เลื่อนขึ้นด้านบน"
                  >
                    <ArrowUp className="w-4 h-4 text-cyan-700" />
                    <span>เลื่อนขึ้น</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleNudge(-0.4, 0)}
                      className="p-2.5 bg-white hover:bg-cyan-50 text-slate-800 border border-slate-300 hover:border-cyan-400 rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                      title="เลื่อนไปทางซ้าย"
                    >
                      <ArrowLeft className="w-4 h-4 text-cyan-700" />
                      <span>เลื่อนซ้าย</span>
                    </button>

                    <div className="p-2 bg-slate-200/70 rounded-lg text-center font-mono text-[11px] text-slate-700 min-w-[90px]">
                      X: {positions[selectedFieldKey]?.x}%<br />
                      Y: {positions[selectedFieldKey]?.y}%
                    </div>

                    <button
                      type="button"
                      onClick={() => handleNudge(0.4, 0)}
                      className="p-2.5 bg-white hover:bg-cyan-50 text-slate-800 border border-slate-300 hover:border-cyan-400 rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                      title="เลื่อนไปทางขวา"
                    >
                      <span>เลื่อนขวา</span>
                      <ArrowRight className="w-4 h-4 text-cyan-700" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNudge(0, 0.4)}
                    className="p-2.5 bg-white hover:bg-cyan-50 text-slate-800 border border-slate-300 hover:border-cyan-400 rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="เลื่อนลงด้านล่าง"
                  >
                    <ArrowDown className="w-4 h-4 text-cyan-700" />
                    <span>เลื่อนลง</span>
                  </button>
                </div>
              </div>

              {/* Font Size & Color for Selected Field */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-slate-600 font-semibold mb-1">ขนาดอักษร:</span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleChangeFontSize(-1)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded font-bold hover:bg-slate-100"
                    >
                      -A
                    </button>
                    <span className="font-mono font-bold text-slate-800">
                      {positions[selectedFieldKey]?.fontSize || 14}px
                    </span>
                    <button
                      type="button"
                      onClick={() => handleChangeFontSize(1)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded font-bold hover:bg-slate-100"
                    >
                      +A
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-slate-600 font-semibold mb-1">สีตัวอักษร:</span>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {['#0f172a', '#dc2626', '#1d4ed8', '#047857'].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setPositions(prev => {
                            const updated = {
                              ...prev,
                              [selectedFieldKey]: { ...prev[selectedFieldKey], color }
                            };
                            localStorage.setItem('samila_receipt_layout_v2', JSON.stringify(updated));
                            return updated;
                          });
                        }}
                        style={{ backgroundColor: color }}
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          positions[selectedFieldKey]?.color === color ? 'border-amber-400 scale-110 shadow' : 'border-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Reset & Save Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleResetPositions}
                  className="w-1/2 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>รีเซ็ตค่าเริ่มต้น</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('samila_receipt_layout_v2', JSON.stringify(positions));
                    showToast("บันทึกตำแหน่งพิกัดข้อความทั้งหมดเรียบร้อยแล้ว");
                  }}
                  className="w-1/2 py-2 px-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกตำแหน่ง</span>
                </button>
              </div>

            </div>
          )}

          {/* ----------------- SUB-TAB 3: RECEIPT HISTORY ----------------- */}
          {activeTab === 'history' && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>ประวัติใบเสร็จรับเงินที่ออกแล้ว</span>
                </h3>
                <span className="text-xs font-mono font-bold text-slate-500">
                  ทั้งหมด {receiptHistory.length} ฉบับ
                </span>
              </div>

              {/* Search History */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  value={historySearch} 
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="ค้นหาด้วยเลขที่ใบเสร็จ, ชื่อนามสกุล, หรือคอลไซน์..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" 
                />
              </div>

              {/* Records List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredHistory.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400">ไม่พบประวัติใบเสร็จที่ค้นหา</p>
                ) : (
                  filteredHistory.map(rec => (
                    <div 
                      key={rec.id}
                      className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          เล่ม {rec.bookNo} เลขที่ {rec.receiptNo}
                        </span>
                        <span className="font-bold font-mono text-emerald-700 text-sm">
                          ฿{rec.amount.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-xs">
                        <strong className="text-slate-900">{rec.payerName}</strong>
                        {rec.callsign && (
                          <span className="font-mono font-bold text-amber-700 ml-1.5">({rec.callsign})</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                        <span>{rec.date}</span>
                        <span>{rec.feeType}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* ================= RIGHT LIVE PREVIEW & DRAG CANVAS (COL 6-12) ================= */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* Canvas Mode Indicator & Options Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">
                {activeTab === 'designer' ? '🎯 โหมดจัดวางพิกัด: คลิกลากข้อความได้อิสระ' : '👁️ ตัวอย่างใบเสร็จจริง (Live Preview)'}
              </span>
              {activeTab === 'designer' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300 animate-pulse">
                  Designer Mode
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                <input 
                  type="checkbox" 
                  checked={printOnlyText} 
                  onChange={(e) => setPrintOnlyText(e.target.checked)}
                  className="rounded text-cyan-600 w-3.5 h-3.5" 
                />
                <span>ซ่อนพื้นหลัง (พิมพ์เฉพาะข้อความ)</span>
              </label>

              <button
                type="button"
                onClick={() => handlePrintReceipt(printOnlyText)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>พิมพ์ใบเสร็จ</span>
              </button>
            </div>
          </div>

          {/* ================= PRINTABLE RECEIPT CANVAS ================= */}
          <div className="bg-slate-200/70 p-2 sm:p-4 rounded-2xl border border-slate-300 flex justify-center overflow-auto shadow-inner">
            
            <div 
              ref={canvasRef}
              id="printable-receipt-canvas"
              className="relative bg-white shadow-2xl border border-slate-300 rounded-sm overflow-hidden select-none"
              style={{
                width: '100%',
                maxWidth: '680px',
                aspectRatio: '1 / 1.39', // Matches standard physical receipt form
              }}
            >
              {/* Background Physical Receipt Image (or Template) */}
              {!printOnlyText && bgImage && (
                <img 
                  src={bgImage} 
                  alt="Receipt Template Background" 
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none transition-opacity"
                  style={{ opacity: bgOpacity / 100 }}
                />
              )}

              {/* Fallback Graphic Template Border if User hides photo or image not loaded */}
              {!printOnlyText && (!bgImage || useGraphicTemplate) && (
                <div className="absolute inset-0 border-4 border-blue-900/30 m-3 pointer-events-none" />
              )}

              {/* ================= DYNAMIC TEXT FIELDS RENDERED AT (X, Y) COORDINATES ================= */}
              
              {/* 1. เล่มที่ */}
              <div
                onMouseDown={(e) => handleMouseDown('bookNo', e)}
                style={{
                  position: 'absolute',
                  left: `${positions.bookNo.x}%`,
                  top: `${positions.bookNo.y}%`,
                  fontSize: `${positions.bookNo.fontSize}px`,
                  color: positions.bookNo.color,
                  fontWeight: positions.bookNo.bold ? 'bold' : 'normal',
                }}
                className={`font-mono cursor-move transition-shadow ${
                  activeTab === 'designer' && selectedFieldKey === 'bookNo'
                    ? 'ring-2 ring-cyan-500 ring-offset-1 bg-cyan-100/70 px-1 rounded'
                    : activeTab === 'designer' ? 'hover:ring-1 hover:ring-cyan-300 px-0.5' : ''
                }`}
                title="เล่มที่"
              >
                {bookNo}
              </div>

              {/* 2. เลขที่ */}
              <div
                onMouseDown={(e) => handleMouseDown('receiptNo', e)}
                style={{
                  position: 'absolute',
                  left: `${positions.receiptNo.x}%`,
                  top: `${positions.receiptNo.y}%`,
                  fontSize: `${positions.receiptNo.fontSize}px`,
                  color: positions.receiptNo.color,
                  fontWeight: positions.receiptNo.bold ? 'bold' : 'normal',
                }}
                className={`font-mono cursor-move transition-shadow tracking-wider ${
                  activeTab === 'designer' && selectedFieldKey === 'receiptNo'
                    ? 'ring-2 ring-cyan-500 ring-offset-1 bg-cyan-100/70 px-1 rounded'
                    : activeTab === 'designer' ? 'hover:ring-1 hover:ring-cyan-300 px-0.5' : ''
                }`}
                title="เลขที่ใบเสร็จ"
              >
                {formattedReceiptNo}
              </div>

              {/* 3. วันที่ */}
              <div
                onMouseDown={(e) => handleMouseDown('dateDay', e)}
                style={{
                  position: 'absolute',
                  left: `${positions.dateDay.x}%`,
                  top: `${positions.dateDay.y}%`,
                  fontSize: `${positions.dateDay.fontSize}px`,
                  color: positions.dateDay.color,
                  fontWeight: positions.dateDay.bold ? 'bold' : 'normal',
                }}
                className={`font-mono cursor-move transition-shadow ${
                  activeTab === 'designer' && selectedFieldKey === 'dateDay'
                    ? 'ring-2 ring-cyan-500 ring-offset-1 bg-cyan-100/70 px-1 rounded'
                    : activeTab === 'designer' ? 'hover:ring-1 hover:ring-cyan-300 px-0.5' : ''
                }`}
                title="วันที่"
              >
                {dateDay}
              </div>

              {/* 4. เดือน */}
              <div
                onMouseDown={(e) => handleMouseDown('dateMonth', e)}
                style={{
                  position: 'absolute',
                  left: `${positions.dateMonth.x}%`,
                  top: `${positions.dateMonth.y}%`,
                  fontSize: `${positions.dateMonth.fontSize}px`,
                  color: positions.dateMonth.color,
                  fontWeight: positions.dateMonth.bold ? 'bold' : 'normal',
                }}
                className={`cursor-move transition-shadow ${
                  activeTab === 'designer' && selectedFieldKey === 'dateMonth'
                    ? 'ring-2 ring-cyan-500 ring-offset-1 bg-cyan-100/70 px-1 rounded'
                    : activeTab === 'designer' ? 'hover:ring-1 hover:ring-cyan-300 px-0.5' : ''
                }`}
                title="เดือน"
              >
                {dateMonth}
              </div>

              {/* 5. พ.ศ. */}
              <div
                onMouseDown={(e) => handleMouseDown('dateYear', e)}
                style={{
                  position: 'absolute',
                  left: `${positions.dateYear.x}%`,
                  top: `${positions.dateYear.y}%`,
                  fontSize: `${positions.dateYear.fontSize}px`,
                  color: positions.dateYear.color,
                  fontWeight: positions.dateYear.bold ? 'bold' : 'normal',
                }}
                className={`font-mono cursor-move transition-shadow ${
                  activeTab === 'designer' && selectedFieldKey === 'dateYear'
                    ? 'ring-2 ring-cyan-500 ring-offset-1 bg-cyan-100/70 px-1 rounded'
                    : activeTab === 'designer' ? 'hover:ring-1 hover:ring-cyan-300 px-0.5' : ''
                }`}
                title="พ.ศ."
              >
                {dateYear}
              </div>

              {/* 6. เลขรับคำขอที่ */}
              {requestNo && (
                <div
                  onMouseDown={(e) => handleMouseDown('requestNo', e)}
                  style={{
                    position: 'absolute',
                    left: `${positions.requestNo.x}%`,
                    top: `${positions.requestNo.y}%`,
                    fontSize: `${positions.requestNo.fontSize}px`,
                    color: positions.requestNo.color,
                    fontWeight: positions.requestNo.bold ? 'bold' : 'normal',
                  }}
                  className={`font-mono cursor-move transition-shadow ${
                    activeTab === 'designer' && selectedFieldKey === 'requestNo'
                      ? 'ring-2 ring-cyan-500 ring-offset-1 bg-cyan-100/70 px-1 rounded'
                      : activeTab === 'designer' ? 'hover:ring-1 hover:ring-cyan-300 px-0.5' : ''
                  }`}
                  title="เลขรับคำขอที่"
                >
                  {requestNo}
                </div>
              )}

              {/* 7. ได้รับเงินจาก */}
              <div
                onMouseDown={(e) => handleMouseDown('payerName', e)}
                style={{
                  position: 'absolute',
                  left: `${positions.payerName.x}%`,
                  top: `${positions.payerName.y}%`,
                  fontSize: `${positions.payerName.fontSize}px`,
                  color: positions.payerName.color,
                  fontWeight: positions.payerName.bold ? 'bold' : 'normal',
                }}
                className={`cursor-move transition-shadow whitespace-nowrap ${
                  activeTab === 'designer' && selectedFieldKey === 'payerName'
                    ? 'ring-2 ring-cyan-500 ring-offset-1 bg-cyan-100/70 px-1 rounded'
                    : activeTab === 'designer' ? 'hover:ring-1 hover:ring-cyan-300 px-0.5' : ''
                }`}
                title="ได้รับเงินจาก"
              >
                {payerName}
              </div>

              {/* 8. หมายเลขสมาชิก */}
              <div
                onMouseDown={(e) => handleMouseDown('memberId', e)}
                style={{
                  position: 'absolute',
                  left: `${positions.memberId.x}%`,
                  top: `${positions.memberId.y}%`,
                  fontSize: `${positions.memberId.fontSize}px`,
                  color: positions.memberId.color,
                  fontWeight: positions.memberId.bold ? 'bold' : 'normal',
                }}
                className={`font-mono cursor-move transition-shadow whitespace-nowrap tracking-wider ${
                  activeTab === 'designer' && selectedFieldKey === 'memberId'
                    ? 'ring-2 ring-cyan-500 ring-offset-1 bg-cyan-100/70 px-1 rounded'
                    : activeTab === 'designer' ? 'hover:ring-1 hover:ring-cyan-300 px-0.5' : ''
                }`}
                title="หมายเลขสมาชิก"
              >
                {memberId}
              </div>

              {/* 9. ที่อยู่ */}
              <div
                onMouseDown={(e) => handleMouseDown('address', e)}
                style={{
                  position: 'absolute',
                  left: `${positions.address.x}%`,
                  top: `${positions.address.y}%`,
                  fontSize: `${positions.address.fontSize}px`,
                  color: positions.address.color,
                  fontWeight: positions.address.bold ? 'bold' : 'normal',
                  maxWidth: '58%',
                }}
                className={`cursor-move transition-shadow truncate ${
                  activeTab === 'designer' && selectedFieldKey === 'address'
                    ? 'ring-2 ring-cyan-500 ring-offset-1 bg-cyan-100/70 px-1 rounded'
                    : activeTab === 'designer' ? 'hover:ring-1 hover:ring-cyan-300 px-0.5' : ''
                }`}
                title="ที่อยู่"
              >
                {address}
              </div>

              {/* 10. เบอร์โทรศัพท์ */}
              <div
                onMouseDown={(e) => handleMouseDown('phone', e)}
                style={{
                  position: 'absolute',
                  left: `${positions.phone.x}%`,
                  top: `${positions.phone.y}%`,
                  fontSize: `${positions.phone.fontSize}px`,
                  color: positions.phone.color,
                  fontWeight: positions.phone.bold ? 'bold' : 'normal',
                }}
                className={`font-mono cursor-move transition-shadow whitespace-nowrap ${
                  activeTab === 'designer' && selectedFieldKey === 'phone'
                    ? 'ring-2 ring-cyan-500 ring-offset-1 bg-cyan-100/70 px-1 rounded'
                    : activeTab === 'designer' ? 'hover:ring-1 hover:ring-cyan-300 px-0.5' : ''
                }`}
                title="โทรศัพท์"
              >
                {phone}
              </div>

              {/* 11. ติ๊กค่าแรกเข้า */}
              {entryFeeChecked && (
                <>
                  <div
                    onMouseDown={(e) => handleMouseDown('entryFeeCheck', e)}
                    style={{
                      position: 'absolute',
                      left: `${positions.entryFeeCheck.x}%`,
                      top: `${positions.entryFeeCheck.y}%`,
                      fontSize: `${positions.entryFeeCheck.fontSize}px`,
                      color: positions.entryFeeCheck.color,
                    }}
                    className="font-bold cursor-move"
                  >
                    ✓
                  </div>
                  <div
                    onMouseDown={(e) => handleMouseDown('entryFeeAmount', e)}
                    style={{
                      position: 'absolute',
                      left: `${positions.entryFeeAmount.x}%`,
                      top: `${positions.entryFeeAmount.y}%`,
                      fontSize: `${positions.entryFeeAmount.fontSize}px`,
                      color: positions.entryFeeAmount.color,
                    }}
                    className="font-mono font-bold cursor-move"
                  >
                    100
                  </div>
                </>
              )}

              {/* 12. ติ๊กค่าบำรุงสมาชิก */}
              {memberFeeChecked && (
                <>
                  <div
                    onMouseDown={(e) => handleMouseDown('memberFeeCheck', e)}
                    style={{
                      position: 'absolute',
                      left: `${positions.memberFeeCheck.x}%`,
                      top: `${positions.memberFeeCheck.y}%`,
                      fontSize: `${positions.memberFeeCheck.fontSize}px`,
                      color: positions.memberFeeCheck.color,
                    }}
                    className="font-bold cursor-move"
                  >
                    ✓
                  </div>

                  {/* ติ๊กประเภทสมาชิกย่อย */}
                  <div
                    onMouseDown={(e) => handleMouseDown('memberFeeTypeCheck', e)}
                    style={{
                      position: 'absolute',
                      left: `${positions.memberFeeTypeCheck.x}%`,
                      top: memberFeeType === 'standard5y' ? `${positions.memberFeeTypeCheck.y}%` : memberFeeType === 'lifetime' ? `${positions.memberFeeTypeCheck.y - 4.0}%` : `${positions.memberFeeTypeCheck.y - 8.0}%`,
                      fontSize: `${positions.memberFeeTypeCheck.fontSize}px`,
                      color: positions.memberFeeTypeCheck.color,
                    }}
                    className="font-bold cursor-move"
                  >
                    ✓
                  </div>

                  {/* ยอดเงินค่าบำรุงในช่องตารางขวา */}
                  <div
                    onMouseDown={(e) => handleMouseDown('memberFeeAmount', e)}
                    style={{
                      position: 'absolute',
                      left: `${positions.memberFeeAmount.x}%`,
                      top: `${positions.memberFeeAmount.y}%`,
                      fontSize: `${positions.memberFeeAmount.fontSize}px`,
                      color: positions.memberFeeAmount.color,
                    }}
                    className="font-mono font-bold cursor-move"
                  >
                    {memberFeeAmount}
                  </div>
                </>
              )}

              {/* ขีดเฉียง / ช่องว่างยอดเงิน */}
              <div
                onMouseDown={(e) => handleMouseDown('slashMark', e)}
                style={{
                  position: 'absolute',
                  left: `${positions.slashMark.x}%`,
                  top: `${positions.slashMark.y}%`,
                  fontSize: `${positions.slashMark.fontSize}px`,
                  color: positions.slashMark.color,
                }}
                className="font-serif cursor-move select-none"
              >
                /
              </div>

              {/* 13. รวมเป็นเงินทั้งสิ้น (ตัวเลข) */}
              <div
                onMouseDown={(e) => handleMouseDown('totalAmountNumber', e)}
                style={{
                  position: 'absolute',
                  left: `${positions.totalAmountNumber.x}%`,
                  top: `${positions.totalAmountNumber.y}%`,
                  fontSize: `${positions.totalAmountNumber.fontSize}px`,
                  color: positions.totalAmountNumber.color,
                  fontWeight: positions.totalAmountNumber.bold ? 'bold' : 'normal',
                }}
                className={`font-mono cursor-move transition-shadow ${
                  activeTab === 'designer' && selectedFieldKey === 'totalAmountNumber'
                    ? 'ring-2 ring-cyan-500 ring-offset-1 bg-cyan-100/70 px-1 rounded'
                    : activeTab === 'designer' ? 'hover:ring-1 hover:ring-cyan-300 px-0.5' : ''
                }`}
                title="รวมเป็นเงินทั้งสิ้น (ตัวเลข)"
              >
                {totalAmount}
              </div>

              {/* 14. รวมเป็นเงินทั้งสิ้น (ตัวอักษร) */}
              <div
                onMouseDown={(e) => handleMouseDown('totalAmountText', e)}
                style={{
                  position: 'absolute',
                  left: `${positions.totalAmountText.x}%`,
                  top: `${positions.totalAmountText.y}%`,
                  fontSize: `${positions.totalAmountText.fontSize}px`,
                  color: positions.totalAmountText.color,
                  fontWeight: positions.totalAmountText.bold ? 'bold' : 'normal',
                }}
                className={`cursor-move transition-shadow whitespace-nowrap ${
                  activeTab === 'designer' && selectedFieldKey === 'totalAmountText'
                    ? 'ring-2 ring-cyan-500 ring-offset-1 bg-cyan-100/70 px-1 rounded'
                    : activeTab === 'designer' ? 'hover:ring-1 hover:ring-cyan-300 px-0.5' : ''
                }`}
                title="รวมเป็นเงินทั้งสิ้น (ตัวอักษร)"
              >
                {totalAmountText}
              </div>

              {/* 15. ลายเซ็นผู้รับเงิน */}
              <div
                onMouseDown={(e) => handleMouseDown('signature', e)}
                style={{
                  position: 'absolute',
                  left: `${positions.signature.x}%`,
                  top: `${positions.signature.y}%`,
                  fontSize: `${positions.signature.fontSize}px`,
                  color: positions.signature.color,
                  fontWeight: positions.signature.bold ? 'bold' : 'normal',
                }}
                className={`cursor-move transition-shadow font-serif italic ${
                  activeTab === 'designer' && selectedFieldKey === 'signature'
                    ? 'ring-2 ring-cyan-500 ring-offset-1 bg-cyan-100/70 px-1 rounded'
                    : activeTab === 'designer' ? 'hover:ring-1 hover:ring-cyan-300 px-0.5' : ''
                }`}
                title="ลายเซ็นผู้รับเงิน"
              >
                ( {signerName.split(' ')[0]} )
              </div>

              {/* 16. ตำแหน่งผู้รับเงิน */}
              <div
                onMouseDown={(e) => handleMouseDown('signerPosition', e)}
                style={{
                  position: 'absolute',
                  left: `${positions.signerPosition.x}%`,
                  top: `${positions.signerPosition.y}%`,
                  fontSize: `${positions.signerPosition.fontSize}px`,
                  color: positions.signerPosition.color,
                  fontWeight: positions.signerPosition.bold ? 'bold' : 'normal',
                }}
                className={`cursor-move transition-shadow whitespace-nowrap ${
                  activeTab === 'designer' && selectedFieldKey === 'signerPosition'
                    ? 'ring-2 ring-cyan-500 ring-offset-1 bg-cyan-100/70 px-1 rounded'
                    : activeTab === 'designer' ? 'hover:ring-1 hover:ring-cyan-300 px-0.5' : ''
                }`}
                title="ตำแหน่งผู้รับเงิน"
              >
                {signerPosition}
              </div>

            </div>

          </div>

          {/* Helper caption */}
          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
            <span>💡 เทคนิค: ปรับความโปร่งแสงภาพเพื่อเทียบกับกระดาษจริง แล้วขยับตำแหน่งให้ตรงช่อง</span>
            <span className="text-emerald-700 font-bold">● พร้อมสำหรับเครื่องพิมพ์ทุกรุ่น</span>
          </div>

        </div>

      </div>

      {/* Sequence Settings Modal */}
      <SequenceSettingsModal
        isOpen={isSequenceModalOpen}
        onClose={() => setIsSequenceModalOpen(false)}
        onSaveSuccess={() => {
          const info = getCurrentReceiptInfo();
          setReceiptSeqInfo(info);
          setBookNo(info.bookNo);
          setReceiptNumber(info.numericNo);
          showToast('บันทึกการตั้งค่าระบบตัดเล่มเรียบร้อยแล้ว');
        }}
      />

    </div>
  );
}
