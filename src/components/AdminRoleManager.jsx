import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Shield, 
  Users, 
  UserCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  Check, 
  Award, 
  FileText, 
  Receipt, 
  Cpu, 
  PenTool, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Lock,
  Sparkles
} from 'lucide-react';

export const DEFAULT_ROLES = [
  {
    id: 'role-superadmin',
    name: 'ซูเปอร์แอดมิน (Super Admin)',
    description: 'ผู้ดูแลระบบหลัก มีสิทธิ์สูงสุดในการเข้าถึงและจัดการทุกโมดูลในระบบ',
    isSystem: true,
    permissions: {
      canReviewApplication: true,
      canApproveMember: true,
      canScreenDE: true,
      canApproveDE: true,
      canIssueReceipt: true,
      canManageSignatures: true,
      canDesignDocuments: true,
      canManageRoles: true,
      canEditSettings: true
    }
  },
  {
    id: 'role-president',
    name: 'นายกสมาคม / รองนายกสมาคม (Executive)',
    description: 'ผู้มีอำนาจลงนามอนุมัติขั้นสุดท้าย คำขอรหัส DE และหนังสือรับรองสมาคม',
    isSystem: false,
    permissions: {
      canReviewApplication: true,
      canApproveMember: true,
      canScreenDE: true,
      canApproveDE: true, // Key: Executive approval
      canIssueReceipt: true,
      canManageSignatures: true,
      canDesignDocuments: true,
      canManageRoles: false,
      canEditSettings: true
    }
  },
  {
    id: 'role-de-coordinator',
    name: 'ผู้ประสานงานข่ายสื่อสาร DE (Spender Coordinator)',
    description: 'คัดกรองเบื้องต้นเครื่อง Spender/IMEI ตรวจสอบคุณสมบัติ และส่งต่อนายกฯ อนุมัติ',
    isSystem: false,
    permissions: {
      canReviewApplication: false,
      canApproveMember: false,
      canScreenDE: true, // Key: Admin preliminary screening
      canApproveDE: false,
      canIssueReceipt: false,
      canManageSignatures: false,
      canDesignDocuments: false,
      canManageRoles: false,
      canEditSettings: false
    }
  },
  {
    id: 'role-registrar',
    name: 'นายทะเบียนสมาคม (Registrar)',
    description: 'ตรวจสอบคุณสมบัติผู้สมัครสมาชิก ออกรหัสสมาชิก และจัดการทำเนียบสมาชิก',
    isSystem: false,
    permissions: {
      canReviewApplication: true,
      canApproveMember: true,
      canScreenDE: false,
      canApproveDE: false,
      canIssueReceipt: true,
      canManageSignatures: false,
      canDesignDocuments: true,
      canManageRoles: false,
      canEditSettings: false
    }
  },
  {
    id: 'role-treasurer',
    name: 'เหรัญญิก / การเงิน (Treasurer)',
    description: 'ตรวจสอบสลิปการโอนเงิน ออกใบเสร็จรับเงิน และบันทึกประวัติการรับชำระ',
    isSystem: false,
    permissions: {
      canReviewApplication: true,
      canApproveMember: false,
      canScreenDE: false,
      canApproveDE: false,
      canIssueReceipt: true, // Key: Issue receipt
      canManageSignatures: false,
      canDesignDocuments: true,
      canManageRoles: false,
      canEditSettings: false
    }
  }
];

