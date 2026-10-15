const Product = require('../models/product.model');

// @desc    Create a product
// @route   POST /products
// @access  Public (for lab purposes)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required field' });
    }
    
    if (price <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid price' });
    }
    
    if (stock < 0) {
      return res.status(400).json({ success: false, message: 'Invalid stock' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all products
// @route   GET /products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    
    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (category) {
      query.category = category;
    }

    let sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else sortOption.createdAt = -1; // Default

    const products = await Product.find(query).sort(sortOption);

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json({ success: true, product });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid product ID' });
  }
};



const sayHi = (req, res) => {
  res.json({
    message: "hi gagan"
  });
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  sayHi
};
