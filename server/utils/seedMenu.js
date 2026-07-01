/**
 * Standalone seed script for the storefront navigation menu (mega menu).
 * Inserts/overwrites the "header" Menu document with the full
 * Home / New Arrivals / Women / Shop by Occasion / Collections /
 * Ready to Ship / Accessories / Sale / Custom Services / About / Contact
 * structure exactly as supplied, including all categories and
 * sub-categories, so the navbar + admin Menu Builder have real data
 * to start from.
 *
 * Run with:   npm run seed:menu   (from /server)
 * or:         node utils/seedMenu.js
 */
const path = require('path');
// Resolve .env relative to THIS file's location (server/.env), not the
// current working directory -- avoids silently connecting to the wrong
// database when the script is run from a different folder.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { Menu } = require('../models/index');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/glamics';

// Helper to quickly build a leaf sub-category
const sub = (label, url) => ({ label, url: url || `/shop?search=${encodeURIComponent(label)}`, isActive: true });

// Helper to build a category (level 2) with optional sub-categories (level 3)
const cat = (label, subs = [], extra = {}) => ({
  label,
  url: subs.length ? '#' : `/shop?search=${encodeURIComponent(label)}`,
  isActive: true,
  children: subs.map(s => (typeof s === 'string' ? sub(s) : sub(s.label, s.url))),
  ...extra,
});

const headerItems = [
  { label: 'Home', url: '/', order: 0, isActive: true, layout: 'link' },

  {
    label: 'New Arrivals', url: '/shop?newArrival=true', order: 1, isActive: true, layout: 'simple',
    children: [
      cat('Just In', [], { url: '/shop?newArrival=true&sort=newest' }),
      cat('Trending Now', [], { url: '/shop?search=trending' }),
      cat('Best Sellers', [], { url: '/shop?bestSeller=true' }),
    ],
  },

  {
    label: 'Women', url: '/shop', order: 2, isActive: true, layout: 'mega',
    promo: { image: '', title: 'Bridal Edit', subtitle: 'Curated lehengas for your big day', url: '/shop?search=Bridal Lehengas' },
    children: [
      cat('Lehengas', ['Bridal Lehengas', 'Bridesmaid Lehengas', 'Designer Lehengas', 'Festive Lehengas', 'Reception Lehengas']),
      cat('Sarees', ['Banarasi Sarees', 'Chanderi Sarees', 'Silk Sarees', 'Organza Sarees', 'Tissue Sarees', 'Designer Sarees', 'Printed Sarees', 'Everyday Sarees']),
      cat('Suit Sets', ['Kurta Sets', 'Anarkali Sets', 'Sharara Sets', 'Gharara Sets', 'Palazzo Sets', 'Straight Suit Sets']),
      cat('Indo-Western', ['Indo-Western Gowns', 'Draped Dresses', 'Jacket Sets', 'Fusion Wear', 'Salwar Suits']),
      cat('Kurtas & Kurtis', ['Designer Kurtis', 'Short Kurtis', 'Long Kurtis', 'Printed Kurtis', 'Embroidered Kurtis']),
      cat('Dresses & Gowns', ['Evening Gowns', 'Party Dresses', 'Maxi Dresses']),
      cat('Co-ord Sets', []),
      cat('Kaftans', []),
      cat('Tops & Tunics', ['Tops', 'Tunics', 'Shirts']),
      cat('Bottom Wear', ['Pants', 'Palazzo', 'Skirts', 'Sharara', 'Cigarette Pants']),
      cat('Dupattas', ['Wedding Collection', 'Banarasi Dupattas', 'Organza Dupattas', 'Chanderi Dupattas', 'Embroidered Dupattas']),
      cat('Jackets', ['Ethnic Jackets', 'Cape Jackets']),
    ],
  },

  {
    label: 'Shop by Occasion', url: '#', order: 3, isActive: true, layout: 'mega',
    children: [
      cat('Bridal Collection', []), cat('Wedding Guest', []), cat('Engagement', []),
      cat('Reception', []), cat('Haldi', []), cat('Mehendi', []), cat('Sangeet', []),
      cat('Cocktail Party', []), cat('Festive Wear', []), cat('Pooja Collection', []),
      cat('Summer Brunch', []), cat('Office Wear', []), cat('Vacation Edit', []),
    ],
  },

  {
    label: 'Collections', url: '#', order: 4, isActive: true, layout: 'simple',
    children: [
      cat('Wedding Collection', []), cat('Festive Collection', []), cat('Heritage Collection', []),
      cat('Summer Collection', []), cat('Luxury Collection', []), cat('Designer Edit', []),
    ],
  },

  {
    label: 'Ready to Ship', url: '#', order: 5, isActive: true, layout: 'simple',
    children: [cat('48 Hours Dispatch', []), cat('Ready to Wear', [])],
  },

  {
    label: 'Accessories', url: '#', order: 6, isActive: true, layout: 'simple',
    children: [cat('Dupattas', []), cat('Potli Bags', []), cat('Belts', []), cat('Jewellery', [])],
  },

  {
    label: 'Sale', url: '/shop?onSale=true', order: 7, isActive: true, layout: 'simple', badge: 'Sale',
    children: [
      cat('Up to 30% Off', [], { url: '/shop?onSale=true&search=30' }),
      cat('Up to 50% Off', [], { url: '/shop?onSale=true&search=50' }),
      cat('Clearance', [], { url: '/shop?onSale=true&search=clearance' }),
    ],
  },

  {
    label: 'Custom Services', url: '#', order: 8, isActive: true, layout: 'simple',
    children: [cat('Custom Stitching', []), cat('Size Guide', [], { url: '/faq' }), cat('Bridal Consultation', []), cat('Personal Styling', [])],
  },

  { label: 'About Us', url: '/about', order: 9, isActive: true, layout: 'link' },
  { label: 'Contact', url: '/contact', order: 10, isActive: true, layout: 'link' },
];

const footerItems = [
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
];

const seedMenus = async () => {
  console.log('🔌 Connecting using MONGO_URI:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Delete + recreate (instead of a partial $set upsert) so any stale
  // document with an old/incompatible shape is fully wiped out, not merged.
  await Menu.deleteOne({ location: 'header' });
  await Menu.create({ name: 'Header Menu', location: 'header', items: headerItems });
  console.log('🧭 Header mega menu seeded (Home → Contact, full categories & sub-categories)');

  await Menu.deleteOne({ location: 'footer' });
  await Menu.create({ name: 'Footer Menu', location: 'footer', items: footerItems });
  console.log('🦶 Footer menu seeded');

  console.log('\n✅ Menu seeding complete! Visit /menus in the admin panel to edit it further.');
  process.exit(0);
};

seedMenus().catch(err => { console.error('❌ Menu seed failed:', err); process.exit(1); });