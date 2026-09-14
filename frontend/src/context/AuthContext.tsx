'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
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
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
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
        throw new Error(response.message || 'Invalid email or password.');
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

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<User> => {
    setLoading(true);
    try {
      const response = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      if (!response.success || !response.access_token) {
        throw new Error(response.message || 'Registration failed. Please check your details.');
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
      // If validation fails, clear local storage
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
