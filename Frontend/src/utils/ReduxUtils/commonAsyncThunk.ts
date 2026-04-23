import { createAsyncThunk } from "@reduxjs/toolkit";
import { commonRequest, type RequestOptions } from './commonRequestmaker';

type APIUrl = string;

/**
 * Creates a reusable async thunk for any API call.
 *
 * USAGE:
 *
 * // Step 1 — define the thunk in your slice file
 * export const fetchTags = createCommonAsyncThunk(
 *   "fetchTags",           // must match the key in initialData
 *   API_URLS.TAGS,
 *   "tagsSlice",           // must match the slice name
 * );
 *
 * // Step 2 — dispatch in your component
 * dispatch(fetchTags({
 *   method: "GET",
 * }));
 *
 * // Step 3 — read from state
 * const tags = useAppSelector((state) => state.tagsSlice.data.fetchTags);
 */
export const createCommonAsyncThunk = (
  typePrefix: string,
  url: APIUrl,
  sliceName: string
) =>
  createAsyncThunk(
    typePrefix,
    async (options: RequestOptions | void, { rejectWithValue, getState, requestId }) => {
      try {
        // Duplicate request guard — ignore if another request is already pending
        const state = (getState() as any)[sliceName];
        const { currentRequestId, loading } = state;

        if (
          loading[typePrefix] !== "pending" ||
          requestId !== currentRequestId[typePrefix]
        ) {
          return;
        }

        const response = await commonRequest(url, options);
        return response;

      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        return rejectWithValue(message);
      }
    },
    {
      // Prevent dispatching if already pending
      condition: (_, { getState }) => {
        const state = (getState() as any)[sliceName];
        return state.loading[typePrefix] !== "pending";
      },
    }
  );

/**
 * Creates a reusable async thunk for API calls with a DYNAMIC URL.
 * The caller provides a URL builder function instead of a static URL.
 *
 * USAGE:
 *
 * // Step 1 — define the thunk in your slice file
 * export const fetchAreasByRegion = createDynamicAsyncThunk(
 *   "fetchAreasByRegion",
 *   (options) => `${API_URLS.AREA_DROPDOWN.replace(':region', options?.urlParam ?? '')}`,
 *   "registrationSlice",
 * );
 *
 * // Step 2 — dispatch in your component with urlParam
 * dispatch(fetchAreasByRegion({ method: "GET", urlParam: "r1" }));
 *
 * // Step 3 — read from state
 * const areas = useAppSelector((state) => state.registrationSlice.data.fetchAreasByRegion);
 */

export interface DynamicRequestOptions extends RequestOptions {
  urlParam?: string;
}

export const createDynamicAsyncThunk = (
  typePrefix: string,
  urlBuilder: (options: DynamicRequestOptions | void) => string,
  _sliceName?: string
) =>
  createAsyncThunk(
    typePrefix,
    async (options: DynamicRequestOptions | void, { rejectWithValue }) => {
      try {
        const url = urlBuilder(options);
        const response = await commonRequest(url, options);
        return response;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        return rejectWithValue(message);
      }
    }
  );