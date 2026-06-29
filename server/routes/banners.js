// banners.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Banner = require('../models/Banner');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

router.get('/', async (req, res) => {
  const filter = { isActive: true };
  if (req.query.type) filter.type = req.query.type;
  const banners = await Banner.find(filter).sort({ order: 1 }).lean();
  res.json({ success: true, data: banners });
});

router.get('/admin/all', protect, admin, async (req, res) => {
  const banners = await Banner.find().sort({ order: 1 }).lean();
  res.json({ success: true, data: banners });
});

router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  let image = req.body.image || '';
  let imagePublicId = '';
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'banners');
    image = result.secure_url;
    imagePublicId = result.public_id;
  }
  const banner = await Banner.create({ ...req.body, image, imagePublicId });
  res.status(201).json({ success: true, data: banner });
});

router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
  if (req.file) {
    if (banner.imagePublicId) await deleteFromCloudinary(banner.imagePublicId);
    const result = await uploadToCloudinary(req.file.buffer, 'banners');
    req.body.image = result.secure_url;
    req.body.imagePublicId = result.public_id;
  }
  const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: updated });
});

router.delete('/:id', protect, admin, async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
  if (banner.imagePublicId) await deleteFromCloudinary(banner.imagePublicId);
  await banner.deleteOne();
  res.json({ success: true, message: 'Banner deleted' });
});

module.exports = router;
