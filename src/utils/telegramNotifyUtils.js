/**
 * Telegram Notification & Document Vault Utilities
 * Designed for Samila Amateur Radio Association (HS9AS)
 * 
 * Supports:
 * 1. Automatic notifications for new membership applications with all 4 attached photos + application form
 * 2. Automatic transmission of Official e-Receipt & Certificate of Membership upon admin approval
 * 3. Group Chat ID auto-detection (-1005204937286 vs -5204937286)
 * 4. Resilient direct-to-Telegram API with automatic fallback mechanisms
 */

import { 
  generateApplicationFormSvg, 
  generateCitizenIdCardSvg, 
  generateHouseRegistrationSvg, 
  generateBankSlipSvg,
  generateCertificateSvg,
  generateReceiptSvg
} from './documentSvgGenerators.js';
import { getCurrentReceiptInfo } from './sequenceNumberUtils.js';
import { fetchCentralLayoutSettings } from './layoutSyncUtils.js';
import { 
  DEFAULT_APP_TEMPLATE_BASE64, 
  DEFAULT_RECEIPT_TEMPLATE_BASE64, 
  DEFAULT_CERT_TEMPLATE_BASE64 
} from '../assets/defaultTemplates.js';

export const TELEGRAM_STORAGE_KEY = 'samila_telegram_settings';

// Default configuration based on user's setup
// Telegram Web URL: web.telegram.org/k/#-5204937286
export const DEFAULT_TELEGRAM_SETTINGS = {
  botToken: '7577840608:AAH_m0LWjRk3916GSvBcTsp1YLdaJXFlIy0', // TRIPLE T ROBOT (@TRIPLE_T_RoBot)
  chatId: '-5204937286',
  fallbackChatId: '-1005204937286',
  groupName: 'HS9AS สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา',
  botName: 'TRIPLE T ROBOT',
  notifyOnRegister: true, // Auto send when applicant registers
  notifyOnApprove: true, // Auto send when admin approves
  sendPhotosWithRegister: true, // Send 4 photos + application form
  sendDocsWithApprove: true, // Send e-Receipt + Certificate
  lastTestedAt: null,
  lastStatus: 'idle', // 'idle' | 'success' | 'error'
  lastError: ''
};

/**
 * Retrieve saved Telegram settings from localStorage or defaults
 */
export function getTelegramSettings() {
  if (typeof window === 'undefined') return { ...DEFAULT_TELEGRAM_SETTINGS };
  try {
    const raw = localStorage.getItem(TELEGRAM_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_TELEGRAM_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_TELEGRAM_SETTINGS, ...parsed };
  } catch (e) {
    console.error('Failed to load telegram settings:', e);
    return { ...DEFAULT_TELEGRAM_SETTINGS };
  }
}

/**
 * Save Telegram settings to localStorage
 */
export function saveTelegramSettings(settings) {
  if (typeof window === 'undefined') return settings;
  try {
    const current = getTelegramSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(TELEGRAM_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save telegram settings:', e);
    return settings;
  }
}

/**
 * Convert Base64 data URL or Blob URL to a real Blob
 */
export async function dataUrlToBlob(dataUri) {
  if (!dataUri) return null;
  if (dataUri instanceof Blob) return dataUri;
  if (typeof dataUri !== 'string') return null;

  if (dataUri.startsWith('blob:')) {
    try {
      const res = await fetch(dataUri);
      return await res.blob();
    } catch (e) {
      console.warn('Failed to fetch blob URL:', e);
      return null;
    }
  }

  if (dataUri.startsWith('http://') || dataUri.startsWith('https://')) {
    try {
      const res = await fetch(dataUri, { mode: 'cors' });
      return await res.blob();
    } catch (e) {
      console.warn('Failed to fetch remote image:', e);
      return null;
    }
  }

  if (!dataUri.startsWith('data:')) return null;

  try {
    const parts = dataUri.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (err) {
    console.error('dataUrlToBlob error:', err);
    return null;
  }
}

/**
 * Ensure image is a Base64 data URI (fetches remote URLs or blobs if needed)
 */
export async function ensureDataUrl(urlOrBlob) {
  if (!urlOrBlob) return '';
  if (typeof urlOrBlob === 'string' && urlOrBlob.startsWith('data:image')) return urlOrBlob;
  const blob = await dataUrlToBlob(urlOrBlob);
  if (!blob) return typeof urlOrBlob === 'string' ? urlOrBlob : '';

  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result || '');
      reader.readAsDataURL(blob);
    });
  } else {
    try {
      const buffer = Buffer.from(await blob.arrayBuffer());
      const mime = blob.type || 'image/jpeg';
      return `data:${mime};base64,${buffer.toString('base64')}`;
    } catch {
      return typeof urlOrBlob === 'string' ? urlOrBlob : '';
    }
  }
}

