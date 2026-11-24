/**
 * Central Cloud Settings Sync Utilities
 * Enables real-time cross-device sync between PC, Mobile, and Tablet via Cloudinary Raw CDN & /api/settings
 */

import { sha1 } from './cloudinaryUtils';

const CLOUDINARY_RAW_URL = 'https://res.cloudinary.com/dx2asgfo7/raw/upload/samila_central_app_settings.json';
const CLOUD_NAME = 'dx2asgfo7';
const API_KEY = '582552664161917';
const API_SECRET = 'ykUuf9vtVOLGFV2X8Ih9pteNChc';
export const STORAGE_KEY_SETTINGS = 'samila_radio_settings';

/**
 * Fetch central app settings (custom logo, themes, hero bg, president info, etc.)
 * Cascades: /api/settings -> Cloudinary Raw CDN -> localStorage
 */
export async function fetchCentralSettings() {
  // 1. Try local/Vercel Serverless API first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`/api/settings?t=${Date.now()}`, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.settings && typeof data.settings === 'object') {
        saveSettingsToLocalStorage(data.settings);
        return data.settings;
      }
    }
  } catch (e) {
    // API route might fail in local preview or offline, proceed to CDN fallback
  }

  // 2. Direct Cloudinary CDN fallback (Single global source of truth across all mobile & desktop networks)
  try {
    const cRes = await fetch(`${CLOUDINARY_RAW_URL}?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    if (cRes.ok) {
      const cloudSettings = await cRes.json();
      if (cloudSettings && typeof cloudSettings === 'object') {
        saveSettingsToLocalStorage(cloudSettings);
        return cloudSettings;
      }
    }
  } catch (e) {
    // CDN fetch error
  }

  // 3. Fallback to localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  return null;
}

/**
 * Helper to update local storage safely
 */
function saveSettingsToLocalStorage(newSettings) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    let merged = newSettings;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        merged = { ...parsed, ...newSettings };
      } catch (e) {}
    }
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(merged));
  } catch (e) {
    console.warn('[SettingsSync] localStorage write failed:', e);
  }
}

/**
 * Synchronize updated settings to central cloud storage immediately
 * Broadcasts to all local windows/tabs via CustomEvent and storage,
 * and uploads to Cloudinary Raw storage via /api/settings or direct browser SHA-1 upload
 */
export async function syncSettingsToCentral(newSettings, adminUser = null, pin = '5532') {
  if (!newSettings || typeof newSettings !== 'object') return false;

  const now = new Date();
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const thaiDateStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543} เวลา ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`;

  const enrichedSettings = {
    ...newSettings,
    version: (newSettings.version || Date.now()),
    updatedAt: now.toISOString(),
    updatedAtThai: thaiDateStr,
    meta: {
      savedBy: adminUser?.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด • E26ECG)',
      callsign: adminUser?.callsign || 'E26ECG',
      last4Id: pin || '5532',
      savedAt: now.toISOString(),
      savedAtThai: thaiDateStr
    }
  };

  // 1. Immediately cache in current browser's localStorage
  saveSettingsToLocalStorage(enrichedSettings);

  // 2. Dispatch custom event for real-time update in current browser tabs
  try {
    window.dispatchEvent(new CustomEvent('samila_settings_changed', { detail: enrichedSettings }));
  } catch (e) {}

  // 3. Try Vercel Serverless API first (/api/settings)
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: enrichedSettings,
        adminUser,
        pin: pin || '5532'
      })
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success) return true;
    }
  } catch (e) {
    console.warn('[SettingsSync] API endpoint failed, trying direct Cloudinary Raw upload fallback...', e);
  }

  // 4. Direct Cloudinary Raw Signed Upload Fallback (Works globally from any browser)
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const publicId = 'samila_central_app_settings.json';
    const paramsToSign = `invalidate=true&overwrite=true&public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
    const signature = await sha1(paramsToSign);

    const jsonStr = JSON.stringify(enrichedSettings);
    const base64Data = 'data:text/plain;base64,' + btoa(unescape(encodeURIComponent(jsonStr)));

    const formData = new FormData();
    formData.append('file', base64Data);
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp);
    formData.append('api_key', API_KEY);
    formData.append('signature', signature);
    formData.append('overwrite', 'true');
    formData.append('invalidate', 'true');

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {
      method: 'POST',
      body: formData
    });

    if (uploadRes.ok) {
      console.log('[SettingsSync] Direct Cloudinary raw sync succeeded!');
      return true;
    }
  } catch (directErr) {
    console.error('[SettingsSync] Direct Cloudinary upload failed:', directErr);
  }

  return false;
}
