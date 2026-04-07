import { createAsyncThunk } from '@reduxjs/toolkit';
import { createCommonAsyncThunk } from '../../utils/ReduxUtils/commonAsyncThunk';
import { CommonReduxSliceMaker } from '../../utils/ReduxUtils/commonSliceMaker';
import { API_URLS } from '../../utils/apiUrl';
import { USE_MOCKS } from '../../config/apiConfig';
import { MOCK_USERS, mockResponse } from '../../utils/mockData';

const realFetchUsers = createCommonAsyncThunk(
  'fetchUsers',
  API_URLS.FETCH_USERS,
  'manageSlice'
);

const mockFetchUsers = createAsyncThunk(
  'fetchUsers',
  async (options: any) => {
    const page = options?.params?.page || 1;
    const limit = options?.params?.limit || 10;
    return await mockResponse({
      items: MOCK_USERS,
      total: MOCK_USERS.length,
      page,
      limit,
      totalPages: 1
    });
  }
);

export const fetchUsers = USE_MOCKS ? mockFetchUsers : (realFetchUsers as any);

const realFetchUserDetail = createCommonAsyncThunk(
  'fetchUserDetail',
  API_URLS.FETCH_USER_DETAIL,
  'manageSlice'
);

const mockFetchUserDetail = createAsyncThunk(
  'fetchUserDetail',
  async (options: any) => {
    const userId = options?.params?.userId;
    const user = MOCK_USERS.find(u => u.id === userId) || MOCK_USERS[0];
    return await mockResponse(user);
  }
);

export const fetchUserDetail = USE_MOCKS ? mockFetchUserDetail : (realFetchUserDetail as any);

const realUpdateUser = createCommonAsyncThunk(
  'updateUser',
  API_URLS.UPDATE_USER,
  'manageSlice'
);

const mockUpdateUser = createAsyncThunk(
  'updateUser',
  async (_payload: any) => await mockResponse({ success: true })
);

export const updateUser = USE_MOCKS ? mockUpdateUser : (realUpdateUser as any);

const realToggleUserStatus = createCommonAsyncThunk(
  'toggleUserStatus',
  API_URLS.TOGGLE_USER_STATUS,
  'manageSlice'
);

const mockToggleUserStatus = createAsyncThunk(
  'toggleUserStatus',
  async (_payload: any) => await mockResponse({ success: true })
);

export const toggleUserStatus = USE_MOCKS ? mockToggleUserStatus : (realToggleUserStatus as any);

const initialData = {
  fetchUsers: null,
  fetchUserDetail: null,
  updateUser: null,
  toggleUserStatus: null,
};

const manageSlice = CommonReduxSliceMaker(
  'manageSlice',
  { fetchUsers, fetchUserDetail, updateUser, toggleUserStatus },
  initialData
);

export default manageSlice.reducer;
