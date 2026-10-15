const Customer = require('../models/customer.model');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');

// @desc    Register a new customer
// @route   POST /customers/register
// @access  Public
const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are mandatory' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must contain at least 6 characters' });
    }

    const customerExists = await Customer.findOne({ email });
    if (customerExists) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone
    });

    if (customer) {
      generateToken(res, customer._id);
      res.status(201).json({
        success: true,
        message: 'Customer registered successfully',
        customer: {
          _id: customer._id,
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid customer data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /customers/login
// @access  Public
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });

    if (customer && (await bcrypt.compare(password, customer.password))) {
      generateToken(res, customer._id);
      res.json({
        success: true,
        message: 'Login successful'
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /customers/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /customers/logout
// @access  Private
const logoutCustomer = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Change Password
// @route   PATCH /customers/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const customer = await Customer.findById(req.user._id);

    if (customer && (await bcrypt.compare(oldPassword, customer.password))) {
      const salt = await bcrypt.genSalt(10);
      customer.password = await bcrypt.hash(newPassword, salt);
      await customer.save();
      res.json({ success: true, message: 'Password updated successfully' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid old password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getMe,
  logoutCustomer,
  changePassword
};
