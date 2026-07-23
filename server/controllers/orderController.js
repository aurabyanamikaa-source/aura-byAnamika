const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const { Settings } = require('../models/index');

// Reads the live commerce settings (tax rate, free shipping threshold, shipping cost)
// instead of relying on hardcoded USD-era defaults.
const getCommerceSettings = async () => {
  const rows = await Settings.find({ key: { $in: ['tax_rate', 'free_shipping_threshold', 'shipping_cost'] } }).lean();
  const map = {};
  rows.forEach(r => (map[r.key] = r.value));
  return {
    taxRate: Number(map.tax_rate ?? 8),
    freeShippingThreshold: Number(map.free_shipping_threshold ?? 100),
    shippingCost: Number(map.shipping_cost ?? 9.99),
  };
};

// @desc   Create order
// @route  POST /api/orders
const createOrder = async (req, res) => {
  const { items, shippingAddress, billingAddress, paymentMethod, couponCode, customerNote } = req.body;

  // Validate items and calculate total
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      return res.status(400).json({ success: false, message: `Product ${item.product} not available` });
    }
    if (product.trackInventory && product.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
    }
    const price = product.salePrice || product.price;
    subtotal += price * item.quantity;
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.thumbnail,
      price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      sku: product.sku,
    });
  }

  let discount = 0;
  let couponId = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const validity = coupon.isValid(subtotal, req.user._id);
      if (validity.valid) {
        discount = coupon.calculateDiscount(subtotal);
        couponId = coupon._id;
        // Mark coupon used
        coupon.usedCount += 1;
        coupon.usedBy.push(req.user._id);
        await coupon.save();
      }
    }
  }

  const { taxRate, freeShippingThreshold, shippingCost: baseShippingCost } = await getCommerceSettings();
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : baseShippingCost;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + shippingCost + tax - discount;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    paymentMethod,
    subtotal: Math.round(subtotal * 100) / 100,
    shippingCost: Math.round(shippingCost * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
    coupon: couponId,
    couponCode: couponCode?.toUpperCase(),
    customerNote,
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  });

  // Update product stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  const populated = await Order.findById(order._id).populate('items.product', 'name thumbnail');
  res.status(201).json({ success: true, data: populated });
};

// @desc   Get user orders
// @route  GET /api/orders
const getMyOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments({ user: req.user._id }),
  ]);
  res.json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

// @desc   Get single order
// @route  GET /api/orders/:id
const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product', 'name thumbnail');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (req.user.role === 'customer' && order.user?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, data: order });
};

// --- ADMIN ---

// @desc   Get all orders (admin)
// @route  GET /api/orders/admin/all
const getAllOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.$or = [
    { orderNumber: { $regex: req.query.search, $options: 'i' } },
    { 'shippingAddress.firstName': { $regex: req.query.search, $options: 'i' } },
  ];

  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

// @desc   Update order status (admin)
// @route  PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  const { status, note, trackingNumber, trackingUrl } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  order.status = status;
  order.statusHistory.push({ status, note, updatedBy: req.user._id });
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingUrl) order.trackingUrl = trackingUrl;
  if (status === 'shipped') order.shippedAt = new Date();
  if (status === 'delivered') order.deliveredAt = new Date();
  await order.save();
  res.json({ success: true, data: order });
};

// @desc   Get order stats (admin)
// @route  GET /api/orders/admin/stats
const getOrderStats = async (req, res) => {
  const [stats, revenueByDay] = await Promise.all([
    Order.aggregate([
      { $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        processingOrders: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
      }},
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);
  res.json({ success: true, data: { ...(stats[0] || {}), revenueByDay } });
};

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getOrderStats };