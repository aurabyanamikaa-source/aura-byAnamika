const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// @desc   Register user
// @route  POST /api/auth/register
const register = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  const user = await User.create({ firstName, lastName, email, password, phone });
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  await User.findByIdAndUpdate(user._id, { refreshToken });
  res.status(201).json({
    success: true,
    data: { _id: user._id, firstName, lastName, email, role: user.role },
    token,
    refreshToken,
  });
};

// @desc   Login user
// @route  POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account is deactivated' });
  }
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  res.json({
    success: true,
    data: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, avatar: user.avatar },
    token,
    refreshToken,
  });
};

// @desc   Refresh token
// @route  POST /api/auth/refresh
const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    const newToken = generateToken(user._id);
    res.json({ success: true, token: newToken });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// @desc   Get current user
// @route  GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name thumbnail price salePrice slug');
  res.json({ success: true, data: user });
};

// @desc   Logout
// @route  POST /api/auth/logout
const logout = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc   Update profile
// @route  PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const { firstName, lastName, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { firstName, lastName, phone, avatar },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: user });
};

// @desc   Change password
// @route  PUT /api/auth/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
};

// @desc   Add address
// @route  POST /api/auth/addresses
const addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach(addr => (addr.isDefault = false));
  }
  user.addresses.push(req.body);
  await user.save();
  res.json({ success: true, data: user.addresses });
};

// @desc   Update address
// @route  PUT /api/auth/addresses/:addressId
const updateAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
  if (req.body.isDefault) {
    user.addresses.forEach(addr => (addr.isDefault = false));
  }
  Object.assign(address, req.body);
  await user.save();
  res.json({ success: true, data: user.addresses });
};

// @desc   Delete address
// @route  DELETE /api/auth/addresses/:addressId
const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, data: user.addresses });
};

module.exports = { register, login, refreshToken, getMe, logout, updateProfile, changePassword, addAddress, updateAddress, deleteAddress };
