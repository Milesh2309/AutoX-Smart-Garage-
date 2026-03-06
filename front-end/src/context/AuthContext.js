import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../utils/apiService';
import { clearAuthToken, getAuthToken, setAuthToken } from '../utils/apiClient';

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
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const bootstrapAuth = async () => {
      try {
        const token = getAuthToken();
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const localUser = JSON.parse(raw);
          if (active) {
            setUser(localUser);
          }
        }

        if (token) {
          const response = await authApi.me();
          if (response?.success && response?.data && active) {
            setUser(response.data);
          }
        }
      } catch (_error) {
        clearAuthToken();
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (_) {
      // ignore
    }
  }, [user]);

  const login = async (payload) => {
    const response = await authApi.login({
      email: payload?.email,
      password: payload?.password,
    });

    if (!response?.success || !response?.data || !response?.token) {
      throw new Error(response?.message || 'Login failed');
    }

    setAuthToken(response.token);
    setUser(response.data);
    return response.data;
  };

  const register = async (payload) => {
    const response = await authApi.register({
      name: payload?.fullName,
      email: payload?.email,
      phone: payload?.phone || '',
      password: payload?.password,
      role: payload?.role || 'user',
    });

    if (!response?.success || !response?.data || !response?.token) {
      throw new Error(response?.message || 'Registration failed');
    }

    setAuthToken(response.token);
    setUser(response.data);
    return response.data;
  };

  const loginWithOtp = async (payload) => {
    const response = await authApi.verifyLoginOtp({
      email: payload?.email,
      otp: payload?.otp,
    });

    if (!response?.success || !response?.data || !response?.token) {
      throw new Error(response?.message || 'OTP login failed');
    }

    setAuthToken(response.token);
    setUser(response.data);
    return response.data;
  };

  const requestLoginOtp = async (email) => {
    const response = await authApi.sendLoginOtp({ email });
    if (!response?.success) {
      throw new Error(response?.message || 'Failed to send OTP');
    }
    return response?.data;
  };

  const requestForgotPassword = async (email) => {
    const response = await authApi.forgotPassword({ email });
    if (!response?.success) {
      throw new Error(response?.message || 'Failed to generate reset token');
    }
    return response?.data;
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    role: user?.role || null,
    authLoading,
    login,
    loginWithOtp,
    requestLoginOtp,
    requestForgotPassword,
    logout,
    register,
  }), [user, authLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
