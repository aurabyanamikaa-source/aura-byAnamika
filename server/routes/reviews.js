const express = require('express');
const router = express.Router();
const { protect, optionalAuth, admin } = require('../middleware/auth');
const Review = require('../models/Review');

// GET reviews for a product
router.get('/product/:productId', async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true })
    .sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: reviews });
});

// POST create review
router.post('/', protect, async (req, res) => {
  const { product, rating, title, comment } = req.body;
  const existing = await Review.findOne({ product, user: req.user._id });
  if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
  const review = await Review.create({
    product,
    user: req.user._id,
    name: req.user.fullName || `${req.user.firstName} ${req.user.lastName}`,
    email: req.user.email,
    rating, title, comment,
    isApproved: false, // requires admin approval
  });
  res.status(201).json({ success: true, data: review });
});

// Admin: Get all reviews
router.get('/admin/all', protect, admin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const filter = {};
  if (req.query.approved === 'true') filter.isApproved = true;
  if (req.query.approved === 'false') filter.isApproved = false;
  const [reviews, total] = await Promise.all([
    Review.find(filter).populate('product', 'name thumbnail').sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).lean(),
    Review.countDocuments(filter),
  ]);
  res.json({ success: true, data: reviews, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
});

// Admin: Approve/reject review
router.put('/:id', protect, admin, async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  await Review.calcAverageRatings(review.product);
  res.json({ success: true, data: review });
});

// Admin: Delete review
router.delete('/:id', protect, admin, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  await review.deleteOne();
  await Review.calcAverageRatings(review.product);
  res.json({ success: true, message: 'Review deleted' });
});

module.exports = router;
