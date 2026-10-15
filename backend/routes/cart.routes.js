const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
} = require('../controllers/cart.controller');

router.get('/', protect, getCart);
router.post('/:productId', protect, addToCart);
router.put('/:productId', protect, updateCartQuantity);
router.delete('/:productId', protect, removeFromCart);

module.exports = router;
