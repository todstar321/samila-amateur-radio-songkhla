import React, { useState, useEffect } from 'react';
import AssociationLogo from './AssociationLogo';
import DeveloperCredit from './DeveloperCredit';
import CertificateModal from './CertificateModal';
import ApplicationReviewModal from './ApplicationReviewModal';
import FullPhotoZoomModal from './FullPhotoZoomModal';
import ReceiptManager from './ReceiptManager';
import DocumentStudio from './DocumentStudio';
import AdminRoleManager from './AdminRoleManager';
import SequenceSettingsModal from './SequenceSettingsModal';
import AdminPinConfirmModal from './AdminPinConfirmModal';
import TelegramSettingsModal from './TelegramSettingsModal';
import CloudinaryStorageManager from './CloudinaryStorageManager';
import { getMemberSequenceConfig } from '../utils/sequenceNumberUtils';
import { sendApprovalDocumentsToTelegram, getTelegramSettings } from '../utils/telegramNotifyUtils';
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  Sliders, 
  Radio, 
  ArrowLeft, 
  Search, 
  FileSearch,
  ShieldCheck, 
  Shield, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Pin, 
  ExternalLink, 
  LogOut, 
  ChevronRight,
  Filter,
  Check,
  UserCheck,
  UserX,
  Phone,
  Mail,
  FileText,
  FileCheck,
  AlertCircle,
  Copy,
  Download,
  Upload,
  Printer,
  Receipt,
  Cpu,
  Award,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  Menu,
  X,
  SlidersHorizontal,
  Layers,
  Palette,
  Table,
  LayoutGrid,
  Send,
  Bot,
  Cloud
} from 'lucide-react';
import { sampleBackgrounds, defaultSectionThemes, overlayThemes } from '../data/mockData';
import { getOverlayGradient } from '../utils/themeUtils';

