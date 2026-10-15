const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/product.model');

dotenv.config();

const sampleProducts = [
  {
    name: "Sony WH-1000XM5 Headphones",
    description: "Industry leading noise canceling wireless headphones with auto noise canceling optimizer.",
    price: 29990,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80",
    stock: 15
  },
  {
    name: "Apple MacBook Pro M3",
    description: "14-inch MacBook Pro with M3 Pro chip. Powerful performance for pro workflows.",
    price: 199900,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    stock: 5
  },
  {
    name: "Minimalist Desk Lamp",
    description: "Adjustable LED desk lamp with wireless charging base and 3 color modes.",
    price: 3499,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    stock: 20
  },
  {
    name: "The Pragmatic Programmer",
    description: "Your journey to mastery. One of the most significant books in software engineering.",
    price: 2150,
    category: "Books",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80",
    stock: 50
  },
  {
    name: "Nike Air Force 1 '07",
    description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon.",
    price: 7495,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    stock: 12
  },
  {
    name: "Mechanical Gaming Keyboard",
    description: "RGB backlit mechanical keyboard with tactile blue switches.",
    price: 4599,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80",
    stock: 8
  },
  {
    name: "Ceramic Coffee Mug",
    description: "Handcrafted ceramic mug, perfect for your morning brew.",
    price: 799,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80",
    stock: 30
  },
  {
    name: "Levi's Classic Denim Jacket",
    description: "Original trucker jacket. A blank canvas for self-expression.",
    price: 4999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80",
    stock: 0
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear out existing products just in case
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert new sample products
    await Product.insertMany(sampleProducts);
    console.log('Successfully seeded database with sample products!');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
