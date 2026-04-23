import { createCommonAsyncThunk } from '../../utils/ReduxUtils/commonAsyncThunk';
import { CommonReduxSliceMaker } from '../../utils/ReduxUtils/commonSliceMaker';
import { API_URLS } from '../../utils/apiUrl';

export const fetchMapData = createCommonAsyncThunk(
  'fetchMapData',
  API_URLS.MAP_DATA,
  'mapSlice'
);

const initialData = {
  fetchMapData: null,
};

const mapSlice = CommonReduxSliceMaker(
  'mapSlice',
  { fetchMapData },
  initialData
);

export default mapSlice.reducer;
