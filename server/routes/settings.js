const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { getSettings, getPublicSettings, updateSettings } = require('../controllers/settingsController');

router.get('/public', getPublicSettings);
router.get('/', protect, admin, getSettings);
router.put('/', protect, admin, updateSettings);

module.exports = router;
