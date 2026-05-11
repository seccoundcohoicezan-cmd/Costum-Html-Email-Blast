// api/imgbb-upload.js
// Vercel Serverless Function — proxy ImgBB upload dari browser (bypass CORS)
// Deploy otomatis saat push ke Vercel. Tidak perlu config tambahan.

export const config = { api: { bodyParser: { sizeLimit: '32mb' } } };

export default async function handler(req, res) {
  // CORS headers — izinkan semua origin (atau ganti dengan domain spesifik)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { apiKey, image, name } = req.body;

    if (!apiKey || !image) {
      return res.status(400).json({ success: false, error: { message: 'apiKey dan image wajib diisi' } });
    }

    // Forward ke ImgBB dari server (tidak ada CORS di server-to-server)
    const fd = new URLSearchParams();
    fd.append('key', apiKey);
    fd.append('image', image); // base64 string tanpa prefix
    if (name) fd.append('name', name);

    const imgbbRes = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: fd,
    });

    const data = await imgbbRes.json();
    return res.status(imgbbRes.status).json(data);

  } catch (err) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
}
