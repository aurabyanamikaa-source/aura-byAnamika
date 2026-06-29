const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Blog = require('../models/Blog');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const filter = { isPublished: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.tag) filter.tags = req.query.tag;
  const [posts, total] = await Promise.all([
    Blog.find(filter).populate('author', 'firstName lastName avatar').sort({ publishedAt: -1 }).skip((page-1)*limit).limit(limit).lean(),
    Blog.countDocuments(filter),
  ]);
  res.json({ success: true, data: posts, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
});

router.get('/admin/all', protect, admin, async (req, res) => {
  const posts = await Blog.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: posts });
});

router.get('/:slug', async (req, res) => {
  const query = req.params.slug.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.slug } : { slug: req.params.slug };
  const post = await Blog.findOne(query).populate('author', 'firstName lastName avatar');
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  if (!post.isPublished && !req.user?.role?.includes('admin')) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }
  // Increment views
  await Blog.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
  res.json({ success: true, data: post });
});

router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  let image = req.body.image || '';
  let imagePublicId = '';
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'blog');
    image = result.secure_url;
    imagePublicId = result.public_id;
  }
  const post = await Blog.create({ ...req.body, image, imagePublicId, author: req.user._id, authorName: `${req.user.firstName} ${req.user.lastName}` });
  res.status(201).json({ success: true, data: post });
});

router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  const post = await Blog.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  if (req.file) {
    if (post.imagePublicId) await deleteFromCloudinary(post.imagePublicId);
    const result = await uploadToCloudinary(req.file.buffer, 'blog');
    req.body.image = result.secure_url;
    req.body.imagePublicId = result.public_id;
  }
  const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: updated });
});

router.delete('/:id', protect, admin, async (req, res) => {
  const post = await Blog.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  if (post.imagePublicId) await deleteFromCloudinary(post.imagePublicId);
  await post.deleteOne();
  res.json({ success: true, message: 'Post deleted' });
});

module.exports = router;
