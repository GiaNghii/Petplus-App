import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockAuthService } from '../services/authService';
import { User } from '../types';

const DEFAULT_USER: User = {
  id: 'demo_user',
  name: 'Nguyễn Văn A',
  email: 'demo@petplus.vn',
  phone: '0901234567',
  role: 'customer',
  createdAt: new Date('2024-01-01'),
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEFAULT_USER);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    const result = await mockAuthService.login(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const register = async (email: string, password: string, name: string, phone: string) => {
    const result = await mockAuthService.register(email, password, name, phone);
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = async () => {
    await mockAuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
