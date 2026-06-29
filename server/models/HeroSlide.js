const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  subHeading: String,
  description: String,
  buttonText: String,
  buttonLink: String,
  secondaryButtonText: String,
  secondaryButtonLink: String,
  image: { type: String, required: true },
  imagePublicId: String,
  thumbImage: String,
  badge: String,
  badgeColor: String,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
