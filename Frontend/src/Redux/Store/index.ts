import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import rawDataReducer from "../Slices/rawDataSlice";
import latestReducer from "../Slices/latestSlice";

export const store = configureStore({
  reducer: {
    rawDataSlice: rawDataReducer,
    latestSlice: latestReducer,                          // ← add

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;