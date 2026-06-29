const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { FAQ } = require('../models/index');

router.get('/', async (req, res) => {
  const faqs = await FAQ.find({ isActive: true }).sort({ order: 1 }).lean();
  res.json({ success: true, data: faqs });
});
router.get('/admin/all', protect, admin, async (req, res) => {
  const faqs = await FAQ.find().sort({ order: 1 }).lean();
  res.json({ success: true, data: faqs });
});
router.post('/', protect, admin, async (req, res) => {
  const faq = await FAQ.create(req.body);
  res.status(201).json({ success: true, data: faq });
});
router.put('/:id', protect, admin, async (req, res) => {
  const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: faq });
});
router.delete('/:id', protect, admin, async (req, res) => {
  await FAQ.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'FAQ deleted' });
});

module.exports = router;
