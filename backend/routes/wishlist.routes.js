const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist
} = require('../controllers/wishlist.controller');

router.route('/:productId')
  .post(protect, addToWishlist)
  .delete(protect, removeFromWishlist);

router.get('/', protect, getWishlist);

module.exports = router;
