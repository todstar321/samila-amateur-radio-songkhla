// Generator functions for realistic official documents for Samila Amateur Radio Association
// Produces crisp SVG strings that can be displayed or converted directly to PNG images for download
import { parseAddressAndPostalCode } from './addressUtils.js';
import { thaiBahtText } from './thaiBahtText.js';

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

export function generateApplicationFormSvg(member, settings = {}) {
  const m = member || {};
  const fullName = m.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์';
  
  // Extract clean prefix, first name, last name
  let prefix = m.prefix || '';
  let restOfName = fullName;
  if (!prefix) {
    const knownPrefixes = ['ว่าที่ ร.ต.หญิง', 'ว่าที่ ร.ต.', 'นางสาว', 'นาย', 'นาง', 'ร.ต.', 'พ.ต.', 'พ.ต.อ.', 'ด.ต.', 'ด.ช.', 'ด.ญ.'];
    for (const p of knownPrefixes) {
      if (fullName.startsWith(p)) {
        prefix = p;
        restOfName = fullName.slice(p.length).trim();
        break;
      }
    }
  } else if (fullName.startsWith(prefix)) {
    restOfName = fullName.slice(prefix.length).trim();
  }
  const parts = restOfName.split(/\s+/);
  const firstName = parts[0] || restOfName;
  const lastName = parts.slice(1).join(' ') || '';
  const displayTitle = prefix || (m.gender === 'หญิง' ? 'นางสาว' : 'นาย');

  const isExpired = m.callsignSubStatus === 'expired';
  const hasCallsign = m.callsignType === 'has' || (m.callsign && m.callsign !== '-');
  const formerCallsign = m.formerCallsign || (hasCallsign && isExpired ? m.callsign : '-');
  const newCallsign = hasCallsign && !isExpired ? m.callsign : (isExpired ? `ขอต่ออายุ (${m.callsign})` : 'รอขอรับจาก กสทช.');

  const cleanCitizen = String(m.citizenId || '').replace(/\D/g, '').padEnd(13, ' ');
  const citizenId = cleanCitizen.slice(0, 13).split('');
  const issueDate = m.citizenIssueDate || '10/05/2569';
  const expiryDate = m.citizenExpiryDate || '09/05/2579';

  const birthDate = m.birthDate || '01/01/2535';
  const age = m.age || '34';
  const gender = m.gender || 'ชาย';
  const marital = m.maritalStatus || 'โสด';

  // Parse address: strip postal code from address line and sync into postal boxes
  const parsedAddr = parseAddressAndPostalCode(m.currentAddress || m.registeredAddress || 'เลขที่ 5 ซอย 5 ถ.รามวิถี ต.บ่อยาง อ.เมืองสงขลา จ.สงขลา', m.postalCode);
  const address = parsedAddr.cleanAddress;
  const postalCode = String(parsedAddr.postalDigits || m.postalCode || '90000').padEnd(5, ' ').slice(0, 5).split('');

  const phone = m.phone || '093-792-5665';
  const email = m.email || '-';
  const lineId = m.lineId || '-';
  const memberId = String(m.memberId || '30001').padEnd(7, ' ').slice(0, 7).split('');

  const memberType = m.memberType || 'สมาชิกสามัญ 5 ปี';
  const isHonorary = memberType.includes('กิตติมศักดิ์') || m.membershipTierKey === '1';
  const isLifetime = memberType.includes('ตลอดชีพ') || m.membershipTierKey === '2';
  const is5Year = memberType.includes('5 ปี') || m.membershipTierKey === '3' || (!isHonorary && !isLifetime && !memberType.includes('องค์กร'));
  const isOrg = memberType.includes('องค์กร') || m.membershipTierKey === '4';
  const feeAmount = isLifetime ? '2,500.00' : (is5Year ? '500.00' : '0.00');

  const startDate = m.startDate || '23-11-2569';
  const endDate = m.endDate || (isLifetime ? 'ตลอดชีพ' : '22-11-2574');
  const appliedDate = m.registeredDate || m.appliedDate || '23/11/2569';
  const avatar = m.avatar || '';

  const approverName = m.approvedByAdminName || settings.presidentName || 'นายธานี รายศิริ';
  const approverCallsign = m.approvedByCallsign ? ` (${m.approvedByCallsign})` : '';
  const approvalDate = m.approvedAt || appliedDate;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1130" width="800" height="1130" style="background:#ffffff; font-family:'Sarabun', 'Thonburi', sans-serif;">
  <rect width="800" height="1130" fill="#ffffff" />
  
  <!-- Outer border border styling -->
  <rect x="25" y="25" width="750" height="1080" fill="none" stroke="#d1d5db" stroke-width="1" />

  <!-- HEADER -->
  <!-- Logo Area -->
  <g transform="translate(45, 45)">
    <circle cx="38" cy="38" r="36" fill="#0369a1" />
    <circle cx="38" cy="38" r="33" fill="#ffffff" />
    <path d="M 38 12 L 38 64 M 22 28 L 54 28 M 16 38 L 60 38 M 24 48 L 52 48" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="38" cy="20" r="4" fill="#f59e0b" />
    <path d="M 26 56 Q 38 48 50 56" stroke="#0f172a" stroke-width="2" fill="none" />
    <text x="38" y="70" font-size="7" font-weight="bold" text-anchor="middle" fill="#0369a1">HS9AS</text>
  </g>

  <!-- Header Titles -->
  <text x="380" y="65" font-size="18" font-weight="bold" text-anchor="middle" fill="#0f172a">สมาคมวิทยุสมัครเล่นสมิหลา จังหวัดสงขลา</text>
  <text x="380" y="85" font-size="12" font-weight="600" text-anchor="middle" fill="#334155" letter-spacing="1">SMILA AMATEUR RADIO SOCIETY OF SONGKHLA</text>
  <text x="380" y="103" font-size="11" font-weight="bold" text-anchor="middle" fill="#0369a1">สถานีวิทยุสมัครเล่นควบคุมข่ายประจำจังหวัดสงขลา HS9AS</text>
  <text x="380" y="119" font-size="10" text-anchor="middle" fill="#475569">เลขที่ 5 ซอย 5 ถ.รามวิถี ต.บ่อยาง อ.เมืองสงขลา จ.สงขลา 90000</text>

  <!-- Photo Box (1 นิ้ว) - Canvas-Safe -->
  <g transform="translate(635, 45)">
    <rect width="110" height="135" fill="#f8fafc" stroke="#64748b" stroke-width="1.2" stroke-dasharray="3,3" rx="4" />
    ${avatar && avatar.startsWith('data:') ? `
      <image href="${avatar}" x="5" y="5" width="100" height="125" preserveAspectRatio="xMidYMid slice" rx="3" />
    ` : `
      <rect x="5" y="5" width="100" height="125" fill="#f1f5f9" rx="3" />
      <circle cx="55" cy="50" r="24" fill="#0284c7" opacity="0.8" />
      <path d="M 22 118 C 22 84, 88 84, 88 118 Z" fill="#0369a1" opacity="0.85" />
      <circle cx="55" cy="50" r="18" fill="#ffffff" opacity="0.25" />
    `}
    <rect x="5" y="108" width="100" height="22" fill="#000000" opacity="0.65" rx="2" />
    <text x="55" y="123" font-size="9" font-weight="bold" text-anchor="middle" fill="#ffffff">รูปถ่าย 1 นิ้ว</text>
  </g>

  <!-- Top Reference Code Boxes -->
  <g transform="translate(560, 192)">
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `
      <rect x="${i * 16}" y="0" width="14" height="16" fill="#ffffff" stroke="#334155" stroke-width="1" />
      <text x="${i * 16 + 7}" y="12" font-size="10" font-family="monospace" text-anchor="middle" fill="#0f172a">${memberId[i] || ''}</text>
    `).join('')}
  </g>

  <!-- FORM TITLE -->
  <text x="400" y="195" font-size="18" font-weight="bold" text-anchor="middle" fill="#0f172a" letter-spacing="1">ใบสมัครสมาชิกสมาคม</text>
  <line x1="300" y1="202" x2="500" y2="202" stroke="#0f172a" stroke-width="1.2" />

  <!-- SECTION 1: APPLICANT DETAILS -->
  <g transform="translate(55, 230)" font-size="11.5" fill="#0f172a">
    <!-- Row 1: Name -->
    <text x="0" y="0">ชื่อ ............................................................................</text>
    <text x="25" y="-1" font-weight="bold" fill="#0369a1">${displayTitle} ${firstName}</text>

    <text x="340" y="0">นามสกุล ............................................................................</text>
    <text x="385" y="-1" font-weight="bold" fill="#0369a1">${lastName}</text>

    <!-- Row 2: Callsigns -->
    <text x="0" y="28">สัญญาณเรียกขานเดิม ....................................................</text>
    <text x="110" y="27" font-weight="bold" fill="#475569">${formerCallsign}</text>

    <text x="340" y="28">สัญญาณเรียกขานใหม่ ....................................................</text>
    <text x="450" y="27" font-weight="bold" fill="#b45309">${newCallsign}</text>

    <!-- Row 3: Citizen ID 13 boxes -->
    <text x="0" y="58">หมายเลขบัตรประชาชน</text>
    <g transform="translate(130, 44)">
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => `
        <rect x="${i * 18}" y="0" width="16" height="18" fill="#ffffff" stroke="#334155" stroke-width="1" />
        <text x="${i * 18 + 8}" y="14" font-size="11" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#0f172a">${citizenId[i] || ''}</text>
      `).join('')}
    </g>
    <text x="375" y="58">วันออกบัตร <tspan font-weight="bold" fill="#0369a1">${issueDate}</tspan> วันหมดอายุ <tspan font-weight="bold" fill="#0369a1">${expiryDate}</tspan></text>

    <!-- Row 4: Birth, Age, Gender -->
    <text x="0" y="88">วัน/เดือน/ปีเกิด .............................................</text>
    <text x="95" y="87" font-weight="bold" fill="#0f172a">${birthDate}</text>

    <text x="280" y="88">อายุ .................... ปี</text>
    <text x="310" y="87" font-weight="bold" fill="#0f172a">${age}</text>

    <text x="440" y="88">เพศ</text>
    <circle cx="480" cy="85" r="6" fill="${gender === 'ชาย' ? '#0284c7' : '#ffffff'}" stroke="#334155" stroke-width="1.2" />
    ${gender === 'ชาย' ? '<circle cx="480" cy="85" r="2.5" fill="#ffffff" />' : ''}
    <text x="495" y="88">ชาย</text>

    <circle cx="550" cy="85" r="6" fill="${gender === 'หญิง' ? '#0284c7' : '#ffffff'}" stroke="#334155" stroke-width="1.2" />
    ${gender === 'หญิง' ? '<circle cx="550" cy="85" r="2.5" fill="#ffffff" />' : ''}
    <text x="565" y="88">หญิง</text>

    <!-- Row 5: Marital status -->
    <text x="0" y="118">สถานภาพสมรส</text>
    
    <circle cx="100" cy="115" r="6" fill="${marital === 'โสด' ? '#0284c7' : '#ffffff'}" stroke="#334155" stroke-width="1.2" />
    ${marital === 'โสด' ? '<circle cx="100" cy="115" r="2.5" fill="#ffffff" />' : ''}
    <text x="115" y="118">โสด</text>

    <circle cx="170" cy="115" r="6" fill="${marital === 'สมรส' ? '#0284c7' : '#ffffff'}" stroke="#334155" stroke-width="1.2" />
    <text x="185" y="118">สมรส</text>

    <circle cx="240" cy="115" r="6" fill="${marital === 'หย่าร้าง' ? '#0284c7' : '#ffffff'}" stroke="#334155" stroke-width="1.2" />
    <text x="255" y="118">หย่าร้าง</text>

    <circle cx="330" cy="115" r="6" fill="#ffffff" stroke="#334155" stroke-width="1.2" />
    <text x="345" y="118">อื่น ๆ (ระบุ) ................................................................</text>

    <!-- Row 6 & 7: Address -->
    <text x="0" y="148">ที่อยู่ปัจจุบันที่สามารถติดต่อได้ ............................................................................................................................................</text>
    <text x="165" y="147" font-weight="bold" fill="#0f172a">${address}</text>

    <text x="0" y="178">รหัสไปรษณีย์</text>
    <g transform="translate(80, 164)">
      ${[0, 1, 2, 3, 4].map((i) => `
        <rect x="${i * 18}" y="0" width="16" height="18" fill="#ffffff" stroke="#334155" stroke-width="1" />
        <text x="${i * 18 + 8}" y="14" font-size="11" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#0f172a">${postalCode[i] || ''}</text>
      `).join('')}
    </g>

    <text x="195" y="178">เบอร์โทรศัพท์ ............................................................................................</text>
    <text x="270" y="177" font-weight="bold" fill="#0369a1">${phone}</text>

    <!-- Row 8: Email & Line -->
    <text x="0" y="208">E-MAIL ......................................................................</text>
    <text x="55" y="207" font-weight="bold" fill="#0f172a">${email}</text>

    <text x="340" y="208">LINE ID ......................................................................</text>
    <text x="395" y="207" font-weight="bold" fill="#0369a1">${lineId}</text>
  </g>

  <!-- SECTION 2: ATTACHED DOCUMENTS -->
  <g transform="translate(55, 470)">
    <text x="0" y="0" font-size="12" font-weight="bold" fill="#0f172a">เอกสารแนบรับรองสำเนาถูกต้อง (อย่างละ 1 ฉบับ)</text>
    
    <!-- Item 1 -->
    <circle cx="10" cy="22" r="6" fill="#0284c7" stroke="#334155" stroke-width="1.2" />
    <path d="M 7 22 L 9 25 L 14 19" stroke="#ffffff" stroke-width="1.8" fill="none" />
    <text x="25" y="26" font-size="11" fill="#0f172a">สำเนาบัตรประจำตัวประชาชน</text>

    <!-- Item 2 -->
    <circle cx="280" cy="22" r="6" fill="#0284c7" stroke="#334155" stroke-width="1.2" />
    <path d="M 277 22 L 279 25 L 284 19" stroke="#ffffff" stroke-width="1.8" fill="none" />
    <text x="295" y="26" font-size="11" fill="#0f172a">สำเนาบัตรใบอนุญาตพนักงานวิทยุสมัครเล่น</text>

    <!-- Item 3 -->
    <circle cx="10" cy="47" r="6" fill="#0284c7" stroke="#334155" stroke-width="1.2" />
    <path d="M 7 47 L 9 50 L 14 44" stroke="#ffffff" stroke-width="1.8" fill="none" />
    <text x="25" y="51" font-size="11" fill="#0f172a">รูปถ่ายสี 1 นิ้ว 1 รูป (ไม่เกิน 6 เดือน)</text>

    <!-- Item 4 -->
    <circle cx="280" cy="47" r="6" fill="#ffffff" stroke="#64748b" stroke-width="1.2" />
    <text x="295" y="51" font-size="11" fill="#64748b">สำเนาประกาศนียบัตรพนักงานวิทยุสมัครเล่น (ถ้ามี)</text>

    <!-- Item 5 & 6 Additional -->
    <circle cx="10" cy="72" r="6" fill="#0284c7" stroke="#334155" stroke-width="1.2" />
    <path d="M 7 72 L 9 75 L 14 69" stroke="#ffffff" stroke-width="1.8" fill="none" />
    <text x="25" y="76" font-size="11" fill="#0f172a">สำเนาทะเบียนบ้าน (เอกสารระบุที่อยู่ชัดเจน)</text>

    <circle cx="280" cy="72" r="6" fill="#0284c7" stroke="#334155" stroke-width="1.2" />
    <path d="M 277 72 L 279 75 L 284 69" stroke="#ffffff" stroke-width="1.8" fill="none" />
    <text x="295" y="76" font-size="11" fill="#0f172a">หลักฐานการชำระเงินค่าสมัคร ธ.กรุงไทย (สลิปโอนเงิน)</text>
  </g>

  <!-- SECTION 3: MEMBERSHIP TYPE -->
  <g transform="translate(55, 580)">
    <text x="0" y="0" font-size="12" font-weight="bold" fill="#0f172a">ประเภทสมาชิกมี 4 ประเภท (ตามระเบียบข้อบังคับสมาคมฯ)</text>

    <!-- Application Type Badges -->
    <g transform="translate(0, 16)" font-size="11" fill="#334155">
      <text x="0" y="10">${hasCallsign ? '( ) สมัครสมาชิกใหม่' : '(✓) สมัครสมาชิกใหม่'}</text>
      <text x="140" y="10">${isExpired ? '<tspan font-weight="bold" fill="#0369a1">(✓) ต่อบัตร/ขอคืนสัญญาณ</tspan>' : '( ) ต่อบัตร'}</text>
      <text x="290" y="10">${!hasCallsign ? '<tspan font-weight="bold" fill="#0369a1">(✓) ขอสัญญาณเรียกขาน</tspan>' : '( ) ขอสัญญาณเรียกขาน'}</text>
      <text x="440" y="10">( ) เลื่อนสถานะ</text>
    </g>

    <!-- Tier 1 -->
    <g transform="translate(0, 48)" font-size="11">
      <circle cx="10" cy="0" r="6" fill="${isHonorary ? '#0284c7' : '#ffffff'}" stroke="${isHonorary ? '#0284c7' : '#64748b'}" stroke-width="1.2" />
      ${isHonorary ? '<path d="M 7 0 L 9 3 L 14 -3" stroke="#ffffff" stroke-width="1.8" fill="none" />' : ''}
      <text x="25" y="4" font-weight="${isHonorary ? 'bold' : 'normal'}" fill="${isHonorary ? '#0f172a' : '#334155'}">1. กิตติมศักดิ์ ไม่ต้องชำระค่าใดๆ</text>
      <text x="420" y="4" fill="#64748b">รหัสสมาชิก</text>
      <g transform="translate(485, -10)">
        ${[0, 1, 2, 3, 4, 5, 6].map(i => `
          <rect x="${i*15}" y="0" width="13" height="15" fill="${isHonorary ? '#f0f9ff' : '#f8fafc'}" stroke="${isHonorary ? '#0284c7' : '#94a3b8'}" />
          <text x="${i * 15 + 6.5}" y="11" font-size="10" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#0369a1">${isHonorary ? (memberId[i] || '') : ''}</text>
        `).join('')}
      </g>
    </g>

    <!-- Tier 2 -->
    <g transform="translate(0, 72)" font-size="11">
      <circle cx="10" cy="0" r="6" fill="${isLifetime ? '#0284c7' : '#ffffff'}" stroke="${isLifetime ? '#0284c7' : '#64748b'}" stroke-width="1.2" />
      ${isLifetime ? '<path d="M 7 0 L 9 3 L 14 -3" stroke="#ffffff" stroke-width="1.8" fill="none" />' : ''}
      <text x="25" y="4" font-weight="${isLifetime ? 'bold' : 'normal'}" fill="${isLifetime ? '#0f172a' : '#334155'}">2. สามัญตลอดชีพ ชำระค่าบำรุงครั้งเดียว 2,500 บาท</text>
      <text x="420" y="4" fill="#64748b">รหัสสมาชิก</text>
      <g transform="translate(485, -10)">
        ${[0, 1, 2, 3, 4, 5, 6].map(i => `
          <rect x="${i*15}" y="0" width="13" height="15" fill="${isLifetime ? '#f0f9ff' : '#f8fafc'}" stroke="${isLifetime ? '#0284c7' : '#94a3b8'}" />
          <text x="${i * 15 + 6.5}" y="11" font-size="10" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#0369a1">${isLifetime ? (memberId[i] || '') : ''}</text>
        `).join('')}
      </g>
    </g>

    <!-- Tier 3 (Selected) -->
    <g transform="translate(0, 96)" font-size="11">
      <circle cx="10" cy="0" r="6" fill="${is5Year ? '#0284c7' : '#ffffff'}" stroke="${is5Year ? '#0284c7' : '#64748b'}" stroke-width="1.2" />
      ${is5Year ? '<path d="M 7 0 L 9 3 L 14 -3" stroke="#ffffff" stroke-width="1.8" fill="none" />' : ''}
      <text x="25" y="4" font-weight="${is5Year ? 'bold' : 'normal'}" fill="${is5Year ? '#0f172a' : '#334155'}">3. สามัญ 5 ปี ชำระค่าบำรุงครั้งละ 500 บาท (อายุ 5 ปี)</text>
      <text x="420" y="4" font-weight="${is5Year ? 'bold' : 'normal'}" fill="#0f172a">รหัสสมาชิก</text>
      <g transform="translate(485, -10)">
        ${[0, 1, 2, 3, 4, 5, 6].map((i) => `
          <rect x="${i * 15}" y="0" width="13" height="15" fill="${is5Year ? '#f0f9ff' : '#f8fafc'}" stroke="${is5Year ? '#0284c7' : '#94a3b8'}" stroke-width="1" />
          <text x="${i * 15 + 6.5}" y="11" font-size="10" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#0369a1">${is5Year ? (memberId[i] || '') : ''}</text>
        `).join('')}
      </g>
    </g>

    <!-- Tier 4 -->
    <g transform="translate(0, 120)" font-size="11">
      <circle cx="10" cy="0" r="6" fill="${isOrg ? '#0284c7' : '#ffffff'}" stroke="${isOrg ? '#0284c7' : '#64748b'}" stroke-width="1.2" />
      ${isOrg ? '<path d="M 7 0 L 9 3 L 14 -3" stroke="#ffffff" stroke-width="1.8" fill="none" />' : ''}
      <text x="25" y="4" font-weight="${isOrg ? 'bold' : 'normal'}" fill="${isOrg ? '#0f172a' : '#334155'}">4. รูปแบบขององค์กรวิทยุสมัครเล่น ไม่ต้องชำระค่าบำรุง</text>
      <text x="420" y="4" fill="#64748b">รหัสสมาชิก</text>
      <g transform="translate(485, -10)">
        ${[0, 1, 2, 3, 4, 5, 6].map(i => `
          <rect x="${i*15}" y="0" width="13" height="15" fill="${isOrg ? '#f0f9ff' : '#f8fafc'}" stroke="${isOrg ? '#0284c7' : '#94a3b8'}" />
          <text x="${i * 15 + 6.5}" y="11" font-size="10" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#0369a1">${isOrg ? (memberId[i] || '') : ''}</text>
        `).join('')}
      </g>
    </g>

    <!-- Dates -->
    <text x="0" y="152" font-size="11" fill="#0f172a">
      วันเริ่มต้นการเป็นสมาชิก <tspan font-weight="bold" fill="#0369a1">${startDate}</tspan> 
      <tspan dx="40">วันสิ้นสุดการเป็นสมาชิก</tspan> <tspan font-weight="bold" fill="#0369a1">${endDate}</tspan>
    </text>
  </g>

  <!-- SECTION 4: DECLARATION -->
  <g transform="translate(55, 765)">
    <text x="0" y="0" font-size="10.5" fill="#1e293b" width="690">
      <tspan x="0" dy="0">ข้าพเจ้าขอรับรองว่าข้อความข้างต้นกับเอกสารที่แนบมาเป็นความจริงทุกประการ ยินยอมให้ข้อมูลและสมาคมเก็บ</tspan>
      <tspan x="0" dy="18">รักษาเอกสารไว้เพื่อประกอบการรับสมัครสมาชิก จะปฏิบัติตามกฎข้อบังคับและระเบียบของสมาคมฯ ทุกประการ</tspan>
    </text>

    <!-- Signature Row -->
    <text x="10" y="60" font-size="11.5" fill="#0f172a">ลงชื่อผู้สมัคร ........................................................................................</text>
    <text x="90" y="58" font-size="13" font-family="'Brush Script MT', 'Dancing Script', cursive, sans-serif" font-weight="bold" fill="#0284c7">${fullName}</text>

    <text x="410" y="60" font-size="11.5" fill="#0f172a">สมัครวันที่ ......../......../............</text>
    <text x="470" y="59" font-weight="bold" fill="#0f172a">${appliedDate}</text>
  </g>

  <!-- SECTION 5: BOTTOM OFFICIAL BLOCKS (นายทะเบียน & เจ้าหน้าที่) -->
  <g transform="translate(55, 875)">
    <!-- Box 1: Registrar (Left) -->
    <rect x="0" y="0" width="335" height="145" fill="#fafafa" stroke="#475569" stroke-width="1.2" rx="2" />
    <text x="167" y="24" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">บันทึกนายทะเบียน</text>
    <line x1="15" y1="34" x2="320" y2="34" stroke="#e2e8f0" stroke-width="1" />

    <text x="167" y="70" font-size="12" text-anchor="middle" fill="#334155">................................................................</text>
    <text x="167" y="67" font-size="13" font-family="'Brush Script MT', cursive, sans-serif" font-weight="bold" text-anchor="middle" fill="#0369a1">${approverName}</text>
    
    <text x="167" y="90" font-size="11" font-weight="bold" text-anchor="middle" fill="#0f172a">${approverName}${approverCallsign}</text>
    <text x="167" y="106" font-size="10" text-anchor="middle" fill="#475569">แอดมิน / ผู้มีอำนาจลงนามอนุมัติ</text>
    <text x="167" y="128" font-size="10.5" text-anchor="middle" fill="#0f172a">วันที่อนุมัติ : <tspan font-weight="bold">${approvalDate}</tspan></text>

    <!-- Box 2: Officer Receipt (Right) -->
    <rect x="355" y="0" width="335" height="145" fill="#fafafa" stroke="#475569" stroke-width="1.2" rx="2" />
    <text x="522" y="24" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">บันทึกเจ้าหน้าที่</text>
    <line x1="370" y1="34" x2="675" y2="34" stroke="#e2e8f0" stroke-width="1" />

    <g transform="translate(375, 45)" font-size="11" fill="#0f172a">
      <!-- Checked box 1 -->
      <rect x="0" y="4" width="12" height="12" fill="#0284c7" stroke="#334155" stroke-width="1" />
      <path d="M 2 10 L 5 14 L 11 6" stroke="#ffffff" stroke-width="1.8" fill="none" />
      <text x="20" y="15">รับเงินค่าสมาชิก ....................................... บาท</text>
      <text x="125" y="14" font-weight="bold" fill="#0369a1">${feeAmount}</text>

      <!-- Checked box 2 -->
      <rect x="0" y="28" width="12" height="12" fill="#0284c7" stroke="#334155" stroke-width="1" />
      <path d="M 2 34 L 5 38 L 11 30" stroke="#ffffff" stroke-width="1.8" fill="none" />
      <text x="20" y="39">ใบเสร็จรับเงินเลขที่ ........................................</text>
      <text x="135" y="38" font-mono font-weight="bold" fill="#0369a1">${m.receiptNo || `SML-69-${String(m.memberId || '0115').slice(-4)}`}</text>

      <!-- Staff Signature -->
      <text x="0" y="65">ลงนามเจ้าหน้าที่ ......................................................</text>
      <text x="95" y="63" font-size="12" font-family="'Brush Script MT', cursive" font-weight="bold" fill="#475569">สมศรี เจ้าหน้าที่การเงิน</text>
      <text x="0" y="82" font-size="10" fill="#64748b">(นางสาวสมศรี สมิหลาการเงิน • รับชำระผ่าน ธ.กรุงไทย)</text>
    </g>
  </g>

  <!-- Official Association Stamp Overlay -->
  <g transform="translate(230, 930) rotate(-12)" opacity="0.82">
    <circle cx="45" cy="45" r="42" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,2" />
    <circle cx="45" cy="45" r="37" fill="none" stroke="#2563eb" stroke-width="1" />
    <path d="M 20 45 L 70 45" stroke="#2563eb" stroke-width="1" />
    <text x="45" y="30" font-size="7" font-weight="bold" text-anchor="middle" fill="#2563eb">สมาคมวิทยุสมัครเล่นสมิหลา</text>
    <text x="45" y="42" font-size="8" font-weight="bold" text-anchor="middle" fill="#2563eb">อนุมัติแล้ว</text>
    <text x="45" y="55" font-size="7" font-weight="bold" text-anchor="middle" fill="#2563eb">สงขลา • HS9AS</text>
  </g>

  <!-- FOOTER CREDIT -->
  <text x="400" y="1060" font-size="9.5" text-anchor="middle" fill="#64748b">
    เอกสารใบสมัครสมาชิกอย่างเป็นทางการ • สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา (HS9AS)
  </text>
  <text x="400" y="1078" font-size="9" text-anchor="middle" fill="#94a3b8">
    นักพัฒนาซอฟต์แวร์ คุณทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด) • นามเรียกขาน E26ECG • โทร 093-792-5665
  </text>
