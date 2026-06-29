const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { Menu } = require('../models/index');

const DEFAULT_MENUS = {
  header: { name: 'Header Menu', location: 'header', items: [
    { label: 'Home', url: '/', order: 0, isActive: true },
    { label: 'Shop', url: '/shop', order: 1, isActive: true, children: [
      { label: 'All Products', url: '/shop', children: [] },
      { label: 'New Arrivals', url: '/shop?newArrival=true', children: [] },
      { label: 'Best Sellers', url: '/shop?bestSeller=true', children: [] },
      { label: 'Sale', url: '/shop?onSale=true', children: [] },
    ]},
    { label: 'Blog', url: '/blog', order: 2, isActive: true },
    { label: 'About', url: '/about', order: 3, isActive: true },
    { label: 'Contact', url: '/contact', order: 4, isActive: true },
    { label: 'FAQ', url: '/faq', order: 5, isActive: true },
  ]},
  footer: { name: 'Footer Menu', location: 'footer', items: [
    { label: 'Quick Ship', url: '#', order: 0, isActive: true },
    { label: 'New Designs', url: '#', order: 1, isActive: true },
    { label: 'Protection Plan', url: '#', order: 2, isActive: true },
    { label: 'Gift Cards', url: '#', order: 3, isActive: true },
    { label: 'Privacy Policy', url: '#', order: 4, isActive: true },
    { label: 'About Us', url: '/about', order: 5, isActive: true },
    { label: 'Careers', url: '#', order: 6, isActive: true },
    { label: 'Contact Us', url: '/contact', order: 7, isActive: true },
    { label: 'Reviews', url: '/reviews', order: 8, isActive: true },
    { label: 'Terms of Service', url: '#', order: 9, isActive: true },
    { label: 'Refund Policy', url: '#', order: 10, isActive: true },
  ]},
};

router.get('/:location', async (req, res) => {
  let menu = await Menu.findOne({ location: req.params.location }).lean();
  if (!menu && DEFAULT_MENUS[req.params.location]) {
    menu = await Menu.create(DEFAULT_MENUS[req.params.location]);
  }
  res.json({ success: true, data: menu });
});

router.get('/', protect, admin, async (req, res) => {
  const menus = await Menu.find().lean();
  res.json({ success: true, data: menus });
});

router.put('/:location', protect, admin, async (req, res) => {
  const menu = await Menu.findOneAndUpdate(
    { location: req.params.location },
    req.body,
    { new: true, upsert: true }
  );
  res.json({ success: true, data: menu });
});

module.exports = router;