/**
 * Rasterize SVG string to high-res PNG Blob using offscreen canvas
 */
export function svgToPngBlob(svgString, width = 1200, height = 1695) {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || !window.document) {
        return resolve(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }));
      }
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(blobURL);
          canvas.toBlob((blob) => {
            resolve(blob || svgBlob);
          }, 'image/png', 0.95);
        } catch (e) {
          URL.revokeObjectURL(blobURL);
          resolve(svgBlob);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(blobURL);
        resolve(svgBlob);
      };

      img.src = blobURL;
    } catch (err) {
      console.error('svgToPngBlob raster error:', err);
      resolve(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }));
    }
  });
}

/**
 * Escape HTML special characters for Telegram HTML mode
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Derive alternate chat ID (-1005204937286 <-> -5204937286)
 */
function getAlternateChatId(chatId) {
  if (!chatId) return null;
  const s = String(chatId).trim();
  if (s.startsWith('-100')) {
    return '-' + s.slice(4);
  } else if (s.startsWith('-')) {
    return '-100' + s.slice(1);
  }
  return null;
}

/**
 * Core API Dispatcher with Chat ID auto-fallback
 */
async function sendTelegramRequest(endpoint, payload, isFormData = false, customToken = null, targetChatId = null) {
  const settings = getTelegramSettings();
  const token = customToken || settings.botToken;
  const primaryChatId = targetChatId || settings.chatId || DEFAULT_TELEGRAM_SETTINGS.chatId;

  if (!token) {
    return { 
      ok: false, 
      error_code: 401, 
      description: 'ยังไม่ได้ระบุ Telegram Bot Token (กรุณาระบุโทเคนของ TRIPLE T ROBOT ในการตั้งค่าแอดมิน)' 
    };
  }

  const doFetch = async (chatIdToUse) => {
    const url = `https://api.telegram.org/bot${token.trim()}/${endpoint}`;
    
    let fetchOptions;
    if (isFormData) {
      payload.set('chat_id', chatIdToUse);
      fetchOptions = {
        method: 'POST',
        body: payload
      };
    } else {
      payload.chat_id = chatIdToUse;
      fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      };
    }

    const res = await fetch(url, fetchOptions);
    return await res.json();
  };

  try {
    let result = await doFetch(primaryChatId);

    // If failed due to chat id mismatch, try alternate ID
    if (!result.ok && (result.description?.includes('chat not found') || result.description?.includes('upgraded to a supergroup'))) {
      const altChatId = getAlternateChatId(primaryChatId);
      if (altChatId && altChatId !== primaryChatId) {
        console.warn(`[Telegram] Primary Chat ID ${primaryChatId} failed, trying alternate ID: ${altChatId}`);
        const retryResult = await doFetch(altChatId);
        if (retryResult.ok) {
          // Auto-save the working chat ID
          saveTelegramSettings({ chatId: altChatId });
          return retryResult;
        }
      }
    }

    return result;
  } catch (networkError) {
    console.error('[Telegram API] Network request failed:', networkError);
    return {
      ok: false,
      error_code: 0,
      description: `การเชื่อมต่อเครือข่ายล้มเหลว: ${networkError.message || 'โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'}`
    };
  }
}

/**
 * Send a plain or HTML text message
 */
export async function sendTelegramMessage(text, options = {}) {
  const payload = {
    text: text,
    parse_mode: options.parse_mode || 'HTML',
    disable_web_page_preview: true
  };
  return await sendTelegramRequest('sendMessage', payload, false, options.botToken, options.chatId);
}

/**
 * Send a document/file (works with any MIME type including SVG, PDF, images)
 */
