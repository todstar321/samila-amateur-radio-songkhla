/**
 * Sequence Number Management for Samila Amateur Radio Association
 * 
 * Features:
 * 1. Member ID Auto-Sequence:
 *    - Configurable starting sequence (e.g. 30001).
 *    - Auto-increments when saving/recording members (30001 -> 30002 -> 30101...).
 *    - Manual override support (e.g. 'A0250' or legacy paper numbers) without breaking
 *      the main numerical auto-increment counter.
 * 
 * 2. Receipt Book No. & Receipt No. Auto-Sequence with Book Rollover:
 *    - Configurable starting Book No. (e.g. 03, 11, 20) and Receipt No. (e.g. 0001, 0111).
 *    - Configurable sheets/pages per book (e.g. 10 sheets per book, 15, 50).
 *    - Automatic rollover: When reaching max sheets per book (e.g. 10 sheets in Book 20),
 *      automatically rolls over to Book 21 and resets receipt number to 0001.
 *    - Dynamic adjustments: subsequent books respect the latest sheets per book setting.
 * 
 * 3. Cross-Document Consistency:
 *    - Member ID strictly matches between Application Form, Official Receipt, and Member profile.
 */

const STORAGE_KEY_MEMBER_SEQ = 'samila_seq_member_config_v2';
const STORAGE_KEY_RECEIPT_SEQ = 'samila_seq_receipt_config_v2';

// In-memory fallback if localStorage is unavailable
let memStorage = {};
const hasLocalStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function safeGetItem(key) {
  if (hasLocalStorage) {
    return window.localStorage.getItem(key);
  }
  return memStorage[key] || null;
}

function safeSetItem(key, value) {
  if (hasLocalStorage) {
    window.localStorage.setItem(key, value);
  }
  memStorage[key] = value;
}

// Default Member Sequence Config
export const DEFAULT_MEMBER_CONFIG = {
  startNumber: 30001,
  currentNumber: 30001,
  paddingDigits: 5,
  prefix: ''
};

// Default Receipt Sequence Config
export const DEFAULT_RECEIPT_CONFIG = {
  currentBook: 3,
  currentNo: 111,
  sheetsPerBook: 10,
  bookPadding: 2,
  noPadding: 4
};

// ================= MEMBER SEQUENCE API =================

export function getMemberSequenceConfig() {
  try {
    const saved = safeGetItem(STORAGE_KEY_MEMBER_SEQ);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_MEMBER_CONFIG,
        ...parsed,
        currentNumber: parseInt(parsed.currentNumber || DEFAULT_MEMBER_CONFIG.currentNumber, 10),
        startNumber: parseInt(parsed.startNumber || DEFAULT_MEMBER_CONFIG.startNumber, 10)
      };
    }
  } catch (e) {
    console.error('Error reading member sequence config:', e);
  }
  return { ...DEFAULT_MEMBER_CONFIG };
}

export function saveMemberSequenceConfig(newConfig) {
  try {
    const current = getMemberSequenceConfig();
    const merged = {
      ...current,
      ...newConfig,
      currentNumber: Math.max(1, parseInt(newConfig.currentNumber ?? current.currentNumber, 10)),
      startNumber: Math.max(1, parseInt(newConfig.startNumber ?? current.startNumber, 10)),
      paddingDigits: Math.max(1, parseInt(newConfig.paddingDigits ?? current.paddingDigits, 10)),
      prefix: newConfig.prefix !== undefined ? String(newConfig.prefix).trim() : current.prefix
    };
    safeSetItem(STORAGE_KEY_MEMBER_SEQ, JSON.stringify(merged));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('samila_sequence_changed', { detail: { type: 'member', config: merged } }));
    }
    return merged;
  } catch (e) {
    console.error('Error saving member sequence config:', e);
    return getMemberSequenceConfig();
  }
}

export function formatMemberId(num, padding = 5, prefix = '') {
  const padded = String(num).padStart(padding, '0');
  return prefix ? `${prefix}${padded}` : padded;
}

export function peekNextMemberId() {
  const config = getMemberSequenceConfig();
  return formatMemberId(config.currentNumber, config.paddingDigits, config.prefix);
}

/**
 * Consumes or records a member ID.
 * If user entered a custom ID like 'A0250', it is saved for that member WITHOUT
 * breaking or advancing the main numeric runner (so 30101 stays ready for the next person).
 * If user used the current auto-runner number, it increments currentNumber by 1.
 */
export function consumeMemberId(chosenMemberId) {
  const config = getMemberSequenceConfig();
  const trimmed = (chosenMemberId || '').trim();
  const expectedAutoId = formatMemberId(config.currentNumber, config.paddingDigits, config.prefix);

  if (!trimmed || trimmed === expectedAutoId || trimmed === String(config.currentNumber)) {
    // Standard auto-increment
    const allocatedId = expectedAutoId;
    saveMemberSequenceConfig({ currentNumber: config.currentNumber + 1 });
    return allocatedId;
  }

  // If user provided a numeric ID that is higher than current sequence, optionally keep sequence intact
  // Unless it's an override like 'A0250'
  const isPureNumber = /^\d+$/.test(trimmed);
  if (isPureNumber) {
    const numVal = parseInt(trimmed, 10);
    // If user explicitly jumped forward in sequence, we can advance beyond it or keep current
    if (numVal >= config.currentNumber) {
      saveMemberSequenceConfig({ currentNumber: numVal + 1 });
      return trimmed;
    }
  }

  // Override string (e.g. A0250) or legacy paper number:
  // Return the custom string directly, LEAVING currentNumber untouched for the next regular applicant!
  return trimmed;
}

