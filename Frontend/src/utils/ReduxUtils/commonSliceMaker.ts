
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface GenericState {
  data: any;
  loading: Record<string, "idle" | "pending" | "fulfilled" | "rejected">;
  error: Record<string, string | null>;
  currentRequestId: Record<string, string | undefined>;
}

/**
 * Example Usage of CommonReduxSliceMaker
 *
 * sampleslice.ts
 *
 * // Step 1: Define the thunk
 *
 * const fetchUser = createCommonPostAsyncThunk("fetchUser", "/api/user", "userSlice");
 * const fetchOrders = createCommonPostAsyncThunk("fetchOrders", "/api/orders", "userSlice");
 *
 * // Step 2: Create the slice
 * 
 * // Object key must be as name of the thunk for AsyncThunk getState management
 * const initialData = {
 *   fetchUser: null, 
 *   fetchOrders: null, 
 * };
 * 
 * const userSlice = CommonReduxSliceMaker("userSlice", { fetchUser, fetchOrders },initialData);
 *
 * // Step 3: export the reducer
 * 
 * export const userSlice.reducer
 *
 * NsOTE for The state managed by this slice includes:
 * 
 * // Object key must be as name of the thunk for AsyncThunk getState management
 * //- `data`: Holds the fetched data from thunks.
 * //- `loading`: Tracks loading states (`idle`, `pending`, `fulfilled`, `rejected`).
 * //- `error`: Stores error messages (if any).
 * //- `currentRequestId`: Helps identify and ignore duplicate requests.
 */

export function CommonReduxSliceMaker(
  name: string,
  thunks: Record<string, any>,
  initialData: any 
) {
  const initialState: GenericState = {
    data: initialData,
    loading: {},
    error: {},
    currentRequestId: {},
  };

  const dynamicSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      Object.entries(thunks).forEach(([thunkName, thunk]) => {
        builder
          .addCase(thunk.pending, (state, action) => {
            state.loading[thunkName] = "pending";
            state.error[thunkName] = null;
            state.currentRequestId[thunkName] = action.meta.requestId;
          })
          .addCase(thunk.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading[thunkName] = "fulfilled";
            state.data[thunkName] = action.payload;
          })
          .addCase(thunk.rejected, (state, action) => {
            state.loading[thunkName] = "rejected";
            state.error[thunkName] = action.payload ?? "An error occurred";
          });
      });
    },
  });

  return dynamicSlice;
}