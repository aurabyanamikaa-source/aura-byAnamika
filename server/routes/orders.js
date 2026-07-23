const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getOrderStats } = require('../controllers/orderController');

// Login is required to place an order (payment is tied to the logged-in user)
router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/admin/all', protect, admin, getAllOrders);
router.get('/admin/stats', protect, admin, getOrderStats);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;