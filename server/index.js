require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const couponRoutes = require('./routes/coupons');
const bannerRoutes = require('./routes/banners');
const heroRoutes = require('./routes/hero');
const blogRoutes = require('./routes/blog');
const faqRoutes = require('./routes/faq');
const testimonialRoutes = require('./routes/testimonials');
const customerDiaryRoutes = require('./routes/customerDiaries');
const settingsRoutes = require('./routes/settings');
const menuRoutes = require('./routes/menus');
const mediaRoutes = require('./routes/media');
const homepageRoutes = require('./routes/homepage');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const uploadRoutes = require('./routes/upload');
const paymentRoutes = require('./routes/payments');
const { razorpayWebhook } = require('./controllers/paymentController');

const errorHandler = require('./middleware/error');

const app = express();

// Connect to DB
connectDB();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', process.env.ADMIN_URL || 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Razorpay webhook needs the RAW request body to verify its signature, so it
// must be registered before the global express.json() parser below.
app.post('/api/payments/razorpay/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/customer-diaries', customerDiaryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV, timestamp: new Date() });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;