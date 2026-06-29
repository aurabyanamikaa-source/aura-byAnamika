const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// GET wishlist
router.get('/', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name thumbnail price salePrice slug ratings numReviews isActive').lean();
  res.json({ success: true, data: user.wishlist || [] });
});

// POST toggle wishlist item
router.post('/toggle', protect, async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.indexOf(productId);
  let added;
  if (idx === -1) {
    user.wishlist.push(productId);
    added = true;
  } else {
    user.wishlist.splice(idx, 1);
    added = false;
  }
  await user.save();
  res.json({ success: true, data: { added, wishlist: user.wishlist } });
});

// DELETE remove from wishlist
router.delete('/:productId', protect, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: req.params.productId } });
  res.json({ success: true, message: 'Removed from wishlist' });
});

module.exports = router;