export async function sendTelegramDocument(docBlob, caption = '', options = {}) {
  const formData = new FormData();
  formData.append('document', docBlob, options.filename || 'document.png');
  if (caption) {
    formData.append('caption', caption);
    formData.append('parse_mode', options.parse_mode || 'HTML');
  }
  return await sendTelegramRequest('sendDocument', formData, true, options.botToken, options.chatId);
}

/**
 * Send a single photo with optional caption (auto-routes to sendDocument if SVG or if sendPhoto fails)
 * Supports:
 * - Remote HTTP/HTTPS URLs (sent directly as JSON string, ultra-fast and zero-CORS)
 * - Base64 Data URLs (converted to Blob)
 * - Blob / File objects (sent via FormData)
 */
export async function sendTelegramPhoto(photoOrBlob, caption = '', options = {}) {
  if (!photoOrBlob) return { ok: false, description: 'No photo provided' };

  // 1. Direct Remote URL (e.g. Cloudinary HTTPS image) -> Send via JSON
  if (typeof photoOrBlob === 'string' && (photoOrBlob.startsWith('http://') || photoOrBlob.startsWith('https://'))) {
    const payload = {
      photo: photoOrBlob,
      caption: caption || '',
      parse_mode: options.parse_mode || 'HTML'
    };
    const res = await sendTelegramRequest('sendPhoto', payload, false, options.botToken, options.chatId);
    if (res.ok) return res;
    console.warn('[Telegram] Direct URL sendPhoto failed, falling back to blob download:', res.description);
  }

  // 2. Convert Data URL or Remote URL to Blob if string
  let blob = photoOrBlob;
  if (typeof photoOrBlob === 'string') {
    blob = await dataUrlToBlob(photoOrBlob);
    if (!blob) return { ok: false, description: 'Failed to convert photo to blob' };
  }

  // 3. SVG document fallback
  if (blob.type && blob.type.includes('svg')) {
    return await sendTelegramDocument(blob, caption, options);
  }

  // 4. Send as binary FormData
  const formData = new FormData();
  formData.append('photo', blob, options.filename || 'photo.png');
  if (caption) {
    formData.append('caption', caption);
    formData.append('parse_mode', options.parse_mode || 'HTML');
  }
  const res = await sendTelegramRequest('sendPhoto', formData, true, options.botToken, options.chatId);
  if (!res.ok) {
    console.warn('[Telegram] sendPhoto failed, falling back to sendDocument:', res.description);
    return await sendTelegramDocument(blob, caption, options);
  }
  return res;
}

/**
 * Send a group of photos as an album (sendMediaGroup) with automatic fallback
 */
export async function sendTelegramMediaGroup(mediaItems, options = {}) {
  // mediaItems: array of { blob: Blob, caption?: string, filename?: string }
  if (!mediaItems || mediaItems.length === 0) return { ok: false, description: 'No media items provided' };

  // Check if any items are SVG. If so, convert them or skip sendMediaGroup
  const hasSvg = mediaItems.some(i => i.blob && i.blob.type && i.blob.type.includes('svg'));

  if (!hasSvg) {
    try {
      const formData = new FormData();
      const mediaArray = [];

      mediaItems.slice(0, 10).forEach((item, index) => {
        const attachKey = `file_${index}`;
        formData.append(attachKey, item.blob, item.filename || `file_${index}.png`);
        
        const mediaEntry = {
          type: 'photo',
          media: `attach://${attachKey}`
        };
        if (item.caption) {
          mediaEntry.caption = item.caption;
          mediaEntry.parse_mode = 'HTML';
        }
        mediaArray.push(mediaEntry);
      });

      formData.append('media', JSON.stringify(mediaArray));

      const result = await sendTelegramRequest('sendMediaGroup', formData, true, options.botToken, options.chatId);
      if (result.ok) return result;

      console.warn('[Telegram] sendMediaGroup failed, falling back to sequential sendPhoto:', result.description);
    } catch (e) {
      console.warn('[Telegram] sendMediaGroup error, falling back:', e);
    }
  }

  // Fallback: send each photo sequentially
  let successCount = 0;
  for (const item of mediaItems) {
    const res = await sendTelegramPhoto(item.blob, item.caption || '', { ...options, filename: item.filename });
    if (res.ok) successCount++;
    await new Promise(r => setTimeout(r, 400));
  }
  return { ok: successCount > 0, result: `Sent ${successCount} photos individually` };
}

