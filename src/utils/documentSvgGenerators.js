// Generator functions for official documents using authentic scanned templates and coordinates
import { parseAddressAndPostalCode } from './addressUtils.js';
import { thaiBahtText } from './thaiBahtText.js';
import savedLayoutSettings from '../data/savedLayoutSettings.json' with { type: 'json' };
import { STORAGE_KEYS } from './layoutSyncUtils.js';
import { 
  DEFAULT_APP_TEMPLATE_BASE64, 
  DEFAULT_RECEIPT_TEMPLATE_BASE64, 
  DEFAULT_CERT_TEMPLATE_BASE64 
} from '../assets/defaultTemplates.js';

/**
 * Load active layout settings cascading from localStorage to bundled JSON
 */
function getActiveLayout(docType) {
  let layout = savedLayoutSettings[docType] || {};
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const key = STORAGE_KEYS[docType];
      const local = key ? localStorage.getItem(key) : null;
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed === 'object') {
          layout = { ...layout, ...parsed };
        }
      }
    } catch (e) {}
  }
  return layout;
}

/**
 * Load active app tier positions from localStorage or bundled JSON
 */
function getAppTierPositions() {
  let tiers = savedLayoutSettings.appTierPositions || {};
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const local = localStorage.getItem(STORAGE_KEYS.appTier);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed === 'object') {
          tiers = { ...tiers, ...parsed };
        }
      }
    } catch (e) {}
  }
  return tiers;
}

/**
 * Load active receipt tier positions from localStorage or bundled JSON
 */
function getReceiptTierPositions() {
  let tiers = savedLayoutSettings.receiptTierPositions || {};
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const local = localStorage.getItem(STORAGE_KEYS.receiptTier);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed === 'object') {
          tiers = { ...tiers, ...parsed };
        }
      }
    } catch (e) {}
  }
  return tiers;
}

/**
 * Detect membership tier key from member record
 */
function getMemberTierKey(member) {
  if (!member) return 'fiveYear';
  const rawKey = String(member.membershipTierKey || member.tierKey || '').trim().toLowerCase();
  if (rawKey === '1' || rawKey === 'honorary' || rawKey.includes('กิตติมศักดิ์')) return 'honorary';
  if (rawKey === '2' || rawKey === 'lifetime' || rawKey.includes('ตลอดชีพ')) return 'lifetime';
  if (rawKey === '3' || rawKey === 'fiveyear' || rawKey === '5year' || rawKey.includes('5') || rawKey.includes('สามัญ')) return 'fiveYear';
  if (rawKey === '4' || rawKey === 'radioorg' || rawKey === 'org' || rawKey.includes('องค์กร')) return 'radioOrg';

  const mType = String(member.memberType || '').toLowerCase();
  if (mType.includes('ตลอดชีพ')) return 'lifetime';
  if (mType.includes('กิตติมศักดิ์')) return 'honorary';
  if (mType.includes('องค์กร')) return 'radioOrg';
  return 'fiveYear';
}

/**
 * Format date string into Thai and English short displays
 */
function formatThaiDateDisplay(dateStr, fallback = '-') {
  if (!dateStr) return { thai: fallback, eng: fallback, both: fallback };
  const parts = String(dateStr).split(/[/.-]/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const thaiMonthsShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const engMonthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (month >= 1 && month <= 12) {
      const yearAd = year > 2400 ? year - 543 : year;
      const yearBe = year > 2400 ? year : year + 543;
      return {
        thai: `${day} ${thaiMonthsShort[month - 1]} ${yearBe}`,
        eng: `${day} ${engMonthsShort[month - 1]} ${yearAd}`,
        both: `${day} ${thaiMonthsShort[month - 1]} ${yearBe} / ${day} ${engMonthsShort[month - 1]} ${yearAd}`
      };
    }
  }
  return { thai: dateStr, eng: dateStr, both: dateStr };
}

