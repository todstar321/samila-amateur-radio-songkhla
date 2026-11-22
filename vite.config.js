import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Custom Vite plugin providing REST API endpoints for central cross-platform layout synchronization:
 * - GET  /api/layout-settings: Reads src/data/savedLayoutSettings.json
 * - POST /api/layout-settings: Verifies Admin PIN (last 4 digits of citizen ID), merges updates,
 *                              records updater metadata, and writes to disk.
 */
function layoutApiPlugin() {
  const filePath = path.resolve(process.cwd(), 'src/data/savedLayoutSettings.json');

  return {
    name: 'vite-plugin-layout-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = req.url ? req.url.split('?')[0] : '';

        // 1. GET /api/layout-settings
        if (urlPath === '/api/layout-settings' && (req.method === 'GET' || req.method === 'HEAD')) {
          try {
            if (fs.existsSync(filePath)) {
              const data = fs.readFileSync(filePath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
              res.end(data);
              return;
            }
          } catch (err) {
            console.error('[API Layout] Read error:', err);
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Settings file not found' }));
          return;
        }

        // 2. POST /api/layout-settings
        if (urlPath === '/api/layout-settings' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);

              // Valid Admin PINs: last 4 digits of citizen ID
              // 5532 = ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด) / E26ECG (1969900105532)
              // 9999 / 3451 = นายเกียรติศักดิ์ สมิหลาเวหา / HS9ADM (1909900123451)
              // 5678 = นายวิเชียร สมิหลาภิวัฒน์ / HS9XYZ (1900200789234)
              // 3344 = นางสาวศิริพร หาดใหญ่ / E24ABC (3900500112345)
              // 7788 = นายกิตติศักดิ์ เกาะหนูเกาะแมว / E29SAM (1900400998876)
              // 6123 = พ.ต.ท.อนุรักษ์ สมิหลาพิทักษ์ / HS9OBA (1900300456123)
              // 9012 = นางพิมพา สทิงพระการค้า / E24QWE (3900600789012)
              // 3210 = นายธนภัทร สงขลาสมุทร / HS9SONG (1900700543210)
              // 1223 = พล.ต.ต.สมศักดิ์ สมิหลาเกียรติ / HS9HON (1909900011223)
              // 9408 = ศูนย์ประสานงานวิทยุสื่อสารกู้ภัยสมิหลา / HS9ORG (0993000149408)
              const validPins = [
                '5532', '9999', '3451', '5678', '3344', 
                '7788', '6123', '9012', '3210', '1223', '9408'
              ];

              const userPin = String(parsed.pin || '').trim();
              if (!userPin || !validPins.includes(userPin)) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  success: false, 
                  message: 'รหัสผ่านยืนยันตัวตนไม่ถูกต้อง (กรุณาระบุเลขท้ายบัตรประชาชน 4 ตัวของแอดมิน)' 
                }));
                return;
              }

              // Read existing data or fallback
              let existing = {};
              if (fs.existsSync(filePath)) {
                try {
                  existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                } catch (e) {}
              }

              // Determine admin name
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

              fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                success: true, 
                message: 'บันทึกการตั้งค่าพิกัดสู่ระบบกลางสำเร็จแล้ว ทุกอุปกรณ์จะใช้งานตรงกันทันที', 
                meta: updatedData.meta,
                version: updatedData.version
              }));
            } catch (err) {
              console.error('[API Layout] Write error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // 3. /api/cloudinary (Local Dev Cloudinary Handler)
        if (urlPath === '/api/cloudinary') {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 'online', service: 'Vite Dev Cloudinary API' }));
            return;
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const cloudName = parsed.cloudName;
                const apiKey = parsed.apiKey;
                const apiSecret = parsed.apiSecret;

                if (!cloudName || !apiKey || !apiSecret) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ 
                    success: true, 
                    simulated: true, 
                    message: 'บันทึกการลบภาพในระบบเรียบร้อย (จำลองการลบสำเร็จ)' 
                  }));
                  return;
                }

                const publicId = parsed.publicId;
                const timestamp = Math.floor(Date.now() / 1000);
                const cryptoMod = await import('node:crypto');
                const signature = cryptoMod.default.createHash('sha1')
                  .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
                  .digest('hex');

                const form = new URLSearchParams();
                form.append('public_id', publicId);
                form.append('api_key', apiKey);
                form.append('timestamp', timestamp.toString());
                form.append('signature', signature);

                const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: form.toString()
                });
                const cData = await cRes.json();
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, result: cData.result || 'ok' }));
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: e.message }));
              }
            });
            return;
          }
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    layoutApiPlugin(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-html2canvas': ['html2canvas'],
          'vendor-icons': ['lucide-react'],
        }
      }
    },
    chunkSizeWarningLimit: 1200
  }
});