/**
 * Test Telegram connection by sending a diagnostic test message
 */
export async function testTelegramConnection(customSettings = {}) {
  const settings = { ...getTelegramSettings(), ...customSettings };
  const token = settings.botToken?.trim();
  const chatId = settings.chatId?.trim() || DEFAULT_TELEGRAM_SETTINGS.chatId;

  if (!token) {
    return {
      success: false,
      message: 'กรุณากรอก Telegram Bot Token ของ TRIPLE T ROBOT ก่อนทดสอบ'
    };
  }

  const nowThai = new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'full',
    timeStyle: 'medium'
  }).format(new Date());

  const testMessage = `
📡 <b>ทดสอบการเชื่อมต่อระบบแจ้งเตือน Telegram สำเร็จ!</b>
🏛 <b>สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา (HS9AS)</b>
━━━━━━━━━━━━━━━━━━━━
🤖 <b>ชื่อบอท:</b> ${escapeHtml(settings.botName || 'TRIPLE T ROBOT')}
👥 <b>กลุ่มเป้าหมาย:</b> ${escapeHtml(settings.groupName || 'HS9AS สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา')}
🆔 <b>Chat ID:</b> <code>${escapeHtml(chatId)}</code>
⏰ <b>วันเวลาทดสอบ:</b> ${nowThai}
👤 <b>ผู้ทดสอบ:</b> คุณทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด) • E26ECG
━━━━━━━━━━━━━━━━━━━━
✅ <i>ระบบพร้อมส่งใบสมัครสมาชิกใหม่พร้อมรูปบัตร และส่งใบเสร็จ+หนังสือรับรองเมื่ออนุมัติเข้ากลุ่มอัตโนมัติ</i>
`.trim();

  const res = await sendTelegramMessage(testMessage, { botToken: token, chatId: chatId });

  if (res.ok) {
    saveTelegramSettings({
      lastTestedAt: new Date().toISOString(),
      lastStatus: 'success',
      lastError: ''
    });
    return {
      success: true,
      message: 'เชื่อมต่อและส่งข้อความทดสอบเข้ากลุ่ม Telegram สำเร็จแล้ว!'
    };
  } else {
    const errMsg = res.description || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ Telegram Bot API';
    saveTelegramSettings({
      lastTestedAt: new Date().toISOString(),
      lastStatus: 'error',
      lastError: errMsg
    });
    return {
      success: false,
      message: `ไม่สามารถส่งข้อความได้: ${errMsg}`
    };
  }
}

/**
 * 1. AUTOMATION: Send New Membership Application with All Attached Photos to Telegram
 */
