/**
 * Address and Postal Code parsing utilities for Samila Amateur Radio Association documents.
 * 
 * Requirements:
 * 1. The postal code should NOT be displayed on the address line (omit trailing 5-digit postal code).
 * 2. The postal code is extracted and placed directly into the 5 postal code boxes below.
 * 3. Telephone numbers mistakenly included in the address field are cleaned out and separated.
 * 4. Splitting between Line 1 and Line 2 preserves balanced parentheses and word boundaries.
 */

export function parseAddressAndPostalCode(rawAddress = '', explicitPostalCode = '') {
  let rawStr = (rawAddress || '').trim();

  // 1. Strip redundant telephone numbers mistakenly entered into address
  const phonePattern = /(?:เบอร์โทรศัพท์|เบอร์โทร|โทรศัพท์|โทร\.?|tel\.?|phone:?)\s*[:\-\d\s]+/gi;
  rawStr = rawStr.replace(phonePattern, ' ').trim();

  // 2. Extract 5-digit postal code (with or without prefixes)
  const postalWithPrefixPattern = /(?:รหัสไปรษณีย์|ปณ\.?|ไปรษณีย์)\s*(\d{5})/i;
  const trailingPostalPattern = /(?:รหัสไปรษณีย์|ปณ\.?|ไปรษณีย์)?\s*(\d{5})\s*$/;
  const any5DigitsPattern = /\b\d{5}\b/;

  const postalMatch = rawStr.match(postalWithPrefixPattern) || rawStr.match(trailingPostalPattern) || rawStr.match(any5DigitsPattern);
  const extractedPostal = explicitPostalCode || (postalMatch ? (postalMatch[1] || postalMatch[0]) : '90000');
  let cleanPostal = String(extractedPostal).replace(/\D/g, '').padEnd(5, '0').slice(0, 5);
  if (!cleanPostal || cleanPostal === '00000') cleanPostal = '90110';

  // 3. Remove the postal code and prefix keywords from the address line
  let cleanAddress = rawStr
    .replace(/(?:รหัสไปรษณีย์|ปณ\.?|ไปรษณีย์)\s*\d{5}/gi, '')
    .replace(/\b\d{5}\b/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[, -]+$/, '')
    .trim();

  // Remove empty parentheses like ()
  cleanAddress = cleanAddress.replace(/\(\s*\)/g, '').trim();

  if (!cleanAddress) {
    cleanAddress = 'เลขที่ 88 ถ.ไทรบุรี ต.บ่อยาง อ.เมือง จ.สงขลา';
  }

  // 4. Split into Address Line 1 and Address Line 2
  let line1 = cleanAddress;
  let line2 = '';

  if (cleanAddress.includes(',')) {
    const tokens = cleanAddress.split(',');
    line1 = tokens[0].trim();
    line2 = tokens.slice(1).join(',').trim();
  } else if (cleanAddress.length > 45) {
    // Look for natural breakpoint between character 32 and 52 (district, subdistrict, road, space)
    const splitMatch = cleanAddress.slice(32, 52).search(/[,\s]|(?=ต\.|อ\.|จ\.|ถ\.|ซ\.)/);
    if (splitMatch !== -1) {
      const splitIdx = 32 + splitMatch;
      line1 = cleanAddress.slice(0, splitIdx).trim();
      line2 = cleanAddress.slice(splitIdx).trim();
    } else {
      line1 = cleanAddress.slice(0, 45).trim();
      line2 = cleanAddress.slice(45).trim();
    }
  }

  // Balance parentheses across line 1 and line 2 (e.g. "(ทุ่งเขียวหวาน)" instead of "(ทุ่งเขียวหวาน" / ")")
  if (line1.includes('(') && !line1.includes(')') && line2.startsWith(')')) {
    line1 = line1 + ')';
    line2 = line2.slice(1).trim();
  }

  return {
    rawAddress: (rawAddress || '').trim(),
    cleanAddress,
    addressLine1: line1,
    addressLine2: line2,
    postalCode: cleanPostal,
    postalDigits: cleanPostal.split('')
  };
}
