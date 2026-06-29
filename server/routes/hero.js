const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const HeroSlide = require('../models/HeroSlide');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

router.get('/', async (req, res) => {
  const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1 }).lean();
  res.json({ success: true, data: slides });
});

router.get('/admin/all', protect, admin, async (req, res) => {
  const slides = await HeroSlide.find().sort({ order: 1 }).lean();
  res.json({ success: true, data: slides });
});

router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  let image = req.body.image || '';
  let imagePublicId = '';
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'hero');
    image = result.secure_url;
    imagePublicId = result.public_id;
  }
  const slide = await HeroSlide.create({ ...req.body, image, imagePublicId });
  res.status(201).json({ success: true, data: slide });
});

router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  const slide = await HeroSlide.findById(req.params.id);
  if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });
  if (req.file) {
    if (slide.imagePublicId) await deleteFromCloudinary(slide.imagePublicId);
    const result = await uploadToCloudinary(req.file.buffer, 'hero');
    req.body.image = result.secure_url;
    req.body.imagePublicId = result.public_id;
  }
  const updated = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: updated });
});

router.put('/:id/reorder', protect, admin, async (req, res) => {
  await HeroSlide.findByIdAndUpdate(req.params.id, { order: req.body.order });
  res.json({ success: true, message: 'Reordered' });
});

router.delete('/:id', protect, admin, async (req, res) => {
  const slide = await HeroSlide.findById(req.params.id);
  if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });
  if (slide.imagePublicId) await deleteFromCloudinary(slide.imagePublicId);
  await slide.deleteOne();
  res.json({ success: true, message: 'Slide deleted' });
});

module.exports = router;
