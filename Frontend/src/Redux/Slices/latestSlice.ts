import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URLS } from "../../utils/apiUrl";
import type { LatestEntry } from "../../ModelsLogic/RawDataModel";

const SLICE_NAME = "latestSlice";

export const fetchLatestValues = createAsyncThunk(
    `${SLICE_NAME}/fetchLatestValues`,
    async (payload: { tags: string[] } | string[], { rejectWithValue }) => {
        try {
            console.log("[LATEST] Hitting URL:", API_URLS.LATEST);
            console.log("[LATEST] Sending payload:", JSON.stringify(payload));

            const response = await axios.post<LatestEntry[]>(API_URLS.LATEST, payload);

            console.log("[LATEST] Response status:", response.status);
            console.log("[LATEST] Response data:", response.data);

            return response.data;
        } catch (error: any) {
            console.error("[LATEST] Error status:", error.response?.status);
            console.error("[LATEST] Error message:", error.response?.data);
            console.error("[LATEST] Full error:", error.message);
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