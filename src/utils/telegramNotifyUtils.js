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
  generateReceiptSvg,
  generateAvatarBadgeSvg
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
 * Create a valid JPEG blob from default template to guarantee binary safety
 */
function createMinimalJpegBlob() {
  try {
    const b64 = DEFAULT_RECEIPT_TEMPLATE_BASE64.split(',')[1];
    const bstr = atob(b64);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: 'image/jpeg' });
  } catch {
    return new Blob([], { type: 'image/jpeg' });
  }
}

/**
 * Draw emergency canvas fallback card in case SVG rasterization fails
 */
function drawFallbackCanvas(ctx, width, height, title = '') {
  try {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, width - 40, height - 40);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา (HS9AS)', width / 2, 75);
    if (title) {
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#0369a1';
      ctx.fillText(title, width / 2, 120);
    }
  } catch (e) {
    // ignore
  }
}

/**
 * Rasterize SVG string to high-res JPEG/PNG Blob using offscreen canvas
 */
export function svgToPngBlob(svgString, width = 1200, height = 1695, format = 'image/jpeg') {
  return new Promise((resolve) => {
    let resolved = false;
    const safeResolve = (blob) => {
      if (!resolved) {
        resolved = true;
        resolve(blob || createMinimalJpegBlob());
      }
    };

    if (typeof window === 'undefined' || !window.document) {
      return safeResolve(createMinimalJpegBlob());
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Timeout safety net (3500ms): if rendering hangs or font loading takes too long, render canvas fallback
    const timer = setTimeout(() => {
      console.warn('[svgToPngBlob] Render timed out, generating fallback JPEG');
      drawFallbackCanvas(ctx, width, height);
      canvas.toBlob((b) => safeResolve(b), format, 0.92);
    }, 3500);

    let cleanSvg = svgString;
    if (!cleanSvg.includes('xmlns:xlink')) {
      cleanSvg = cleanSvg.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ');
    }
    cleanSvg = cleanSvg.replace(/<image\s+href="([^"]+)"(?!\s+xlink:href)/g, '<image href="$1" xlink:href="$1"');

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const renderCanvas = () => {
      clearTimeout(timer);
      try {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob && !blob.type.includes('svg')) {
            safeResolve(blob);
          } else {
            try {
              const dataUrl = canvas.toDataURL(format, 0.92);
              const bstr = atob(dataUrl.split(',')[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) u8arr[n] = bstr.charCodeAt(n);
              safeResolve(new Blob([u8arr], { type: format }));
            } catch (e2) {
              drawFallbackCanvas(ctx, width, height);
              canvas.toBlob((b) => safeResolve(b), format, 0.92);
            }
          }
        }, format, 0.92);
      } catch (err) {
        console.warn('[svgToPngBlob] drawImage error:', err);
        drawFallbackCanvas(ctx, width, height);
        canvas.toBlob((b) => safeResolve(b), format, 0.92);
      }
    };

    img.onload = renderCanvas;

    img.onerror = (e) => {
      console.warn('[svgToPngBlob] Data URL error, trying Blob URL fallback:', e);
      try {
        const svgBlob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);
        const fbImg = new Image();
        fbImg.crossOrigin = 'anonymous';
        fbImg.onload = () => {
          clearTimeout(timer);
          URL.revokeObjectURL(blobURL);
          try {
            ctx.drawImage(fbImg, 0, 0, width, height);
            canvas.toBlob((b) => safeResolve(b), format, 0.92);
          } catch {
            drawFallbackCanvas(ctx, width, height);
            canvas.toBlob((b) => safeResolve(b), format, 0.92);
          }
        };
        fbImg.onerror = () => {
          clearTimeout(timer);
          URL.revokeObjectURL(blobURL);
          drawFallbackCanvas(ctx, width, height);
          canvas.toBlob((b) => safeResolve(b), format, 0.92);
        };
        fbImg.src = blobURL;
      } catch {
        clearTimeout(timer);
        drawFallbackCanvas(ctx, width, height);
        canvas.toBlob((b) => safeResolve(b), format, 0.92);
      }
    };

    try {
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(cleanSvg);
    } catch (e) {
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(cleanSvg)));
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

    // If rate limited by Telegram (HTTP 429 Too Many Requests), wait specified duration and retry once!
    if (!result.ok && result.error_code === 429) {
      const retryAfter = (result.parameters?.retry_after || 2) * 1000 + 500;
      console.warn(`[Telegram API] Rate limited (429). Retrying after ${retryAfter}ms...`);
      await new Promise(r => setTimeout(r, retryAfter));
      result = await doFetch(primaryChatId);
    }

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

  let blob = photoOrBlob;

  // Convert Data URL, Blob URL, or remote URL into real Blob
  if (typeof photoOrBlob === 'string') {
    if (photoOrBlob.startsWith('data:') || photoOrBlob.startsWith('blob:')) {
      blob = await dataUrlToBlob(photoOrBlob);
    } else if (photoOrBlob.startsWith('http://') || photoOrBlob.startsWith('https://')) {
      try {
        const resp = await fetch(photoOrBlob);
        if (resp.ok) blob = await resp.blob();
      } catch (e) {
        console.warn('[Telegram] Remote fetch failed, trying JSON fallback:', e);
      }
      if (!blob || !(blob instanceof Blob)) {
        const payload = {
          photo: photoOrBlob,
          caption: caption || '',
          parse_mode: options.parse_mode || 'HTML'
        };
        const res = await sendTelegramRequest('sendPhoto', payload, false, options.botToken, options.chatId);
        if (res.ok) return res;
      }
    }
  }

  if (!blob || !(blob instanceof Blob)) {
    return { ok: false, description: 'Failed to convert photo to valid Blob' };
  }

  // Ensure filename ends in .jpg for native Telegram inline photo feed
  const rawFilename = options.filename || 'photo.jpg';
  const cleanFilename = rawFilename.replace(/\.png$/i, '.jpg').replace(/\.svg$/i, '.jpg');

  // Send as binary FormData directly to Telegram sendPhoto
  const formData = new FormData();
  formData.append('photo', blob, cleanFilename);
  if (caption) {
    formData.append('caption', caption);
    formData.append('parse_mode', options.parse_mode || 'HTML');
  }
  let res = await sendTelegramRequest('sendPhoto', formData, true, options.botToken, options.chatId);

  // Fallback: If sendPhoto failed (e.g. image rejected or processing issue), fallback to sendDocument
  if (!res.ok) {
    console.warn(`[Telegram sendPhoto] Failed (${res.description}), attempting fallback to sendDocument...`);
    try {
      const docFormData = new FormData();
      docFormData.append('document', blob, cleanFilename);
      if (caption) {
        docFormData.append('caption', caption);
        docFormData.append('parse_mode', options.parse_mode || 'HTML');
      }
      const docRes = await sendTelegramRequest('sendDocument', docFormData, true, options.botToken, options.chatId);
      if (docRes.ok) return docRes;
    } catch (docErr) {
      console.warn('[Telegram sendDocument fallback failed]:', docErr);
    }
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
    const receiptBlob = await svgToPngBlob(receiptSvg, 1200, 1629, 'image/jpeg');
    if (receiptBlob) {
      officialDocsList.push({
        blob: receiptBlob,
        filename: `01_ใบเสร็จรับเงิน_${m.fullName}_เล่ม${receiptInfo.bookNo}_เลขที่${receiptInfo.receiptNo}.jpg`,
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
    const appBlob = await svgToPngBlob(appSvg, 1200, 1693, 'image/jpeg');
    if (appBlob) {
      officialDocsList.push({
        blob: appBlob,
        filename: `02_ใบสมัครสมาชิก_${m.fullName}.jpg`,
        caption: `📄 <b>ใบสมัครสมาชิกสมาคม (แบบคำขอทางการ)</b>\n• ผู้สมัคร: ${escapeHtml(m.fullName)}\n• นามเรียกขาน: ${escapeHtml(m.callsign && m.callsign !== '-' ? m.callsign : 'ขอรับใหม่')}`
      });
    }
  } catch (e) {
    console.warn('App form render error:', e);
  }

  // 3. ATTACHED APPLICANT EVIDENCE (รูปถ่าย, สำเนาบัตรประชาชน, ทะเบียนบ้าน, สลิปโอนเงิน)
  const evidenceList = [];

  // 3.1 Photo Avatar (1-2 inch)
  let avatarBlob = null;
  const rawAvatar = m.avatarDataUrl || m.avatar;
  if (rawAvatar) {
    if (typeof rawAvatar === 'string' && (rawAvatar.startsWith('data:') || rawAvatar.startsWith('blob:'))) {
      avatarBlob = await dataUrlToBlob(rawAvatar);
    } else if (typeof rawAvatar === 'string' && rawAvatar.startsWith('http')) {
      try {
        const resp = await fetch(rawAvatar);
        if (resp.ok) avatarBlob = await resp.blob();
      } catch (err) {
        console.warn('Avatar remote fetch error:', err);
      }
    } else if (rawAvatar instanceof Blob) {
      avatarBlob = rawAvatar;
    }
  }
  if (!avatarBlob) {
    try {
      const badgeSvg = generateAvatarBadgeSvg(m);
      avatarBlob = await svgToPngBlob(badgeSvg, 800, 1000, 'image/jpeg');
    } catch (e) {
      console.warn('Avatar badge render error:', e);
    }
  }
  if (avatarBlob) {
    evidenceList.push({
      blob: avatarBlob,
      filename: `03_รูปถ่าย_${m.fullName}.jpg`,
      caption: `👤 <b>03_รูปถ่ายหน้าตรง 1-2 นิ้ว</b>\n• ผู้สมัครสมาชิก: ${escapeHtml(m.fullName)}\n• นามเรียกขาน: ${escapeHtml(m.callsign && m.callsign !== '-' ? m.callsign : 'ขอรับใหม่')}`
    });
  }

  // 3.2 Citizen ID Card Slip (ดึงข้อมูลจริง หรือใช้ SVG จำลอง)
  let idCardBlob = null;
  const rawIdCard = m.idCardDataUrl || m.idCardSlip;
  if (rawIdCard) {
    if (typeof rawIdCard === 'string' && (rawIdCard.startsWith('data:') || rawIdCard.startsWith('blob:'))) {
      idCardBlob = await dataUrlToBlob(rawIdCard);
    } else if (typeof rawIdCard === 'string' && rawIdCard.startsWith('http')) {
      try {
        const resp = await fetch(rawIdCard);
        if (resp.ok) idCardBlob = await resp.blob();
      } catch (err) {
        console.warn('ID Card remote fetch error:', err);
      }
    } else if (rawIdCard instanceof Blob) {
      idCardBlob = rawIdCard;
    }
  }
  if (!idCardBlob) {
    try {
      const idCardSvg = generateCitizenIdCardSvg(m);
      idCardBlob = await svgToPngBlob(idCardSvg, 1200, 750, 'image/jpeg');
    } catch (e) {
      console.warn('ID Card render error:', e);
    }
  }
  if (idCardBlob) {
    evidenceList.push({
      blob: idCardBlob,
      filename: `04_สำเนาบัตรประชาชน_${m.fullName}.jpg`,
      caption: `🪪 <b>04_สำเนาบัตรประจำตัวประชาชน</b>\n• ผู้สมัครสมาชิก: ${escapeHtml(m.fullName)}\n• เลขประจำตัวประชาชน: <code>${escapeHtml(m.citizenId || '-')}</code>`
    });
  }

  // 3.3 House Registration Slip (ดึงข้อมูลจริง หรือใช้ SVG จำลอง)
  let houseBlob = null;
  const rawHouse = m.houseDataUrl || m.houseSlip;
  if (rawHouse) {
    if (typeof rawHouse === 'string' && (rawHouse.startsWith('data:') || rawHouse.startsWith('blob:'))) {
      houseBlob = await dataUrlToBlob(rawHouse);
    } else if (typeof rawHouse === 'string' && rawHouse.startsWith('http')) {
      try {
        const resp = await fetch(rawHouse);
        if (resp.ok) houseBlob = await resp.blob();
      } catch (err) {
        console.warn('House reg remote fetch error:', err);
      }
    } else if (rawHouse instanceof Blob) {
      houseBlob = rawHouse;
    }
  }
  if (!houseBlob) {
    try {
      const houseSvg = generateHouseRegistrationSvg(m);
      houseBlob = await svgToPngBlob(houseSvg, 1200, 975, 'image/jpeg');
    } catch (e) {
      console.warn('House reg render error:', e);
    }
  }
  if (houseBlob) {
    evidenceList.push({
      blob: houseBlob,
      filename: `05_สำเนาทะเบียนบ้าน_${m.fullName}.jpg`,
      caption: `🏠 <b>05_สำเนาทะเบียนบ้าน (ท.ร.14)</b>\n• ผู้สมัครสมาชิก: ${escapeHtml(m.fullName)}\n• ที่อยู่: ${escapeHtml(m.registeredAddress || m.currentAddress || '-')}`
    });
  }

  // 3.4 Bank Transfer Slip (ดึงข้อมูลจริง หรือใช้ SVG จำลอง)
  let transferBlob = null;
  const rawSlip = m.slipDataUrl || m.transferSlip;
  if (rawSlip) {
    if (typeof rawSlip === 'string' && (rawSlip.startsWith('data:') || rawSlip.startsWith('blob:'))) {
      transferBlob = await dataUrlToBlob(rawSlip);
    } else if (typeof rawSlip === 'string' && rawSlip.startsWith('http')) {
      try {
        const resp = await fetch(rawSlip);
        if (resp.ok) transferBlob = await resp.blob();
      } catch (err) {
        console.warn('Bank slip remote fetch error:', err);
      }
    } else if (rawSlip instanceof Blob) {
      transferBlob = rawSlip;
    }
  }
  if (!transferBlob) {
    try {
      const slipSvg = generateBankSlipSvg(m);
      transferBlob = await svgToPngBlob(slipSvg, 900, 1275, 'image/jpeg');
    } catch (e) {
      console.warn('Bank slip render error:', e);
    }
  }
  if (transferBlob) {
    evidenceList.push({
      blob: transferBlob,
      filename: `06_สลิปโอนเงิน_${m.fullName}.jpg`,
      caption: `💸 <b>06_สลิปหลักฐานการโอนเงิน</b>\n• ผู้สมัครสมาชิก: ${escapeHtml(m.fullName)}\n• ยอดเงินโอน: ${escapeHtml(feeText)}`
    });
  }

  // Send all documents as distinct individual photos with dedicated captions (ลำดับ 01 ถึง 06 ครบถ้วน)
  const allPhotosToSend = [...officialDocsList, ...evidenceList];
  for (let i = 0; i < allPhotosToSend.length; i++) {
    const item = allPhotosToSend[i];
    const photoPayload = item.blob || item.photo;
    if (item && photoPayload) {
      try {
        const sendRes = await sendTelegramPhoto(photoPayload, item.caption, {
          botToken: settings.botToken,
          chatId: settings.chatId,
          filename: item.filename
        });
        if (!sendRes?.ok) {
          console.warn(`[Telegram] Photo #${i + 1} (${item.filename}) failed:`, sendRes);
        }
      } catch (err) {
        console.warn(`[Telegram] Photo #${i + 1} (${item.filename}) send error:`, err);
      }
      // Delay 1200ms between each photo to strictly prevent Telegram group rate limit (429)
      if (i < allPhotosToSend.length - 1) {
        await new Promise(r => setTimeout(r, 1200));
      }
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
    finalCertBlob = await svgToPngBlob(certSvg, 1200, 1552, 'image/jpeg');
  }
  if (finalCertBlob) {
    await sendTelegramPhoto(
      finalCertBlob,
      `📜 <b>หนังสือรับรองสถานะการเป็นสมาชิกภาพ (Certificate)</b>\n• ผู้สมัครสมาชิก: ${escapeHtml(m.fullName)}\n• สมาชิกเลขที่: ${escapeHtml(m.memberId || '30004')}`,
      {
        botToken: settings.botToken,
        chatId: settings.chatId,
        filename: `01_หนังสือรับรองสมาชิก_${m.fullName}.jpg`
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
