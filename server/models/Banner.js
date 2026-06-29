const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  description: String,
  buttonText: String,
  buttonLink: String,
  image: { type: String, required: true },
  imagePublicId: String,
  mobileImage: String,
  type: {
    type: String,
    enum: ['hero', 'promotional', 'sale', 'collection', 'sub', 'ad'],
    required: true,
  },
  position: String,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
  bgColor: String,
  textColor: String,
  badge: String,
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
