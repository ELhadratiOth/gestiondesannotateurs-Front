import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // You can implement an API call to validate the token and get user data
          // For now, we'll try to get the user profile from localStorage if available
          const userFromStorage = localStorage.getItem('user');
          if (userFromStorage) {
            setUser(JSON.parse(userFromStorage));
          } else {
            // If you have an endpoint to fetch user profile, use it here
            // const response = await API.get('/auth/profile', {
            //   headers: { Authorization: `Bearer ${token}` }
            // });
            // setUser(response.data);
          }
        } catch (err) {
          console.error('Failed to authenticate user:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async credentials => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/auth/login', credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Login response:', response);

      if (response.data.data) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return { success: true, user };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to login',
      };
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async userData => {
    setLoading(true);
    setError(null);

    console.log('Signup data:', userData);

    try {
      const response = await API.post('/auth/signup', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Signup response:', response);
      if (response.data.data) {
        console.log('Signup data:', response.data.data);
        // const { token, user } = response.data.data;
        const user  = response.data.data;



        // localStorage.setItem('token', token || response.data.access_token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return { success: true, user };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign up');
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to sign up',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
