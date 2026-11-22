import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Receipt, 
  Award, 
  PenTool, 
  Move, 
  Printer, 
  Save, 
  RotateCcw, 
  Sliders, 
  Eye, 
  EyeOff, 
  Upload, 
  Check, 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  DollarSign, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Maximize2,
  Copy,
  Sparkles,
  Download,
  Image as ImageIcon,
  Plus,
  Trash2,
  Layers,
  CheckSquare,
  Square,
  Settings,
  Smartphone,
  Monitor,
  CheckCircle2,
  ShieldCheck,
  Lock,
  AlertCircle,
  Users
} from 'lucide-react';
import AssociationLogo from './AssociationLogo';
import DeveloperCredit from './DeveloperCredit';
import SignatureVault from './SignatureVault';
import DocumentExportModal from './DocumentExportModal';
import AdminPinConfirmModal from './AdminPinConfirmModal';
import { captureElementToDataUrl } from '../utils/documentExportUtils';
import { thaiBahtText } from '../utils/thaiBahtText';
import { getSavedOfficers } from '../data/defaultSignatures';
import { DEFAULT_RECEIPT_TEMPLATE_BASE64, DEFAULT_APP_TEMPLATE_BASE64 } from '../assets/defaultTemplates';
import { parseAddressAndPostalCode } from '../utils/addressUtils';
import SequenceSettingsModal from './SequenceSettingsModal';
import { 
  getCurrentReceiptInfo, 
  getMemberSequenceConfig, 
  advanceReceiptSequence, 
  formatMemberId 
} from '../utils/sequenceNumberUtils';
import { 
  fetchCentralLayoutSettings, 
  saveCentralLayoutSettings, 
  STORAGE_KEYS 
} from '../utils/layoutSyncUtils';
import { uploadToCloudinary } from '../utils/cloudinaryUtils';
import defaultSavedLayout from '../data/savedLayoutSettings.json';

// Canonical A4 Paper Dimensions at 96 DPI (210mm x 297mm -> 794px x 1123px)
const CANVAS_BASE_WIDTH = 794;
const CANVAS_BASE_HEIGHT = 1123;

// ================= THE 4 OFFICIAL MEMBERSHIP TIERS FOR RECEIPT =================
export const RECEIPT_TIERS = {
  honorary: {
    id: 'honorary',
    label: '1. กิตติมศักดิ์',
    subLabel: 'ไม่ต้องชำระค่าบำรุง',
    feeAmount: 0,
    feeFormatted: '0',
    feeText: 'ไม่ต้องชำระค่าบำรุง',
    rowY: 56.6,
    checkX: 9.5,
    amountX: 83.0,
    showAmountInRow: false
  },
  lifetime: {
    id: 'lifetime',
    label: '2. สามัญตลอดชีพ',
    subLabel: 'ชำระค่าบำรุงครั้งเดียว 2,500 บาท',
    feeAmount: 2500,
    feeFormatted: '2,500',
    feeText: 'สองพันห้าร้อยบาทถ้วน',
    rowY: 60.6,
    checkX: 9.5,
    amountX: 83.0,
    showAmountInRow: true
  },
  fiveYear: {
    id: 'fiveYear',
    label: '3. สามัญ 5 ปี',
    subLabel: 'ชำระค่าบำรุงครั้งละ 500 บาท',
    feeAmount: 500,
    feeFormatted: '500',
    feeText: 'ห้าร้อยบาทถ้วน',
    rowY: 64.6,
    checkX: 9.5,
    amountX: 83.0,
    showAmountInRow: true
  },
  radioOrg: {
    id: 'radioOrg',
    label: '4. รูปแบบขององค์กรวิทยุสมัครเล่น',
    subLabel: 'ไม่ต้องชำระค่าบำรุง',
    feeAmount: 0,
    feeFormatted: '0',
    feeText: 'ไม่ต้องชำระค่าบำรุง',
    rowY: 68.6,
    checkX: 9.5,
    amountX: 83.0,
    showAmountInRow: false
  }
};

// ================= THE 4 OFFICIAL MEMBERSHIP TIERS FOR APPLICATION FORM =================
export const APP_FORM_TIERS = {
  honorary: {
    id: 'honorary',
    label: '1. กิตติมศักดิ์',
    subLabel: 'ไม่ต้องชำระค่าใด ๆ',
    rowY: 60.5,
    checkX: 9.0,
    boxesX: 67.0
  },
  lifetime: {
    id: 'lifetime',
    label: '2. สามัญตลอดชีพ',
    subLabel: 'ชำระค่าบำรุงครั้งเดียว 2,500 บาท',
    rowY: 63.5,
    checkX: 9.0,
    boxesX: 67.0
  },
  fiveYear: {
    id: 'fiveYear',
    label: '3. สามัญ 5 ปี',
    subLabel: 'ชำระค่าบำรุงครั้งละ 500 บาท (อายุ 5 ปี)',
    rowY: 66.8,
    checkX: 9.0,
    boxesX: 67.0
  },
  radioOrg: {
    id: 'radioOrg',
    label: '4. รูปแบบขององค์กรวิทยุสมัครเล่น',
    subLabel: 'ไม่ต้องชำระค่าบำรุง',
    rowY: 69.8,
    checkX: 9.0,
    boxesX: 67.0
  }
};

// ================= DEFAULT TIER POSITIONS (PER MEMBERSHIP CATEGORY) =================
export const DEFAULT_RECEIPT_TIER_POSITIONS = defaultSavedLayout.receiptTierPositions || {
  honorary: {
    check: { x: 11.03, y: 56.6 },
    amount: { x: 83.0, y: 56.6 }
  },
  lifetime: {
    check: { x: 11.03, y: 59.78 },
    amount: { x: 83.0, y: 59.78 }
  },
  fiveYear: {
    check: { x: 11.03, y: 64.6 },
    amount: { x: 83.0, y: 64.6 }
  },
  radioOrg: {
    check: { x: 11.03, y: 68.6 },
    amount: { x: 83.0, y: 68.6 }
  }
};

export const DEFAULT_APP_TIER_POSITIONS = defaultSavedLayout.appTierPositions || {
  honorary: {
    check: { x: 9.0, y: 60.5 },
    boxes: { x: 66.86, y: 60.5 }
  },
  lifetime: {
    check: { x: 9.0, y: 63.5 },
    boxes: { x: 66.86, y: 63.5 }
  },
  fiveYear: {
    check: { x: 9.0, y: 66.8 },
    boxes: { x: 66.86, y: 66.8 }
  },
  radioOrg: {
    check: { x: 9.0, y: 69.8 },
    boxes: { x: 66.86, y: 69.8 }
  }
};

// ================= DEFAULT POSITIONS FOR RECEIPT =================
const DEFAULT_RECEIPT_POSITIONS = defaultSavedLayout.receipt || {
  bookNo: { id: 'bookNo', label: 'เล่มที่', x: 15.0, y: 4.8, fontSize: 16, color: '#dc2626', bold: true },
  receiptNo: { id: 'receiptNo', label: 'เลขที่ใบเสร็จ', x: 82.5, y: 6.2, fontSize: 18, color: '#dc2626', bold: true },
  
  // Grouped Date (Day / Month / Year on exact same baseline)
  receiptDateGroup: { 
    id: 'receiptDateGroup', 
    type: 'dateGroup', 
    label: 'วันที่ออกใบเสร็จ (วัน/เดือน/พ.ศ. แถวเดียวกัน)', 
    x: 49.46, 
    y: 26.27, 
    monthOffsetPx: 116, 
    yearOffsetPx: 235, 
    fontSize: 15, 
    color: '#0284c7', 
    bold: true,
    yearFormat: '4digit'
  },
  
  // Legacy separate date fields (hidden by default to avoid duplicates)
  dateDay: { id: 'dateDay', label: 'วันที่ (ตัวเลข แยก)', x: 52.8, y: 24.2, fontSize: 15, color: '#0f172a', bold: true, hidden: true },
  dateMonth: { id: 'dateMonth', label: 'เดือน (พ.ย. แยก)', x: 67.5, y: 24.2, fontSize: 15, color: '#0f172a', bold: true, hidden: true },
  dateYear: { id: 'dateYear', label: 'พ.ศ. (2569 แยก)', x: 84.8, y: 24.2, fontSize: 15, color: '#0f172a', bold: true, hidden: true },
  
  payerName: { id: 'payerName', label: 'ได้รับเงินจาก (ชื่อ-สกุล)', x: 21.0, y: 31.0, fontSize: 15, color: '#0284c7', bold: true },
  memberId: { id: 'memberId', label: 'หมายเลขสมาชิก', x: 79.5, y: 31.0, fontSize: 15, color: '#0284c7', bold: true },
  address: { id: 'address', label: 'ที่อยู่ผู้ชำระ', x: 10.0, y: 35.2, fontSize: 13.5, color: '#0284c7', bold: false },
  phone: { id: 'phone', label: 'โทรศัพท์', x: 70.5, y: 35.2, fontSize: 13.5, color: '#0284c7', bold: true },
  memberFeeCheck: { id: 'memberFeeCheck', label: 'ติ๊ก ค่าบำรุงสมาชิก', x: 6.8, y: 52.0, fontSize: 16, color: '#0284c7', bold: true },
  memberFeeTypeCheck: { id: 'memberFeeTypeCheck', label: 'ติ๊ก ประเภทสมาชิก (1-4) (✓)', x: 11.03, y: 59.78, fontSize: 16, color: '#0284c7', bold: true },
  memberFeeAmount: { id: 'memberFeeAmount', label: 'ยอดเงินค่าบำรุงตามแถว (บาท)', x: 83.0, y: 59.78, fontSize: 15, color: '#0284c7', bold: true },
  slashMark: { id: 'slashMark', label: 'ขีดเฉียงในช่องยอดเงิน', x: 84.0, y: 54.0, fontSize: 24, color: '#0284c7', bold: false },
  totalAmountNumber: { id: 'totalAmountNumber', label: 'รวมเป็นเงินทั้งสิ้น (ตัวเลข)', x: 79.5, y: 79.2, fontSize: 20, color: '#0284c7', bold: true },
  totalAmountText: { id: 'totalAmountText', label: 'รวมเป็นเงินทั้งสิ้น (ตัวอักษรไทย)', x: 26.0, y: 81.0, fontSize: 15, color: '#0284c7', bold: true },
  signature: { id: 'signature', label: 'ลายเซ็นผู้รับเงิน', x: 63.5, y: 88.0, fontSize: 16, color: '#1d4ed8', bold: true },
  signerPosition: { id: 'signerPosition', label: 'ตำแหน่งผู้รับเงิน (เช่น เลขาธิการ)', x: 60.0, y: 92.5, fontSize: 14, color: '#0284c7', bold: true },
};

// ================= DEFAULT POSITIONS FOR APPLICATION FORM (ใบสมัครสมาชิก) =================
const DEFAULT_APP_POSITIONS = defaultSavedLayout.application || {
  photoBox: { id: 'photoBox', label: 'กรอบรูปถ่าย (Photo Box)', x: 76.5, y: 4.5, width: 80, height: 105, isImage: true, color: '#0f172a', bold: true },
  
  // 1. Grouped Name & Surname (Strictly same baseline Y, internal horizontal offset for surname)
  nameGroup: { 
    id: 'nameGroup', 
    type: 'nameGroup', 
    label: 'ชื่อ - นามสกุล (กลุ่มข้อความแนวเดียวกัน)', 
    x: 21.63, 
    y: 19.82, 
    lastNameOffsetPx: 379, 
    fontSize: 14, 
    color: '#0000ff', 
    bold: true 
  },
  
  // Legacy Split & Composite Name Fields (Hidden by default, preserved in Unused Pool)
  firstName: { id: 'firstName', label: 'ชื่อ (First Name แยก)', x: 13.0, y: 21.0, fontSize: 14, color: '#0f172a', bold: true, hidden: true },
  lastName: { id: 'lastName', label: 'นามสกุล (Last Name แยก)', x: 53.0, y: 21.0, fontSize: 14, color: '#0f172a', bold: true, hidden: true },
  fullName: { id: 'fullName', label: 'ชื่อ-นามสกุล (แบบรวม)', x: 28.5, y: 19.5, fontSize: 14, color: '#0f172a', bold: true, hidden: true },
  
  callsignOld: { id: 'callsignOld', label: 'สัญญาณเรียกขานเดิม', x: 24.0, y: 24.2, fontSize: 13, color: '#0f172a', bold: false },
  callsignNew: { id: 'callsignNew', label: 'สัญญาณเรียกขานใหม่', x: 64.0, y: 24.2, fontSize: 14, color: '#0369a1', bold: true },
  
  // 2. Grouped 13-digit Citizen ID Boxes (pitch + groupGap 1-4-5-2-1 pattern + individual digit nudges)
  citizenIdBoxes: { 
    id: 'citizenIdBoxes', 
    type: 'citizenIdBoxes', 
    label: 'หมายเลขบัตรประชาชน (13 หลัก แยกช่องตาราง)', 
    x: 27.6, 
    y: 27.2, 
    pitch: 19.5, 
    groupGap: 7.5, 
    digitOffsets: {}, 
    fontSize: 13.5, 
    color: '#0f172a', 
    bold: true 
  },
  citizenId: { id: 'citizenId', label: 'หมายเลขบัตรประชาชน (13 หลัก รวม)', x: 27.6, y: 27.2, fontSize: 13.5, color: '#0f172a', bold: true, letterSpacing: 11.5, hidden: true },
  
  // 3. Citizen Card Issue Date Group (Day / Month / Year on exact same baseline)
  citizenIssueDateGroup: { 
    id: 'citizenIssueDateGroup', 
    type: 'dateGroup', 
    label: 'วันออกบัตร (วัน/เดือน/พ.ศ. แถวเดียวกัน)', 
    x: 66.8, 
    y: 27.2, 
    monthOffsetPx: 48, 
    yearOffsetPx: 102, 
    fontSize: 12, 
    color: '#0f172a', 
    bold: true,
    yearFormat: '2digit',
    customYear: '69',
    customDay: '10',
    customMonth: '05'
  },
  citizenIssueDay: { id: 'citizenIssueDay', label: 'วันออกบัตร (วัน แยก)', x: 66.8, y: 27.2, fontSize: 12, color: '#0f172a', bold: true, hidden: true },
  citizenIssueMonth: { id: 'citizenIssueMonth', label: 'วันออกบัตร (เดือน แยก)', x: 71.5, y: 27.2, fontSize: 12, color: '#0f172a', bold: true, hidden: true },
  citizenIssueYear: { id: 'citizenIssueYear', label: 'วันออกบัตร (พ.ศ. แยก)', x: 77.0, y: 27.2, fontSize: 12, color: '#0f172a', bold: true, hidden: true },
  idCardIssuedDate: { id: 'idCardIssuedDate', label: 'วันออกบัตร (แบบรวม)', x: 70.0, y: 27.2, fontSize: 12, color: '#0f172a', bold: false, hidden: true },
  
  // 4. Citizen Card Expiry Date Group (Day / Month / Year on exact same baseline)
  citizenExpiryDateGroup: { 
    id: 'citizenExpiryDateGroup', 
    type: 'dateGroup', 
    label: 'วันหมดอายุบัตร (วัน/เดือน/พ.ศ. แถวเดียวกัน)', 
    x: 86.8, 
    y: 27.2, 
    monthOffsetPx: 48, 
    yearOffsetPx: 100, 
    fontSize: 12, 
    color: '#0f172a', 
    bold: true,
    yearFormat: '2digit',
    customYear: '69',
    customDay: '09',
    customMonth: '05'
  },
  citizenExpiryDay: { id: 'citizenExpiryDay', label: 'วันหมดอายุ (วัน แยก)', x: 86.8, y: 27.2, fontSize: 12, color: '#0f172a', bold: true, hidden: true },
  citizenExpiryMonth: { id: 'citizenExpiryMonth', label: 'วันหมดอายุ (เดือน แยก)', x: 91.5, y: 27.2, fontSize: 12, color: '#0f172a', bold: true, hidden: true },
  citizenExpiryYear: { id: 'citizenExpiryYear', label: 'วันหมดอายุ (พ.ศ. แยก)', x: 96.5, y: 27.2, fontSize: 12, color: '#0f172a', bold: true, hidden: true },
  idCardExpiryDate: { id: 'idCardExpiryDate', label: 'วันหมดอายุบัตร (แบบรวม)', x: 88.0, y: 27.2, fontSize: 12, color: '#0f172a', bold: false, hidden: true },
  
  // 5. Birth Date Group (Day / Month / Year on exact same baseline)
  birthDateGroup: { 
    id: 'birthDateGroup', 
    type: 'dateGroup', 
    label: 'วัน/เดือน/ปีเกิด (วัน/เดือน/พ.ศ. แถวเดียวกัน)', 
    x: 19.5, 
    y: 30.2, 
    monthOffsetPx: 65, 
    yearOffsetPx: 140, 
    fontSize: 12.5, 
    color: '#0f172a', 
    bold: true 
  },
  birthDay: { id: 'birthDay', label: 'วันเกิด (วัน แยก)', x: 19.5, y: 30.2, fontSize: 12.5, color: '#0f172a', bold: true, hidden: true },
  birthMonth: { id: 'birthMonth', label: 'วันเกิด (เดือน แยก)', x: 26.0, y: 30.2, fontSize: 12.5, color: '#0f172a', bold: true, hidden: true },
  birthYear: { id: 'birthYear', label: 'วันเกิด (พ.ศ. แยก)', x: 33.5, y: 30.2, fontSize: 12.5, color: '#0f172a', bold: true, hidden: true },
  birthDate: { id: 'birthDate', label: 'วัน/เดือน/ปีเกิด (แบบรวม)', x: 24.0, y: 30.2, fontSize: 13, color: '#0f172a', bold: false, hidden: true },
  
  age: { id: 'age', label: 'อายุ (ปี)', x: 55.0, y: 30.2, fontSize: 13, color: '#0f172a', bold: true },
  genderMaleCheck: { id: 'genderMaleCheck', label: 'เพศชาย (✓)', x: 73.0, y: 30.2, fontSize: 14, color: '#0f172a', bold: true },
  maritalCheck: { id: 'maritalCheck', label: 'สถานภาพสมรส (✓)', x: 24.0, y: 33.2, fontSize: 14, color: '#0f172a', bold: true },
  
  // Address 2 Lines
  addressLine1: { id: 'addressLine1', label: 'ที่อยู่ปัจจุบัน บรรทัดที่ 1 (ไม่มีรหัสไปรษณีย์)', x: 28.0, y: 36.2, fontSize: 12.5, color: '#0f172a', bold: false },
  addressLine2: { id: 'addressLine2', label: 'ที่อยู่ปัจจุบัน บรรทัดที่ 2 (ถ้ามี)', x: 10.0, y: 39.2, fontSize: 12.5, color: '#0f172a', bold: false },
  currentAddress: { id: 'currentAddress', label: 'ที่อยู่ปัจจุบันที่ติดต่อได้ (แบบรวม)', x: 28.0, y: 36.2, fontSize: 12.5, color: '#0f172a', bold: false, hidden: true },
  
  // 6. Postal Code Boxes
  postalCodeBoxes: { 
    id: 'postalCodeBoxes', 
    type: 'simpleDigitBoxes', 
    label: 'รหัสไปรษณีย์ (5 หลัก แยกช่องตาราง)', 
    x: 53.0, 
    y: 39.2, 
    pitch: 17.5, 
    digitOffsets: {}, 
    fontSize: 13, 
    color: '#0f172a', 
    bold: true 
  },
  postalCode: { id: 'postalCode', label: 'รหัสไปรษณีย์ (5 หลัก รวม)', x: 53.0, y: 39.2, fontSize: 13, color: '#0f172a', bold: true, letterSpacing: 8, hidden: true },
  phone: { id: 'phone', label: 'เบอร์โทรศัพท์', x: 74.0, y: 39.2, fontSize: 13, color: '#0f172a', bold: true },
  email: { id: 'email', label: 'E-MAIL', x: 16.0, y: 42.2, fontSize: 12, color: '#0f172a', bold: false },
  lineId: { id: 'lineId', label: 'LINE ID', x: 58.0, y: 42.2, fontSize: 12, color: '#0f172a', bold: false },
  
  // Document attachments checks
  docIdCardCheck: { id: 'docIdCardCheck', label: 'แนบสำเนาบัตรประชาชน (✓)', x: 9.0, y: 47.8, fontSize: 14, color: '#0f172a', bold: true },
  docPhotoCheck: { id: 'docPhotoCheck', label: 'แนบรูปถ่าย 1 นิ้ว (✓)', x: 9.0, y: 51.0, fontSize: 14, color: '#0f172a', bold: true },
  
  // Membership Type Check & Member ID in Boxes
  tierStandard5YCheck: { id: 'tierStandard5YCheck', label: 'ติ๊ก ประเภทสมาชิก (1-4) (✓)', x: 9.0, y: 66.8, fontSize: 14, color: '#0f172a', bold: true },
  tierMemberIdBoxes: { 
    id: 'tierMemberIdBoxes', 
    type: 'simpleDigitBoxes', 
    label: 'รหัสสมาชิกในช่อง (แยกช่องตาราง)', 
    x: 66.86, 
    y: 69.8, 
    pitch: 17.0, 
    digitOffsets: {}, 
    fontSize: 13, 
    color: '#0f172a', 
    bold: true 
  },
  startDate: { id: 'startDate', label: 'วันเริ่มต้นการเป็นสมาชิก', x: 26.0, y: 73.5, fontSize: 12.5, color: '#0f172a', bold: false },
  endDate: { id: 'endDate', label: 'วันสิ้นสุดการเป็นสมาชิก', x: 67.0, y: 73.5, fontSize: 12.5, color: '#0f172a', bold: false },
  
  // Applicant Signature & 8. Apply Date Group
  applicantSignature: { id: 'applicantSignature', label: 'ลงชื่อผู้สมัคร', x: 23.0, y: 84.0, fontSize: 14, color: '#1d4ed8', bold: true },
  applyDateGroup: { 
    id: 'applyDateGroup', 
    type: 'dateGroup', 
    label: 'สมัครวันที่ (วัน/เดือน/พ.ศ. แถวเดียวกัน)', 
    x: 67.0, 
    y: 84.0, 
    monthOffsetPx: 68, 
    yearOffsetPx: 138, 
    fontSize: 12.5, 
    color: '#0f172a', 
    bold: true 
  },
  applyDay: { id: 'applyDay', label: 'สมัครวันที่ (วัน แยก)', x: 67.0, y: 84.0, fontSize: 12.5, color: '#0f172a', bold: true, hidden: true },
  applyMonth: { id: 'applyMonth', label: 'สมัครวันที่ (เดือน แยก)', x: 74.0, y: 84.0, fontSize: 12.5, color: '#0f172a', bold: true, hidden: true },
  applyYear: { id: 'applyYear', label: 'สมัครวันที่ (พ.ศ. แยก)', x: 81.0, y: 84.0, fontSize: 12.5, color: '#0f172a', bold: true, hidden: true },
  
  // Registrar & Officer Note Box & 9. Registrar Approved Date Group
  registrarSignature: { id: 'registrarSignature', label: 'ลายเซ็นผู้มีอำนาจลงนาม (นายทะเบียน)', x: 15.0, y: 88.5, fontSize: 14, color: '#0369a1', bold: true },
  registrarApprovedDateGroup: { 
    id: 'registrarApprovedDateGroup', 
    type: 'dateGroup', 
    label: 'วันที่อนุมัติ (วัน/เดือน/พ.ศ. แถวเดียวกัน)', 
    x: 18.0, 
    y: 93.5, 
    monthOffsetPx: 55, 
    yearOffsetPx: 115, 
    fontSize: 12, 
    color: '#0f172a', 
    bold: true 
  },
  registrarApprovedDay: { id: 'registrarApprovedDay', label: 'วันที่อนุมัติ (วัน แยก)', x: 18.0, y: 93.5, fontSize: 12, color: '#0f172a', bold: true, hidden: true },
  registrarApprovedMonth: { id: 'registrarApprovedMonth', label: 'วันที่อนุมัติ (เดือน แยก)', x: 23.5, y: 93.5, fontSize: 12, color: '#0f172a', bold: true, hidden: true },
  registrarApprovedYear: { id: 'registrarApprovedYear', label: 'วันที่อนุมัติ (พ.ศ. แยก)', x: 29.5, y: 93.5, fontSize: 12, color: '#0f172a', bold: true, hidden: true },
  
  officerReceivedAmount: { id: 'officerReceivedAmount', label: 'รับเงินค่าสมาชิก (บาท)', x: 81.0, y: 87.0, fontSize: 12.5, color: '#0f172a', bold: false },
  officerReceiptNo: { id: 'officerReceiptNo', label: 'ใบเสร็จรับเงินเลขที่', x: 83.42, y: 89.83, fontSize: 12, color: '#0f172a', bold: false },
  officerSignature: { id: 'officerSignature', label: 'ลงนามเจ้าหน้าที่การเงิน', x: 74.0, y: 94.5, fontSize: 13, color: '#1d4ed8', bold: true },
};

