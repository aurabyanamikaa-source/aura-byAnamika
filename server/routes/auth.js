const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register, login, refreshToken, getMe, logout,
  updateProfile, changePassword, addAddress, updateAddress, deleteAddress
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

module.exports = router;
