import { createCommonAsyncThunk } from '../../utils/ReduxUtils/commonAsyncThunk';
import { CommonReduxSliceMaker } from '../../utils/ReduxUtils/commonSliceMaker';
import { API_URLS } from '../../utils/apiUrl';

const thunks = {
  getMap: createCommonAsyncThunk(
    'getMap',
    API_URLS.LEAFLET_MAP_GET,
    'mapSlice'
  ),
  updateStation: createCommonAsyncThunk(
    'updateStation',
    API_URLS.LEAFLET_STATION,
    'mapSlice'
  ),
  updateRegion: createCommonAsyncThunk(
    'updateRegion',
    API_URLS.LEAFLET_REGION,
    'mapSlice'
  ),
  updateArea: createCommonAsyncThunk(
    'updateArea',
    API_URLS.LEAFLET_AREA,
    'mapSlice'
  ),
};

const initialData = {
  getMap: null,
  updateStation: null,
  updateRegion: null,
  updateArea: null,
};

const mapSlice = CommonReduxSliceMaker('mapSlice', thunks, initialData);

export const { getMap, updateStation, updateRegion, updateArea } = thunks as any;
export default mapSlice.reducer;