// Thai Date formatting helpers for Certificates and Official Documents
export const formatThaiBirthDate = (raw) => {
  if (!raw) return '10 พฤษภาคม 2528';
  const thaiMonthsShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const thaiMonthsFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  for (let i = 0; i < thaiMonthsShort.length; i++) {
    if (String(raw).includes(thaiMonthsShort[i])) {
      return String(raw).replace(thaiMonthsShort[i], thaiMonthsFull[i]);
    }
  }

  if (thaiMonthsFull.some(m => String(raw).includes(m))) {
    return String(raw);
  }

  const parts = String(raw).trim().split(/[\/\-\.]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const mIdx = parseInt(parts[1], 10) - 1;
    const year = parts[2];
    if (mIdx >= 0 && mIdx < 12 && !isNaN(day)) {
      return `${day} ${thaiMonthsFull[mIdx]} ${year}`;
    }
  }
  return String(raw);
};

export const formatThaiDateString = (raw) => {
  if (!raw) return '';
  if (raw === 'ตลอดชีพ' || String(raw).includes('ตลอดชีพ')) return 'ตลอดชีพ';
  
  const thaiMonthsShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const thaiMonthsFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  for (let i = 0; i < thaiMonthsShort.length; i++) {
    if (String(raw).includes(thaiMonthsShort[i])) {
      return String(raw).replace(thaiMonthsShort[i], thaiMonthsFull[i]);
    }
  }

  if (thaiMonthsFull.some(m => String(raw).includes(m))) {
    return String(raw);
  }

  const parts = String(raw).trim().split(/[\/\-\.]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const mIdx = parseInt(parts[1], 10) - 1;
    const year = parts[2];
    if (mIdx >= 0 && mIdx < 12 && !isNaN(day)) {
      return `${day} ${thaiMonthsFull[mIdx]} ${year}`;
    }
  }
  return String(raw);
};

// ================= DEFAULT POSITIONS FOR CERTIFICATE (หนังสือรับรอง) =================
const DEFAULT_CERT_POSITIONS = defaultSavedLayout.certificate || {
  headerTitle: { id: 'headerTitle', label: 'หัวข้อหนังสือรับรอง', x: 26.0, y: 10.0, fontSize: 20, color: '#0f172a', bold: true, hidden: true },
  writtenAt: { id: 'writtenAt', label: 'เขียนที่', x: 54.0, y: 22.8, fontSize: 13, color: '#0f172a', bold: false },
  
  // Grouped Date for Certificate
  certDateGroup: { 
    id: 'certDateGroup', 
    type: 'dateGroup', 
    label: 'วันที่ออกหนังสือ (วัน/เดือน/พ.ศ. แถวเดียวกัน)', 
    x: 54.5, 
    y: 26.6, 
    monthOffsetPx: 45, 
    yearOffsetPx: 130, 
    fontSize: 13, 
    color: '#0f172a', 
    bold: false 
  },
  certDate: { id: 'certDate', label: 'วันที่ออกหนังสือ (แบบรวม)', x: 54.5, y: 26.6, fontSize: 13, color: '#0f172a', bold: false, hidden: true },
  
  memberName: { id: 'memberName', label: 'ชื่อ-สกุล สมาชิก', x: 42.0, y: 35.8, fontSize: 13.5, color: '#0f172a', bold: true },
  callsign: { id: 'callsign', label: 'สัญญาณเรียกขาน (ถ้ามี)', x: 45.0, y: 39.8, fontSize: 13.5, color: '#0369a1', bold: true },
  citizenId: { id: 'citizenId', label: 'เลขประจำตัวประชาชน', x: 45.0, y: 43.8, fontSize: 13, color: '#0f172a', bold: true },
  birthDate: { id: 'birthDate', label: 'วัน เดือน ปี เกิด', x: 45.0, y: 47.8, fontSize: 13, color: '#0f172a', bold: false },
  registeredAddress: { id: 'registeredAddress', label: 'ที่อยู่ตามทะเบียนบ้าน', x: 42.0, y: 51.8, fontSize: 12.5, color: '#0f172a', bold: false },
  phone: { id: 'phone', label: 'หมายเลขโทรศัพท์ที่ติดต่อได้', x: 43.0, y: 62.5, fontSize: 13, color: '#0f172a', bold: false },
  memberId: { id: 'memberId', label: 'รหัสสมาชิก', x: 40.0, y: 66.0, fontSize: 13.5, color: '#0f172a', bold: true },
  memberType: { id: 'memberType', label: 'ประเภทสมาชิก', x: 54.5, y: 66.0, fontSize: 13, color: '#0f172a', bold: true },
  startDate: { id: 'startDate', label: 'วันเริ่มต้นการเป็นสมาชิก', x: 42.0, y: 70.0, fontSize: 13, color: '#0f172a', bold: false },
  endDate: { id: 'endDate', label: 'วันสิ้นสุดการเป็นสมาชิก', x: 42.0, y: 73.8, fontSize: 13, color: '#0f172a', bold: false },
  presidentSignature: { id: 'presidentSignature', label: 'ลายเซ็นนายกสมาคม', x: 50.7, y: 81.3, fontSize: 15, color: '#1e3a8a', bold: true },
  presidentName: { id: 'presidentName', label: 'ชื่อ-ตำแหน่ง นายกสมาคม', x: 46.0, y: 92.5, fontSize: 12.5, color: '#0f172a', bold: true },
};

