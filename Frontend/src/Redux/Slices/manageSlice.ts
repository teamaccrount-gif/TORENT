import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { CommonReduxSliceMaker } from '../../utils/ReduxUtils/commonSliceMaker';
import { API_URLS } from '../../utils/apiUrl';

export const fetchUsers = createAsyncThunk(
  'fetchUsers',
  async (options: { method?: 'GET'; params?: { page?: number; limit?: number } } | undefined, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URLS.FETCH_USERS, {
        params: options?.params,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to fetch users');
    }
  }
);

export const fetchUserDetail = createAsyncThunk(
  'fetchUserDetail',
  async (options: { method?: 'GET'; params?: { userId?: string } } | undefined, { rejectWithValue }) => {
    try {
      const userId = options?.params?.userId;
      const response = await axios.get(`${API_URLS.FETCH_USER_DETAIL}/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to fetch user detail');
    }
  }
);

export const updateUser = createAsyncThunk(
  'updateUser',
  async (options: { method?: 'PUT'; payload?: { userId?: string; name?: string; phone?: string } } | undefined, { rejectWithValue }) => {
    try {
      const userId = options?.payload?.userId;
      const response = await axios.put(`${API_URLS.UPDATE_USER}/${userId}`, options?.payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to update user');
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'toggleUserStatus',
  async (options: { method?: 'PUT'; payload?: { userId?: string; isActive?: boolean } } | undefined, { rejectWithValue }) => {
    try {
      const userId = options?.payload?.userId;
      const response = await axios.put(`${API_URLS.UPDATE_USER}/${userId}`, options?.payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to update user status');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'deleteUser',
  async (options: { method?: 'DELETE'; payload?: { userId?: string } } | undefined, { rejectWithValue }) => {
    try {
      const userId = options?.payload?.userId;
      const response = await axios.delete(`${API_URLS.DELETE_USER}/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to delete user');
    }
  }
);

const initialData = {
  fetchUsers: null,
  fetchUserDetail: null,
  updateUser: null,
  toggleUserStatus: null,
  deleteUser: null,
};

const manageSlice = CommonReduxSliceMaker(
  'manageSlice',
  { fetchUsers, fetchUserDetail, updateUser, toggleUserStatus, deleteUser },
  initialData
);

export default manageSlice.reducer;
