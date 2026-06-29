const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

// Single image upload
router.post('/image', protect, admin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const folder = req.body.folder || 'general';
  const result = await uploadToCloudinary(req.file.buffer, folder, { quality: 'auto', fetch_format: 'auto' });
  res.json({ success: true, data: { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height } });
});

// Multiple images upload
router.post('/images', protect, admin, upload.array('images', 20), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'No files uploaded' });
  const folder = req.body.folder || 'general';
  const results = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer, folder, { quality: 'auto', fetch_format: 'auto' })));
  res.json({ success: true, data: results.map(r => ({ url: r.secure_url, publicId: r.public_id })) });
});

// Delete image
router.delete('/image', protect, admin, async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) return res.status(400).json({ success: false, message: 'publicId required' });
  await deleteFromCloudinary(publicId);
  res.json({ success: true, message: 'Image deleted' });
});

module.exports = router;