export default function DocumentStudio({ 
  membersList = [], 
  currentUser,
  onClose 
}) {
  // Master Studio Tabs: 'receipt' | 'application' | 'certificate' | 'signatures'
  const [activeDocType, setActiveDocType] = useState('application'); // Default to application form as requested!
  const [toastMessage, setToastMessage] = useState('');

  // Officers & Signatures from Vault
  const [officers, setOfficers] = useState(() => getSavedOfficers());

  const getDefaultBg = (type) => {
    if (type === 'application') return DEFAULT_APP_TEMPLATE_BASE64;
    if (type === 'receipt') return DEFAULT_RECEIPT_TEMPLATE_BASE64;
    return '';
  };

  // Template Background Images per Document (Uses Cloudinary CDN URLs for 100% Cross-Device Sync)
  const [templateBackgrounds, setTemplateBackgrounds] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_doc_template_backgrounds_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          application: (parsed.application && parsed.application !== '/application-form-template.jpg') ? parsed.application : (defaultSavedLayout.templateBackgrounds?.application || DEFAULT_APP_TEMPLATE_BASE64),
          receipt: (parsed.receipt && parsed.receipt !== '/receipt-template-sample.jpg') ? parsed.receipt : (defaultSavedLayout.templateBackgrounds?.receipt || DEFAULT_RECEIPT_TEMPLATE_BASE64),
          certificate: parsed.certificate || defaultSavedLayout.templateBackgrounds?.certificate || ''
        };
      }
    } catch (e) {}
    return {
      application: defaultSavedLayout.templateBackgrounds?.application || DEFAULT_APP_TEMPLATE_BASE64,
      receipt: defaultSavedLayout.templateBackgrounds?.receipt || DEFAULT_RECEIPT_TEMPLATE_BASE64,
      certificate: defaultSavedLayout.templateBackgrounds?.certificate || ''
    };
  });

  // Active Member for Live Testing
  const [selectedMemberId, setSelectedMemberId] = useState(currentUser?.id || membersList[0]?.id || '');
  const activeMember = membersList.find(m => m.id === selectedMemberId) || currentUser || membersList[0] || {
    id: 'm1',
    fullName: 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)',
    callsign: 'E26ECG',
    memberId: '369113',
    memberType: 'สมาชิกสามัญ 5 ปี',
    currentAddress: '16/74 ม.7 ต.โคกเคียน อ.เมืองนราธิวาส จ.นราธิวาส',
    registeredAddress: '16/74 ม.7 ต.โคกเคียน อ.เมืองนราธิวาส จ.นราธิวาส',
    phone: '093-792-5665',
    birthDate: '16/09/2530',
    startDate: '16-11-2569',
    endDate: '15-11-2574'
  };

  // Split name for activeMember
  const nameParts = (activeMember.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์').trim().split(/\s+/);
  const activeFirstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || 'นายเกียรติศักดิ์';
  const activeLastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'สมิหลาเวหา';

  // Parse Address & Synchronize Postal Code:
  // 1. Remove 5-digit postal code from address line (ฉะนั้นรหัสไปรษณีย์ข้างบนไม่ต้องใส่)
  // 2. Populate postal code directly into the 5 boxes below (มาใส่ในกรอบรหัสไปรษณีย์ได้เลยง่ายกว่า)
  const parsedMemberAddr = parseAddressAndPostalCode(
    activeMember.currentAddress || activeMember.registeredAddress || 'เลขที่ 45 ถ.นิพัทธ์อุทิศ 1 ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110',
    activeMember.postalCode
  );
  const activeAddressLine1 = parsedMemberAddr.addressLine1;
  const activeAddressLine2 = parsedMemberAddr.addressLine2;
  const activeCleanAddress = parsedMemberAddr.cleanAddress;
  const activePostalCode = parsedMemberAddr.postalCode;

  // Auto-Sequence & Rollover State
  const [isSequenceModalOpen, setIsSequenceModalOpen] = useState(false);
  const [receiptSeqInfo, setReceiptSeqInfo] = useState(() => getCurrentReceiptInfo());
  const [memberSeqConfig, setMemberSeqConfig] = useState(() => getMemberSequenceConfig());
  const [customMemberIdOverride, setCustomMemberIdOverride] = useState('');

  useEffect(() => {
    const handleSeqUpdate = () => {
      setReceiptSeqInfo(getCurrentReceiptInfo());
      setMemberSeqConfig(getMemberSequenceConfig());
    };
    window.addEventListener('samila_sequence_changed', handleSeqUpdate);
    return () => window.removeEventListener('samila_sequence_changed', handleSeqUpdate);
  }, []);

  // Effective Member ID, Book No, and Receipt No for live documents
  // Crucial: Member ID strictly matches between Application Form, Receipt, and Certificate
  const effectiveMemberId = customMemberIdOverride || activeMember.memberId || formatMemberId(memberSeqConfig.currentNumber, memberSeqConfig.paddingDigits, memberSeqConfig.prefix);
  const effectiveBookNo = receiptSeqInfo.bookNo;
  const effectiveReceiptNo = receiptSeqInfo.receiptNo;

  // 1. Dynamic Receipt Tier Resolution (4 Tiers)
  const [manualReceiptTier, setManualReceiptTier] = useState(null); // 'honorary' | 'lifetime' | 'fiveYear' | 'radioOrg' | null
  
  // Persistent Tier Coordinates State (remembers fine-tuned positions for all 4 categories)
  const [receiptTierPositions, setReceiptTierPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_receipt_tier_positions_v1');
      if (saved) return { ...DEFAULT_RECEIPT_TIER_POSITIONS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_RECEIPT_TIER_POSITIONS;
  });

  const [appTierPositions, setAppTierPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_app_tier_positions_v1');
      if (saved) return { ...DEFAULT_APP_TIER_POSITIONS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_APP_TIER_POSITIONS;
  });

  const getActiveReceiptTierKey = () => {
    if (manualReceiptTier && RECEIPT_TIERS[manualReceiptTier]) {
      return manualReceiptTier;
    }
    const mType = (activeMember.memberType || '').toLowerCase();
    if (mType.includes('ตลอดชีพ')) return 'lifetime';
    if (mType.includes('กิตติมศักดิ์')) return 'honorary';
    if (mType.includes('องค์กร')) return 'radioOrg';
    return 'fiveYear';
  };

  const activeReceiptTierKey = getActiveReceiptTierKey();
  const activeReceiptTier = RECEIPT_TIERS[activeReceiptTierKey];
  const isLifetimeMember = activeReceiptTierKey === 'lifetime';
  const isHonoraryMember = activeReceiptTierKey === 'honorary';
  const activeFeeAmountFormatted = activeReceiptTier ? activeReceiptTier.feeFormatted : '500';
  const activeFeeText = activeReceiptTier ? activeReceiptTier.feeText : 'ห้าร้อยบาทถ้วน';

  // 2. Dynamic Application Form Tier Resolution (4 Tiers)
  const [manualAppTier, setManualAppTier] = useState(null); // 'honorary' | 'lifetime' | 'fiveYear' | 'radioOrg' | null

  const getActiveAppTierKey = () => {
    if (manualAppTier && APP_FORM_TIERS[manualAppTier]) {
      return manualAppTier;
    }
    const mType = (activeMember.memberType || '').toLowerCase();
    if (mType.includes('ตลอดชีพ')) return 'lifetime';
    if (mType.includes('กิตติมศักดิ์')) return 'honorary';
    if (mType.includes('องค์กร')) return 'radioOrg';
    return 'fiveYear';
  };

  const activeAppTierKey = getActiveAppTierKey();
  const activeAppTier = APP_FORM_TIERS[activeAppTierKey];

  // Sync field movement directly into that tier's saved coordinates & localStorage
  const syncTierPosition = (docType, fieldKey, newX, newY) => {
    if (docType === 'receipt') {
      const tierKey = getActiveReceiptTierKey();
      if (fieldKey === 'memberFeeTypeCheck') {
        setReceiptTierPositions(prev => {
          const updated = {
            ...prev,
            [tierKey]: {
              ...(prev[tierKey] || DEFAULT_RECEIPT_TIER_POSITIONS[tierKey]),
              check: { x: newX, y: newY }
            }
          };
          try {
            localStorage.setItem('samila_receipt_tier_positions_v1', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      } else if (fieldKey === 'memberFeeAmount') {
        setReceiptTierPositions(prev => {
          const updated = {
            ...prev,
            [tierKey]: {
              ...(prev[tierKey] || DEFAULT_RECEIPT_TIER_POSITIONS[tierKey]),
              amount: { x: newX, y: newY }
            }
          };
          try {
            localStorage.setItem('samila_receipt_tier_positions_v1', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
    } else if (docType === 'application') {
      const tierKey = getActiveAppTierKey();
      if (fieldKey === 'tierStandard5YCheck') {
        setAppTierPositions(prev => {
          const updated = {
            ...prev,
            [tierKey]: {
              ...(prev[tierKey] || DEFAULT_APP_TIER_POSITIONS[tierKey]),
              check: { x: newX, y: newY }
            }
          };
          try {
            localStorage.setItem('samila_app_tier_positions_v1', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      } else if (fieldKey === 'tierMemberIdBoxes') {
        setAppTierPositions(prev => {
          const updated = {
            ...prev,
            [tierKey]: {
              ...(prev[tierKey] || DEFAULT_APP_TIER_POSITIONS[tierKey]),
              boxes: { x: newX, y: newY }
            }
          };
          try {
            localStorage.setItem('samila_app_tier_positions_v1', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
    }
  };

  const handleSetReceiptTier = (tierKey) => {
    setManualReceiptTier(tierKey);
    const tier = RECEIPT_TIERS[tierKey];
    if (!tier) return;

    const savedPos = receiptTierPositions[tierKey] || DEFAULT_RECEIPT_TIER_POSITIONS[tierKey] || {
      check: { x: tier.checkX || 9.5, y: tier.rowY },
      amount: { x: tier.amountX || 83.0, y: tier.rowY }
    };

    setReceiptPositions(prev => ({
      ...prev,
      memberFeeTypeCheck: {
        ...(prev.memberFeeTypeCheck || DEFAULT_RECEIPT_POSITIONS.memberFeeTypeCheck),
        x: savedPos.check.x,
        y: savedPos.check.y
      },
      memberFeeAmount: {
        ...(prev.memberFeeAmount || DEFAULT_RECEIPT_POSITIONS.memberFeeAmount),
        x: savedPos.amount.x,
        y: savedPos.amount.y
      }
    }));
    showToast(`สลับไปที่ "${tier.label}" (ใช้พิกัดคงที่ตามที่ปรับแต่งไว้)`);
  };

  const handleSetAppTier = (tierKey) => {
    setManualAppTier(tierKey);
    const tier = APP_FORM_TIERS[tierKey];
    if (!tier) return;

    const savedPos = appTierPositions[tierKey] || DEFAULT_APP_TIER_POSITIONS[tierKey] || {
      check: { x: tier.checkX || 9.0, y: tier.rowY },
      boxes: { x: tier.boxesX || 67.0, y: tier.rowY }
    };

    setAppPositions(prev => ({
      ...prev,
      tierStandard5YCheck: {
        ...(prev.tierStandard5YCheck || DEFAULT_APP_POSITIONS.tierStandard5YCheck),
        x: savedPos.check.x,
        y: savedPos.check.y
      },
      tierMemberIdBoxes: {
        ...(prev.tierMemberIdBoxes || DEFAULT_APP_POSITIONS.tierMemberIdBoxes),
        x: savedPos.boxes.x,
        y: savedPos.boxes.y
      }
    }));
    showToast(`สลับไปที่ "${tier.label}" (ใช้พิกัดคงที่ตามที่ปรับแต่งไว้)`);
  };

  // Sync positions whenever selectedMemberId changes
  useEffect(() => {
    const recKey = getActiveReceiptTierKey();
    const savedRec = receiptTierPositions[recKey] || DEFAULT_RECEIPT_TIER_POSITIONS[recKey];
    if (savedRec) {
      setReceiptPositions(prev => ({
        ...prev,
        memberFeeTypeCheck: {
          ...(prev.memberFeeTypeCheck || DEFAULT_RECEIPT_POSITIONS.memberFeeTypeCheck),
          x: savedRec.check.x,
          y: savedRec.check.y
        },
        memberFeeAmount: {
          ...(prev.memberFeeAmount || DEFAULT_RECEIPT_POSITIONS.memberFeeAmount),
          x: savedRec.amount.x,
          y: savedRec.amount.y
        }
      }));
    }

    const appKey = getActiveAppTierKey();
    const savedApp = appTierPositions[appKey] || DEFAULT_APP_TIER_POSITIONS[appKey];
    if (savedApp) {
      setAppPositions(prev => ({
        ...prev,
        tierStandard5YCheck: {
          ...(prev.tierStandard5YCheck || DEFAULT_APP_POSITIONS.tierStandard5YCheck),
          x: savedApp.check.x,
          y: savedApp.check.y
        },
        tierMemberIdBoxes: {
          ...(prev.tierMemberIdBoxes || DEFAULT_APP_POSITIONS.tierMemberIdBoxes),
          x: savedApp.boxes.x,
          y: savedApp.boxes.y
        }
      }));
    }
  }, [selectedMemberId]);

  // Export & Share to LINE modal states
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportedImageUri, setExportedImageUri] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const getExportDocInfo = () => {
    let title = 'ใบสมัครสมาชิก (Application Form)';
    let date = '16 พ.ย. 2569';

    if (activeDocType === 'receipt') {
      title = 'ใบเสร็จรับเงิน (Official Receipt)';
      date = '16 พ.ย. 2569';
    } else if (activeDocType === 'certificate') {
      title = 'หนังสือรับรองสมาคม (Certificate)';
      date = activeMember.startDate ? formatThaiDateString(activeMember.startDate) : '16 พฤศจิกายน 2569';
    } else if (activeDocType === 'application') {
      title = 'ใบสมัครสมาชิก (Application Form)';
      date = activeMember.registeredDate || '16 พ.ย. 2569';
    }

    return {
      title,
      date,
      memberName: activeMember.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)',
      memberCallsign: activeMember.callsign && activeMember.callsign !== '-' ? activeMember.callsign : 'E26ECG'
    };
  };

  const handleExportDocument = async () => {
    if (!canvasRef.current) return;
    
    // Deselect any selected field so selection outlines and remove buttons (✕) are not in the picture
    setSelectedFieldKey(null);
    setIsExporting(true);
    setExportModalOpen(true);
    setExportedImageUri(null);

    // Give React 200ms to render the clean canvas without outlines
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const dataUri = await captureElementToDataUrl(canvasRef.current, { scale: 2 });
      setExportedImageUri(dataUri);

      // If exporting receipt, advance receipt auto-sequence for the next receipt
      if (activeDocType === 'receipt') {
        const adv = advanceReceiptSequence();
        setReceiptSeqInfo(getCurrentReceiptInfo());
        if (adv.didRollover) {
          showToast(`ออกใบเสร็จเล่ม ${adv.issuedBook} เลขที่ ${adv.issuedNo} สำเร็จ! ตัดขึ้นเล่มใหม่: เล่มที่ ${adv.nextBook} เลขที่ ${adv.nextNo} อัตโนมัติ (ครบ ${adv.sheetsPerBook} ใบต่อเล่ม)`);
        } else {
          showToast(`ออกใบเสร็จเล่ม ${adv.issuedBook} เลขที่ ${adv.issuedNo} เรียบร้อยแล้ว (รันถัดไป: เลขที่ ${adv.nextNo})`);
        }
      }
    } catch (err) {
      console.error('Failed to export document image:', err);
      showToast('เกิดข้อผิดพลาดในการสร้างภาพเอกสาร กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExporting(false);
    }
  };

  // Positions State for Each Document
  const [receiptPositions, setReceiptPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_receipt_layout_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_RECEIPT_POSITIONS, ...parsed };
        if (!merged.receiptDateGroup) merged.receiptDateGroup = DEFAULT_RECEIPT_POSITIONS.receiptDateGroup;
        merged.dateDay = { ...merged.dateDay, hidden: true };
        merged.dateMonth = { ...merged.dateMonth, hidden: true };
        merged.dateYear = { ...merged.dateYear, hidden: true };
        return merged;
      }
    } catch (e) {}
    return DEFAULT_RECEIPT_POSITIONS;
  });

  const [appPositions, setAppPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_application_layout_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_APP_POSITIONS, ...parsed };
        // Ensure new grouped structures exist
        if (!merged.nameGroup) merged.nameGroup = DEFAULT_APP_POSITIONS.nameGroup;
        if (!merged.citizenIdBoxes) merged.citizenIdBoxes = DEFAULT_APP_POSITIONS.citizenIdBoxes;
        if (!merged.citizenIssueDateGroup) merged.citizenIssueDateGroup = DEFAULT_APP_POSITIONS.citizenIssueDateGroup;
        if (!merged.citizenExpiryDateGroup) merged.citizenExpiryDateGroup = DEFAULT_APP_POSITIONS.citizenExpiryDateGroup;
        
        // Auto-migrate to 2-digit format and '69' for citizen issue & expiry dates as requested
        if (merged.citizenIssueDateGroup) {
          if (!merged.citizenIssueDateGroup.yearFormat || merged.citizenIssueDateGroup.customYear === undefined) {
            merged.citizenIssueDateGroup.yearFormat = '2digit';
            merged.citizenIssueDateGroup.customYear = '69';
          }
        }
        if (merged.citizenExpiryDateGroup) {
          if (!merged.citizenExpiryDateGroup.yearFormat || merged.citizenExpiryDateGroup.customYear === undefined) {
            merged.citizenExpiryDateGroup.yearFormat = '2digit';
            merged.citizenExpiryDateGroup.customYear = '69';
          }
        }
        if (!merged.birthDateGroup) merged.birthDateGroup = DEFAULT_APP_POSITIONS.birthDateGroup;
        if (!merged.postalCodeBoxes) merged.postalCodeBoxes = DEFAULT_APP_POSITIONS.postalCodeBoxes;
        if (!merged.tierMemberIdBoxes) merged.tierMemberIdBoxes = DEFAULT_APP_POSITIONS.tierMemberIdBoxes;
        if (!merged.applyDateGroup) merged.applyDateGroup = DEFAULT_APP_POSITIONS.applyDateGroup;
        if (!merged.registrarApprovedDateGroup) merged.registrarApprovedDateGroup = DEFAULT_APP_POSITIONS.registrarApprovedDateGroup;

        // Auto-hide legacy individual & composite fields so they don't produce duplicate ghost text
        merged.firstName = { ...merged.firstName, hidden: true };
        merged.lastName = { ...merged.lastName, hidden: true };
        merged.fullName = { ...merged.fullName, hidden: true };
        merged.citizenId = { ...merged.citizenId, hidden: true };
        merged.citizenIssueDay = { ...merged.citizenIssueDay, hidden: true };
        merged.citizenIssueMonth = { ...merged.citizenIssueMonth, hidden: true };
        merged.citizenIssueYear = { ...merged.citizenIssueYear, hidden: true };
        merged.idCardIssuedDate = { ...merged.idCardIssuedDate, hidden: true };
        merged.citizenExpiryDay = { ...merged.citizenExpiryDay, hidden: true };
        merged.citizenExpiryMonth = { ...merged.citizenExpiryMonth, hidden: true };
        merged.citizenExpiryYear = { ...merged.citizenExpiryYear, hidden: true };
        merged.idCardExpiryDate = { ...merged.idCardExpiryDate, hidden: true };
        merged.birthDay = { ...merged.birthDay, hidden: true };
        merged.birthMonth = { ...merged.birthMonth, hidden: true };
        merged.birthYear = { ...merged.birthYear, hidden: true };
        merged.birthDate = { ...merged.birthDate, hidden: true };
        merged.postalCode = { ...merged.postalCode, hidden: true };
        merged.applyDay = { ...merged.applyDay, hidden: true };
        merged.applyMonth = { ...merged.applyMonth, hidden: true };
        merged.applyYear = { ...merged.applyYear, hidden: true };
        merged.registrarApprovedDay = { ...merged.registrarApprovedDay, hidden: true };
        merged.registrarApprovedMonth = { ...merged.registrarApprovedMonth, hidden: true };
        merged.registrarApprovedYear = { ...merged.registrarApprovedYear, hidden: true };

        return merged;
      }
    } catch (e) {}
    return DEFAULT_APP_POSITIONS;
  });

  const [certPositions, setCertPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_certificate_layout_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_CERT_POSITIONS, ...parsed };
        if (!merged.certDateGroup) merged.certDateGroup = DEFAULT_CERT_POSITIONS.certDateGroup;
        // Migration: guarantee all certificate fields exist with default positions
        if (!merged.birthDate) merged.birthDate = DEFAULT_CERT_POSITIONS.birthDate;
        if (!merged.registeredAddress) merged.registeredAddress = DEFAULT_CERT_POSITIONS.registeredAddress;
        if (!merged.phone) merged.phone = DEFAULT_CERT_POSITIONS.phone;
        if (!merged.startDate) merged.startDate = DEFAULT_CERT_POSITIONS.startDate;
        if (!merged.endDate) merged.endDate = DEFAULT_CERT_POSITIONS.endDate;
        merged.certDate = { ...merged.certDate, hidden: true };
        return merged;
      }
    } catch (e) {}
    return DEFAULT_CERT_POSITIONS;
  });

  // Selected Field for Dragging / Adjusting
  const [selectedFieldKey, setSelectedFieldKey] = useState('nameGroup');
  const [selectedDigitIdx, setSelectedDigitIdx] = useState(0);
  const [printOnlyText, setPrintOnlyText] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(90);
  const [lockAspect, setLockAspect] = useState(true);
  const [showVisibilityChecklist, setShowVisibilityChecklist] = useState(false);

  // Active signers assignment
  const [presidentSignerId, setPresidentSignerId] = useState(() => {
    const p = officers.find(o => o.role === 'president' || o.isDefaultPresident);
    return p ? p.id : officers[0]?.id;
  });
  const [registrarSignerId, setRegistrarSignerId] = useState(() => {
    const r = officers.find(o => o.role === 'registrar' || o.isDefaultRegistrar);
    return r ? r.id : officers[2]?.id || officers[0]?.id;
  });
  const [officerSignerId, setOfficerSignerId] = useState(() => {
    const s = officers.find(o => o.role === 'secretary' || o.isDefaultReceiptSigner);
    return s ? s.id : officers[1]?.id || officers[0]?.id;
  });

  const canvasRef = useRef(null);
  const canvasViewportRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Cross-Platform Central Synchronization & Admin PIN Modal State
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [syncMeta, setSyncMeta] = useState(() => defaultSavedLayout.meta || null);
  const [mobileViewMode, setMobileViewMode] = useState('fit'); // 'fit' | 'actual'
  const [containerWidth, setContainerWidth] = useState(794);
  const [canvasNaturalHeight, setCanvasNaturalHeight] = useState(1123);

  // Measure canvas viewport wrapper for responsive auto-scaling on mobile
  useEffect(() => {
    const updateWidth = () => {
      if (canvasViewportRef.current) {
        setContainerWidth(canvasViewportRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const isNarrowScreen = containerWidth > 0 && containerWidth < 820;
  const fitScale = isNarrowScreen ? Math.max(0.35, Math.min(1, (containerWidth - 16) / CANVAS_BASE_WIDTH)) : 1;
  const activeScale = (isNarrowScreen && mobileViewMode === 'fit') ? fitScale : 1;

  // Initial Central Layout loader from server (Single Source of Truth across PC & Mobile)
  useEffect(() => {
    let isMounted = true;
    fetchCentralLayoutSettings().then((centralData) => {
      if (!isMounted || !centralData) return;
      if (centralData.receipt) {
        setReceiptPositions(prev => ({ ...prev, ...centralData.receipt }));
      }
      if (centralData.application) {
        setAppPositions(prev => ({ ...prev, ...centralData.application }));
      }
      if (centralData.certificate) {
        setCertPositions(prev => ({ ...prev, ...centralData.certificate }));
      }
      if (centralData.receiptTierPositions) {
        setReceiptTierPositions(prev => ({ ...prev, ...centralData.receiptTierPositions }));
      }
      if (centralData.appTierPositions) {
        setAppTierPositions(prev => ({ ...prev, ...centralData.appTierPositions }));
      }
      if (centralData.templateBackgrounds) {
        setTemplateBackgrounds(prev => ({
          ...prev,
          ...centralData.templateBackgrounds
        }));
      }
      if (centralData.meta) {
        setSyncMeta(centralData.meta);
      }
    }).catch(err => console.warn('Could not load central layout:', err));

    return () => { isMounted = false; };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Get current active positions object
  const currentPositions = activeDocType === 'receipt' 
    ? receiptPositions 
    : (activeDocType === 'application' ? appPositions : certPositions);

  const setCurPositions = (newPos) => {
    if (activeDocType === 'receipt') setReceiptPositions(newPos);
    else if (activeDocType === 'application') setAppPositions(newPos);
    else setCertPositions(newPos);
  };

  // Save coordinates to Central Server with Admin PIN verification
  const handleSaveCoordinates = () => {
    setIsAdminPinModalOpen(true);
  };

  const handleConfirmAdminPin = async (pin) => {
    const currentPositionsToSave = {
      application: appPositions,
      receipt: receiptPositions,
      certificate: certPositions,
      receiptTierPositions: receiptTierPositions,
      appTierPositions: appTierPositions,
      templateBackgrounds: templateBackgrounds
    };

    const res = await saveCentralLayoutSettings({
      docType: activeDocType,
      dataToSave: currentPositionsToSave,
      pin: pin,
      adminUser: currentUser || { fullName: 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)', callsign: 'E26ECG' }
    });

    if (res.success) {
      if (res.meta) setSyncMeta(res.meta);
      showToast(`✅ บันทึกตำแหน่งพิกัดแม่แบบลงสู่ระบบกลางสำเร็จแล้ว! ทุกเครื่องมือและอุปกรณ์ (PC & Mobile) จะใช้งานตรงกันทันที`);
    } else {
      throw new Error(res.message || 'บันทึกไม่สำเร็จ');
    }
  };

  // Reset to default coordinates
  const handleResetCoordinates = () => {
    if (window.confirm('รีเซ็ตตำแหน่งพิกัดกลับสู่ค่าเริ่มต้นมาตรฐานใช่หรือไม่?')) {
      if (activeDocType === 'receipt') {
        setReceiptPositions(DEFAULT_RECEIPT_POSITIONS);
        setReceiptTierPositions(DEFAULT_RECEIPT_TIER_POSITIONS);
        localStorage.removeItem(STORAGE_KEYS.receipt);
        localStorage.removeItem(STORAGE_KEYS.receiptTier);
      } else if (activeDocType === 'application') {
        setAppPositions(DEFAULT_APP_POSITIONS);
        setAppTierPositions(DEFAULT_APP_TIER_POSITIONS);
        localStorage.removeItem(STORAGE_KEYS.application);
        localStorage.removeItem(STORAGE_KEYS.appTier);
      } else if (activeDocType === 'certificate') {
        setCertPositions(DEFAULT_CERT_POSITIONS);
        localStorage.removeItem(STORAGE_KEYS.certificate);
      }
      showToast('รีเซ็ตพิกัดมาตรฐานเรียบร้อยแล้ว');
    }
  };

  // Upload custom background template image directly to Cloudinary for cross-device sync
  const handleBgImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast('กำลังอัปโหลดภาพพื้นหลังขึ้น Cloudinary...');
      // 1. Immediate local preview
      const localUrl = URL.createObjectURL(file);
      setTemplateBackgrounds(prev => ({
        ...prev,
        [activeDocType]: localUrl
      }));

      try {
        // 2. Upload to Cloudinary CDN
        const cloudUrl = await uploadToCloudinary(file);
        const finalUrl = cloudUrl || localUrl;
        const updated = {
          ...templateBackgrounds,
          [activeDocType]: finalUrl
        };
        setTemplateBackgrounds(updated);
        localStorage.setItem('samila_doc_template_backgrounds_v1', JSON.stringify(updated));
        showToast(`อัปโหลดภาพพื้นหลังขึ้น Cloudinary สำเร็จ! กด 'บันทึกตำแหน่ง PIN' เพื่อซิงก์สู่มือถือและทุกอุปกรณ์`);
      } catch (err) {
        console.warn('Cloudinary upload error:', err);
        showToast('บันทึกภาพพื้นหลังในเครื่องเรียบร้อยแล้ว');
      }
    }
  };

  // Reset background template image
  const handleResetBgImage = () => {
    const defaultImg = getDefaultBg(activeDocType);
    const updated = {
      ...templateBackgrounds,
      [activeDocType]: defaultImg
    };
    setTemplateBackgrounds(updated);
    localStorage.setItem('samila_doc_template_backgrounds_v1', JSON.stringify(updated));
    showToast('รีเซ็ตภาพพื้นหลังแม่แบบเดิมเรียบร้อยแล้ว');
  };

  // Fine-tuning nudge controls
  const handleNudge = (dx, dy) => {
    if (!selectedFieldKey || !currentPositions[selectedFieldKey]) return;
    const current = currentPositions[selectedFieldKey];
    const newX = Math.max(0, Math.min(100, parseFloat((current.x + dx).toFixed(2))));
    const newY = Math.max(0, Math.min(100, parseFloat((current.y + dy).toFixed(2))));

    setCurPositions({
      ...currentPositions,
      [selectedFieldKey]: {
        ...current,
        x: newX,
        y: newY
      }
    });

    syncTierPosition(activeDocType, selectedFieldKey, newX, newY);
  };

  // Update specific field properties (fontSize, color, bold, letterSpacing, width, height)
  const handleUpdateField = (key, updates) => {
    if (!currentPositions[key]) return;
    setCurPositions({
      ...currentPositions,
      [key]: {
        ...currentPositions[key],
        ...updates
      }
    });
    if (updates.x !== undefined || updates.y !== undefined) {
      syncTierPosition(
        activeDocType, 
        key, 
        updates.x !== undefined ? updates.x : currentPositions[key].x, 
        updates.y !== undefined ? updates.y : currentPositions[key].y
      );
    }
  };

  // Toggle field visibility (hide or restore)
  const handleToggleFieldVisibility = (fieldKey, hide = true) => {
    if (!currentPositions[fieldKey]) return;
    const label = currentPositions[fieldKey]?.label || fieldKey;
    const updated = {
      ...currentPositions,
      [fieldKey]: {
        ...currentPositions[fieldKey],
        hidden: hide
      }
    };
    setCurPositions(updated);

    if (hide) {
      showToast(`นำฟิลด์ "${label}" ออกจากเอกสารแล้ว (สามารถกดนำกลับมาใช้ใหม่ได้ที่คลังฟิลด์ด้านล่าง)`);
      if (selectedFieldKey === fieldKey) {
        const remainingVisible = Object.keys(updated).filter(k => !updated[k].hidden);
        if (remainingVisible.length > 0) {
          setSelectedFieldKey(remainingVisible[0]);
        }
      }
    } else {
      setSelectedFieldKey(fieldKey);
      showToast(`นำฟิลด์ "${label}" กลับมาแสดงบนเอกสารแล้ว!`);
    }
  };

  // Restore all fields (excluding legacy composite/redundant individual ones unless explicitly restored)
  const handleRestoreAllFields = () => {
    const updated = { ...currentPositions };
    const legacyKeysToKeepHidden = activeDocType === 'application' 
      ? [
          'fullName', 'firstName', 'lastName',
          'birthDate', 'birthDay', 'birthMonth', 'birthYear',
          'currentAddress',
          'idCardIssuedDate', 'citizenIssueDay', 'citizenIssueMonth', 'citizenIssueYear',
          'idCardExpiryDate', 'citizenExpiryDay', 'citizenExpiryMonth', 'citizenExpiryYear',
          'citizenId', 'postalCode',
          'applyDay', 'applyMonth', 'applyYear',
          'registrarApprovedDay', 'registrarApprovedMonth', 'registrarApprovedYear'
        ]
      : activeDocType === 'receipt'
      ? ['dateDay', 'dateMonth', 'dateYear']
      : ['certDate'];

    Object.keys(updated).forEach(k => {
      if (legacyKeysToKeepHidden.includes(k)) {
        return;
      }
      updated[k] = { ...updated[k], hidden: false };
    });
    setCurPositions(updated);
    showToast('นำฟิลด์ทั้งหมดกลับมาแสดงบนเอกสารแล้ว');
  };

  // List visible and hidden fields for current active document
  const currentPositionsList = Object.keys(currentPositions).map(key => ({
    key,
    ...currentPositions[key]
  }));
  const visibleFieldsList = currentPositionsList.filter(f => !f.hidden);
  const hiddenFieldsList = currentPositionsList.filter(f => f.hidden);

  // Unified Pointer & Touch Drag handlers (Supported on PC Mouse, iPhone, iPad, Android)
  const handlePointerStart = (clientX, clientY, fieldKey) => {
    setSelectedFieldKey(fieldKey);
    setIsDragging(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickXPercent = ((clientX - rect.left) / rect.width) * 100;
    const clickYPercent = ((clientY - rect.top) / rect.height) * 100;

    const field = currentPositions[fieldKey];
    setDragOffset({
      x: clickXPercent - (field?.x || 0),
      y: clickYPercent - (field?.y || 0)
    });
  };

  const handlePointerMove = (clientX, clientY) => {
    if (!isDragging || !selectedFieldKey || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    let newX = ((clientX - rect.left) / rect.width) * 100 - dragOffset.x;
    let newY = ((clientY - rect.top) / rect.height) * 100 - dragOffset.y;

    newX = Math.max(0, Math.min(98, parseFloat(newX.toFixed(2))));
    newY = Math.max(0, Math.min(98, parseFloat(newY.toFixed(2))));

    setCurPositions({
      ...currentPositions,
      [selectedFieldKey]: {
        ...currentPositions[selectedFieldKey],
        x: newX,
        y: newY
      }
    });

    syncTierPosition(activeDocType, selectedFieldKey, newX, newY);
  };

  const handleMouseDown = (e, fieldKey) => {
    e.stopPropagation();
    handlePointerStart(e.clientX, e.clientY, fieldKey);
  };

  const handleMouseMove = (e) => {
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleTouchStart = (e, fieldKey) => {
    e.stopPropagation();
    if (e.touches && e.touches.length > 0) {
      handlePointerStart(e.touches[0].clientX, e.touches[0].clientY, fieldKey);
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches && e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Find signers
  const selectedPresident = officers.find(o => o.id === presidentSignerId) || officers[0];
  const selectedRegistrar = officers.find(o => o.id === registrarSignerId) || officers[2] || officers[0];
  const selectedOfficer = officers.find(o => o.id === officerSignerId) || officers[1] || officers[0];

  const currentBgImage = templateBackgrounds[activeDocType] || getDefaultBg(activeDocType);

  return (
    <div className="space-y-5">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Document Mode Navigation Bar (Redesigned with Clear Tabs & Separate Row for Member Preview) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
        
        {/* ROW 1: Dedicated Document Selection Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              เลือกเอกสารที่ต้องการออกแบบและจัดวางตำแหน่ง:
            </span>
            <span className="text-[11.5px] font-semibold text-slate-600 hidden sm:inline">
              {activeDocType === 'application' && '📄 กำลังแก้ไข: แบบคำขอสมัครสมาชิกสมาคมฯ'}
              {activeDocType === 'receipt' && '🧾 กำลังแก้ไข: ใบเสร็จรับเงิน (e-Receipt)'}
              {activeDocType === 'certificate' && '📜 กำลังแก้ไข: หนังสือรับรองสถานะสมาชิกภาพ'}
              {activeDocType === 'signatures' && '✍️ กำลังจัดการ: คลังลายเซ็นดิจิทัล'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => { setActiveDocType('application'); setSelectedFieldKey('nameGroup'); }}
              className={`p-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 border ${
                activeDocType === 'application'
                  ? 'bg-sky-700 text-white border-sky-800 shadow-md ring-2 ring-sky-300'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">1. ใบสมัครสมาชิก</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveDocType('receipt'); setSelectedFieldKey('receiptDateGroup'); }}
              className={`p-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 border ${
                activeDocType === 'receipt'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-300'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Receipt className="w-4 h-4 shrink-0" />
              <span className="truncate">2. ใบเสร็จรับเงิน</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveDocType('certificate'); setSelectedFieldKey('certDateGroup'); }}
              className={`p-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 border ${
                activeDocType === 'certificate'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-300'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Award className="w-4 h-4 shrink-0" />
              <span className="truncate">3. หนังสือรับรอง</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDocType('signatures')}
              className={`p-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 border ${
                activeDocType === 'signatures'
                  ? 'bg-purple-700 text-white border-purple-800 shadow-md ring-2 ring-purple-300'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <PenTool className="w-4 h-4 shrink-0" />
              <span className="truncate">4. คลังลายเซ็น</span>
            </button>
          </div>
        </div>

        {/* ROW 2: Member Selector for Preview & Sequence Badges (On a Clean Separate Row) */}
        {activeDocType !== 'signatures' && (
          <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
              <span className="text-slate-600 font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>ดูตัวอย่างด้วยข้อมูลสมาชิก:</span>
              </span>
              <select
                value={selectedMemberId}
                onChange={(e) => {
                  const newMemberId = e.target.value;
                  setSelectedMemberId(newMemberId);
                  setManualReceiptTier(null);
                  setManualAppTier(null);

                  const targetMember = membersList.find(m => m.id === newMemberId);
                  if (targetMember) {
                    const mType = (targetMember.memberType || '').toLowerCase();
                    let recTierKey = 'fiveYear';
                    if (mType.includes('ตลอดชีพ')) recTierKey = 'lifetime';
                    else if (mType.includes('กิตติมศักดิ์')) recTierKey = 'honorary';
                    else if (mType.includes('องค์กร')) recTierKey = 'radioOrg';
                    const recTier = RECEIPT_TIERS[recTierKey];
                    if (recTier) {
                      setReceiptPositions(prev => ({
                        ...prev,
                        memberFeeTypeCheck: { ...(prev.memberFeeTypeCheck || DEFAULT_RECEIPT_POSITIONS.memberFeeTypeCheck), y: recTier.rowY },
                        memberFeeAmount: { ...(prev.memberFeeAmount || DEFAULT_RECEIPT_POSITIONS.memberFeeAmount), y: recTier.rowY }
                      }));
                    }

                    let appTierKey = 'fiveYear';
                    if (mType.includes('ตลอดชีพ')) appTierKey = 'lifetime';
                    else if (mType.includes('กิตติมศักดิ์')) appTierKey = 'honorary';
                    else if (mType.includes('องค์กร')) appTierKey = 'radioOrg';
                    const appTier = APP_FORM_TIERS[appTierKey];
                    if (appTier) {
                      setAppPositions(prev => ({
                        ...prev,
                        tierStandard5YCheck: { ...(prev.tierStandard5YCheck || DEFAULT_APP_POSITIONS.tierStandard5YCheck), y: appTier.rowY },
                        tierMemberIdBoxes: { ...(prev.tierMemberIdBoxes || DEFAULT_APP_POSITIONS.tierMemberIdBoxes), y: appTier.rowY }
                      }));
                    }
                  }
                }}
                className="w-full sm:flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 transition cursor-pointer focus:ring-2 focus:ring-sky-500"
              >
                {membersList.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.callsign && m.callsign !== '-' ? m.callsign : 'รอ Callsign'} - {m.fullName} ({m.memberType || 'สมาชิกสามัญ 5 ปี'})
                  </option>
                ))}
              </select>
            </div>

            {/* Sequence Status Badges & Settings Trigger */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap bg-slate-100/90 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs w-full sm:w-auto shrink-0">
              <div className="flex items-center gap-1.5 font-mono text-xs shrink-0 whitespace-nowrap" title="รหัสสมาชิกที่จะแสดงในเอกสารทุกฉบับ">
                <span className="text-slate-500 font-sans font-medium text-[11px]">รหัสสมาชิก:</span>
                <span className="font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200">
                  #{effectiveMemberId}
                </span>
              </div>

              {activeDocType === 'receipt' && (
                <div className="flex items-center gap-1.5 font-mono text-xs pl-2.5 border-l border-slate-300 shrink-0 whitespace-nowrap" title="เล่มที่ และ เลขที่ใบเสร็จปัจจุบัน">
                  <span className="text-slate-500 font-sans font-medium text-[11px]">ใบเสร็จ:</span>
                  <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md border border-red-200">
                    เล่ม {effectiveBookNo} เลขที่ {effectiveReceiptNo}
                  </span>
                  <span className="text-[11px] text-slate-500 font-sans">
                    (ใบที่ {receiptSeqInfo.pageInBook}/{receiptSeqInfo.sheetsPerBook})
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsSequenceModalOpen(true)}
                className="ml-auto sm:ml-1 flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-sky-50 text-sky-700 hover:text-sky-800 border border-sky-300 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer shrink-0 whitespace-nowrap"
                title="คลิกเพื่อตั้งค่าเลขรันสมาชิกเริ่มต้น (เช่น 30,001) และตั้งค่าตัดเล่มใบเสร็จอัตโนมัติ"
              >
                <Settings className="w-3.5 h-3.5 text-sky-600" />
                <span>ตั้งค่าเลขรันอัตโนมัติ</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RENDER SIGNATURE VAULT TAB */}
      {activeDocType === 'signatures' ? (
        <SignatureVault onUpdateOfficers={(newOff) => setOfficers(newOff)} />
      ) : (
        /* RENDER VISUAL DESIGNER STUDIO (FOR APPLICATION, RECEIPT, OR CERTIFICATE) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* ================= LEFT / MAIN: INTERACTIVE CANVAS ================= */}
          <div className="lg:col-span-8 space-y-3">
            
            {/* Top Toolbar */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap w-full pb-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mr-1 shrink-0 whitespace-nowrap">
                  <Move className="w-4 h-4 text-sky-600" />
                  <span>คลิกลากขยับตำแหน่งได้อิสระ</span>
                </span>
                
                {/* Background Image Upload / Replace Button */}
                <label className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition shrink-0 whitespace-nowrap">
                  <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                  <span>🖼️ เปลี่ยนภาพพื้นหลังแม่แบบ</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBgImageUpload}
                  />
                </label>

                <button
                  type="button"
                  onClick={handleResetBgImage}
                  className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition shrink-0 whitespace-nowrap"
                  title="รีเซ็ตเป็นภาพแม่แบบมาตรฐาน"
                >
                  รีเซ็ตภาพ
                </button>

                {/* Print Text Only Mode Switcher */}
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900 ml-1 shrink-0 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={printOnlyText}
                    onChange={(e) => setPrintOnlyText(e.target.checked)}
                    className="rounded text-sky-600"
                  />
                  <span>พิมพ์เฉพาะข้อความ</span>
                </label>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap w-full pt-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetCoordinates}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                  title="รีเซ็ตพิกัด"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>รีเซ็ตพิกัด</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveCoordinates}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                  title="บันทึกพิกัดสู่ระบบกลางสำหรับทุกอุปกรณ์ (ต้องยืนยันรหัสแอดมิน)"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกตำแหน่ง</span>
                  <span className="text-[10px] bg-emerald-700/80 px-1.5 py-0.2 rounded font-mono">PIN</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportDocument}
                  disabled={isExporting}
                  className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-lg font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shrink-0 whitespace-nowrap"
                  title="สร้างเป็นภาพ บันทึกเข้าคลังภาพในโทรศัพท์ หรือแชร์ไปยัง LINE"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isExporting ? 'กำลังสร้างภาพ...' : 'พิมพ์ / บันทึกภาพ / แชร์ LINE'}</span>
                </button>
              </div>

              {/* Central Sync Status Banner */}
              {syncMeta && (
                <div className="w-full flex items-center justify-between gap-2 overflow-x-auto no-scrollbar flex-nowrap px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11.5px] text-emerald-900">
                  <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      ซิงค์แม่แบบกลางล่าสุด: <strong>{syncMeta.savedBy}</strong> ({syncMeta.callsign ? `${syncMeta.callsign} • ` : ''}{syncMeta.savedAtThai || 'ล่าสุด'})
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-200/90 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <Monitor className="w-3 h-3" />
                    <span>PC</span>
                    <span>=</span>
                    <Smartphone className="w-3 h-3" />
                    <span>มือถือ 100%</span>
                  </span>
                </div>
              )}
            </div>

            {/* Viewport & Responsive Scaling Container (Guarantees 1:1 Pixel & Aspect-Ratio Precision on PC, Tablet & Mobile) */}
            <div 
              ref={canvasViewportRef}
              className="w-full flex flex-col items-center overflow-x-auto pb-4"
            >
              {/* On narrow screens / mobile, show the Scale / Mode control bar */}
              {isNarrowScreen && (
                <div className="w-full max-w-[794px] flex items-center justify-between p-2 mb-2 bg-sky-50 border border-sky-200 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-sky-900 font-semibold">
                    <Smartphone className="w-4 h-4 text-sky-600" />
                    <span>มุมมองมือถือ ({Math.round(activeScale * 100)}%)</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-sky-200">
                    <button
                      type="button"
                      onClick={() => setMobileViewMode('fit')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        mobileViewMode === 'fit' 
                          ? 'bg-sky-600 text-white shadow-2xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📱 พอดีจอ
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileViewMode('actual')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        mobileViewMode === 'actual' 
                          ? 'bg-sky-600 text-white shadow-2xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🔍 100% (เลื่อนจอ)
                    </button>
                  </div>
                </div>
              )}

              {/* Outer Frame that maintains layout box size when transformed */}
              <div
                style={
                  activeScale < 1 ? {
                    width: `${Math.round(CANVAS_BASE_WIDTH * activeScale)}px`,
                    height: `${Math.round((canvasNaturalHeight || CANVAS_BASE_HEIGHT) * activeScale)}px`,
                    position: 'relative',
                    overflow: 'hidden'
                  } : {
                    width: `${CANVAS_BASE_WIDTH}px`,
                    position: 'relative'
                  }
                }
              >
                {/* Inner Transform Box */}
                <div
                  style={
                    activeScale < 1 ? {
                      width: `${CANVAS_BASE_WIDTH}px`,
                      minHeight: `${canvasNaturalHeight || CANVAS_BASE_HEIGHT}px`,
                      transform: `scale(${activeScale})`,
                      transformOrigin: 'top left',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    } : {
                      width: `${CANVAS_BASE_WIDTH}px`,
                      minHeight: `${canvasNaturalHeight || CANVAS_BASE_HEIGHT}px`,
                      position: 'relative'
                    }
                  }
                >
                  {/* Canvas Container */}
                  <div 
                    ref={canvasRef}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUp}
                    className="relative bg-white border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden shadow-lg select-none print:border-none print:shadow-none print:m-0"
                    style={{ width: `${CANVAS_BASE_WIDTH}px`, minHeight: `${canvasNaturalHeight || CANVAS_BASE_HEIGHT}px` }}
                  >
                    
                    {/* Background Scanned Template Image */}
                    {!printOnlyText && currentBgImage && (
                      <img
                        src={currentBgImage}
                        alt="Template Background"
                        className="w-full h-auto block select-none pointer-events-none transition-opacity duration-200"
                        style={{ opacity: bgOpacity / 100 }}
                        onLoad={(e) => {
                          if (e.target.naturalWidth > 0) {
                            const calcH = Math.round(e.target.naturalHeight * (CANVAS_BASE_WIDTH / e.target.naturalWidth));
                            setCanvasNaturalHeight(calcH);
                          }
                        }}
                      />
                    )}

              {/* Certificate White Paper Background if in Certificate mode with no image */}
              {activeDocType === 'certificate' && !printOnlyText && !currentBgImage && (
                <div className="p-8 sm:p-12 text-slate-900 font-sans relative w-full h-full select-none" style={{ minHeight: '880px' }}>
                  
                  {/* Decorative Outer Border */}
                  <div className="absolute inset-4 border-2 border-slate-300 rounded-xl pointer-events-none" />
                  <div className="absolute inset-5 border border-dashed border-slate-200 rounded-lg pointer-events-none" />

                  {/* Watermark Background Seal */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
                    <div className="w-[420px] h-[420px] rounded-full border-8 border-slate-900 flex items-center justify-center p-8">
                      <span className="text-8xl font-serif font-black tracking-widest text-slate-900 text-center">
                        HS9AS
                      </span>
                    </div>
                  </div>

                  {/* Header Title */}
                  <div className="text-center mb-6 pt-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
                      หนังสือรับรองสถานะการเป็นสมาชิก
                    </h1>
                  </div>

                  {/* Location & Date labels */}
                  <div className="flex flex-col items-end text-xs text-slate-700 space-y-1 mb-6 pr-6">
                    <div>
                      <span className="text-slate-500">เขียนที่ </span>
                      <span className="font-medium">......................................................................</span>
                    </div>
                    <div>
                      <span className="text-slate-500">วันที่ </span>
                      <span className="font-medium">......................................................................</span>
                    </div>
                  </div>

                  {/* Statement */}
                  <p className="text-xs text-slate-800 leading-relaxed indent-8 mb-6 px-4">
                    <strong>สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา</strong> ขอรับรองว่ารายละเอียดของบุคคล ดังต่อไปนี้เป็นความจริงทุกประการ
                  </p>

                  {/* Details Table Labels */}
                  <div className="mx-4 border-t border-b border-slate-300 divide-y divide-slate-200 text-xs">
                    <div className="py-2.5 grid grid-cols-12 gap-2">
                      <div className="col-span-4 text-slate-600 font-medium">ชื่อ-สกุล</div>
                      <div className="col-span-8"></div>
                    </div>
                    <div className="py-2.5 grid grid-cols-12 gap-2">
                      <div className="col-span-4 text-slate-600 font-medium">สัญญาณเรียกขาน (ถ้ามี)</div>
                      <div className="col-span-8"></div>
                    </div>
                    <div className="py-2.5 grid grid-cols-12 gap-2">
                      <div className="col-span-4 text-slate-600 font-medium">เลขประจำตัวประชาชน</div>
                      <div className="col-span-8"></div>
                    </div>
                    <div className="py-2.5 grid grid-cols-12 gap-2">
                      <div className="col-span-4 text-slate-600 font-medium">วัน เดือน ปี เกิด</div>
                      <div className="col-span-8"></div>
                    </div>
                    <div className="py-2.5 grid grid-cols-12 gap-2">
                      <div className="col-span-4 text-slate-600 font-medium">ที่อยู่ตามทะเบียนบ้าน</div>
                      <div className="col-span-8"></div>
                    </div>
                    <div className="py-2.5 grid grid-cols-12 gap-2">
                      <div className="col-span-4 text-slate-600 font-medium">หมายเลขโทรศัพท์ที่ติดต่อได้</div>
                      <div className="col-span-8"></div>
                    </div>
                    <div className="py-2.5 grid grid-cols-12 gap-2">
                      <div className="col-span-4 text-slate-600 font-medium">รหัสสมาชิก</div>
                      <div className="col-span-8"></div>
                    </div>
                    <div className="py-2.5 grid grid-cols-12 gap-2">
                      <div className="col-span-4 text-slate-600 font-medium">ประเภทสมาชิก</div>
                      <div className="col-span-8"></div>
                    </div>
                    <div className="py-2.5 grid grid-cols-12 gap-2">
                      <div className="col-span-4 text-slate-600 font-medium">วันเริ่มต้นการเป็นสมาชิก</div>
                      <div className="col-span-8"></div>
                    </div>
                    <div className="py-2.5 grid grid-cols-12 gap-2">
                      <div className="col-span-4 text-slate-600 font-medium">วันสิ้นสุดการเป็นสมาชิก</div>
                      <div className="col-span-8"></div>
                    </div>
                  </div>

                  {/* Conclusion */}
                  <p className="text-xs text-slate-800 mt-6 mb-8 px-4">
                    สมาคมฯ จึงออกหนังสือรับรองฉบับนี้ เพื่อเป็นหลักฐาน
                  </p>

                  {/* Signature Section Template */}
                  <div className="flex justify-end pr-8">
                    <div className="text-center w-72 space-y-1 relative">
                      <p className="text-xs text-slate-700">ขอแสดงความนับถือ</p>
                      
                      {/* Official Blue Stamp Impression */}
                      <div className="absolute -left-6 top-4 w-24 h-24 rounded-full border-2 border-blue-600/70 p-1 flex items-center justify-center text-center rotate-[-12deg] opacity-80 pointer-events-none select-none">
                        <div className="w-full h-full rounded-full border border-dashed border-blue-600/80 flex flex-col items-center justify-center p-1">
                          <span className="text-[7.5px] font-bold text-blue-700 leading-tight">สมาคมวิทยุสมัครเล่นสมิหลา</span>
                          <span className="text-[9px] font-black text-blue-800 font-mono my-0.5">HS9AS</span>
                          <span className="text-[6.5px] text-blue-600 leading-tight">จังหวัดสงขลา</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ================= DYNAMIC DRAGGABLE FIELD OVERLAYS ================= */}
              
              {/* --- 1. APPLICATION FORM FIELDS --- */}
              {activeDocType === 'application' && Object.keys(appPositions).map((key) => {
                const item = appPositions[key];
                if (!item || item.hidden) return null;
                const isSelected = selectedFieldKey === key;

                // Render value based on key or type
                let displayVal = item.label;
                let renderY = item.y;

                if (item.type === 'nameGroup') {
                  const lastNameOffset = item.lastNameOffsetPx !== undefined ? item.lastNameOffsetPx : 235;
                  displayVal = (
                    <div 
                      className="relative flex items-center select-none"
                      style={{ minWidth: `${lastNameOffset + 120}px`, height: '22px' }}
                    >
                      <span style={{ position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap' }}>
                        {activeFirstName}
                      </span>
                      <span style={{ position: 'absolute', left: `${lastNameOffset}px`, top: 0, whiteSpace: 'nowrap' }}>
                        {activeLastName}
                      </span>
                    </div>
                  );
                } else if (item.type === 'citizenIdBoxes') {
                  const idDigits = (activeMember.citizenId || '1909900123451').padEnd(13, ' ').slice(0, 13).split('');
                  const pitch = item.pitch !== undefined ? item.pitch : 19.5;
                  const groupGap = item.groupGap !== undefined ? item.groupGap : 7.5;
                  const digitOffsets = item.digitOffsets || {};
                  const totalWidth = 13 * pitch + 4 * groupGap + 20;

                  displayVal = (
                    <div
                      className="relative select-none"
                      style={{ width: `${totalWidth}px`, height: '24px' }}
                    >
                      {idDigits.map((char, idx) => {
                        let extraGap = 0;
                        if (idx >= 1) extraGap += groupGap;
                        if (idx >= 5) extraGap += groupGap;
                        if (idx >= 10) extraGap += groupGap;
                        if (idx >= 12) extraGap += groupGap;
                        const customNudge = digitOffsets[idx] || 0;
                        const xPos = idx * pitch + extraGap + customNudge;
                        const isDigitActive = isSelected && selectedDigitIdx === idx;

                        return (
                          <span
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFieldKey(key);
                              setSelectedDigitIdx(idx);
                            }}
                            style={{
                              position: 'absolute',
                              left: `${xPos}px`,
                              top: 0,
                              width: `${pitch}px`,
                              textAlign: 'center',
                              lineHeight: '22px'
                            }}
                            className={`inline-block font-mono cursor-pointer transition ${
                              isDigitActive ? 'ring-2 ring-purple-600 bg-purple-200/90 rounded font-bold' : ''
                            }`}
                            title={`หลักที่ ${idx + 1} (${char}) - คลิกเพื่อขยับละเอียด`}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </div>
                  );
                } else if (item.type === 'dateGroup') {
                  let d = '16', m = '11', y = '2569';
                  if (key === 'birthDateGroup') { d = '1'; m = 'ม.ค.'; y = '2535'; }
                  else if (key === 'citizenIssueDateGroup') { d = '10'; m = '05'; y = '69'; }
                  else if (key === 'citizenExpiryDateGroup') { d = '09'; m = '05'; y = '69'; }
                  else if (key === 'applyDateGroup') { d = '16'; m = '11'; y = '2569'; }
                  else if (key === 'registrarApprovedDateGroup') { d = '16'; m = '11'; y = '2569'; }

                  if (item.customDay !== undefined && item.customDay !== '') d = item.customDay;
                  if (item.customMonth !== undefined && item.customMonth !== '') m = item.customMonth;
                  if (item.customYear !== undefined && item.customYear !== '') {
                    y = item.customYear;
                  } else if (item.yearFormat === '2digit') {
                    y = y.length >= 2 ? y.slice(-2) : y;
                  }

                  const mOffset = item.monthOffsetPx !== undefined ? item.monthOffsetPx : 60;
                  const yOffset = item.yearOffsetPx !== undefined ? item.yearOffsetPx : 130;
                  displayVal = (
                    <div 
                      className="relative flex items-center select-none"
                      style={{ minWidth: `${yOffset + 60}px`, height: '22px' }}
                    >
                      <span style={{ position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap' }}>{d}</span>
                      <span style={{ position: 'absolute', left: `${mOffset}px`, top: 0, whiteSpace: 'nowrap' }}>{m}</span>
                      <span style={{ position: 'absolute', left: `${yOffset}px`, top: 0, whiteSpace: 'nowrap' }}>{y}</span>
                    </div>
                  );
                } else if (item.type === 'simpleDigitBoxes') {
                  const rawStr = key === 'postalCodeBoxes' ? activePostalCode : effectiveMemberId;
                  const digits = rawStr.split('');
                  const pitch = item.pitch !== undefined ? item.pitch : 17.5;
                  const digitOffsets = item.digitOffsets || {};
                  const totalWidth = digits.length * pitch + 20;

                  displayVal = (
                    <div
                      className="relative select-none"
                      style={{ width: `${totalWidth}px`, height: '24px' }}
                    >
                      {digits.map((char, idx) => {
                        const customNudge = digitOffsets[idx] || 0;
                        const xPos = idx * pitch + customNudge;
                        const isDigitActive = isSelected && selectedDigitIdx === idx;

                        return (
                          <span
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFieldKey(key);
                              setSelectedDigitIdx(idx);
                            }}
                            style={{
                              position: 'absolute',
                              left: `${xPos}px`,
                              top: 0,
                              width: `${pitch}px`,
                              textAlign: 'center',
                              lineHeight: '22px'
                            }}
                            className={`inline-block font-mono cursor-pointer transition ${
                              isDigitActive ? 'ring-2 ring-purple-600 bg-purple-200/90 rounded font-bold' : ''
                            }`}
                            title={`หลักที่ ${idx + 1} (${char}) - คลิกเพื่อขยับละเอียด`}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </div>
                  );
                } else if (key === 'firstName') displayVal = activeFirstName;
                else if (key === 'lastName') displayVal = activeLastName;
                else if (key === 'fullName') displayVal = activeMember.fullName;
                else if (key === 'callsignOld') displayVal = '-';
                else if (key === 'callsignNew') displayVal = activeMember.callsign && activeMember.callsign !== '-' ? activeMember.callsign : 'E26ECG';
                else if (key === 'citizenId') displayVal = activeMember.citizenId || '1909900123451';
                else if (key === 'citizenIssueDay') displayVal = '10';
                else if (key === 'citizenIssueMonth') displayVal = '05';
                else if (key === 'citizenIssueYear') displayVal = '2565';
                else if (key === 'idCardIssuedDate') displayVal = '10/05/2565';
                else if (key === 'citizenExpiryDay') displayVal = '09';
                else if (key === 'citizenExpiryMonth') displayVal = '05';
                else if (key === 'citizenExpiryYear') displayVal = '2573';
                else if (key === 'idCardExpiryDate') displayVal = '09/05/2573';
                else if (key === 'birthDay') displayVal = '1';
                else if (key === 'birthMonth') displayVal = '1';
                else if (key === 'birthYear') displayVal = '2535';
                else if (key === 'birthDate') displayVal = '1 ม.ค. 2535';
                else if (key === 'age') displayVal = '34';
                else if (key === 'genderMaleCheck') displayVal = '✓';
                else if (key === 'maritalCheck') displayVal = '✓';
                else if (key === 'addressLine1') displayVal = activeAddressLine1;
                else if (key === 'addressLine2') displayVal = activeAddressLine2;
                else if (key === 'currentAddress') displayVal = activeCleanAddress;
                else if (key === 'postalCode') displayVal = activePostalCode;
                else if (key === 'phone') displayVal = activeMember.phone || '093-792-5665';
                else if (key === 'email') displayVal = activeMember.email || 'samila.radio@gmail.com';
                else if (key === 'lineId') displayVal = activeMember.callsign || 'e26ecg';
                else if (key === 'docIdCardCheck' || key === 'docPhotoCheck' || key === 'tierStandard5YCheck') displayVal = '✓';
                else if (key === 'tierMemberIdBoxes') displayVal = effectiveMemberId;
                else if (key === 'startDate') displayVal = activeMember.startDate || '16-11-2569';
                else if (key === 'endDate') {
                  if (activeAppTierKey === 'lifetime') displayVal = 'ตลอดชีพ';
                  else if (activeAppTierKey === 'honorary') displayVal = 'กิตติมศักดิ์';
                  else if (activeAppTierKey === 'radioOrg') displayVal = 'ตลอดการดำเนินงาน';
                  else displayVal = activeMember.endDate || '15-11-2574';
                }
                else if (key === 'applyDay' || key === 'registrarApprovedDay') displayVal = '16';
                else if (key === 'applyMonth' || key === 'registrarApprovedMonth') displayVal = '11';
                else if (key === 'applyYear' || key === 'registrarApprovedYear') displayVal = '2569';
                else if (key === 'officerReceivedAmount') {
                  if (activeAppTierKey === 'lifetime') displayVal = '2,500';
                  else if (activeAppTierKey === 'fiveYear') displayVal = '500';
                  else displayVal = '0';
                }
                else if (key === 'officerReceiptNo') displayVal = effectiveReceiptNo;

                // Signature Slots
                if (key === 'applicantSignature') {
                  displayVal = (
                    <span className="font-serif italic text-blue-900 font-bold">
                      {activeFirstName.replace('นาย', '').replace('นางสาว', '').replace('นาง', '').replace('ว่าที่ ร.ต.', '').trim()}
                    </span>
                  );
                } else if (key === 'registrarSignature') {
                  displayVal = (
                    <div className="w-28 h-8">
                      {selectedRegistrar?.signatureImage ? (
                        <img src={selectedRegistrar.signatureImage} alt="Registrar" className="max-h-full mix-blend-multiply" />
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: selectedRegistrar?.signatureSvg || '' }} />
                      )}
                    </div>
                  );
                } else if (key === 'officerSignature') {
                  displayVal = (
                    <div className="w-24 h-7">
                      {selectedOfficer?.signatureImage ? (
                        <img src={selectedOfficer.signatureImage} alt="Officer" className="max-h-full mix-blend-multiply" />
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: selectedOfficer?.signatureSvg || '' }} />
                      )}
                    </div>
                  );
                } else if (key === 'photoBox') {
                  const photoW = item.width || 80;
                  const photoH = item.height || 105;
                  displayVal = (
                    <div 
                      style={{ width: `${photoW}px`, height: `${photoH}px` }}
                      className="border-2 border-slate-400 bg-slate-100 rounded overflow-hidden flex items-center justify-center shadow-xs relative"
                    >
                      <img 
                        src={activeMember.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
                        alt="Photo" 
                        className="w-full h-full object-cover pointer-events-none" 
                      />
                    </div>
                  );
                }

                return (
                  <div
                    key={key}
                    onMouseDown={(e) => handleMouseDown(e, key)}
                    onTouchStart={(e) => handleTouchStart(e, key)}
                    style={{
                      left: `${item.x}%`,
                      top: `${renderY}%`,
                      fontSize: `${item.fontSize}px`,
                      color: item.color,
                      fontWeight: item.bold ? 'bold' : 'normal',
                      letterSpacing: item.letterSpacing ? `${item.letterSpacing}px` : undefined,
                      fontFamily: item.letterSpacing ? 'monospace' : undefined,
                      transform: 'translate(-5%, -5%)'
                    }}
                    className={`absolute cursor-move select-none p-0.5 rounded transition-shadow ${
                      isSelected 
                        ? 'ring-2 ring-sky-500 bg-sky-100/70 z-30 shadow-md font-bold' 
                        : 'hover:ring-1 hover:ring-slate-400 z-10'
                    }`}
                  >
                    {/* Quick Remove / Hide Button on Selected Canvas Item */}
                    {isSelected && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleToggleFieldVisibility(key, true);
                        }}
                        className="absolute -top-3 -right-3 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md z-40 cursor-pointer transition hover:scale-110"
                        title="คลิกเพื่อนำฟิลด์นี้ออกจากเอกสาร (สามารถกดนำกลับมาใช้ใหม่ได้ที่คลังฟิลด์ด้านล่าง)"
                      >
                        ✕
                      </button>
                    )}
                    {displayVal}
                  </div>
                );
              })}

              {/* --- 2. RECEIPT FORM FIELDS --- */}
              {activeDocType === 'receipt' && Object.keys(receiptPositions).map((key) => {
                const item = receiptPositions[key];
                if (!item || item.hidden) return null;
                const isSelected = selectedFieldKey === key;

                let displayVal = item.label;
                let renderY = item.y;

                if (item.type === 'dateGroup' || key === 'receiptDateGroup') {
                  const mOffset = item.monthOffsetPx !== undefined ? item.monthOffsetPx : 105;
                  const yOffset = item.yearOffsetPx !== undefined ? item.yearOffsetPx : 235;
                  let d = '16', m = 'พ.ย.', y = '2569';
                  if (item.customDay !== undefined && item.customDay !== '') d = item.customDay;
                  if (item.customMonth !== undefined && item.customMonth !== '') m = item.customMonth;
                  if (item.customYear !== undefined && item.customYear !== '') {
                    y = item.customYear;
                  } else if (item.yearFormat === '2digit') {
                    y = y.length >= 2 ? y.slice(-2) : y;
                  }
                  displayVal = (
                    <div 
                      className="relative flex items-center select-none"
                      style={{ minWidth: `${yOffset + 60}px`, height: '22px' }}
                    >
                      <span style={{ position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap' }}>{d}</span>
                      <span style={{ position: 'absolute', left: `${mOffset}px`, top: 0, whiteSpace: 'nowrap' }}>{m}</span>
                      <span style={{ position: 'absolute', left: `${yOffset}px`, top: 0, whiteSpace: 'nowrap' }}>{y}</span>
                    </div>
                  );
                } else if (key === 'bookNo') displayVal = effectiveBookNo;
                else if (key === 'receiptNo') displayVal = effectiveReceiptNo;
                else if (key === 'dateDay') displayVal = '16';
                else if (key === 'dateMonth') displayVal = 'พ.ย.';
                else if (key === 'dateYear') displayVal = '2569';
                else if (key === 'payerName') displayVal = activeMember.fullName;
                else if (key === 'memberId') displayVal = effectiveMemberId;
                else if (key === 'address') displayVal = activeMember.currentAddress || activeMember.registeredAddress || '16/74 ม.7 ต.โคกเคียน อ.เมือง จ.นราธิวาส';
                else if (key === 'phone') displayVal = activeMember.phone || '093-792-5665';
                else if (key === 'memberFeeCheck' || key === 'memberFeeTypeCheck') displayVal = '✓';
                else if (key === 'slashMark') displayVal = '/';
                else if (key === 'memberFeeAmount') {
                  displayVal = activeReceiptTier.showAmountInRow ? activeReceiptTier.feeFormatted : '';
                }
                else if (key === 'totalAmountNumber') {
                  displayVal = activeReceiptTier.feeAmount > 0 ? activeReceiptTier.feeFormatted : '0';
                }
                else if (key === 'totalAmountText') {
                  displayVal = activeReceiptTier.feeText;
                }
                else if (key === 'signerPosition') displayVal = selectedOfficer?.title || 'เลขาธิการ';
                else if (key === 'signature') {
                  displayVal = (
                    <div className="w-28 h-9">
                      {selectedOfficer?.signatureImage ? (
                        <img src={selectedOfficer.signatureImage} alt="Signer" className="max-h-full mix-blend-multiply" />
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: selectedOfficer?.signatureSvg || '' }} />
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={key}
                    onMouseDown={(e) => handleMouseDown(e, key)}
                    onTouchStart={(e) => handleTouchStart(e, key)}
                    style={{
                      left: `${item.x}%`,
                      top: `${renderY}%`,
                      fontSize: `${item.fontSize}px`,
                      color: item.color,
                      fontWeight: item.bold ? 'bold' : 'normal',
                      letterSpacing: item.letterSpacing ? `${item.letterSpacing}px` : undefined,
                      fontFamily: item.letterSpacing ? 'monospace' : undefined
                    }}
                    className={`absolute cursor-move select-none p-0.5 rounded transition-shadow ${
                      isSelected 
                        ? 'ring-2 ring-emerald-500 bg-emerald-100/70 z-30 shadow-md font-bold' 
                        : 'hover:ring-1 hover:ring-slate-400 z-10'
                    }`}
                  >
                    {/* Quick Remove / Hide Button on Selected Canvas Item */}
                    {isSelected && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleToggleFieldVisibility(key, true);
                        }}
                        className="absolute -top-3 -right-3 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md z-40 cursor-pointer transition hover:scale-110"
                        title="คลิกเพื่อนำฟิลด์นี้ออกจากเอกสาร (สามารถกดนำกลับมาใช้ใหม่ได้ที่คลังฟิลด์ด้านล่าง)"
                      >
                        ✕
                      </button>
                    )}
                    {displayVal}
                  </div>
                );
              })}

              {/* --- 3. CERTIFICATE FORM FIELDS --- */}
              {activeDocType === 'certificate' && Object.keys(certPositions).map((key) => {
                const item = certPositions[key];
                if (!item || item.hidden) return null;
                const isSelected = selectedFieldKey === key;

                let displayVal = item.label;
                let renderY = item.y;
                if (item.type === 'dateGroup' || key === 'certDateGroup') {
                  const mOffset = item.monthOffsetPx !== undefined ? item.monthOffsetPx : 45;
                  const yOffset = item.yearOffsetPx !== undefined ? item.yearOffsetPx : 130;
                  let d = '16', m = 'พฤศจิกายน', y = '2569';
                  if (item.customDay !== undefined && item.customDay !== '') d = item.customDay;
                  if (item.customMonth !== undefined && item.customMonth !== '') m = item.customMonth;
                  if (item.customYear !== undefined && item.customYear !== '') {
                    y = item.customYear;
                  } else if (item.yearFormat === '2digit') {
                    y = y.length >= 2 ? y.slice(-2) : y;
                  }
                  displayVal = (
                    <div 
                      className="relative flex items-center select-none"
                      style={{ minWidth: `${yOffset + 60}px`, height: '22px' }}
                    >
                      <span style={{ position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap' }}>{d}</span>
                      <span style={{ position: 'absolute', left: `${mOffset}px`, top: 0, whiteSpace: 'nowrap' }}>{m}</span>
                      <span style={{ position: 'absolute', left: `${yOffset}px`, top: 0, whiteSpace: 'nowrap' }}>{y}</span>
                    </div>
                  );
                } else if (key === 'headerTitle') displayVal = 'หนังสือรับรองสถานะการเป็นสมาชิก';
                else if (key === 'writtenAt') displayVal = 'สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา';
                else if (key === 'certDate') displayVal = '16 พฤศจิกายน 2569';
                else if (key === 'memberName') displayVal = activeMember.fullName;
                else if (key === 'callsign') displayVal = activeMember.callsign && activeMember.callsign !== '-' ? activeMember.callsign : '-';
                else if (key === 'citizenId') displayVal = activeMember.citizenId || '1909900123451';
                else if (key === 'birthDate') displayVal = formatThaiBirthDate(activeMember.birthDate || (activeMember.callsign === 'HS9ADM' ? '10/05/2528' : '16/09/2530'));
                else if (key === 'registeredAddress') {
                  const addr = activeMember.registeredAddress || activeMember.currentAddress || 'เลขที่ 99/9 ถ.ชลาทัศน์ ต.บ่อยาง อ.เมือง จ.สงขลา 90000';
                  displayVal = (
                    <div style={{ maxWidth: '440px', lineHeight: '1.4', wordBreak: 'break-word' }}>
                      {addr}
                    </div>
                  );
                }
                else if (key === 'phone') displayVal = activeMember.phone || '089-888-9999';
                else if (key === 'memberId') displayVal = effectiveMemberId;
                else if (key === 'memberType') displayVal = activeMember.memberType || 'สมาชิกตลอดชีพ';
                else if (key === 'startDate') displayVal = formatThaiDateString(activeMember.startDate || '01-01-2558');
                else if (key === 'endDate') displayVal = formatThaiDateString(activeMember.endDate || 'ตลอดชีพ');
                else if (key === 'presidentName') displayVal = `(${selectedPresident?.name || 'นายธานี รายศิริ'}) \n ${selectedPresident?.title || 'นายกสมาคม'}`;
                else if (key === 'presidentSignature') {
                  displayVal = (
                    <div className="w-36 h-12">
                      {selectedPresident?.signatureImage ? (
                        <img src={selectedPresident.signatureImage} alt="President" className="max-h-full mix-blend-multiply" />
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: selectedPresident?.signatureSvg || '' }} />
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={key}
                    onMouseDown={(e) => handleMouseDown(e, key)}
                    onTouchStart={(e) => handleTouchStart(e, key)}
                    style={{
                      left: `${item.x}%`,
                      top: `${renderY}%`,
                      fontSize: `${item.fontSize}px`,
                      color: item.color,
                      fontWeight: item.bold ? 'bold' : 'normal',
                      letterSpacing: item.letterSpacing ? `${item.letterSpacing}px` : undefined
                    }}
                    className={`absolute cursor-move select-none p-0.5 rounded transition-shadow ${
                      isSelected 
                        ? 'ring-2 ring-amber-500 bg-amber-100/70 z-30 shadow-md font-bold' 
                        : 'hover:ring-1 hover:ring-slate-400 z-10'
                    }`}
                  >
                    {/* Quick Remove / Hide Button on Selected Canvas Item */}
                    {isSelected && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleToggleFieldVisibility(key, true);
                        }}
                        className="absolute -top-3 -right-3 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md z-40 cursor-pointer transition hover:scale-110"
                        title="คลิกเพื่อนำฟิลด์นี้ออกจากเอกสาร (สามารถกดนำกลับมาใช้ใหม่ได้ที่คลังฟิลด์ด้านล่าง)"
                      >
                        ✕
                      </button>
                    )}
                    {displayVal}
                  </div>
                );
              })}

                  </div>
                </div>
              </div>
            </div>

            {/* ================= UNUSED / HIDDEN FIELDS POOL & VISIBILITY CHECKLIST ================= */}
            <div className="space-y-3 pt-2">
              
              {/* 1. Unused & Hidden Fields Pool (คลังฟิลด์ที่ซ่อนไว้ / ไม่ได้ใช้งาน) */}
              {hiddenFieldsList.length > 0 && (
                <div className="bg-amber-50/80 border-2 border-dashed border-amber-300 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        📦
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <span>คลังฟิลด์ที่ซ่อนไว้ / ไม่ได้ใช้งาน</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10.5px] font-mono font-bold">
                            {hiddenFieldsList.length} ฟิลด์
                          </span>
                        </h4>
                        <p className="text-[11px] text-amber-700">
                          ฟิลด์ที่ถูกติ๊กออกหรือไม่ต้องการพิมพ์จะรวมอยู่ที่นี่ คลิกที่ฟิลด์ใดก็ได้เพื่อนำกลับมาวางบนเอกสารได้ทันที
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRestoreAllFields}
                        className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-600" />
                        <span>นำกลับมาแสดงทั้งหมด</span>
                      </button>
                    </div>
                  </div>

                  {/* List of Hidden Field Chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {hiddenFieldsList.map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleToggleFieldVisibility(key, false)}
                        className="group px-3 py-1.5 bg-white hover:bg-emerald-600 hover:text-white border border-amber-300 hover:border-emerald-600 rounded-xl text-xs font-semibold text-amber-950 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                        title="คลิกเพื่อนำฟิลด์นี้กลับมาแสดงบนเอกสาร"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                        <span>{label}</span>
                        <span className="text-[10px] text-amber-600 group-hover:text-emerald-100 font-normal">
                          (คลิกนำกลับมาใช้)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Collapsible Field Visibility Checklist (จัดการเปิด/ปิดแสดงฟิลด์ทั้งหมด) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowVisibilityChecklist(!showVisibilityChecklist)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-sky-700 cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-sky-600" />
                    <span>จัดการเปิด/ปิดแสดงฟิลด์ทั้งหมด (Field Visibility Checklist)</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10.5px] font-mono">
                      {visibleFieldsList.length} / {currentPositionsList.length} กำลังแสดง
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowVisibilityChecklist(!showVisibilityChecklist)}
                    className="text-xs text-sky-600 hover:underline font-semibold cursor-pointer"
                  >
                    {showVisibilityChecklist ? 'ย่อตาราง' : 'คลิกเพื่อเปิดตารางติ๊กเลือก'}
                  </button>
                </div>

                {showVisibilityChecklist && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] text-slate-500">
                      ติ๊กถูกเพื่อแสดงฟิลด์บนเอกสาร หรือติ๊กออกเพื่อซ่อนฟิลด์ที่ไม่จำเป็น (ฟิลด์ที่ติ๊กออกจะย้ายไปอยู่ในคลังด้านบน)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto p-1 bg-slate-50/70 rounded-xl border border-slate-200">
                      {currentPositionsList.map(field => (
                        <label
                          key={field.key}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition text-xs select-none ${
                            !field.hidden 
                              ? 'bg-white border border-slate-200 shadow-2xs font-semibold text-slate-800 hover:border-sky-300' 
                              : 'bg-slate-100/70 text-slate-400 hover:bg-slate-200/60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!field.hidden}
                            onChange={(e) => handleToggleFieldVisibility(field.key, !e.target.checked)}
                            className="rounded text-sky-600 accent-sky-600 w-4 h-4 cursor-pointer"
                          />
                          <span className="truncate">{field.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* ================= RIGHT: COORDINATE & SIGNATURE CONTROLS ================= */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Signature Slot Assignments (Connecting to Vault) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-purple-600" />
                  <span>กำหนดผู้ลงนามสำหรับเอกสารนี้ (Signer Slot)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDocType('signatures')}
                  className="text-[11px] text-sky-600 hover:underline font-semibold"
                >
                  จัดการคลังลายเซ็น
                </button>
              </div>

              {activeDocType === 'application' && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-slate-500 block text-[11px] mb-1 font-medium">
                      ผู้มีอำนาจลงนาม / นายทะเบียน:
                    </label>
                    <select
                      value={registrarSignerId}
                      onChange={(e) => setRegistrarSignerId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800"
                    >
                      {officers.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({o.title}) {o.isDefaultRegistrar ? '★' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 block text-[11px] mb-1 font-medium">
                      เจ้าหน้าที่การเงิน / ผู้รับเงิน:
                    </label>
                    <select
                      value={officerSignerId}
                      onChange={(e) => setOfficerSignerId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800"
                    >
                      {officers.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({o.title}) {o.isDefaultReceiptSigner ? '★' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {activeDocType === 'receipt' && (
                <div className="text-xs">
                  <label className="text-slate-500 block text-[11px] mb-1 font-medium">
                    ผู้รับเงิน / เลขาธิการ / เหรัญญิก:
                  </label>
                  <select
                    value={officerSignerId}
                    onChange={(e) => setOfficerSignerId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800"
                  >
                    {officers.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.title}) {o.isDefaultReceiptSigner ? '★' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeDocType === 'certificate' && (
                <div className="text-xs">
                  <label className="text-slate-500 block text-[11px] mb-1 font-medium">
                    นายกสมาคม / ผู้มีอำนาจลงนามแทน:
                  </label>
                  <select
                    value={presidentSignerId}
                    onChange={(e) => setPresidentSignerId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800"
                  >
                    {officers.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.title}) {o.isDefaultPresident ? '★' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Selected Field Fine-Tuning Coordinates Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-600" />
                  <span>ปรับแต่งพิกัดละเอียด (Fine-Tune)</span>
                </span>
                
                {/* Hide / Restore Current Field Button */}
                {currentPositions[selectedFieldKey] && (
                  <button
                    type="button"
                    onClick={() => handleToggleFieldVisibility(selectedFieldKey, !currentPositions[selectedFieldKey]?.hidden)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition shadow-2xs ${
                      currentPositions[selectedFieldKey]?.hidden
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                    }`}
                    title={currentPositions[selectedFieldKey]?.hidden ? 'นำฟิลด์นี้กลับมาแสดงบนเอกสาร' : 'นำฟิลด์นี้ออกจากเอกสาร'}
                  >
                    {currentPositions[selectedFieldKey]?.hidden ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>+ นำกลับมาใช้</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                        <span>ซ่อนฟิลด์นี้</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Field Select Dropdown */}
              <div>
                <label className="text-[11px] text-slate-500 block mb-1 font-medium">เลือกฟิลด์ที่ต้องการขยับ:</label>
                <select
                  value={selectedFieldKey}
                  onChange={(e) => setSelectedFieldKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <optgroup label="── ฟิลด์ที่กำลังแสดงบนเอกสาร ──">
                    {visibleFieldsList.map(f => (
                      <option key={f.key} value={f.key}>
                        {f.label} (X: {f.x}%, Y: {f.y}%)
                      </option>
                    ))}
                  </optgroup>
                  {hiddenFieldsList.length > 0 && (
                    <optgroup label="── ฟิลด์ที่ซ่อนไว้ / ไม่ได้ใช้งาน ──">
                      {hiddenFieldsList.map(f => (
                        <option key={f.key} value={f.key}>
                          [ซ่อนอยู่] {f.label}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Nudge D-Pad Buttons */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  ปุ่มกดขยับพิกัดทีละนิด (Nudge ±0.2%)
                </span>
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleNudge(0, -0.2)}
                    className="p-2 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-300 rounded-lg shadow-2xs transition cursor-pointer"
                    title="เลื่อนขึ้น"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleNudge(-0.2, 0)}
                      className="p-2 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-300 rounded-lg shadow-2xs transition cursor-pointer"
                      title="เลื่อนซ้าย"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="px-2 py-1 bg-slate-200 text-slate-800 rounded font-mono text-xs font-bold">
                      X: {currentPositions[selectedFieldKey]?.x}% | Y: {currentPositions[selectedFieldKey]?.y}%
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNudge(0.2, 0)}
                      className="p-2 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-300 rounded-lg shadow-2xs transition cursor-pointer"
                      title="เลื่อนขวา"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNudge(0, 0.2)}
                    className="p-2 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-300 rounded-lg shadow-2xs transition cursor-pointer"
                    title="เลื่อนลง"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Controls based on field type: Image / Photo vs Text */}
              {currentPositions[selectedFieldKey] && (
                <div className="space-y-3 text-xs pt-1">
                  
                  {/* --- A. PHOTO / IMAGE SIZE CONTROLS --- */}
                  {(selectedFieldKey === 'photoBox' || currentPositions[selectedFieldKey]?.isImage) ? (
                    <div className="space-y-3 p-3 bg-sky-50/70 rounded-xl border border-sky-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-950 text-xs flex items-center gap-1.5">
                          <Maximize2 className="w-4 h-4 text-sky-600" />
                          <span>ปรับขนาดรูปถ่าย (Photo Dimensions)</span>
                        </span>
                        <span className="font-mono text-xs text-sky-700 font-bold bg-white px-2 py-0.5 rounded border border-sky-200">
                          {currentPositions[selectedFieldKey]?.width || 80} × {currentPositions[selectedFieldKey]?.height || 105} px
                        </span>
                      </div>

                      {/* Standard Presets */}
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium block mb-1">ขนาดมาตรฐาน:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleUpdateField(selectedFieldKey, { width: 75, height: 100 })}
                            className="px-2 py-1 text-[11px] font-semibold bg-white hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-md transition shadow-2xs cursor-pointer"
                          >
                            📷 รูป 1 นิ้ว (75×100)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateField(selectedFieldKey, { width: 90, height: 120 })}
                            className="px-2 py-1 text-[11px] font-semibold bg-white hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-md transition shadow-2xs cursor-pointer"
                          >
                            📷 รูป 1.5 นิ้ว (90×120)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateField(selectedFieldKey, { width: 110, height: 145 })}
                            className="px-2 py-1 text-[11px] font-semibold bg-white hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-md transition shadow-2xs cursor-pointer"
                          >
                            📷 รูป 2 นิ้ว (110×145)
                          </button>
                        </div>
                      </div>

                      {/* Width Slider */}
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span>ความกว้าง (Width):</span>
                          <strong className="font-mono">{currentPositions[selectedFieldKey]?.width || 80} px</strong>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="250"
                          value={currentPositions[selectedFieldKey]?.width || 80}
                          onChange={(e) => {
                            const newW = parseInt(e.target.value);
                            if (lockAspect) {
                              const ratio = (currentPositions[selectedFieldKey]?.height || 105) / (currentPositions[selectedFieldKey]?.width || 80);
                              handleUpdateField(selectedFieldKey, { width: newW, height: Math.round(newW * ratio) });
                            } else {
                              handleUpdateField(selectedFieldKey, { width: newW });
                            }
                          }}
                          className="w-full accent-sky-600"
                        />
                      </div>

                      {/* Height Slider */}
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span>ความสูง (Height):</span>
                          <strong className="font-mono">{currentPositions[selectedFieldKey]?.height || 105} px</strong>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="320"
                          value={currentPositions[selectedFieldKey]?.height || 105}
                          onChange={(e) => {
                            const newH = parseInt(e.target.value);
                            if (lockAspect) {
                              const ratio = (currentPositions[selectedFieldKey]?.width || 80) / (currentPositions[selectedFieldKey]?.height || 105);
                              handleUpdateField(selectedFieldKey, { height: newH, width: Math.round(newH * ratio) });
                            } else {
                              handleUpdateField(selectedFieldKey, { height: newH });
                            }
                          }}
                          className="w-full accent-sky-600"
                        />
                      </div>

                      <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer pt-0.5">
                        <input
                          type="checkbox"
                          checked={lockAspect}
                          onChange={(e) => setLockAspect(e.target.checked)}
                          className="rounded text-sky-600"
                        />
                        <span>คงสัดส่วนรูปถ่าย (Lock Aspect Ratio 3:4)</span>
                      </label>
                    </div>
                  ) : (
                    /* --- B. TEXT & GROUP FIELD STYLE CONTROLS --- */
                    <>
                      {/* 1. Name Group Controls */}
                      {currentPositions[selectedFieldKey]?.type === 'nameGroup' && (
                        <div className="space-y-3 p-3 bg-sky-50/70 rounded-xl border border-sky-200">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sky-950 text-xs flex items-center gap-1.5">
                              <User className="w-4 h-4 text-sky-600" />
                              <span>จัดกลุ่มชื่อ - นามสกุล (แนวระดับเดียวกัน)</span>
                            </span>
                            <span className="font-mono text-xs text-sky-700 font-bold bg-white px-2 py-0.5 rounded border border-sky-200">
                              ห่าง +{currentPositions[selectedFieldKey]?.lastNameOffsetPx || 235}px
                            </span>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>ระยะห่างตำแหน่งนามสกุล (Last Name Offset):</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateField(selectedFieldKey, { 
                                    lastNameOffsetPx: Math.max(20, (currentPositions[selectedFieldKey]?.lastNameOffsetPx || 235) - 5) 
                                  })}
                                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold hover:bg-slate-100 cursor-pointer"
                                >
                                  -5px
                                </button>
                                <span className="font-mono font-bold text-slate-800">{currentPositions[selectedFieldKey]?.lastNameOffsetPx || 235} px</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateField(selectedFieldKey, { 
                                    lastNameOffsetPx: Math.min(600, (currentPositions[selectedFieldKey]?.lastNameOffsetPx || 235) + 5) 
                                  })}
                                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold hover:bg-slate-100 cursor-pointer"
                                >
                                  +5px
                                </button>
                              </div>
                            </div>
                            <input
                              type="range"
                              min="40"
                              max="500"
                              value={currentPositions[selectedFieldKey]?.lastNameOffsetPx || 235}
                              onChange={(e) => handleUpdateField(selectedFieldKey, { lastNameOffsetPx: parseInt(e.target.value) })}
                              className="w-full accent-sky-600"
                            />
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              * ขยับตำแหน่งนามสกุลให้ตรงช่องเส้นประ โดยระดับความสูง (แนว Y) จะตรงกับชื่อเสมอ
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 2. Date Group Controls */}
                      {currentPositions[selectedFieldKey]?.type === 'dateGroup' && (
                        <div className="space-y-3.5 p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-emerald-600" />
                              <span>จัดกลุ่มวันที่ (วัน / เดือน / พ.ศ. แนวเดียวกัน)</span>
                            </span>
                            <span className="font-mono text-[11px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
                              ด: +{currentPositions[selectedFieldKey]?.monthOffsetPx || 60}px | ปี: +{currentPositions[selectedFieldKey]?.yearOffsetPx || 130}px
                            </span>
                          </div>

                          {/* Quick Year Format Selector (2-digit vs 4-digit) */}
                          <div className="p-2.5 bg-white rounded-lg border border-emerald-200 space-y-2.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                                <span>🗓️ รูปแบบปี พ.ศ.:</span>
                              </label>
                              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                {currentPositions[selectedFieldKey]?.yearFormat === '2digit' || (currentPositions[selectedFieldKey]?.customYear && currentPositions[selectedFieldKey]?.customYear.length <= 2) ? 'พ.ศ. 2 หลัก (เช่น 69)' : 'พ.ศ. 4 หลัก (เช่น 2569)'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const curYear = currentPositions[selectedFieldKey]?.customYear || '';
                                  const newYear = curYear.length === 4 ? curYear.slice(-2) : (curYear || '69');
                                  handleUpdateField(selectedFieldKey, { 
                                    yearFormat: '2digit',
                                    customYear: newYear
                                  });
                                  showToast(`เปลี่ยนปี พ.ศ. เป็น 2 หลัก (${newYear}) เรียบร้อยแล้ว`);
                                }}
                                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                                  currentPositions[selectedFieldKey]?.yearFormat === '2digit' || (currentPositions[selectedFieldKey]?.customYear && currentPositions[selectedFieldKey]?.customYear.length <= 2)
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-1 ring-emerald-400'
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                <span>พ.ศ. 2 หลัก (เช่น 69)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const curYear = currentPositions[selectedFieldKey]?.customYear || '';
                                  const newYear = curYear.length === 2 ? `25${curYear}` : (curYear || '2569');
                                  handleUpdateField(selectedFieldKey, { 
                                    yearFormat: '4digit',
                                    customYear: newYear
                                  });
                                  showToast(`เปลี่ยนปี พ.ศ. เป็น 4 หลัก (${newYear}) เรียบร้อยแล้ว`);
                                }}
                                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                                  currentPositions[selectedFieldKey]?.yearFormat !== '2digit' && (!currentPositions[selectedFieldKey]?.customYear || currentPositions[selectedFieldKey]?.customYear.length > 2)
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-1 ring-emerald-400'
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                <span>พ.ศ. 4 หลัก (เช่น 2569)</span>
                              </button>
                            </div>

                            {/* Direct Year / Month / Day Value Inputs */}
                            <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-600 font-medium block mb-0.5">วัน (Day):</label>
                                <input
                                  type="text"
                                  value={currentPositions[selectedFieldKey]?.customDay !== undefined ? currentPositions[selectedFieldKey].customDay : ''}
                                  placeholder="เช่น 10"
                                  onChange={(e) => handleUpdateField(selectedFieldKey, { customDay: e.target.value })}
                                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono font-bold bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-600 font-medium block mb-0.5">เดือน (Month):</label>
                                <input
                                  type="text"
                                  value={currentPositions[selectedFieldKey]?.customMonth !== undefined ? currentPositions[selectedFieldKey].customMonth : ''}
                                  placeholder="เช่น 05"
                                  onChange={(e) => handleUpdateField(selectedFieldKey, { customMonth: e.target.value })}
                                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono font-bold bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-emerald-800 font-bold block mb-0.5">ปี พ.ศ. (Year):</label>
                                <input
                                  type="text"
                                  value={currentPositions[selectedFieldKey]?.customYear !== undefined ? currentPositions[selectedFieldKey].customYear : (currentPositions[selectedFieldKey]?.yearFormat === '2digit' ? '69' : '')}
                                  placeholder="เช่น 69 หรือ 2569"
                                  onChange={(e) => handleUpdateField(selectedFieldKey, { customYear: e.target.value })}
                                  className="w-full px-2 py-1 text-xs border-2 border-emerald-500 rounded font-mono font-bold bg-emerald-50/50 focus:bg-white text-emerald-900 focus:ring-1 focus:ring-emerald-500 outline-none"
                                />
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight">
                              💡 สามารถพิมพ์แก้ไขปี พ.ศ. เป็น <strong>69</strong> หรือเลขใดๆ ได้โดยตรง ข้อมูลบนกระดาษจะเปลี่ยนทันที
                            </p>
                          </div>

                          {/* Month Offset */}
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>ระยะห่างตำแหน่ง เดือน:</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateField(selectedFieldKey, { 
                                    monthOffsetPx: Math.max(10, (currentPositions[selectedFieldKey]?.monthOffsetPx || 60) - 5) 
                                  })}
                                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold hover:bg-slate-100 cursor-pointer"
                                >
                                  -5px
                                </button>
                                <span className="font-mono font-bold text-slate-800">{currentPositions[selectedFieldKey]?.monthOffsetPx || 60} px</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateField(selectedFieldKey, { 
                                    monthOffsetPx: Math.min(400, (currentPositions[selectedFieldKey]?.monthOffsetPx || 60) + 5) 
                                  })}
                                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold hover:bg-slate-100 cursor-pointer"
                                >
                                  +5px
                                </button>
                              </div>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="350"
                              value={currentPositions[selectedFieldKey]?.monthOffsetPx || 60}
                              onChange={(e) => handleUpdateField(selectedFieldKey, { monthOffsetPx: parseInt(e.target.value) })}
                              className="w-full accent-emerald-600"
                            />
                          </div>

                          {/* Year Offset */}
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>ระยะห่างตำแหน่ง พ.ศ. / ปี:</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateField(selectedFieldKey, { 
                                    yearOffsetPx: Math.max(20, (currentPositions[selectedFieldKey]?.yearOffsetPx || 130) - 5) 
                                  })}
                                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold hover:bg-slate-100 cursor-pointer"
                                >
                                  -5px
                                </button>
                                <span className="font-mono font-bold text-slate-800">{currentPositions[selectedFieldKey]?.yearOffsetPx || 130} px</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateField(selectedFieldKey, { 
                                    yearOffsetPx: Math.min(600, (currentPositions[selectedFieldKey]?.yearOffsetPx || 130) + 5) 
                                  })}
                                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold hover:bg-slate-100 cursor-pointer"
                                >
                                  +5px
                                </button>
                              </div>
                            </div>
                            <input
                              type="range"
                              min="30"
                              max="500"
                              value={currentPositions[selectedFieldKey]?.yearOffsetPx || 130}
                              onChange={(e) => handleUpdateField(selectedFieldKey, { yearOffsetPx: parseInt(e.target.value) })}
                              className="w-full accent-emerald-600"
                            />
                          </div>
                        </div>
                      )}

                      {/* 3. Thai Citizen ID 13 Boxes Controls */}
                      {currentPositions[selectedFieldKey]?.type === 'citizenIdBoxes' && (
                        <div className="space-y-3 p-3 bg-purple-50/70 rounded-xl border border-purple-200">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                              <Layers className="w-4 h-4 text-purple-600" />
                              <span>จัดกลุ่มเลขบัตร ปชช. 13 หลัก (ลงช่องตาราง)</span>
                            </span>
                            <span className="font-mono text-xs text-purple-800 font-bold bg-white px-2 py-0.5 rounded border border-purple-200">
                              Pitch: {currentPositions[selectedFieldKey]?.pitch || 19.5}px
                            </span>
                          </div>

                          {/* Pitch Slider (spacing between boxes) */}
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>ระยะห่างระหว่างช่อง (Box Pitch):</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateField(selectedFieldKey, { 
                                    pitch: Math.max(10, parseFloat(((currentPositions[selectedFieldKey]?.pitch || 19.5) - 0.5).toFixed(1))) 
                                  })}
                                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold hover:bg-slate-100 cursor-pointer"
                                >
                                  -0.5
                                </button>
                                <span className="font-mono font-bold text-slate-800">{currentPositions[selectedFieldKey]?.pitch || 19.5} px</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateField(selectedFieldKey, { 
                                    pitch: Math.min(40, parseFloat(((currentPositions[selectedFieldKey]?.pitch || 19.5) + 0.5).toFixed(1))) 
                                  })}
                                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold hover:bg-slate-100 cursor-pointer"
                                >
                                  +0.5
                                </button>
                              </div>
                            </div>
                            <input
                              type="range"
                              min="12"
                              max="35"
                              step="0.2"
                              value={currentPositions[selectedFieldKey]?.pitch || 19.5}
                              onChange={(e) => handleUpdateField(selectedFieldKey, { pitch: parseFloat(e.target.value) })}
                              className="w-full accent-purple-600"
                            />
                          </div>

                          {/* Thai ID Group Gap Slider (1-4-5-2-1 pattern) */}
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>ช่องว่างระหว่างกลุ่ม (1-4-5-2-1):</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateField(selectedFieldKey, { 
                                    groupGap: Math.max(0, parseFloat(((currentPositions[selectedFieldKey]?.groupGap !== undefined ? currentPositions[selectedFieldKey].groupGap : 7.5) - 0.5).toFixed(1))) 
                                  })}
                                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold hover:bg-slate-100 cursor-pointer"
                                >
                                  -0.5
                                </button>
                                <span className="font-mono font-bold text-slate-800">{currentPositions[selectedFieldKey]?.groupGap !== undefined ? currentPositions[selectedFieldKey].groupGap : 7.5} px</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateField(selectedFieldKey, { 
                                    groupGap: Math.min(25, parseFloat(((currentPositions[selectedFieldKey]?.groupGap !== undefined ? currentPositions[selectedFieldKey].groupGap : 7.5) + 0.5).toFixed(1))) 
                                  })}
                                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold hover:bg-slate-100 cursor-pointer"
                                >
                                  +0.5
                                </button>
                              </div>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="25"
                              step="0.5"
                              value={currentPositions[selectedFieldKey]?.groupGap !== undefined ? currentPositions[selectedFieldKey].groupGap : 7.5}
                              onChange={(e) => handleUpdateField(selectedFieldKey, { groupGap: parseFloat(e.target.value) })}
                              className="w-full accent-purple-600"
                            />
                          </div>

                          {/* Interactive 13 Digits Strip */}
                          <div className="pt-1">
                            <div className="flex justify-between items-center text-[11px] text-slate-600 mb-1.5">
                              <span>คลิกเลือกหลักที่ต้องการเลื่อนละเอียด:</span>
                              <span className="font-bold text-purple-700">หลักที่ {selectedDigitIdx + 1}</span>
                            </div>
                            <div className="flex items-center gap-1 overflow-x-auto pb-1">
                              {(activeMember.citizenId || '1909900123451').slice(0, 13).split('').map((char, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setSelectedDigitIdx(i)}
                                  className={`w-6 h-7 rounded border font-mono font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                                    selectedDigitIdx === i
                                      ? 'bg-purple-600 text-white border-purple-700 shadow-xs scale-105'
                                      : 'bg-white hover:bg-purple-100 text-slate-800 border-slate-300'
                                  }`}
                                >
                                  {char}
                                </button>
                              ))}
                            </div>

                            {/* Nudge specific selected digit */}
                            <div className="mt-2 p-2 bg-white rounded-lg border border-purple-200 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-medium text-slate-700">
                                  ขยับเฉพาะหลักที่ {selectedDigitIdx + 1} (ค่า: {(activeMember.citizenId || '1909900123451')[selectedDigitIdx]}):
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentOffsets = { ...(currentPositions[selectedFieldKey]?.digitOffsets || {}) };
                                      currentOffsets[selectedDigitIdx] = (currentOffsets[selectedDigitIdx] || 0) - 1;
                                      handleUpdateField(selectedFieldKey, { digitOffsets: currentOffsets });
                                    }}
                                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    -1px
                                  </button>
                                  <span className="font-mono font-bold text-purple-700">
                                    {((currentPositions[selectedFieldKey]?.digitOffsets || {})[selectedDigitIdx] || 0) > 0 ? '+' : ''}
                                    {((currentPositions[selectedFieldKey]?.digitOffsets || {})[selectedDigitIdx] || 0)} px
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentOffsets = { ...(currentPositions[selectedFieldKey]?.digitOffsets || {}) };
                                      currentOffsets[selectedDigitIdx] = (currentOffsets[selectedDigitIdx] || 0) + 1;
                                      handleUpdateField(selectedFieldKey, { digitOffsets: currentOffsets });
                                    }}
                                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    +1px
                                  </button>
                                  {((currentPositions[selectedFieldKey]?.digitOffsets || {})[selectedDigitIdx] || 0) !== 0 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentOffsets = { ...(currentPositions[selectedFieldKey]?.digitOffsets || {}) };
                                        delete currentOffsets[selectedDigitIdx];
                                        handleUpdateField(selectedFieldKey, { digitOffsets: currentOffsets });
                                      }}
                                      className="text-[10px] text-rose-600 hover:underline ml-1 cursor-pointer"
                                    >
                                      รีเซ็ต
                                    </button>
                                  )}
                                </div>
                              </div>
                              <input
                                type="range"
                                min="-20"
                                max="20"
                                value={((currentPositions[selectedFieldKey]?.digitOffsets || {})[selectedDigitIdx] || 0)}
                                onChange={(e) => {
                                  const currentOffsets = { ...(currentPositions[selectedFieldKey]?.digitOffsets || {}) };
                                  currentOffsets[selectedDigitIdx] = parseInt(e.target.value);
                                  handleUpdateField(selectedFieldKey, { digitOffsets: currentOffsets });
                                }}
                                className="w-full accent-purple-600"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4. Simple Digit Boxes (Postal Code, Member ID) Controls */}
                      {currentPositions[selectedFieldKey]?.type === 'simpleDigitBoxes' && (
                        <div className="space-y-3 p-3 bg-purple-50/70 rounded-xl border border-purple-200">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                              <Layers className="w-4 h-4 text-purple-600" />
                              <span>จัดกลุ่มตัวเลขแยกช่องตาราง (Pitch & Box)</span>
                            </span>
                            <span className="font-mono text-xs text-purple-800 font-bold bg-white px-2 py-0.5 rounded border border-purple-200">
                              Pitch: {currentPositions[selectedFieldKey]?.pitch || 17.5}px
                            </span>
                          </div>

                          {/* Pitch Slider */}
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>ระยะห่างระหว่างช่อง (Box Pitch):</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateField(selectedFieldKey, { 
                                    pitch: Math.max(10, parseFloat(((currentPositions[selectedFieldKey]?.pitch || 17.5) - 0.5).toFixed(1))) 
                                  })}
                                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold hover:bg-slate-100 cursor-pointer"
                                >
                                  -0.5
                                </button>
                                <span className="font-mono font-bold text-slate-800">{currentPositions[selectedFieldKey]?.pitch || 17.5} px</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateField(selectedFieldKey, { 
                                    pitch: Math.min(35, parseFloat(((currentPositions[selectedFieldKey]?.pitch || 17.5) + 0.5).toFixed(1))) 
                                  })}
                                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold hover:bg-slate-100 cursor-pointer"
                                >
                                  +0.5
                                </button>
                              </div>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="35"
                              step="0.2"
                              value={currentPositions[selectedFieldKey]?.pitch || 17.5}
                              onChange={(e) => handleUpdateField(selectedFieldKey, { pitch: parseFloat(e.target.value) })}
                              className="w-full accent-purple-600"
                            />
                          </div>

                          {/* Digits Strip */}
                          <div className="pt-1">
                            <div className="flex justify-between items-center text-[11px] text-slate-600 mb-1.5">
                              <span>คลิกเลือกหลักที่ต้องการเลื่อนละเอียด:</span>
                              <span className="font-bold text-purple-700">หลักที่ {selectedDigitIdx + 1}</span>
                            </div>
                            <div className="flex items-center gap-1 overflow-x-auto pb-1">
                              {(selectedFieldKey === 'postalCodeBoxes' ? activePostalCode : effectiveMemberId).split('').map((char, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setSelectedDigitIdx(i)}
                                  className={`w-6 h-7 rounded border font-mono font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                                    selectedDigitIdx === i
                                      ? 'bg-purple-600 text-white border-purple-700 shadow-xs scale-105'
                                      : 'bg-white hover:bg-purple-100 text-slate-800 border-slate-300'
                                  }`}
                                >
                                  {char}
                                </button>
                              ))}
                            </div>

                            {/* Nudge specific selected digit */}
                            <div className="mt-2 p-2 bg-white rounded-lg border border-purple-200 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-medium text-slate-700">
                                  ขยับเฉพาะหลักที่ {selectedDigitIdx + 1}:
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentOffsets = { ...(currentPositions[selectedFieldKey]?.digitOffsets || {}) };
                                      currentOffsets[selectedDigitIdx] = (currentOffsets[selectedDigitIdx] || 0) - 1;
                                      handleUpdateField(selectedFieldKey, { digitOffsets: currentOffsets });
                                    }}
                                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    -1px
                                  </button>
                                  <span className="font-mono font-bold text-purple-700">
                                    {((currentPositions[selectedFieldKey]?.digitOffsets || {})[selectedDigitIdx] || 0) > 0 ? '+' : ''}
                                    {((currentPositions[selectedFieldKey]?.digitOffsets || {})[selectedDigitIdx] || 0)} px
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentOffsets = { ...(currentPositions[selectedFieldKey]?.digitOffsets || {}) };
                                      currentOffsets[selectedDigitIdx] = (currentOffsets[selectedDigitIdx] || 0) + 1;
                                      handleUpdateField(selectedFieldKey, { digitOffsets: currentOffsets });
                                    }}
                                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    +1px
                                  </button>
                                  {((currentPositions[selectedFieldKey]?.digitOffsets || {})[selectedDigitIdx] || 0) !== 0 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentOffsets = { ...(currentPositions[selectedFieldKey]?.digitOffsets || {}) };
                                        delete currentOffsets[selectedDigitIdx];
                                        handleUpdateField(selectedFieldKey, { digitOffsets: currentOffsets });
                                      }}
                                      className="text-[10px] text-rose-600 hover:underline ml-1 cursor-pointer"
                                    >
                                      รีเซ็ต
                                    </button>
                                  )}
                                </div>
                              </div>
                              <input
                                type="range"
                                min="-20"
                                max="20"
                                value={((currentPositions[selectedFieldKey]?.digitOffsets || {})[selectedDigitIdx] || 0)}
                                onChange={(e) => {
                                  const currentOffsets = { ...(currentPositions[selectedFieldKey]?.digitOffsets || {}) };
                                  currentOffsets[selectedDigitIdx] = parseInt(e.target.value);
                                  handleUpdateField(selectedFieldKey, { digitOffsets: currentOffsets });
                                }}
                                className="w-full accent-purple-600"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Receipt Fee Tier & Amount Controls (4 Tiers) */}
                      {activeDocType === 'receipt' && ['memberFeeTypeCheck', 'memberFeeAmount', 'totalAmountNumber', 'totalAmountText'].includes(selectedFieldKey) && (
                        <div className="space-y-3 p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                              <Receipt className="w-4 h-4 text-amber-600" />
                              <span>อัตราค่าบำรุงสมาชิก & ประเภทในใบเสร็จ (4 รูปแบบ)</span>
                            </span>
                            <span className="font-mono text-[11px] text-amber-800 font-bold bg-white px-2 py-0.5 rounded border border-amber-200 shadow-2xs">
                              {activeReceiptTier.feeAmount > 0 ? `${activeReceiptTier.feeFormatted} บาท` : 'ไม่ต้องชำระ'}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-tight">
                            ข้อมูลสมาชิกปัจจุบัน: <strong>{activeMember.fullName}</strong> ({activeMember.memberType || 'สมาชิกสามัญ 5 ปี'})
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            {Object.values(RECEIPT_TIERS).map((t) => {
                              const isActive = activeReceiptTierKey === t.id;
                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => handleSetReceiptTier(t.id)}
                                  className={`p-2 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                                    isActive
                                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs ring-1 ring-amber-400'
                                      : 'bg-white hover:bg-amber-100/70 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  <span className="truncate w-full text-center">{t.label}</span>
                                  <span className={`text-[10px] ${isActive ? 'text-amber-100 font-normal' : 'text-slate-500'}`}>
                                    {t.feeAmount > 0 ? `${t.feeFormatted} บาท` : t.subLabel}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="pt-2 border-t border-amber-200/60 text-[11px] text-slate-600 space-y-1">
                            <div className="flex justify-between">
                              <span>ยอดตัวเลข:</span>
                              <span className="font-bold font-mono text-amber-900">
                                {activeReceiptTier.feeAmount > 0 ? `${activeReceiptTier.feeFormatted} บาท` : '0 บาท'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>ตัวอักษรไทย:</span>
                              <span className="font-bold text-amber-900">{activeReceiptTier.feeText}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                              <span>ตำแหน่งติ๊กถูก (✓) & ยอดเงิน:</span>
                              <span className="font-mono">{activeReceiptTier.label} (Y: {receiptPositions.memberFeeTypeCheck?.y ?? activeReceiptTier.rowY}%)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Application Form Tier Controls (4 Tiers) */}
                      {activeDocType === 'application' && ['tierStandard5YCheck', 'tierMemberIdBoxes'].includes(selectedFieldKey) && (
                        <div className="space-y-3 p-3.5 bg-sky-50/80 rounded-xl border border-sky-200 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sky-950 text-xs flex items-center gap-1.5">
                              <CheckSquare className="w-4 h-4 text-sky-600" />
                              <span>ประเภทสมาชิกในใบสมัคร (แถว 1-4)</span>
                            </span>
                            <span className="font-mono text-[11px] text-sky-800 font-bold bg-white px-2 py-0.5 rounded border border-sky-200 shadow-2xs">
                              {activeAppTier.label}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-tight">
                            ข้อมูลสมาชิกปัจจุบัน: <strong>{activeMember.fullName}</strong> ({activeMember.memberType || 'สมาชิกสามัญ 5 ปี'})
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            {Object.values(APP_FORM_TIERS).map((t) => {
                              const isActive = activeAppTierKey === t.id;
                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => handleSetAppTier(t.id)}
                                  className={`p-2 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                                    isActive
                                      ? 'bg-sky-600 text-white border-sky-700 shadow-xs ring-1 ring-sky-400'
                                      : 'bg-white hover:bg-sky-100/70 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  <span className="truncate w-full text-center">{t.label}</span>
                                  <span className={`text-[10px] ${isActive ? 'text-sky-100 font-normal' : 'text-slate-500'}`}>
                                    {t.subLabel}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="pt-2 border-t border-sky-200/60 text-[11px] text-slate-600 space-y-1">
                            <div className="flex justify-between">
                              <span>ตำแหน่งติ๊กถูก (✓) & ช่องเลขสมาชิก:</span>
                              <span className="font-bold font-mono text-sky-900">{activeAppTier.label} (Y: {appPositions.tierStandard5YCheck?.y ?? activeAppTier.rowY}%)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>วันสิ้นสุดการเป็นสมาชิก:</span>
                              <span className="font-bold text-sky-900">
                                {activeAppTierKey === 'lifetime' ? 'ตลอดชีพ' : activeAppTierKey === 'honorary' ? 'กิตติมศักดิ์' : activeAppTierKey === 'radioOrg' ? 'ตลอดการดำเนินงาน' : (activeMember.endDate || '15-11-2574')}
                              </span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                              <span>ค่าบำรุงที่เจ้าหน้าที่บันทึก:</span>
                              <span className="font-mono">
                                {activeAppTierKey === 'lifetime' ? '2,500 บาท' : activeAppTierKey === 'fiveYear' ? '500 บาท' : '0 บาท (ไม่ต้องชำระ)'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Font Size */}
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span>ขนาดตัวอักษร (Font Size):</span>
                          <strong className="font-mono">{currentPositions[selectedFieldKey].fontSize} px</strong>
                        </div>
                        <input
                          type="range"
                          min="9"
                          max="36"
                          value={currentPositions[selectedFieldKey].fontSize || 14}
                          onChange={(e) => handleUpdateField(selectedFieldKey, { fontSize: parseInt(e.target.value) })}
                          className="w-full accent-sky-600"
                        />
                      </div>

                      {/* Optional letter spacing for standard single-text fields if any */}
                      {!['nameGroup', 'dateGroup', 'citizenIdBoxes', 'simpleDigitBoxes'].includes(currentPositions[selectedFieldKey]?.type) && (
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                            <span>ระยะห่างตัวอักษร (Letter Spacing):</span>
                            <strong className="font-mono">{currentPositions[selectedFieldKey].letterSpacing || 0} px</strong>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="35"
                            step="0.5"
                            value={currentPositions[selectedFieldKey].letterSpacing || 0}
                            onChange={(e) => handleUpdateField(selectedFieldKey, { letterSpacing: parseFloat(e.target.value) })}
                            className="w-full accent-emerald-600"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={currentPositions[selectedFieldKey].bold || false}
                            onChange={(e) => handleUpdateField(selectedFieldKey, { bold: e.target.checked })}
                            className="rounded text-sky-600"
                          />
                          <span>ตัวหนา (Bold)</span>
                        </label>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500">สีข้อความ:</span>
                          <input
                            type="color"
                            value={currentPositions[selectedFieldKey].color || '#0f172a'}
                            onChange={(e) => handleUpdateField(selectedFieldKey, { color: e.target.value })}
                            className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Background Template Opacity */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <span>ความเข้มแม่แบบกระดาษ (Opacity):</span>
                  <strong className="font-mono">{bgOpacity}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bgOpacity}
                  onChange={(e) => setBgOpacity(parseInt(e.target.value))}
                  className="w-full accent-slate-800"
                />
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Document Export & Share to LINE Modal */}
      <DocumentExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        imageUri={exportedImageUri}
        isGenerating={isExporting}
        docTitle={getExportDocInfo().title}
        docDate={getExportDocInfo().date}
        memberName={getExportDocInfo().memberName}
        memberCallsign={getExportDocInfo().memberCallsign}
        fileName={`${activeDocType}_${getExportDocInfo().memberCallsign || 'HS9AS'}_${Date.now()}.png`}
        onDirectPrint={() => window.print()}
        onRetry={handleExportDocument}
      />

      {/* Sequence Settings Modal (Member ID & Receipt Auto-Rollover) */}
      <SequenceSettingsModal
        isOpen={isSequenceModalOpen}
        onClose={() => setIsSequenceModalOpen(false)}
        onSaveSuccess={() => {
          setReceiptSeqInfo(getCurrentReceiptInfo());
          setMemberSeqConfig(getMemberSequenceConfig());
          showToast('บันทึกการตั้งค่าระบบรันตัวเลขและตัดเล่มเรียบร้อยแล้ว!');
        }}
      />

      {/* Admin PIN Confirmation Modal for Cross-Device Central Layout Persistence */}
      <AdminPinConfirmModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        onConfirm={handleConfirmAdminPin}
        docTypeName={
          activeDocType === 'receipt' 
            ? 'ใบเสร็จรับเงิน (ทุกลำดับประเภท)' 
            : (activeDocType === 'application' ? 'ใบสมัครสมาชิก (ทุกลำดับประเภท)' : 'หนังสือรับรองสมาคม')
        }
        currentUser={currentUser}
      />

      {/* Developer Credit Signature Line */}
      <DeveloperCredit variant="light" />

    </div>
  );
}
