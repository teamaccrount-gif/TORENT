import { createCommonAsyncThunk } from '../../utils/ReduxUtils/commonAsyncThunk';
import { CommonReduxSliceMaker } from '../../utils/ReduxUtils/commonSliceMaker';
import { API_URLS } from '../../utils/apiUrl';

export const fetchCities = createCommonAsyncThunk(
  'fetchCities',
  API_URLS.TABLES_AREA,
  'registrationSlice'
);

export const fetchStations = createCommonAsyncThunk(
  'fetchStations',
  API_URLS.TABLES_STATION,
  'registrationSlice'
);

export const fetchRoles = createCommonAsyncThunk(
  'fetchRoles',
  API_URLS.FETCH_ROLES,
  'registrationSlice'
);

export const fetchRegions = createCommonAsyncThunk(
  'fetchRegions',
  API_URLS.TABLES_REGION,
  'registrationSlice'
);

export const fetchAreas = createCommonAsyncThunk(
  'fetchAreas',
  API_URLS.TABLES_AREA,
  'registrationSlice'
);

export const fetchRegistrationStations = createCommonAsyncThunk(
  'fetchRegistrationStations',
  API_URLS.TABLES_STATION,
  'registrationSlice'
);

const realAddUser = createCommonAsyncThunk(
  'addUser',
  API_URLS.ADD_USER,
  'registrationSlice'
);
export const addUser = realAddUser;

const initialData = {
  fetchCities: null,
  fetchStations: null,
  fetchRoles: null,
  fetchRegions: null,
  fetchAreas: null,
  fetchRegistrationStations: null,
  addUser: null,
};

const registrationSlice = CommonReduxSliceMaker(
  'registrationSlice',
  {
    fetchCities,
    fetchStations,
    fetchRoles,
    fetchRegions,
    fetchAreas,
    fetchRegistrationStations,
    addUser,
  },
  initialData
);

export default registrationSlice.reducer;
