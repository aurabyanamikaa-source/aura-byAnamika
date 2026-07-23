const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/paymentController');

// NOTE: the webhook route is mounted directly in index.js (before the global
// express.json() parser) because Razorpay's webhook signature must be
// verified against the raw request body, not the parsed JSON.

router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

module.exports = router;