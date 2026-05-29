import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isDesigner: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, role?: 'user' | 'designer', shopName?: string) => Promise<void>;
  updateProfile: (data: { name?: string }) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Basic local persistence check
    const storedUser = localStorage.getItem('pod_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const authenticatedUser = await authService.login(email, pass);
      setUser(authenticatedUser);
      localStorage.setItem('pod_user', JSON.stringify(authenticatedUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (email: string, pass: string, name: string, role: 'user' | 'designer' = 'user', shopName?: string) => {
    try {
      const newUser = await authService.signup(email, pass, name, role, shopName);
      setUser(newUser);
      localStorage.setItem('pod_user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const updateProfile = async (data: { name?: string }) => {
    if (!user) return;
    try {
      await authService.updateProfile(user.id, data);
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('pod_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pod_user');
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      await authService.deleteAccount(user.id);
      setUser(null);
      localStorage.removeItem('pod_user');
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin: user?.role === 'admin', 
      isDesigner: user?.role === 'designer',
      login, 
      signup, 
      updateProfile,
      logout, 
      deleteAccount,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
