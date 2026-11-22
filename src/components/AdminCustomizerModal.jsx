import React, { useState } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Upload, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Sliders, 
  FileImage,
  ShieldCheck
} from 'lucide-react';
import { sampleBackgrounds, defaultSettings } from '../data/mockData';
import AssociationLogo from './AssociationLogo';
import DeveloperCredit from './DeveloperCredit';
import AdminPinConfirmModal from './AdminPinConfirmModal';

export default function AdminCustomizerModal({ 
  isOpen, 
  onClose, 
  settings, 
  onSaveSettings 
}) {
  const [formData, setFormData] = useState({
    heroBgUrl: settings.heroBgUrl || "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2000&q=80",
    customLogoUrl: settings.customLogoUrl || '',
    tagline: settings.tagline,
    officialCallsign: settings.officialCallsign,
    associationNameTh: settings.associationNameTh,
    opacity: settings.sectionThemes?.hero?.opacity ?? 85
  });

  const [activeTab, setActiveTab] = useState('background'); // 'background', 'logo', 'general'
  const [saveToast, setSaveToast] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  if (!isOpen) return null;

  // Handle local background image upload (DataURL)
  const handleBgFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          heroBgUrl: event.target?.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle local logo file upload (DataURL)
  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          customLogoUrl: event.target?.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetBg = (url) => {
    setFormData(prev => ({ ...prev, heroBgUrl: url }));
  };

  const handleResetDefaults = () => {
    if (window.confirm("คุณต้องการรีเซ็ตภาพพื้นหลังและโลโก้กลับเป็นค่าเริ่มต้นหรือไม่?")) {
      const reset = {
        heroBgUrl: defaultSettings.heroBgUrl,
        customLogoUrl: '',
        tagline: defaultSettings.tagline,
        officialCallsign: defaultSettings.officialCallsign,
        associationNameTh: defaultSettings.associationNameTh,
      };
      setFormData(reset);
      onSaveSettings(reset);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    // ต้องยืนยันรหัส PIN ของเจ้าของแอปพลิเคชัน (ผอ.โต๊ด • E26ECG) ก่อนบันทึกเสมอ
    setIsPinModalOpen(true);
  };

  const handlePinConfirmed = async (confirmedPin) => {
    onSaveSettings({
      ...settings,
      ...formData,
      heroBgUrl: formData.heroBgUrl,
      sectionThemes: {
        ...(settings.sectionThemes || {}),
        hero: {
          ...(settings.sectionThemes?.hero || {}),
          bgUrl: formData.heroBgUrl,
          opacity: formData.opacity ?? 85
        }
      }
    });
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 relative flex items-center justify-between border-b border-sky-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">แผงควบคุมผู้ดูแลระบบ (Admin)</h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-sky-200">ปรับเปลี่ยนภาพพื้นหลัง โลโก้ และข้อความหลักของเว็บไซต์</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('background')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'background'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>ภาพพื้นหลังเว็บไซต์ (Background)</span>
          </button>
          <button
            onClick={() => setActiveTab('logo')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logo'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileImage className="w-4 h-4" />
            <span>ตราสัญลักษณ์ / โลโก้ (Logo)</span>
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>ข้อความต้อนรับ & นามเรียกขาน</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          
          {/* TAB 1: BACKGROUND */}
          {activeTab === 'background' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  1. เลือกภาพพื้นหลังสวยงามที่เตรียมไว้ (Presets สำหรับสงขลาและวิทยุสื่อสาร):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                  {sampleBackgrounds.map((bg) => (
                    <div
                      key={bg.id}
                      onClick={() => handleSelectPresetBg(bg.url)}
                      className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition group h-28 ${
                        formData.heroBgUrl === bg.url
                          ? 'border-sky-600 ring-2 ring-sky-400'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img 
                        src={bg.url} 
                        alt={bg.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent p-2 flex flex-col justify-end">
                        <span className="text-[11px] font-medium text-white line-clamp-1">{bg.title}</span>
                      </div>
                      {formData.heroBgUrl === bg.url && (
                        <div className="absolute top-2 right-2 bg-sky-600 text-white rounded-full p-1 shadow">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload Local File or Enter URL */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  2. หรือ อัปโหลดภาพพื้นหลังของคุณเองจากเครื่อง:
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm">
                    <Upload className="w-4 h-4 text-sky-600" />
                    <span>เลือกไฟล์รูปภาพจากคอมฯ/มือถือ</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleBgFileUpload} 
                      className="hidden" 
                    />
                  </label>
                  <span className="text-xs text-slate-400">รองรับ JPG, PNG, WEBP</span>
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    หรือวางลิงก์รูปภาพ (Image URL):
                  </label>
                  <input
                    type="url"
                    value={formData.heroBgUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, heroBgUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* 3. Opacity Control */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>3. ปรับระดับความคมชัด / โปร่งแสงของภาพพื้นหลัง:</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-600 text-white font-mono text-xs font-bold">
                      {formData.opacity}%
                    </span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[50, 70, 85, 100].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, opacity: val }))}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          formData.opacity === val ? 'bg-cyan-600 text-white border-cyan-600 font-bold' : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={formData.opacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, opacity: Number(e.target.value) }))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>

              {/* Live Preview */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">ตัวอย่างภาพพื้นหลังและระดับความโปร่งแสง:</span>
                <div 
                  className="h-32 rounded-xl bg-cover bg-center border border-slate-200 relative overflow-hidden flex items-center justify-center"
                  style={{ 
                    backgroundImage: `url('${formData.heroBgUrl}')`,
                    opacity: formData.opacity / 100
                  }}
                >
                  <div className="absolute inset-0 bg-[#012038]/50"></div>
                  <span className="relative z-10 text-xs font-bold text-white px-3 py-1 bg-black/60 rounded-lg shadow font-mono">
                    ตัวอย่างจริง: โปร่งแสง {formData.opacity}% บนหน้าแรก
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOGO */}
          {activeTab === 'logo' && (
            <div className="space-y-5">
              <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="shrink-0 text-center">
                  <p className="text-xs text-slate-500 mb-2 font-medium">ตราสัญลักษณ์ปัจจุบัน</p>
                  <AssociationLogo customUrl={formData.customLogoUrl} className="w-20 h-20 mx-auto" />
                </div>
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900">
                    {formData.customLogoUrl ? 'ใช้รูปภาพโลโก้ที่กำหนดเอง' : 'ใช้ตราสัญลักษณ์ทางการ (Vector โทนน้ำเงิน-ทอง)'}
                  </h4>
                  <p className="text-slate-600 leading-relaxed font-light">
                    แอดมินสามารถอัปโหลดไฟล์ตราสัญลักษณ์สมาคมฯ รูปแบบใหม่ หรือเปลี่ยนกลับเป็นตราสัญลักษณ์มาตรฐานได้ตลอดเวลา
                  </p>
                  {formData.customLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, customLogoUrl: '' }))}
                      className="text-sky-700 font-semibold hover:underline"
                    >
                      ↺ กลับไปใช้ตราสัญลักษณ์สแตนดาร์ด
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  อัปโหลดโลโก้ใหม่:
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm">
                    <Upload className="w-4 h-4 text-sky-600" />
                    <span>อัปโหลดรูปภาพตราสัญลักษณ์</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoFileUpload} 
                      className="hidden" 
                    />
                  </label>
                  <span className="text-xs text-slate-400">แนะนำภาพสี่เหลี่ยมจัตุรัส หรือ PNG โปร่งใส</span>
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    หรือระบุ URL รูปภาพโลโก้:
                  </label>
                  <input
                    type="url"
                    value={formData.customLogoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, customLogoUrl: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GENERAL TEXT */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อสมาคมฯ (ภาษาไทย):
                </label>
                <input
                  type="text"
                  value={formData.associationNameTh}
                  onChange={(e) => setFormData(prev => ({ ...prev, associationNameTh: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สัญญาณเรียกขานประจำสมาคม (Callsign):
                </label>
                <input
                  type="text"
                  value={formData.officialCallsign}
                  onChange={(e) => setFormData(prev => ({ ...prev, officialCallsign: e.target.value.toUpperCase() }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-amber-700 outline-none focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สโลแกน / คำขวัญประจำสมาคม (Tagline):
                </label>
                <textarea
                  rows={3}
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>คืนค่าเริ่มต้น</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-xl shadow-md transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>บันทึกการเปลี่ยนแปลง</span>
              </button>
            </div>
          </div>
        </form>

        {/* Save feedback toast */}
        {saveToast && (
          <div className="absolute bottom-5 right-5 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <Check className="w-4 h-4" /> บันทึกการตั้งค่าเรียบร้อยแล้ว!
          </div>
        )}

        {/* Developer Credit Signature Bar */}
        <DeveloperCredit variant="light" />
      </div>

      {/* Owner PIN Confirmation Modal (สิทธิ์เฉพาะเจ้าของแอป: ผอ.โต๊ด • E26ECG) */}
      <AdminPinConfirmModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onConfirm={handlePinConfirmed}
        requiredPin="5532"
        ownerOnly={true}
        customTitle="ยืนยันสิทธิ์เจ้าของแอปพลิเคชัน"
        customSubtitle="บันทึกภาพพื้นหลังและตราสัญลักษณ์สมาคม"
        noticeText="เฉพาะเจ้าของแอป (ผอ.โต๊ด • E26ECG) เท่านั้นที่สามารถเปลี่ยนภาพพื้นหลังและโลโก้ได้"
      />
    </div>
  );
}
