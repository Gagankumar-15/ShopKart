console.log("PRODUCT ROUTES FILE LOADED");

const express = require('express');


const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  sayHi
} = require('../controllers/product.controller');

router.post('/', createProduct);

router.get('/', getProducts);

router.get('/hi', sayHi);

router.get('/:id', getProductById);

module.exports = router;