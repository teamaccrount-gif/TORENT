import { createCommonAsyncThunk } from "../../utils/ReduxUtils/commonAsyncThunk";
import { CommonReduxSliceMaker } from "../../utils/ReduxUtils/commonSliceMaker";
import { API_URLS } from "../../utils/apiUrl";

const SLICE_NAME = "rawDataSlice";

// --- Thunks ---

export const fetchRawData = createCommonAsyncThunk(
  "fetchRawData",
  API_URLS.RAW_DATA,
  SLICE_NAME
);

// --- Initial Data (keys must match thunk typePrefix) ---

const initialData = {
  fetchRawData: null,
};

// --- Slice ---

const rawDataSlice = CommonReduxSliceMaker(
  SLICE_NAME,
  { fetchRawData },
  initialData
);

export default rawDataSlice.reducer;
