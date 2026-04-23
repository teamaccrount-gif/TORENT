import type { RootState } from "../Redux/Store";

// Centralized Level Mapping (STRICT)
export const levelToViewMap: Record<string, string> = {
  superadmin: 'region',
  super_admin: 'region',
  admin: 'region',
  country: 'region',
  region: 'area', // internal DB tables use 'area' for cities
  city: 'cgs',
  station: 'station', // Fallback for lowest level
};

// Redux Selector
export const selectUserAccess = (state: RootState) => {
  const authData = state.authSlice.data.loginUser as any;
  // Use the structure provided by the user: data.user
  const user = authData?.data?.user || authData?.user;

  const level = (user?.level || '').toLowerCase();
  const role = (user?.role || '').toLowerCase();

  const key = ['superadmin', 'super_admin', 'admin'].includes(role) ? role : level;
  const allowedView = levelToViewMap[key] || 'region';

  return { level, role, allowedView, user };
};

// Helper for UI components leveraging existing AuthContext
export const getAllowedView = (role: string, level: string) => {
  const r = role.toLowerCase();
  const l = level.toLowerCase();
  const key = ['superadmin', 'super_admin', 'admin'].includes(r) ? r : l;
  return levelToViewMap[key] || 'region';
};
