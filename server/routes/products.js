const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { uploadProductImage } = require('../middleware/upload');
const {
  getProducts, getProduct, getRelatedProducts, createProduct,
  updateProduct, deleteProduct, uploadProductImages, getAdminProducts, getProductStats
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/admin/list', protect, admin, getAdminProducts);
router.get('/admin/stats', protect, admin, getProductStats);
router.post('/', protect, admin, createProduct);
router.get('/:slug', getProduct);
router.get('/:id/related', getRelatedProducts);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/images', protect, admin, uploadProductImage.array('images', 10), uploadProductImages);

module.exports = router;