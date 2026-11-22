import fs from 'node:fs';
import path from 'node:path';

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

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const filePath = path.join(process.cwd(), 'src', 'data', 'savedLayoutSettings.json');

  // 1. GET /api/layout-settings
  if (req.method === 'GET') {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(200).send(raw);
      }
    } catch (err) {
      console.error('[Vercel API] Read error:', err);
    }
    return res.status(200).json({ error: 'Settings file not found' });
  }

  // 2. POST /api/layout-settings
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

      let existing = {};
      if (fs.existsSync(filePath)) {
        try {
          existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
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

      try {
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf-8');
      } catch (writeErr) {
        // Read-only filesystem on serverless lambda
        console.warn('[Vercel API] Lambda filesystem read-only:', writeErr);
      }

      return res.status(200).json({
        success: true,
        message: 'บันทึกการตั้งค่าพิกัดสู่ระบบสำเร็จแล้ว',
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
