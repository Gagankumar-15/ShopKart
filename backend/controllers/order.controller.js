const crypto = require('crypto');
const Order = require('../models/order.model');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const razorpay = require('../config/razorpay');

// @desc    Validate cart, create ShopKart pending order and Razorpay order
// @route   POST /orders/create-payment-order
// @access  Private
const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // Validate shipping address
    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'All shipping address fields are required and cannot be empty'
      });
    }

    // Phone validation (10 to 13 digits, optional leading +)
    const phoneRegex = /^\+?[0-9]{10,13}$/;
    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must contain a valid 10-13 digit number'
      });
    }

    // Pincode validation (6 digits)
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Pincode must contain 6 digits'
      });
    }

    // Load customer cart
    const customer = await Customer.findById(req.user._id);
    if (!customer || !customer.cart || customer.cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Load latest product data and verify stock
    const orderItems = [];
    let totalAmount = 0;

    for (const item of customer.cart) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'One of the products in your cart is no longer available'
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      // Build product snapshot
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    // Create ShopKart pending order
    const shopKartOrder = new Order({
      user: customer._id,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim()
      },
      totalAmount,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT'
    });

    // Create Razorpay order in paise
    const amountInPaise = Math.round(totalAmount * 100);
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: shopKartOrder._id.toString()
    });

    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment signature and confirm order
// @route   POST /orders/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify payment for this order'
      });
    }

    // Signature verification using trusted razorpayOrderId from DB
    const body = order.razorpayOrderId + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = 'FAILED';
      await order.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Mark paid and placed
    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Deduct stock for each purchased product
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear user cart only after verified payment
    const customer = await Customer.findById(req.user._id);
    customer.cart = [];
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order placed successfully',
      order
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's orders
// @route   GET /orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order by id:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Bonus Challenge)
// @route   PATCH /orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus
};
