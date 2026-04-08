import { createAsyncThunk } from '@reduxjs/toolkit';
import { createCommonAsyncThunk } from '../../utils/ReduxUtils/commonAsyncThunk';
import { CommonReduxSliceMaker } from '../../utils/ReduxUtils/commonSliceMaker';
import { API_URLS } from '../../utils/apiUrl';
import { USE_MOCKS } from '../../config/apiConfig';
import { getMockUserByEmail, mockResponse } from '../../utils/mockData';

const realLoginUser = createCommonAsyncThunk(
  'loginUser',
  (API_URLS as any).LOGIN || '',
  'authSlice'
);

const mockLoginUser = createAsyncThunk(
  'loginUser',
  async (payload: any) => {
    const user = getMockUserByEmail(payload.payload.email);
    return await mockResponse(user);
  }
);

export const loginUser = USE_MOCKS ? mockLoginUser : (realLoginUser as any);

const initialData = {
  loginUser: null,
};

const authSlice = CommonReduxSliceMaker('authSlice', { loginUser }, initialData);

export default authSlice.reducer;
