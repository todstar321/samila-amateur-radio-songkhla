import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

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

const CLOUDINARY_RAW_URL = 'https://res.cloudinary.com/dx2asgfo7/raw/upload/samila_central_layout_settings.json';
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dx2asgfo7';
const API_KEY = process.env.CLOUDINARY_API_KEY || '582552664161917';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'ykUuf9vtVOLGFV2X8Ih9pteNChc';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const localFilePath = path.join(process.cwd(), 'src', 'data', 'savedLayoutSettings.json');

  // 1. GET /api/layout-settings (Cascades: Cloudinary Raw CDN -> Local File)
  if (req.method === 'GET') {
    // 1.1 Priority: Fetch from Cloudinary Raw CDN (Real-time single source of truth across all devices)
    try {
      const cRes = await fetch(`${CLOUDINARY_RAW_URL}?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (cRes.ok) {
        const cloudData = await cRes.json();
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(200).json(cloudData);
      }
    } catch (err) {
      console.warn('[Vercel API] Cloudinary raw fetch failed, trying local file fallback:', err);
    }

    // 1.2 Fallback: Read local bundled JSON
    try {
      if (fs.existsSync(localFilePath)) {
        const raw = fs.readFileSync(localFilePath, 'utf-8');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(200).send(raw);
      }
    } catch (err) {
      console.error('[Vercel API] Read error:', err);
    }
    return res.status(200).json({ error: 'Settings file not found' });
  }

  // 2. POST /api/layout-settings (Saves to Cloudinary CDN & Local File)
  if (req.method === 'POST') {
    try {
      const parsed = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const userPin = String(parsed.pin || '').trim();

      if (!userPin || !VALID_ADMIN_PINS.includes(userPin)) {
        return res.status(401).json({
          success: false,
          message: 'รหัสผ่านยืนยันตัวตนไม่ถูกต้อง (กรุณาระบุเลขท้ายบัตรประชาชน 4 ตัว เช่น 5532)'
        });
      }

      // Load existing data from Cloudinary or local file
      let existing = {};
      try {
        const cRes = await fetch(`${CLOUDINARY_RAW_URL}?t=${Date.now()}`);
        if (cRes.ok) {
          existing = await cRes.json();
        }
      } catch (e) {}

      if (!existing.version && fs.existsSync(localFilePath)) {
        try {
          existing = JSON.parse(fs.readFileSync(localFilePath, 'utf-8'));
        } catch (e) {}
      }

      let adminName = parsed.adminUser?.fullName || 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)';
      let adminCallsign = parsed.adminUser?.callsign || 'E26ECG';
      if (userPin === '5532') {
        adminName = 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)';
        adminCallsign = 'E26ECG';
      } else if (userPin === '9999' || userPin === '3451') {
        adminName = 'นายเกียรติศักดิ์ สมิหลาเวหา';
        adminCallsign = 'HS9ADM';
      }

      const now = new Date();
      const thaiDateStr = new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(now);

      const updatedData = {
        ...existing,
        ...parsed.data,
        version: (existing.version || 1) + 1,
        meta: {
          savedBy: adminName,
          callsign: adminCallsign,
          last4Id: userPin,
          savedAt: now.toISOString(),
          savedAtThai: thaiDateStr
        }
      };

      // 2.1 Write to Cloudinary Raw CDN Storage (Available across PC, Mobile, Tablet worldwide)
      try {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const publicId = 'samila_central_layout_settings.json';
        const params = {
          invalidate: 'true',
          overwrite: 'true',
          public_id: publicId,
          timestamp: timestamp
        };
        const sortedParams = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
        const signature = crypto.createHash('sha1').update(`${sortedParams}${API_SECRET}`).digest('hex');

        const jsonStr = JSON.stringify(updatedData);
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
        const uploadJson = await uploadRes.json();
        console.log('[Vercel API] Saved central layout to Cloudinary:', uploadJson.secure_url);
      } catch (cloudErr) {
        console.error('[Vercel API] Cloudinary raw upload error:', cloudErr);
      }

      // 2.2 Try local file write (for dev server)
      try {
        fs.writeFileSync(localFilePath, JSON.stringify(updatedData, null, 2), 'utf-8');
      } catch (writeErr) {
        // Ignored on serverless read-only filesystem
      }

      return res.status(200).json({
        success: true,
        message: 'บันทึกการตั้งค่าพิกัดสู่ระบบกลางเรียบร้อยแล้ว (ซิงก์ PC และมือถือตรงกันทันที)',
        meta: updatedData.meta,
        version: updatedData.version,
        data: updatedData
      });
    } catch (err) {
      console.error('[Vercel API] Server error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
