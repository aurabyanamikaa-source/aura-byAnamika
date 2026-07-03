// customerDiaries.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { CustomerDiary } = require('../models/index');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

// Public: active photos for the About page marquee
router.get('/', async (req, res) => {
  const photos = await CustomerDiary.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
  res.json({ success: true, data: photos });
});

// Admin: all photos (active + inactive)
router.get('/admin/all', protect, admin, async (req, res) => {
  const photos = await CustomerDiary.find().sort({ order: 1, createdAt: 1 }).lean();
  res.json({ success: true, data: photos });
});

router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Image is required' });
  const result = await uploadToCloudinary(req.file.buffer, 'customer-diaries');
  const photo = await CustomerDiary.create({
    image: result.secure_url,
    imagePublicId: result.public_id,
    caption: req.body.caption || '',
    isActive: req.body.isActive === undefined ? true : req.body.isActive === 'true' || req.body.isActive === true,
    order: Number(req.body.order) || 0,
  });
  res.status(201).json({ success: true, data: photo });
});

router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  const photo = await CustomerDiary.findById(req.params.id);
  if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });

  const update = {
    caption: req.body.caption !== undefined ? req.body.caption : photo.caption,
    isActive: req.body.isActive === undefined ? photo.isActive : (req.body.isActive === 'true' || req.body.isActive === true),
    order: req.body.order !== undefined ? (Number(req.body.order) || 0) : photo.order,
  };

  if (req.file) {
    if (photo.imagePublicId) await deleteFromCloudinary(photo.imagePublicId);
    const result = await uploadToCloudinary(req.file.buffer, 'customer-diaries');
    update.image = result.secure_url;
    update.imagePublicId = result.public_id;
  }

  const updated = await CustomerDiary.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json({ success: true, data: updated });
});

router.delete('/:id', protect, admin, async (req, res) => {
  const photo = await CustomerDiary.findById(req.params.id);
  if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });
  if (photo.imagePublicId) await deleteFromCloudinary(photo.imagePublicId);
  await photo.deleteOne();
  res.json({ success: true, message: 'Photo deleted' });
});

module.exports = router;