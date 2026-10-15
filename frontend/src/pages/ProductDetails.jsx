import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, Heart, ArrowLeft } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAdding, setIsAdding] = useState(false);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/products/${id}`);
        setProduct(data.product);
      } catch (err) {
        setError('Could not load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }
    
    setIsAdding(true);
    try {
      await addToCart(product._id, 1);
      alert('Added to cart!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      alert('Please log in to add items to your wishlist.');
      navigate('/login');
      return;
    }
    try {
      await axios.post(`http://localhost:5000/wishlist/${product._id}`);
      alert('Added to wishlist!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding to wishlist');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-lg text-gray-600 animate-pulse">Loading product details...</div>;
  }

  if (error || !product) {
    return <div className="text-center py-20 text-red-600 font-medium text-lg">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/products" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
      </Link>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-8">
          <img src={product.image} alt={product.name} className="max-w-full h-auto rounded-lg shadow-md object-cover max-h-96" />
        </div>
        
        <div className="md:w-1/2 p-8 flex flex-col">
          <div className="mb-2 uppercase tracking-wide text-sm text-blue-600 font-semibold">
            {product.category}
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
          
          <p className="text-gray-700 text-lg mb-6 leading-relaxed flex-grow">
            {product.description}
          </p>
          
          <div className="mb-6 pb-6 border-b border-gray-200">
            <span className="text-4xl font-extrabold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
            <div className="mt-2 text-sm">
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded">In Stock ({product.stock} units available)</span>
              ) : (
                <span className="text-red-600 font-medium bg-red-50 px-2 py-1 rounded">Out of Stock</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || isAdding}
              className={`flex-1 flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white 
                ${product.stock > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} transition-colors`}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
            
            <button
              onClick={handleAddToWishlist}
              className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Heart className="w-5 h-5 mr-2 text-gray-500" />
              Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
