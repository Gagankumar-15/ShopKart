import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, Heart, LogOut, User as UserIcon, Package } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              ShopKart
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link to="/products" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
                Products
              </Link>
              {user && (
                <Link to="/orders" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
                  My Orders
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/orders" className="text-gray-500 hover:text-blue-600 relative" title="My Orders">
                  <Package className="h-6 w-6" />
                </Link>

                <Link to="/wishlist" className="text-gray-500 hover:text-red-500 relative" title="Wishlist">
                  <Heart className="h-6 w-6" />
                </Link>
                
                <Link to="/cart" className="text-gray-500 hover:text-blue-600 relative" title="Cart">
                  <ShoppingCart className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-blue-600 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <div className="flex items-center space-x-4 border-l pl-6 border-gray-300">
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    <UserIcon className="h-4 w-4 mr-2" />
                    {user.fullName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 flex items-center"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">Login</Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
