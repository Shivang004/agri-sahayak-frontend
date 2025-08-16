//
// File: shivang004/agri-sahayak/Agri-Sahayak-556aba1d3e32dffff51a3e6061f2534765bf648e/Agri Sahayak/frontend/lib/AuthContext.tsx
//
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string, state_id: number, district_id: number } | null;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  signup: (user: string, pass: string, state_id: number, district_id: number) => Promise<boolean>;
  updateUser: (userData: { username: string, password?: string, state_id: number, district_id: number }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string, state_id: number, district_id: number } | null>(null);

  const fetchUserData = async (username: string) => {
    try {
      const response = await fetch(`/api/auth/user?username=${encodeURIComponent(username)}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user data', error);
      logout();
    }
  };

  useEffect(() => {
    const username = localStorage.getItem('agri-sahayak-auth');
    if (username) {
      setIsAuthenticated(true);
      fetchUserData(username);
    }
  }, []);

  const signup = async (username: string, pass: string, state_id: number, district_id: number): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass, state_id, district_id }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(`Signup failed: ${data.message}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Signup fetch error:', error);
      alert('An error occurred during signup.');
      return false;
    }
  };

  const login = async (username: string, pass: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });

      if (response.ok) {
        localStorage.setItem('agri-sahayak-auth', username);
        setIsAuthenticated(true);
        await fetchUserData(username);
        return true;
      } else {
        const data = await response.json();
        alert(`Login failed: ${data.message}`);
        return false;
      }
    } catch (error) {
      console.error('Login fetch error:', error);
      alert('An error occurred during login.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('agri-sahayak-auth');
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = async (userData: { username: string, password?: string, state_id: number, district_id: number }): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(`Update failed: ${data.message}`);
        return false;
      }

      setUser({ username: userData.username, state_id: userData.state_id, district_id: userData.district_id });
      return true;
    } catch (error) {
      console.error('Update fetch error:', error);
      alert('An error occurred during update.');
      return false;
    }
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    signup,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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