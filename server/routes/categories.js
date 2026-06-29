const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Category = require('../models/Category');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

// GET all categories
router.get('/', async (req, res) => {
  const filter = { isActive: true };
  if (req.query.featured === 'true') filter.isFeatured = true;
  if (req.query.parent === 'null') filter.parent = null;
  const categories = await Category.find(filter)
    .populate('parent', 'name slug')
    .sort({ order: 1, name: 1 }).lean();
  res.json({ success: true, data: categories });
});

// GET single category
router.get('/:slug', async (req, res) => {
  const query = req.params.slug.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.slug } : { slug: req.params.slug };
  const category = await Category.findOne(query).populate('parent', 'name slug');
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: category });
});

// Admin: Create category
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  let image = '';
  let imagePublicId = '';
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'categories');
    image = result.secure_url;
    imagePublicId = result.public_id;
  }
  const category = await Category.create({ ...req.body, image, imagePublicId });
  res.status(201).json({ success: true, data: category });
});

// Admin: Update category
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  if (req.file) {
    if (category.imagePublicId) await deleteFromCloudinary(category.imagePublicId);
    const result = await uploadToCloudinary(req.file.buffer, 'categories');
    req.body.image = result.secure_url;
    req.body.imagePublicId = result.public_id;
  }
  const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: updated });
});

// Admin: Delete category
router.delete('/:id', protect, admin, async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  if (category.imagePublicId) await deleteFromCloudinary(category.imagePublicId);
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = router;
