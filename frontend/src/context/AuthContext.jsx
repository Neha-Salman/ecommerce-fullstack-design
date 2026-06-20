import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize Auth & Cart from LocalStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedCart = localStorage.getItem('cartItems');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error('Failed to load local storage auth state:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync cartItems to LocalStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to sync cart to localStorage:', e);
    }
  }, [cartItems]);

  // Login handler
  const login = async (email, password) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
    
    if (response.data && response.data.token) {
      const { token: userToken, user: loggedUser } = response.data;
      setToken(userToken);
      setUser(loggedUser);
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));
    }
    return response.data;
  };

  // Register handler
  const register = async (name, email, password, role) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await axios.post(`${apiUrl}/api/auth/register`, { name, email, password, role });
    
    if (response.data && response.data.token) {
      const { token: userToken, user: registeredUser } = response.data;
      setToken(userToken);
      setUser(registeredUser);
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(registeredUser));
    }
    return response.data;
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    setCartItems([]); // Clear cart on logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cartItems');
  };

  // Cart Operations
  const addToCart = (product) => {
    setCartItems((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          title: product.title || product.name || 'Product Name',
          price: product.price,
          image: product.image,
          size: product.size || 'medium',
          color: product.color || 'blue',
          material: product.material || 'Plastic',
          seller: product.seller || 'Artel Market',
          qty: 1
        }
      ];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateCartQty = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
    } else {
      setCartItems((prevCart) =>
        prevCart.map((item) => (item.id === id ? { ...item, qty } : item))
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Cumulative item count
  const cartCount = cartItems.reduce((acc, curr) => acc + curr.qty, 0);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        cartItems,
        loading,
        login,
        register,
        logout,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartCount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
