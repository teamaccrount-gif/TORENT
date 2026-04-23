import { createCommonAsyncThunk, createDynamicAsyncThunk } from '../../utils/ReduxUtils/commonAsyncThunk';
import { CommonReduxSliceMaker } from '../../utils/ReduxUtils/commonSliceMaker';
import { API_URLS } from '../../utils/apiUrl';

// Static thunks (URLs don't change)
export const fetchRegions = createCommonAsyncThunk(
  'fetchRegions',
  API_URLS.REGION_DROPDOWN,
  'registrationSlice'
);

export const fetchRoles = createCommonAsyncThunk(
  'fetchRoles',
  API_URLS.FETCH_ROLES,
  'registrationSlice'
);

export const addUser = createCommonAsyncThunk(
  'addUser',
  API_URLS.ADD_USER,
  'registrationSlice'
);

// Dynamic thunks — URL path param is injected at dispatch time via `urlParam`
// Dispatch: dispatch(fetchAreasByRegion({ method: 'GET', urlParam: 'r1' }))
export const fetchAreasByRegion = createDynamicAsyncThunk(
  'fetchAreasByRegion',
  (options) => API_URLS.AREA_DROPDOWN.replace(':region', options?.urlParam ?? ''),
  'registrationSlice'
);

// Dispatch: dispatch(fetchStationsByArea({ method: 'GET', urlParam: 'a1' }))
export const fetchStationsByArea = createDynamicAsyncThunk(
  'fetchStationsByArea',
  (options) => API_URLS.STATION_DROPDOWN.replace(':area', options?.urlParam ?? ''),
  'registrationSlice'
);

const initialData = {
  fetchRegions: null,
  fetchRoles: null,
  addUser: null,
  fetchAreasByRegion: null,
  fetchStationsByArea: null,
};

const registrationSlice = CommonReduxSliceMaker(
  'registrationSlice',
  {
    fetchRegions,
    fetchRoles,
    addUser,
    fetchAreasByRegion,
    fetchStationsByArea,
  },
  initialData
);

export default registrationSlice.reducer;