// ================= RECEIPT SEQUENCE API (BOOK & NUMBER WITH ROLLOVER) =================

export function getReceiptSequenceConfig() {
  try {
    const saved = safeGetItem(STORAGE_KEY_RECEIPT_SEQ);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_RECEIPT_CONFIG,
        ...parsed,
        currentBook: Math.max(1, parseInt(parsed.currentBook || DEFAULT_RECEIPT_CONFIG.currentBook, 10)),
        currentNo: Math.max(1, parseInt(parsed.currentNo || DEFAULT_RECEIPT_CONFIG.currentNo, 10)),
        sheetsPerBook: Math.max(1, parseInt(parsed.sheetsPerBook || DEFAULT_RECEIPT_CONFIG.sheetsPerBook, 10)),
        bookPadding: Math.max(1, parseInt(parsed.bookPadding || DEFAULT_RECEIPT_CONFIG.bookPadding, 10)),
        noPadding: Math.max(1, parseInt(parsed.noPadding || DEFAULT_RECEIPT_CONFIG.noPadding, 10))
      };
    }
  } catch (e) {
    console.error('Error reading receipt sequence config:', e);
  }
  return { ...DEFAULT_RECEIPT_CONFIG };
}

export function saveReceiptSequenceConfig(newConfig) {
  try {
    const current = getReceiptSequenceConfig();
    const merged = {
      ...current,
      ...newConfig,
      currentBook: Math.max(1, parseInt(newConfig.currentBook ?? current.currentBook, 10)),
      currentNo: Math.max(1, parseInt(newConfig.currentNo ?? current.currentNo, 10)),
      sheetsPerBook: Math.max(1, parseInt(newConfig.sheetsPerBook ?? current.sheetsPerBook, 10)),
      bookPadding: Math.max(1, parseInt(newConfig.bookPadding ?? current.bookPadding, 10)),
      noPadding: Math.max(1, parseInt(newConfig.noPadding ?? current.noPadding, 10))
    };
    safeSetItem(STORAGE_KEY_RECEIPT_SEQ, JSON.stringify(merged));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('samila_sequence_changed', { detail: { type: 'receipt', config: merged } }));
    }
    return merged;
  } catch (e) {
    console.error('Error saving receipt sequence config:', e);
    return getReceiptSequenceConfig();
  }
}

export function formatBookNo(bookNum, padding = 2) {
  return String(bookNum).padStart(padding, '0');
}

export function formatReceiptNo(receiptNum, padding = 4) {
  return String(receiptNum).padStart(padding, '0');
}

/**
 * Returns formatted receipt information for display and next rollover preview.
 */
export function getCurrentReceiptInfo() {
  const config = getReceiptSequenceConfig();
  const formattedBook = formatBookNo(config.currentBook, config.bookPadding);
  const formattedNo = formatReceiptNo(config.currentNo, config.noPadding);
  
  // Calculate position in current book
  // e.g. If currentNo is 9 and sheetsPerBook is 10 -> page 9 of 10
  const pageInBook = ((config.currentNo - 1) % config.sheetsPerBook) + 1;
  const isLastPageInBook = pageInBook >= config.sheetsPerBook;
  const nextBookIfRolled = config.currentBook + 1;

  return {
    bookNo: formattedBook,
    receiptNo: formattedNo,
    numericBook: config.currentBook,
    numericNo: config.currentNo,
    sheetsPerBook: config.sheetsPerBook,
    pageInBook,
    isLastPageInBook,
    nextBookIfRolled: formatBookNo(nextBookIfRolled, config.bookPadding),
    rawConfig: config
  };
}

/**
 * Advances the receipt sequence with automatic book rollover.
 * - When current receipt page reaches `sheetsPerBook` (e.g. 10):
 *   automatically advances `currentBook` by 1 and resets `currentNo` to 1.
 * - Otherwise increments `currentNo` by 1.
 */
export function advanceReceiptSequence() {
  const config = getReceiptSequenceConfig();
  const currentBook = config.currentBook;
  const currentNo = config.currentNo;
  const sheets = config.sheetsPerBook;

  // Check if current page is the last sheet in book
  const pageInBook = ((currentNo - 1) % sheets) + 1;
  const isRollover = pageInBook >= sheets;

  let nextBook = currentBook;
  let nextNo = currentNo + 1;

  if (isRollover) {
    nextBook = currentBook + 1;
    nextNo = 1; // reset to sheet 1 in new book
  }

  const updatedConfig = saveReceiptSequenceConfig({
    currentBook: nextBook,
    currentNo: nextNo
  });

  return {
    issuedBook: formatBookNo(currentBook, config.bookPadding),
    issuedNo: formatReceiptNo(currentNo, config.noPadding),
    nextBook: formatBookNo(nextBook, config.bookPadding),
    nextNo: formatReceiptNo(nextNo, config.noPadding),
    didRollover: isRollover,
    sheetsPerBook: sheets,
    updatedConfig
  };
}