export const DEFAULT_APPOINTED_ADMINS = [
  {
    id: 'app-01',
    memberId: '369113',
    callsign: 'E26ECG',
    fullName: 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)',
    roleId: 'role-superadmin',
    roleName: 'ซูเปอร์แอดมิน (Super Admin)',
    appointmentOrder: 'คำสั่งสมาคมฯ ที่ 01/2568',
    appointedDate: '16 พ.ย. 2568',
    isLocked: true, // Cannot be deleted
    status: 'ปฏิบัติหน้าที่'
  },
  {
    id: 'app-02',
    memberId: '369101',
    callsign: 'HS9ADM',
    fullName: 'นายเกียรติศักดิ์ สมิหลาเวหา',
    roleId: 'role-registrar',
    roleName: 'นายทะเบียนสมาคม',
    appointmentOrder: 'คำสั่งสมาคมฯ ที่ 02/2568',
    appointedDate: '16 พ.ย. 2568',
    isLocked: false,
    status: 'ปฏิบัติหน้าที่'
  },
  {
    id: 'app-03',
    memberId: '369102',
    callsign: 'HS90BA',
    fullName: 'พ.ต.ท.อนุรักษ์ สมิหลาพิทักษ์',
    roleId: 'role-president',
    roleName: 'รองนายกสมาคมฝ่ายความมั่นคง',
    appointmentOrder: 'คำสั่งสมาคมฯ ที่ 03/2568',
    appointedDate: '18 พ.ย. 2568',
    isLocked: false,
    status: 'ปฏิบัติหน้าที่'
  }
];

