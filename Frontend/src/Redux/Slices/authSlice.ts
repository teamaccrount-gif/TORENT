import { createSlice } from '@reduxjs/toolkit';
import { createCommonAsyncThunk } from '../../utils/ReduxUtils/commonAsyncThunk';
import { API_URLS } from '../../utils/apiUrl';
import type { Role, User } from '../../types';

export const loginUser = createCommonAsyncThunk('loginUser', API_URLS.LOGIN, 'authSlice');

export const refreshSession = createCommonAsyncThunk('refreshSession', API_URLS.REFRESH, 'authSlice');

export const logoutUser = createCommonAsyncThunk('logoutUser', API_URLS.LOGOUT, 'authSlice');

type AsyncStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected';
type AuthThunkKey = 'loginUser' | 'refreshSession' | 'logoutUser';

interface AuthThunkEnvelope<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  user?: User;
  [key: string]: unknown;
}

interface AuthState {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  data: Record<AuthThunkKey, unknown>;
  loading: Record<AuthThunkKey, AsyncStatus>;
  error: Record<AuthThunkKey, string | null>;
  currentRequestId: Record<AuthThunkKey, string | undefined>;
}

const emptyStatus = (): Record<AuthThunkKey, AsyncStatus> => ({
  loginUser: 'idle',
  refreshSession: 'idle',
  logoutUser: 'idle',
});

const emptyError = (): Record<AuthThunkKey, string | null> => ({
  loginUser: null,
  refreshSession: null,
  logoutUser: null,
});

const emptyRequestIds = (): Record<AuthThunkKey, string | undefined> => ({
  loginUser: undefined,
  refreshSession: undefined,
  logoutUser: undefined,
});

const extractUserFromAuthPayload = (payload: unknown): User | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as AuthThunkEnvelope<User>;
  const candidate =
    record.data && typeof record.data === 'object'
      ? (record.data as User & { user?: User })
      : record;

  const rawUser =
    (candidate as { user?: User }).user ??
    ((candidate as User)?.email ? (candidate as User) : null);

  if (!rawUser) {
    return null;
  }

  const normalizedRole = typeof rawUser.role === 'string' ? rawUser.role.toLowerCase() : rawUser.role;

  return {
    ...rawUser,
    role: normalizedRole as Role,
  };
};

const initialState: AuthState = {
  user: null,
  role: null,
  isAuthenticated: false,
  data: {
    loginUser: null,
    refreshSession: null,
    logoutUser: null,
  },
  loading: emptyStatus(),
  error: emptyError(),
  currentRequestId: emptyRequestIds(),
};

const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state, action) => {
        state.loading.loginUser = 'pending';
        state.error.loginUser = null;
        state.currentRequestId.loginUser = action.meta.requestId;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading.loginUser = 'fulfilled';
        state.data.loginUser = action.payload;
        const user = extractUserFromAuthPayload(action.payload);
        if (user) {
          state.user = user;
          state.role = user.role;
          state.isAuthenticated = true;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading.loginUser = 'rejected';
        state.error.loginUser = (action.payload as string) ?? 'An error occurred';
      })
      .addCase(refreshSession.pending, (state, action) => {
        state.loading.refreshSession = 'pending';
        state.error.refreshSession = null;
        state.currentRequestId.refreshSession = action.meta.requestId;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.loading.refreshSession = 'fulfilled';
        state.data.refreshSession = action.payload;
        const user = extractUserFromAuthPayload(action.payload);
        if (user) {
          state.user = user;
          state.role = user.role;
          state.isAuthenticated = true;
        }
      })
      .addCase(refreshSession.rejected, (state, action) => {
        state.loading.refreshSession = 'rejected';
        state.error.refreshSession = (action.payload as string) ?? 'An error occurred';
      })
      .addCase(logoutUser.pending, (state, action) => {
        state.loading.logoutUser = 'pending';
        state.error.logoutUser = null;
        state.currentRequestId.logoutUser = action.meta.requestId;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.loading.logoutUser = 'fulfilled';
        state.data.logoutUser = action.payload;
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading.logoutUser = 'rejected';
        state.error.logoutUser = (action.payload as string) ?? 'An error occurred';
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
      });
  },
});

export default authSlice.reducer;
