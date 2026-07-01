const mongoose = require('mongoose');

// FAQ Model
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'General' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// Testimonial Model
const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: String,
  company: String,
  avatar: String,
  rating: { type: Number, min: 1, max: 5, default: 5 },
  content: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// Settings Model
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  group: { type: String, default: 'general' },
  label: String,
  type: { type: String, enum: ['text', 'number', 'boolean', 'json', 'image', 'color'], default: 'text' },
}, { timestamps: true });

// Menu Model
// 3-level navigation tree: top-level nav item -> category -> subcategory.
// Fully editable from the admin Menu Builder (label, link, badge, image,
// layout, ordering and active/inactive state at every level).
const menuSubItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  url: { type: String, default: '#' },
  target: { type: String, default: '_self' },
  badge: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const menuChildSchema = new mongoose.Schema({
  label: { type: String, required: true },
  url: { type: String, default: '#' },
  target: { type: String, default: '_self' },
  badge: { type: String, default: '' },
  image: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  children: [menuSubItemSchema],
});

const menuItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  url: { type: String, default: '#' },
  target: { type: String, default: '_self' },
  icon: String,
  badge: { type: String, default: '' },
  // 'link'  -> plain link, no dropdown
  // 'simple'-> single-column dropdown list
  // 'mega'  -> full multi-column mega menu with sub-categories
  layout: { type: String, enum: ['link', 'simple', 'mega'], default: 'link' },
  promo: {
    image: { type: String, default: '' },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    url: { type: String, default: '' },
  },
  children: [menuChildSchema],
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, enum: ['header', 'footer', 'mega', 'mobile'], required: true, unique: true },
  items: [menuItemSchema],
}, { timestamps: true });

// Media Model
const mediaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  originalName: String,
  url: { type: String, required: true },
  publicId: String,
  type: { type: String, enum: ['image', 'video', 'document'], default: 'image' },
  mimeType: String,
  size: Number,
  width: Number,
  height: Number,
  folder: { type: String, default: 'general' },
  alt: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Homepage Sections Model
const homepageSectionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  isEnabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = {
  FAQ: mongoose.model('FAQ', faqSchema),
  Testimonial: mongoose.model('Testimonial', testimonialSchema),
  Settings: mongoose.model('Settings', settingsSchema),
  Menu: mongoose.model('Menu', menuSchema),
  Media: mongoose.model('Media', mediaSchema),
  HomepageSection: mongoose.model('HomepageSection', homepageSectionSchema),
};