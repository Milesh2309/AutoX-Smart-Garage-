import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../utils/apiService';
import { clearAuthToken, clearRefreshToken, getAuthToken, setAuthToken, setRefreshToken } from '../utils/apiClient';

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

  const getAuthTokenFromResponse = (response) => response?.token || response?.accessToken;
  const getRefreshTokenFromResponse = (response) => response?.refreshToken;
  const getUserFromResponse = (response) => response?.data || response?.user;

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
        clearRefreshToken();
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

    const token = getAuthTokenFromResponse(response);
    const refreshToken = getRefreshTokenFromResponse(response);
    const authUser = getUserFromResponse(response);

    if (!response?.success || !authUser || !token) {
      throw new Error(response?.message || 'Login failed');
    }

    setAuthToken(token);
    if (refreshToken) setRefreshToken(refreshToken);
    setUser(authUser);
    return authUser;
  };

  const register = async (payload) => {
    const response = await authApi.register({
      name: payload?.fullName,
      email: payload?.email,
      phone: payload?.phone || '',
      password: payload?.password,
      role: payload?.role || 'user',
    });

    if (!response?.success) {
      throw new Error(response?.message || 'Registration failed');
    }

    return response?.data || response;
  };

  const requestRegisterOtp = async (email) => {
    const response = await authApi.sendOtp({ email });
    if (!response?.success) {
      throw new Error(response?.message || 'Failed to send OTP');
    }
    return response?.data;
  };

  const verifyRegisterOtp = async ({ email, otp }) => {
    const response = await authApi.verifyOtp({ email, otp });
    if (!response?.success) {
      throw new Error(response?.message || 'OTP verification failed');
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
    clearRefreshToken();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    role: user?.role || null,
    authLoading,
    login,
    requestRegisterOtp,
    verifyRegisterOtp,
    requestForgotPassword,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
