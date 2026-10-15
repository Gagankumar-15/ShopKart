import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/wishlist');
      setWishlist(data.wishlist);
    } catch (err) {
      setError('Unable to load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const removeProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/wishlist/${productId}`);
      setWishlist(wishlist.filter(item => item._id !== productId));
    } catch (err) {
      alert('Failed to remove product from wishlist');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-lg text-gray-600">Loading your wishlist...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-red-50 text-red-600 rounded-lg max-w-2xl mx-auto">
        <p className="mb-4">{error}</p>
        <button onClick={fetchWishlist} className="px-4 py-2 bg-white rounded border border-red-200">Try Again</button>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100 max-w-3xl mx-auto">
        <Heart className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-8">Save products you love and find them here later.</p>
        <Link to="/products" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">My Wishlist</h1>
        <span className="text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">{wishlist.length} products saved</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map(product => (
          <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="relative aspect-w-4 aspect-h-3 bg-gray-200">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{product.category}</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 line-clamp-1">{product.name}</h3>
              <p className="text-xl font-extrabold text-gray-900 mt-2">₹{product.price.toLocaleString('en-IN')}</p>
              
              <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-gray-100">
                <Link to={`/products/${product._id}`} className="w-full text-center px-4 py-2 border border-blue-600 text-blue-600 font-medium rounded hover:bg-blue-50 transition-colors">
                  View Details
                </Link>
                <button 
                  onClick={() => removeProduct(product._id)}
                  className="w-full flex items-center justify-center px-4 py-2 text-red-600 hover:bg-red-50 rounded font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