export default function AdminRoleManager({ 
  membersList = [], 
  currentUser 
}) {
  const [appointedAdmins, setAppointedAdmins] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_appointed_admins_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_APPOINTED_ADMINS;
  });

  const [roles, setRoles] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_admin_roles_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_ROLES;
  });

  const [toastMessage, setToastMessage] = useState('');
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);

  // Form State for Appointing New Admin
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('role-de-coordinator');
  const [appointmentOrder, setAppointmentOrder] = useState('คำสั่งสมาคมฯ ที่ 04/2569');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const persistAppointedAdmins = (updated) => {
    setAppointedAdmins(updated);
    localStorage.setItem('samila_appointed_admins_v1', JSON.stringify(updated));
  };

  const persistRoles = (updated) => {
    setRoles(updated);
    localStorage.setItem('samila_admin_roles_v1', JSON.stringify(updated));
  };

  const handleAppointAdmin = (e) => {
    e.preventDefault();
    const targetMember = membersList.find(m => m.id === selectedMemberId);
    if (!targetMember) {
      showToast('กรุณาเลือกสมาชิกที่ต้องการแต่งตั้ง');
      return;
    }

    const targetRole = roles.find(r => r.id === selectedRoleId);
    if (!targetRole) return;

    // Check if already appointed
    const existing = appointedAdmins.find(a => a.memberId === targetMember.memberId);
    if (existing) {
      // Update role
      const updated = appointedAdmins.map(a => {
        if (a.memberId === targetMember.memberId) {
          return {
            ...a,
            roleId: targetRole.id,
            roleName: targetRole.name,
            appointmentOrder: appointmentOrder.trim(),
            appointedDate: new Date().toLocaleDateString('th-TH')
          };
        }
        return a;
      });
      persistAppointedAdmins(updated);
      showToast(`อัปเดตบทบาทของ ${targetMember.fullName} เรียบร้อยแล้ว`);
    } else {
      const newAdmin = {
        id: `app-${Date.now()}`,
        memberId: targetMember.memberId || `369${Math.floor(100 + Math.random() * 900)}`,
        callsign: targetMember.callsign || '-',
        fullName: targetMember.fullName,
        roleId: targetRole.id,
        roleName: targetRole.name,
        appointmentOrder: appointmentOrder.trim(),
        appointedDate: new Date().toLocaleDateString('th-TH'),
        isLocked: false,
        status: 'ปฏิบัติหน้าที่'
      };
      const updated = [...appointedAdmins, newAdmin];
      persistAppointedAdmins(updated);
      showToast(`แต่งตั้ง ${targetMember.fullName} เป็น "${targetRole.name}" สำเร็จ!`);
    }

    setIsAppointModalOpen(false);
    setSelectedMemberId('');
  };

  const handleRemoveAdmin = (id) => {
    const target = appointedAdmins.find(a => a.id === id);
    if (target?.isLocked || target?.callsign === 'E26ECG') {
      showToast('ไม่สามารถถอดถอนผู้ดูแลระบบหลัก (E26ECG ผอ.โต๊ด) ได้');
      return;
    }

    if (window.confirm(`คุณต้องการถอดถอนสิทธิ์แอดมินของ ${target?.fullName} ใช่หรือไม่?`)) {
      const updated = appointedAdmins.filter(a => a.id !== id);
      persistAppointedAdmins(updated);
      showToast('ถอดถอนสิทธิ์แอดมินเรียบร้อยแล้ว');
    }
  };

  const handleTogglePermission = (roleId, permKey) => {
    const targetRole = roles.find(r => r.id === roleId);
    if (targetRole?.id === 'role-superadmin') {
      showToast('ไม่สามารถลดทอนสิทธิ์ของ Super Admin ได้');
      return;
    }

    const updated = roles.map(r => {
      if (r.id === roleId) {
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [permKey]: !r.permissions[permKey]
          }
        };
      }
      return r;
    });
    persistRoles(updated);
    showToast('บันทึกการปรับเปลี่ยนสิทธิ์เรียบร้อยแล้ว');
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

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              แต่งตั้งคณะทำงาน & กำหนดสิทธิ์ผู้ดูแลระบบ (Admin RBAC)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            แบ่งบทบาทการทำงานของสมาคม: นายก/รองนายกอนุมัติ DE ขั้นสุดท้าย, แอดมิน/ผู้ประสานงานตรวจเบื้องต้น, นายทะเบียนดูแลสมาชิก, และเหรัญญิกออกใบเสร็จ
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAppointModalOpen(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ แต่งตั้งแอดมินใหม่</span>
        </button>
      </div>

      {/* Appoint Modal */}
      {isAppointModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3">
          <form 
            onSubmit={handleAppointAdmin}
            className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-sky-600" />
                <span>แต่งตั้งผู้ดูแลระบบ / คณะทำงานสมาคม</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAppointModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">เลือกสมาชิกที่จะแต่งตั้ง *</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900"
                  required
                >
                  <option value="">-- กรุณาเลือกสมาชิก --</option>
                  {membersList.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.callsign && m.callsign !== '-' ? m.callsign : 'รอ Callsign'} - {m.fullName} (#{m.memberId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ตำแหน่ง / สิทธิ์การดูแล *</label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">เลขที่คำสั่งแต่งตั้ง</label>
                <input
                  type="text"
                  placeholder="เช่น คำสั่งสมาคมฯ ที่ 04/2569"
                  value={appointmentOrder}
                  onChange={(e) => setAppointmentOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAppointModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-700 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <Save className="w-3.5 h-3.5" />
                <span>ยืนยันการแต่งตั้ง</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointed Officers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" />
            <span>ทำเนียบคณะทำงาน & แอดมินที่ได้รับการแต่งตั้ง ({appointedAdmins.length} ท่าน)</span>
          </h3>
          <span className="text-[11px] text-slate-500 sm:hidden">
            👈 เลื่อนซ้าย-ขวาเพื่อดูตาราง 👉
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-xs min-w-[700px]">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 text-left whitespace-nowrap">สมาชิก / Callsign</th>
                <th className="py-2.5 px-4 text-left whitespace-nowrap">บทบาทหน้าที่ (Role)</th>
                <th className="py-2.5 px-4 text-left whitespace-nowrap">เลขที่คำสั่งแต่งตั้ง</th>
                <th className="py-2.5 px-4 text-left whitespace-nowrap">วันที่แต่งตั้ง</th>
                <th className="py-2.5 px-4 text-center whitespace-nowrap">สถานะ</th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {appointedAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-900 font-bold flex items-center justify-center font-mono text-[10px] shrink-0">
                        {admin.callsign !== '-' ? admin.callsign.substring(0, 3) : 'ADM'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span className="font-bold text-slate-900">{admin.fullName}</span>
                          {admin.callsign && admin.callsign !== '-' && (
                            <span className="font-mono text-amber-700 font-bold text-[11px]">
                              ({admin.callsign})
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">รหัส #{admin.memberId}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 whitespace-nowrap ${
                      admin.roleId === 'role-superadmin'
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : admin.roleId === 'role-president'
                        ? 'bg-blue-50 text-blue-900 border-blue-300'
                        : 'bg-sky-50 text-sky-900 border-sky-200'
                    }`}>
                      {admin.roleId === 'role-superadmin' ? '👑' : '🛡️'} {admin.roleName}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {admin.appointmentOrder || '-'}
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">
                    {admin.appointedDate}
                  </td>

                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                      ✓ {admin.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {admin.isLocked || admin.callsign === 'E26ECG' ? (
                      <span className="text-[10px] text-slate-400 italic flex items-center justify-end gap-1 whitespace-nowrap">
                        <Lock className="w-3 h-3" /> ผู้ดูแลหลัก
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRemoveAdmin(admin.id)}
                        className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded transition cursor-pointer text-xs font-semibold whitespace-nowrap"
                        title="ถอดถอนสิทธิ์"
                      >
                        ถอดถอน
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix by Role */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-600" />
            <span>ตารางกำหนดสิทธิ์การทำงานตามบทบาท (Granular Role Permissions)</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            สามารถคลิกติ๊กเพื่อเปิด-ปิดสิทธิ์ของแต่ละตำแหน่งงานได้ทันที
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div 
              key={role.id} 
              className={`p-4 rounded-xl border transition ${
                role.id === 'role-superadmin' 
                  ? 'bg-amber-50/40 border-amber-200' 
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-3">
                <span className="font-bold text-slate-900 text-xs">{role.name}</span>
                {role.id === 'role-superadmin' && (
                  <span className="text-[9px] font-mono bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                    ROOT
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                {/* 1. Preliminary Screening for DE */}
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-600 text-[11px]">คัดกรองคำขอ DE เบื้องต้น</span>
                  <input
                    type="checkbox"
                    checked={role.permissions.canScreenDE}
                    disabled={role.id === 'role-superadmin'}
                    onChange={() => handleTogglePermission(role.id, 'canScreenDE')}
                    className="rounded text-sky-600"
                  />
                </label>

                {/* 2. Executive Approval for DE */}
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-900 font-semibold text-[11px]">อนุมัติขั้นสุดท้าย & ออกรหัส DE</span>
                  <input
                    type="checkbox"
                    checked={role.permissions.canApproveDE}
                    disabled={role.id === 'role-superadmin'}
                    onChange={() => handleTogglePermission(role.id, 'canApproveDE')}
                    className="rounded text-amber-600"
                  />
                </label>

                {/* 3. Issue Receipt */}
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-600 text-[11px]">ออกใบเสร็จรับเงิน (Receipt)</span>
                  <input
                    type="checkbox"
                    checked={role.permissions.canIssueReceipt}
                    disabled={role.id === 'role-superadmin'}
                    onChange={() => handleTogglePermission(role.id, 'canIssueReceipt')}
                    className="rounded text-emerald-600"
                  />
                </label>

                {/* 4. Review Member Applications */}
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-600 text-[11px]">อนุมัติสมาชิกใหม่ (Membership)</span>
                  <input
                    type="checkbox"
                    checked={role.permissions.canApproveMember}
                    disabled={role.id === 'role-superadmin'}
                    onChange={() => handleTogglePermission(role.id, 'canApproveMember')}
                    className="rounded text-sky-600"
                  />
                </label>

                {/* 5. Document Studio */}
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-600 text-[11px]">ปรับแต่งเอกสาร & ลายเซ็น</span>
                  <input
                    type="checkbox"
                    checked={role.permissions.canDesignDocuments}
                    disabled={role.id === 'role-superadmin'}
                    onChange={() => handleTogglePermission(role.id, 'canDesignDocuments')}
                    className="rounded text-purple-600"
                  />
                </label>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
