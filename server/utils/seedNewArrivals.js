// Adds ONLY the 11 new products below. Never deletes or touches existing data.
// Run: node utils/seedNewArrivals.js
// Categories use {label, group} exactly like the admin "Add Product" checkbox
// picker (pulled from Navigation Menu), NOT the old flat Category model.
// Images are left empty on purpose — upload them manually in the admin
// product editor after this runs (Images tab).

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/glamics';

const products = [
  {
    name: 'Indigo Tribal Print Lace-Up Back Top',
    shortDescription: 'Sleeveless indigo top with a crisscross lace-up back.',
    description: 'Sleeveless cotton top in an indigo tribal print, finished with a criss-cross lace-up back detail.',
    categories: [{ label: 'Tops', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['indigo', 'tribal print', 'lace-up back', 'sleeveless'],
    price: 1499, sku: 'AURA-TOP-001', stock: 20, weight: 0.25,
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Indigo Blue', hex: '#1F3A63' }],
    isActive: true, isNewArrival: true,
  },
  {
    name: 'Maroon Paisley Print Straight Kurta',
    shortDescription: 'Maroon straight kurta with an off-white paisley print.',
    description: 'Straight-fit cotton kurta in maroon with an all-over off-white paisley print and a contrast placket.',
    categories: [{ label: 'Printed Kurtis', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['maroon', 'paisley', 'kurta', 'printed'],
    price: 1799, sku: 'AURA-KUR-002', stock: 25, weight: 0.3,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: [{ name: 'Maroon', hex: '#6B1E23' }],
    isActive: true, isNewArrival: true,
  },
  {
    name: 'Sky Blue Floral Crop Top & Maxi Skirt Co-ord',
    shortDescription: 'Sky blue floral co-ord: sleeveless crop top with flared maxi skirt.',
    description: 'Two-piece co-ord set in a sky blue floral print — sleeveless crop top paired with a flowy flared maxi skirt.',
    categories: [{ label: 'Co-ord Sets', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['co-ord set', 'floral', 'maxi skirt', 'sleeveless'],
    price: 2499, sku: 'AURA-CRD-003', stock: 15, weight: 0.4,
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Sky Blue', hex: '#3B8FCC' }],
    isActive: true, isNewArrival: true, isFeatured: true,
  },
  {
    name: 'Beige Block Print Long Kurta',
    shortDescription: 'Beige long kurta with a maroon-bordered floral block print.',
    description: 'Ankle-grazing straight kurta in beige with a hand-block floral motif and a contrast maroon-black border neckline.',
    categories: [{ label: 'Long Kurtis', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['beige', 'block print', 'long kurta'],
    price: 1699, sku: 'AURA-KUR-004', stock: 22, weight: 0.35,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: [{ name: 'Beige', hex: '#C9B79C' }],
    isActive: true, isNewArrival: true,
  },
  {
    name: 'Grey Plaid Designer Kurta with Contrast Yoke',
    shortDescription: 'Grey plaid kurta with an ivory contrast back yoke and cuffs.',
    description: 'Handwoven grey plaid kurta styled with an ivory contrast yoke, embroidered panel and button cuffs.',
    categories: [{ label: 'Designer Kurtis', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['plaid', 'designer kurta', 'contrast yoke'],
    price: 2199, sku: 'AURA-KUR-005', stock: 12, weight: 0.35,
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Grey Plaid', hex: '#6E6E6E' }],
    isActive: true, isNewArrival: true, isFeatured: true,
  },
  {
    name: 'Indigo Stripe Colour-Block Shirt Kurta',
    shortDescription: 'Indigo striped shirt-style kurta with an ivory colour-block panel.',
    description: 'Collared shirt-style kurta mixing indigo stripe weaves with an ivory colour-block front panel and coconut buttons.',
    categories: [{ label: 'Shirts', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['stripes', 'colour block', 'shirt kurta'],
    price: 1899, sku: 'AURA-TOP-006', stock: 18, weight: 0.3,
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Indigo Stripe', hex: '#2C4A6E' }],
    isActive: true, isNewArrival: true,
  },
  {
    name: 'Ivory Paisley Print Kurta',
    shortDescription: 'Ivory kurta with a black-maroon paisley border print.',
    description: 'Straight kurta in ivory featuring a dense black paisley print with maroon floral border trims.',
    categories: [{ label: 'Printed Kurtis', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['ivory', 'paisley', 'printed kurta'],
    price: 1799, sku: 'AURA-KUR-007', stock: 20, weight: 0.3,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: [{ name: 'Ivory', hex: '#F1EAE0' }],
    isActive: true, isNewArrival: true,
  },
  {
    name: 'Mustard Mirror-Work Embroidered Kurta',
    shortDescription: 'Mustard kurta with a mirror-embellished V-neck yoke.',
    description: 'Festive mustard kurta with a block-printed motif and a mirror-work embroidered V-neck yoke.',
    categories: [{ label: 'Embroidered Kurtis', group: 'Women' }, { label: 'Festive Wear', group: 'Shop by Occasion' }],
    tags: ['mustard', 'mirror work', 'festive'],
    price: 2299, sku: 'AURA-KUR-008', stock: 15, weight: 0.32,
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Mustard', hex: '#D9A02A' }],
    isActive: true, isNewArrival: true, isFeatured: true,
  },
  {
    name: 'Yellow Floral Print Kurta with Lace Trim',
    shortDescription: 'White-yellow floral kurta with a crochet lace placket.',
    description: 'Lightweight cotton kurta in an ivory base with a yellow floral print and crochet lace trim at the neckline.',
    categories: [{ label: 'Printed Kurtis', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['floral', 'yellow', 'lace trim'],
    price: 1599, sku: 'AURA-KUR-009', stock: 20, weight: 0.28,
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Ivory Yellow', hex: '#E8C84A' }],
    isActive: true, isNewArrival: true,
  },
  {
    name: 'Indigo Floral Print Kaftan',
    shortDescription: 'Relaxed indigo floral kaftan with crochet lace panels.',
    description: 'Relaxed-fit kaftan in an indigo floral print with crochet lace inserts along the yoke and sleeves.',
    categories: [{ label: 'Kaftans', group: 'Women' }, { label: 'New Arrivals', group: 'New Arrivals' }],
    tags: ['kaftan', 'indigo', 'floral'],
    price: 1899, sku: 'AURA-KAF-010', stock: 14, weight: 0.3,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: [{ name: 'Indigo', hex: '#2E4A73' }],
    isActive: true, isNewArrival: true,
  },
  {
    name: 'Yellow Bandhani Print Kurta',
    shortDescription: 'Sunny yellow kurta with a traditional bandhani print.',
    description: 'Cotton kurta in a sunny yellow bandhani print with a crochet lace placket and round neckline.',
    categories: [{ label: 'Printed Kurtis', group: 'Women' }, { label: 'Festive Wear', group: 'Shop by Occasion' }],
    tags: ['bandhani', 'yellow', 'printed kurta'],
    price: 1699, sku: 'AURA-KUR-011', stock: 20, weight: 0.3,
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Yellow', hex: '#F0B429' }],
    isActive: true, isNewArrival: true,
  },
];

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  let created = 0, skipped = 0;
  for (const p of products) {
    const exists = await Product.findOne({ sku: p.sku });
    if (exists) {
      console.log(`⏭️  Skipped (already exists): ${p.name} [${p.sku}]`);
      skipped++;
      continue;
    }
    await Product.create(p);
    console.log(`🆕 Created: ${p.name} [${p.sku}]`);
    created++;
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped. No existing data was touched.`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});