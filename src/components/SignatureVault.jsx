import React, { useState, useEffect } from 'react';
import { 
  PenTool, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  Upload, 
  Check, 
  ShieldCheck, 
  User, 
  Award, 
  FileText, 
  Receipt, 
  Calendar,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { DEFAULT_OFFICERS, getSavedOfficers, saveOfficers } from '../data/defaultSignatures';

export default function SignatureVault({ onUpdateOfficers }) {
  const [officers, setOfficers] = useState(() => getSavedOfficers());
  const [editingId, setEditingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form for New / Edit Signer
  const [formName, setFormName] = useState('');
  const [formCallsign, setFormCallsign] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formRole, setFormRole] = useState('other');
  const [formTerm, setFormTerm] = useState('วาระปี 2568 - 2570');
  const [formImage, setFormImage] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const persistOfficers = (updated) => {
    setOfficers(updated);
    saveOfficers(updated);
    if (onUpdateOfficers) onUpdateOfficers(updated);
  };

  const handleStartEdit = (officer) => {
    setEditingId(officer.id);
    setIsAddingNew(false);
    setFormName(officer.name);
    setFormCallsign(officer.callsign || '');
    setFormTitle(officer.title);
    setFormRole(officer.role || 'other');
    setFormTerm(officer.term || 'วาระปี 2568 - 2570');
    setFormImage(officer.signatureImage || null);
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setFormName('');
    setFormCallsign('');
    setFormTitle('');
    setFormRole('other');
    setFormTerm('วาระปี 2568 - 2570');
    setFormImage(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setFormImage(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('กรุณาระบุชื่อ-สกุลของผู้มีอำนาจลงนาม');
      return;
    }

    if (isAddingNew) {
      const newOfficer = {
        id: `officer-${Date.now()}`,
        name: formName.trim(),
        callsign: formCallsign.trim() || '-',
        title: formTitle.trim() || 'กรรมการสมาคม',
        role: formRole,
        term: formTerm.trim() || 'วาระปี 2568 - 2570',
        isDefaultPresident: formRole === 'president',
        isDefaultReceiptSigner: formRole === 'secretary' || formRole === 'treasurer',
        isDefaultRegistrar: formRole === 'registrar',
        signatureType: formImage ? 'image' : 'svg',
        signatureSvg: `<svg viewBox="0 0 200 60" fill="none" stroke="#1d4ed8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M15,40 Q40,12 65,36 T115,22 Q145,10 175,28 T192,20" /><path d="M40,46 Q75,54 125,44" /></svg>`,
        signatureImage: formImage
      };
      const updated = [...officers, newOfficer];
      persistOfficers(updated);
      showToast('เพิ่มผู้ลงนามคนใหม่ลงในคลังลายเซ็นสำเร็จ!');
    } else if (editingId) {
      const updated = officers.map(o => {
        if (o.id === editingId) {
          return {
            ...o,
            name: formName.trim(),
            callsign: formCallsign.trim(),
            title: formTitle.trim(),
            role: formRole,
            term: formTerm.trim(),
            signatureImage: formImage || o.signatureImage
          };
        }
        return o;
      });
      persistOfficers(updated);
      showToast('บันทึกการแก้ไขข้อมูลผู้ลงนามเรียบร้อยแล้ว');
    }

    handleCancelForm();
  };

  const handleDelete = (id) => {
    if (officers.length <= 1) {
      showToast('ต้องมีผู้ลงนามในระบบอย่างน้อย 1 ท่าน');
      return;
    }
    if (window.confirm('คุณต้องการลบรายชื่อผู้ลงนามนี้ออกจากคลังลายเซ็นใช่หรือไม่?')) {
      const updated = officers.filter(o => o.id !== id);
      persistOfficers(updated);
      showToast('ลบผู้ลงนามเรียบร้อยแล้ว');
    }
  };

  // Toggle document signature assignment (Can toggle ON and toggle OFF)
  const handleToggleDocSigner = (id, field) => {
    const target = officers.find(o => o.id === id);
    const wasActive = !!target?.[field];

    const updated = officers.map(o => {
      if (o.id === id) {
        return {
          ...o,
          [field]: !wasActive
        };
      }
      return o;
    });

    persistOfficers(updated);
    showToast(wasActive ? 'นำลายเซ็นออกจากเอกสารเรียบร้อยแล้ว' : 'เปิดใช้งานลายเซ็นสำหรับเอกสารนี้แล้ว');
  };

  const handleResetToDefaults = () => {
    if (window.confirm('รีเซ็ตคลังลายเซ็นกลับเป็นค่าเริ่มต้นทางการของสมาคมสมิหลาใช่หรือไม่?')) {
      persistOfficers(DEFAULT_OFFICERS);
      showToast('รีเซ็ตข้อมูลผู้ลงนามทางการเรียบร้อยแล้ว');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
              <PenTool className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              คลังลายเซ็นดิจิทัล & จัดการผู้มีอำนาจลงนาม (Signature Vault)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            รองรับการสลับวาระกรรมการ (เช่น นายกสมาคมปีปัจจุบัน vs ปีถัดไป) พร้อมภาพลายเซ็นโปร่งใสสำหรับประทับลงในใบเสร็จ ใบสมัคร และหนังสือรับรอง
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="รีเซ็ตเป็นชุดเริ่มต้น"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">รีเซ็ตค่าเดิม</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setIsAddingNew(true);
              setEditingId(null);
              setFormName('');
              setFormCallsign('');
              setFormTitle('กรรมการสมาคม');
              setFormRole('other');
              setFormTerm('วาระปี 2568 - 2570');
              setFormImage(null);
            }}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-sky-700 hover:bg-sky-600 rounded-xl transition flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มผู้ลงนามใหม่</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Form Modal or Inline Panel */}
      {(isAddingNew || editingId) && (
        <form onSubmit={handleSaveForm} className="bg-sky-50/70 border border-sky-200 rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-sky-200/70 pb-3">
            <h3 className="text-xs font-bold text-sky-950 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>{isAddingNew ? 'เพิ่มผู้มีอำนาจลงนามท่านใหม่' : 'แก้ไขข้อมูลและลายเซ็นผู้ลงนาม'}</span>
            </h3>
            <button
              type="button"
              onClick={handleCancelForm}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">ชื่อ-สกุล (เต็ม) *</label>
              <input
                type="text"
                placeholder="เช่น นายธานี รายศิริ"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">สัญญาณเรียกขาน (Callsign)</label>
              <input
                type="text"
                placeholder="เช่น HS9AS หรือ E26ECG"
                value={formCallsign}
                onChange={(e) => setFormCallsign(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">ตำแหน่งในสมาคม *</label>
              <input
                type="text"
                placeholder="เช่น นายกสมาคม / เลขาธิการ / นายทะเบียน"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">วาระการดำรงตำแหน่ง</label>
              <input
                type="text"
                placeholder="เช่น วาระปี 2568 - 2570"
                value={formTerm}
                onChange={(e) => setFormTerm(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Signature Image Upload & Preview */}
          <div className="p-4 bg-white rounded-xl border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 block">ภาพลายเซ็นดิจิทัล (Transparent PNG)</span>
              <p className="text-[11px] text-slate-500">
                ควรอัปโหลดไฟล์ .PNG พื้นหลังโปร่งใส เพื่อให้ทับซ้อนลงบนใบเสร็จหรือหนังสือรับรองได้อย่างสวยงามเสมือนเซ็นจริง
              </p>
            </div>

            <div className="flex items-center gap-3">
              {formImage ? (
                <div className="w-32 h-14 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-1 relative">
                  <img src={formImage} alt="Preview" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                  <button
                    type="button"
                    onClick={() => setFormImage(null)}
                    className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-500 text-white rounded-full hover:bg-rose-600"
                    title="ลบรูปลายเซ็น"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-14 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-[10px] text-slate-400">
                  ใช้ลายเซ็นเวกเตอร์
                </div>
              )}

              <label className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{formImage ? 'เปลี่ยนไฟล์ภาพ' : 'อัปโหลดลายเซ็น PNG'}</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-700 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>บันทึกข้อมูลผู้ลงนาม</span>
            </button>
          </div>
        </form>
      )}

      {/* Officers List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {officers.map((officer) => (
          <div 
            key={officer.id} 
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition space-y-4 relative"
          >
            {/* Header info */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{officer.name}</h3>
                  {officer.callsign && officer.callsign !== '-' && (
                    <span className="px-2 py-0.5 bg-sky-50 text-sky-800 font-mono font-bold text-xs rounded border border-sky-200">
                      {officer.callsign}
                    </span>
                  )}
                </div>
                <p className="text-xs text-sky-900 font-semibold mt-0.5">{officer.title}</p>
                <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{officer.term || 'วาระปี 2568 - 2570'}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleStartEdit(officer)}
                  className="p-1.5 text-slate-400 hover:text-sky-700 rounded-lg hover:bg-sky-50 transition cursor-pointer"
                  title="แก้ไขข้อมูลผู้ลงนาม"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(officer.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                  title="ลบผู้ลงนามนี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Signature Preview Plate */}
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                ภาพลายเซ็นตัวอย่าง
              </span>
              
              <div className="h-14 w-44 flex items-center justify-center">
                {officer.signatureImage ? (
                  <img 
                    src={officer.signatureImage} 
                    alt={officer.name} 
                    className="max-h-12 max-w-full object-contain mix-blend-multiply" 
                  />
                ) : (
                  <div 
                    className="w-full h-12"
                    dangerouslySetInnerHTML={{ __html: officer.signatureSvg || '' }}
                  />
                )}
              </div>
            </div>

            {/* Default Roles Tags & Switchers */}
            <div className="pt-1 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-slate-400 text-[10px] uppercase font-bold">กำหนดเป็นผู้ลงนามหลัก:</span>
              
              {/* President Default (Certificate) */}
              <button
                type="button"
                onClick={() => handleToggleDocSigner(officer.id, 'isDefaultPresident')}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 font-medium ${
                  officer.isDefaultPresident 
                    ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold shadow-2xs hover:bg-amber-200' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                }`}
                title={officer.isDefaultPresident ? "คลิกเพื่อติ๊กออก (นำออกจากหนังสือรับรอง)" : "คลิกเพื่อติ๊กถูก (ให้เซ็นหนังสือรับรอง)"}
              >
                <Award className={`w-3 h-3 ${officer.isDefaultPresident ? 'text-amber-700' : 'text-slate-400'}`} />
                <span>{officer.isDefaultPresident ? '✓ เซ็นหนังสือรับรอง' : '+ เซ็นหนังสือรับรอง'}</span>
              </button>

              {/* Receipt Default */}
              <button
                type="button"
                onClick={() => handleToggleDocSigner(officer.id, 'isDefaultReceiptSigner')}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 font-medium ${
                  officer.isDefaultReceiptSigner 
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold shadow-2xs hover:bg-emerald-200' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                }`}
                title={officer.isDefaultReceiptSigner ? "คลิกเพื่อติ๊กออก (นำออกจากใบเสร็จ)" : "คลิกเพื่อติ๊กถูก (ให้เซ็นใบเสร็จ)"}
              >
                <Receipt className={`w-3 h-3 ${officer.isDefaultReceiptSigner ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{officer.isDefaultReceiptSigner ? '✓ เซ็นใบเสร็จ' : '+ เซ็นใบเสร็จ'}</span>
              </button>

              {/* Registrar Default (Application Form) */}
              <button
                type="button"
                onClick={() => handleToggleDocSigner(officer.id, 'isDefaultRegistrar')}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 font-medium ${
                  officer.isDefaultRegistrar 
                    ? 'bg-sky-100 text-sky-900 border-sky-400 font-bold shadow-2xs hover:bg-sky-200' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                }`}
                title={officer.isDefaultRegistrar ? "คลิกเพื่อติ๊กออก (นำออกจากใบสมัคร)" : "คลิกเพื่อติ๊กถูก (ให้เซ็นใบสมัคร)"}
              >
                <FileText className={`w-3 h-3 ${officer.isDefaultRegistrar ? 'text-sky-700' : 'text-slate-400'}`} />
                <span>{officer.isDefaultRegistrar ? '✓ เซ็นใบสมัคร' : '+ เซ็นใบสมัคร'}</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
