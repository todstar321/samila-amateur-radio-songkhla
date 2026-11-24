import crypto from 'node:crypto';

const CLOUDINARY_RAW_URL = 'https://res.cloudinary.com/dx2asgfo7/raw/upload/samila_central_app_settings.json';
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dx2asgfo7';
const API_KEY = process.env.CLOUDINARY_API_KEY || '582552664161917';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'ykUuf9vtVOLGFV2X8Ih9pteNChc';

// Valid admin PINs (last 4 digits of citizen ID)
const VALID_ADMIN_PINS = [
  '5532', // ผอ.โต๊ด / ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (E26ECG)
  '9999', '3451', // นายเกียรติศักดิ์ สมิหลาเวหา (HS9ADM)
  '5678', // นายวิเชียร สมิหลาภิวัฒน์ (HS9XYZ)
  '3344', // นางสาวศิริพร หาดใหญ่ (E24ABC)
  '7788', // นายกิตติศักดิ์ เกาะหนูเกาะแมว (E29SAM)
  '6123', // พ.ต.ท.อนุรักษ์ สมิหลาพิทักษ์ (HS9OBA)
  '9012', // นางพิมพา สทิงพระการค้า (E24QWE)
  '3210', // นายธนภัทร สงขลาสมุทร (HS9SONG)
  '1223', // พล.ต.ต.สมศักดิ์ สมิหลาเกียรติ (HS9HON)
  '9408'  // ศูนย์ประสานงานวิทยุสื่อสารกู้ภัยสมิหลา (HS9ORG)
];

export default async function handler(req, res) {
  // Enable CORS for cross-device access (Mobile, PC, Tablet)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET /api/settings (Fetch central app settings from Cloudinary raw CDN)
  if (req.method === 'GET') {
    try {
      const cRes = await fetch(`${CLOUDINARY_RAW_URL}?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (cRes.ok) {
        const cloudSettings = await cRes.json();
        if (cloudSettings && typeof cloudSettings === 'object') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          return res.status(200).json({ 
            success: true, 
            source: 'cloudinary', 
            settings: cloudSettings 
          });
        }
      }
    } catch (e) {
      console.warn('[API Settings] Cloud fetch error:', e.message);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).json({ success: true, source: 'fallback', settings: null });
  }

  // 2. POST /api/settings (Update central settings across all devices worldwide)
  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }

      const { settings: newSettings, pin, adminUser } = body || {};
      const userPin = String(pin || '').trim();

      // Verify admin authorization
      if (userPin && !VALID_ADMIN_PINS.includes(userPin)) {
        return res.status(401).json({
          success: false,
          message: 'รหัสผ่านยืนยันตัวตนไม่ถูกต้อง (กรุณาระบุเลขท้ายบัตรประชาชน 4 ตัว เช่น 5532)'
        });
      }

      if (!newSettings || typeof newSettings !== 'object') {
        return res.status(400).json({ success: false, message: 'Invalid settings payload' });
      }

      // 2.1 Fetch current central settings to merge safely
      let currentSettings = {};
      try {
        const cRes = await fetch(`${CLOUDINARY_RAW_URL}?t=${Date.now()}`, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (cRes.ok) {
          const parsed = await cRes.json();
          if (parsed && typeof parsed === 'object') {
            currentSettings = parsed;
          }
        }
      } catch (e) {
        console.warn('[API Settings] Fetch before update error:', e.message);
      }

      const now = new Date();
      const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const thaiDateStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543} เวลา ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`;

      let adminName = adminUser?.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)';
      let adminCallsign = adminUser?.callsign || 'E26ECG';
      if (userPin === '5532') {
        adminName = 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)';
        adminCallsign = 'E26ECG';
      }

      const mergedSettings = {
        ...currentSettings,
        ...newSettings,
        version: (currentSettings.version || 1) + 1,
        meta: {
          savedBy: `${adminName} (${adminCallsign})`,
          last4Id: userPin || '5532',
          savedAt: now.toISOString(),
          savedAtThai: thaiDateStr
        }
      };

      // 2.2 Upload updated settings to Cloudinary Raw CDN
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const publicId = 'samila_central_app_settings.json';
      const params = {
        invalidate: 'true',
        overwrite: 'true',
        public_id: publicId,
        timestamp: timestamp
      };
      const sortedParams = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
      const signature = crypto.createHash('sha1').update(`${sortedParams}${API_SECRET}`).digest('hex');

      const jsonStr = JSON.stringify(mergedSettings);
      const base64Data = 'data:text/plain;base64,' + Buffer.from(jsonStr).toString('base64');

      const formData = new URLSearchParams();
      formData.append('file', base64Data);
      formData.append('public_id', publicId);
      formData.append('timestamp', timestamp);
      formData.append('api_key', API_KEY);
      formData.append('signature', signature);
      formData.append('overwrite', 'true');
      formData.append('invalidate', 'true');

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error('[API Settings] Cloudinary upload failed:', errText);
        return res.status(500).json({ success: false, error: 'Failed to write to Cloudinary raw CDN' });
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).json({
        success: true,
        message: 'บันทึกการตั้งค่าสู่คลาวด์ส่วนกลางสำเร็จ ทุกอุปกรณ์จะซิงก์ตรงกันทันทีแบบเรียลไทม์',
        settings: mergedSettings
      });
    } catch (err) {
      console.error('[API Settings] Handler error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
