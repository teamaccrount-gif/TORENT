import { createAsyncThunk } from '@reduxjs/toolkit';
import { createCommonAsyncThunk } from '../../utils/ReduxUtils/commonAsyncThunk';
import { CommonReduxSliceMaker } from '../../utils/ReduxUtils/commonSliceMaker';
import { API_URLS } from '../../utils/apiUrl';
import { USE_MOCKS } from '../../config/apiConfig';
import { MOCK_CITIES, MOCK_STATIONS, mockResponse } from '../../utils/mockData';

const realFetchCities = createCommonAsyncThunk(
  'fetchCities',
  API_URLS.FETCH_CITIES,
  'registrationSlice'
);

const mockFetchCities = createAsyncThunk(
  'fetchCities',
  async () => await mockResponse(MOCK_CITIES)
);

export const fetchCities = USE_MOCKS ? mockFetchCities : (realFetchCities as any);

const realFetchStations = createCommonAsyncThunk(
  'fetchStations',
  API_URLS.FETCH_STATIONS,
  'registrationSlice'
);

const mockFetchStations = createAsyncThunk(
  'fetchStations',
  async () => await mockResponse(MOCK_STATIONS)
);

export const fetchStations = USE_MOCKS ? mockFetchStations : (realFetchStations as any);

const realRegisterRM = createCommonAsyncThunk(
  'registerRM',
  API_URLS.REGISTER_RM,
  'registrationSlice'
);

const mockRegisterRM = createAsyncThunk(
  'registerRM',
  async (_payload: any) => await mockResponse({ success: true })
);

export const registerRM = USE_MOCKS ? mockRegisterRM : (realRegisterRM as any);

const realRegisterCM = createCommonAsyncThunk(
  'registerCM',
  API_URLS.REGISTER_CM,
  'registrationSlice'
);

const mockRegisterCM = createAsyncThunk(
  'registerCM',
  async (_payload: any) => await mockResponse({ success: true })
);

export const registerCM = USE_MOCKS ? mockRegisterCM : (realRegisterCM as any);

const realRegisterSM = createCommonAsyncThunk(
  'registerSM',
  API_URLS.REGISTER_SM,
  'registrationSlice'
);

const mockRegisterSM = createAsyncThunk(
  'registerSM',
  async (_payload: any) => await mockResponse({ success: true })
);

export const registerSM = USE_MOCKS ? mockRegisterSM : (realRegisterSM as any);

const initialData = {
  fetchCities: null,
  fetchStations: null,
  registerRM: null,
  registerCM: null,
  registerSM: null,
};

const registrationSlice = CommonReduxSliceMaker(
  'registrationSlice',
  { fetchCities, fetchStations, registerRM, registerCM, registerSM },
  initialData
);

export default registrationSlice.reducer;
