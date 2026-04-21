import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import rawDataReducer from "../Slices/rawDataSlice";
import latestReducer from "../Slices/latestSlice";
import authReducer from "../Slices/authSlice";
import registrationReducer from "../Slices/registrationSlice";
import manageReducer from "../Slices/manageSlice";
import tablesReducer from "../Slices/tablesSlice";
import mapReducer from "../Slices/mapSlice";
import dropdownReducer from "../Slices/dropdownSlice";


export const store = configureStore({
  reducer: {
    rawDataSlice: rawDataReducer,
    latestSlice: latestReducer,
    authSlice: authReducer,
    registrationSlice: registrationReducer,
    manageSlice: manageReducer,
    tablesSlice: tablesReducer,
    mapSlice: mapReducer,
    dropdownSlice: dropdownReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;