import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:5000/cart');
      if (data.success) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const { data } = await axios.post(`http://localhost:5000/cart/${productId}`, { quantity });
      if (data.success) {
        setCart(data.cart);
        // Better UX: optionally re-fetch or rely on the returned cart items. The returned items only have product IDs if not populated, but in our backend, wait, addToCart doesn't populate.
        fetchCart(); 
      }
    } catch (error) {
      console.error('Failed to add to cart', error);
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await axios.put(`http://localhost:5000/cart/${productId}`, { quantity });
      if (data.success) {
        fetchCart();
      }
    } catch (error) {
      console.error('Failed to update quantity', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await axios.delete(`http://localhost:5000/cart/${productId}`);
      if (data.success) {
        fetchCart();
      }
    } catch (error) {
      console.error('Failed to remove from cart', error);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, cartCount, fetchCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
