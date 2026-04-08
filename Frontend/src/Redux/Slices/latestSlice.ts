import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URLS } from "../../utils/apiUrl";
import type { LatestEntry } from "../../ModelsLogic/RawDataModel";

const SLICE_NAME = "latestSlice";

export const fetchLatestValues = createAsyncThunk(
    `${SLICE_NAME}/fetchLatestValues`,
    async (payload: { tags: string[] } | string[], { rejectWithValue }) => {
        try {
            console.log("[HISTORY][LATEST] Request payload:", payload);

            const response = await axios.post<LatestEntry[]>(API_URLS.LATEST, payload);

            console.log("[HISTORY][LATEST] Response data:", response.data);

            return response.data;
        } catch (error: any) {
            console.error("[HISTORY][LATEST] Request failed:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            return rejectWithValue(error.message || "Failed to fetch latest values");
        }
    }
);

interface LatestState {
    data: {
        fetchLatestValues: LatestEntry[] | null;
    };
    loading: Record<string, "idle" | "pending" | "fulfilled" | "rejected">;
    error: Record<string, string | null>;
}

const initialState: LatestState = {
    data: {
        fetchLatestValues: null,
    },
    loading: {},
    error: {},
};

const latestSlice = createSlice({
    name: SLICE_NAME,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLatestValues.pending, (state) => {
                state.loading.fetchLatestValues = "pending";
                state.error.fetchLatestValues = null;
            })
            .addCase(fetchLatestValues.fulfilled, (state, action) => {
                state.loading.fetchLatestValues = "fulfilled";
                state.data.fetchLatestValues = action.payload;
            })
            .addCase(fetchLatestValues.rejected, (state, action) => {
                state.loading.fetchLatestValues = "rejected";
                state.error.fetchLatestValues = action.payload as string;
            });
    },
});

export default latestSlice.reducer;
