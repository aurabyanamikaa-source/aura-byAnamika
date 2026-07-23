const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Stock is decremented when the order is created (before payment). If the
// payment never completes, put that stock back so it isn't lost forever.
const restockOrderItems = async (order) => {
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
  }
};

// @desc   Create a Razorpay order for an existing DB order
// @route  POST /api/payments/razorpay/create-order
// @access Private (must be logged in)
const createRazorpayOrder = async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ success: false, message: 'orderId is required' });
  }

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  if (!order.user || order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized for this order' });
  }

  if (order.paymentStatus === 'paid') {
    return res.status(400).json({ success: false, message: 'Order is already paid' });
  }

  // Razorpay wants the amount in the smallest currency unit (paise for INR)
  const amountInPaise = Math.round(order.total * 100);

  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: order.orderNumber,
    notes: {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      userId: req.user._id.toString(),
    },
  });

  order.razorpayOrderId = razorpayOrder.id;
  order.paymentMethod = 'razorpay';
  await order.save();

  res.json({
    success: true,
    data: {
      key: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      razorpayOrderId: razorpayOrder.id,
      orderId: order._id,
      orderNumber: order.orderNumber,
      name: 'Aura by Anamika',
      prefill: {
        name: `${req.user.firstName} ${req.user.lastName}`.trim(),
        email: req.user.email,
        contact: req.user.phone || '',
      },
    },
  });
};

// @desc   Verify Razorpay payment signature after checkout completes on the client
// @route  POST /api/payments/razorpay/verify
// @access Private
const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
  }

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  if (!order.user || order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized for this order' });
  }

  if (order.razorpayOrderId !== razorpay_order_id) {
    return res.status(400).json({ success: false, message: 'Order mismatch' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) {
    if (order.paymentStatus !== 'failed') {
      order.paymentStatus = 'failed';
      order.statusHistory.push({ status: 'pending', note: 'Payment signature verification failed' });
      await order.save();
      await restockOrderItems(order);
    }
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  // Idempotent: only apply side effects once
  if (order.paymentStatus !== 'paid') {
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paidAt = new Date();
    order.statusHistory.push({ status: 'confirmed', note: 'Payment received via Razorpay' });
    await order.save();
  }

  res.json({ success: true, data: order });
};

// @desc   Razorpay webhook — server-to-server safety net in case the client
//         never calls /verify (browser closed, network drop, etc.)
// @route  POST /api/payments/razorpay/webhook
// @access Public (verified via signature header)
const razorpayWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('RAZORPAY_WEBHOOK_SECRET not set — ignoring webhook');
    return res.status(200).json({ received: true });
  }

  const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
  if (expected !== signature) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  const event = JSON.parse(req.body.toString());
  const payment = event.payload?.payment?.entity;

  if (!payment) return res.status(200).json({ received: true });

  const order = await Order.findOne({ razorpayOrderId: payment.order_id });
  if (!order) return res.status(200).json({ received: true });

  if (event.event === 'payment.captured' && order.paymentStatus !== 'paid') {
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.razorpayPaymentId = payment.id;
    order.paidAt = new Date();
    order.statusHistory.push({ status: 'confirmed', note: 'Payment confirmed via Razorpay webhook' });
    await order.save();
  } else if (event.event === 'payment.failed' && order.paymentStatus !== 'paid' && order.paymentStatus !== 'failed') {
    order.paymentStatus = 'failed';
    order.statusHistory.push({ status: 'pending', note: 'Payment failed (Razorpay webhook)' });
    await order.save();
    await restockOrderItems(order);
  }

  res.status(200).json({ received: true });
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook };