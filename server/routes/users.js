const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User');

// GET all users (admin)
router.get('/', protect, admin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const [users, total] = await Promise.all([
    User.find(filter).select('-password -refreshToken -resetPasswordToken').sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
});

// GET user by id (admin)
router.get('/:id', protect, admin, async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
});

// UPDATE user (admin)
router.put('/:id', protect, admin, async (req, res) => {
  const { role, isActive, firstName, lastName, phone } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role, isActive, firstName, lastName, phone }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
});

// GET user stats (admin)
router.get('/admin/stats', protect, admin, async (req, res) => {
  const stats = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);
  const total = await User.countDocuments();
  const thisMonth = await User.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } });
  res.json({ success: true, data: { breakdown: stats, total, thisMonth } });
});

module.exports = router;
