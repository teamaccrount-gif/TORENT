import { createCommonAsyncThunk } from '../../utils/ReduxUtils/commonAsyncThunk';
import { CommonReduxSliceMaker } from '../../utils/ReduxUtils/commonSliceMaker';
import { API_URLS } from '../../utils/apiUrl';

export const fetchAllRegions = createCommonAsyncThunk(
  'fetchAllRegions',
  API_URLS.ALL_REGIONS,
  'dropdownSlice'
);

export const fetchAreaByRegion = createCommonAsyncThunk(
  'fetchAreaByRegion',
  API_URLS.AREA_BY_REGION,
  'dropdownSlice'
);

export const fetchStationByArea = createCommonAsyncThunk(
  'fetchStationByArea',
  API_URLS.STATION_BY_AREA,
  'dropdownSlice'
);

const initialData = {
  fetchAllRegions: null,
  fetchAreaByRegion: null,
  fetchStationByArea: null,
};

const dropdownSlice = CommonReduxSliceMaker(
  'dropdownSlice',
  {
    fetchAllRegions,
    fetchAreaByRegion,
    fetchStationByArea,
  },
  initialData
);

export default dropdownSlice.reducer;
