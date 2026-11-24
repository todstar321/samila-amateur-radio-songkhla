import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  CheckCircle2, 
  ShieldCheck, 
  Upload, 
  Copy, 
  Check, 
  FileText, 
  CreditCard, 
  Image as ImageIcon,
  Building,
  Calendar,
  AlertCircle,
  Receipt,
  Radio,
  User,
  MapPin,
  Phone,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2
} from 'lucide-react';
import AssociationLogo from './AssociationLogo';
import DeveloperCredit from './DeveloperCredit';
import BuddhistDatePicker from './BuddhistDatePicker';
import { consumeMemberId } from '../utils/sequenceNumberUtils';
import { sendNewApplicationToTelegram } from '../utils/telegramNotifyUtils';
import { uploadToCloudinary } from '../utils/cloudinaryUtils';
import { saveNewMemberToCentral } from '../utils/memberSyncUtils';

export default function RegisterModal({ 
  isOpen, 
  onClose, 
  onRegisterSuccess, 
  defaultSettings,
  onOpenReceipt,
  membersList = []
}) {
  // Step in wizard (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Step in modal after submit (isSuccess = receipt & welcome screen)
  const [isSuccess, setIsSuccess] = useState(false);
  const [newRegisteredUser, setNewRegisteredUser] = useState(null);

  // Form Fields
  // Step 1: Callsign Status
  const [callsignType, setCallsignType] = useState('new'); // 'new' (สมัครเพื่อขอรับสัญญาณเรียกขาน), 'has' (มีนามเรียกขานอยู่แล้ว)
  const [callsignSubStatus, setCallsignSubStatus] = useState(''); // 'current' (นามเรียกขานปัจจุบัน), 'expired' (นามเรียกขานขาดอายุแล้ว)
  const [callsign, setCallsign] = useState('');

  // Step 2: Personal Information
  const [prefix, setPrefix] = useState('นาย');
  const [customPrefix, setCustomPrefix] = useState('');
  const [fullNameTh, setFullNameTh] = useState('');
  const [fullNameEn, setFullNameEn] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [citizenIssueDate, setCitizenIssueDate] = useState('10/05/2569');
  const [citizenExpiryDate, setCitizenExpiryDate] = useState('09/05/2579');
  
  // Birthdate with Buddhist Era (พ.ศ.)
  const [birthDate, setBirthDate] = useState('01/01/2535');
  const [birthYearBe, setBirthYearBe] = useState('2535');
  const [birthMonth, setBirthMonth] = useState('1');
  const [birthDay, setBirthDay] = useState('1');
  const [gender, setGender] = useState('ชาย');
  const [maritalStatus, setMaritalStatus] = useState('โสด');
  
  // Step 3: Contact & Address
  const [currentAddress, setCurrentAddress] = useState('');
  const [postalCode, setPostalCode] = useState('90000');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [lineId, setLineId] = useState('');
  const [sameAsCurrent, setSameAsCurrent] = useState(true);
  const [registeredAddress, setRegisteredAddress] = useState('');

  // Step 4: Document Uploads (Simulated preview & local base64 data url for Telegram)
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [idCardDataUrl, setIdCardDataUrl] = useState(null);
  const [houseRegPreview, setHouseRegPreview] = useState(null);
  const [houseRegDataUrl, setHouseRegDataUrl] = useState(null);

  // Step 5: Membership Type & Payment
  const [membershipType, setMembershipType] = useState('3'); // 3 = สมาชิกสามัญ 5 ปี
  const [slipPreview, setSlipPreview] = useState(null);
  const [slipDataUrl, setSlipDataUrl] = useState(null);

  // Copy Bank Account
  const [copiedBank, setCopiedBank] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Calculate age from Buddhist Year
  const currentYearBe = new Date().getFullYear() + 543;
  const calculatedAge = Math.max(1, currentYearBe - parseInt(birthYearBe || currentYearBe));

  // Payment Calculation (ไม่มีค่าธรรมเนียมแรกเข้า 100 บาท ตามระเบียบสมาคม)
  const membershipPrices = {
    '1': { name: 'กิตติมศักดิ์', fee: 0, text: 'ไม่ต้องชำระค่าใด ๆ' },
    '2': { name: 'สามัญตลอดชีพ', fee: 2500, text: 'ชำระค่าบำรุงครั้งเดียว 2,500 บาท' },
    '3': { name: 'สามัญ 5 ปี', fee: 500, text: 'ชำระค่าบำรุงครั้งละ 500 บาท (อายุ 5 ปี)' },
    '4': { name: 'รูปแบบขององค์กรวิทยุสมัครเล่น', fee: 0, text: 'ไม่ต้องชำระค่าบำรุง' },
  };

  const selectedTier = membershipPrices[membershipType];
  const totalAmount = selectedTier.fee;

  // Step Definitions
  const stepTitles = [
    'สถานะสัญญาณเรียกขาน (Callsign)',
    'ข้อมูลผู้สมัคร (Personal Info)',
    'ที่อยู่และข้อมูลติดต่อ (Contact)',
    'แนบเอกสารหลักฐาน (Attachments)',
    'ประเภทสมาชิก & ชำระเงิน (Submit)'
  ];

  const stepShortTitles = [
    '1. สัญญาณเรียกขาน',
    '2. ข้อมูลส่วนตัว',
    '3. ที่อยู่/ติดต่อ',
    '4. แนบเอกสาร',
    '5. สรุป & ยืนยัน'
  ];

  const stepIcons = [
    <Radio key="1" className="w-3.5 h-3.5" />,
    <User key="2" className="w-3.5 h-3.5" />,
    <MapPin key="3" className="w-3.5 h-3.5" />,
    <Upload key="4" className="w-3.5 h-3.5" />,
    <CreditCard key="5" className="w-3.5 h-3.5" />
  ];

  // Copy bank number
  const handleCopyBankAccount = () => {
    navigator.clipboard.writeText('9013394310');
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  // Handle Photo Upload with immediate base64 data preview and background Cloudinary upload
  const handleFileChange = async (e, setter, dataUrlSetter) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Immediate Base64 Data URL for zero-CORS local rendering and instant Telegram sending
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target.result;
        setter(result);
        if (dataUrlSetter) dataUrlSetter(result);
      };
      reader.readAsDataURL(file);

      // 2. Background Cloudinary upload for central storage
      try {
        const cloudUrl = await uploadToCloudinary(file);
        if (cloudUrl) {
          setter(cloudUrl);
        }
      } catch (err) {
        console.warn('[RegisterModal] Cloudinary upload error:', err);
      }
    }
  };

  // Validate and Go to Next Step
  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (currentStep === 1) {
      if (callsignType === 'has') {
        if (!callsignSubStatus) {
          setErrorMessage('กรุณาเลือกสถานะนามเรียกขาน (นามเรียกขานปัจจุบัน หรือ นามเรียกขานขาดอายุแล้ว)');
          return;
        }
        if (!callsign.trim()) {
          setErrorMessage('กรุณาระบุสัญญาณเรียกขานของท่าน (Callsign)');
          return;
        }
      }
    } else if (currentStep === 2) {
      if (prefix === 'อื่นๆ' && !customPrefix.trim()) {
        setErrorMessage('กรุณาระบุคำนำหน้าชื่อ');
        return;
      }
      if (!fullNameTh.trim()) {
        setErrorMessage('กรุณาระบุชื่อ-นามสกุล (ภาษาไทย)');
        return;
      }
      if (!fullNameEn.trim()) {
        setErrorMessage('กรุณาระบุ First Name - Last Name (ภาษาอังกฤษ)');
        return;
      }
      const cleanCitizen = citizenId.replace(/\D/g, '');
      if (!cleanCitizen || cleanCitizen.length !== 13) {
        setErrorMessage('กรุณาระบุเลขประจำตัวประชาชน 13 หลักให้ถูกต้อง');
        return;
      }
      // ตรวจสอบเลขประจำตัวประชาชนซ้ำกับสมาชิกในระบบ
      if (Array.isArray(membersList) && membersList.length > 0) {
        const dupCitizen = membersList.find(m => {
          const mClean = String(m.citizenId || '').replace(/\D/g, '');
          return mClean && mClean === cleanCitizen;
        });
        if (dupCitizen) {
          setErrorMessage(`เลขประจำตัวประชาชน ${cleanCitizen} นี้มีอยู่ในระบบแล้ว (หากท่านเคยยื่นสมัครแล้ว หรือต้องการตรวจสอบข้อมูล โปรดติดต่อผู้ดูแลระบบ)`);
          return;
        }
      }
      if (!citizenIssueDate || !citizenIssueDate.trim()) {
        setErrorMessage('กรุณาระบุวันออกบัตรประชาชน');
        return;
      }
      if (!citizenExpiryDate || !citizenExpiryDate.trim()) {
        setErrorMessage('กรุณาระบุวันบัตรหมดอายุ');
        return;
      }
      if (!birthDate || !birthDate.trim()) {
        setErrorMessage('กรุณาระบุวัน/เดือน/ปีเกิด (พ.ศ.)');
        return;
      }
      if (!gender) {
        setErrorMessage('กรุณาระบุเพศ');
        return;
      }
      if (!maritalStatus) {
        setErrorMessage('กรุณาระบุสถานภาพสมรส');
        return;
      }
    } else if (currentStep === 3) {
      if (!currentAddress.trim()) {
        setErrorMessage('กรุณาระบุที่อยู่ปัจจุบันที่สามารถติดต่อได้');
        return;
      }
      const cleanPostal = postalCode.replace(/\D/g, '');
      if (!cleanPostal || cleanPostal.length !== 5) {
        setErrorMessage('กรุณาระบุรหัสไปรษณีย์ 5 หลักให้ถูกต้อง');
        return;
      }
      const cleanPhone = phone.replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 9) {
        setErrorMessage('กรุณาระบุหมายเลขโทรศัพท์ติดต่อให้ถูกต้อง');
        return;
      }
      // ตรวจสอบเบอร์โทรศัพท์ซ้ำกับสมาชิกในระบบ
      if (Array.isArray(membersList) && membersList.length > 0) {
        const dupPhone = membersList.find(m => {
          const mClean = String(m.phone || '').replace(/\D/g, '');
          return mClean && mClean.length >= 9 && mClean === cleanPhone;
        });
        if (dupPhone) {
          const ownerName = dupPhone.fullName || dupPhone.callsign || 'สมาชิกท่านเดิม';
          setErrorMessage(`เบอร์โทรศัพท์ ${phone.trim()} นี้ถูกลงทะเบียนไว้ในระบบแล้วโดย "${ownerName}" หากท่านเป็นผู้ใช้งานเบอร์นี้ในปัจจุบัน โปรดติดต่อแอดมินสมาคมฯ เพื่อให้แอดมินแก้ไขข้อมูลสมาชิกเดิม`);
          return;
        }
      }
      if (!sameAsCurrent && !registeredAddress.trim()) {
        setErrorMessage('กรุณาระบุที่อยู่ตามทะเบียนบ้าน');
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Go to Previous Step
  const handlePrevStep = () => {
    setErrorMessage('');
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Jump to specific step (only if previous steps are valid)
  const handleJumpToStep = (targetStep) => {
    if (targetStep < currentStep) {
      setErrorMessage('');
      setCurrentStep(targetStep);
    } else if (targetStep === currentStep + 1) {
      handleNextStep();
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (callsignType === 'has') {
        if (!callsignSubStatus) {
          setErrorMessage('กรุณาเลือกสถานะนามเรียกขาน');
          setCurrentStep(1);
          return;
        }
        if (!callsign.trim()) {
          setErrorMessage('กรุณาระบุสัญญาณเรียกขานของท่าน (Callsign)');
          setCurrentStep(1);
          return;
        }
      }
      if (prefix === 'อื่นๆ' && !customPrefix.trim()) {
        setErrorMessage('กรุณาระบุคำนำหน้าชื่อ');
        setCurrentStep(2);
        return;
      }
      if (!fullNameTh.trim()) {
        setErrorMessage('กรุณาระบุชื่อ-นามสกุล (ภาษาไทย)');
        setCurrentStep(2);
        return;
      }
      if (!fullNameEn.trim()) {
        setErrorMessage('กรุณาระบุ First Name - Last Name (ภาษาอังกฤษ)');
        setCurrentStep(2);
        return;
      }
      const cleanCitizen = citizenId.replace(/\D/g, '');
      if (!cleanCitizen || cleanCitizen.length !== 13) {
        setErrorMessage('กรุณาระบุเลขประจำตัวประชาชน 13 หลักให้ถูกต้อง');
        setCurrentStep(2);
        return;
      }
      if (Array.isArray(membersList) && membersList.length > 0) {
        const dupCitizen = membersList.find(m => String(m.citizenId || '').replace(/\D/g, '') === cleanCitizen);
        if (dupCitizen) {
          setErrorMessage(`เลขประจำตัวประชาชน ${cleanCitizen} นี้มีอยู่ในระบบแล้ว (หากท่านเคยยื่นสมัครแล้ว โปรดติดต่อผู้ดูแลระบบ)`);
          setCurrentStep(2);
          return;
        }
      }
      if (!citizenIssueDate.trim() || !citizenExpiryDate.trim() || !birthDate.trim()) {
        setErrorMessage('กรุณาระบุข้อมูลวันที่ให้ครบถ้วน');
        setCurrentStep(2);
        return;
      }
      if (!currentAddress.trim()) {
        setErrorMessage('กรุณาระบุที่อยู่ปัจจุบันที่สามารถติดต่อได้');
        setCurrentStep(3);
        return;
      }
      const cleanPostal = postalCode.replace(/\D/g, '');
      if (!cleanPostal || cleanPostal.length !== 5) {
        setErrorMessage('กรุณาระบุรหัสไปรษณีย์ 5 หลักให้ถูกต้อง');
        setCurrentStep(3);
        return;
      }
      const cleanPhone = phone.replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 9) {
        setErrorMessage('กรุณาระบุหมายเลขโทรศัพท์ติดต่อให้ถูกต้อง');
        setCurrentStep(3);
        return;
      }
      if (Array.isArray(membersList) && membersList.length > 0) {
        const dupPhone = membersList.find(m => String(m.phone || '').replace(/\D/g, '') === cleanPhone);
        if (dupPhone) {
          const ownerName = dupPhone.fullName || dupPhone.callsign || 'สมาชิกท่านเดิม';
          setErrorMessage(`เบอร์โทรศัพท์ ${phone.trim()} นี้ถูกลงทะเบียนไว้ในระบบแล้วโดย "${ownerName}" หากท่านเป็นผู้ใช้งานเบอร์นี้ในปัจจุบัน โปรดติดต่อแอดมินสมาคมฯ เพื่อให้แอดมินแก้ไขข้อมูลสมาชิกเดิม`);
          setCurrentStep(3);
          return;
        }
      }
      if (!sameAsCurrent && !registeredAddress.trim()) {
        setErrorMessage('กรุณาระบุที่อยู่ตามทะเบียนบ้าน');
        setCurrentStep(3);
        return;
      }

      if (totalAmount > 0 && !slipPreview) {
        setErrorMessage('กรุณาแนบภาพสลิปหลักฐานการโอนเงิน (จำเป็นต้องอัปโหลดเพื่อยืนยันการสมัคร)');
        setCurrentStep(5);
        return;
      }

      const cleanLast4 = cleanCitizen.slice(-4);
      const chosenCallsign = callsignType === 'has' && callsign.trim() ? callsign.trim().toUpperCase() : '-';
      const effectivePrefix = prefix === 'อื่นๆ' ? customPrefix.trim() : prefix;
      const finalFullName = `${effectivePrefix} ${fullNameTh.trim()}`.trim();
      const finalRegisteredAddr = sameAsCurrent ? currentAddress.trim() : (registeredAddress.trim() || currentAddress.trim());

      // Calculate dates
      const startYearBe = currentYearBe;
      const endYearBe = membershipType === '2' ? 'ตลอดชีพ' : `${startYearBe + 5}`;
      const startStr = `${birthDay.padStart(2, '0')}-${birthMonth.padStart(2, '0')}-${startYearBe}`;
      const endStr = membershipType === '2' ? 'ตลอดชีพ' : `${birthDay.padStart(2, '0')}-${birthMonth.padStart(2, '0')}-${endYearBe}`;

      // Ensure attached files are Cloudinary URLs
      let finalAvatar = photoPreview;
      if (photoPreview && photoPreview.startsWith('blob:')) {
        finalAvatar = (await uploadToCloudinary(photoPreview)) || photoPreview;
      }
      let finalIdCard = idCardPreview;
      if (idCardPreview && idCardPreview.startsWith('blob:')) {
        finalIdCard = (await uploadToCloudinary(idCardPreview)) || idCardPreview;
      }
      let finalHouseReg = houseRegPreview;
      if (houseRegPreview && houseRegPreview.startsWith('blob:')) {
        finalHouseReg = (await uploadToCloudinary(houseRegPreview)) || houseRegPreview;
      }
      let finalSlip = slipPreview;
      if (slipPreview && slipPreview.startsWith('blob:')) {
        finalSlip = (await uploadToCloudinary(slipPreview)) || slipPreview;
      }

      const newMemberRecord = {
        id: `mem-${Date.now()}`,
        callsign: chosenCallsign,
        callsignType: callsignType,
        callsignSubStatus: callsignType === 'has' ? callsignSubStatus : null,
        formerCallsign: callsignType === 'has' ? (callsignSubStatus === 'expired' ? callsign.trim().toUpperCase() : '-') : '-',
        username: chosenCallsign !== '-' ? chosenCallsign.toLowerCase() : phone.replace(/\D/g, ''),
        fullName: finalFullName,
        prefix: effectivePrefix,
        nameEnglish: fullNameEn.trim(),
        citizenId: cleanCitizen,
        last4Id: cleanLast4,
        citizenIssueDate: citizenIssueDate.trim() || '10/05/2569',
        citizenExpiryDate: citizenExpiryDate.trim() || '09/05/2579',
        birthDate: birthDate.trim() || `${birthDay.padStart(2, '0')}/${birthMonth.padStart(2, '0')}/${birthYearBe}`,
        age: calculatedAge,
        gender: gender,
        maritalStatus: maritalStatus,
        postalCode: cleanPostal,
        phone: phone.trim(),
        email: email.trim(),
        lineId: lineId.trim(),
        memberId: consumeMemberId(),
        memberType: selectedTier.name === 'สามัญ 5 ปี' ? 'สมาชิกสามัญ 5 ปี' : selectedTier.name,
        membershipTierKey: membershipType,
        startDate: startStr,
        endDate: endStr,
        registeredAddress: finalRegisteredAddr,
        currentAddress: currentAddress.trim(),
        deNetworkCode: null,
        radioStandby: '145.6750 MHz',
        memberStatus: 'ปกติ (Active)',
        role: 'member',
        isSuperAdmin: false,
        status: 'รอตรวจสอบ',
        avatar: finalAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        avatarDataUrl: photoDataUrl || (photoPreview && photoPreview.startsWith('data:') ? photoPreview : null),
        idCardSlip: finalIdCard,
        idCardDataUrl: idCardDataUrl || (idCardPreview && idCardPreview.startsWith('data:') ? idCardPreview : null),
        houseSlip: finalHouseReg,
        houseDataUrl: houseRegDataUrl || (houseRegPreview && houseRegPreview.startsWith('data:') ? houseRegPreview : null),
        transferSlip: finalSlip,
        slipDataUrl: slipDataUrl || (slipPreview && slipPreview.startsWith('data:') ? slipPreview : null),
        registeredDate: `${new Date().getDate()} พ.ย. ${currentYearBe}`,
        expiryAlert: 'ปกติ'
      };

      setNewRegisteredUser(newMemberRecord);
      setIsSuccess(true);

      // Save to central cloud storage immediately for real-time cross-device sync
      saveNewMemberToCentral(newMemberRecord).catch((err) => {
        console.warn('[MemberSync] Cloud save error:', err);
      });

      // Automatically notify Telegram group with attached photos
      sendNewApplicationToTelegram(newMemberRecord).catch((err) => {
        console.warn('[Telegram Application] Notification error:', err);
      });
    } catch (err) {
      console.error('[RegisterModal] Submit error:', err);
      setErrorMessage('เกิดข้อผิดพลาดในการส่งใบสมัคร โปรดลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    if (newRegisteredUser) {
      onRegisterSuccess(newRegisteredUser);
    }
    setIsSuccess(false);
    setCurrentStep(1);
    onClose();
  };

  // Remaining steps counter
  const remainingSteps = totalSteps - currentStep;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#07192f] via-[#09223e] to-[#07192f] text-white p-4 sm:p-5 relative border-b border-sky-900/50 shrink-0">
          <button
            onClick={() => {
              setCurrentStep(1);
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <AssociationLogo customUrl={defaultSettings?.customLogoUrl} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-sky-400/40 shrink-0 shadow-md" />
            <div className="min-w-0 pr-8">
              <h3 className="font-bold text-sm sm:text-base text-white leading-tight truncate">
                ใบสมัครสมาชิกสมาคมวิทยุสมัครเล่นสมิหลา จังหวัดสงขลา
              </h3>
              <p className="text-[11px] text-sky-300 font-mono mt-0.5 truncate">
                SAMILA AMATEUR RADIO SOCIETY OF SONGKHLA • HS9AS
              </p>
            </div>
          </div>
        </div>

        {/* ================= STEP PROGRESS & REMAINING COUNTER BAR ================= */}
        {!isSuccess && (
          <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0">
            {/* Step Counter Status Line */}
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-700 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  {currentStep}
                </span>
                <span className="font-bold text-slate-900">
                  ขั้นตอนที่ {currentStep} จาก {totalSteps}: <span className="text-sky-700">{stepTitles[currentStep - 1]}</span>
                </span>
              </div>

              {/* Motivational Remaining Counter Badge */}
              <div className="flex items-center gap-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono shadow-2xs border ${
                  remainingSteps === 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 animate-pulse'
                    : 'bg-white text-sky-800 border-sky-200'
                }`}>
                  {remainingSteps === 0 ? '🎉 ขั้นตอนสุดท้ายแล้ว' : `เหลืออีก ${remainingSteps} หน้า`}
                </span>
              </div>
            </div>

            {/* Smooth Animated Oceanic Progress Bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-cyan-600 via-sky-500 to-emerald-500 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>

            {/* Step Badges Row (Desktop & Mobile Friendly) */}
            <div className="grid grid-cols-5 gap-1 sm:gap-2 mt-2.5">
              {stepShortTitles.map((title, idx) => {
                const stepNum = idx + 1;
                const isPassed = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;

                return (
                  <button
                    key={stepNum}
                    type="button"
                    onClick={() => handleJumpToStep(stepNum)}
                    disabled={stepNum > currentStep}
                    className={`py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition flex items-center justify-center gap-1 text-center truncate ${
                      isCurrent
                        ? 'bg-sky-700 text-white font-bold shadow-xs cursor-default'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 cursor-pointer font-semibold'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                    title={title}
                  >
                    {isPassed ? (
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="shrink-0">{stepIcons[idx]}</span>
                    )}
                    <span className="hidden md:inline truncate">{title}</span>
                    <span className="md:hidden font-mono font-bold">{stepNum}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 text-slate-800">
          
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}

              {/* ================= STEP 1: สถานะสัญญาณเรียกขาน ================= */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-sky-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          1
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-sky-950">
                            หัวข้อที่ 1: สถานะสัญญาณเรียกขาน (Callsign Status)
                          </h4>
                          <p className="text-[11px] text-sky-700">
                            ระบุสถานะสัญญาณเรียกขานของท่านจาก กสทช. หรือเพื่อขอรับใหม่
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded font-mono font-semibold">
                        กสทช. / สมิหลา
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition shadow-2xs ${
                        callsignType === 'new' 
                          ? 'bg-sky-100/90 border-sky-500 font-bold text-sky-950 ring-2 ring-sky-300' 
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}>
                        <input
                          type="radio"
                          name="callsignType"
                          checked={callsignType === 'new'}
                          onChange={() => {
                            setCallsignType('new');
                            setCallsignSubStatus('');
                          }}
                          className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                        />
                        <div>
                          <span className="block text-xs font-bold">สมัครเพื่อขอรับสัญญาณเรียกขาน</span>
                          <span className="block text-[11px] text-slate-500 font-normal mt-0.5">(สอบผ่านแล้ว / นามเรียกขานครั้งแรก)</span>
                        </div>
                      </label>

                      <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition shadow-2xs ${
                        callsignType === 'has' 
                          ? 'bg-sky-100/90 border-sky-500 font-bold text-sky-950 ring-2 ring-sky-300' 
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}>
                        <input
                          type="radio"
                          name="callsignType"
                          checked={callsignType === 'has'}
                          onChange={() => setCallsignType('has')}
                          className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                        />
                        <div>
                          <span className="block text-xs font-bold">มีนามเรียกขานอยู่แล้ว</span>
                          <span className="block text-[11px] text-slate-500 font-normal mt-0.5">(กรณี นามเรียกขานปกติ และขาดอายุ)</span>
                        </div>
                      </label>
                    </div>

                    {callsignType === 'has' && (
                      <div className="pt-2 space-y-3 animate-in fade-in">
                        {/* Sub-question: เพิ่มคำถามสถานะนามเรียกขาน */}
                        <div className="p-3.5 bg-white rounded-xl border border-sky-200 shadow-2xs space-y-2">
                          <label className="block text-xs font-bold text-slate-900">
                            สถานะนามเรียกขานของท่าน <span className="text-rose-500">*</span>
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <label className={`p-3 rounded-lg border flex items-center gap-2.5 cursor-pointer transition ${
                              callsignSubStatus === 'current'
                                ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold ring-2 ring-sky-300 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}>
                              <input
                                type="radio"
                                name="callsignSubStatus"
                                value="current"
                                checked={callsignSubStatus === 'current'}
                                onChange={() => setCallsignSubStatus('current')}
                                className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                              />
                              <div>
                                <span className="block text-xs font-bold">นามเรียกขานปัจจุบัน</span>
                                <span className="block text-[10px] text-slate-500 font-normal">กรณีใช้งานปกติ ยังไม่ขาดอายุ</span>
                              </div>
                            </label>

                            <label className={`p-3 rounded-lg border flex items-center gap-2.5 cursor-pointer transition ${
                              callsignSubStatus === 'expired'
                                ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-300 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}>
                              <input
                                type="radio"
                                name="callsignSubStatus"
                                value="expired"
                                checked={callsignSubStatus === 'expired'}
                                onChange={() => setCallsignSubStatus('expired')}
                                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                              />
                              <div>
                                <span className="block text-xs font-bold">นามเรียกขานขาดอายุแล้ว</span>
                                <span className="block text-[10px] text-slate-500 font-normal">กรณีใบอนุญาตขาดอายุ / ขอคืนสัญญาณเดิม</span>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Callsign Input */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1">
                            สัญญาณเรียกขานของท่าน (Callsign) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="เช่น HS9XXX หรือ E26XXX"
                            value={callsign}
                            onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                            className="w-full px-3.5 py-2.5 bg-white border border-sky-300 rounded-xl text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-sky-500 outline-none shadow-xs"
                            autoFocus
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= STEP 2: ข้อมูลผู้สมัคร ================= */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          2
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            หัวข้อที่ 2: ข้อมูลผู้สมัคร (Personal Information)
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            กรอกข้อมูลชื่อ-นามสกุล เลขบัตรประชาชน และวันเกิด
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-rose-500 font-medium">* จำเป็นต้องกรอก</span>
                    </div>

                    {/* Name Row */}
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12 sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          คำนำหน้าชื่อ
                        </label>
                        <select
                          value={prefix}
                          onChange={(e) => setPrefix(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white outline-none"
                        >
                          <option value="นาย">นาย</option>
                          <option value="นาง">นาง</option>
                          <option value="นางสาว">นางสาว</option>
                          <option value="ว่าที่ ร.ต.">ว่าที่ ร.ต.</option>
                          <option value="ร.ต.">ร.ต.</option>
                          <option value="พ.ต.">พ.ต.</option>
                          <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                      </div>

                      {prefix === 'อื่นๆ' && (
                        <div className="col-span-12 sm:col-span-3">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            ระบุคำนำหน้า <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={customPrefix}
                            onChange={(e) => setCustomPrefix(e.target.value)}
                            placeholder="ระบุคำนำหน้า"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white outline-none"
                            required
                          />
                        </div>
                      )}

                      <div className={`col-span-12 ${prefix === 'อื่นๆ' ? 'sm:col-span-6' : 'sm:col-span-9'}`}>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          ชื่อ-นามสกุล (ภาษาไทย) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น ทีป์ชลิต ทองจันทร์"
                          value={fullNameTh}
                          onChange={(e) => setFullNameTh(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm focus:bg-white outline-none font-semibold"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* English Name Row */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        First Name - Last Name (ภาษาอังกฤษ) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น Theepchalit Thongjun"
                        value={fullNameEn}
                        onChange={(e) => setFullNameEn(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm focus:bg-white outline-none font-mono"
                        required
                      />
                    </div>

                    {/* Citizen ID & Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          เลขประจำตัวประชาชน (13 หลัก) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={17}
                          placeholder="x-xxxx-xxxxx-xx-x"
                          value={citizenId}
                          onChange={(e) => setCitizenId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono tracking-wider focus:bg-white outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                          <span>วันออกบัตรประชาชน <span className="text-rose-500">*</span></span>
                          <span className="text-[10px] text-sky-700 font-normal">ปฏิทิน พ.ศ.</span>
                        </label>
                        <BuddhistDatePicker
                          value={citizenIssueDate}
                          onChange={(val) => setCitizenIssueDate(val)}
                          placeholder="วว/ดด/ปปปป (พ.ศ.)"
                          minYearBe={2520}
                          maxYearBe={2575}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                          <span>วันบัตรหมดอายุ <span className="text-rose-500">*</span></span>
                          <span className="text-[10px] text-sky-700 font-normal">ปฏิทิน พ.ศ.</span>
                        </label>
                        <BuddhistDatePicker
                          value={citizenExpiryDate}
                          onChange={(val) => setCitizenExpiryDate(val)}
                          placeholder="วว/ดด/ปปปป (พ.ศ.)"
                          minYearBe={2550}
                          maxYearBe={2585}
                        />
                      </div>
                    </div>

                    {/* Birth Date (พ.ศ.) + Gender + Marital Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                          <span>วัน/เดือน/ปีเกิด (พ.ศ.) <span className="text-rose-500">*</span></span>
                          <span className="text-[10px] text-sky-700 font-normal">ปฏิทิน พ.ศ.</span>
                        </label>
                        <BuddhistDatePicker
                          value={birthDate}
                          onChange={(val, meta) => {
                            setBirthDate(val);
                            if (meta) {
                              setBirthDay(String(meta.day));
                              setBirthMonth(String(meta.month));
                              setBirthYearBe(String(meta.yearBe));
                            }
                          }}
                          placeholder="วว/ดด/ปปปป (พ.ศ.)"
                          minYearBe={2470}
                          maxYearBe={currentYearBe - 7}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          อายุ
                        </label>
                        <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-sky-950 text-center font-mono">
                          {calculatedAge} ปี
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          เพศ <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white"
                          required
                        >
                          <option value="ชาย">ชาย</option>
                          <option value="หญิง">หญิง</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          สถานภาพสมรส <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={maritalStatus}
                          onChange={(e) => setMaritalStatus(e.target.value)}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white"
                          required
                        >
                          <option value="โสด">โสด</option>
                          <option value="สมรส">สมรส</option>
                          <option value="หย่าร้าง">หย่าร้าง</option>
                          <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 3: ที่อยู่และข้อมูลติดต่อ ================= */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          3
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            หัวข้อที่ 3: ที่อยู่และข้อมูลการติดต่อ (Contact & Address)
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            ระบุที่อยู่ปัจจุบันและเบอร์โทรศัพท์สำหรับจัดส่งเอกสารและติดต่อ
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-rose-500 font-medium">* จำเป็นต้องกรอก</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        ที่อยู่ปัจจุบันที่สามารถติดต่อได้ <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="บ้านเลขที่, ถนน, ซอย, ตำบล, อำเภอ, จังหวัด"
                        value={currentAddress}
                        onChange={(e) => setCurrentAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm focus:bg-white outline-none"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          รหัสไปรษณีย์ <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          เบอร์โทรศัพท์มือถือ <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="093-xxx-xxxx"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold text-sky-950"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          E-MAIL <span className="text-[10px] text-slate-400 font-normal">(ถ้ามี - ไม่บังคับ)</span>
                        </label>
                        <input
                          type="email"
                          placeholder="example@mail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          LINE ID <span className="text-[10px] text-slate-400 font-normal">(ถ้ามี - ไม่บังคับ)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="ไอดีไลน์"
                          value={lineId}
                          onChange={(e) => setLineId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Registered Address Checkbox */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                        <input
                          type="checkbox"
                          checked={sameAsCurrent}
                          onChange={(e) => setSameAsCurrent(e.target.checked)}
                          className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                        />
                        <span>ที่อยู่ตามทะเบียนบ้าน เหมือนกับที่อยู่ปัจจุบันที่สามารถติดต่อได้</span>
                      </label>

                      {!sameAsCurrent && (
                        <div className="pt-1">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            ระบุที่อยู่ตามทะเบียนบ้าน <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            rows={2}
                            placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด และรหัสไปรษณีย์"
                            value={registeredAddress}
                            onChange={(e) => setRegisteredAddress(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 4: แนบเอกสารหลักฐาน ================= */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          4
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            หัวข้อที่ 4: แนบเอกสารหลักฐาน (Document Attachments)
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            แนบรูปถ่ายหน้าตรง และสำเนาเอกสารรับรองถูกต้อง (อย่างละ 1 ฉบับ)
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        แนบได้ทันทีหรือภายหลัง
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Photo 1 Inch */}
                      <div className="p-3.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center flex flex-col items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">รูปถ่ายหน้าตรง 1 นิ้ว</p>
                          <p className="text-[10px] text-slate-500 mb-2">(ใช้ติดบัตรและหนังสือรับรอง)</p>
                        </div>

                        {photoPreview ? (
                          <div className="relative mb-2">
                            <img src={photoPreview} alt="Member Photo" className="w-16 h-20 object-cover rounded-md border border-slate-300 shadow-sm" />
                            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                            </span>
                          </div>
                        ) : (
                          <div className="w-16 h-20 bg-slate-200 rounded-md border border-slate-300 flex items-center justify-center text-slate-400 mb-2">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}

                        <label className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-medium text-slate-700 cursor-pointer shadow-2xs">
                          <span>{photoPreview ? 'เปลี่ยนรูป' : 'เลือกรูปถ่าย'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setPhotoPreview, setPhotoDataUrl)} />
                        </label>
                      </div>

                      {/* ID Card Copy */}
                      <div className="p-3.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center flex flex-col items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">สำเนาบัตรประชาชน</p>
                          <p className="text-[10px] text-slate-500 mb-2">(พร้อมเซ็นรับรองสำเนาถูกต้อง)</p>
                        </div>

                        {idCardPreview ? (
                          <div className="relative mb-2">
                            <img src={idCardPreview} alt="ID Card" className="w-24 h-16 object-cover rounded-md border border-slate-300 shadow-sm" />
                            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                            </span>
                          </div>
                        ) : (
                          <div className="w-24 h-16 bg-slate-200 rounded-md border border-slate-300 flex items-center justify-center text-slate-400 mb-2">
                            <CreditCard className="w-6 h-6" />
                          </div>
                        )}

                        <label className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-medium text-slate-700 cursor-pointer shadow-2xs">
                          <span>{idCardPreview ? 'เปลี่ยนไฟล์' : 'แนบสำเนาบัตร'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setIdCardPreview, setIdCardDataUrl)} />
                        </label>
                      </div>

                      {/* House Registration */}
                      <div className="p-3.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center flex flex-col items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">สำเนาทะเบียนบ้าน</p>
                          <p className="text-[10px] text-slate-500 mb-2">(พร้อมเซ็นรับรองสำเนาถูกต้อง)</p>
                        </div>

                        {houseRegPreview ? (
                          <div className="relative mb-2">
                            <img src={houseRegPreview} alt="House Reg" className="w-24 h-16 object-cover rounded-md border border-slate-300 shadow-sm" />
                            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                            </span>
                          </div>
                        ) : (
                          <div className="w-24 h-16 bg-slate-200 rounded-md border border-slate-300 flex items-center justify-center text-slate-400 mb-2">
                            <Building className="w-6 h-6" />
                          </div>
                        )}

                        <label className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-medium text-slate-700 cursor-pointer shadow-2xs">
                          <span>{houseRegPreview ? 'เปลี่ยนไฟล์' : 'แนบทะเบียนบ้าน'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setHouseRegPreview, setHouseRegDataUrl)} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 5: ประเภทสมาชิก & การชำระเงิน + ยืนยัน ================= */}
              {currentStep === 5 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          5
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            หัวข้อที่ 5: ประเภทสมาชิก & ช่องทางชำระเงิน (Membership & Payment)
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            เลือกประเภทสมาชิก โอนชำระเงิน และตรวจสอบข้อมูลก่อนส่งใบสมัคร
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Membership Type Radio */}
                    <div className="space-y-2 text-xs">
                      {Object.entries(membershipPrices).map(([key, item]) => (
                        <label
                          key={key}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                            membershipType === key
                              ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold shadow-2xs ring-1 ring-sky-300'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="membershipType"
                              value={key}
                              checked={membershipType === key}
                              onChange={() => setMembershipType(key)}
                              className="text-sky-600 focus:ring-sky-500"
                            />
                            <span>{item.name}</span>
                          </div>
                          <span className="text-[11px] text-slate-600 font-normal">{item.text}</span>
                        </label>
                      ))}
                    </div>

                    {/* Bank Transfer Box */}
                    {totalAmount > 0 && (
                      <div className="space-y-3">
                        <div className="p-4 bg-gradient-to-br from-[#06182c] to-[#0a2544] text-white rounded-2xl shadow-md space-y-3">
                          <div className="flex items-center justify-between border-b border-sky-900 pb-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center font-bold text-sky-300 text-xs">
                                KTB
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">บัญชีสมาคมวิทยุสมัครเล่นสมิหลา</p>
                                <p className="text-[10px] text-sky-300">ธนาคารกรุงไทย (Krungthai Bank)</p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-slate-400">ยอดชำระรวม:</span>
                              <p className="text-base font-mono font-bold text-amber-400">
                                {totalAmount.toLocaleString()} บาท
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                            <div className="sm:col-span-8 space-y-0.5">
                              <p className="text-[11px] text-slate-300">
                                ชื่อบัญชี: <strong className="text-white">สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา</strong>
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-300">เลขที่บัญชี:</span>
                                <span className="text-base font-mono font-bold tracking-widest text-sky-200">
                                  9013394310
                                </span>
                              </div>
                            </div>

                            <div className="sm:col-span-4 flex justify-end">
                              <button
                                type="button"
                                onClick={handleCopyBankAccount}
                                className="w-full sm:w-auto px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                              >
                                {copiedBank ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                                <span>{copiedBank ? 'คัดลอกเลขบัญชีแล้ว!' : 'คัดลอกเลขบัญชี'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Separate Prominent Upload Transfer Slip Box (แยกออกมาใต้กรอบบัญชีและบังคับอัปโหลด) */}
                        <div className={`p-4 rounded-2xl border-2 transition shadow-xs ${
                          slipPreview 
                            ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-200' 
                            : 'bg-amber-50/80 border-amber-400 border-dashed ring-2 ring-amber-200/60'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-xs ${
                                slipPreview ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                              }`}>
                                <Upload className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>แนบสลิปหลักฐานการโอนเงิน</span>
                                  <span className="text-rose-600 font-extrabold">* (จำเป็นต้องอัปโหลด)</span>
                                </h5>
                                <p className="text-[10.5px] text-slate-600">
                                  กรุณาโอนเงินเข้าบัญชีสมาคมฯ ด้านบน แล้วถ่ายภาพหรือแนบสลิปเพื่อยืนยันการสมัคร
                                </p>
                              </div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              slipPreview 
                                ? 'bg-emerald-200 text-emerald-900' 
                                : 'bg-rose-100 text-rose-700 animate-pulse'
                            }`}>
                              {slipPreview ? 'แนบสลิปแล้ว' : 'ยังไม่ได้แนบสลิป'}
                            </span>
                          </div>

                          {slipPreview ? (
                            <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-300 flex items-center justify-between gap-3 shadow-2xs">
                              <div className="flex items-center gap-3 min-w-0">
                                <img 
                                  src={slipPreview} 
                                  alt="Transfer Slip Preview" 
                                  className="w-14 h-16 sm:w-16 sm:h-20 object-cover rounded-lg border border-slate-300 shadow-xs shrink-0" 
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>อัปโหลดภาพสลิปเรียบร้อยแล้ว</span>
                                  </p>
                                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                    พร้อมจัดส่งภาพเข้าสู่ระบบ Telegram สมาคมฯ
                                  </p>
                                </div>
                              </div>
                              <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition shadow-2xs shrink-0">
                                <span>เปลี่ยนภาพสลิป</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setSlipPreview, setSlipDataUrl)} />
                              </label>
                            </div>
                          ) : (
                            <label className="mt-2 w-full flex flex-col items-center justify-center p-4 sm:p-5 border-2 border-dashed border-amber-400 bg-white hover:bg-amber-100/50 rounded-xl cursor-pointer transition group shadow-2xs">
                              <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                                <Upload className="w-5 h-5 text-amber-700" />
                              </div>
                              <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition">
                                คลิกที่นี่เพื่อเลือกไฟล์ภาพสลิปการโอนเงิน (บังคับแนบรูป) *
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                รองรับไฟล์รูปภาพ JPG, PNG, ถ่ายรูปจากมือถือ หรือภาพถ่ายใบเสร็จ
                              </p>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setSlipPreview, setSlipDataUrl)} />
                            </label>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Summary Quick Card before Final Submit */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>สรุปข้อมูลใบสมัครของท่าน:</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                        <div>ชื่อ: <strong className="text-slate-900">{prefix} {fullNameTh || '-'}</strong></div>
                        <div>Name (EN): <strong className="text-slate-900 font-mono">{fullNameEn || '-'}</strong></div>
                        <div>Callsign: <strong className="text-sky-800 font-mono">{callsignType === 'has' && callsign ? `${callsign} (${callsignSubStatus === 'expired' ? 'ขาดอายุ' : 'ปัจจุบัน'})` : 'ขอรับใหม่'}</strong></div>
                        <div>เลขบัตร: <strong className="font-mono text-slate-800">{citizenId || '-'}</strong></div>
                        <div>เบอร์โทร: <strong className="font-mono text-slate-800">{phone || '-'}</strong></div>
                        <div>ประเภท: <strong className="text-slate-900">{selectedTier.name}</strong></div>
                        <div>ยอดชำระ: <strong className="text-emerald-700 font-bold">{totalAmount.toLocaleString()} บ.</strong></div>
                      </div>
                    </div>

                    {/* Declaration */}
                    <div className="pt-1">
                      <p className="text-[11px] text-slate-500 leading-relaxed text-justify">
                        ข้าพเจ้าขอรับรองว่าข้อความข้างต้นกับเอกสารที่แนบมาเป็นความจริงทุกประการ ยินยอมให้ข้อมูลและสมาคมเก็บรักษาเอกสารไว้เพื่อประกอบการรับสมัครสมาชิก จะปฏิบัติตามกฎข้อบังคับและระเบียบของสมาคมฯ ทุกประการ
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* ================= STEPPER NAVIGATION BUTTONS ================= */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200">
                
                {/* Back / Cancel Button */}
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 border border-slate-300 shadow-2xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>ย้อนกลับ</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      onClose();
                    }}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                )}

                {/* Remaining Counter Helper (Center) */}
                <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono">
                  หน้า {currentStep} / {totalSteps} {remainingSteps > 0 ? `(เหลืออีก ${remainingSteps} หน้า)` : '(ขั้นตอนสุดท้าย)'}
                </span>

                {/* Next / Submit Button */}
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2"
                  >
                    <span>ถัดไป →</span>
                    <span className="text-[10px] bg-sky-900/60 text-sky-200 px-1.5 py-0.5 rounded-full font-mono">
                      เหลือ {remainingSteps} หน้า
                    </span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2 ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังส่งเอกสารและบันทึกข้อมูล...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>ส่งเอกสารและยืนยันการสมัคร ✓</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
          ) : (
            /* ================= SUCCESS CONFIRMATION SCREEN ================= */
            <div className="py-6 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  ยื่นใบสมัครสมาชิกสมาคมสำเร็จแล้ว!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา ได้รับข้อมูลและเอกสารหลักฐานของท่านเรียบร้อยแล้ว
                </p>
              </div>

              {newRegisteredUser && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left max-w-md mx-auto space-y-2 text-xs shadow-2xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">รหัสสมาชิกที่ออกให้:</span>
                    <span className="font-mono font-bold text-sky-800 text-sm">{newRegisteredUser.memberId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ชื่อ-สกุล:</span>
                    <span className="font-bold text-slate-900">{newRegisteredUser.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">สัญญาณเรียกขาน:</span>
                    <span className="font-mono font-bold text-amber-700">
                      {newRegisteredUser.callsign !== '-' ? newRegisteredUser.callsign : 'รอขอรับจาก กสทช.'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ประเภทสมาชิก:</span>
                    <span className="text-slate-800">{newRegisteredUser.memberType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ระยะเวลาสมาชิกภาพ:</span>
                    <span className="font-mono text-slate-700">{newRegisteredUser.startDate} ถึง {newRegisteredUser.endDate}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500">สถานะคำขอ:</span>
                    <span className="text-amber-700 font-semibold">ส่งเอกสารเรียบร้อย (รอตรวจสอบรับรอง)</span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                ท่านสามารถเข้าสู่ระบบเพื่อดูสถานะ และขอรับ "หนังสือรับรองสถานะการเป็นสมาชิก" เพื่อนำไปยื่นขอนามเรียกขานกับ กสทช. ได้ทันที
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenReceipt && newRegisteredUser) {
                      onOpenReceipt(newRegisteredUser);
                    }
                    handleFinish();
                  }}
                  className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4 text-emerald-200" />
                  <span>ดาวน์โหลดใบเสร็จรับเงิน (e-Receipt)</span>
                </button>

                <button
                  onClick={handleFinish}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
                >
                  เข้าสู่ระบบด้วยบัญชีที่สมัครทันที
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Developer Credit Signature on bottom */}
        <div className="shrink-0">
          <DeveloperCredit variant="light" />
        </div>

      </div>
    </div>
  );
}
