import { createCommonAsyncThunk } from '../../utils/ReduxUtils/commonAsyncThunk';
import { CommonReduxSliceMaker } from '../../utils/ReduxUtils/commonSliceMaker';
import { API_URLS } from '../../utils/apiUrl';
export const loginUser = createCommonAsyncThunk(
  'loginUser',
  API_URLS.LOGIN,
  'authSlice'
);

export const refreshSession = createCommonAsyncThunk(
  'refreshSession',
  API_URLS.REFRESH,
  'authSlice'
);

export const logoutUser = createCommonAsyncThunk(
  'logoutUser',
  API_URLS.LOGOUT,
  'authSlice'
);

const initialData = {
  loginUser: null,
  refreshSession: null,
  logoutUser: null,
};

const authSlice = CommonReduxSliceMaker('authSlice', { loginUser, refreshSession, logoutUser }, initialData);

export default authSlice.reducer;
