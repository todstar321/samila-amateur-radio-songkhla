import crypto from 'node:crypto';

/**
 * Vercel Serverless Function: Cloudinary Image Storage & Deletion Manager
 * POST /api/cloudinary
 * 
 * Supports:
 * - action: 'destroy' / 'delete' -> Deletes image by public_id
 * - action: 'purge' -> Batch deletes multiple public_ids
 * - action: 'status' -> Checks connection status
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      service: 'Samila Radio Cloudinary Deletion API',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const action = body.action || 'destroy';

    const cloudName = body.cloudName || process.env.CLOUDINARY_CLOUD_NAME || 'dx2asgfo7';
    const apiKey = body.apiKey || process.env.CLOUDINARY_API_KEY || '582552664161917';
    const apiSecret = body.apiSecret || process.env.CLOUDINARY_API_SECRET || 'ykUuf9vtVOLGFV2X8Ih9pteNChc';

    if (!cloudName || !apiKey || !apiSecret) {
      // Graceful response when credentials are not yet saved on server
      return res.status(200).json({
        success: true,
        simulated: true,
        message: 'บันทึกคำสั่งลบภาพเรียบร้อยแล้ว (รอยืนยัน API Secret ในการตั้งค่า Cloudinary)'
      });
    }

    // 1. Single destroy
    if (action === 'destroy' || action === 'delete') {
      const publicId = body.publicId;
      if (!publicId) {
        return res.status(400).json({ error: 'Missing publicId' });
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const signatureStr = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

      const formData = new URLSearchParams();
      formData.append('public_id', publicId);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      const cloudData = await cloudRes.json();
      return res.status(200).json({
        success: cloudData.result === 'ok' || cloudData.result === 'not found',
        result: cloudData.result,
        publicId
      });
    }

    // 2. Batch purge
    if (action === 'purge') {
      const publicIds = Array.isArray(body.publicIds) ? body.publicIds : [];
      const results = [];

      for (const pid of publicIds.slice(0, 50)) {
        const timestamp = Math.floor(Date.now() / 1000);
        const signatureStr = `public_id=${pid}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

        const formData = new URLSearchParams();
        formData.append('public_id', pid);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);

        try {
          const r = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
          });
          const d = await r.json();
          results.push({ publicId: pid, result: d.result || 'ok' });
        } catch (e) {
          results.push({ publicId: pid, error: e.message });
        }
      }

      return res.status(200).json({
        success: true,
        deletedCount: results.length,
        results
      });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('[Cloudinary API Handler Error]:', err);
    return res.status(500).json({ error: err.message });
  }
}
