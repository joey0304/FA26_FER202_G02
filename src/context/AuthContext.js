import { createContext, useContext, useEffect, useState } from 'react';
import { storeRequest } from '../services/carStoreService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storeRequest('me')
      .then(currentUser => {
        setUser(currentUser);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const res = await storeRequest('login', 'POST', { email, password });
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await storeRequest('logout', 'POST');
    } finally {
      setUser(null);
    }
  };

  const register = async (name, email, password) => {
    return await storeRequest('register', 'POST', { name, email, password });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, register }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}
