const mongoose = require('mongoose');
const slugify = require('slugify');

const variantSchema = new mongoose.Schema({
  size: String,
  color: String,
  colorHex: String,
  sku: String,
  price: Number,
  salePrice: Number,
  stock: { type: Number, default: 0 },
  image: String,
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: [true, 'Product description is required'] },
  shortDescription: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: [String],

  // Pricing
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  salePrice: { type: Number, default: null },
  discountPercent: { type: Number, default: 0 },

  // Images
  images: [{ url: String, publicId: String, alt: String }],
  thumbnail: { type: String, default: '' },

  // Inventory
  sku: { type: String, unique: true, sparse: true },
  stock: { type: Number, default: 0 },
  trackInventory: { type: Boolean, default: true },
  allowBackorder: { type: Boolean, default: false },

  // Variants
  hasVariants: { type: Boolean, default: false },
  variants: [variantSchema],
  sizes: [String],
  colors: [{ name: String, hex: String }],

  // Status
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isOnSale: { type: Boolean, default: false },

  // Ratings
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },

  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
  },

  // Shipping
  weight: Number,
  dimensions: { length: Number, width: Number, height: Number },

  soldCount: { type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true } });

productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  if (this.price && this.salePrice) {
    this.discountPercent = Math.round(((this.price - this.salePrice) / this.price) * 100);
    this.isOnSale = this.salePrice < this.price;
  }
  next();
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });

module.exports = mongoose.model('Product', productSchema);