function escapeXml(unsafe) {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function parseThaiDateParts(raw) {
  if (!raw) return { d: '16', m: '11', mThai: 'พ.ย.', mFull: 'พฤศจิกายน', y: '2569', y2: '69' };
  const parts = String(raw).split(/[/.-]/);
  const thaiMonthsShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const thaiMonthsFull = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  
  if (parts.length >= 3) {
    const d = String(parseInt(parts[0], 10) || 16);
    const mNum = parseInt(parts[1], 10) || 11;
    let yNum = parseInt(parts[2], 10) || 2569;
    if (yNum < 2400) yNum += 543;
    const mStr = String(mNum).padStart(2, '0');
    const mThai = thaiMonthsShort[mNum - 1] || 'พ.ย.';
    const mFull = thaiMonthsFull[mNum - 1] || 'พฤศจิกายน';
    const yStr = String(yNum);
    const y2 = yStr.slice(-2);
    return { d, m: mStr, mThai, mFull, y: yStr, y2 };
  }
  return { d: '16', m: '11', mThai: 'พ.ย.', mFull: 'พฤศจิกายน', y: '2569', y2: '69' };
}

// Secretary Signature Vector (Used on Official Receipts)
const SECRETARY_SIG_SVG = `<g transform="scale(0.7)"><path d="M12,42 C28,15 48,22 62,38 C75,52 88,20 102,18 C120,16 138,40 152,30 C162,22 178,14 190,26" stroke="#1d4ed8" stroke-width="2.8" fill="none" stroke-linecap="round"/><path d="M38,48 Q78,56 128,45" stroke="#1d4ed8" stroke-width="2.8" fill="none"/><circle cx="160" cy="24" r="3" fill="#1d4ed8" /></g>`;

// President Signature Vector (Used on Official Certificates)
const PRESIDENT_SIG_SVG = `<g transform="scale(0.8)"><path d="M15,42 Q40,12 65,36 T115,22 Q145,8 175,28 T192,18" stroke="#1e3a8a" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M45,46 Q75,54 125,44" stroke="#1e3a8a" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M85,16 L98,44" stroke="#1e3a8a" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;

// Registrar Signature Vector (Used on Application forms)
const REGISTRAR_SIG_SVG = `<g transform="scale(0.65)"><path d="M20,38 Q50,10 80,42 T130,18 Q160,25 185,16" stroke="#0369a1" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M50,45 Q90,52 140,42" stroke="#0369a1" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M90,20 L105,48" stroke="#0369a1" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;

// Applicant Signature Vector (Stylized wave stroke)
const APPLICANT_SIG_SVG = `<g transform="scale(0.65)"><path d="M10,25 C30,10 50,30 70,15 C90,28 110,12 130,22" stroke="#1d4ed8" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>`;

// 1. OFFICIAL APPLICATION FORM (Using real scanned template & saved layout coordinates)
export function generateApplicationFormSvg(member, settings = {}) {
  const m = member || {};
  const pos = settings.positions || getActiveLayout('application');
  const templateBg = settings.templateBackground || DEFAULT_APP_TEMPLATE_BASE64;
  const CANVAS_W = 794;
  const H = 1120;

  const rawFullName = m.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)';
  const nameParts = rawFullName.trim().split(/\s+/);
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  const cleanCitizen = String(m.citizenId || '1969900105532').replace(/\D/g, '').padEnd(13, ' ');
  const idDigits = cleanCitizen.slice(0, 13).split('');

  const parsedAddr = parseAddressAndPostalCode(m.currentAddress || m.registeredAddress || '66 ถนนเลียบคลองชลประทาน ต.ควนลัง อ.หาดใหญ่ จ.สงขลา 90110', m.postalCode);
  const cleanAddr = parsedAddr.addressLine1 || parsedAddr.cleanAddress;
  const postalDigits = String(parsedAddr.postalDigits || m.postalCode || '90110').replace(/\D/g, '').padEnd(5, ' ').slice(0, 5).split('');
  const memIdDigits = String(m.memberId || '369113').replace(/\D/g, '').padEnd(7, ' ').slice(0, 7).split('');

  const birthParts = parseThaiDateParts(m.birthDate || '16/09/2530');
  const issueParts = parseThaiDateParts(m.citizenIssueDate || '10/05/2569');
  const expiryParts = parseThaiDateParts(m.citizenExpiryDate || '09/05/2579');
  const applyParts = parseThaiDateParts(m.registeredDate || '16/11/2569');

  const tierKey = getMemberTierKey(m);
  const appTiers = settings.tierPositions || getAppTierPositions();
  const activeAppTier = appTiers[tierKey] || {
    honorary: { check: { x: 8.43, y: 59.49 }, boxes: { x: 66.29, y: 59.29 } },
    lifetime: { check: { x: 8.43, y: 62.29 }, boxes: { x: 66.29, y: 62.29 } },
    fiveYear: { check: { x: 8.57, y: 65.29 }, boxes: { x: 66.3, y: 65.39 } },
    radioOrg: { check: { x: 8.44, y: 68.49 }, boxes: { x: 66.43, y: 68.39 } }
  }[tierKey] || { check: { x: 8.57, y: 65.29 }, boxes: { x: 66.3, y: 65.39 } };

  // Determine callsignOld and callsignNew
  let callsignOldVal = '';
  let callsignNewVal = '';
  if (m.callsignType === 'has') {
    if (m.callsignSubStatus === 'expired') {
      callsignOldVal = (m.formerCallsign && m.formerCallsign !== '-') ? m.formerCallsign : (m.callsign && m.callsign !== '-' ? m.callsign : '');
      callsignNewVal = '';
    } else {
      callsignOldVal = (m.formerCallsign && m.formerCallsign !== '-') ? m.formerCallsign : '';
      callsignNewVal = m.callsign && m.callsign !== '-' ? m.callsign : '';
    }
  } else if (m.callsignType === 'new') {
    callsignOldVal = '';
    callsignNewVal = '';
  } else {
    if (m.formerCallsign && m.formerCallsign !== '-') {
      callsignOldVal = m.formerCallsign;
      callsignNewVal = m.callsign && m.callsign !== '-' ? m.callsign : '';
    } else if (m.callsign && m.callsign !== '-') {
      callsignNewVal = m.callsign;
      callsignOldVal = '';
    }
  }

  const elements = [];

  Object.entries(pos).forEach(([key, item]) => {
    if (!item || item.hidden) return;
    let x = (item.x / 100) * CANVAS_W;
    let y = (item.y / 100) * H;
    const fs = item.fontSize || 13;
    const color = item.color || '#0433ff';
    const bold = item.bold ? 'bold' : 'normal';

    if (key === 'tierStandard5YCheck') {
      x = (activeAppTier.check.x / 100) * CANVAS_W;
      y = (activeAppTier.check.y / 100) * H;
    } else if (key === 'tierMemberIdBoxes') {
      x = (activeAppTier.boxes.x / 100) * CANVAS_W;
      y = (activeAppTier.boxes.y / 100) * H;
    }

    if (item.type === 'nameGroup') {
      const offset = item.lastNameOffsetPx !== undefined ? item.lastNameOffsetPx : 379;
      elements.push(`<text x="${x}" y="${y + 11}" font-family="'Sarabun', 'Thonburi', sans-serif" font-size="${fs}" fill="${color}" font-weight="${bold}" dominant-baseline="central">${escapeXml(firstName)}</text>`);
      if (lastName) {
        elements.push(`<text x="${x + offset}" y="${y + 11}" font-family="'Sarabun', 'Thonburi', sans-serif" font-size="${fs}" fill="${color}" font-weight="${bold}" dominant-baseline="central">${escapeXml(lastName)}</text>`);
      }
    } else if (item.type === 'citizenIdBoxes') {
      const pitch = item.pitch !== undefined ? item.pitch : 19.14;
      const groupGap = item.groupGap !== undefined ? item.groupGap : 0;
      const digitOffsets = item.digitOffsets || {};
      idDigits.forEach((char, idx) => {
        let extra = 0;
        if (idx >= 1) extra += groupGap;
        if (idx >= 5) extra += groupGap;
        if (idx >= 10) extra += groupGap;
        if (idx >= 12) extra += groupGap;
        const nudge = digitOffsets[idx] || 0;
        const digitX = x + idx * pitch + extra + nudge;
        elements.push(`<text x="${digitX + pitch / 2}" y="${y + 11.5}" font-family="monospace" font-size="${fs}" fill="${color}" font-weight="bold" text-anchor="middle" dominant-baseline="central">${escapeXml(char)}</text>`);
      });
    } else if (item.type === 'simpleDigitBoxes') {
      const digits = key === 'postalCodeBoxes' ? postalDigits : memIdDigits;
      const pitch = item.pitch !== undefined ? item.pitch : (key === 'tierMemberIdBoxes' ? 17 : 18.6);
      const digitOffsets = item.digitOffsets || {};
      digits.forEach((char, idx) => {
        const nudge = digitOffsets[idx] || 0;
        const digitX = x + idx * pitch + nudge;
        elements.push(`<text x="${digitX + pitch / 2}" y="${y + 11.5}" font-family="monospace" font-size="${fs}" fill="${color}" font-weight="bold" text-anchor="middle" dominant-baseline="central">${escapeXml(char)}</text>`);
      });
    } else if (item.type === 'dateGroup') {
      let dVal = '16', mVal = '11', yVal = '2569';
      if (key === 'birthDateGroup') { dVal = birthParts.d; mVal = birthParts.mThai; yVal = birthParts.y; }
      else if (key === 'citizenIssueDateGroup') { dVal = issueParts.d || item.customDay || '10'; mVal = issueParts.m || item.customMonth || '05'; yVal = issueParts.y2 || item.customYear || '69'; }
      else if (key === 'citizenExpiryDateGroup') { dVal = expiryParts.d || item.customDay || '09'; mVal = expiryParts.m || item.customMonth || '05'; yVal = expiryParts.y2 || item.customYear || '69'; }
      else { dVal = applyParts.d; mVal = applyParts.m; yVal = applyParts.y; }

      const mOffset = item.monthOffsetPx !== undefined ? item.monthOffsetPx : 36;
      const yOffset = item.yearOffsetPx !== undefined ? item.yearOffsetPx : 77;
      elements.push(`<text x="${x}" y="${y + 11}" font-family="'Sarabun', 'Thonburi', sans-serif" font-size="${fs}" fill="${color}" font-weight="${bold}" dominant-baseline="central">${escapeXml(dVal)}</text>`);
      elements.push(`<text x="${x + mOffset}" y="${y + 11}" font-family="'Sarabun', 'Thonburi', sans-serif" font-size="${fs}" fill="${color}" font-weight="${bold}" dominant-baseline="central">${escapeXml(mVal)}</text>`);
      elements.push(`<text x="${x + yOffset}" y="${y + 11}" font-family="'Sarabun', 'Thonburi', sans-serif" font-size="${fs}" fill="${color}" font-weight="${bold}" dominant-baseline="central">${escapeXml(yVal)}</text>`);
    } else if (key === 'photoBox') {
      const avatar = m.avatar;
      const wBox = item.width || 95;
      const hBox = item.height || 123;
      if (avatar && (avatar.startsWith('data:') || avatar.startsWith('http://') || avatar.startsWith('https://'))) {
        elements.push(`<image href="${escapeXml(avatar)}" x="${x}" y="${y}" width="${wBox}" height="${hBox}" preserveAspectRatio="xMidYMid slice" rx="3"/>`);
      } else {
        elements.push(`<g transform="translate(${x},${y})"><rect width="${wBox}" height="${hBox}" fill="#f1f5f9" stroke="#94a3b8" rx="3"/><circle cx="${wBox / 2}" cy="42" r="22" fill="#0284c7" opacity="0.8"/><path d="M 12 ${hBox - 10} C 12 70, ${wBox - 12} 70, ${wBox - 12} ${hBox - 10} Z" fill="#0369a1" opacity="0.85"/></g>`);
      }
    } else if (key === 'applicantSignature') {
      elements.push(`<g transform="translate(${x},${y})">${APPLICANT_SIG_SVG}</g>`);
    } else if (key === 'registrarSignature') {
      elements.push(`<g transform="translate(${x},${y})">${REGISTRAR_SIG_SVG}</g>`);
    } else if (key === 'officerSignature') {
      elements.push(`<g transform="translate(${x},${y})">${SECRETARY_SIG_SVG}</g>`);
    } else {
      let val = '';
      if (key === 'fullName') val = rawFullName;
      else if (key === 'callsignOld') val = callsignOldVal;
      else if (key === 'callsignNew') val = callsignNewVal;
      else if (key === 'citizenId') val = m.citizenId || '1969900105532';
      else if (key === 'age') val = String(m.age || '34');
      else if (key === 'genderMaleCheck') val = (m.gender !== 'หญิง') ? '✓' : '';
      else if (key === 'genderFemaleCheck') val = (m.gender === 'หญิง') ? '✓' : '';
      else if (key === 'maritalCheck') val = '✓';
      else if (key === 'addressLine1') val = cleanAddr;
      else if (key === 'postalCode') val = m.postalCode || '90110';
      else if (key === 'phone') val = m.phone || '093-792-5665';
      else if (key === 'email') val = m.email || 'theepchalit@email.com';
      else if (key === 'lineId') val = m.lineId || 'E26ECG';
      else if (key === 'docIdCardCheck' || key === 'docPhotoCheck' || key === 'tierStandard5YCheck') val = '✓';
      else if (key === 'startDate') val = m.startDate || '16-11-2569';
      else if (key === 'endDate') val = m.endDate || '15-11-2574';
      else if (key === 'officerReceivedAmount') val = tierKey === 'lifetime' ? '2,500' : (tierKey === 'fiveYear' ? '500' : '0');
      else if (key === 'officerReceiptNo') val = m.receiptNo || settings.receiptNo || '0111';

      if (val) {
        elements.push(`<text x="${x}" y="${y + 11}" font-family="'Sarabun', 'Thonburi', sans-serif" font-size="${fs}" fill="${color}" font-weight="${bold}" dominant-baseline="central">${escapeXml(val)}</text>`);
      }
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_W} ${H}" width="${CANVAS_W}" height="${H}" style="max-width: 100%; height: auto; display: block;">
  <image href="${templateBg}" width="${CANVAS_W}" height="${H}" x="0" y="0"/>
  ${elements.join('\n  ')}
</svg>`;
}
// 2. Generate Thai Citizen ID Card Mockup
export function generateCitizenIdCardSvg(member) {
  const m = member || {};
  const fullName = m.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์';
  const nameEn = m.nameEnglish || 'Theepchalit Thongjun';
  const cleanId = String(m.citizenId || '1969900105532').replace(/\D/g, '').padEnd(13, 'X');
  const formattedId = `${cleanId.slice(0,1)} ${cleanId.slice(1,5)} ${cleanId.slice(5,10)} ${cleanId.slice(10,12)} ${cleanId.slice(12,13)}`;
  const avatar = m.avatar || '';

  const birthInfo = formatThaiDateDisplay(m.birthDate || '01/01/2535');
  const issueInfo = formatThaiDateDisplay(m.citizenIssueDate || '10/05/2569');
  const expiryInfo = formatThaiDateDisplay(m.citizenExpiryDate || '09/05/2579');
  const addr = m.currentAddress || m.registeredAddress || 'เลขที่ 5 ซอย 5 ถ.รามวิถี ต.บ่อยาง อ.เมืองสงขลา จ.สงขลา 90000';
  const signDate = m.registeredDate || '23 พ.ย. 2569';

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500" style="background:#e2e8f0; font-family:'Sarabun', sans-serif;">
  <!-- Card Base -->
  <rect x="25" y="25" width="750" height="450" rx="20" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" />
  
  <!-- Subtle Thai Pattern background -->
  <rect x="30" y="30" width="740" height="440" rx="18" fill="#f0f9ff" opacity="0.6" />
  <circle cx="400" cy="250" r="160" fill="none" stroke="#bae6fd" stroke-width="1.5" opacity="0.4" />

  <!-- Top Blue Bar -->
  <rect x="25" y="25" width="750" height="65" rx="20" fill="#0284c7" />
  <rect x="25" y="70" width="750" height="20" fill="#0284c7" />

  <!-- Garuda Emblem -->
  <g transform="translate(50, 32)">
    <circle cx="25" cy="25" r="22" fill="#f59e0b" />
    <path d="M 25 10 L 32 25 L 42 22 L 35 32 L 38 42 L 25 35 L 12 42 L 15 32 L 8 22 L 18 25 Z" fill="#b45309" />
  </g>

  <!-- Card Title -->
  <text x="120" y="55" font-size="16" font-weight="bold" fill="#ffffff">บัตรประจำตัวประชาชน Thai National ID Card</text>
  <text x="120" y="75" font-size="11" fill="#e0f2fe">สำนักบริหารการทะเบียน กรมการปกครอง กระทรวงมหาดไทย</text>

  <!-- Smart Chip -->
  <g transform="translate(60, 120)">
    <rect width="65" height="50" rx="6" fill="#fcd34d" stroke="#d97706" stroke-width="1.5" />
    <path d="M 0 25 L 65 25 M 32 0 L 32 50 M 20 0 L 20 50 M 45 0 L 45 50" stroke="#b45309" stroke-width="1" />
  </g>

  <!-- Citizen ID Number -->
  <text x="160" y="130" font-size="12" fill="#475569">เลขประจำตัวประชาชน / Identification Number</text>
  <text x="160" y="158" font-size="22" font-family="monospace" font-weight="bold" fill="#0f172a" letter-spacing="3">${formattedId}</text>

  <!-- Name Fields -->
  <text x="160" y="195" font-size="12" fill="#475569">ชื่อตัวและชื่อสกุล</text>
  <text x="160" y="220" font-size="17" font-weight="bold" fill="#0f172a">${fullName}</text>
  <text x="160" y="242" font-size="13" font-family="sans-serif" font-weight="bold" fill="#334155">${nameEn}</text>

  <!-- Details: Birth, Religion -->
  <text x="160" y="280" font-size="12" fill="#475569">เกิดวันที่ / Date of Birth</text>
  <text x="160" y="302" font-size="14" font-weight="bold" fill="#0f172a">${birthInfo.both}</text>

  <text x="380" y="280" font-size="12" fill="#475569">ศาสนา / Religion</text>
  <text x="380" y="302" font-size="14" font-weight="bold" fill="#0f172a">พุทธ</text>

  <!-- Address -->
  <text x="60" y="350" font-size="12" fill="#475569">ที่อยู่ / Address</text>
  <text x="60" y="375" font-size="13.5" font-weight="bold" fill="#0f172a">${addr}</text>

  <!-- Dates of Issue & Expiry -->
  <text x="60" y="420" font-size="11" fill="#475569">วันออกบัตร : ${issueInfo.thai}</text>
  <text x="60" y="438" font-size="10" fill="#64748b">Date of Issue : ${issueInfo.eng}</text>

  <text x="240" y="420" font-size="11" fill="#475569">วันบัตรหมดอายุ : ${expiryInfo.thai}</text>
  <text x="240" y="438" font-size="10" fill="#64748b">Date of Expiry : ${expiryInfo.eng}</text>

  <!-- Photo Box - Canvas Safe -->
  <g transform="translate(565, 120)">
    <rect width="180" height="230" rx="8" fill="#e2e8f0" stroke="#64748b" stroke-width="1.5" />
    ${avatar && avatar.startsWith('data:') ? `
      <image href="${avatar}" x="4" y="4" width="172" height="222" preserveAspectRatio="xMidYMid slice" rx="6" />
    ` : `
      <rect x="4" y="4" width="172" height="222" fill="#f8fafc" rx="6" />
      <circle cx="90" cy="85" r="42" fill="#0284c7" opacity="0.8" />
      <path d="M 25 195 C 25 135, 155 135, 155 195 Z" fill="#0369a1" opacity="0.85" />
      <circle cx="90" cy="85" r="32" fill="#ffffff" opacity="0.25" />
    `}
    <rect x="4" y="196" width="172" height="26" fill="#000000" opacity="0.65" rx="4" />
    <text x="90" y="213" font-size="11" font-family="monospace" text-anchor="middle" fill="#ffffff">THAI CITIZEN</text>
  </g>

  <!-- DIAGONAL CERTIFIED WATERMARK ACROSS THE CARD -->
  <g transform="translate(180, 290) rotate(-18)">
    <rect x="-20" y="-30" width="480" height="60" fill="#ffffff" opacity="0.88" rx="6" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="4,2" />
    <text x="220" y="-10" font-size="13" font-weight="bold" text-anchor="middle" fill="#1d4ed8">
      // สำเนาถูกต้อง ใช้เฉพาะสมัครสมาชิกสมาคมวิทยุสมัครเล่นสมิหลาเท่านั้น //
    </text>
    <text x="220" y="15" font-size="14" font-family="'Brush Script MT', cursive" font-weight="bold" text-anchor="middle" fill="#1e40af">
      ลงชื่อ ${fullName} (${signDate})
    </text>
  </g>
</svg>
`;
}

// 3. Generate House Registration (สำเนาทะเบียนบ้าน ท.ร.14) Mockup
export function generateHouseRegistrationSvg(member) {
  const m = member || {};
  const fullName = m.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์';
  const cleanId = String(m.citizenId || '1969900105532').replace(/\D/g, '').padEnd(13, 'X');
  const formattedId = `${cleanId.slice(0,1)} ${cleanId.slice(1,5)} ${cleanId.slice(5,10)} ${cleanId.slice(10,12)} ${cleanId.slice(12,13)}`;
  const signDate = m.registeredDate || '23 พ.ย. 2569';

  const fullAddr = m.registeredAddress || m.currentAddress || 'เลขที่ 5 ซอย 5 ถ.รามวิถี ต.บ่อยาง อ.เมืองสงขลา จ.สงขลา 90000';
  const parsed = parseAddressAndPostalCode(fullAddr, m.postalCode);
  const cleanAddr = parsed.cleanAddress;
  const pCode = parsed.postalDigits || '90000';

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 650" width="800" height="650" style="background:#ffffff; font-family:'Sarabun', sans-serif;">
  <rect x="20" y="20" width="760" height="610" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" />
  <rect x="28" y="28" width="744" height="594" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />

  <!-- Garuda -->
  <g transform="translate(375, 45)">
    <circle cx="25" cy="25" r="22" fill="#ef4444" opacity="0.9" />
    <path d="M 25 10 L 32 25 L 42 22 L 35 32 L 38 42 L 25 35 L 12 42 L 15 32 L 8 22 L 18 25 Z" fill="#ffffff" />
  </g>

  <text x="400" y="115" font-size="18" font-weight="bold" text-anchor="middle" fill="#0f172a">สำเนาทะเบียนบ้าน (ท.ร.14)</text>
  <text x="400" y="135" font-size="12" text-anchor="middle" fill="#475569">กรมการปกครอง กระทรวงมหาดไทย</text>

  <!-- House Details Box -->
  <rect x="50" y="155" width="700" height="110" fill="#ffffff" stroke="#cbd5e1" rx="4" />
  <g transform="translate(70, 185)" font-size="12" fill="#1e293b">
    <text x="0" y="0">รหัสประจำบ้าน : <tspan font-family="monospace" font-weight="bold" fill="#0369a1">9001-${cleanId.slice(0, 6)}-2</tspan></text>
    <text x="350" y="0">สำนักทะเบียน : <tspan font-weight="bold">ท้องถิ่นเทศบาลนครสงขลา</tspan></text>

    <text x="0" y="32">ที่อยู่ตามทะเบียน : <tspan font-weight="bold" fill="#0f172a">${cleanAddr}</tspan></text>
    <text x="0" y="62">รหัสไปรษณีย์ : <tspan font-family="monospace" font-weight="bold" fill="#0369a1">${pCode}</tspan></text>
  </g>

  <!-- Resident Person Table -->
  <rect x="50" y="280" width="700" height="200" fill="#ffffff" stroke="#cbd5e1" rx="4" />
  <rect x="50" y="280" width="700" height="35" fill="#f1f5f9" stroke="#cbd5e1" />
  <text x="70" y="302" font-size="11" font-weight="bold" fill="#334155">ลำดับ</text>
  <text x="120" y="302" font-size="11" font-weight="bold" fill="#334155">ชื่อตัว - ชื่อสกุล</text>
  <text x="340" y="302" font-size="11" font-weight="bold" fill="#334155">เลขประจำตัวประชาชน</text>
  <text x="520" y="302" font-size="11" font-weight="bold" fill="#334155">สถานภาพ</text>
  <text x="640" y="302" font-size="11" font-weight="bold" fill="#334155">สัญชาติ</text>

  <!-- Person Row 1 -->
  <g transform="translate(70, 340)" font-size="12" fill="#0f172a">
    <text x="0" y="0">1</text>
    <text x="50" y="0" font-weight="bold" fill="#0369a1">${fullName}</text>
    <text x="270" y="0" font-family="monospace" font-weight="bold">${formattedId}</text>
    <text x="450" y="0" font-weight="bold" fill="#16a34a">เจ้าบ้าน/ผู้อาศัย</text>
    <text x="570" y="0">ไทย</text>
  </g>

  <!-- Official Stamping -->
  <g transform="translate(560, 500)">
    <text x="70" y="30" font-size="11" text-anchor="middle" fill="#475569">ลงชื่อนายทะเบียนท้องถิ่น</text>
    <text x="70" y="55" font-size="13" font-family="'Brush Script MT', cursive" font-weight="bold" text-anchor="middle" fill="#1e40af">พิพัฒน์ นายทะเบียน</text>
    <text x="70" y="75" font-size="10" text-anchor="middle" fill="#64748b">(นายพิพัฒน์ สิทธิประชาราษฎร์)</text>
  </g>

  <!-- WATERMARK -->
  <g transform="translate(180, 420) rotate(-14)">
    <rect x="-20" y="-30" width="480" height="60" fill="#ffffff" opacity="0.9" rx="6" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="4,2" />
    <text x="220" y="-10" font-size="13" font-weight="bold" text-anchor="middle" fill="#1d4ed8">
      // สำเนาถูกต้อง ใช้เฉพาะสมัครสมาชิกสมาคมวิทยุสมัครเล่นสมิหลาเท่านั้น //
    </text>
    <text x="220" y="15" font-size="14" font-family="'Brush Script MT', cursive" font-weight="bold" text-anchor="middle" fill="#1e40af">
      ลงชื่อ ${fullName} (${signDate})
    </text>
  </g>
</svg>
`;
}

// 4. Generate Krungthai Bank Transfer Slip Mockup (สลิปโอนเงิน ธ.กรุงไทย)
export function generateBankSlipSvg(member) {
  const m = member || {};
  const fullName = m.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์';
  const isLifetime = (m.memberType || '').includes('ตลอดชีพ');
  const isHonorary = (m.memberType || '').includes('กิตติมศักดิ์');
  const isOrg = (m.memberType || '').includes('องค์กร');
  const feeNum = isLifetime ? 2500 : (isHonorary || isOrg ? 0 : 500);
  const amount = feeNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const cleanLast4 = String(m.citizenId || '1234').replace(/\D/g, '').slice(-4) || '8876';
  const desc = isLifetime ? 'ค่าบำรุงสมาชิกตลอดชีพ (2,500 บาท)' : (isHonorary ? 'สมาชิกกิตติมศักดิ์' : 'ค่าบำรุงสมาชิก 5 ปี (500 บาท)');

  const now = new Date();
  const thaiMonthsShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const dateStr = `${now.getDate()} ${thaiMonthsShort[now.getMonth()]} ${now.getFullYear() + 543} - ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} น.`;
  const refNo = `KTB${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(Date.now()).slice(-6)}`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 850" width="600" height="850" style="background:#f1f5f9; font-family:'Sarabun', sans-serif;">
  <!-- Phone/Slip Canvas Base -->
  <rect x="25" y="25" width="550" height="800" rx="24" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />
  
  <!-- Krungthai Header Gradient -->
  <rect x="25" y="25" width="550" height="150" rx="24" fill="#00a3e0" />
  <rect x="25" y="140" width="550" height="35" fill="#00a3e0" />

  <!-- Krungthai Logo (Blue Bird Vector) -->
  <g transform="translate(55, 55)">
    <circle cx="30" cy="30" r="28" fill="#ffffff" />
    <!-- Bird shape -->
    <path d="M 20 38 Q 30 18 42 25 Q 38 32 30 35 Q 24 38 20 38 Z" fill="#00a3e0" />
    <circle cx="34" cy="24" r="2" fill="#ffffff" />
  </g>

  <text x="130" y="80" font-size="20" font-weight="bold" fill="#ffffff">Krungthai NEXT</text>
  <text x="130" y="102" font-size="13" fill="#e0f7ff">ธนาคารกรุงไทย • โอนเงินสำเร็จ</text>

  <!-- Big Amount Block -->
  <g transform="translate(55, 205)">
    <text x="245" y="0" font-size="12" text-anchor="middle" fill="#64748b">จำนวนเงินที่โอน</text>
    <text x="245" y="38" font-size="34" font-weight="bold" font-family="monospace" text-anchor="middle" fill="#0284c7">฿${amount}</text>
    <text x="245" y="60" font-size="11" text-anchor="middle" fill="#10b981">● ค่าธรรมเนียม 0.00 บาท</text>
  </g>

  <line x1="55" y1="285" x2="545" y2="285" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="6,4" />

  <!-- Transaction Details -->
  <g transform="translate(55, 315)" font-size="12" fill="#1e293b">
    
    <!-- FROM -->
    <circle cx="15" cy="15" r="14" fill="#f0f9ff" stroke="#0284c7" />
    <text x="15" y="19" font-size="10" font-weight="bold" text-anchor="middle" fill="#0284c7">จาก</text>
    <text x="40" y="10" font-size="11" fill="#64748b">ผู้โอนเงิน</text>
    <text x="40" y="28" font-size="13.5" font-weight="bold" fill="#0f172a">${fullName}</text>
    <text x="40" y="46" font-size="11" font-family="monospace" fill="#475569">ธ.กรุงไทย • xxx-x-xx${cleanLast4}-0</text>

    <!-- TO -->
    <g transform="translate(0, 75)">
      <circle cx="15" cy="15" r="14" fill="#eff6ff" stroke="#2563eb" />
      <text x="15" y="19" font-size="10" font-weight="bold" text-anchor="middle" fill="#2563eb">ถึง</text>
      <text x="40" y="10" font-size="11" fill="#64748b">ผู้รับเงิน (บัญชีทางการสมาคมฯ)</text>
      <text x="40" y="28" font-size="13.5" font-weight="bold" fill="#0f172a">สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา</text>
      <text x="40" y="46" font-size="12" font-family="monospace" font-weight="bold" fill="#0369a1">ธ.กรุงไทย • 901-3-39431-0</text>
    </g>

    <!-- REF & DATE -->
    <g transform="translate(0, 160)" font-size="11.5">
      <text x="0" y="0" fill="#64748b">วันที่ทำรายการ :</text>
      <text x="130" y="0" font-weight="bold" fill="#0f172a">${dateStr}</text>

      <text x="0" y="25" fill="#64748b">รหัสอ้างอิง :</text>
      <text x="130" y="25" font-family="monospace" font-weight="bold" fill="#0284c7">${refNo}</text>

      <text x="0" y="50" fill="#64748b">ประเภทรายการ :</text>
      <text x="130" y="50" font-weight="bold" fill="#0f172a">${desc}</text>
    </g>
  </g>

  <!-- QR CODE VERIFICATION BOX -->
  <g transform="translate(200, 565)">
    <rect width="200" height="200" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
    <!-- Mock QR pattern -->
    <g transform="translate(25, 25)">
      <rect x="0" y="0" width="40" height="40" fill="#0f172a" />
      <rect x="6" y="6" width="28" height="28" fill="#ffffff" />
      <rect x="12" y="12" width="16" height="16" fill="#0f172a" />

      <rect x="110" y="0" width="40" height="40" fill="#0f172a" />
      <rect x="116" y="6" width="28" height="28" fill="#ffffff" />
      <rect x="122" y="12" width="16" height="16" fill="#0f172a" />

      <rect x="0" y="110" width="40" height="40" fill="#0f172a" />
      <rect x="6" y="116" width="28" height="28" fill="#ffffff" />
      <rect x="12" y="122" width="16" height="16" fill="#0f172a" />

      <!-- Center Krungthai bird -->
      <circle cx="75" cy="75" r="16" fill="#00a3e0" />
      <circle cx="75" cy="75" r="13" fill="#ffffff" />
      <path d="M 70 79 Q 75 69 81 72 Q 79 76 75 77 Z" fill="#00a3e0" />
    </g>
    <text x="100" y="185" font-size="10" text-anchor="middle" fill="#64748b">สแกนตรวจสอบสลิปนี้ได้</text>
  </g>

  <!-- Success Badge -->
  <g transform="translate(435, 175)">
    <circle cx="20" cy="20" r="18" fill="#10b981" />
    <path d="M 12 20 L 17 25 L 28 14" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" />
  </g>

  <!-- Footer -->
  <text x="300" y="805" font-size="10" text-anchor="middle" fill="#94a3b8">
    e-Slip หลักฐานการโอนเงิน • สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา
  </text>
</svg>
`;
}

// 5. Generate Official Certificate of Membership SVG (หนังสือรับรองสถานะการเป็นสมาชิก)

// 5. OFFICIAL CERTIFICATE OF MEMBERSHIP (Using real scanned template & saved layout coordinates)
export function generateCertificateSvg(member, settings = {}) {
  const m = member || {};
  const pos = settings.positions || getActiveLayout('certificate');
  const templateBg = settings.templateBackground || DEFAULT_CERT_TEMPLATE_BASE64;
  const CANVAS_W = 794;
  const H = 1027;

  const rawFullName = m.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)';
  const dateParts = parseThaiDateParts(m.registeredDate || m.approvedAt || '16/11/2569');
  const birthParts = parseThaiDateParts(m.birthDate || '16/09/2530');
  const elements = [];

  Object.entries(pos).forEach(([key, item]) => {
    if (!item || item.hidden) return;
    const x = (item.x / 100) * CANVAS_W;
    const y = (item.y / 100) * H;
    const fs = item.fontSize || 13;
    const color = item.color || '#0433ff';
    const bold = item.bold ? 'bold' : 'normal';

    if (key === 'certDateGroup' || item.type === 'dateGroup') {
      const mOffset = item.monthOffsetPx !== undefined ? item.monthOffsetPx : 20;
      const yOffset = item.yearOffsetPx !== undefined ? item.yearOffsetPx : 91;
      elements.push(`<text x="${x}" y="${y + 11}" font-family="'Sarabun', 'Thonburi', sans-serif" font-size="${fs}" fill="${color}" font-weight="${bold}" dominant-baseline="central">${escapeXml(dateParts.d)}</text>`);
      elements.push(`<text x="${x + mOffset}" y="${y + 11}" font-family="'Sarabun', 'Thonburi', sans-serif" font-size="${fs}" fill="${color}" font-weight="${bold}" dominant-baseline="central">${escapeXml(dateParts.mFull)}</text>`);
      elements.push(`<text x="${x + yOffset}" y="${y + 11}" font-family="'Sarabun', 'Thonburi', sans-serif" font-size="${fs}" fill="${color}" font-weight="${bold}" dominant-baseline="central">${escapeXml(dateParts.y)}</text>`);
    } else if (key === 'presidentSignature') {
      elements.push(`<g transform="translate(${x},${y})">${PRESIDENT_SIG_SVG}</g>`);
    } else {
      let val = '';
      if (key === 'headerTitle') val = 'หนังสือรับรองสถานะการเป็นสมาชิก';
      else if (key === 'writtenAt') val = 'สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา';
      else if (key === 'certDate') val = `${dateParts.d} ${dateParts.mFull} ${dateParts.y}`;
      else if (key === 'memberName') val = rawFullName;
      else if (key === 'callsign') val = (m.callsign && m.callsign !== '-') ? m.callsign : '-';
      else if (key === 'citizenId') val = m.citizenId || '1969900105532';
      else if (key === 'birthDate') val = `${birthParts.d} ${birthParts.mFull} ${birthParts.y}`;
      else if (key === 'registeredAddress') val = m.registeredAddress || m.currentAddress || '66 ถนนเลียบคลองชลประทาน ต.ควนลัง อ.หาดใหญ่ จ.สงขลา 90110';
      else if (key === 'phone') val = m.phone || '093-792-5665';
      else if (key === 'memberId') val = String(m.memberId || '369113');
      else if (key === 'memberType') val = m.memberType || 'สมาชิกสามัญ 5 ปี';
      else if (key === 'startDate') val = m.startDate || '16 พฤศจิกายน 2569';
      else if (key === 'endDate') val = m.endDate || '15 พฤศจิกายน 2574';

      if (val) {
        elements.push(`<text x="${x}" y="${y + 11}" font-family="'Sarabun', 'Thonburi', sans-serif" font-size="${fs}" fill="${color}" font-weight="${bold}" dominant-baseline="central">${escapeXml(val)}</text>`);
      }
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_W} ${H}" width="${CANVAS_W}" height="${H}" style="max-width: 100%; height: auto; display: block;">
  <image href="${templateBg}" width="${CANVAS_W}" height="${H}" x="0" y="0"/>
  ${elements.join('\n  ')}
</svg>`;
}

// 6. OFFICIAL RECEIPT (Using real scanned template & saved layout coordinates)
export function generateReceiptSvg(member, receiptInfo = {}, settings = {}) {
  const m = member || {};
  const pos = settings.positions || getActiveLayout('receipt');
  const templateBg = settings.templateBackground || DEFAULT_RECEIPT_TEMPLATE_BASE64;
  const CANVAS_W = 794;
  const H = 1078;

  const rawFullName = m.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)';
  const dateParts = parseThaiDateParts(m.registeredDate || m.approvedAt || '16/11/2569');
  const bookNo = String(receiptInfo.bookNo || m.bookNo || '03');
  const receiptNo = String(receiptInfo.receiptNo || m.receiptNo || '0111');
  
  const tierKey = getMemberTierKey(m);
  const receiptTiers = settings.tierPositions || getReceiptTierPositions();
  const activeReceiptTier = receiptTiers[tierKey] || {
    honorary: { check: { x: 11.17, y: 55.66 }, amount: { x: 83, y: 56.6 } },
    lifetime: { check: { x: 11.18, y: 58.94 }, amount: { x: 79.87, y: 58.52 } },
    fiveYear: { check: { x: 11.18, y: 62.4 }, amount: { x: 80.16, y: 62.3 } },
    radioOrg: { check: { x: 11.03, y: 65.88 }, amount: { x: 83, y: 68.6 } }
  }[tierKey] || { check: { x: 11.18, y: 62.4 }, amount: { x: 80.16, y: 62.3 } };

  const isLifetime = tierKey === 'lifetime';
  const isOrg = tierKey === 'radioOrg' || tierKey === 'honorary';
  const amountStr = isLifetime ? '2,500.00' : (isOrg ? '0.00' : '500.00');
  const amountText = isLifetime ? 'สองพันห้าร้อยบาทถ้วน' : (isOrg ? 'ไม่ต้องชำระค่าบำรุง' : 'ห้าร้อยบาทถ้วน');

  const elements = [];

  Object.entries(pos).forEach(([key, item]) => {
    if (!item || item.hidden) return;
    let x = (item.x / 100) * CANVAS_W;
    let y = (item.y / 100) * H;
    const fs = item.fontSize || 15;
    const color = item.color || '#0284c7';
    const bold = item.bold ? 'bold' : 'normal';

    if (key === 'memberFeeTypeCheck') {
      x = (activeReceiptTier.check.x / 100) * CANVAS_W;
      y = (activeReceiptTier.check.y / 100) * H;
    } else if (key === 'memberFeeAmount') {
      x = (activeReceiptTier.amount.x / 100) * CANVAS_W;
      y = (activeReceiptTier.amount.y / 100) * H;
    }

    if (key === 'receiptDateGroup' || item.type === 'dateGroup') {
      const mo = item.monthOffsetPx !== undefined ? item.monthOffsetPx : 116;
      const yo = item.yearOffsetPx !== undefined ? item.yearOffsetPx : 249;
      elements.push(`<text x="${x}" y="${y + 11}" font-family="'Sarabun', 'Thonburi', sans-serif" font-size="${fs}" fill="${color}" font-weight="${bold}" dominant-baseline="central">${escapeXml(dateParts.d)}</text>`);
      elements.push(`<text x="${x + mo}" y="${y + 11}" font-family="'Sarabun', 'Thonburi', sans-serif" font-size="${fs}" fill="${color}" font-weight="${bold}" dominant-baseline="central">${escapeXml(dateParts.mThai)}</text>`);
      elements.push(`<text x="${x + yo}" y="${y + 11}" font-family="'Sarabun', 'Thonburi', sans-serif" font-size="${fs}" fill="${color}" font-weight="${bold}" dominant-baseline="central">${escapeXml(dateParts.y)}</text>`);
    } else if (key === 'signature') {
      elements.push(`<g transform="translate(${x},${y})">${SECRETARY_SIG_SVG}</g>`);
    } else {
      let val = '';
      if (key === 'bookNo') val = bookNo;
      else if (key === 'receiptNo') val = receiptNo;
      else if (key === 'payerName') val = rawFullName;
      else if (key === 'memberId') val = String(m.memberId || '369113');
      else if (key === 'address') val = m.currentAddress || m.registeredAddress || '66 ถนนเลียบคลองชลประทาน ต.ควนลัง อ.หาดใหญ่ จ.สงขลา 90110';
      else if (key === 'phone') val = m.phone || '093-792-5665';
      else if (key === 'memberFeeCheck') val = '✓';
      else if (key === 'memberFeeTypeCheck') val = '✓';
      else if (key === 'memberFeeAmount') val = isOrg ? '' : amountStr;
      else if (key === 'totalAmountNumber') val = isOrg ? '0' : amountStr;
      else if (key === 'totalAmountText') val = amountText;
      else if (key === 'signerPosition') val = 'เลขาธิการ / ผู้อำนวยการฝ่ายเทคโนโลยี';

      if (val) {
        elements.push(`<text x="${x}" y="${y + 11}" font-family="'Sarabun', 'Thonburi', sans-serif" font-size="${fs}" fill="${color}" font-weight="${bold}" dominant-baseline="central">${escapeXml(val)}</text>`);
      }
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_W} ${H}" width="${CANVAS_W}" height="${H}" style="max-width: 100%; height: auto; display: block;">
  <image href="${templateBg}" width="${CANVAS_W}" height="${H}" x="0" y="0"/>
  ${elements.join('\n  ')}
</svg>`;
}
