/**
 * Address and Postal Code parsing utilities for Samila Amateur Radio Association documents.
 * 
 * Requirements:
 * 1. The postal code should NOT be displayed on the address line (omit trailing 5-digit postal code).
 * 2. The postal code is extracted and placed directly into the 5 postal code boxes below.
 */

export function parseAddressAndPostalCode(rawAddress = '', explicitPostalCode = '') {
  const rawStr = (rawAddress || '').trim();

  // Pattern matching Thai postal code at the end of the address line,
  // optionally preceded by words like 'รหัสไปรษณีย์', 'ปณ.', 'ปณ', 'ไปรษณีย์'
  const trailingPostalPattern = /(?:รหัสไปรษณีย์|ปณ\.?|ไปรษณีย์)?\s*(\d{5})\s*$/;
  const match = rawStr.match(trailingPostalPattern);
  const any5Digits = rawStr.match(/\b\d{5}\b/);

  let postalCode = (explicitPostalCode || (match ? match[1] : (any5Digits ? any5Digits[0] : '90000'))).toString().trim();
  if (!postalCode) postalCode = '90000';
  // Ensure postal code is formatted to 5 digits
  postalCode = postalCode.padEnd(5, '0').slice(0, 5);

  // Clean address: strip the trailing postal code and its prefix keywords
  let cleanAddress = rawStr.replace(trailingPostalPattern, '').trim();
  // Strip trailing punctuation if left over (e.g. trailing comma, hyphen, dots)
  cleanAddress = cleanAddress.replace(/[, -]+$/, '').trim();

  if (!cleanAddress) {
    cleanAddress = 'เลขที่ 88 ถ.ไทรบุรี ต.บ่อยาง อ.เมือง จ.สงขลา';
  }

  // Split into lines if comma is present
  const tokens = cleanAddress.split(',');
  const line1 = tokens[0].trim();
  const line2 = tokens.length > 1 ? tokens.slice(1).join(',').trim() : '';

  return {
    rawAddress: rawStr,
    cleanAddress,
    addressLine1: line1,
    addressLine2: line2,
    postalCode,
    postalDigits: postalCode.split('')
  };
}