export async function sendNewApplicationToTelegram(memberData, customConfig = null) {
  const settings = { ...getTelegramSettings(), ...(customConfig || {}) };
  if (!settings.botToken || !settings.notifyOnRegister) {
    return { ok: false, reason: 'Telegram notifications not enabled or bot token not set' };
  }

  const m = memberData || {};
  const nowThai = new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date());

  const callsignDetail = m.callsignType === 'has' 
    ? (m.callsignSubStatus === 'expired' ? `${m.callsign} (นามเรียกขานขาดอายุแล้ว)` : `${m.callsign} (นามเรียกขานปัจจุบัน)`)
    : 'สมัครเพื่อขอรับสัญญาณเรียกขาน (สอบผ่านแล้ว/ครั้งแรก)';
  const feeText = (m.memberType || '').includes('ตลอดชีพ') ? '2,500 บาท (ตลอดชีพ)' : '500 บาท (5 ปี)';
  const receiptInfo = getCurrentReceiptInfo();

  // 1. Text Announcement
  const textMsg = `
📢 <b>แจ้งเตือน: มีผู้ยื่นใบสมัครสมาชิกใหม่!</b>
🏛 <b>สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา (HS9AS)</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>ชื่อ-นามสกุล:</b> ${escapeHtml(m.fullName)}
🔤 <b>Name (EN):</b> ${escapeHtml(m.nameEnglish || '-')}
📻 <b>สถานะนามเรียกขาน:</b> <b>${escapeHtml(callsignDetail)}</b>
🪪 <b>เลขประจำตัวประชาชน:</b> <code>${escapeHtml(m.citizenId || '-')}</code>
🎂 <b>วันเดือนปีเกิด:</b> ${escapeHtml(m.birthDate || '-')} (อายุ ${escapeHtml(m.age || '-')} ปี)
🎖 <b>ประเภทสมาชิก:</b> ${escapeHtml(m.memberType || 'สมาชิกสามัญ 5 ปี')}
💰 <b>ค่าบำรุงสมาชิก:</b> ${escapeHtml(feeText)}
🧾 <b>เลขที่ใบเสร็จ:</b> เล่ม ${receiptInfo.bookNo} เลขที่ ${receiptInfo.receiptNo}
📞 <b>เบอร์โทรศัพท์:</b> <a href="tel:${escapeHtml(m.phone)}">${escapeHtml(m.phone)}</a>
💬 <b>LINE ID:</b> ${escapeHtml(m.lineId || '-')}
📧 <b>อีเมล:</b> ${escapeHtml(m.email || '-')}
🏠 <b>ที่อยู่ปัจจุบัน:</b> ${escapeHtml(m.currentAddress || '-')}
📮 <b>ที่อยู่ตามทะเบียนบ้าน:</b> ${escapeHtml(m.registeredAddress || m.currentAddress || '-')}
📅 <b>วันที่ยื่นสมัคร:</b> ${escapeHtml(m.registeredDate || nowThai)}
━━━━━━━━━━━━━━━━━━━━
📑 <i>ระบบส่งภาพเอกสารทางการ (ใบสมัคร, ใบเสร็จรับเงิน, หนังสือรับรอง) และหลักฐานประกอบเข้ากลุ่มด้านล่าง:</i>
`.trim();

  // Send summary text first
  await sendTelegramMessage(textMsg, { botToken: settings.botToken, chatId: settings.chatId });

  if (!settings.sendPhotosWithRegister) {
    return { ok: true, message: 'Application text sent' };
  }

  // 2. OFFICIAL APPLICATION DOCUMENTS (ใบเสร็จรับเงิน และ ใบสมัครสมาชิก)
  const officialDocsList = [];

  // Fetch central layout settings and backgrounds to ensure 100% real-time dynamic sync with Document Studio
  const centralSettings = await fetchCentralLayoutSettings().catch(() => null);

  // Ensure backgrounds are Base64 Data URLs so offscreen SVG canvas renders them without browser cross-origin blockage
  let receiptBg = DEFAULT_RECEIPT_TEMPLATE_BASE64;
  if (centralSettings?.templateBackgrounds?.receipt) {
    const rawBg = centralSettings.templateBackgrounds.receipt;
    if (rawBg.startsWith('data:image')) {
      receiptBg = rawBg;
    } else {
      const dataUri = await ensureDataUrl(rawBg).catch(() => null);
      if (dataUri && dataUri.startsWith('data:image')) {
        receiptBg = dataUri;
      }
    }
  }

  let appBg = DEFAULT_APP_TEMPLATE_BASE64;
  if (centralSettings?.templateBackgrounds?.application) {
    const rawBg = centralSettings.templateBackgrounds.application;
    if (rawBg.startsWith('data:image')) {
      appBg = rawBg;
    } else {
      const dataUri = await ensureDataUrl(rawBg).catch(() => null);
      if (dataUri && dataUri.startsWith('data:image')) {
        appBg = dataUri;
      }
    }
  }

  // 2.1 Official Receipt (e-Receipt - ลำดับที่ 1 ตามที่สมาคมฯ กำหนด)
  try {
    const receiptSvg = generateReceiptSvg(m, receiptInfo, { 
      positions: centralSettings?.receipt,
      tierPositions: centralSettings?.receiptTierPositions,
      templateBackground: receiptBg,
      registrarName: 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)', 
      registrarCallsign: 'E26ECG' 
    });
    const receiptBlob = await svgToPngBlob(receiptSvg, 1200, 1629);
    if (receiptBlob) {
      officialDocsList.push({
        blob: receiptBlob,
        filename: `01_ใบเสร็จรับเงิน_${m.fullName}_เล่ม${receiptInfo.bookNo}_เลขที่${receiptInfo.receiptNo}.png`,
        caption: `🧾 <b>ใบเสร็จรับเงิน (e-Receipt)</b>\n • เล่มที่ ${receiptInfo.bookNo} เลขที่ ${receiptInfo.receiptNo}\n • ${escapeHtml(m.fullName)}\n • ค่าบำรุงสมาชิก: ${escapeHtml(feeText)}`
      });
    }
  } catch (e) {
    console.warn('Receipt render error:', e);
  }

  // 2.2 Complete Application Form Document (แบบคำขอสมัครสมาชิก - ลำดับที่ 2)
  try {
    let appMember = { ...m };
    if (m.avatar) {
      try {
        const avatarDataUri = await ensureDataUrl(m.avatar);
        if (avatarDataUri) appMember.avatar = avatarDataUri;
      } catch (err) {
        console.warn('Avatar dataUri convert error:', err);
      }
    }
    const appSvg = generateApplicationFormSvg(appMember, { 
      positions: centralSettings?.application,
      tierPositions: centralSettings?.appTierPositions,
      templateBackground: appBg,
      registrarName: 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)', 
      registrarCallsign: 'E26ECG',
      receiptNo: receiptInfo.receiptNo
    });
    const appBlob = await svgToPngBlob(appSvg, 1200, 1693);
    if (appBlob) {
      officialDocsList.push({
        blob: appBlob,
        filename: `02_ใบสมัครสมาชิก_${m.fullName}.png`,
        caption: `📄 <b>ใบสมัครสมาชิกสมาคม (แบบคำขอทางการ)</b>\n• ผู้สมัคร: ${escapeHtml(m.fullName)}\n• นามเรียกขาน: ${escapeHtml(m.callsign && m.callsign !== '-' ? m.callsign : 'ขอรับใหม่')}`
      });
    }
  } catch (e) {
    console.warn('App form render error:', e);
  }

  // 3. ATTACHED APPLICANT EVIDENCE (รูปถ่าย, สำเนาบัตรประชาชน, ทะเบียนบ้าน, สลิปโอนเงิน)
  const evidenceList = [];

  // 3.1 Photo Avatar (1-2 inch)
  if (m.avatar) {
    evidenceList.push({
      photo: m.avatar,
      filename: `03_รูปถ่าย_${m.fullName}.jpg`,
      caption: `👤 <b>รูปถ่ายหน้าตรง 1-2 นิ้ว</b>\n• ผู้สมัครสมาชิก: ${escapeHtml(m.fullName)}`
    });
  }

  // 3.2 Citizen ID Card Slip (ดึงข้อมูลจริง หรือใช้ SVG จำลอง)
  if (m.idCardSlip && typeof m.idCardSlip === 'string' && m.idCardSlip.startsWith('http')) {
    evidenceList.push({
      photo: m.idCardSlip,
      filename: `04_สำเนาบัตรประชาชน_${m.fullName}.jpg`,
      caption: `🪪 <b>สำเนาบัตรประจำตัวประชาชน</b>\n• ผู้สมัครสมาชิก: ${escapeHtml(m.fullName)}\n• เลขประจำตัวประชาชน: <code>${escapeHtml(m.citizenId || '-')}</code>`
    });
  } else {
    try {
      let idCardBlob = await dataUrlToBlob(m.idCardSlip);
      if (!idCardBlob) {
        const idCardSvg = generateCitizenIdCardSvg(m);
        idCardBlob = await svgToPngBlob(idCardSvg, 1200, 750);
      }
      if (idCardBlob) {
        evidenceList.push({
          photo: idCardBlob,
          filename: `04_สำเนาบัตรประชาชน_${m.fullName}.png`,
          caption: `🪪 <b>สำเนาบัตรประจำตัวประชาชน</b>\n• ผู้สมัครสมาชิก: ${escapeHtml(m.fullName)}\n• เลขประจำตัวประชาชน: <code>${escapeHtml(m.citizenId || '-')}</code>`
        });
      }
    } catch (e) {
      console.warn('ID Card render error:', e);
    }
  }

  // 3.3 House Registration Slip (ดึงข้อมูลจริง หรือใช้ SVG จำลอง)
  if (m.houseSlip && typeof m.houseSlip === 'string' && m.houseSlip.startsWith('http')) {
    evidenceList.push({
      photo: m.houseSlip,
      filename: `05_สำเนาทะเบียนบ้าน_${m.fullName}.jpg`,
      caption: `🏠 <b>สำเนาทะเบียนบ้าน (ท.ร.14)</b>\n• ผู้สมัครสมาชิก: ${escapeHtml(m.fullName)}\n• ที่อยู่: ${escapeHtml(m.registeredAddress || m.currentAddress || '-')}`
    });
  } else {
    try {
      let houseBlob = await dataUrlToBlob(m.houseSlip);
      if (!houseBlob) {
        const houseSvg = generateHouseRegistrationSvg(m);
        houseBlob = await svgToPngBlob(houseSvg, 1200, 975);
      }
      if (houseBlob) {
        evidenceList.push({
          photo: houseBlob,
          filename: `05_สำเนาทะเบียนบ้าน_${m.fullName}.png`,
          caption: `🏠 <b>สำเนาทะเบียนบ้าน (ท.ร.14)</b>\n• ผู้สมัครสมาชิก: ${escapeHtml(m.fullName)}\n• ที่อยู่: ${escapeHtml(m.registeredAddress || m.currentAddress || '-')}`
        });
      }
    } catch (e) {
      console.warn('House reg render error:', e);
    }
  }

  // 3.4 Bank Transfer Slip (ดึงข้อมูลจริง หรือใช้ SVG จำลอง)
  if (m.transferSlip && typeof m.transferSlip === 'string' && m.transferSlip.startsWith('http')) {
    evidenceList.push({
      photo: m.transferSlip,
      filename: `06_สลิปโอนเงิน_${m.fullName}.jpg`,
      caption: `💸 <b>สลิปหลักฐานการโอนเงิน</b>\n• ผู้สมัครสมาชิก: ${escapeHtml(m.fullName)}\n• ยอดเงินโอน: ${escapeHtml(feeText)}`
    });
  } else {
    try {
      let transferBlob = await dataUrlToBlob(m.transferSlip);
      if (!transferBlob) {
        const slipSvg = generateBankSlipSvg(m);
        transferBlob = await svgToPngBlob(slipSvg, 900, 1275);
      }
      if (transferBlob) {
        evidenceList.push({
          photo: transferBlob,
          filename: `06_สลิปโอนเงิน_${m.fullName}.png`,
          caption: `💸 <b>สลิปหลักฐานการโอนเงิน</b>\n• ผู้สมัครสมาชิก: ${escapeHtml(m.fullName)}\n• ยอดเงินโอน: ${escapeHtml(feeText)}`
        });
      }
    } catch (e) {
      console.warn('Bank slip render error:', e);
    }
  }

  // Send all documents as distinct individual photos with dedicated captions (ไม่จัดเป็นอัลบั้มรวมตามที่ผู้ใช้ต้องการ)
  const allPhotosToSend = [...officialDocsList, ...evidenceList];
  for (const item of allPhotosToSend) {
    if (item && (item.photo || item.blob)) {
      try {
        await sendTelegramPhoto(item.photo || item.blob, item.caption, {
          botToken: settings.botToken,
          chatId: settings.chatId,
          filename: item.filename
        });
      } catch (err) {
        console.warn('[Telegram] Photo send error:', err);
      }
      await new Promise(r => setTimeout(r, 450));
    }
  }

  return { ok: true, docCount: officialDocsList.length, evidenceCount: evidenceList.length };
}