</svg>
`;
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
export function generateCertificateSvg(member, settings = {}) {
  const m = member || {};
  const fullName = m.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์';
  const nameEnglish = m.nameEnglish || 'Theepchalit Thongjun';
  const callsign = m.callsign && m.callsign !== '-' ? m.callsign : 'รอขอรับจาก กสทช.';
  const citizenId = m.citizenId || '1969900105532';
  const birthDate = m.birthDate || '10/05/2528';
  const registeredAddr = m.registeredAddress || m.currentAddress || 'เลขที่ 5 ซอย 5 ถ.รามวิถี ต.บ่อยาง อ.เมืองสงขลา จ.สงขลา 90000';
  const currentAddr = m.currentAddress || registeredAddr;
  const phone = m.phone || '093-792-5665';
  const memberType = m.memberType || 'สมาชิกสามัญ 5 ปี';
  const startDate = m.startDate || '12-04-2569';
  const endDate = m.endDate || '12-04-2574';
  const memberId = m.memberId || '30001';
  const presidentName = settings.presidentName || 'นายธานี รายศิริ';
  const presidentCallsign = settings.presidentCallsign || 'E23UBY';
  const registrarName = settings.registrarName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)';
  const registrarCallsign = settings.registrarCallsign || 'E26ECG';

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1280" width="900" height="1280" style="background:#ffffff; font-family:'Sarabun', 'Thonburi', sans-serif;">
  <rect width="900" height="1280" fill="#ffffff" />
  
  <!-- Outer Decorative Border -->
  <rect x="25" y="25" width="850" height="1230" fill="none" stroke="#0f172a" stroke-width="2" rx="4" />
  <rect x="33" y="33" width="834" height="1214" fill="none" stroke="#0284c7" stroke-width="0.8" rx="2" />
  <rect x="37" y="37" width="826" height="1206" fill="none" stroke="#d1d5db" stroke-width="0.5" stroke-dasharray="4,2" />

  <!-- Corner Ornaments -->
  <g fill="none" stroke="#0369a1" stroke-width="2">
    <path d="M 25 50 L 50 50 L 50 25" />
    <path d="M 875 50 L 850 50 L 850 25" />
    <path d="M 25 1230 L 50 1230 L 50 1255" />
    <path d="M 875 1230 L 850 1230 L 850 1255" />
  </g>

  <!-- Watermark Background Seal -->
  <g opacity="0.04" transform="translate(450, 640)">
    <circle cx="0" cy="0" r="240" fill="none" stroke="#0f172a" stroke-width="16" />
    <circle cx="0" cy="0" r="215" fill="none" stroke="#0f172a" stroke-width="3" />
    <text x="0" y="30" font-size="120" font-family="'Times New Roman', serif" font-weight="900" text-anchor="middle" fill="#0f172a">HS9AS</text>
  </g>

  <!-- HEADER -->
  <g transform="translate(70, 65)">
    <!-- Association Logo Vector -->
    <g transform="translate(0, 0)">
      <circle cx="45" cy="45" r="42" fill="#0369a1" />
      <circle cx="45" cy="45" r="39" fill="#ffffff" />
      <path d="M 45 15 L 45 75 M 26 34 L 64 34 M 18 45 L 72 45 M 28 56 L 62 56" stroke="#0284c7" stroke-width="3" stroke-linecap="round" />
      <circle cx="45" cy="24" r="5" fill="#f59e0b" />
      <path d="M 31 66 Q 45 56 59 66" stroke="#0f172a" stroke-width="2.5" fill="none" />
      <text x="45" y="82" font-size="9" font-weight="bold" text-anchor="middle" fill="#0369a1">HS9AS</text>
    </g>

    <text x="420" y="30" font-size="22" font-weight="bold" text-anchor="middle" fill="#0f172a">สมาคมวิทยุสมัครเล่นสมิหลา จังหวัดสงขลา</text>
    <text x="420" y="55" font-size="13" font-weight="bold" text-anchor="middle" fill="#0284c7" letter-spacing="1.5">SAMILA AMATEUR RADIO ASSOCIATION OF SONGKHLA PROVINCE</text>
    <text x="420" y="74" font-size="11.5" text-anchor="middle" fill="#475569">สถานีวิทยุสมัครเล่นควบคุมข่ายประจำจังหวัดสงขลา สัญญาณเรียกขาน HS9AS</text>
    <text x="420" y="92" font-size="10.5" text-anchor="middle" fill="#64748b">เลขที่ 5 ซอย 5 ถนนรามวิถี ตำบลบ่อยาง อำเภอเมืองสงขลา จังหวัดสงขลา 90000</text>
  </g>

  <!-- Title Banner -->
  <g transform="translate(70, 205)">
    <line x1="0" y1="0" x2="760" y2="0" stroke="#0369a1" stroke-width="2.5" />
    <text x="380" y="32" font-size="21" font-weight="bold" text-anchor="middle" fill="#0f172a" font-family="'Sarabun', serif">หนังสือรับรองสถานะการเป็นสมาชิก</text>
    <text x="380" y="52" font-size="11.5" font-weight="bold" text-anchor="middle" fill="#0284c7" letter-spacing="2">CERTIFICATE OF MEMBERSHIP</text>
    <line x1="0" y1="64" x2="760" y2="64" stroke="#0369a1" stroke-width="1.2" />
  </g>

  <!-- Writing Location & Date -->
  <g transform="translate(70, 295)" font-size="12" fill="#1e293b">
    <text x="760" y="0" text-anchor="end">เขียนที่ <tspan font-weight="bold">สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา</tspan></text>
    <text x="760" y="22" text-anchor="end">วันที่ <tspan font-weight="bold">${startDate}</tspan> เวลา <tspan font-weight="bold">${timeStr}</tspan></text>
  </g>

  <!-- Preamble -->
  <g transform="translate(70, 350)" font-size="13.5" fill="#1e293b">
    <text x="40" y="0">
      <tspan font-weight="bold">สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา</tspan> ขอรับรองว่ารายละเอียดของบุคคล ดังต่อไปนี้เป็นความจริงทุกประการ
    </text>
  </g>

  <!-- MEMBER DETAILS TABLE -->
  <g transform="translate(70, 390)">
    <!-- Table Frame -->
    <rect x="0" y="0" width="760" height="490" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2" rx="4" />
    
    <!-- Table Rows -->
    ${[
      { label: 'ชื่อ - นามสกุล (ภาษาไทย)', val: fullName, bold: true },
      { label: 'Name - Surname (English)', val: nameEnglish || '-', bold: false },
      { label: 'สัญญาณเรียกขาน (Callsign)', val: callsign, bold: true, color: '#0369a1' },
      { label: 'เลขประจำตัวประชาชน (13 หลัก)', val: citizenId, bold: true },
      { label: 'วัน เดือน ปี เกิด', val: birthDate, bold: false },
      { label: 'ที่อยู่ตามทะเบียนบ้าน', val: registeredAddr, bold: false },
      { label: 'ที่อยู่ที่สามารถติดต่อได้', val: currentAddr, bold: false },
      { label: 'หมายเลขโทรศัพท์ติดต่อ', val: phone, bold: false },
      { label: 'สถานภาพสมาชิก', val: memberType, bold: true, color: '#047857' },
      { label: 'อายุสมาชิกภาพ', val: `${startDate}  ถึง  ${endDate}`, bold: true },
      { label: 'เลขทะเบียนสมาชิกสมาคมฯ', val: memberId, bold: true, color: '#0f172a' }
    ].map((row, i) => {
      const y = i * 44.5;
      const bg = i % 2 === 0 ? '#f8fafc' : '#ffffff';
      return `
        <rect x="1" y="${y}" width="758" height="44.5" fill="${bg}" />
        <line x1="0" y1="${y}" x2="760" y2="${y}" stroke="#e2e8f0" stroke-width="1" />
        <text x="24" y="${y + 27}" font-size="12.5" font-weight="600" fill="#475569">${row.label}</text>
        <line x1="280" y1="${y}" x2="280" y2="${y + 44.5}" stroke="#e2e8f0" stroke-width="1" />
        <text x="295" y="${y + 27}" font-size="13" font-weight="${row.bold ? 'bold' : 'normal'}" fill="${row.color || '#0f172a'}">${row.val}</text>
      `;
    }).join('')}
  </g>

  <!-- Confirmation Paragraph -->
  <g transform="translate(70, 915)" font-size="13" fill="#334155">
    <text x="40" y="0">
      และได้รับการขึ้นทะเบียนเป็นสมาชิกที่ถูกต้องตามข้อบังคับของสมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา มีสิทธิและหน้าที่
    </text>
    <text x="0" y="22">
      ตามที่ระเบียบของสมาคมฯ กำหนดทุกประการ ออกให้ไว้เพื่อเป็นหลักฐาน
    </text>
  </g>

  <!-- OFFICIAL SIGNATURES & STAMPS -->
  <g transform="translate(70, 985)">
    <!-- President Signature (Left) -->
    <g transform="translate(60, 0)">
      <line x1="0" y1="50" x2="250" y2="50" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3" />
      <text x="125" y="42" font-size="15" font-family="'Brush Script MT', cursive" font-weight="bold" text-anchor="middle" fill="#0369a1">${presidentName}</text>
      <text x="125" y="72" font-size="12.5" font-weight="bold" text-anchor="middle" fill="#0f172a">(${presidentName})</text>
      <text x="125" y="90" font-size="11" text-anchor="middle" fill="#64748b">นายกสมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา</text>
      <text x="125" y="106" font-size="10.5" font-weight="bold" text-anchor="middle" fill="#0284c7">สัญญาณเรียกขาน ${presidentCallsign}</text>
    </g>

    <!-- Official Red Association Seal Stamp (Center) -->
    <g transform="translate(380, 50)">
      <circle cx="0" cy="0" r="48" fill="none" stroke="#dc2626" stroke-width="2.5" opacity="0.85" />
      <circle cx="0" cy="0" r="43" fill="none" stroke="#dc2626" stroke-width="1" opacity="0.85" stroke-dasharray="3,1.5" />
      <text x="0" y="-18" font-size="8.5" font-weight="bold" text-anchor="middle" fill="#dc2626">สมาคมวิทยุสมัครเล่นสมิหลา</text>
      <text x="0" y="6" font-size="16" font-weight="900" text-anchor="middle" fill="#dc2626">HS9AS</text>
      <text x="0" y="24" font-size="8" font-weight="bold" text-anchor="middle" fill="#dc2626">จังหวัดสงขลา</text>
    </g>

    <!-- Registrar Signature (Right) -->
    <g transform="translate(450, 0)">
      <line x1="0" y1="50" x2="250" y2="50" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3" />
      <text x="125" y="42" font-size="15" font-family="'Brush Script MT', cursive" font-weight="bold" text-anchor="middle" fill="#0369a1">${registrarName}</text>
      <text x="125" y="72" font-size="12.5" font-weight="bold" text-anchor="middle" fill="#0f172a">(${registrarName})</text>
      <text x="125" y="90" font-size="11" text-anchor="middle" fill="#64748b">นายทะเบียน / ผู้ช่วยนายทะเบียน</text>
      <text x="125" y="106" font-size="10.5" font-weight="bold" text-anchor="middle" fill="#0284c7">สัญญาณเรียกขาน ${registrarCallsign}</text>
    </g>
  </g>

  <!-- FOOTER DEVELOPER CREDIT -->
  <g transform="translate(450, 1240)">
    <text font-size="9" text-anchor="middle" fill="#94a3b8">
      นักพัฒนาซอฟต์แวร์ คุณทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด) • นามเรียกขาน : E26ECG / DE 246 • โทร 093-792-5665
    </text>
  </g>
</svg>
`;
}

