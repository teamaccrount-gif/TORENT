import { useMemo } from 'react';
import { useAppSelector } from '../Redux/Store';
import type { Role, User } from '../types';

export interface ReduxAuthState {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
}

export const useAuth = (): ReduxAuthState => {
  const user = useAppSelector((state) => state.authSlice.user);
  const role = useAppSelector((state) => state.authSlice.role);
  const isAuthenticated = useAppSelector((state) => state.authSlice.isAuthenticated);

  return useMemo(
    () => ({
      user,
      role,
      isAuthenticated,
    }),
    [user, role, isAuthenticated]
  );
};
