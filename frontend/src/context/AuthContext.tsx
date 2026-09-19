'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  sendRegistrationOtp: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  verifyRegistrationOtp: (email: string, otp: string) => Promise<User>;
  resendRegistrationOtp: (email: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<User>;
  logout: () => Promise<void>;
  checkUserSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load credentials from local storage on mount
    const savedToken = localStorage.getItem('vanity_token');
    const savedUser = localStorage.getItem('vanity_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('vanity_token');
        localStorage.removeItem('vanity_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response.success || !response.access_token) {
        throw new Error(response.message || 'Invalid credentials');
      }

      const { access_token, user: loggedUser } = response;

      localStorage.setItem('vanity_token', access_token);
      localStorage.setItem('vanity_user', JSON.stringify(loggedUser));

      setToken(access_token);
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendRegistrationOtp = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      const response = await fetchApi('/auth/register/send-otp', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to send verification code. Please check details.');
      }

      return {
        success: true,
        message: response.message || 'Verification code sent to your email.',
      };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyRegistrationOtp = async (
    email: string,
    otp: string
  ): Promise<User> => {
    setLoading(true);
    try {
      const response = await fetchApi('/auth/register/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });

      if (!response.success || !response.access_token) {
        throw new Error(response.message || 'Verification failed. Please check the code.');
      }

      const { access_token, user: registeredUser } = response;

      localStorage.setItem('vanity_token', access_token);
      localStorage.setItem('vanity_user', JSON.stringify(registeredUser));

      setToken(access_token);
      setUser(registeredUser);
      return registeredUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resendRegistrationOtp = async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetchApi('/auth/register/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to resend verification code.');
      }

      return {
        success: true,
        message: response.message || 'New verification code sent.',
      };
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<User> => {
    // Direct verification flow should be used
    const res = await sendRegistrationOtp(name, email, password);
    throw new Error(res.message);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetchApi('/auth/logout', { method: 'POST' }).catch(() => {
        // Suppress API logout errors (e.g. token expired) and continue local cleanup
      });
    } finally {
      localStorage.removeItem('vanity_token');
      localStorage.removeItem('vanity_user');
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const checkUserSession = async () => {
    if (!token) return;
    try {
      const response = await fetchApi('/user');
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('vanity_user', JSON.stringify(response.user));
      }
    } catch (error) {
      localStorage.removeItem('vanity_token');
      localStorage.removeItem('vanity_user');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        sendRegistrationOtp,
        verifyRegistrationOtp,
        resendRegistrationOtp,
        register,
        logout,
        checkUserSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
