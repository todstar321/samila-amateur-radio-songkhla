import defaultSavedLayout from '../data/savedLayoutSettings.json' with { type: 'json' };

// Local storage key constants
export const STORAGE_KEYS = {
  application: 'samila_application_layout_v1',
  receipt: 'samila_receipt_layout_v2',
  certificate: 'samila_certificate_layout_v1',
  receiptTier: 'samila_receipt_tier_positions_v1',
  appTier: 'samila_app_tier_positions_v1',
  templateBackgrounds: 'samila_doc_template_backgrounds_v1',
  meta: 'samila_layout_sync_meta'
};

/**
 * Valid admin last-4-digits of Citizen ID
 */
export const VALID_ADMIN_PINS = [
  '5532', // ผอ.โต๊ด / ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (E26ECG) - 1969900105532
  '9999', // แอดมินเกียรติ / นายเกียรติศักดิ์ สมิหลาเวหา (HS9ADM)
  '3451', // แอดมินเกียรติ (จริงตาม 1909900123451)
  '5678', // นายวิเชียร (HS9XYZ)
  '3344', // นางสาวศิริพร (E24ABC)
  '7788', // นายกิตติศักดิ์ (E29SAM)
  '6123', // พ.ต.ท.อนุรักษ์ (HS9OBA)
  '9012', // นางพิมพา (E24QWE)
  '3210', // นายธนภัทร (HS9SONG)
  '1223', // พล.ต.ต.สมศักดิ์ (HS9HON)
  '9408'  // กู้ภัยสมิหลา (HS9ORG)
];

const CLOUDINARY_BACKUP_RAW_URL = 'https://res.cloudinary.com/dx2asgfo7/raw/upload/samila_central_layout_settings.json';

/**
 * Loads layout settings with cascade:
 * 1. Server API (/api/layout-settings) -> Single source of truth for cross-device sync
 * 2. Cloudinary Raw CDN (Direct Global Fallback)
 * 3. Static bundled fallback (src/data/savedLayoutSettings.json)
 * 4. LocalStorage cache
 */
export async function fetchCentralLayoutSettings() {
  const syncToLocal = (serverData) => {
    if (!serverData) return;
    if (serverData.application) localStorage.setItem(STORAGE_KEYS.application, JSON.stringify(serverData.application));
    if (serverData.receipt) localStorage.setItem(STORAGE_KEYS.receipt, JSON.stringify(serverData.receipt));
    if (serverData.certificate) localStorage.setItem(STORAGE_KEYS.certificate, JSON.stringify(serverData.certificate));
    if (serverData.receiptTierPositions) localStorage.setItem(STORAGE_KEYS.receiptTier, JSON.stringify(serverData.receiptTierPositions));
    if (serverData.appTierPositions) localStorage.setItem(STORAGE_KEYS.appTier, JSON.stringify(serverData.appTierPositions));
    if (serverData.templateBackgrounds) localStorage.setItem(STORAGE_KEYS.templateBackgrounds, JSON.stringify(serverData.templateBackgrounds));
    if (serverData.meta) localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify(serverData.meta));
  };

  // 1. Try Vercel Serverless API first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`/api/layout-settings?t=${Date.now()}`, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const serverData = await res.json();
      if (serverData && !serverData.error && serverData.version) {
        syncToLocal(serverData);
        return serverData;
      }
    }
  } catch (err) {}

  // 2. Direct Cloudinary Raw CDN Fallback (Ensures 100% sync on any mobile/desktop network)
  try {
    const cRes = await fetch(`${CLOUDINARY_BACKUP_RAW_URL}?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (cRes.ok) {
      const cloudData = await cRes.json();
      if (cloudData && cloudData.version) {
        syncToLocal(cloudData);
        return cloudData;
      }
    }
  } catch (err) {}

  // Fallback: bundled JSON merged with localStorage
  return {
    ...defaultSavedLayout,
    application: getCached(STORAGE_KEYS.application, defaultSavedLayout.application),
    receipt: getCached(STORAGE_KEYS.receipt, defaultSavedLayout.receipt),
    certificate: getCached(STORAGE_KEYS.certificate, defaultSavedLayout.certificate),
    receiptTierPositions: getCached(STORAGE_KEYS.receiptTier, defaultSavedLayout.receiptTierPositions),
    appTierPositions: getCached(STORAGE_KEYS.appTier, defaultSavedLayout.appTierPositions),
    templateBackgrounds: getCached(STORAGE_KEYS.templateBackgrounds, defaultSavedLayout.templateBackgrounds),
    meta: getCached(STORAGE_KEYS.meta, defaultSavedLayout.meta)
  };
}

function getCached(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    if (s) return JSON.parse(s);
  } catch (e) {}
  return fallback;
}

/**
 * Saves central layout settings to server with Admin PIN verification
 */
export async function saveCentralLayoutSettings({
  docType,
  dataToSave,
  pin,
  adminUser
}) {
  const cleanPin = String(pin || '').trim();
  if (!VALID_ADMIN_PINS.includes(cleanPin)) {
    return {
      success: false,
      message: 'รหัสผ่านแอดมินไม่ถูกต้อง (กรุณาระบุเลขท้ายบัตรประชาชน 4 ตัว เช่น 5532)'
    };
  }

  // 1. Immediately cache into current browser's localStorage
  try {
    if (dataToSave.application) {
      localStorage.setItem(STORAGE_KEYS.application, JSON.stringify(dataToSave.application));
    }
    if (dataToSave.receipt) {
      localStorage.setItem(STORAGE_KEYS.receipt, JSON.stringify(dataToSave.receipt));
    }
    if (dataToSave.certificate) {
      localStorage.setItem(STORAGE_KEYS.certificate, JSON.stringify(dataToSave.certificate));
    }
    if (dataToSave.receiptTierPositions) {
      localStorage.setItem(STORAGE_KEYS.receiptTier, JSON.stringify(dataToSave.receiptTierPositions));
    }
    if (dataToSave.appTierPositions) {
      localStorage.setItem(STORAGE_KEYS.appTier, JSON.stringify(dataToSave.appTierPositions));
    }
    if (dataToSave.templateBackgrounds) {
      localStorage.setItem(STORAGE_KEYS.templateBackgrounds, JSON.stringify(dataToSave.templateBackgrounds));
    }
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }

  // 2. Transmit to Central API Server
  try {
    const res = await fetch('/api/layout-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin: cleanPin,
        adminUser,
        data: dataToSave
      })
    });

    const result = await res.json();
    if (res.ok && result.success) {
      if (result.meta) {
        localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify(result.meta));
      }
      return {
        success: true,
        message: result.message || 'บันทึกสำเร็จ',
        meta: result.meta
      };
    } else {
      return {
        success: false,
        message: result.message || 'บันทึกลงระบบกลางไม่สำเร็จ'
      };
    }
  } catch (err) {
    console.error('API Save request failed:', err);
    // If server request fails (e.g. offline standalone), fallback to local persistence
    const meta = {
      savedBy: adminUser?.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)',
      callsign: adminUser?.callsign || 'E26ECG',
      last4Id: cleanPin,
      savedAt: new Date().toISOString(),
      savedAtThai: new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())
    };
    localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify(meta));
    return {
      success: true,
      localOnly: true,
      message: 'บันทึกลงในเครื่องปัจจุบันเรียบร้อยแล้ว (กำลังเชื่อมต่อเซิร์ฟเวอร์กลาง)',
      meta
    };
  }
}
