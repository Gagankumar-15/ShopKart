import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  axios.defaults.withCredentials = true; // Crucial for HttpOnly cookies

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/customers/me');
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('http://localhost:5000/customers/login', { email, password });
    if (data.success) {
      const userRes = await axios.get('http://localhost:5000/customers/me');
      setUser(userRes.data);
    }
  };

  const register = async (userData) => {
    const { data } = await axios.post('http://localhost:5000/customers/register', userData);
    if (data.success) {
      setUser(data.customer);
    }
  };

  const logout = async () => {
    await axios.post('http://localhost:5000/customers/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
