const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { Testimonial } = require('../models/index');

router.get('/', async (req, res) => {
  const testimonials = await Testimonial.find({ isActive: true }).sort({ order: 1 }).lean();
  res.json({ success: true, data: testimonials });
});
router.post('/', protect, admin, async (req, res) => {
  const t = await Testimonial.create(req.body);
  res.status(201).json({ success: true, data: t });
});
router.put('/:id', protect, admin, async (req, res) => {
  const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: t });
});
router.delete('/:id', protect, admin, async (req, res) => {
  await Testimonial.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Testimonial deleted' });
});

module.exports = router;
