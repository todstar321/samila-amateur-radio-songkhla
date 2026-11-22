/**
 * Default Signatures and Officer Profiles for Samila Amateur Radio Association
 * Supports rotation of officers, terms, transparent PNG uploads, and vector signatures
 */

export const DEFAULT_OFFICERS = [
  {
    id: 'officer-president',
    name: 'นายธานี รายศิริ',
    callsign: 'HS9AS-1',
    role: 'president',
    title: 'นายกสมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา',
    term: 'วาระปี 2568 - 2570',
    isDefaultPresident: true,
    isDefaultReceiptSigner: false,
    isDefaultRegistrar: false,
    signatureType: 'svg',
    signatureSvg: `<svg viewBox="0 0 200 60" fill="none" stroke="#1e3a8a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M15,42 Q40,12 65,36 T115,22 Q145,8 175,28 T192,18" /><path d="M45,46 Q75,54 125,44" /><path d="M85,16 L98,44" /></svg>`,
    signatureImage: null
  },
  {
    id: 'officer-secretary',
    name: 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)',
    callsign: 'E26ECG',
    role: 'secretary',
    title: 'เลขาธิการ / ผู้อำนวยการฝ่ายเทคโนโลยี',
    term: 'วาระปี 2568 - 2570',
    isDefaultPresident: false,
    isDefaultReceiptSigner: true, // Used in official receipts!
    isDefaultRegistrar: false,
    signatureType: 'svg',
    signatureSvg: `<svg viewBox="0 0 200 60" fill="none" stroke="#1d4ed8" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M12,42 C28,15 48,22 62,38 C75,52 88,20 102,18 C120,16 138,40 152,30 C162,22 178,14 190,26" /><path d="M38,48 Q78,56 128,45" /><circle cx="160" cy="24" r="3" fill="#1d4ed8" /></svg>`,
    signatureImage: null
  },
  {
    id: 'officer-registrar',
    name: 'นายเกียรติศักดิ์ สมิหลาเวหา',
    callsign: 'HS9ADM',
    role: 'registrar',
    title: 'นายทะเบียนสมาคม',
    term: 'วาระปี 2568 - 2570',
    isDefaultPresident: false,
    isDefaultReceiptSigner: false,
    isDefaultRegistrar: true, // Used in member application forms!
    signatureType: 'svg',
    signatureSvg: `<svg viewBox="0 0 200 60" fill="none" stroke="#0369a1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M20,38 Q50,10 80,42 T130,18 Q160,25 185,16" /><path d="M50,45 Q90,52 140,42" /><path d="M90,20 L105,48" /></svg>`,
    signatureImage: null
  },
  {
    id: 'officer-vp',
    name: 'พ.ต.ท.อนุรักษ์ สมิหลาพิทักษ์',
    callsign: 'HS90BA',
    role: 'vice_president',
    title: 'รองนายกสมาคมฝ่ายความมั่นคงและข่ายฉุกเฉิน',
    term: 'วาระปี 2568 - 2570',
    isDefaultPresident: false,
    isDefaultReceiptSigner: false,
    isDefaultRegistrar: false,
    signatureType: 'svg',
    signatureSvg: `<svg viewBox="0 0 200 60" fill="none" stroke="#1e3a8a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M18,36 Q42,14 70,38 T125,20 Q150,15 182,32" /><path d="M35,46 Q80,55 135,43" /></svg>`,
    signatureImage: null
  }
];

export const SIGNATURE_VAULT_STORAGE_KEY = 'samila_signature_vault_v1';

export function getSavedOfficers() {
  try {
    const raw = localStorage.getItem(SIGNATURE_VAULT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading signature vault:', err);
  }
  return DEFAULT_OFFICERS;
}

export function saveOfficers(officers) {
  try {
    localStorage.setItem(SIGNATURE_VAULT_STORAGE_KEY, JSON.stringify(officers));
  } catch (err) {
    console.error('Error saving signature vault:', err);
  }
}
