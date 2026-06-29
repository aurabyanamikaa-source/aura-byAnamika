const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const Product = require('../models/Product');

// Cart is managed client-side (Redux) and validated server-side on checkout.
// This endpoint validates cart items and returns fresh pricing.
router.post('/validate', optionalAuth, async (req, res) => {
  const { items } = req.body;
  if (!items || !items.length) {
    return res.json({ success: true, data: [], warnings: [] });
  }

  const warnings = [];
  const validatedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product).populate('category', 'name slug').lean();
    if (!product || !product.isActive) {
      warnings.push({ product: item.product, message: `"${item.name || 'Product'}" is no longer available` });
      continue;
    }

    let stockAvailable = product.stock;
    if (product.hasVariants && item.size && item.color) {
      const variant = product.variants.find(v => v.size === item.size && v.color === item.color);
      if (variant) stockAvailable = variant.stock;
    }

    if (product.trackInventory && stockAvailable < item.quantity) {
      if (stockAvailable === 0) {
        warnings.push({ product: item.product, message: `"${product.name}" is out of stock` });
        continue;
      }
      warnings.push({ product: item.product, message: `Only ${stockAvailable} units available for "${product.name}"` });
    }

    const price = product.salePrice || product.price;
    validatedItems.push({
      product: product._id,
      name: product.name,
      thumbnail: product.thumbnail,
      slug: product.slug,
      price,
      originalPrice: product.price,
      quantity: Math.min(item.quantity, stockAvailable || item.quantity),
      size: item.size,
      color: item.color,
      sku: product.sku,
      stock: stockAvailable,
    });
  }

  res.json({ success: true, data: validatedItems, warnings });
});

// Apply coupon
router.post('/apply-coupon', optionalAuth, async (req, res) => {
  const { code, subtotal, userId } = req.body;
  const Coupon = require('../models/Coupon');
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Coupon not found' });
  }
  const validity = coupon.isValid(subtotal, userId);
  if (!validity.valid) {
    return res.status(400).json({ success: false, message: validity.message });
  }
  const discount = coupon.calculateDiscount(subtotal);
  res.json({
    success: true,
    data: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      description: coupon.description,
    },
  });
});

module.exports = router;
