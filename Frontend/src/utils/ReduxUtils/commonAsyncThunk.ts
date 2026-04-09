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