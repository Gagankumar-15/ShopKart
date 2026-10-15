import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart } = useContext(CartContext);

  if (loading) {
    return <div className="text-center py-20 text-lg text-gray-600">Loading your cart...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100 max-w-3xl mx-auto">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  // Ensure items have populated product fields before calculating
  const validCart = cart.filter(item => item.product && item.product.price);
  const subtotal = validCart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {validCart.map((item) => (
                <li key={item.product._id} className="p-6 flex flex-col sm:flex-row gap-6">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name} 
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md border border-gray-100" 
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link to={`/products/${item.product._id}`}>
                          <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600">{item.product.name}</h3>
                        </Link>
                        <p className="text-lg font-extrabold text-gray-900">₹{item.product.price.toLocaleString('en-IN')}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{item.product.category}</p>
                      {item.product.stock < 5 && (
                        <p className="mt-2 text-sm text-red-500">Only {item.product.stock} left in stock</p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button 
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-1 font-medium text-gray-900 border-x border-gray-300">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.product._id)}
                        className="text-red-500 hover:text-red-700 flex items-center text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-4 text-sm text-gray-600 mb-6 border-b border-gray-200 pb-6">
              <div className="flex justify-between">
                <span>Subtotal ({validCart.length} items)</span>
                <span className="font-medium text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping estimate</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>
            
            <div className="flex justify-between text-xl font-extrabold text-gray-900 mb-6">
              <span>Order Total</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            <Link 
              to="/checkout"
              className="block text-center w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
