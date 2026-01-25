import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'authUser';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  role: null, // 'admin' or 'user'
  login: () => {},
  logout: () => {},
  register: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch (_) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (_) {
      // ignore
    }
  }, [user]);

  const login = (payload) => {
    const fakeUser = { 
      id: 'local', 
      email: payload?.email || '', 
      name: payload?.fullName || 'User',
      role: payload?.role || 'user' // 'admin' or 'user'
    };
    setUser(fakeUser);
    return fakeUser;
  };

  const register = (payload) => {
    const newUser = { 
      id: 'local', 
      email: payload?.email || '', 
      name: payload?.fullName || 'User',
      role: 'user'
    };
    setUser(newUser);
    return newUser;
  };

  const logout = () => setUser(null);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    role: user?.role || null,
    login,
    logout,
    register,
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
