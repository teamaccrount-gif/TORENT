import React, { createContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthContextType, User, Role } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const isAuthenticated = !!user;
  const role: Role | null = user?.role || null;

  const login = (newUser: User) => {
    console.log('[AUTH][CONTEXT] Login state set:', newUser);
    setUser(newUser);
  };

  const logout = () => {
    console.log('[AUTH][CONTEXT] Clearing authenticated user.');
    setUser(null);
  };

  useEffect(() => {
    const handleAuthLogout = () => {
      logout();
      window.location.href = '/login';
    };

    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
