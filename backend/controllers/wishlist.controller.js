const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// @desc    Add product to wishlist
// @route   POST /wishlist/:productId
// @access  Private
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const customer = await Customer.findById(req.user._id);

    // Check if already in wishlist
    if (customer.wishlist.includes(productId)) {
      return res.status(409).json({ success: false, message: 'Already in wishlist' });
    }

    customer.wishlist.push(productId);
    await customer.save();

    res.json({ success: true, message: 'Product added to wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's wishlist
// @route   GET /wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock'
    });

    res.json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer.wishlist.includes(productId)) {
      return res.status(404).json({ success: false, message: 'Product not in wishlist' });
    }

    customer.wishlist = customer.wishlist.filter(id => id.toString() !== productId);
    await customer.save();

    res.json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist
};
