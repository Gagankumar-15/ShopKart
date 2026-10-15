const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  registerCustomer,
  loginCustomer,
  getMe,
  logoutCustomer,
  changePassword
} = require('../controllers/customer.controller');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/logout', protect, logoutCustomer);
router.get('/me', protect, getMe);
router.patch('/change-password', protect, changePassword);

module.exports = router;