export default function AdminDashboard({ 
  currentUser, 
  settings, 
  onSaveSettings,
  membersList, 
  onUpdateMembersList,
  newsList, 
  onUpdateNewsList,
  deRequests = [],
  onUpdateDeRequests,
  deQuestions = [],
  onUpdateDeQuestions,
  onBackToWebsite, 
  onLogout 
}) {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_admin_active_tab');
      if (saved) return saved;
    } catch (e) {}
    return 'members';
  });

  useEffect(() => {
    try {
      localStorage.setItem('samila_admin_active_tab', activeTab);
    } catch (e) {}
  }, [activeTab]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState('all'); // 'all', 'admin', 'member', 'pending', 'expiring-1m', 'expiring-6m'
  const [memberViewMode, setMemberViewMode] = useState('sheet'); // 'sheet' (Google Sheets Table with sticky columns) or 'cards' (Individual cards)
  const [deStatusFilter, setDeStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  // DE Questions Management State
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [newQuestionLabel, setNewQuestionLabel] = useState('');
  const [newQuestionPlaceholder, setNewQuestionPlaceholder] = useState('');
  const [newQuestionRequired, setNewQuestionRequired] = useState(false);

  // Selected member for certificate preview modal
  const [previewCertMember, setPreviewCertMember] = useState(null);

  // Selected member for full photo zoom lightbox modal
  const [zoomMember, setZoomMember] = useState(null);

  // Selected member for receipt issuance
  const [receiptSelectedMember, setReceiptSelectedMember] = useState(null);

  // Selected member for application review modal (ใบสมัคร & เอกสารแนบ)
  const [reviewingApplicationMember, setReviewingApplicationMember] = useState(null);

  // Sequence Settings Modal State
  const [isSequenceModalOpen, setIsSequenceModalOpen] = useState(false);
  const [memberSeqConfig, setMemberSeqConfig] = useState(() => getMemberSequenceConfig());

  React.useEffect(() => {
    const handleSeqUpdate = () => {
      setMemberSeqConfig(getMemberSequenceConfig());
    };
    window.addEventListener('samila_sequence_changed', handleSeqUpdate);
    return () => window.removeEventListener('samila_sequence_changed', handleSeqUpdate);
  }, []);

  // Appearance tab local state (Section-by-Section Background & Opacity)
  const [sectionThemesState, setSectionThemesState] = useState(() => {
    return {
      ...defaultSectionThemes,
      ...(settings.sectionThemes || {}),
      hero: {
        ...defaultSectionThemes.hero,
        ...(settings.sectionThemes?.hero || {}),
        bgUrl: settings.sectionThemes?.hero?.bgUrl || settings.heroBgUrl || defaultSectionThemes.hero.bgUrl,
      }
    };
  });

  // Selected section tab in Appearance tab
  const [selectedSection, setSelectedSection] = useState('hero');
  const [customLogoInput, setCustomLogoInput] = useState(settings.customLogoUrl || '');
  const [isOwnerPinModalOpen, setIsOwnerPinModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);

  const sectionList = [
    { id: 'hero', label: 'หน้าแรก (Hero)', icon: '🌊', desc: 'ส่วนต้อนรับ & ฟอร์มเข้าสู่ระบบสมาชิก' },
    { id: 'news', label: 'ข่าวสารและประกาศ', icon: '📰', desc: 'กระดานข่าวสารและกิจกรรม' },
    { id: 'repeaters', label: 'สถานีทวนสัญญาณ', icon: '📡', desc: 'ตารางความถี่และรีพีทเตอร์' },
    { id: 'services', label: 'งานทะเบียน & บริการ', icon: '📋', desc: 'บริการสมาชิกและดาวน์โหลดแบบฟอร์ม' },
    { id: 'contact', label: 'ติดต่อสมาคม & ท้ายเว็บ', icon: '📞', desc: 'ข้อมูลติดต่อและส่วนท้ายเว็บไซต์' },
    { id: 'admin', label: 'แผงควบคุมแอดมิน', icon: '⚡', desc: 'หน้าต่างแผงควบคุมระบบแอดมิน' },
  ];

  // Helper to update field in current section theme
  const handleUpdateCurrentTheme = (field, value) => {
    setSectionThemesState(prev => {
      const current = prev[selectedSection] || defaultSectionThemes[selectedSection] || {};
      return {
        ...prev,
        [selectedSection]: {
          ...current,
          [field]: value
        }
      };
    });
  };

  // Helper to apply current section image & opacity to ALL sections
  const handleApplyToAllSections = () => {
    const current = sectionThemesState[selectedSection] || defaultSectionThemes[selectedSection];
    const updated = {};
    Object.keys(defaultSectionThemes).forEach(key => {
      updated[key] = {
        ...(sectionThemesState[key] || defaultSectionThemes[key]),
        bgUrl: current.bgUrl,
        opacity: current.opacity,
        overlayType: current.overlayType
      };
    });
    setSectionThemesState(updated);
    showToast(`นำภาพและความโปร่งแสง (${current.opacity}%) ไปใช้กับทุกหน้าเรียบร้อยแล้ว`);
  };

  // Helper to reset current section to default
  const handleResetCurrentSection = () => {
    const def = defaultSectionThemes[selectedSection];
    if (def) {
      setSectionThemesState(prev => ({
        ...prev,
        [selectedSection]: { ...def }
      }));
      showToast(`รีเซ็ตหน้า "${sectionList.find(s => s.id === selectedSection)?.label}" กลับเป็นค่าเริ่มต้นเรียบร้อยแล้ว`);
    }
  };

  // Certificate settings local state
  const [certSettings, setCertSettings] = useState({
    presidentName: settings.presidentName || 'นายธานี รายศิริ',
    presidentTitle: settings.presidentTitle || 'นายกสมาคม / ผู้มีอำนาจลงนามแทน',
    presidentCallsign: settings.presidentCallsign || 'HS9...',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Filter members
  const filteredMembers = membersList.filter(mem => {
    const query = searchQuery.toLowerCase();
    const matchSearch = 
      (mem.callsign && mem.callsign.toLowerCase().includes(query)) ||
      (mem.fullName && mem.fullName.toLowerCase().includes(query)) ||
      (mem.memberId && mem.memberId.toLowerCase().includes(query)) ||
      (mem.phone && mem.phone.includes(query));

    if (!matchSearch) return false;
    if (memberRoleFilter === 'admin') return mem.role === 'admin';
    if (memberRoleFilter === 'member') return mem.role === 'member' && mem.status === 'อนุมัติแล้ว';
    if (memberRoleFilter === 'pending') return mem.status === 'รอตรวจสอบ';
    if (memberRoleFilter === 'expiring-1m') return mem.expiryAlert === 'expiring-1m';
    if (memberRoleFilter === 'expiring-6m') return mem.expiryAlert === 'expiring-6m';
    return true;
  });

  // Filter DE requests
  const filteredDeRequests = deRequests.filter(req => {
    const query = searchQuery.toLowerCase();
    const matchSearch = 
      req.callsign.toLowerCase().includes(query) ||
      req.fullName.toLowerCase().includes(query) ||
      req.imei.includes(query) ||
      req.phone.includes(query);

    if (!matchSearch) return false;
    if (deStatusFilter === 'pending') return req.status === 'รอตรวจสอบ';
    if (deStatusFilter === 'approved') return req.status === 'อนุมัติแล้ว';
    return true;
  });

  // Toggle admin privilege for a member
  const handleToggleAdminRole = (memberId) => {
    const target = membersList.find(m => m.id === memberId);
    if (!target) return;

    if (target.isSuperAdmin) {
      alert("ไม่สามารถถอดสิทธิ์ 'แอดมินหลัก / นายกสมาคม' ได้");
      return;
    }

    const newRole = target.role === 'admin' ? 'member' : 'admin';
    const updated = membersList.map(m => {
      if (m.id === memberId) {
        return { ...m, role: newRole };
      }
      return m;
    });

    onUpdateMembersList(updated);
    showToast(
      newRole === 'admin' 
        ? `แต่งตั้ง ${target.callsign} (${target.fullName}) เป็นแอดมินเรียบร้อยแล้ว` 
        : `ถอดสิทธิ์แอดมินของ ${target.callsign} เรียบร้อยแล้ว`
    );
  };

  // Approve pending member with full audit trail (บันทึกหลักฐานผู้อนุมัติ)
  const handleApproveMember = (memberId, auditData = null) => {
    const defaultAudit = {
      approvedByAdminName: currentUser?.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)',
      approvedByCallsign: currentUser?.callsign && currentUser.callsign !== '-' ? currentUser.callsign : 'E26ECG',
      approvedAt: new Date().toLocaleDateString('th-TH') + ' เวลา ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
    };
    const effectiveAudit = auditData || defaultAudit;

    let targetMember = null;
    const updated = membersList.map(m => {
      if (m.id === memberId) {
        targetMember = { 
          ...m, 
          status: 'อนุมัติแล้ว',
          memberStatus: 'ปกติ (Active)',
          ...effectiveAudit
        };
        return targetMember;
      }
      return m;
    });
    onUpdateMembersList(updated);
    showToast(`อนุมัติสมาชิกภาพเรียบร้อยแล้ว (บันทึกหลักฐานผู้อนุมัติ: ${effectiveAudit.approvedByAdminName})`);

    // Automatically generate and transmit e-Receipt + Certificate to Telegram group
    if (targetMember) {
      sendApprovalDocumentsToTelegram({
        member: targetMember,
        auditData: effectiveAudit
      }).then(res => {
        if (res.ok) {
          showToast(`ส่งใบเสร็จและหนังสือรับรองของ ${targetMember.fullName} เข้า Telegram เรียบร้อยแล้ว`);
        }
      }).catch(err => {
        console.warn('[Telegram Approval] Error:', err);
      });
    }
  };

  // Add Dynamic DE Question
  const handleAddDeQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionLabel.trim()) return;

    const newQ = {
      id: `q-${Date.now()}`,
      label: newQuestionLabel.trim(),
      placeholder: newQuestionPlaceholder.trim() || 'กรอกข้อมูล...',
      type: 'text',
      required: newQuestionRequired,
      active: true
    };

    const updated = [...deQuestions, newQ];
    if (onUpdateDeQuestions) onUpdateDeQuestions(updated);
    setIsAddQuestionOpen(false);
    setNewQuestionLabel('');
    setNewQuestionPlaceholder('');
    setNewQuestionRequired(false);
    showToast('เพิ่มคำถามใหม่ในแบบฟอร์มขอรหัส DE เรียบร้อยแล้ว');
  };

  // Toggle DE Question Active/Inactive
  const handleToggleDeQuestion = (qId) => {
    const updated = deQuestions.map(q => {
      if (q.id === qId) {
        return { ...q, active: !q.active };
      }
      return q;
    });
    if (onUpdateDeQuestions) onUpdateDeQuestions(updated);
    showToast('อัปเดตสถานะคำถามเรียบร้อยแล้ว');
  };

  // Delete DE Question (Preserves existing members' previous answers)
  const handleDeleteDeQuestion = (qId) => {
    const targetQ = deQuestions.find(q => q.id === qId);
    if (!targetQ) return;
    if (window.confirm(`คุณต้องการลบคำถาม "${targetQ.label}" ออกจากแบบฟอร์มผู้สมัครใหม่หรือไม่?\n\n(คำตอบของสมาชิกที่เคยยื่นไว้ก่อนหน้าจะยังคงถูกบันทึกไว้อย่างสมบูรณ์)`)) {
      const updated = deQuestions.filter(q => q.id !== qId);
      if (onUpdateDeQuestions) onUpdateDeQuestions(updated);
      showToast('ลบคำถามออกจากแบบฟอร์มเรียบร้อยแล้ว (ข้อมูลประวัติของสมาชิกเดิมยังคงอยู่)');
    }
  };

  // Delete member with confirmation
  const handleDeleteMember = (memberId) => {
    const target = membersList.find(m => m.id === memberId);
    if (!target) return;
    if (target.isSuperAdmin) {
      alert("ไม่สามารถลบบัญชีแอดมินหลักได้");
      return;
    }
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิก "${target.fullName} (${target.callsign})"?`)) {
      const updated = membersList.filter(m => m.id !== memberId);
      onUpdateMembersList(updated);
      showToast(`ลบข้อมูล ${target.callsign} เรียบร้อยแล้ว`);
    }
  };

  // 1-Click Copy Helper
  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`คัดลอก ${label} เรียบร้อยแล้ว: "${text}"`);
  };

  // 1-Click Copy All for DE Request (Formatted for external DMR server registration)
  const handleCopyDeFullInfo = (req) => {
    const formatted = `CALLSIGN: ${req.callsign}\nNAME: ${req.fullName}\nIMEI: ${req.imei}\nMODEL: ${req.deviceModel || '-'}\nSHOP: ${req.purchaseShop || '-'}\nSERIAL: ${req.serialNumber || '-'}\nPHONE: ${req.phone}\nEMAIL: ${req.email}\nQTH: ${req.qthProvince}\nASSIGNED_DE: ${req.assignedDeCode || 'PENDING'}`;
    navigator.clipboard.writeText(formatted);
    showToast(`คัดลอกข้อมูลคำขอ ${req.callsign} ทั้งหมดสำหรับนำไปกรอกระบบภายนอกแล้ว!`);
  };

  // Step 2: Preliminary Screening by Admin/Coordinator
  const handlePreliminaryScreenDe = (reqId) => {
    const target = deRequests.find(r => r.id === reqId);
    if (!target) return;

    const notes = window.prompt(
      `ระบุบันทึกการตรวจสอบเบื้องต้นสำหรับ ${target.fullName} (${target.callsign}):`,
      'ตรวจสอบคุณสมบัติเครื่อง Spender และสถานีวิทยุสมัครเล่นครบถ้วน เสนอนายกสมาคม/รองนายกฯ ลงนามอนุมัติ'
    );

    if (notes !== null) {
      const screenedAt = new Date().toLocaleDateString('th-TH') + ' เวลา ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
      const screener = (currentUser?.callsign && currentUser.callsign !== '-' ? currentUser.callsign : 'แอดมิน') + ' ' + (currentUser?.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)');

      const updatedRequests = deRequests.map(r => {
        if (r.id === reqId) {
          return {
            ...r,
            status: 'ผ่านการตรวจเบื้องต้น / รอนายกฯ อนุมัติ',
            screenedBy: screener,
            screenedDate: screenedAt,
            screenedNotes: notes.trim()
          };
        }
        return r;
      });
      if (onUpdateDeRequests) onUpdateDeRequests(updatedRequests);
      showToast(`ผ่านการตรวจเบื้องต้นของ ${target.callsign} แล้ว -> ส่งต่อให้นายก/รองนายกฯ ลงนามอนุมัติ`);
    }
  };

  // Step 3: Executive Final Approval by President / VP and assign DE Code with Audit Record
  const handleApproveDeRequest = (reqId) => {
    const target = deRequests.find(r => r.id === reqId);
    if (!target) return;

    const assignedCode = window.prompt(
      `กรุณาระบุรหัส DE ที่ต้องการกำหนดให้แก่ ${target.fullName} (${target.callsign}):`, 
      target.assignedDeCode || `DE ${Math.floor(200 + Math.random() * 90)}`
    );

    if (assignedCode && assignedCode.trim()) {
      const approvedAt = new Date().toLocaleDateString('th-TH') + ' เวลา ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
      const approver = 'นายธานี รายศิริ (นายกสมาคมวิทยุสมัครเล่นสมิหลา)';

      const updatedRequests = deRequests.map(r => {
        if (r.id === reqId) {
          return { 
            ...r, 
            status: 'อนุมัติแล้ว', 
            assignedDeCode: assignedCode.trim(),
            approvedDate: approvedAt,
            approvedBy: approver
          };
        }
        return r;
      });
      if (onUpdateDeRequests) onUpdateDeRequests(updatedRequests);

      // Also update member's profile in membersList if exists
      const updatedMembers = membersList.map(m => {
        if (m.callsign === target.callsign || m.phone === target.phone) {
          return { 
            ...m, 
            deNetworkCode: assignedCode.trim(), 
            deImei: target.imei,
            deDeviceModel: target.deviceModel,
            dePurchaseShop: target.purchaseShop,
            deSerialNumber: target.serialNumber,
            deApprovedDate: approvedAt,
            deApprovedBy: approver
          };
        }
        return m;
      });
      onUpdateMembersList(updatedMembers);

      showToast(`อนุมัติและออกรหัส ${assignedCode.trim()} ให้ ${target.callsign} สำเร็จ (บันทึกหลักฐานผู้อนุมัติ)`);
    }
  };

  // Export members to Excel / CSV
  const handleExportCsv = () => {
    const headers = [
      'ลำดับ',
      'รหัสสมาชิก',
      'สัญญาณเรียกขาน',
      'ชื่อ-นามสกุล',
      'เลขประจำตัวประชาชน',
      'เบอร์โทรศัพท์',
      'อีเมล',
      'ประเภทสมาชิก',
      'วันเริ่มต้น',
      'วันสิ้นสุด',
      'รหัสDE',
      'สถานะสมาชิกภาพ',
      'สิทธิ์ในระบบ'
    ];

    const rows = filteredMembers.map((m, idx) => [
      idx + 1,
      m.memberId,
      m.callsign,
      `"${m.fullName.replace(/"/g, '""')}"`,
      `"${m.citizenId}"`,
      `"${m.phone}"`,
      m.email || '-',
      m.memberType,
      m.startDate,
      m.endDate,
      m.deNetworkCode || '-',
      m.memberStatus || m.status,
      m.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิกทั่วไป'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `members_samila_hs9as_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("ส่งออกข้อมูลทำเนียบสมาชิกเป็นไฟล์ CSV (Excel) สำเร็จแล้ว");
  };

  // Simulate Excel/CSV Import of historical members
  const handleSimulateImport = () => {
    const sampleBatch = [
      {
        id: `mem-import-1`,
        callsign: "E29ZAP",
        username: "e29zap",
        fullName: "นายธนวัฒน์ รัตนภักดี",
        nameEnglish: "Thanawat Rattanapakdee",
        citizenId: "1900100987654",
        last4Id: "7654",
        phone: "081-334-9988",
        email: "thanawat@radio.th",
        memberId: "369120",
        memberType: "สมาชิกตลอดชีพ",
        startDate: "01-02-2560",
        endDate: "ตลอดชีพ",
        registeredAddress: "เลขที่ 112 ต.คอหงส์ อ.หาดใหญ่ จ.สงขลา 90110",
        currentAddress: "เลขที่ 112 ต.คอหงส์ อ.หาดใหญ่ จ.สงขลา 90110",
        deNetworkCode: "DE 112",
        deImei: "867543029112112",
        radioStandby: "145.6750 MHz",
        memberStatus: "ปกติ (Active)",
        role: "member",
        isSuperAdmin: false,
        status: "อนุมัติแล้ว",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
        registeredDate: "1 ก.พ. 2560",
        expiryAlert: "ปกติ"
      },
      {
        id: `mem-import-2`,
        callsign: "HS9SML",
        username: "hs9sml",
        fullName: "ว่าที่ ร.ต.สมพงษ์ เกียรติวิถี",
        nameEnglish: "Sompong Kiatwitee",
        citizenId: "1900300129871",
        last4Id: "9871",
        phone: "089-778-5544",
        email: "sompong@sml.org",
        memberId: "369121",
        memberType: "สมาชิกสามัญ 5 ปี",
        startDate: "15-10-2564",
        endDate: "15-10-2569",
        registeredAddress: "เลขที่ 40 ถ.รามวิถี ต.บ่อยาง อ.เมือง จ.สงขลา 90000",
        currentAddress: "เลขที่ 40 ถ.รามวิถี ต.บ่อยาง อ.เมือง จ.สงขลา 90000",
        deNetworkCode: null,
        radioStandby: "145.6750 MHz",
        memberStatus: "ปกติ (Active)",
        role: "member",
        isSuperAdmin: false,
        status: "อนุมัติแล้ว",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80",
        registeredDate: "15 ต.ค. 2564",
        expiryAlert: "expiring-6m"
      }
    ];

    onUpdateMembersList([...sampleBatch, ...membersList]);
    showToast(`นำเข้าข้อมูลสมาชิกประวัติศาสตร์ 2 รายการเรียบร้อยแล้ว`);
  };

  // Save Appearance & Theme settings (ป้องกันด้วยรหัส PIN เจ้าของแอปพลิเคชัน 5532)
  const handleSaveAppearance = () => {
    setIsOwnerPinModalOpen(true);
  };

  const handleOwnerPinConfirmed = (confirmedPin) => {
    const finalHeroBg = sectionThemesState.hero?.bgUrl || settings.heroBgUrl;
    const finalLogo = customLogoInput.trim() || settings.customLogoUrl;
    onSaveSettings({
      ...settings,
      heroBgUrl: finalHeroBg,
      customLogoUrl: finalLogo,
      sectionThemes: sectionThemesState,
      overlayColor: sectionThemesState.hero?.overlayType || 'ocean-wave'
    });
    showToast("ยืนยันสิทธิ์เจ้าของแอปสำเร็จ! บันทึกการตั้งค่าฉากหลัง ความโปร่งแสง และธีมน้ำทะเลเรียบร้อยแล้ว");
  };

  // Save Certificate customizer settings
  const handleSaveCertificateSettings = () => {
    onSaveSettings({
      ...settings,
      presidentName: certSettings.presidentName,
      presidentTitle: certSettings.presidentTitle,
      presidentCallsign: certSettings.presidentCallsign,
    });
    showToast("บันทึกการตั้งค่าลายเซ็นและข้อมูลหนังสือรับรองเรียบร้อยแล้ว");
  };

  // Toggle pin news
  const handleTogglePinNews = (newsId) => {
    const updated = newsList.map(n => {
      if (n.id === newsId) {
        return { ...n, isPinned: !n.isPinned };
      }
      return n;
    });
    onUpdateNewsList(updated);
  };

  // Delete news
  const handleDeleteNews = (newsId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้?")) {
      const updated = newsList.filter(n => n.id !== newsId);
      onUpdateNewsList(updated);
      showToast("ลบประกาศเรียบร้อยแล้ว");
    }
  };

  // Navigation tabs definition
  const navTabs = [
    { id: 'overview', label: 'ภาพรวมระบบ (Overview)', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'members', label: 'จัดการสมาชิก (Members)', icon: <Users className="w-4 h-4" />, badge: membersList.length },
    { id: 'de_requests', label: 'คำขอรหัสเครือข่าย DE', icon: <Cpu className="w-4 h-4 text-sky-500" />, badge: deRequests.filter(r => r.status !== 'อนุมัติแล้ว').length || deRequests.length, badgeAlert: deRequests.some(r => r.status !== 'อนุมัติแล้ว') },
    { id: 'documents', label: 'ออกแบบเอกสาร & ใบสมัคร & ใบเสร็จ', icon: <FileText className="w-4 h-4 text-emerald-500" /> },
    { id: 'roles', label: 'แต่งตั้งแอดมิน & สิทธิ์ (RBAC)', icon: <ShieldCheck className="w-4 h-4 text-amber-500" /> },
    { id: 'news', label: 'ประกาศ & ข่าวสาร (News)', icon: <Bell className="w-4 h-4" />, badge: newsList.length },
    { id: 'telegram', label: 'แจ้งเตือน Telegram (บอท HS9AS)', icon: <Send className="w-4 h-4 text-[#0088cc]" />, badge: 'Bot' },
    { id: 'cloudinary', label: 'คลังภาพ & ล้างพื้นที่ Cloudinary', icon: <Cloud className="w-4 h-4 text-cyan-600" />, badge: 'Storage' },
    { id: 'appearance', label: 'ปรับแต่งหน้าเว็บ & ธีม', icon: <Sliders className="w-4 h-4" /> },
    { id: 'repeaters', label: 'ความถี่ & รีพีทเตอร์', icon: <Radio className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800 flex flex-col md:flex-row font-sans selection:bg-slate-900 selection:text-white">
      
      {/* ================= MOBILE APP BAR (เฉพาะจอมือถือ < md) ================= */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <AssociationLogo customUrl={settings.customLogoUrl} className="w-8 h-8 rounded-full shrink-0 shadow-xs" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-slate-900 truncate">
                สมาคมวิทยุสมัครเล่นสมิหลา
              </h2>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                v2.1
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Admin Portal (HS9AS)
            </span>
          </div>
        </div>

        {/* 3-Lines Hamburger Button (ปุ่มสามขีด ☰ ดึงเมนูออกตามที่ผู้ใช้ขอ) */}
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer flex items-center gap-1.5 border border-slate-300 shadow-2xs"
          title="เปิดเมนูแอดมิน"
        >
          <Menu className="w-4 h-4 text-slate-900" />
          <span className="text-xs font-bold text-slate-900">☰ เมนู</span>
        </button>
      </div>

      {/* ================= MOBILE OFF-CANVAS SLIDE-OUT DRAWER ================= */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer Container (เลื่อนออกมาจากซ้าย) */}
          <div className="relative w-[85%] max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
              <div className="flex items-center gap-2.5">
                <AssociationLogo customUrl={settings.customLogoUrl} className="w-7 h-7 rounded-full shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">เมนูแผงควบคุมแอดมิน</h3>
                  <p className="text-[10px] text-slate-500 font-mono">HS9AS Admin Portal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                title="ปิดเมนู"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Quick Search */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="ค้นหาในระบบ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400 transition"
                />
              </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
              {navTabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      activeTab === item.id 
                        ? 'bg-slate-800 text-slate-200' 
                        : item.badgeAlert
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* DRAWER FOOTER: ผู้ใช้ระบุว่า "ด้านล่างสุดของเมนูควรจะมีปุ่มให้กดกลับไปยังหน้าเว็บไซต์" */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2.5 mt-auto">
              {/* Admin Profile Box */}
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold font-mono text-slate-900">
                      {currentUser?.callsign || 'E26ECG'}
                    </span>
                    <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                      แอดมิน
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {currentUser?.fullName}
                  </p>
                </div>
              </div>

              {/* Back to Website Button (Pinned at the VERY BOTTOM of mobile menu) */}
              <button
                onClick={() => {
                  setMobileSidebarOpen(false);
                  onBackToWebsite();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>← กลับสู่หน้าเว็บไซต์</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setMobileSidebarOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= DESKTOP LEFT SIDEBAR (hidden on mobile, visible on md+) ================= */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 min-h-screen">
        
        {/* Project Selector Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <AssociationLogo customUrl={settings.customLogoUrl} className="w-8 h-8 rounded-full shrink-0 shadow-sm" />
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900 truncate">
                สมาคมวิทยุสมัครเล่นสมิหลา
              </h2>
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Admin Portal (HS9AS)
              </span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
            v2.1
          </span>
        </div>

        {/* Quick Search Box */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาในระบบ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400 transition"
            />
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navTabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === item.id 
                    ? 'bg-slate-800 text-slate-200' 
                    : item.badgeAlert
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer: Current Admin Profile & Back to Web */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-2">
          {/* Admin Profile Box */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold font-mono text-slate-900">
                  {currentUser?.callsign || 'E26ECG'}
                </span>
                <span className="text-[9px] bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-semibold">
                  แอดมิน
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                {currentUser?.fullName}
              </p>
            </div>
          </div>

          {/* Back to Website Button */}
          <button
            onClick={onBackToWebsite}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับสู่หน้าเว็บไซต์</span>
          </button>
        </div>

      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
            {/* Mobile Menu trigger in header */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 -ml-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer flex items-center gap-1 border border-slate-300 shrink-0"
              title="เปิดเมนูแอดมิน"
            >
              <Menu className="w-4 h-4 text-slate-900" />
              <span className="text-[11px] font-bold">☰ เมนู</span>
            </button>

            <span className="hover:text-slate-800 cursor-pointer hidden sm:inline" onClick={onBackToWebsite}>
              สมาคมวิทยุสมัครเล่นสมิหลา
            </span>
            <span className="hidden sm:inline">/</span>
            <span className="font-semibold text-slate-900 truncate">
              {activeTab === 'overview' && 'ภาพรวมระบบ (Overview)'}
              {activeTab === 'members' && 'จัดการข้อมูลสมาชิก & สิทธิ์แอดมิน'}
              {activeTab === 'de_requests' && 'คำขอรหัสเครือข่าย DE (Spender)'}
              {(activeTab === 'documents' || activeTab === 'receipts' || activeTab === 'certificates') && 'สตูดิโอออกแบบเอกสาร ใบสมัคร & ใบเสร็จ & หนังสือรับรอง (Document Studio)'}
              {activeTab === 'roles' && 'แต่งตั้งคณะทำงาน & กำหนดสิทธิ์แอดมิน (Admin Roles RBAC)'}
              {activeTab === 'news' && 'จัดการประกาศและข่าวสาร'}
              {activeTab === 'telegram' && 'ระบบแจ้งเตือน & จัดเก็บภาพใน Telegram (บอท HS9AS)'}
              {activeTab === 'cloudinary' && 'ระบบคลังภาพ & ล้างพื้นที่จัดเก็บ Cloudinary (Retention Purge)'}
              {activeTab === 'appearance' && 'ปรับแต่งภาพพื้นหลัง & โลโก้สมาคม (ธีม)'}
              {activeTab === 'repeaters' && 'สถานะความถี่และสถานีทวนสัญญาณ'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('cloudinary')}
              className="inline-flex items-center gap-1.5 text-xs text-white bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold shadow-xs transition cursor-pointer"
              title="ระบบคลังภาพ Cloudinary & ล้างพื้นที่จัดเก็บ"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">คลังภาพ Cloudinary</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold">Storage</span>
            </button>
            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-white bg-gradient-to-r from-[#0088cc] to-[#0077b5] hover:from-[#0077b5] hover:to-[#006699] px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold shadow-xs transition cursor-pointer"
              title="ตั้งค่าระบบแจ้งเตือน Telegram (TRIPLE T ROBOT)"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">แจ้งเตือน Telegram</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold">HS9AS</span>
            </button>
            <button
              onClick={onBackToWebsite}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ดูหน้าเว็บหลัก</span>
            </button>
          </div>
        </header>

        {/* Toast Alert Banner inside Admin */}
        {toastMessage && (
          <div className="mx-4 sm:mx-8 mt-4 p-3 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-8 flex-1 max-w-6xl w-full mx-auto space-y-6">
          
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">ภาพรวมระบบ</h1>
                <p className="text-xs text-slate-500 mt-1">สถิติและสถานะการทำงานของสมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา</p>
              </div>

              {/* Metric Cards - 2x2 Grid on Mobile, 4 Cols on Desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5 sm:mb-2">
                    <span className="whitespace-nowrap font-medium">สมาชิกทั้งหมด</span>
                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">{membersList.length}</p>
                  <p className="text-[10px] sm:text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3 shrink-0" /> ปกติ {membersList.filter(m => m.status === 'อนุมัติแล้ว').length} ท่าน
                  </p>
                </div>

                <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5 sm:mb-2">
                    <span className="whitespace-nowrap font-medium">คำขอรหัส DE</span>
                    <Cpu className="w-4 h-4 text-sky-600 shrink-0" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
                    {deRequests.length}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-amber-700 mt-1 font-medium whitespace-nowrap">
                    รอตรวจ {deRequests.filter(r => r.status === 'รอตรวจสอบ').length} รายการ
                  </p>
                </div>

                <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5 sm:mb-2">
                    <span className="whitespace-nowrap font-medium">ใกล้หมดอายุ (&lt;6 ด.)</span>
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-amber-600 font-mono">
                    {membersList.filter(m => m.expiryAlert && m.expiryAlert.startsWith('expiring')).length}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1 whitespace-nowrap">
                    สมาชิกต้องต่ออายุ
                  </p>
                </div>

                <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5 sm:mb-2">
                    <span className="whitespace-nowrap font-medium truncate">145.6750 MHz</span>
                    <Radio className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-emerald-600 mt-1 flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    ออนไลน์ 24/7
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 whitespace-nowrap">ยอดเขาคอหงส์</p>
                </div>
              </div>

              {/* Recent Member Registrations */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    สมาชิกที่ลงทะเบียนล่าสุด
                  </h3>
                  <button
                    onClick={() => setActiveTab('members')}
                    className="text-xs text-sky-700 hover:underline font-semibold cursor-pointer"
                  >
                    ดูสมาชิกทั้งหมด →
                  </button>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {membersList.slice(0, 4).map((mem) => (
                    <div key={mem.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition">
                      <div className="flex items-center gap-3">
                        <img 
                          src={mem.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
                          alt="avatar" 
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{mem.fullName}</p>
                          <p className="text-[11px] font-mono text-slate-500">
                            Callsign: <strong className="text-amber-700">{mem.callsign}</strong> • รหัส {mem.memberId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {mem.role === 'admin' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            👑 แอดมิน
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            สมาชิก
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">{mem.registeredDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: MEMBERS MANAGEMENT & EXCEL TOOLS ================= */}
          {activeTab === 'members' && (
            <div className="space-y-5">
              
              {/* Header & Excel Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">ทำเนียบสมาชิก & จัดการสิทธิ์</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    จัดการข้อมูลสมาชิก, นำเข้า-ส่งออก Excel, ตรวจสอบการหมดอายุ และพิมพ์หนังสือรับรอง
                  </p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full flex-nowrap">
                  {/* View Mode Switcher */}
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => setMemberViewMode('sheet')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        memberViewMode === 'sheet'
                          ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="มุมมองตารางสไตล์ Google Sheets ตรึง 2 คอลัมน์ซ้าย (รูป & Callsign)"
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Google Sheets</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMemberViewMode('cards')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        memberViewMode === 'cards'
                          ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="มุมมองการ์ดสมาชิกรายบุคคล"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>การ์ดรายคน</span>
                    </button>
                  </div>

                  <button
                    onClick={handleSimulateImport}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer shrink-0 whitespace-nowrap"
                    title="จำลองการนำเข้าข้อมูลสมาชิกประวัติศาสตร์จาก Excel"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>นำเข้าจาก Excel</span>
                  </button>

                  <button
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer shrink-0 whitespace-nowrap"
                    title="ส่งออกรายชื่อสมาชิกทั้งหมดเป็นไฟล์ Excel (CSV)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ส่งออก Excel (CSV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSequenceModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer shrink-0 whitespace-nowrap"
                    title="ตั้งค่ารันเลขสมาชิกเริ่มต้น (เช่น 30,001) และตั้งค่าตัดเล่มใบเสร็จอัตโนมัติ"
                  >
                    <Sliders className="w-3.5 h-3.5 text-sky-600" />
                    <span>ตั้งค่าเลขรัน</span>
                    <span className="font-mono bg-sky-200 text-sky-900 px-1.5 py-0.2 rounded text-[10px]">
                      #{memberSeqConfig.currentNumber}
                    </span>
                  </button>
                </div>
              </div>

              {/* Filter Pills with Expiry Alert Filters - Single Smooth Scrollable Row on Mobile */}
              <div className="flex items-center gap-2 text-xs overflow-x-auto no-scrollbar py-1 max-w-full flex-nowrap">
                <span className="text-slate-400 font-medium shrink-0 whitespace-nowrap">กรองข้อมูล:</span>
                
                <button
                  onClick={() => setMemberRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                    memberRoleFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  ทั้งหมด ({membersList.length})
                </button>

                <button
                  onClick={() => setMemberRoleFilter('admin')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
                    memberRoleFilter === 'admin'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  👑 แอดมิน ({membersList.filter(m => m.role === 'admin').length})
                </button>

                <button
                  onClick={() => setMemberRoleFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
                    memberRoleFilter === 'pending'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  รออนุมัติ ({membersList.filter(m => m.status === 'รอตรวจสอบ').length})
                </button>

                <button
                  onClick={() => setMemberRoleFilter('expiring-1m')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
                    memberRoleFilter === 'expiring-1m'
                      ? 'bg-rose-600 text-white font-bold shadow-xs'
                      : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  หมดอายุใน 1 เดือน ({membersList.filter(m => m.expiryAlert === 'expiring-1m').length})
                </button>

                <button
                  onClick={() => setMemberRoleFilter('expiring-6m')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
                    memberRoleFilter === 'expiring-6m'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  หมดอายุใน 6 เดือน ({membersList.filter(m => m.expiryAlert === 'expiring-6m').length})
                </button>
              </div>

              {/* ป้ายแจ้งเตือนใบสมัครสมาชิกรอตรวจสอบ (Pending Applications Alert Banner) */}
              {membersList.some(m => m.status === 'รอตรวจสอบ') && (
                <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 border-2 border-amber-400/80 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-xs">
                      <Clock className="w-5 h-5 text-slate-950" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-950">
                          มีใบสมัครสมาชิกรอดำเนินการตรวจสอบ ({membersList.filter(m => m.status === 'รอตรวจสอบ').length} รายการ)
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                          รออนุมัติ
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 mt-0.5">
                        คลิกเพื่อตรวจสอบใบสมัครสมาคมฉบับจริง สำเนาบัตรประชาชน สำเนาทะเบียนบ้าน สลิปโอนเงิน และบันทึกภาพทั้งหมดลงเครื่อง
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const firstPending = membersList.find(m => m.status === 'รอตรวจสอบ');
                      if (firstPending) setReviewingApplicationMember(firstPending);
                    }}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-amber-300 font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 border border-amber-400/50"
                  >
                    <FileSearch className="w-4 h-4 text-amber-400" />
                    <span>ตรวจสอบใบสมัคร & เอกสารแนบ</span>
                  </button>
                </div>
              )}

              {/* Notice for Google Sheets view - Clean and readable on all screens */}
              {memberViewMode === 'sheet' && (
                <div className="bg-sky-50 text-sky-900 border border-sky-200/80 rounded-xl px-3.5 py-2 text-xs flex items-center gap-2 shadow-2xs">
                  <span className="shrink-0 text-base">💡</span>
                  <span className="leading-relaxed">ตารางสไตล์ Google Sheets: ตรึง 2 คอลัมน์ซ้าย (รูป & Callsign) สามารถปัดเลื่อนซ้าย-ขวาเพื่อดูข้อมูลและการจัดการได้</span>
                </div>
              )}

              {/* ================= VIEW 1: GOOGLE SHEETS STYLE DATA GRID (PINNED 2 COLUMNS) ================= */}
              {memberViewMode === 'sheet' ? (
                <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-cyan-200 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto relative">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[1600px]">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#012a4a] via-[#01497c] to-[#013a63] text-white border-b-2 border-cyan-400">
                          {/* PINNED COLUMN 1: รูปสมาชิก (Avatar) */}
                          <th className="py-3 px-2 sticky left-0 z-30 bg-[#012a4a] font-bold w-[68px] min-w-[68px] max-w-[68px] text-center border-r border-cyan-500/30 shadow-[2px_0_5px_rgba(0,0,0,0.1)] whitespace-nowrap">
                            รูปสมาชิก
                          </th>

                          {/* PINNED COLUMN 2: นามเรียกขาน (Callsign) */}
                          <th className="py-3 px-3.5 sticky left-[68px] z-30 bg-[#012a4a] font-bold w-[140px] min-w-[140px] max-w-[140px] border-r-2 border-cyan-400 shadow-[4px_0_8px_rgba(0,0,0,0.15)] whitespace-nowrap">
                            นามเรียกขาน
                          </th>

                          {/* SCROLLABLE COLUMNS - WIDE AND SINGLE LINE */}
                          <th className="py-3 px-3.5 font-bold min-w-[130px] whitespace-nowrap">รหัสเครือข่าย DE</th>
                          <th className="py-3 px-3.5 font-bold min-w-[300px] whitespace-nowrap">ชื่อ - นามสกุล</th>
                          <th className="py-3 px-3.5 font-bold min-w-[110px] whitespace-nowrap">ชื่อเล่น</th>
                          <th className="py-3 px-3.5 font-bold min-w-[160px] whitespace-nowrap">เบอร์โทรศัพท์ (กดโทรได้)</th>
                          <th className="py-3 px-3.5 font-bold min-w-[180px] whitespace-nowrap">ประเภท & อายุสมาชิก</th>
                          <th className="py-3 px-3.5 font-bold min-w-[170px] whitespace-nowrap">สถานะสิทธิ์</th>
                          <th className="py-3 px-3.5 font-bold min-w-[240px] text-center whitespace-nowrap">การจัดการ & หนังสือรับรอง</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-200">
                        {filteredMembers.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-12 text-center text-slate-500">
                              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                              <p className="font-semibold text-sm">ไม่พบข้อมูลสมาชิกตามคำค้นหา</p>
                            </td>
                          </tr>
                        ) : (
                          filteredMembers.map((mem, index) => {
                            const isEven = index % 2 === 0;
                            return (
                              <tr 
                                key={mem.id}
                                className={`hover:bg-cyan-50/70 transition-colors group ${
                                  isEven ? 'bg-white' : 'bg-slate-50/70'
                                }`}
                              >
                                {/* PINNED COLUMN 1: รูปสมาชิก (Sticky Left 0) */}
                                <td className={`py-2.5 px-2 sticky left-0 z-20 text-center w-[68px] min-w-[68px] max-w-[68px] border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.05)] whitespace-nowrap ${
                                  isEven ? 'bg-white group-hover:bg-cyan-50' : 'bg-slate-50 group-hover:bg-cyan-50'
                                }`}>
                                  <div 
                                    onClick={() => setZoomMember(mem)}
                                    className="relative inline-block cursor-pointer group/avatar"
                                    title="คลิกเพื่อดูรูปภาพขนาดใหญ่เต็มจอและซูมภาพ"
                                  >
                                    <img 
                                      src={mem.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
                                      alt={mem.fullName} 
                                      className="w-11 h-11 rounded-xl object-cover border-2 border-cyan-400/60 group-hover/avatar:border-cyan-500 group-hover/avatar:scale-105 transition-transform shadow-xs"
                                    />
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                                  </div>
                                </td>

                                {/* PINNED COLUMN 2: นามเรียกขาน (Sticky Left 68px) */}
                                <td className={`py-2.5 px-3.5 sticky left-[68px] z-20 w-[140px] min-w-[140px] max-w-[140px] border-r-2 border-cyan-400/60 shadow-[4px_0_8px_rgba(0,0,0,0.08)] whitespace-nowrap ${
                                  isEven ? 'bg-white group-hover:bg-cyan-50' : 'bg-slate-50 group-hover:bg-cyan-50'
                                }`}>
                                  <div className="flex flex-col whitespace-nowrap">
                                    {mem.callsign && mem.callsign !== '-' ? (
                                      <span className="font-mono font-bold text-sm text-slate-900 group-hover:text-cyan-800 tracking-wider whitespace-nowrap">
                                        {mem.callsign}
                                      </span>
                                    ) : (
                                      <span className="font-mono font-extrabold text-xs text-red-700 bg-yellow-300 px-2 py-0.5 rounded-md border border-yellow-500 shadow-2xs whitespace-nowrap inline-flex items-center gap-1 animate-pulse">
                                        รอ Callsign
                                      </span>
                                    )}
                                    <div className="flex items-center gap-1 mt-0.5 whitespace-nowrap">
                                      {mem.isSuperAdmin ? (
                                        <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded border border-sky-200 shrink-0">
                                          แอดมินหลัก
                                        </span>
                                      ) : mem.role === 'admin' ? (
                                        <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-300 shrink-0">
                                          แอดมิน
                                        </span>
                                      ) : (
                                        <span className="text-[9px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.2 rounded shrink-0">
                                          สมาชิก
                                        </span>
                                      )}
                                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                        #{mem.memberId}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* SCROLLABLE COLUMN 3: เครือข่าย DE */}
                                <td className="py-2.5 px-3.5 font-mono whitespace-nowrap min-w-[130px]">
                                  {mem.deNetworkCode ? (
                                    <span className="px-2.5 py-1 bg-cyan-50 text-cyan-800 font-bold rounded-lg border border-cyan-300 text-xs inline-flex items-center gap-1 whitespace-nowrap shrink-0 flex-nowrap">
                                      <Cpu className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                      <span className="whitespace-nowrap">{mem.deNetworkCode}</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-xs font-mono whitespace-nowrap">-</span>
                                  )}
                                </td>

                                {/* SCROLLABLE COLUMN 4: ชื่อ - นามสกุล */}
                                <td 
                                  onClick={() => setZoomMember(mem)}
                                  className="py-2.5 px-3.5 font-semibold text-slate-800 whitespace-nowrap min-w-[300px] cursor-pointer hover:text-cyan-700 transition"
                                  title="คลิกเพื่อดูรูปและข้อมูลสมาชิก"
                                >
                                  <span className="whitespace-nowrap">{mem.fullName}</span>
                                </td>

                                {/* SCROLLABLE COLUMN 5: ชื่อเล่น */}
                                <td className="py-2.5 px-3.5 whitespace-nowrap min-w-[110px]">
                                  {mem.nickname ? (
                                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200 whitespace-nowrap">
                                      {mem.nickname}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 whitespace-nowrap">-</span>
                                  )}
                                </td>

                                {/* SCROLLABLE COLUMN 6: เบอร์โทรศัพท์ (กดโทรได้) */}
                                <td className="py-2.5 px-3.5 font-mono whitespace-nowrap min-w-[160px]">
                                  <a 
                                    href={`tel:${mem.phone ? mem.phone.replace(/\D/g, '') : ''}`}
                                    className="text-sky-700 hover:text-sky-900 hover:underline font-bold text-xs inline-flex items-center gap-1.5 whitespace-nowrap group/tel"
                                    title="กดเพื่อโทรออก"
                                  >
                                    <span className="p-1 rounded-md bg-sky-100 text-sky-700 group-hover/tel:bg-sky-600 group-hover/tel:text-white transition shrink-0">
                                      <Phone className="w-3 h-3" />
                                    </span>
                                    <span>{mem.phone}</span>
                                  </a>
                                </td>

                                {/* SCROLLABLE COLUMN 7: ประเภท & อายุสมาชิก */}
                                <td className="py-2.5 px-3.5 text-xs whitespace-nowrap min-w-[180px]">
                                  <div className="space-y-0.5 whitespace-nowrap">
                                    <p className="font-semibold text-slate-800">{mem.memberType}</p>
                                    <p className="text-[10px] text-slate-500 font-mono">สิ้นสุด: {mem.endDate}</p>
                                    {mem.expiryAlert === 'expiring-1m' && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-yellow-300 text-red-700 px-2 py-0.5 rounded border border-yellow-500 shadow-2xs whitespace-nowrap animate-pulse">
                                        ⚠️ รอต่ออายุ (หมดอายุใน 1 ด.)
                                      </span>
                                    )}
                                    {mem.expiryAlert === 'expiring-6m' && (
                                      <span className="inline-block text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-300 whitespace-nowrap">
                                        ⏳ เหลือน้อยกว่า 6 เดือน
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* SCROLLABLE COLUMN 8: สถานะสิทธิ์ */}
                                <td className="py-2.5 px-3.5 text-xs whitespace-nowrap min-w-[170px]">
                                  {mem.status === 'รอตรวจสอบ' ? (
                                    <button
                                      type="button"
                                      onClick={() => setReviewingApplicationMember(mem)}
                                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold rounded-md text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer border border-amber-400/50 whitespace-nowrap"
                                      title="ตรวจใบสมัคร บัตรประชาชน ทะเบียนบ้าน และสลิปก่อนอนุมัติ"
                                    >
                                      <FileSearch className="w-3.5 h-3.5 text-amber-400" />
                                      <span>ตรวจใบสมัคร</span>
                                    </button>
                                  ) : (
                                    <div className="space-y-0.5 whitespace-nowrap">
                                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> ปกติ (อนุมัติแล้ว)
                                      </span>
                                      {mem.approvedByAdminName && (
                                        <div className="text-[9px] text-slate-500 leading-tight">
                                          <span>อนุมัติโดย: <strong>{mem.approvedByCallsign || mem.approvedByAdminName}</strong></span>
                                          <span className="block text-[8.5px] text-slate-400 font-mono">{mem.approvedAt}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </td>

                                {/* SCROLLABLE COLUMN 9: การจัดการ & หนังสือรับรอง */}
                                <td className="py-2.5 px-3.5 text-center min-w-[240px] whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1.5 flex-nowrap">
                                    {/* เปิดดูใบสมัคร */}
                                    <button
                                      type="button"
                                      onClick={() => setReviewingApplicationMember(mem)}
                                      className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 shrink-0"
                                      title="เปิดดูใบสมัครและเอกสารแนบ"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-sky-700" />
                                      <span>ใบสมัคร</span>
                                    </button>

                                    {/* หนังสือรับรอง */}
                                    <button
                                      type="button"
                                      onClick={() => setPreviewCertMember(mem)}
                                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-sky-50 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 shrink-0"
                                      title="เปิดหนังสือรับรองสมาชิก"
                                    >
                                      <Award className="w-3.5 h-3.5 text-slate-600" />
                                      <span>หนังสือรับรอง</span>
                                    </button>

                                    {/* ออกใบเสร็จรับเงิน */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReceiptSelectedMember(mem);
                                        setActiveTab('receipts');
                                      }}
                                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 shrink-0"
                                      title="ออกใบเสร็จรับเงินค่าบำรุง/แรกเข้าให้สมาชิกท่านนี้"
                                    >
                                      <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>ใบเสร็จ</span>
                                    </button>

                                    {/* ตั้ง/ถอดแอดมิน */}
                                    {!mem.isSuperAdmin && (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleAdminRole(mem.id)}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                                          mem.role === 'admin'
                                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                            : 'bg-slate-900 text-white hover:bg-slate-800'
                                        }`}
                                      >
                                        {mem.role === 'admin' ? 'ถอดแอดมิน' : 'ตั้งแอดมิน'}
                                      </button>
                                    )}

                                    {/* ลบสมาชิก */}
                                    {!mem.isSuperAdmin && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteMember(mem.id)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition cursor-pointer shrink-0"
                                        title="ลบข้อมูลสมาชิก"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* ================= VIEW 2: CARDS VIEW ================= */
                <div className="space-y-3">
                {filteredMembers.map((mem) => (
                  <div 
                    key={mem.id} 
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    {/* Top Row: รูปสมาชิก (กดเพื่อซูมรูปเต็มได้) + ชื่อ-นามสกุลบรรทัดเดียว + นามเรียกขาน + สถานะแอดมิน */}
                    <div className="flex items-start gap-3">
                      <div 
                        onClick={() => setZoomMember(mem)}
                        className="relative inline-block cursor-pointer group/avatar shrink-0"
                        title="คลิกเพื่อดูรูปภาพขนาดใหญ่เต็มจอและซูมภาพ"
                      >
                        <img 
                          src={mem.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
                          alt="avatar" 
                          className="w-12 h-12 rounded-xl object-cover border-2 border-cyan-400/60 group-hover/avatar:border-cyan-500 group-hover/avatar:scale-105 transition-transform shadow-2xs"
                        />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 
                            onClick={() => setZoomMember(mem)}
                            className="text-xs sm:text-sm font-bold text-slate-900 truncate cursor-pointer hover:text-cyan-700 transition"
                            title="คลิกเพื่อดูรูปและข้อมูลสมาชิก"
                          >
                            {mem.fullName}
                          </h4>
                          {mem.isSuperAdmin ? (
                            <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded border border-sky-200 shrink-0">
                              แอดมินหลัก
                            </span>
                          ) : mem.role === 'admin' ? (
                            <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300 shrink-0">
                              แอดมิน
                            </span>
                          ) : (
                            <span className="text-[9px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded shrink-0">
                              สมาชิก
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                          {mem.callsign && mem.callsign !== '-' ? (
                            <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {mem.callsign}
                            </span>
                          ) : (
                            <span className="font-mono font-extrabold text-xs text-red-700 bg-yellow-300 px-2.5 py-0.5 rounded border border-yellow-500 shadow-2xs animate-pulse">
                              รอ Callsign
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500 font-mono">
                            รหัส {mem.memberId}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Member Details in Clean Grid Rows */}
                    <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-100 space-y-1.5 text-xs">
                      {/* เบอร์โทรศัพท์ */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>เบอร์โทร:</span>
                        </span>
                        <a 
                          href={`tel:${mem.phone.replace(/\D/g, '')}`} 
                          className="font-mono font-bold text-sky-700 hover:underline"
                        >
                          {mem.phone}
                        </a>
                      </div>

                      {/* ประเภทสมาชิก */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>ประเภท:</span>
                        </span>
                        <span className="font-medium text-slate-800">
                          {mem.memberType}
                        </span>
                      </div>

                      {/* วันสิ้นสุดอายุสมาชิก */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>สิ้นสุด:</span>
                        </span>
                        <span className="font-mono font-semibold text-slate-700">
                          {mem.endDate}
                        </span>
                      </div>

                      {/* Expiry alerts (เน้นสีแดงพื้นหลังสีเหลืองเพื่อให้เห็นง่าย แอดมินโทรตามง่าย) */}
                      {mem.expiryAlert === 'expiring-1m' && (
                        <div className="p-2 bg-yellow-300 border border-yellow-500 rounded-lg text-red-700 text-xs font-extrabold flex items-center justify-between shadow-xs animate-pulse">
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                            <span>⚠️ รอต่ออายุ (หมดอายุใน 1 เดือน)</span>
                          </div>
                          {mem.phone && (
                            <a 
                              href={`tel:${mem.phone.replace(/\D/g, '')}`}
                              className="px-2 py-0.5 bg-red-700 hover:bg-red-800 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="กดโทรตามสมาชิกทันที"
                            >
                              <Phone className="w-3 h-3" />
                              <span>โทรตาม</span>
                            </a>
                          )}
                        </div>
                      )}
                      {mem.expiryAlert === 'expiring-6m' && (
                        <div className="p-1.5 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[10px] font-bold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>แจ้งเตือน: บัตรสมาชิกเหลือน้อยกว่า 6 เดือน</span>
                        </div>
                      )}

                      {/* เครือข่าย DE */}
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span>เครือข่าย DE:</span>
                        </span>
                        {mem.deNetworkCode ? (
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-mono font-bold rounded text-[11px] border border-sky-200">
                            {mem.deNetworkCode}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">- ไม่มีรหัส -</span>
                        )}
                      </div>

                      {/* ถ้าสถานะ รอตรวจสอบ: แอดมินต้องกดตรวจใบสมัครก่อน ถึงจะอนุมัติได้ */}
                      {mem.status === 'รอตรวจสอบ' && (
                        <div className="pt-2 border-t border-amber-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-amber-800 font-bold text-xs flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              สถานะ: รออนุมัติการสมัคร
                            </span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold border border-amber-300">
                              ต้องตรวจใบสมัครก่อน
                            </span>
                          </div>

                          {/* ปุ่มบังคับ: กดตรวจใบสมัครเพื่อดูเอกสารและอนุมัติ */}
                          <button
                            type="button"
                            onClick={() => setReviewingApplicationMember(mem)}
                            className="w-full py-2.5 px-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:bg-slate-800 text-amber-300 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md border border-amber-400/50"
                          >
                            <FileSearch className="w-4 h-4 text-amber-400 animate-pulse" />
                            <span>🔍 ตรวจใบสมัคร & เอกสาร (กดเพื่อตรวจและอนุมัติ)</span>
                          </button>
                        </div>
                      )}

                      {/* แสดงหลักฐานผู้อนุมัติ (Audit Trail) */}
                      {mem.status === 'อนุมัติแล้ว' && mem.approvedByAdminName && (
                        <div className="pt-2 border-t border-slate-100 text-[10px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/80 space-y-0.5">
                          <div className="flex items-center gap-1 font-bold text-emerald-900">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>หลักฐานการอนุมัติสมาชิก:</span>
                          </div>
                          <p className="text-slate-700 pl-4">
                            ผู้อนุมัติ: <strong>{mem.approvedByAdminName}</strong> ({mem.approvedByCallsign || 'แอดมิน'})
                          </p>
                          <p className="text-slate-500 pl-4 font-mono">
                            วันที่: {mem.approvedAt}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 flex-wrap">
                      {/* เปิดตรวจสอบใบสมัคร & เอกสาร */}
                      <button
                        type="button"
                        onClick={() => setReviewingApplicationMember(mem)}
                        className="flex-1 py-2 px-2 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1"
                        title="เปิดดูใบสมัครและเอกสารแนบ"
                      >
                        <FileText className="w-3.5 h-3.5 text-sky-700" />
                        <span>ใบสมัคร</span>
                      </button>

                      {/* เปิดหนังสือรับรอง */}
                      <button
                        type="button"
                        onClick={() => setPreviewCertMember(mem)}
                        className="flex-1 py-2 px-2 bg-slate-100 hover:bg-sky-50 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Award className="w-3.5 h-3.5 text-slate-600" />
                        <span>หนังสือรับรอง</span>
                      </button>

                      {/* ออกใบเสร็จรับเงิน */}
                      <button
                        type="button"
                        onClick={() => {
                          setReceiptSelectedMember(mem);
                          setActiveTab('receipts');
                        }}
                        className="flex-1 py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1"
                        title="ออกใบเสร็จรับเงินให้สมาชิกท่านนี้"
                      >
                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ใบเสร็จ</span>
                      </button>

                      {/* ตั้ง/ถอดแอดมิน */}
                      {!mem.isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => handleToggleAdminRole(mem.id)}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            mem.role === 'admin'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          {mem.role === 'admin' ? 'ถอดแอดมิน' : 'ตั้งแอดมิน'}
                        </button>
                      )}

                      {/* ลบสมาชิก */}
                      {!mem.isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(mem.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition cursor-pointer"
                          title="ลบสมาชิก"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                ))}

                {filteredMembers.length === 0 && (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
                    ไม่พบข้อมูลสมาชิกตามคำค้นหา
                  </div>
                )}
              </div>
            )}
            </div>
          )}

          {/* ================= TAB 3: DE NETWORK REQUESTS & 1-CLICK COPY ================= */}
          {activeTab === 'de_requests' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    คำขอรหัสเครือข่าย DE (Digital Emergency)
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    สำหรับเครื่องวิทยุสื่อสาร Spender แอดมินสามารถกด <strong>คัดลอกข้อมูล 1-คลิก</strong> ไปบันทึกลงระบบภายนอกได้สะดวกรวดเร็ว
                  </p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 max-w-full flex-nowrap">
                  <button
                    onClick={() => setDeStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer shrink-0 whitespace-nowrap ${
                      deStatusFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ทั้งหมด ({deRequests.length})
                  </button>
                  <button
                    onClick={() => setDeStatusFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                      deStatusFilter === 'pending' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    รอตรวจสอบ ({deRequests.filter(r => r.status === 'รอตรวจสอบ').length})
                  </button>
                </div>
              </div>

              {/* Requests List */}
              <div className="space-y-3">
                {filteredDeRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-5 hover:border-sky-300 transition space-y-3">
                    
                    {/* Top Row: User + Callsign + Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center font-mono font-bold text-sky-900 text-xs">
                          DE
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-700 text-sm">
                              {req.callsign}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">
                              {req.fullName}
                            </span>
                            {req.assignedDeCode && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded border border-emerald-300">
                                {req.assignedDeCode}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            ยื่นคำขอเมื่อ: {req.requestedDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {req.status === 'อนุมัติแล้ว' ? (
                          <div className="text-right">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> อนุมัติเรียบร้อยแล้ว
                            </span>
                            {req.approvedBy && (
                              <p className="text-[9.5px] text-slate-500 mt-0.5">
                                ผู้อนุมัติ: {req.approvedBy}
                              </p>
                            )}
                            {req.approvedDate && (
                              <p className="text-[9px] text-slate-400 font-mono">
                                {req.approvedDate}
                              </p>
                            )}
                          </div>
                        ) : req.status?.includes('ผ่านการตรวจ') ? (
                          <div className="flex items-center gap-2">
                            <span className="hidden sm:inline px-2 py-0.5 bg-blue-50 text-blue-800 text-[10.5px] font-semibold rounded-lg border border-blue-200">
                              ✓ แอดมินตรวจแล้ว
                            </span>
                            <button
                              onClick={() => handleApproveDeRequest(req.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                              title="ลงนามอนุมัติขั้นสุดท้ายและออกรหัส DE"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />
                              <span>✍️ นายก/รองนายกลงนามอนุมัติ</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePreliminaryScreenDe(req.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-700 hover:bg-sky-600 text-white transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                              title="ตรวจสอบคุณสมบัติเครื่อง Spender เบื้องต้นและส่งต่อนายกสมาคม"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>📋 ตรวจสอบเบื้องต้น</span>
                            </button>
                            <button
                              onClick={() => handleApproveDeRequest(req.id)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center gap-1 border border-slate-300"
                              title="อนุมัติทันทีด้วยสิทธิ์ผู้ดูแลระบบหลัก"
                            >
                              <span>⚡ ออกรหัสทันที</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Multi-Step Approval Timeline Bar */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">ขั้นตอนการอนุมัติ (DE Approval Workflow):</span>
                        <span className="font-mono text-slate-500 font-bold">
                          {req.status === 'อนุมัติแล้ว' 
                            ? '✅ ผ่านการอนุมัติสมบูรณ์' 
                            : (req.status?.includes('ผ่านการตรวจ') ? '⏳ ขั้นตอนที่ 2: รอนายกสมาคม/รองนายกฯ ลงนาม' : '📋 ขั้นตอนที่ 1: รอแอดมินตรวจเครื่อง Spender')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center justify-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" /> 1. สมาชิกยื่นคำขอ
                        </div>
                        <div className={`p-1.5 rounded-lg border font-bold flex items-center justify-center gap-1 ${
                          req.status?.includes('ผ่านการตรวจ') || req.status === 'อนุมัติแล้ว'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                        }`}>
                          {req.status?.includes('ผ่านการตรวจ') || req.status === 'อนุมัติแล้ว' ? <Check className="w-3 h-3 text-emerald-700" /> : '⏳'} 2. แอดมินตรวจเบื้องต้น
                        </div>
                        <div className={`p-1.5 rounded-lg border font-bold flex items-center justify-center gap-1 ${
                          req.status === 'อนุมัติแล้ว'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : (req.status?.includes('ผ่านการตรวจ') ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse' : 'bg-slate-100 text-slate-400 border-slate-200')
                        }`}>
                          {req.status === 'อนุมัติแล้ว' ? <Check className="w-3 h-3 text-emerald-700" /> : '✍️'} 3. นายก/รองนายกอนุมัติ
                        </div>
                      </div>

                      {/* Audit Note from Admin / Coordinator */}
                      {req.screenedNotes && (
                        <div className="pt-1.5 border-t border-slate-200/80 text-[10.5px] text-slate-600 flex flex-wrap items-center justify-between gap-1">
                          <span>📝 บันทึกตรวจเบื้องต้น: <strong className="text-slate-900">{req.screenedNotes}</strong></span>
                          <span className="text-slate-400 font-mono text-[10px]">โดย {req.screenedBy} ({req.screenedDate})</span>
                        </div>
                      )}
                    </div>

                    {/* Information Grid with 1-Click Copy Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                      
                      {/* IMEI */}
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-500 block uppercase font-medium">หมายเลข IMEI (Spender)</span>
                          <span className="font-mono font-bold text-slate-900 tracking-wider text-xs truncate block">{req.imei}</span>
                        </div>
                        <button
                          onClick={() => handleCopyText(req.imei, 'IMEI')}
                          className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-white rounded transition cursor-pointer shrink-0 ml-1 border border-transparent hover:border-slate-200"
                          title="คัดลอก IMEI"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Device Model & Shop */}
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">รุ่นเครื่อง & ร้านค้า (Spender)</span>
                        <span className="font-semibold text-slate-900 text-xs truncate block">{req.deviceModel || 'Spender Network Radio'}</span>
                        <span className="text-[10px] text-slate-500 truncate block mt-0.5">ซื้อจาก: {req.purchaseShop || 'ตัวแทนจำหน่าย Spender'}</span>
                      </div>

                      {/* Phone */}
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-500 block uppercase font-medium">เบอร์โทรศัพท์</span>
                          <span className="font-mono font-bold text-slate-900 text-xs truncate block">{req.phone}</span>
                        </div>
                        <button
                          onClick={() => handleCopyText(req.phone, 'เบอร์โทร')}
                          className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-white rounded transition cursor-pointer shrink-0 ml-1 border border-transparent hover:border-slate-200"
                          title="คัดลอกเบอร์โทร"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                    {/* Question Snapshots (คำตอบประวัติของสมาชิกที่เคยยื่นไว้ ไม่สูญหายแม้ลบคำถาม) */}
                    {req.questionSnapshots && req.questionSnapshots.length > 0 && (
                      <div className="p-2.5 bg-sky-50/50 rounded-lg border border-sky-100 text-[11px] space-y-1">
                        <span className="font-bold text-sky-900 block text-[10px]">ข้อมูลเปิดระบบใช้งานเครื่องที่บันทึกไว้:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                          {req.questionSnapshots.map((qs, qIdx) => (
                            <div key={qIdx} className="flex items-center justify-between py-0.5 border-b border-sky-100/60 text-[10.5px]">
                              <span className="text-slate-500 truncate max-w-[200px]">{qs.label}:</span>
                              <span className="font-semibold text-slate-800 text-right">{qs.value || '-'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Action: Copy All Formatted */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                      <span>QTH: <strong>{req.qthProvince}</strong> • อีเมล: {req.email || '-'}</span>
                      <button
                        onClick={() => handleCopyDeFullInfo(req)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Copy className="w-3 h-3 text-slate-600" />
                        <span>คัดลอกข้อมูลทั้งหมด 1-คลิก (สำหรับกรอกระบบ Spender)</span>
                      </button>
                    </div>

                  </div>
                ))}

                {filteredDeRequests.length === 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                    ไม่มีคำขอรหัสเครือข่าย DE ในหมวดหมู่นี้
                  </div>
                )}
              </div>

              {/* Question Schema Configurator Section (ตั้งค่าชุดคำถามแบบฟอร์ม DE โดยแอดมิน) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-sky-600" />
                      <span>จัดการชุดคำถามแบบฟอร์มขอรหัส DE (สำหรับเชื่อมต่อ Spender & สมาคมฯ)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      แอดมินสามารถเพิ่มหรือลดคำถามได้ตามที่ทาง Spender หรือสมาคมฯ ต้องการปรับปรุง (คำตอบของสมาชิกเดิมจะยังคงถูกบันทึกไว้อย่างสมบูรณ์)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddQuestionOpen(true)}
                    className="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มคำถามใหม่</span>
                  </button>
                </div>

                {/* Questions List */}
                <div className="space-y-2">
                  {deQuestions.map((q, idx) => (
                    <div 
                      key={q.id} 
                      className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition ${
                        q.active !== false 
                          ? 'bg-slate-50 border-slate-200' 
                          : 'bg-slate-100/70 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800">{idx + 1}. {q.label}</span>
                          {q.required && (
                            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 rounded font-semibold">
                              บังคับตอบ
                            </span>
                          )}
                          {q.active !== false ? (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 rounded font-semibold">
                              แสดงในฟอร์ม
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 rounded">
                              ปิดใช้งาน
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ข้อความตัวอย่าง: <em>"{q.placeholder || 'กรอกข้อมูล...'}"</em>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleDeQuestion(q.id)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-medium transition cursor-pointer"
                        >
                          {q.active !== false ? 'ซ่อนในฟอร์ม' : 'เปิดใช้งาน'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDeQuestion(q.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="ลบคำถามออกจากแบบฟอร์ม"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Question Modal */}
                {isAddQuestionOpen && (
                  <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 space-y-3 animate-in fade-in duration-150">
                    <h4 className="font-bold text-xs text-sky-950 flex items-center justify-between">
                      <span>เพิ่มคำถามใหม่ในแบบฟอร์มขอรหัส DE</span>
                      <button 
                        type="button"
                        onClick={() => setIsAddQuestionOpen(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </h4>

                    <form onSubmit={handleAddDeQuestion} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          หัวข้อคำถาม (Label) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newQuestionLabel}
                          onChange={(e) => setNewQuestionLabel(e.target.value)}
                          placeholder="เช่น เลขที่ใบเสร็จรับเงิน, วันที่ซื้อเครื่อง, วัตถุประสงค์การใช้งาน"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          ข้อความแนะนำในช่องกรอก (Placeholder)
                        </label>
                        <input
                          type="text"
                          value={newQuestionPlaceholder}
                          onChange={(e) => setNewQuestionPlaceholder(e.target.value)}
                          placeholder="เช่น INV-2026/0012, วันที่ซื้อ 10 พ.ย. 2569"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="reqCheck"
                          checked={newQuestionRequired}
                          onChange={(e) => setNewQuestionRequired(e.target.checked)}
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                        <label htmlFor="reqCheck" className="text-xs text-slate-700 cursor-pointer font-medium">
                          บังคับให้ผู้สมัครต้องตอบคำถามนี้ (Required)
                        </label>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddQuestionOpen(false)}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold cursor-pointer shadow-2xs"
                        >
                          บันทึกคำถาม
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ================= TAB: UNIFIED DOCUMENT STUDIO (ใบสมัคร, ใบเสร็จ, หนังสือรับรอง, ลายเซ็น) ================= */}
          {(activeTab === 'documents' || activeTab === 'receipts' || activeTab === 'certificates') && (
            <DocumentStudio
              membersList={membersList}
              currentUser={currentUser}
            />
          )}

          {/* ================= TAB: ADMIN ROLES & RBAC PERMISSIONS ================= */}
          {activeTab === 'roles' && (
            <AdminRoleManager
              membersList={membersList}
              currentUser={currentUser}
            />
          )}

          {/* ================= TAB 5: NEWS MANAGEMENT ================= */}
          {activeTab === 'news' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">ประกาศและข่าวสารประชาสัมพันธ์</h1>
                  <p className="text-xs text-slate-500 mt-0.5">เผยแพร่ข้อมูลข่าวสาร ข้อความแจ้งเตือน และการอบรมสู่หน้าเว็บไซต์</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100">
                {newsList.map((article) => (
                  <div key={article.id} className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {article.isPinned && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shrink-0 whitespace-nowrap">
                            <Pin className="w-3 h-3" /> ปักหมุด
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">{article.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                      <p className="text-[10px] text-slate-400 font-mono whitespace-nowrap">วันที่เผยแพร่: {article.date} • โดย: {article.author}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5 sm:pt-0">
                      <button
                        onClick={() => handleTogglePinNews(article.id)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer ${
                          article.isPinned ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                        title={article.isPinned ? "ยกเลิกปักหมุด" : "ปักหมุดข่าวนี้"}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNews(article.id)}
                        className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="ลบข่าวนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB: TELEGRAM NOTIFICATIONS & DOCUMENT STORAGE ================= */}
          {activeTab === 'telegram' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Send className="w-6 h-6 text-[#0088cc]" />
                    <span>ระบบแจ้งเตือน & จัดเก็บภาพใน Telegram (บอท HS9AS)</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    เชื่อมต่อบอท TRIPLE T ROBOT ส่งข้อมูลใบสมัคร รูปถ่าย 4 รายการ ใบเสร็จรับเงิน และหนังสือรับรองสมาชิกเข้ากลุ่มอัตโนมัติ
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTelegramModalOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#0088cc] to-[#0077b5] hover:from-[#0077b5] hover:to-[#006699] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition cursor-pointer flex items-center gap-2 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>ตั้งค่า Telegram & ทดสอบ</span>
                </button>
              </div>

              {/* Group Snapshot Banner */}
              <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-sky-700/50 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-lg text-white shadow-inner shrink-0">
                      HS9AS
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-bold text-white">
                          HS9AS สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา
                        </h2>
                        <span className="text-[11px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-semibold">
                          กลุ่มเป้าหมาย (Telegram Group)
                        </span>
                      </div>
                      <p className="text-xs text-sky-200 mt-1">
                        ผู้ดูแลกลุ่ม: <b>คุณทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด) • E26ECG</b> • บอทประจำกลุ่ม: <b>TRIPLE T ROBOT</b>
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-sky-100 flex-wrap">
                        <span className="bg-black/30 px-2.5 py-1 rounded-lg border border-white/10 font-mono">
                          Chat ID: -1005204937286
                        </span>
                        <a 
                          href="https://web.telegram.org/k/#-5204937286" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sky-300 hover:text-white underline"
                        >
                          <span>เปิด Telegram Web</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsTelegramModalOpen(true)}
                      className="px-4 py-2 bg-white text-slate-900 hover:bg-sky-50 rounded-xl text-xs font-bold shadow transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Bot className="w-4 h-4 text-sky-600" />
                      <span>จัดการการเชื่อมต่อ</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Automation Workflows Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Workflow 1 */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 text-sky-900">
                      <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">1. ส่งใบสมัคร & รูปถ่าย 4 รายการ</h3>
                        <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full font-semibold border border-sky-200">
                          ทำงานอัตโนมัติเมื่อผู้สมัครกดยื่นใบสมัคร
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      เมื่อมีผู้ยื่นใบสมัครสมาชิกใหม่เข้ามาในระบบ ระบบจะรวบรวมข้อมูลและส่งภาพเข้ากลุ่ม Telegram ทันที:
                    </p>
                    <ul className="text-xs text-slate-700 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <li className="flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                        <span>1️⃣ รูปถ่ายหน้าตรง 1 นิ้วของผู้สมัคร</span>
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                        <span>2️⃣ สำเนาบัตรประจำตัวประชาชน</span>
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                        <span>3️⃣ สำเนาทะเบียนบ้าน</span>
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                        <span>4️⃣ สลิปการโอนเงินค่าบำรุงสมาชิก</span>
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                        <span>5️⃣ แบบคำขอสมัครสมาชิก สมาคมฯ (Form Doc)</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>สถานะการส่ง: <b>เปิดใช้งาน</b></span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      พร้อมทำงาน
                    </span>
                  </div>
                </div>

                {/* Workflow 2 */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 text-emerald-900">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">2. ออกใบเสร็จ & หนังสือรับรองสมาชิก</h3>
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                          ทำงานอัตโนมัติเมื่อแอดมินกดอนุมัติ
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      เมื่อแอดมินหรือคณะกรรมการตรวจสอบเอกสารและกดปุ่ม "อนุมัติการสมัคร" ในระบบ:
                    </p>
                    <ul className="text-xs text-slate-700 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <li className="flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>🧾 ภาพใบเสร็จรับเงินอิเล็กทรอนิกส์ (e-Receipt) ฉบับสมบูรณ์</span>
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>📜 ภาพหนังสือรับรองสถานะการเป็นสมาชิกสมาคม (Official Certificate)</span>
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>✍️ บันทึกหลักฐานผู้อนุมัติ: ผอ.โต๊ด (E26ECG) และวันเวลาที่อนุมัติ</span>
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>💾 เก็บสำเนาภาพไว้ในกลุ่ม Telegram ป้องกันข้อมูลสูญหาย</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>สถานะการส่ง: <b>เปิดใช้งาน</b></span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      พร้อมทำงาน
                    </span>
                  </div>
                </div>

              </div>

              <DeveloperCredit />
            </div>
          )}

          {/* ================= TAB: CLOUDINARY STORAGE & RETENTION PURGE ================= */}
          {activeTab === 'cloudinary' && (
            <CloudinaryStorageManager
              membersList={membersList}
              onUpdateMembersList={onUpdateMembersList}
              currentUser={currentUser}
              showToast={showToast}
            />
          )}

          {/* ================= TAB 6: APPEARANCE & THEME (SECTION-BY-SECTION BACKGROUND & OPACITY) ================= */}
          {activeTab === 'appearance' && (() => {
            const currentSectionInfo = sectionList.find(s => s.id === selectedSection) || sectionList[0];
            const currentTheme = sectionThemesState[selectedSection] || defaultSectionThemes[selectedSection] || {};
            const currentOpacity = typeof currentTheme.opacity === 'number' ? currentTheme.opacity : 50;
            const currentOverlay = currentTheme.overlayType || 'ocean-wave';
            const overlayInfo = overlayThemes.find(o => o.id === currentOverlay) || overlayThemes[0];

            return (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>🎨 ปรับแต่งภาพพื้นหลัง & โทนฟ้าน้ำทะเล (Appearance & Ocean Theme)</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      เลือกเปลี่ยนภาพพื้นหลังในแต่ละหน้า/ส่วนได้อย่างอิสระ พร้อมแถบปรับความโปร่งแสง (เช่น 50%, 60%) และเลือกโทนสีน้ำทะเลคลื่นตัดกันอย่างสวยงาม
                    </p>
                  </div>

                  <button
                    onClick={handleSaveAppearance}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-cyan-500/25 transition cursor-pointer flex items-center gap-2 shrink-0"
                  >
                    <Check className="w-4 h-4" />
                    <span>บันทึกการตั้งค่าฉากหลังทั้งหมด</span>
                  </button>
                </div>

                {/* 1. SECTION SELECTOR TABS (เลือกหน้าที่ต้องการปรับแต่ง) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-cyan-600" />
                      <span>เลือกหน้า / ส่วนที่ต้องการปรับแต่งฉากหลัง:</span>
                    </label>
                    <span className="text-[11px] text-slate-500">คลิกเลือกหน้าเพื่อปรับแต่งแยกอิสระ</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 sm:grid sm:grid-cols-3 lg:grid-cols-6 max-w-full flex-nowrap sm:flex-wrap">
                    {sectionList.map(sec => {
                      const secTheme = sectionThemesState[sec.id] || defaultSectionThemes[sec.id] || {};
                      const isSelected = selectedSection === sec.id;
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => setSelectedSection(sec.id)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[76px] shrink-0 min-w-[140px] sm:min-w-0 ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#012a4a] to-[#01497c] text-white border-cyan-400 shadow-md ring-2 ring-cyan-400/40'
                              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-lg">{sec.icon}</span>
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                              isSelected ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/40' : 'bg-slate-100 text-slate-600'
                            }`}>
                              โปร่ง {secTheme.opacity ?? 50}%
                            </span>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs font-bold truncate leading-tight whitespace-nowrap">{sec.label}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. INTERACTIVE LIVE PREVIEW BOX (ตัวอย่างสดของหน้านั้น) */}
                <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-cyan-500/50 relative">
                  <div className="min-h-[220px] sm:min-h-[260px] bg-cover bg-center transition-all duration-500 flex flex-col justify-between p-6 relative overflow-hidden">
                    
                    {/* Background Image with Live Opacity */}
                    {currentTheme.bgUrl && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-all duration-500 pointer-events-none"
                        style={{ 
                          backgroundImage: `url('${currentTheme.bgUrl}')`,
                          opacity: currentOpacity / 100,
                        }}
                      />
                    )}
                    
                    {/* Ocean Wave Overlay Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${getOverlayGradient(currentOverlay)} pointer-events-none`} />
                    
                    {/* Wave lines pattern texture */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
                    <div className="absolute -top-12 left-1/3 w-96 h-28 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Preview Status Bar */}
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-amber-300 font-mono tracking-wider uppercase font-bold bg-slate-950/80 px-3 py-1 rounded-full border border-amber-400/40 flex items-center gap-1.5 shadow">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        <span>LIVE PREVIEW: {currentSectionInfo.label}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-cyan-200 font-mono bg-[#012038]/90 px-3 py-1 rounded-full border border-cyan-400/50 shadow">
                          ความโปร่งแสง: <strong className="text-white font-bold">{currentOpacity}%</strong>
                        </span>
                        <span className="text-[11px] text-sky-200 font-mono bg-sky-950/80 px-2.5 py-1 rounded-full border border-sky-600/40 hidden sm:inline-block">
                          {overlayInfo.name}
                        </span>
                      </div>
                    </div>

                    {/* Realistic Mock Content of the Selected Section */}
                    <div className="relative z-10 my-4 text-center sm:text-left">
                      <h3 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
                        {settings.associationNameTh}
                      </h3>
                      <p className="text-xs text-cyan-200/90 font-mono mt-0.5">
                        {currentSectionInfo.desc} • ตัวอย่างการแสดงผลจริงบนพื้นหลังโปร่งแสง {currentOpacity}%
                      </p>

                      {/* Mock Card verifying contrast & readability */}
                      <div className="mt-3.5 inline-block text-left p-3.5 bg-white/95 backdrop-blur-md rounded-xl border border-cyan-200 shadow-lg max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          <span className="text-xs font-bold text-slate-900">ทดสอบความคมชัดของข้อความบนพื้นหลังโปร่งแสง</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          ความโปร่งแสง {currentOpacity}% ช่วยให้มองเห็นลวดลายภาพถ่ายด้านหลังได้อย่างลงตัว โดยที่ตัวอักษรและข้อมูลยังคงอ่านง่าย สบายตา
                        </p>
                      </div>
                    </div>

                    {/* Preview Bottom Bar */}
                    <div className="relative z-10 flex items-center justify-between text-[11px] text-cyan-200/80 border-t border-cyan-500/30 pt-2 font-mono">
                      <span className="truncate max-w-[280px]">URL: {currentTheme.bgUrl || 'ไม่มีภาพ'}</span>
                      <span>สมาคมวิทยุสมัครเล่นสมิหลา ({settings.officialCallsign})</span>
                    </div>

                  </div>
                </div>

                {/* 3. OPACITY SLIDER (แถบปรับความโปร่งแสง เช่น 50%, 60%) */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
                        <span>ปรับระดับความโปร่งใสของภาพพื้นหลัง (Background Opacity):</span>
                        <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-mono text-xs font-bold shadow-xs">
                          {currentOpacity}%
                        </span>
                      </label>
                      <p className="text-[11px] text-slate-500 mt-1">
                        เลื่อนปรับเปอร์เซ็นต์ได้ตามต้องการ ยิ่งปรับน้อยจะยิ่งโปร่งแสงเนียนตา หากปรับมากจะเห็นภาพถ่ายชัดเจน
                      </p>
                    </div>

                    {/* Quick Preset Buttons (เช่น 50%, 60% ตามที่ผู้ใช้กล่าวถึง) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-nowrap max-w-full">
                      {[
                        { label: '20% จางบางเบา', val: 20 },
                        { label: '40% นุ่มนวล', val: 40 },
                        { label: '50% สมดุล', val: 50 },
                        { label: '60% โปร่งแสง', val: 60 },
                        { label: '75% ชัดเจน', val: 75 },
                        { label: '90% เด่นชัด', val: 90 },
                      ].map(preset => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => handleUpdateCurrentTheme('opacity', preset.val)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer border shrink-0 whitespace-nowrap ${
                            currentOpacity === preset.val
                              ? 'bg-cyan-600 text-white border-cyan-600 font-bold shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Range Slider Control */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs font-mono text-slate-400 font-bold">0% (ซ่อนภาพ)</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={currentOpacity}
                      onChange={(e) => handleUpdateCurrentTheme('opacity', Number(e.target.value))}
                      className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                    />
                    <span className="text-xs font-mono text-slate-400 font-bold">100% (เต็มที่)</span>
                  </div>
                </div>

                {/* 4. OCEAN WAVE OVERLAY SELECTOR (เลือกโทนสีน้ำทะเลและเส้นตัด) */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-cyan-600" />
                      <span>เลือกโทนสีน้ำทะเลและเส้นตัดโอเวอร์เลย์ (Ocean Wave Overlay Theme):</span>
                    </label>
                    <span className="text-[11px] text-slate-500">เปลี่ยนบรรยากาศสีน้ำทะเลสำหรับหน้านี้</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {overlayThemes.map(ot => {
                      const isSelected = currentOverlay === ot.id;
                      return (
                        <div
                          key={ot.id}
                          onClick={() => handleUpdateCurrentTheme('overlayType', ot.id)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-50/60 ring-2 ring-cyan-400/40 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div 
                            className="w-8 h-8 rounded-lg shrink-0 shadow-xs border border-white/60"
                            style={{ backgroundColor: ot.accentColor }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-900 truncate">{ot.name}</p>
                              {isSelected && <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0" />}
                            </div>
                            <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">{ot.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. BACKGROUND IMAGE PICKER (เลือกภาพแนะนำ & ใส่ URL เอง) */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-cyan-600" />
                      <span>เลือกภาพพื้นหลังแนะนำ (สถานที่สำคัญในสงขลา & วิวทะเลสมิหลา)</span>
                    </h3>
                    <span className="text-[11px] text-slate-500">คลิกที่รูปภาพเพื่อเลือกใช้งานทันที</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {sampleBackgrounds.map((bg) => {
                      const isSelected = currentTheme.bgUrl === bg.url;
                      return (
                        <div 
                          key={bg.id}
                          onClick={() => handleUpdateCurrentTheme('bgUrl', bg.url)}
                          className={`relative rounded-xl overflow-hidden border-2 cursor-pointer group transition ${
                            isSelected ? 'border-cyan-500 ring-2 ring-cyan-400/40 shadow-md' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img src={bg.url} alt={bg.title} className="w-full h-24 object-cover group-hover:scale-105 transition duration-300" />
                          <div className="p-2 bg-white">
                            <span className="text-[9px] font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                              {bg.category}
                            </span>
                            <p className="text-[11px] font-semibold text-slate-800 truncate mt-1">{bg.title}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* File Upload from Computer / Mobile */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">หรืออัปโหลดภาพพื้นหลังของคุณเองจากคอมพิวเตอร์ / มือถือ:</span>
                      <span className="text-[11px] text-slate-500">รองรับไฟล์ JPG, PNG, WEBP จากเครื่องของคุณ</span>
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:border-cyan-500 rounded-xl text-xs font-semibold text-slate-700 hover:text-cyan-800 transition shadow-2xs shrink-0">
                      <Upload className="w-4 h-4 text-cyan-600" />
                      <span>เลือกไฟล์รูปภาพจากเครื่อง</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                handleUpdateCurrentTheme('bgUrl', event.target.result);
                                showToast(`อัปโหลดรูปภาพ "${file.name}" เรียบร้อยแล้ว`);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* Custom URL Input */}
                  <div className="pt-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      หรือระบุ URL รูปภาพพื้นหลังของหน้านี้ (Custom Image URL)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/your-custom-photo.jpg"
                      value={currentTheme.bgUrl || ''}
                      onChange={(e) => handleUpdateCurrentTheme('bgUrl', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-cyan-500 font-mono"
                    />
                  </div>

                  {/* Action Toolbar for Section */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap pb-1 sm:pb-0">
                      <button
                        type="button"
                        onClick={handleApplyToAllSections}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border border-slate-300 shadow-2xs shrink-0 whitespace-nowrap"
                        title="นำรูปภาพและความโปร่งแสงของหน้านี้ไปใช้งานกับทุกหน้าทั้งหมด"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-600" />
                        <span>นำภาพและค่านี้ไปใช้กับทุกหน้า (Apply to All)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetCurrentSection}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition cursor-pointer border border-slate-300 shadow-2xs shrink-0 whitespace-nowrap"
                        title="คืนค่าภาพพื้นหลังและความโปร่งแสงของหน้านี้เป็นค่ามาตรฐาน"
                      >
                        <span>คืนค่าเริ่มต้นหน้านี้</span>
                      </button>
                    </div>

                    <button
                      onClick={handleSaveAppearance}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
                    >
                      <Check className="w-4 h-4" />
                      <span>บันทึกการตั้งค่าฉากหลังของหน้านี้</span>
                    </button>
                  </div>
                </div>

                {/* 6. GENERAL BRANDING (URL ตราสัญลักษณ์ / โลโก้สมาคม) */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    ตราสัญลักษณ์ / โลโก้สมาคม (Association Logo)
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      URL ตราสัญลักษณ์ / โลโก้สมาคม
                    </label>
                    <div className="flex items-center gap-3">
                      <AssociationLogo customUrl={customLogoInput || settings.customLogoUrl} className="w-10 h-10 rounded-full border border-slate-300 shadow-xs shrink-0" />
                      <input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={customLogoInput}
                        onChange={(e) => setCustomLogoInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* ================= TAB 7: REPEATERS & FREQUENCIES ================= */}
          {activeTab === 'repeaters' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">สถานะความถี่ & สถานีทวนสัญญาณ</h1>
                <p className="text-xs text-slate-500 mt-0.5">ข่ายสื่อสารภาคพื้นดินและสถานีทวนสัญญาณประจำจังหวัดสงขลา</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">Repeater เขาคอหงส์ (HS9AS)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">ออนไลน์</span>
                  </div>
                  <p className="text-xs text-slate-600">ความถี่: <strong className="font-mono text-amber-700">145.6750 MHz (Dup -600 kHz)</strong></p>
                  <p className="text-xs text-slate-600">โทน: <span className="font-mono">123.0 Hz</span></p>
                  <p className="text-[11px] text-slate-500">ครอบคลุม อ.หาดใหญ่, เมืองสงขลา, สิงหนคร, สทิงพระ และอ่าวไทย</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">ข่ายสื่อสารฉุกเฉินและสาธารณภัย</span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded">สแตนด์บาย</span>
                  </div>
                  <p className="text-xs text-slate-600">ความถี่: <strong className="font-mono text-amber-700">144.9000 MHz (Simplex)</strong></p>
                  <p className="text-xs text-slate-600">ศูนย์ประสานงาน: แหลมสมิหลา</p>
                  <p className="text-[11px] text-slate-500">สำหรับปฏิบัติการประสานงานกรณีเกิดภัยพิบัติและอุทกภัย</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Developer Credit Signature Bar */}
        <div className="mt-auto">
          <DeveloperCredit variant="light" />
        </div>

      </main>

      {/* Certificate Modal for Preview/Print */}
      {previewCertMember && (
        <CertificateModal
          isOpen={!!previewCertMember}
          onClose={() => setPreviewCertMember(null)}
          member={previewCertMember}
          settings={settings}
        />
      )}

      {/* Application Review Modal (ตรวจสอบใบสมัคร & เอกสารแนบ & บันทึกภาพลงเครื่อง) */}
      {reviewingApplicationMember && (
        <ApplicationReviewModal
          isOpen={!!reviewingApplicationMember}
          onClose={() => setReviewingApplicationMember(null)}
          member={reviewingApplicationMember}
          currentUser={currentUser}
          onOpenReceipt={(mem) => {
            setReceiptSelectedMember(mem);
            setActiveTab('receipts');
          }}
          onApproveMember={(id, auditData) => {
            handleApproveMember(id, auditData);
            setReviewingApplicationMember(prev => prev ? ({ ...prev, status: 'อนุมัติแล้ว', ...auditData }) : null);
          }}
          onUpdateMember={(updatedMem) => {
            const updated = membersList.map(m => m.id === updatedMem.id ? updatedMem : m);
            onUpdateMembersList(updated);
            setReviewingApplicationMember(updatedMem);
          }}
        />
      )}

      {/* Full Photo Zoom Lightbox Modal */}
      <FullPhotoZoomModal
        isOpen={Boolean(zoomMember)}
        onClose={() => setZoomMember(null)}
        member={zoomMember}
        currentUser={currentUser}
      />

      {/* Sequence Settings Modal (Member ID & Receipt Rollover) */}
      <SequenceSettingsModal
        isOpen={isSequenceModalOpen}
        onClose={() => setIsSequenceModalOpen(false)}
        onSaveSuccess={() => {
          setMemberSeqConfig(getMemberSequenceConfig());
          showToast('บันทึกการตั้งค่าระบบรันเลขสมาชิกและตัดเล่มเรียบร้อยแล้ว');
        }}
      />

      {/* App Owner PIN Confirmation Modal (ยืนยันสิทธิ์เจ้าของแอปก่อนบันทึกภาพพื้นหลัง/ธีม) */}
      <AdminPinConfirmModal
        isOpen={isOwnerPinModalOpen}
        onClose={() => setIsOwnerPinModalOpen(false)}
        onConfirm={handleOwnerPinConfirmed}
        requiredPin="5532"
        ownerOnly={true}
        customTitle="ยืนยันสิทธิ์เจ้าของแอปพลิเคชัน"
        customSubtitle="บันทึกภาพพื้นหลังและธีมเว็บไซต์ทั้งหมด"
        noticeText="เฉพาะเจ้าของแอป (ผอ.โต๊ด • E26ECG) เท่านั้นที่สามารถเปลี่ยนภาพพื้นหลังและโลโก้ได้"
      />

      {/* Telegram Bot Notification & Document Vault Settings Modal */}
      <TelegramSettingsModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />

    </div>
  );
}
