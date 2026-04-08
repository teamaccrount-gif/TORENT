import { createCommonAsyncThunk } from '../../utils/ReduxUtils/commonAsyncThunk';
import { CommonReduxSliceMaker } from '../../utils/ReduxUtils/commonSliceMaker';
import { API_URLS } from '../../utils/apiUrl';

// Map Table Keys to URLs
const TABLE_CONFIG = {
  fetchCountry: API_URLS.TABLES_COUNTRY,
  fetchRegion: API_URLS.TABLES_REGION,
  fetchArea: API_URLS.TABLES_AREA,
  fetchStation: API_URLS.TABLES_STATION,
  fetchCgs: API_URLS.TABLES_CGS,
  fetchDevice: API_URLS.TABLES_DEVICE,
  fetchPng: API_URLS.TABLES_PNG,
  fetchLcng: API_URLS.TABLES_LCNG,
  fetchIndustrial: API_URLS.TABLES_INDUSTRIAL,
  fetchCommercial: API_URLS.TABLES_COMMERCIAL,
  fetchDispenser: API_URLS.TABLES_DISPENSER,
  fetchCompressor: API_URLS.TABLE_COMPRESSOR,
  fetchDrs: API_URLS.TABLE_DRS,
  fetchDomestic: API_URLS.TABLE_DOMESTIC,
};

const thunks: Record<string, any> = {};

Object.entries(TABLE_CONFIG).forEach(([name, url]) => {
  thunks[name] = createCommonAsyncThunk(name, url, 'tablesSlice');
});

const initialData = Object.keys(TABLE_CONFIG).reduce((acc, key) => ({ ...acc, [key]: null }), {});

const tablesSlice = CommonReduxSliceMaker('tablesSlice', thunks, initialData);

export const {
  fetchCountry,
  fetchRegion,
  fetchArea,
  fetchStation,
  fetchCgs,
  fetchDevice,
  fetchPng,
  fetchLcng,
  fetchIndustrial,
  fetchCommercial,
  fetchDispenser,
  fetchCompressor,
  fetchDrs,
  fetchDomestic
} = thunks as any;

export default tablesSlice.reducer;