// 6. Generate Official Receipt SVG (ใบเสร็จรับเงิน e-Receipt)
export function generateReceiptSvg(member, receiptInfo = {}, settings = {}) {
  const m = member || {};
  const fullName = m.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์';
  const callsign = m.callsign && m.callsign !== '-' ? m.callsign : '-';
  const address = m.currentAddress || m.registeredAddress || 'เลขที่ 5 ซ.5 ถ.รามวิถี ต.บ่อยาง อ.เมืองสงขลา จ.สงขลา 90000';
  const bookNo = receiptInfo.bookNo || '03';
  const receiptNo = receiptInfo.receiptNo || '0111';
  
  const now = new Date();
  const thaiMonthsShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const defaultDateStr = `${now.getDate()} ${thaiMonthsShort[now.getMonth()]} ${now.getFullYear() + 543}`;
  const date = receiptInfo.date || m.registeredDate || m.startDate || defaultDateStr;
  
  const isLifetime = (m.memberType || '').includes('ตลอดชีพ') || m.membershipTierKey === '2';
  const amount = isLifetime ? '2,500.00' : '500.00';
  const amountNum = isLifetime ? 2500 : 500;
  const amountText = thaiBahtText(amountNum) || (isLifetime ? 'สองพันห้าร้อยบาทถ้วน' : 'ห้าร้อยบาทถ้วน');
  const description = isLifetime ? 'ค่าบำรุงสมาชิกสมาคมฯ ประเภทตลอดชีพ (Life Membership Fee)' : 'ค่าบำรุงสมาชิกสมาคมฯ ประเภทสามัญ 5 ปี (5-Year Regular Membership Fee)';
  const officerName = receiptInfo.officerName || settings.registrarName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)';
  const officerCallsign = receiptInfo.officerCallsign || settings.registrarCallsign || 'E26ECG';

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 680" width="1000" height="680" style="background:#ffffff; font-family:'Sarabun', 'Thonburi', sans-serif;">
  <rect width="1000" height="680" fill="#ffffff" />
  
  <!-- Outer Frame -->
  <rect x="20" y="20" width="960" height="640" fill="none" stroke="#047857" stroke-width="2.5" rx="6" />
  <rect x="28" y="28" width="944" height="624" fill="none" stroke="#0284c7" stroke-width="0.8" rx="4" />
  <rect x="32" y="32" width="936" height="616" fill="none" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="4,2" />

  <!-- Corner Badges -->
  <g fill="none" stroke="#047857" stroke-width="2">
    <path d="M 20 45 L 45 45 L 45 20" />
    <path d="M 980 45 L 955 45 L 955 20" />
    <path d="M 20 635 L 45 635 L 45 660" />
    <path d="M 980 635 L 955 635 L 955 660" />
  </g>

  <!-- Watermark -->
  <g opacity="0.035" transform="translate(500, 360)">
    <circle cx="0" cy="0" r="160" fill="none" stroke="#047857" stroke-width="12" />
    <text x="0" y="20" font-size="80" font-weight="900" text-anchor="middle" fill="#047857">HS9AS</text>
  </g>

  <!-- HEADER -->
  <g transform="translate(55, 50)">
    <!-- Logo -->
    <g transform="translate(0, 5)">
      <circle cx="35" cy="35" r="32" fill="#047857" />
      <circle cx="35" cy="35" r="29" fill="#ffffff" />
      <path d="M 35 12 L 35 58 M 20 26 L 50 26 M 14 35 L 56 35 M 22 44 L 48 44" stroke="#047857" stroke-width="2.2" stroke-linecap="round" />
      <circle cx="35" cy="19" r="4" fill="#f59e0b" />
      <text x="35" y="62" font-size="7.5" font-weight="bold" text-anchor="middle" fill="#047857">HS9AS</text>
    </g>

    <text x="90" y="24" font-size="20" font-weight="bold" fill="#065f46">สมาคมวิทยุสมัครเล่นสมิหลา จังหวัดสงขลา</text>
    <text x="90" y="44" font-size="11" font-weight="bold" fill="#0284c7" letter-spacing="1">SAMILA AMATEUR RADIO ASSOCIATION OF SONGKHLA PROVINCE (HS9AS)</text>
    <text x="90" y="62" font-size="10.5" fill="#475569">เลขที่ 5 ซอย 5 ถนนรามวิถี ตำบลบ่อยาง อำเภอเมืองสงขลา จังหวัดสงขลา 90000</text>
  </g>

  <!-- RECEIPT TITLE & NUMBER BOX (Top Right) -->
  <g transform="translate(680, 48)">
    <rect x="0" y="0" width="265" height="85" fill="#ecfdf5" stroke="#059669" stroke-width="1.2" rx="4" />
    <text x="132" y="24" font-size="16" font-weight="bold" text-anchor="middle" fill="#065f46">ใบเสร็จรับเงิน (RECEIPT)</text>
    <line x1="10" y1="32" x2="255" y2="32" stroke="#a7f3d0" stroke-width="1" />
    <text x="20" y="52" font-size="12" fill="#065f46">เล่มที่ / Book No.: <tspan font-family="monospace" font-weight="bold" font-size="14" fill="#dc2626">${bookNo}</tspan></text>
    <text x="20" y="72" font-size="12" fill="#065f46">เลขที่ / Receipt No.: <tspan font-family="monospace" font-weight="bold" font-size="14" fill="#dc2626">${receiptNo}</tspan></text>
  </g>

  <!-- DATE ROW -->
  <g transform="translate(55, 150)" font-size="12.5" fill="#1e293b">
    <text x="890" y="0" text-anchor="end">วันที่ / Date: <tspan font-weight="bold">${date}</tspan></text>
  </g>

  <!-- PAYER DETAILS -->
  <g transform="translate(55, 180)" font-size="12.5" fill="#1e293b">
    <rect x="0" y="0" width="890" height="75" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" rx="4" />
    
    <text x="20" y="28">ได้รับเงินจาก / Received From: <tspan font-size="13.5" font-weight="bold" fill="#0f172a">${fullName}</tspan></text>
    <text x="560" y="28">สัญญาณเรียกขาน / Callsign: <tspan font-size="13.5" font-weight="bold" font-family="monospace" fill="#0369a1">${callsign}</tspan></text>

    <text x="20" y="55">ที่อยู่ / Address: <tspan font-size="12" fill="#334155">${address}</tspan></text>
  </g>

  <!-- ITEMS TABLE -->
  <g transform="translate(55, 275)">
    <!-- Table Header -->
    <rect x="0" y="0" width="890" height="34" fill="#065f46" rx="3" />
    <text x="45" y="22" font-size="12" font-weight="bold" text-anchor="middle" fill="#ffffff">ลำดับ (Item)</text>
    <line x1="90" y1="0" x2="90" y2="34" stroke="#047857" stroke-width="1" />
    <text x="420" y="22" font-size="12" font-weight="bold" text-anchor="middle" fill="#ffffff">รายการ (Description)</text>
    <line x1="720" y1="0" x2="720" y2="34" stroke="#047857" stroke-width="1" />
    <text x="805" y="22" font-size="12" font-weight="bold" text-anchor="middle" fill="#ffffff">จำนวนเงิน (Amount)</text>

    <!-- Table Row 1 -->
    <rect x="0" y="34" width="890" height="110" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
    <line x1="90" y1="34" x2="90" y2="144" stroke="#e2e8f0" stroke-width="1" />
    <line x1="720" y1="34" x2="720" y2="144" stroke="#e2e8f0" stroke-width="1" />
    
    <text x="45" y="70" font-size="13" text-anchor="middle" fill="#475569">1</text>
    
    <g transform="translate(110, 68)">
      <text font-size="13.5" font-weight="bold" fill="#0f172a">${description}</text>
      <text y="24" font-size="11.5" fill="#64748b">ระยะเวลาคุ้มครอง: ${member.startDate || date} ถึง ${member.endDate || 'ตลอดชีพ'}</text>
      <text y="44" font-size="11.5" fill="#64748b">เลขทะเบียนสมาชิก: ${member.memberId || '-'}</text>
    </g>

    <text x="850" y="70" font-size="14" font-weight="bold" font-family="monospace" text-anchor="end" fill="#065f46">฿${amount}</text>

    <!-- Table Total Row -->
    <rect x="0" y="144" width="890" height="42" fill="#ecfdf5" stroke="#cbd5e1" stroke-width="1" />
    <line x1="720" y1="144" x2="720" y2="186" stroke="#cbd5e1" stroke-width="1" />
    
    <text x="20" y="170" font-size="12.5" font-weight="bold" fill="#065f46">
      จำนวนเงินตัวอักษร / In Words: <tspan font-weight="bold" fill="#0f172a">(${amountText})</tspan>
    </text>

    <text x="710" y="170" font-size="12.5" font-weight="bold" text-anchor="end" fill="#065f46">รวมทั้งสิ้น / Total:</text>
    <text x="850" y="171" font-size="15" font-weight="bold" font-family="monospace" text-anchor="end" fill="#dc2626">฿${amount}</text>
  </g>

  <!-- SIGNATURE & STAMP ROW -->
  <g transform="translate(55, 490)">
    <!-- Official Stamp (Left) -->
    <g transform="translate(120, 60)">
      <circle cx="0" cy="0" r="42" fill="none" stroke="#dc2626" stroke-width="2" opacity="0.85" />
      <circle cx="0" cy="0" r="38" fill="none" stroke="#dc2626" stroke-width="0.8" opacity="0.85" stroke-dasharray="2,1" />
      <text x="0" y="-15" font-size="7.5" font-weight="bold" text-anchor="middle" fill="#dc2626">สมาคมวิทยุสมัครเล่นสมิหลา</text>
      <text x="0" y="5" font-size="14" font-weight="900" text-anchor="middle" fill="#dc2626">HS9AS</text>
      <text x="0" y="21" font-size="7" font-weight="bold" text-anchor="middle" fill="#dc2626">จังหวัดสงขลา</text>
    </g>

    <!-- Receiver Signature (Right) -->
    <g transform="translate(620, 10)">
      <text x="130" y="15" font-size="12" text-anchor="middle" fill="#475569">ผู้รับเงิน / Received By</text>
      <line x1="0" y1="52" x2="260" y2="52" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3" />
      <text x="130" y="44" font-size="15" font-family="'Brush Script MT', cursive" font-weight="bold" text-anchor="middle" fill="#0369a1">${officerName}</text>
      <text x="130" y="74" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">(${officerName})</text>
      <text x="130" y="92" font-size="10.5" text-anchor="middle" fill="#64748b">เหรัญญิก / ผู้ช่วยนายทะเบียน (${officerCallsign})</text>
    </g>
  </g>

  <!-- FOOTER -->
  <g transform="translate(500, 642)">
    <text font-size="8.5" text-anchor="middle" fill="#94a3b8">
      e-Receipt ใบเสร็จรับเงินอิเล็กทรอนิกส์ • สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา (HS9AS)
    </text>
  </g>
</svg>
`;
}

