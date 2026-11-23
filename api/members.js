import crypto from 'node:crypto';

const CLOUDINARY_RAW_URL = 'https://res.cloudinary.com/dx2asgfo7/raw/upload/samila_central_members_list.json';
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dx2asgfo7';
const API_KEY = process.env.CLOUDINARY_API_KEY || '582552664161917';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'ykUuf9vtVOLGFV2X8Ih9pteNChc';

export default async function handler(req, res) {
  // Enable CORS for cross-device access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET /api/members (Fetch central members from Cloudinary raw CDN)
  if (req.method === 'GET') {
    try {
      const cRes = await fetch(`${CLOUDINARY_RAW_URL}?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (cRes.ok) {
        const cloudMembers = await cRes.json();
        if (Array.isArray(cloudMembers)) {
          res.setHeader('Content-Type', 'application/json');
          return res.status(200).json({ success: true, source: 'cloudinary', count: cloudMembers.length, members: cloudMembers });
        }
      }
    } catch (e) {
      console.warn('[API Members] Cloud fetch error:', e.message);
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ success: true, source: 'fallback', members: [] });
  }

  // 2. POST /api/members (Add, update, or sync members across all devices)
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

      const { action = 'add', member, members } = body || {};

      // 2.1 Fetch current central members list
      let currentMembers = [];
      try {
        const cRes = await fetch(`${CLOUDINARY_RAW_URL}?t=${Date.now()}`, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (cRes.ok) {
          const parsed = await cRes.json();
          if (Array.isArray(parsed)) {
            currentMembers = parsed;
          }
        }
      } catch (e) {
        console.warn('[API Members] Fetch before update error:', e.message);
      }

      let updatedList = [...currentMembers];

      if (action === 'sync' && Array.isArray(members)) {
        updatedList = members;
      } else if (action === 'add' && member) {
        // Prevent duplicates by ID or citizenId
        const existingIdx = updatedList.findIndex(m => m.id === member.id || (m.citizenId && m.citizenId === member.citizenId));
        if (existingIdx >= 0) {
          updatedList[existingIdx] = { ...updatedList[existingIdx], ...member };
        } else {
          updatedList.unshift(member);
        }
      } else if (action === 'update' && member) {
        const existingIdx = updatedList.findIndex(m => m.id === member.id || (m.citizenId && m.citizenId === member.citizenId));
        if (existingIdx >= 0) {
          updatedList[existingIdx] = { ...updatedList[existingIdx], ...member };
        } else {
          updatedList.unshift(member);
        }
      }

      // 2.2 Upload updated members list to Cloudinary raw storage
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const publicId = 'samila_central_members_list.json';
      const params = {
        invalidate: 'true',
        overwrite: 'true',
        public_id: publicId,
        timestamp: timestamp
      };
      const sortedParams = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
      const signature = crypto.createHash('sha1').update(`${sortedParams}${API_SECRET}`).digest('hex');

      const jsonStr = JSON.stringify(updatedList);
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
        console.error('[API Members] Cloudinary upload failed:', errText);
        return res.status(500).json({ success: false, error: 'Failed to write to Cloudinary raw CDN' });
      }

      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({
        success: true,
        message: 'บันทึกข้อมูลสมาชิกสู่ระบบคลาวด์กลางสำเร็จแล้ว ทุกอุปกรณ์จะเห็นตรงกันทันที',
        count: updatedList.length,
        members: updatedList
      });
    } catch (err) {
      console.error('[API Members] Handler error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
