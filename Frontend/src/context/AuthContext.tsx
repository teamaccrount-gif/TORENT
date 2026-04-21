import React, { type ReactNode } from 'react';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
