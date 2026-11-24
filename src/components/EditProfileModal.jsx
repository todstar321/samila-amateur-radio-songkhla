import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Save, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Cpu,
  Trash2,
  UploadCloud,
  FileCheck
} from 'lucide-react';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from '../utils/cloudinaryUtils';

/**
 * Compresses an image file client-side to ensure it does not exceed maxKb (default: 25 KB)
 */
export async function compressAvatarImage(file, maxKb = 25, maxWidth = 320, maxHeight = 320) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth || h > maxHeight) {
          if (w > h) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          } else {
            w = Math.round((w * maxHeight) / h);
            h = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        let quality = 0.75;
        const tryExport = (q) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Canvas to blob conversion failed'));
              return;
            }
            const sizeKb = blob.size / 1024;
            if (sizeKb <= maxKb || q <= 0.3) {
              const r = new FileReader();
              r.onloadend = () => {
                resolve({
                  blob,
                  dataUrl: r.result,
                  sizeKb: Math.round(sizeKb * 10) / 10,
                  width: w,
                  height: h
                });
              };
              r.readAsDataURL(blob);
            } else {
              tryExport(Math.max(0.25, Number((q - 0.12).toFixed(2))));
            }
          }, 'image/jpeg', q);
        };

        tryExport(quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * EditProfileModal
 * Allows any logged-in member to update their profile info and upload a compressed avatar (<= 25 KB).
 * Automatically cleans up old Cloudinary avatar to free storage.
 */
export default function EditProfileModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onSaveProfile 
}) {
  if (!isOpen || !currentUser) return null;

  // Form states initialized with currentUser data
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [nickname, setNickname] = useState(currentUser.nickname || '');
  const [callsign, setCallsign] = useState(currentUser.callsign || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [lineId, setLineId] = useState(currentUser.lineId || '');
  const [currentAddress, setCurrentAddress] = useState(currentUser.currentAddress || currentUser.registeredAddress || '');
  const [postalCode, setPostalCode] = useState(currentUser.postalCode || '');
  const [district, setDistrict] = useState(currentUser.district || 'หาดใหญ่');

  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar || '');
  const [avatarBlob, setAvatarBlob] = useState(null);
  const [avatarSizeKb, setAvatarSizeKb] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  // Handle Photo Select from phone/computer
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setIsCompressing(true);

    try {
      // Compress to max 25 KB
      const result = await compressAvatarImage(file, 25, 300, 300);
      setAvatarPreview(result.dataUrl);
      setAvatarBlob(result.blob);
      setAvatarSizeKb(result.sizeKb);
    } catch (err) {
      console.error('Image compression error:', err);
      setErrorMessage('ไม่สามารถประมวลผลรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  // Handle Save Profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('กรุณาระบุชื่อ-นามสกุล');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('กรุณาระบุเบอร์โทรศัพท์');
      return;
    }

    setIsSaving(true);

    try {
      let finalAvatarUrl = currentUser.avatar || '';
      let newPublicId = currentUser.avatarPublicId || '';

      // If user uploaded a new avatar
      if (avatarBlob) {
        // 1. Delete previous avatar from Cloudinary if it was hosted on Cloudinary
        const oldPublicId = currentUser.avatarPublicId || extractPublicIdFromUrl(currentUser.avatar);
        if (oldPublicId) {
          deleteFromCloudinary(oldPublicId).catch(err => {
            console.warn('[EditProfile] Could not delete old avatar:', err);
          });
        }

        // 2. Upload compressed avatar (<= 25 KB) to Cloudinary
        const uploadedUrl = await uploadToCloudinary(avatarBlob, { folder: 'samila_hs9as_avatars' });
        if (uploadedUrl && typeof uploadedUrl === 'string' && uploadedUrl.startsWith('http')) {
          finalAvatarUrl = uploadedUrl;
          newPublicId = extractPublicIdFromUrl(uploadedUrl) || '';
        } else if (avatarPreview) {
          finalAvatarUrl = avatarPreview;
        }
      }

      // Build updated member object
      const updatedMember = {
        ...currentUser,
        fullName: fullName.trim(),
        nickname: nickname.trim(),
        callsign: callsign.trim() || currentUser.callsign || '-',
        phone: phone.trim(),
        email: email.trim(),
        lineId: lineId.trim(),
        currentAddress: currentAddress.trim(),
        postalCode: postalCode.trim(),
        district: district.trim(),
        avatar: finalAvatarUrl,
        avatarPublicId: newPublicId,
        avatarUpdatedAt: new Date().toISOString()
      };

      setSaveSuccess(true);
      await onSaveProfile(updatedMember);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 700);

    } catch (err) {
      console.error('Profile save error:', err);
      setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 pt-[max(calc(env(safe-area-inset-top,0px)+12px),24px)] pb-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ================= MODAL HEADER ================= */}
        <div className="bg-gradient-to-r from-[#012a4a] via-[#01497c] to-[#013a63] text-white p-4 sm:p-5 relative border-b border-cyan-400/40 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="ปิดหน้าต่าง (X)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/20 border border-cyan-300/40 flex items-center justify-center text-cyan-200 shrink-0 shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0 pr-8">
              <h3 className="font-bold text-base sm:text-lg text-white leading-tight">
                แก้ไขข้อมูลส่วนตัว / โปรไฟล์สมาชิก
              </h3>
              <p className="text-[11px] text-sky-200 font-mono mt-0.5">
                {currentUser.memberId ? `รหัสสมาชิก #${currentUser.memberId}` : 'สมาคมวิทยุสมัครเล่นสมิหลา'} • {currentUser.callsign || 'HS9AS'}
              </p>
            </div>
          </div>
        </div>

        {/* ================= FORM BODY (SCROLLABLE) ================= */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ================= 1. AVATAR UPLOAD & COMPRESSION CARD ================= */}
          <div className="bg-gradient-to-br from-slate-50 to-sky-50/50 p-4 rounded-2xl border border-sky-100 space-y-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-sky-600" />
              <span>รูปถ่ายประจำตัว / ภาพโปรไฟล์</span>
            </span>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              
              {/* Photo Preview */}
              <div 
                className="relative group cursor-pointer shrink-0"
                onClick={() => fileInputRef.current?.click()}
                title="คลิกเพื่อเลือกภาพใหม่จากมือถือหรือคอมพิวเตอร์"
              >
                <img
                  src={avatarPreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                  alt="Avatar"
                  className="w-24 h-28 object-cover rounded-2xl border-2 border-sky-400 shadow-md bg-white transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-2xl bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-semibold gap-1">
                  <Camera className="w-4 h-4" />
                  <span>เปลี่ยนรูป</span>
                </div>
              </div>

              {/* Upload Controls & Compression Info */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/png,image/jpeg,image/jpg,image/webp" 
                  onChange={handlePhotoSelect} 
                  className="hidden" 
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold rounded-xl text-xs shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isCompressing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>กำลังบีบอัดรูปภาพ...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      <span>📱 ถ่ายภาพ / เลือกรูปใหม่จากเครื่อง</span>
                    </>
                  )}
                </button>

                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <p className="flex items-center gap-1 text-emerald-700 font-semibold justify-center sm:justify-start">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ระบบบีบอัดภาพอัตโนมัติไม่เกิน 25 KB (ประหยัดพื้นที่คลังข้อมูล)</span>
                  </p>
                  <p className="text-slate-400">
                    💡 เมื่อบันทึกภาพใหม่ ระบบจะลบรูปเก่าในคลัง Cloudinary ออกให้อัตโนมัติ
                  </p>
                  {avatarSizeKb && (
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10.5px] font-bold">
                      ขนาดภาพที่บีบอัดแล้ว: {avatarSizeKb} KB
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ================= 2. MEMBER DETAILS INPUTS ================= */}
          <div className="space-y-3.5">
            <span className="text-xs font-bold text-slate-700 block border-b border-slate-200 pb-1.5">
              ข้อมูลส่วนบุคคลและข้อมูลการติดต่อ
            </span>

            {/* Name & Nickname */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">ชื่อ-นามสกุล (ภาษาไทย) *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="เช่น ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">ชื่อเล่น (ถ้ามี)</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="เช่น ผอ.โต๊ด"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Callsign & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">สัญญาณเรียกขาน (Callsign)</label>
                <input
                  type="text"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                  placeholder="เช่น E26ECG (ถ้าไม่มีใส่ -)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-amber-600 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">เบอร์โทรศัพท์ติดต่อ *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="เช่น 093-792-5665"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* LINE ID & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">LINE ID</label>
                <input
                  type="text"
                  value={lineId}
                  onChange={(e) => setLineId(e.target.value)}
                  placeholder="เช่น E26ECG"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">E-MAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Address & Postal Code */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">ที่อยู่ปัจจุบันที่สามารถติดต่อได้</label>
              <textarea
                rows={2}
                value={currentAddress}
                onChange={(e) => setCurrentAddress(e.target.value)}
                placeholder="บ้านเลขที่ หมู่ที่ ถนน ตำบล..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            {/* District & Postal Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">อำเภอ / พื้นที่สแตนด์บาย (QTH)</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="เช่น หาดใหญ่, เมืองสงขลา"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">รหัสไปรษณีย์</label>
                <input
                  type="text"
                  maxLength={5}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="เช่น 90110"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

          </div>

          {/* ================= 3. SYSTEM IDENTIFIERS (READ ONLY) ================= */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              🔒 ข้อมูลประจำตัวในระบบ (ไม่สามารถแก้ไขได้โดยตรง)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11.5px]">
              <div>
                <span className="text-slate-400 block text-[10.5px]">รหัสสมาชิก:</span>
                <strong className="font-mono text-slate-800">#{currentUser.memberId || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10.5px]">สถานะสมาชิก:</span>
                <span className="font-semibold text-emerald-700">{currentUser.status || 'อนุมัติแล้ว'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10.5px]">รหัสเครือข่าย DE:</span>
                <strong className="font-mono text-cyan-700">{currentUser.deNetworkCode || '-'}</strong>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
              * กรณีต้องการเปลี่ยนแปลงเลขบัตรประชาชน หรือประเภทสมาชิก กรุณาติดต่อฝ่ายนายทะเบียนสมาคมฯ
            </p>
          </div>

          {/* ================= MODAL ACTIONS ================= */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="submit"
              disabled={isSaving || isCompressing}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>กำลังบันทึกข้อมูลและซิงก์สู่ระบบกลาง...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>บันทึกข้อมูลสำเร็จ!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>💾 บันทึกการเปลี่ยนแปลงข้อมูล</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer border border-slate-300"
            >
              ยกเลิก
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
