const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/customers', require('./routes/customer.routes'));
// app.get('/products/hi', (req, res) => {
//   res.json({ message: 'hi gagan' });
// });
app.use('/products', require('./routes/product.routes'));
app.use('/wishlist', require('./routes/wishlist.routes'));
app.use('/cart', require('./routes/cart.routes'));
app.use('/orders', require('./routes/order.routes'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.log('MongoDB connection error:', error.message));


