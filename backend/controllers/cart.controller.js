const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// @desc    Add product to cart
// @route   POST /cart/:productId
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock' });
    }

    const customer = await Customer.findById(req.user._id);
    const cartItemIndex = customer.cart.findIndex(item => item.product.toString() === productId);

    if (cartItemIndex > -1) {
      // Product exists, update quantity
      customer.cart[cartItemIndex].quantity += Number(quantity);
      if (customer.cart[cartItemIndex].quantity > product.stock) {
        return res.status(400).json({ success: false, message: 'Cannot add more than available stock' });
      }
    } else {
      // New product to cart
      customer.cart.push({ product: productId, quantity: Number(quantity) });
    }

    await customer.save();
    res.json({ success: true, message: 'Added to cart', cart: customer.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get cart
// @route   GET /cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price category image stock'
    });

    res.json({
      success: true,
      cart: customer.cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /cart/:productId
// @access  Private
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock or product not found' });
    }

    const customer = await Customer.findById(req.user._id);
    const cartItemIndex = customer.cart.findIndex(item => item.product.toString() === productId);

    if (cartItemIndex > -1) {
      customer.cart[cartItemIndex].quantity = Number(quantity);
      await customer.save();
      res.json({ success: true, message: 'Cart updated', cart: customer.cart });
    } else {
      res.status(404).json({ success: false, message: 'Product not in cart' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove from cart
// @route   DELETE /cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const customer = await Customer.findById(req.user._id);

    customer.cart = customer.cart.filter(item => item.product.toString() !== productId);
    await customer.save();

    res.json({ success: true, message: 'Removed from cart', cart: customer.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
};
