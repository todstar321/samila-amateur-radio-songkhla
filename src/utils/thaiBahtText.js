/**
 * Convert numeric amount into Thai Baht text format
 * e.g. 500 -> "ห้าร้อยบาทถ้วน", 2600 -> "สองพันหกร้อยบาทถ้วน"
 */
export function thaiBahtText(number) {
  if (isNaN(number) || number === null || number === '' || number === undefined) return '';
  number = parseFloat(number);
  if (number === 0) return 'ศูนย์บาทถ้วน';

  const numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const split = number.toFixed(2).split('.');
  let integerPart = parseInt(split[0], 10);
  let decimalPart = parseInt(split[1], 10);

  function convertGroup(n) {
    let s = '';
    const digits = String(n).split('').map(Number);
    const len = digits.length;
    for (let i = 0; i < len; i++) {
      const d = digits[i];
      const pos = len - 1 - i;
      if (d !== 0) {
        if (pos === 1 && d === 1) {
          s += 'สิบ';
        } else if (pos === 1 && d === 2) {
          s += 'ยี่สิบ';
        } else if (pos === 0 && d === 1 && len > 1 && digits[len - 2] !== 0) {
          s += 'เอ็ด';
        } else {
          s += numbers[d] + units[pos];
        }
      }
    }
    return s;
  }

  let text = '';
  if (integerPart >= 1000000) {
    const millions = Math.floor(integerPart / 1000000);
    integerPart %= 1000000;
    text += convertGroup(millions) + 'ล้าน';
  }
  if (integerPart > 0) {
    text += convertGroup(integerPart);
  }
  text += 'บาท';

  if (decimalPart === 0) {
    text += 'ถ้วน';
  } else {
    text += convertGroup(decimalPart) + 'สตางค์';
  }

  return text;
}