/**
 * 2. AUTOMATION: Send Official e-Receipt & Certificate of Membership to Telegram upon Approval
 */
export async function sendApprovalDocumentsToTelegram({ member, auditData = {}, receiptBlob = null, certificateBlob = null, customConfig = null }) {
  const settings = { ...getTelegramSettings(), ...(customConfig || {}) };
  if (!settings.botToken || !settings.notifyOnApprove) {
    return { ok: false, reason: 'Telegram notifications not enabled or bot token not set' };
  }

  const m = member || {};
  const audit = auditData || {};
  const nowThai = audit.approvedAt || new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date());

  const approver = audit.approvedByAdminName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)';
  const approverCallsign = audit.approvedByCallsign || 'E26ECG';
  const receiptInfo = getCurrentReceiptInfo();

  // 1. Send Approval Announcement
  const announcement = `
✅ <b>อนุมัติการสมัครสมาชิกเรียบร้อยแล้ว ✅</b>
<b>สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา (HS9AS)</b>
━━━━━━━━━━━━━━━━━━━━
สมาชิก: ${escapeHtml(m.fullName)}
สัญญาณเรียกขาน: ${escapeHtml(m.callsign && m.callsign !== '-' ? m.callsign : 'สมาชิกใหม่')}
เลขทะเบียนสมาชิก: ${escapeHtml(m.memberId || '30004')}
ประเภทสมาชิกภาพ: ${escapeHtml(m.memberType || 'สมาชิกสามัญ 5 ปี')}
อายุสมาชิกภาพ: ${escapeHtml(m.startDate || '-')} ถึง ${escapeHtml(m.endDate || 'ตลอดชีพ')}

✍️ อนุมัติโดย: ${escapeHtml(approver)} (${escapeHtml(approverCallsign)})
⏰ วันเวลาที่อนุมัติ: ${escapeHtml(nowThai)}
━━━━━━━━━━━━━━━━━━━━
📜 ระบบได้ออกหนังสือรับรองสถานะการเป็นสมาชิกภาพอย่างเป็นทางการ และจัดส่งภาพเข้าระบบ Telegram ด้านล่าง:
`.trim();

  await sendTelegramMessage(announcement, { botToken: settings.botToken, chatId: settings.chatId });

  if (!settings.sendDocsWithApprove) {
    return { ok: true, message: 'Approval announcement sent' };
  }

  // 2. Render Official Certificate of Membership (หนังสือรับรองสมาชิกภาพทางการ ลงนามโดยนายกสมาคมฯ)
  let finalCertBlob = certificateBlob;
  if (!finalCertBlob) {
    const centralSettings = await fetchCentralLayoutSettings().catch(() => null);
    let certBg = DEFAULT_CERT_TEMPLATE_BASE64;
    if (centralSettings?.templateBackgrounds?.certificate) {
      const rawBg = centralSettings.templateBackgrounds.certificate;
      if (rawBg.startsWith('data:image')) {
        certBg = rawBg;
      } else {
        const dataUri = await ensureDataUrl(rawBg).catch(() => null);
        if (dataUri && dataUri.startsWith('data:image')) {
          certBg = dataUri;
        }
      }
    }
    const certSvg = generateCertificateSvg(m, { 
      positions: centralSettings?.certificate,
      templateBackground: certBg,
      registrarName: approver, 
      registrarCallsign: approverCallsign 
    });
    finalCertBlob = await svgToPngBlob(certSvg, 1200, 1552);
  }
  if (finalCertBlob) {
    await sendTelegramPhoto(
      finalCertBlob,
      `📜 <b>หนังสือรับรองสถานะการเป็นสมาชิกภาพ (Certificate)</b>\n• ผู้สมัครสมาชิก: ${escapeHtml(m.fullName)}\n• สมาชิกเลขที่: ${escapeHtml(m.memberId || '30004')}`,
      {
        botToken: settings.botToken,
        chatId: settings.chatId,
        filename: `หนังสือรับรองสมาชิก_${m.fullName}.png`
      }
    );
  }

  // 3. Render Official Receipt if provided
  if (receiptBlob) {
    await new Promise(r => setTimeout(r, 400));
    await sendTelegramPhoto(
      receiptBlob,
      `🧾 <b>ใบเสร็จรับเงินฉบับอนุมัติ - ${escapeHtml(m.fullName)}</b>\nเล่มที่ ${receiptInfo.bookNo} เลขที่ ${receiptInfo.receiptNo} • สมาคมวิทยุสมัครเล่นสมิหลา (HS9AS)`,
      {
        botToken: settings.botToken,
        chatId: settings.chatId,
        filename: `ใบเสร็จรับเงิน_${m.fullName}.png`
      }
    );
  }

  return { ok: true, docCount: (finalCertBlob ? 1 : 0) + (receiptBlob ? 1 : 0) };
}
