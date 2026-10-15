import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Heart, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Note: For a fully optimized app, wishlist state should be global or passed down. 
  // We'll check individually here for simplicity.
  useEffect(() => {
    if (user) {
      const checkWishlist = async () => {
        try {
          const { data } = await axios.get('http://localhost:5000/wishlist');
          if (data.success) {
            const found = data.wishlist.some(item => item._id === product._id);
            setIsWishlisted(found);
          }
        } catch (error) {
          console.error(error);
        }
      };
      checkWishlist();
    }
  }, [user, product._id]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to use wishlist');
    
    setIsSaving(true);
    try {
      if (isWishlisted) {
        await axios.delete(`http://localhost:5000/wishlist/${product._id}`);
        setIsWishlisted(false);
      } else {
        await axios.post(`http://localhost:5000/wishlist/${product._id}`);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error(error);
      alert('Error updating wishlist');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <Link to={`/products/${product._id}`} className="block relative aspect-w-4 aspect-h-3 bg-gray-200">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-48 object-cover"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{product.category}</span>
            <Link to={`/products/${product._id}`}>
              <h3 className="text-lg font-bold text-gray-900 mt-1 hover:text-blue-600 line-clamp-1">{product.name}</h3>
            </Link>
          </div>
          <button 
            onClick={toggleWishlist}
            disabled={isSaving}
            className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${isSaving ? 'opacity-50' : ''}`}
            title="Wishlist"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <span className="text-xl font-extrabold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
          <Link 
            to={`/products/${product._id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
